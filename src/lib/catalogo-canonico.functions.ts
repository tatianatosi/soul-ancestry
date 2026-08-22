/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg } from "@/lib/pesquisa-modulo.server";
import {
  saneamentoDeCatalogo,
  type EstadoCatalogo,
  type EstadoLinkCobranca,
  type EstadoPreco,
  type LinkCobrancaRef,
  type PrioridadePortfolio,
  type SkuCanonico,
  type TipoCobranca,
} from "@/lib/catalogo-canonico";

/** Papéis autorizados a ver dados internos de SKU, preço, link e pendência. */
const PAPEIS_CATALOGO = new Set(["admin", "operacoes", "comercial", "financeiro"]);

const lista = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((i) => String(i)).filter(Boolean) : [];

/**
 * Leitura do catálogo canônico e das filas de saneamento.
 * Somente leitura: nenhum SKU, preço, link, proposta ou cobrança é criado,
 * alterado, ativado, desativado ou executado. Nenhuma integração externa.
 */
export const lerSaneamentoCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirTeste?: boolean }) => ({ incluirTeste: d?.incluirTeste === true }))
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_CATALOGO.has(papel)) {
      throw new Error("Catálogo interno restrito a perfis Desk/Governança autorizados.");
    }

    const [produtos, links, usos] = await Promise.all([
      supabase
        .from("product_catalog")
        .select(
          "id,code,nome_comercial,categoria_fonte,subcategoria_fonte,estado_catalogo,prioridade_portfolio,responsavel_comercial,responsavel_operacional,versao_catalogo,vigencia_inicio,vigencia_fim,preco_comercial_vigente,preco_sugerido_fonte,moeda,preco_fonte,preco_estado_homologacao,tipo_cobranca,entregaveis,inclusoes,exclusoes,pre_requisitos,dependencias_externas,prazo_fonte_formal,escopo_aplicavel,regras_anexos,regra_uso,planilha_mestre_versao,planilha_mestre_identificador,responsavel_validacao_fonte,estado_reconciliacao,homologado_por,homologado_em,substituido_por,dados_teste,updated_at",
        )
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("code"),
      supabase
        .from("catalog_payment_link_refs")
        .select(
          "id,product_id,sku_codigo,estado_link,tipo_link,referencia_url,valor_validado,moeda,validado_em,validado_por,versao_sku_associada,versao_preco_associada,divergencia,observacao_interna,dados_teste",
        )
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("proposals")
        .select("id,sku_principal,status")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
    ]);

    if (produtos.error) throw new Error(produtos.error.message);

    const porProduto = new Map<string, LinkCobrancaRef[]>();
    for (const l of (links.data ?? []) as any[]) {
      const atual = porProduto.get(l.product_id) ?? [];
      atual.push({
        id: l.id,
        sku_codigo: l.sku_codigo,
        estado_link: l.estado_link as EstadoLinkCobranca,
        tipo_link: l.tipo_link,
        referencia_url: l.referencia_url ?? null,
        valor_validado: l.valor_validado === null || l.valor_validado === undefined ? null : Number(l.valor_validado),
        moeda: l.moeda ?? "BRL",
        validado_em: l.validado_em ?? null,
        validado_por: l.validado_por ?? null,
        versao_sku_associada: l.versao_sku_associada ?? null,
        versao_preco_associada: l.versao_preco_associada ?? null,
        divergencia: l.divergencia ?? null,
        observacao_interna: l.observacao_interna ?? null,
        dados_teste: l.dados_teste === true,
      });
      porProduto.set(l.product_id, atual);
    }

    const usosPorSku = new Map<string, number>();
    for (const p of (usos.data ?? []) as any[]) {
      const sku = p.sku_principal as string | null;
      if (!sku) continue;
      if (["assinada", "aprovada", "recusada", "cancelada"].includes(String(p.status))) continue;
      usosPorSku.set(sku, (usosPorSku.get(sku) ?? 0) + 1);
    }

    const skus: SkuCanonico[] = ((produtos.data ?? []) as any[]).map((r) => ({
      id: r.id,
      sku_codigo: r.code,
      produto: r.nome_comercial ?? r.code,
      categoria: r.categoria_fonte ?? null,
      subcategoria: r.subcategoria_fonte ?? null,
      estado_catalogo: (r.estado_catalogo ?? "rascunho") as EstadoCatalogo,
      prioridade_portfolio: (r.prioridade_portfolio ?? "cauda_longa") as PrioridadePortfolio,
      responsavel_comercial: r.responsavel_comercial ?? null,
      responsavel_operacional: r.responsavel_operacional ?? null,
      versao_catalogo: r.versao_catalogo ?? "v1",
      vigencia_inicio: r.vigencia_inicio ?? null,
      vigencia_fim: r.vigencia_fim ?? null,
      preco:
        r.preco_comercial_vigente !== null && r.preco_comercial_vigente !== undefined
          ? Number(r.preco_comercial_vigente)
          : r.preco_sugerido_fonte !== null && r.preco_sugerido_fonte !== undefined
            ? Number(r.preco_sugerido_fonte)
            : null,
      moeda: r.moeda ?? "BRL",
      preco_fonte: r.preco_fonte ?? null,
      preco_estado_homologacao: (r.preco_estado_homologacao ?? "nao_homologado") as EstadoPreco,
      tipo_cobranca: (r.tipo_cobranca ?? "sob_consulta") as TipoCobranca,
      entregaveis: lista(r.entregaveis),
      inclusoes: lista(r.inclusoes),
      exclusoes: lista(r.exclusoes),
      pre_requisitos: lista(r.pre_requisitos),
      dependencias_externas: lista(r.dependencias_externas),
      prazo_fonte_formal: r.prazo_fonte_formal ?? null,
      escopo_aplicavel: lista(r.escopo_aplicavel),
      regras_anexos: lista(r.regras_anexos),
      regra_uso: r.regra_uso ?? null,
      planilha_mestre_versao: r.planilha_mestre_versao ?? null,
      planilha_mestre_identificador: r.planilha_mestre_identificador ?? null,
      responsavel_validacao_fonte: r.responsavel_validacao_fonte ?? null,
      estado_reconciliacao: r.estado_reconciliacao ?? "nao_reconciliado",
      homologado_por: r.homologado_por ?? null,
      homologado_em: r.homologado_em ?? null,
      substituido_por: r.substituido_por ?? null,
      dados_teste: r.dados_teste === true,
      atualizado_em: r.updated_at ?? null,
      links: porProduto.get(r.id) ?? [],
      usos_pendentes: usosPorSku.get(r.code) ?? 0,
    }));

    const { filas, indicadores } = saneamentoDeCatalogo(skus, { incluirTeste: data.incluirTeste });
    const visiveis = skus.filter((s) => (data.incluirTeste ? true : !s.dados_teste));

    return {
      skus: visiveis,
      filas,
      indicadores,
      incluiTeste: data.incluirTeste,
      totalTeste: skus.filter((s) => s.dados_teste).length,
    };
  });

/** Auditoria append-only do catálogo (somente leitura). */
export const lerAuditoriaCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_CATALOGO.has(papel)) throw new Error("Auditoria de catálogo restrita a perfis autorizados.");
    const { data, error } = await supabase
      .from("catalog_audit_events")
      .select("id,sku_codigo,evento,campo,valor_anterior,valor_novo,motivo,ator_papel,origem,dados_teste,created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { eventos: data ?? [] };
  });
