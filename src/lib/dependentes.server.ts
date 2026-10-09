import { resumoParametroDependentes, type Dependente } from "@/lib/dependentes";
import { exigirLinhaGravada } from "@/lib/persistencia.server";

/**
 * Espelha o parâmetro `dependentes` na ficha contratual do caso.
 * Só grava o resumo estrutural (nome, vínculo, situação de representação):
 * nunca cria cláusula, contrato, cobrança ou documento.
 */
export async function sincronizarParametroDependentes(
  supabase: any,
  caseId: string,
  organizationId?: string,
): Promise<void> {
  // Corte 1 (27/09/2026): leituras e escrita restritas à organização quando
  // informada; linha já com o mesmo resumo não é regravada — antes, cada
  // sincronização derrubava para "a confirmar" o que já estava validado.
  let qDeps = supabase.from("case_dependents").select("*").eq("case_id", caseId).is("archived_at", null);
  if (organizationId) qDeps = qDeps.eq("organization_id", organizationId);
  const { data: deps } = await qDeps;

  let qFichas = supabase.from("contract_case_parameters").select("id").eq("case_id", caseId).is("archived_at", null);
  if (organizationId) qFichas = qFichas.eq("organization_id", organizationId);
  const { data: fichas } = await qFichas;

  if (!fichas?.length) return;

  const valor = resumoParametroDependentes((deps ?? []) as Dependente[]);
  for (const f of fichas as { id: string }[]) {
    const { data: linha } = await supabase
      .from("contract_parameter_values")
      .select("id,valor")
      .eq("parameters_id", f.id)
      .eq("campo", "dependentes")
      .maybeSingle();
    if (!linha || (linha.valor ?? "") === (valor ?? "")) continue;
    exigirLinhaGravada(
      await supabase
        .from("contract_parameter_values")
        .update({ valor, origem: "crm", status: "importado_a_confirmar" })
        .eq("id", linha.id)
        .select("id"),
      "contract_parameter_values",
    );
  }
}
