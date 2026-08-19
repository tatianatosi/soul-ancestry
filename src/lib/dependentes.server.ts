import { resumoParametroDependentes, type Dependente } from "@/lib/dependentes";

/**
 * Espelha o parâmetro `dependentes` na ficha contratual do caso.
 * Só grava o resumo estrutural (nome, vínculo, situação de representação):
 * nunca cria cláusula, contrato, cobrança ou documento.
 */
export async function sincronizarParametroDependentes(supabase: any, caseId: string): Promise<void> {
  const { data: deps } = await supabase
    .from("case_dependents")
    .select("*")
    .eq("case_id", caseId)
    .is("archived_at", null);

  const { data: fichas } = await supabase
    .from("contract_case_parameters")
    .select("id")
    .eq("case_id", caseId)
    .is("archived_at", null);

  if (!fichas?.length) return;

  const valor = resumoParametroDependentes((deps ?? []) as Dependente[]);
  for (const f of fichas as { id: string }[]) {
    await supabase
      .from("contract_parameter_values")
      .update({ valor, origem: "crm", status: "importado_a_confirmar" })
      .eq("parameters_id", f.id)
      .eq("campo", "dependentes");
  }
}
