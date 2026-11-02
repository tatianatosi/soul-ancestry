export type ValidacaoDocumental = { validation_key: string; severity: string; status: string; label: string };
export function impedimentosContratuais(linhas: ValidacaoDocumental[], dispensaDocumental: boolean): string[] {
  return linhas.filter(r => r.status === "open" && ["blocking", "high"].includes(r.severity))
    .filter(r => !(dispensaDocumental && ["annexes_required", "party_documents"].includes(r.validation_key)))
    .map(r => r.label);
}