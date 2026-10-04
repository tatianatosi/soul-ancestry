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
  type OrigemItemOrcamento,
} from "@/lib/orcamento-proposta";
import { produtoPaiPorId } from "@/lib/planejador-produtos-pai";
import { resolverPrecoSugerido, type DivergenciaFonte, type SkuPrecoSugerido } from "@/lib/preco-sugerido-canonico";

const COLUNAS =
  "id,code,nome_comercial,preco_sugerido_fonte,preco_atual_fonte,moeda,fonte_versao,fonte_arquivo,vigencia_inicio,vigencia_fim,status_produto,status_fonte,ativo,archived_at,dados_teste,elegivel_para_proposta,estado_catalogo";

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

const COLUNAS_FEED = "id,item_id,name,product_parent,status_dictionary,journey_phase_default,country_scope,commercial_model,requires_case_gate";

/** Item da jornada do produto-pai — o universo do seletor. */
async function itensDoPlanejador(supabase: any, organizationId: string) {
  const { data } = await supabase
    .from("planner_catalog_feed")
    .select(COLUNAS_FEED)
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("product_parent", { ascending: true })
    .order("item_id", { ascending: true });
  return ((data ?? []) as any[]).filter((r) => r.status_dictionary !== "ARQUIVADO_DECISAO_PROPRIETARIA");
}

/**
 * Itens que o Desk pode escolher.
 *
 * 04/10/2026 — decisão da Proprietária: "só use todos os produtos específicos
 * da jornada pai e planejador de cidadania; quando digo como alimento, que
 * seja push pelo seletor, senão o contrato da Ana vai ser bloqueado de novo".
 * O universo passou a ser `planner_catalog_feed` (99 itens vivos, agrupados
 * pelos 9 produtos-pai), com o produto-pai do caso empurrado para o topo. O
 * `product_catalog` (118 linhas, todas `rascunho`, todas da Planilha Mestre —
 * medido em 04/10) continua disponível, mas **como alimento**: aparece
 * rotulado, não soma e não bloqueia.
 */
export const itensParaOrcamento = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data?: { caseId?: string }) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoRg(supabase as unknown as Sb, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel) && papel !== "comercial" && papel !== "financeiro") {
      throw new Error("Seu papel não compõe orçamento de proposta.");
    }

    // Produto-pai do caso: é ele que define quais itens vêm primeiro.
    let produtoPaiDoCaso: string | null = null;
    if (data?.caseId) {
      const { data: plano } = await supabase
        .from("case_plans")
        .select("produto_pai_id")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      produtoPaiDoCaso = (plano?.produto_pai_id as string | null) ?? null;
    }
    const nomeDoProdutoPai = produtoPaiPorId(produtoPaiDoCaso)?.nome ?? null;

    const feed = await itensDoPlanejador(supabase, organizationId);
    const planejador = feed
      .map((r) => ({
        id: String(r.id),
        origemItem: "planejador" as const,
        code: (r.item_id as string) ?? null,
        nome: (r.name as string) ?? null,
        produtoPai: (r.product_parent as string) ?? null,
        doCaso: Boolean(nomeDoProdutoPai && r.product_parent === nomeDoProdutoPai),
        statusDicionario: (r.status_dictionary as string) ?? null,
        fase: (r.journey_phase_default as string) ?? null,
        paises: (r.country_scope as string[] | null) ?? null,
        modeloComercial: (r.commercial_model as string) ?? null,
        exigeGateDoCaso: r.requires_case_gate === true,
        ofertavel: r.status_dictionary === "ATIVO_HOMOLOGADO" || r.status_dictionary === "CONDICIONAL_POR_CASO",
        valor: null as number | null,
        moeda: null as string | null,
        estado: "sem_preco_homologado",
        utilizavel: false,
        motivos: [
          "Item da jornada do produto-pai: o preço não é de catálogo. O valor do caso entra pela condição particular aprovada.",
        ],
      }))
      // push: o produto-pai do caso primeiro, o resto depois, sem esconder nada.
      .sort((a, b) => (a.doCaso === b.doCaso ? 0 : a.doCaso ? -1 : 1));

    const { rows, porSku } = await catalogoComDivergencias(supabase, organizationId);
    const alimento = rows.map((r) => {
      const sku = paraSku(r);
      const resolucao = resolverPrecoSugerido(sku, porSku.get(String(sku.code ?? "").toUpperCase()) ?? []);
      return {
        id: sku.id,
        origemItem: "alimento_legado" as const,
        code: sku.code,
        nome: sku.nome,
        ofertavel: r.elegivel_para_proposta === true,
        valor: resolucao.valor,
        moeda: resolucao.moeda,
        estado: resolucao.estado,
        // Alimento nunca é base de preço: fica fora da conta por desenho.
        utilizavel: false,
        motivos: [
          "Catálogo legado (Planilha Mestre / rascunho): entra como alimento de contexto, fora da soma.",
          ...resolucao.motivos.map((m) => m.descricao),
        ],
      };
    });

    return { produtoPaiDoCaso, nomeDoProdutoPai, planejador, alimento };
  });

type EntradaCalculo = {
  caseId: string;
  itens: { skuId: string; quantidade?: number; origemItem?: OrigemItemOrcamento }[];
  ajuste?: number;
  ajusteMotivo?: string;
  condicaoParticular?: { valor: number; moeda: string; motivo: string };
};

async function montarOrcamento(supabase: any, organizationId: string, data: EntradaCalculo) {
  const { rows, porSku } = await catalogoComDivergencias(supabase, organizationId);
  const porId = new Map(rows.map((r) => [String(r.id), r]));
  const feed = await itensDoPlanejador(supabase, organizationId);
  const porFeedId = new Map(feed.map((r) => [String(r.id), r]));
  const entradas: EntradaItem[] = [];
  for (const i of data.itens ?? []) {
    const origemItem: OrigemItemOrcamento = i.origemItem ?? "planejador";
    if (origemItem === "planejador") {
      const row = porFeedId.get(String(i.skuId));
      if (!row) throw new Error("Item do orçamento não existe na jornada do produto-pai.");
      entradas.push({
        /*
         * Item da jornada não tem preço de catálogo — e não se inventa um
         * aqui. O valor do caso entra pela condição particular aprovada.
         */
        sku: {
          id: String(row.id),
          code: (row.item_id as string) ?? null,
          nome: (row.name as string) ?? null,
          preco_sugerido: null,
          preco_atual: null,
          moeda: null,
          fonte_versao: null,
          fonte_referencia: "planner_catalog_feed",
          vigencia_inicio: null,
          vigencia_fim: null,
          status_produto: (row.status_dictionary as string) ?? null,
          status_fonte: null,
          ativo: true,
          archived_at: null,
          dados_teste: false,
        },
        origemItem,
        quantidade: i.quantidade,
        divergencias: [],
        fonteArquivo: null,
        estadoCatalogo: null,
      });
      continue;
    }
    const row = porId.get(String(i.skuId));
    if (!row) throw new Error("Item do orçamento não existe neste catálogo.");
    const sku = paraSku(row);
    entradas.push({
      sku,
      origemItem,
      quantidade: i.quantidade,
      divergencias: porSku.get(String(sku.code ?? "").toUpperCase()) ?? [],
      // A origem vai junto: é ela que denuncia base legada (Planilha Mestre,
      // catálogo em rascunho) e impede que vire valor de proposta.
      fonteArquivo: (row as any).fonte_arquivo ?? null,
      estadoCatalogo: (row as any).estado_catalogo ?? null,
    });
  }
  return calcularOrcamento({
    itens: entradas,
    ajuste: data.ajuste,
    ajusteMotivo: data.ajusteMotivo,
    condicaoParticular: data.condicaoParticular,
  });
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
