/**
 * Escritor de timeline no eixo canônico `case_timeline_events`.
 * Sem tabela nova. Visibilidade padrão `interno` (portal só vê `cliente_aprovado`).
 * A migration corretiva também grava via trigger; este helper cobre o app
 * mesmo antes do SQL ser aplicado. Idempotente por origem+título na janela curta.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Sb = { from: (t: string) => any };

export async function registrarTimelineCaso(
  supabase: Sb,
  input: {
    organizationId: string;
    caseId: string;
    eventType: "caso" | "tarefa" | "pendencia";
    title: string;
    summaryInternal?: string | null;
    sourceEntityType: string;
    sourceEntityId: string;
    bloqueio?: boolean;
    userId?: string | null;
    nextAction?: string | null;
  },
): Promise<void> {
  const janela = new Date(Date.now() - 15_000).toISOString();
  const { data: existente } = await supabase
    .from("case_timeline_events")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("case_id", input.caseId)
    .eq("source_entity_id", input.sourceEntityId)
    .eq("title", input.title)
    .gte("created_at", janela)
    .is("archived_at", null)
    .limit(1)
    .maybeSingle();
  if (existente?.id) return;

  const { error } = await supabase.from("case_timeline_events").insert({
    organization_id: input.organizationId,
    case_id: input.caseId,
    event_type: input.eventType,
    title: input.title,
    status: "registrado",
    occurred_at: new Date().toISOString(),
    visibility: "interno",
    summary_internal: input.summaryInternal ?? null,
    bloqueio: Boolean(input.bloqueio),
    source_entity_type: input.sourceEntityType,
    source_entity_id: input.sourceEntityId,
    next_action: input.nextAction ?? null,
    created_by: input.userId ?? null,
    updated_by: input.userId ?? null,
  });
  if (error) throw new Error(`Timeline operacional não gravou: ${error.message}`);
}
