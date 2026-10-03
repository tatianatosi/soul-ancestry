/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Calculadora de orçamento ligada à proposta — leitor e escritor
 * (03/10/2026).
 *
 * Fecha a lacuna que `preco-sugerido-canonico.ts` declarava desde sempre: o
 * preço sugerido canônico serve à **Proposta**, e nunca chegava nela. Aqui o
 * Desk compõe o orçamento a partir do catálogo real e grava o resultado na
 * proposta do caso: `valor`, `moeda`, `escopo_estruturado` (a conta item a
 * item) e `preco_fonte_referencia` (de onde o preço veio).
 *
 * Nunca envia, assina, cobra, parcela, aprova nem cria link de pagamento.
 * Proposta já enviada, aprovada, recusada, substituída ou arquivada é
 * snapshot: o servidor recusa gravar nela.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { contextoRg, PAPEIS_EDITA, type Sb } from "@/lib/pesquisa-modulo.server";
import {
  calcularOrcamento,
  escopoEstruturadoDoOrcamento,
  motivoParaNaoAplicar,
  type EntradaItem,
} from "@/lib/orcamento-proposta";
import { resolverPrecoSugerido, type DivergenciaFonte, type SkuPrecoSugerido } from "@/lib/preco-sugerido-canonico";

const COLUNAS =
  "id,code,nome_comercial,preco_sugerido_fonte,preco_atual_fonte,moeda,fonte_versao,fonte_arquivo,vigencia_inicio,vigencia_fim,status_produto,status_fonte,ativo,archived_at,dados_teste,elegivel_para_proposta";

function paraSku(row: any): SkuPrecoSugerido {
  return {
    id: row.id,
    code: row.code ?? null,
    nome: row.nome_comercial ?? null,
    preco_sugerido: row.preco_sugerido_fonte == null ? null : Number(row.preco_sugerido_fonte),
    preco_atual: row.preco_atual_fonte == null ? null : Number(row.preco_atual_fonte),
    moeda: row.moeda ?? null,
    fonte_versao: row.fonte_versao ?? null,
    fonte_referencia: row.fonte_arquivo ?? null,
    vigencia_inicio: row.vigencia_inicio ?? null,
    vigencia_fim: row.vigencia_fim ?? null,
    status_produto: row.status_produto ?? null,
    status_fonte: row.status_fonte ?? null,
    ativo: row.ativo,
    archived_at: row.archived_at ?? null,
    dados_teste: row.dados_teste === true,
  };
}

async function catalogoComDivergencias(supabase: any, organizationId: string) {
  const [{ data: rows }, { data: divs }] = await Promise.all([
    supabase
      .from("product_catalog")
      .select(COLUNAS)
      .eq("organization_id", organizationId)
      .neq("dados_teste", true)
      .is("archived_at", null)
      .order("code", { ascending: true }),
    supabase
      .from("catalog_source_divergences")
      .select("sku,tipo,detalhe,resolvido,fonte_referencia")
      .eq("organization_id", organizationId)
      .eq("resolvido", false),
  ]);

  const porSku = new Map<string, DivergenciaFonte[]>();
  for (const d of (divs ?? []) as any[]) {
    const k = String(d.sku ?? "").toUpperCase();
    if (!porSku.has(k)) porSku.set(k, []);
    porSku.get(k)!.push({ tipo: d.tipo, detalhe: d.detalhe, resolvido: d.resolvido, fonte_referencia: d.fonte_referencia });
  }
  return { rows: (rows ?? []) as any[], porSku };
}

/** Itens que o Desk pode escolher, com o estado do preço de cada um. */
export const itensParaOrcamento = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoRg(supabase as unknown as Sb, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel) && papel !== "comercial" && papel !== "financeiro") {
      throw new Error("Seu papel não compõe orçamento de proposta.");
    }

    const { rows, porSku } = await catalogoComDivergencias(supabase, organizationId);
    return rows.map((r) => {
      const sku = paraSku(r);
      const resolucao = resolverPrecoSugerido(sku, porSku.get(String(sku.code ?? "").toUpperCase()) ?? []);
      return {
        id: sku.id,
        code: sku.code,
        nome: sku.nome,
        ofertavel: r.elegivel_para_proposta === true,
        valor: resolucao.valor,
        moeda: resolucao.moeda,
        estado: resolucao.estado,
        utilizavel: resolucao.selecionavel_internamente,
        motivos: resolucao.motivos.map((m) => m.descricao),
      };
    });
  });

type EntradaCalculo = {
  caseId: string;
  itens: { skuId: string; quantidade?: number }[];
  ajuste?: number;
  ajusteMotivo?: string;
};

async function montarOrcamento(supabase: any, organizationId: string, data: EntradaCalculo) {
  const { rows, porSku } = await catalogoComDivergencias(supabase, organizationId);
  const porId = new Map(rows.map((r) => [String(r.id), r]));
  const entradas: EntradaItem[] = [];
  for (const i of data.itens ?? []) {
    const row = porId.get(String(i.skuId));
    if (!row) throw new Error("Item do orçamento não existe neste catálogo.");
    const sku = paraSku(row);
    entradas.push({
      sku,
      quantidade: i.quantidade,
      divergencias: porSku.get(String(sku.code ?? "").toUpperCase()) ?? [],
    });
  }
  return calcularOrcamento({ itens: entradas, ajuste: data.ajuste, ajusteMotivo: data.ajusteMotivo });
}

/** Calcula sem gravar — a prévia da tela vem do servidor, não do navegador. */
export const calcularOrcamentoDaProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: EntradaCalculo) => {
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const orcamento = await montarOrcamento(supabase, organizationId, data);
    return { orcamento, recusa: motivoParaNaoAplicar(orcamento) };
  });

const STATUS_FECHADO = new Set(["aprovada", "aceita", "recusada", "enviada", "substituida"]);

/**
 * Grava o orçamento na proposta em rascunho do caso. Recusa proposta fechada
 * (snapshot) e orçamento parcial.
 */
export const aplicarOrcamentoNaProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: EntradaCalculo & { propostaId: string }) => {
    if (!data?.propostaId) throw new Error("Proposta é obrigatória.");
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const organizationId = await organizacaoDo(supabase, userId);

    const { data: proposta } = await supabase
      .from("proposals")
      .select("id,status,valor,moeda,archived_at,enviada_em,aprovada_em,substituida_em")
      .eq("id", data.propostaId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!proposta) throw new Error("Proposta não encontrada nesta organização.");
    if (proposta.archived_at) throw new Error("Proposta arquivada não recebe orçamento.");
    if (proposta.enviada_em || proposta.aprovada_em || proposta.substituida_em || STATUS_FECHADO.has(String(proposta.status ?? ""))) {
      throw new Error(
        "Esta proposta já foi enviada, aprovada ou substituída — é snapshot. Derive uma versão nova antes de recalcular o orçamento.",
      );
    }

    const orcamento = await montarOrcamento(supabase, organizationId, data);
    const recusa = motivoParaNaoAplicar(orcamento);
    if (recusa) throw new Error(recusa);

    const r = await gravarComVerificacao({
      supabase,
      tabela: "proposals",
      id: data.propostaId,
      organizationId,
      userId,
      payload: {
        valor: orcamento.total,
        moeda: orcamento.moeda,
        escopo_estruturado: escopoEstruturadoDoOrcamento(orcamento),
        preco_fonte_referencia: `preço sugerido canônico · ${orcamento.selo}`,
      },
    });

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "proposals",
      entidade_id: data.propostaId,
      acao: "orcamento_calculado_aplicado_na_proposta",
      user_id: userId,
      valores_anteriores: { valor: proposta.valor, moeda: proposta.moeda },
      valores_posteriores: { valor: orcamento.total, moeda: orcamento.moeda },
      metadados: {
        case_id: data.caseId,
        itens: orcamento.somados.map((i) => ({ code: i.code, quantidade: i.quantidade, valor_total: i.valorTotal })),
        ajuste: orcamento.ajuste,
        ajuste_motivo: orcamento.ajusteMotivo,
        selo: orcamento.selo,
      },
    });

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Orçamento calculado e aplicado na proposta",
      summaryInternal: `${orcamento.somados.length} item(ns) · total ${orcamento.total} ${orcamento.moeda ?? ""} · ${orcamento.selo}`,
      sourceEntityType: "proposals",
      sourceEntityId: data.propostaId,
      userId,
    });

    return { ok: true, total: orcamento.total, moeda: orcamento.moeda, salvoEm: r.salvoEm };
  });

/** A proposta em rascunho do caso, se houver — alvo do orçamento. */
export const propostaRascunhoDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { data: linhas } = await supabase
      .from("proposals")
      .select("id,versao,status,valor,moeda,enviada_em,aprovada_em,substituida_em")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("versao", { ascending: false });

    const aberta = ((linhas ?? []) as any[]).find(
      (p) => !p.enviada_em && !p.aprovada_em && !p.substituida_em && !STATUS_FECHADO.has(String(p.status ?? "")),
    );
    return aberta
      ? {
          id: String(aberta.id),
          versao: Number(aberta.versao ?? 0),
          status: (aberta.status as string) ?? null,
          valor: aberta.valor == null ? null : Number(aberta.valor),
          moeda: (aberta.moeda as string) ?? null,
        }
      : null;
  });
