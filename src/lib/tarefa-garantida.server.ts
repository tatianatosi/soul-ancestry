/**
 * Garante uma tarefa aberta no caso (mesmo título → reusa, não duplica).
 * Sem tabela nova. Não envia mensagem nem ativa cliente.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Sb = { from: (t: string) => any };

export async function garantirTarefaAberta(
  supabase: Sb,
  input: {
    organizationId: string;
    casoId: string;
    titulo: string;
    tipo: string;
    descricao?: string;
    userId?: string;
  },
): Promise<{ id: string; criada: boolean }> {
  const { data: existente } = await supabase
    .from("tarefas")
    .select("id")
    .eq("organization_id", input.organizationId)
    .eq("caso_id", input.casoId)
    .eq("titulo", input.titulo)
    .not("status", "in", "(concluida,cancelada)")
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existente?.id) return { id: existente.id as string, criada: false };

  const { data: novo, error } = await supabase
    .from("tarefas")
    .insert({
      organization_id: input.organizationId,
      caso_id: input.casoId,
      titulo: input.titulo,
      tipo: input.tipo,
      descricao: input.descricao ?? null,
      status: "nao_iniciada",
      prioridade: "media",
      created_by: input.userId ?? null,
      updated_by: input.userId ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (!novo?.id) throw new Error("NENHUMA_LINHA_AFETADA: a tarefa não foi criada.");
  return { id: novo.id as string, criada: true };
}
