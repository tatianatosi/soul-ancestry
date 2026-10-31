type Sb = { from: (t: string) => any };

type Linha = Record<string, unknown> & { organization_id: string; case_id: string; acao_codigo: string };

const PENDENTES = ["draft_created", "awaiting_approval"];

async function pendentes(supabase: Sb, l: Pick<Linha, "organization_id" | "case_id" | "acao_codigo">) {
  const { data, error } = await supabase
    .from("communication_queue")
    .select("id")
    .eq("organization_id", l.organization_id)
    .eq("case_id", l.case_id)
    .eq("acao_codigo", l.acao_codigo)
    .in("status", PENDENTES)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string }[]).map((r) => r.id);
}

/**
 * Cria o rascunho só se não houver outro pendente da mesma ação no caso.
 * Sem constraint única no banco, a checagem antes do insert não basta: duas
 * chamadas simultâneas passariam. Por isso, depois de inserir, o mais antigo
 * vence e o perdedor arquiva a própria linha (sem exclusão física).
 */
export async function criarRascunhoSeNaoHouver(
  supabase: Sb,
  linha: Linha,
): Promise<{ criado: boolean; id: string }> {
  const antes = await pendentes(supabase, linha);
  if (antes.length > 0) return { criado: false, id: antes[0] };

  const { data, error } = await supabase.from("communication_queue").insert(linha).select("id").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("O rascunho não foi criado.");

  const depois = await pendentes(supabase, linha);
  if (depois.length > 1 && depois[0] !== data.id) {
    const { error: erroArquivar } = await supabase
      .from("communication_queue")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", data.id);
    if (erroArquivar) throw new Error(erroArquivar.message);
    return { criado: false, id: depois[0] };
  }
  return { criado: true, id: data.id as string };
}
