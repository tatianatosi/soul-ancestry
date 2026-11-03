/**
 * Despublicação de projeções do App Cliente — caminho ÚNICO.
 *
 * `despublicarProjecaoApp` (portal-atendimento.functions.ts) e o arquivamento /
 * rebaixamento de perfil genealógico (pessoas-linhagens.functions.ts, C7) usam
 * estas funções: arquiva (nunca apaga) `app_projections` com motivo, audita e
 * registra na linha do tempo do caso.
 */
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type AuditarFn = (
  organizationId: string,
  userId: string,
  acao: string,
  entidade: string,
  entidadeId: string,
  metadados: any,
) => Promise<void>;

export async function despublicarProjecaoPorId(args: {
  supabase: any;
  organizationId: string;
  userId: string;
  papel?: string | null;
  projecaoId: string;
  motivo: string;
  auditar: AuditarFn;
}): Promise<{ caseId: string | null }> {
  const { supabase, organizationId, userId, projecaoId, motivo } = args;
  const r = await gravarComVerificacao({
    supabase,
    tabela: "app_projections",
    id: projecaoId,
    organizationId,
    userId,
    payload: { archived_at: new Date().toISOString(), archived_reason: motivo },
  });
  await args.auditar(organizationId, userId, "projecao_app_despublicada", "app_projections", projecaoId, {
    papel: args.papel ?? null,
    quando: new Date().toISOString(),
  });
  const caseId = (r.registro["case_id"] as string | undefined) ?? null;
  if (caseId) {
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId,
      eventType: "caso",
      title: "Conteúdo despublicado do App Cliente",
      summaryInternal: motivo,
      sourceEntityType: "app_projections",
      sourceEntityId: projecaoId,
      userId,
    });
  }
  return { caseId };
}

/**
 * C7 — retira do App as projeções publicadas de UMA pessoa em UM caso
 * (`app_projections.pessoa_id` = `research_people.id` = `research_person_id` do perfil).
 * Devolve quantas foram despublicadas. Falha propaga: a pessoa não pode ficar
 * publicada depois de arquivada/rebaixada.
 */
export async function despublicarProjecoesDaPessoa(args: {
  supabase: any;
  organizationId: string;
  userId: string;
  caseId: string;
  pessoaId: string;
  motivo: string;
  auditar: AuditarFn;
}): Promise<number> {
  const { supabase, organizationId, caseId, pessoaId } = args;
  const lidas = await supabase
    .from("app_projections")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .eq("pessoa_id", pessoaId)
    .eq("approval_status", "published")
    .is("archived_at", null);
  if (lidas.error) throw new Error(lidas.error.message);
  const ids = ((lidas.data ?? []) as { id: string }[]).map((p) => String(p.id));
  for (const id of ids) {
    await despublicarProjecaoPorId({
      supabase,
      organizationId,
      userId: args.userId,
      projecaoId: id,
      motivo: args.motivo,
      auditar: args.auditar,
    });
  }
  return ids.length;
}
