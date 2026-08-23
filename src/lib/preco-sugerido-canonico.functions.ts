/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Leitura da referência canônica de preço sugerido (somente leitura).
 *
 * Lê apenas `product_catalog`, `catalog_source_divergences`, `proposals` e
 * `commercial_conditions` já existentes. Não cria tabela, catálogo, preço,
 * condição, cobrança, link Asaas, comunicação ou integração.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg } from "@/lib/pesquisa-modulo.server";
import {
  contarEstados,
  resolverPrecoSugerido,
  resolverValorOperacional,
  type DivergenciaFonte,
  type ResolucaoPrecoSugerido,
  type SkuPrecoSugerido,
} from "@/lib/preco-sugerido-canonico";

const PAPEIS = new Set(["admin", "operacoes", "comercial", "financeiro"]);

const COLUNAS =
  "id,code,nome_comercial,preco_sugerido_fonte,preco_atual_fonte,moeda,fonte_versao,fonte_arquivo,vigencia_inicio,vigencia_fim,status_produto,status_fonte,ativo,archived_at,dados_teste";

const CASO_ANA = "CA-CID-AT-FAM-2026-001";

function paraSku(row: any): SkuPrecoSugerido {
  return {
    id: row.id,
    code: row.code ?? null,
    nome: row.nome_comercial ?? null,
    preco_sugerido: row.preco_sugerido_fonte === null || row.preco_sugerido_fonte === undefined ? null : Number(row.preco_sugerido_fonte),
    preco_atual: row.preco_atual_fonte === null || row.preco_atual_fonte === undefined ? null : Number(row.preco_atual_fonte),
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

export const lerPrecoSugeridoCanonico = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS.has(papel)) throw new Error("Referência de preço sugerido restrita a perfis Desk autorizados.");

    const { data: rows, error } = await supabase
      .from("product_catalog")
      .select(COLUNAS)
      .eq("organization_id", organizationId)
      .neq("dados_teste", true)
      .order("code", { ascending: true });
    if (error) throw new Error(error.message);

    const { data: divs } = await supabase
      .from("catalog_source_divergences")
      .select("sku,tipo,detalhe,resolvido,fonte_referencia")
      .eq("organization_id", organizationId)
      .eq("resolvido", false);

    const porSku = new Map<string, DivergenciaFonte[]>();
    for (const d of (divs ?? []) as any[]) {
      const k = String(d.sku ?? "").toUpperCase();
      if (!porSku.has(k)) porSku.set(k, []);
      porSku.get(k)!.push({ tipo: d.tipo, detalhe: d.detalhe, resolvido: d.resolvido, fonte_referencia: d.fonte_referencia });
    }

    const itens = ((rows ?? []) as any[]).map((r) => {
      const sku = paraSku(r);
      const resolucao = resolverPrecoSugerido(sku, porSku.get(String(sku.code ?? "").toUpperCase()) ?? []);
      return { sku, resolucao };
    });

    const criticas = ((divs ?? []) as any[])
      .filter((d) => ["divergencia_moeda", "divergencia_vigencia", "conflito_preco_critico", "sku_conflitante"].includes(d.tipo))
      .map((d) => ({ sku: d.sku, tipo: d.tipo, detalhe: d.detalhe ?? null }));

    // Auditoria do caso piloto — leitura pura, sem alterar nenhum valor.
    let ana: {
      caso: string;
      proposta_valor: number | null;
      proposta_status: string | null;
      condicao_aprovada: boolean;
      sku: string | null;
      resolucao: ResolucaoPrecoSugerido | null;
      origem_valor: string;
    } | null = null;

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id,codigo")
      .eq("organization_id", organizationId)
      .eq("codigo", CASO_ANA)
      .maybeSingle();

    if (caso) {
      const { data: prop } = await supabase
        .from("proposals")
        .select("id,valor,moeda,status,product_catalog_id")
        .eq("case_id", caso.id)
        .eq("status", "aprovada")
        .order("versao", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { count: condCount } = await supabase
        .from("commercial_conditions")
        .select("id", { count: "exact", head: true })
        .eq("case_id", caso.id);

      let resolucao: ResolucaoPrecoSugerido | null = null;
      let code: string | null = null;
      if (prop?.product_catalog_id) {
        const { data: pc } = await supabase.from("product_catalog").select(COLUNAS).eq("id", prop.product_catalog_id).maybeSingle();
        if (pc) {
          const sku = paraSku(pc);
          code = sku.code;
          resolucao = resolverPrecoSugerido(sku, porSku.get(String(sku.code ?? "").toUpperCase()) ?? []);
        }
      } else {
        resolucao = resolverPrecoSugerido(null, []);
      }

      const valor = resolverValorOperacional({
        condicaoAprovada: null,
        propostaAprovada: prop ? { valor: prop.valor === null ? null : Number(prop.valor), moeda: prop.moeda } : null,
        precoSugerido: resolucao,
      });

      ana = {
        caso: CASO_ANA,
        proposta_valor: prop?.valor === null || prop?.valor === undefined ? null : Number(prop.valor),
        proposta_status: prop?.status ?? null,
        condicao_aprovada: (condCount ?? 0) > 0,
        sku: code,
        resolucao,
        origem_valor: valor.origem,
      };
    }

    return {
      totais: contarEstados(itens.map((i) => i.resolucao)),
      itens: itens.map((i) => ({
        sku: i.sku.code,
        nome: i.sku.nome,
        estado: i.resolucao.estado,
        valor: i.resolucao.valor,
        moeda: i.resolucao.moeda,
        origem: i.resolucao.origem,
        selo: i.resolucao.selo,
        motivos: i.resolucao.motivos,
      })),
      divergencias_criticas: criticas,
      ana,
    };
  });
