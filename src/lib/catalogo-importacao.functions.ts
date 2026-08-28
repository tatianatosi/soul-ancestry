import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { ItemCatalogoImportado } from "@/lib/catalogo-importacao";

export type DivergenciaCatalogo = {
  sku: string;
  tipo: string;
  detalhe: string;
  fonte_referencia: string;
  fonte_linha: number | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura do catálogo importado da fonte canônica e das divergências.
 * Somente leitura: nenhum SKU, preço, link ou cobrança é criado ou alterado.
 */
export const lerCatalogoImportado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const { data, error } = await supabase
      .from("product_catalog")
      .select(
        "code,nome_comercial,categoria_fonte,subcategoria_fonte,pareto_classificacao,faixa_prioridade,status_fonte,status_produto,preco_sugerido_fonte,preco_atual_fonte,moeda,status_link_asaas_fonte,link_asaas_fonte,fonte_arquivo,fonte_aba,fonte_versao,fonte_linha,importado_em",
      )
      .eq("pareto_classificacao", "TOP_PARETO")
      .is("archived_at", null)
      .order("code");
    if (error) throw new Error(error.message);

    const vistos = new Set<string>();
    const itens: ItemCatalogoImportado[] = (data ?? [])
      .filter((r: any) => (vistos.has(r.code) ? false : (vistos.add(r.code), true)))
      .map((r: any) => ({
        sku: r.code as string,
        produto: (r.nome_comercial ?? r.code) as string,
        categoria: (r.categoria_fonte ?? null) as string | null,
        subcategoria: (r.subcategoria_fonte ?? null) as string | null,
        pareto: (r.pareto_classificacao ?? null) as string | null,
        faixa: (r.faixa_prioridade ?? null) as string | null,
        status_fonte: (r.status_fonte ?? null) as string | null,
        status_produto: (r.status_produto ?? "ativo") as string,
        preco_sugerido: r.preco_sugerido_fonte === null ? null : Number(r.preco_sugerido_fonte),
        preco_atual_fonte: r.preco_atual_fonte === null ? null : Number(r.preco_atual_fonte),
        moeda: (r.moeda ?? "BRL") as string,
        status_link_asaas_fonte: (r.status_link_asaas_fonte ?? null) as string | null,
        link_asaas: (r.link_asaas_fonte ?? null) as string | null,
        fonte_arquivo: (r.fonte_arquivo ?? null) as string | null,
        fonte_aba: (r.fonte_aba ?? null) as string | null,
        fonte_versao: (r.fonte_versao ?? null) as string | null,
        fonte_linha: (r.fonte_linha ?? null) as number | null,
        importado_em: (r.importado_em ?? null) as string | null,
      }));

    const { data: divs } = await supabase
      .from("catalog_source_divergences")
      .select("sku,tipo,detalhe,fonte_referencia,fonte_linha,resolvido")
      .eq("resolvido", false)
      .order("sku");

    const chaves = new Set<string>();
    const divergencias: DivergenciaCatalogo[] = (divs ?? [])
      .filter((d: any) => {
        const k = `${d.sku}|${d.tipo}`;
        return chaves.has(k) ? false : (chaves.add(k), true);
      })
      .map((d: any) => ({
        sku: d.sku as string,
        tipo: d.tipo as string,
        detalhe: d.detalhe as string,
        fonte_referencia: d.fonte_referencia as string,
        fonte_linha: (d.fonte_linha ?? null) as number | null,
      }));

    return { itens, divergencias };
  });
