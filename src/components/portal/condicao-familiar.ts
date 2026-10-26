/** Authorized presentation of the canonical family case; never a charge. */
export function condicaoFamiliarPrevista(caso: string | null | undefined) {
  if (caso !== "CA-CID-AT-FAM-2026-001" && caso !== "a11a0000-0000-4000-8000-000000000002") return null;
  const assinaturas = 3;
  const mensalCentavos = 32000;
  const meses = 10;
  return { assinaturas, mensalCentavos, meses, adultoCentavos: mensalCentavos * meses, totalCentavos: assinaturas * mensalCentavos * meses };
}