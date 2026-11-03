/**
 * Marcos da Jornada (13/10/2026) — o Desk cria, publica e arquiva marcos
 * históricos (app_projections, projection_type='linha_tempo'). Sem tabela
 * nova: RLS can_write e o guard do banco continuam decidindo. Publicado nunca
 * volta a rascunho (guard); só arquiva, com motivo.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { exigirLinhaGravada } from "@/lib/persistencia.server";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

type Sb = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type MarcoDesk = {
  id: string;
  texto: string;
  estado: "rascunho" | "publicado";
  atualizadoEm: string;
};

export function montarTextoMarco(i: { data: string; titulo: string; local?: string | null }): string {
  const local = i.local?.trim();
  return `${i.data.trim()} — ${i.titulo.trim()}${local ? `, ${local}` : ""}`;
}

async function orgDoCaso(sb: Sb, caseId: string): Promise<string> {
  const { data, error } = await sb.from("crm_casos").select("organization_id").eq("id", caseId).maybeSingle();
  if (error || !data) throw new Error("Caso não encontrado ou sem acesso.");
  return data.organization_id as string;
}

async function auditar(sb: Sb, org: string, userId: string, id: string, acao: string, antes: unknown, depois: unknown) {
  await registrarAuditoria(sb, {
    organization_id: org,
    user_id: userId,
    entidade: "app_projections",
    entidade_id: id,
    acao,
    metadados: { origem: "desk_marcos_jornada", antes, depois },
  } as never);
}

export const listarMarcosJornada = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }): Promise<MarcoDesk[]> => {
    const sb = context.supabase as Sb;
    const { data: rows, error } = await sb
      .from("app_projections")
      .select("id, content_sanitized, approval_status, updated_at")
      .eq("case_id", data.caseId)
      .eq("projection_type", "linha_tempo")
      .is("archived_at", null)
      .order("created_at", { ascending: true });
    if (error) throw new Error("Não foi possível ler os marcos.");
    return (rows ?? []).map((r: any) => ({
      id: r.id,
      texto: r.content_sanitized,
      estado: r.approval_status === "published" ? "publicado" : "rascunho",
      atualizadoEm: r.updated_at,
    }));
  });

export const criarMarcoJornada = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; titulo: string; data: string; local?: string; publicar: boolean }) => {
    if (!d.titulo?.trim() || !d.data?.trim()) throw new Error("Informe título e data/ano.");
    if (d.titulo.length > 200 || d.data.length > 40 || (d.local ?? "").length > 120) throw new Error("Texto longo demais.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as Sb;
    const userId = context.userId as string;
    const org = await orgDoCaso(sb, data.caseId);
    const agora = new Date().toISOString();
    const texto = montarTextoMarco(data);
    const { data: row, error } = await sb
      .from("app_projections")
      .insert({
        organization_id: org,
        case_id: data.caseId,
        source_entity_type: "case",
        source_entity_id: data.caseId,
        projection_type: "linha_tempo",
        destination: "app",
        visibility_scope: "nucleo",
        content_sanitized: texto,
        approval_status: data.publicar ? "published" : "draft",
        approved_by: data.publicar ? userId : null,
        approved_at: data.publicar ? agora : null,
        created_by: userId,
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await auditar(sb, org, userId, row.id, data.publicar ? "marco_publicado" : "marco_rascunho", null, { texto });
    return { id: row.id as string };
  });

export const publicarMarcoJornada = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; id: string }) => d)
  .handler(async ({ data, context }) => {
    const sb = context.supabase as Sb;
    const userId = context.userId as string;
    const org = await orgDoCaso(sb, data.caseId);
    const res = await sb
      .from("app_projections")
      .update({ approval_status: "published", approved_by: userId, approved_at: new Date().toISOString() } as never)
      .eq("id", data.id)
      .eq("case_id", data.caseId)
      .select("id");
    exigirLinhaGravada(res, "app_projections");
    await auditar(sb, org, userId, data.id, "marco_publicado", { estado: "rascunho" }, { estado: "publicado" });
    return { ok: true };
  });

export const arquivarMarcoJornada = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; id: string; motivo: string }) => {
    if (!d.motivo?.trim()) throw new Error("Informe o motivo do arquivamento.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const sb = context.supabase as Sb;
    const userId = context.userId as string;
    const org = await orgDoCaso(sb, data.caseId);
    const res = await sb
      .from("app_projections")
      .update({ approval_status: "archived", archived_at: new Date().toISOString(), archived_reason: data.motivo.trim() } as never)
      .eq("id", data.id)
      .eq("case_id", data.caseId)
      .select("id");
    exigirLinhaGravada(res, "app_projections");
    await auditar(sb, org, userId, data.id, "marco_arquivado", null, { motivo: data.motivo.trim() });
    return { ok: true };
  });
