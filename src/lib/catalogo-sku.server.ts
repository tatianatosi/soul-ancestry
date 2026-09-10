/**
 * Leitura de SKU vivo em `product_catalog` (P7 / PR #68).
 * Não cria SKU, não grava preço, não homologa sozinho.
 */

import {
  convencaoDoCodigo,
  skuVivoDoCatalogo,
  type SkuHomologadoAtivo,
} from "@/lib/planejador-parametros";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function skuHomologadoParaCaso(
  supabase: any,
  organizationId: string | null | undefined,
  codigoCaso?: string | null,
): Promise<SkuHomologadoAtivo | null> {
  const sku = convencaoDoCodigo(codigoCaso)?.sku ?? null;
  if (!sku || !organizationId) return null;
  const { data, error } = await supabase
    .from("product_catalog")
    .select("code,nome_comercial,ativo,status_homologacao,archived_at")
    .eq("organization_id", organizationId)
    .eq("code", sku)
    .eq("ativo", true)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return skuVivoDoCatalogo(data ? [data] : [], sku);
}
