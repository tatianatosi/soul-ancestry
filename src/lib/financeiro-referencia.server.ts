import type { ReferenciaFinanceira } from "@/lib/financeiro-referencia";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Sb = any;

/**
 * Resolve a referência financeira do caso, dado real, nunca fabricado:
 * 1. Condição comercial particular do caso (`commercial_conditions`) —
 *    prevalece quando existe.
 * 2. Referência de honorários/despesas/taxas/parcelas do país
 *    (`price_catalog_rescued`, nível país — `item_id is null`).
 * Sem nenhuma das duas, devolve `null` (pendência, não valor inventado).
 */
export async function referenciaFinanceiraDoCaso(
  supabase: Sb,
  org: string,
  caseId: string,
  countryCode: string | null,
): Promise<ReferenciaFinanceira> {
  const { data: cc } = await supabase
    .from("commercial_conditions")
    .select("forma_pagamento, valor_total_referencia")
    .eq("organization_id", org)
    .eq("case_id", caseId)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const formaPagamento = String(cc?.forma_pagamento ?? "").trim();
  if (formaPagamento) {
    return {
      origem: "condicao_do_caso",
      formaPagamento,
      valorTotalReferencia: cc?.valor_total_referencia != null ? Number(cc.valor_total_referencia) : null,
    };
  }

  if (!countryCode) return null;

  const { data: rows } = await supabase
    .from("price_catalog_rescued")
    .select("price_component, amount")
    .eq("organization_id", org)
    .eq("country_code", countryCode)
    .is("item_id", null)
    .is("archived_at", null)
    .in("price_status", ["HOMOLOGADO_CATALOGO", "REFERENCIA_RESGATADA"]);

  const valor = (componente: string): number | null => {
    const linha = (rows ?? []).find((r: any) => r.price_component === componente);
    return linha?.amount != null ? Number(linha.amount) : null;
  };

  const honorarios = valor("honorarios");
  const despesas = valor("despesas");
  const taxas = valor("taxas");
  const parcelas = valor("parcelas_padrao");
  if (honorarios == null && despesas == null && taxas == null && parcelas == null) return null;

  return { origem: "referencia_da_trilha", honorarios, despesas, taxas, parcelas };
}
