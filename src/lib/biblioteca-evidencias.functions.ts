import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_EVIDENCIA = [
  "case_id",
  "research_item_id",
  "research_person_id",
  "source_id",
  "evidence_type",
  "evidence_nature",
  "title_internal",
  "description_internal",
  "reference_date",
  "reference_location",
  "storage_reference_internal",
  "access_level",
  "workflow_status",
  "epistemic_validation_status",
  "confidence_level",
  "negative_search_source",
  "negative_search_date",
  "negative_search_next_action",
  "reviewed_by",
  "reviewed_at",
  "legal_review_status",
  "legal_review_notes_internal",
];

const CAMPOS_PROJECAO = [
  "source_entity_type",
  "source_entity_id",
  "case_id",
  "projection_type",
  "destination",
  "content_sanitized",
  "approval_status",
  "approved_by",
  "approved_at",
  "visibility_scope",
  "effective_from",
];

function filtrar(campos: string[], entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of campos) if (c in entrada) out[c] = entrada[c];
  return out;
}

function recusarNaoMapeado(campos: string[], entrada: Record<string, unknown>) {
  const sobra = Object.keys(entrada).filter((k) => !campos.includes(k));
  if (sobra.length) throw new Error(`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: ${sobra.join(", ")}`);
}

async function autorizarEscrita(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode registrar evidências ou projeções.");
  return organizationId;
}

/** Painel interno da biblioteca: evidências, histórico de validação e projeções do caso. */
export const painelBibliotecaEvidencias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa a biblioteca de evidências.");

    const [evidencias, projecoes, fontes, pessoas, caso] = await Promise.all([
      supabase
        .from("evidences")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("app_projections")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("research_sources")
        .select("id,title,source_type")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("research_people")
        .select("id,canonical_name")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase.from("crm_casos").select("id,codigo,titulo,pais").eq("id", data.caseId).maybeSingle(),
    ]);

    const ids = (evidencias.data ?? []).map((e: any) => e.id);
    const validacoes = ids.length
      ? await supabase
          .from("evidence_validations")
          .select("*")
          .eq("organization_id", organizationId)
          .in("evidence_id", ids)
          .order("revisado_em", { ascending: false })
      : { data: [] as any[] };

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      papel,
      caso: (caso.data ?? null) as any,
      evidencias: (evidencias.data ?? []) as any[],
      validacoes: (validacoes.data ?? []) as any[],
      projecoes: (projecoes.data ?? []) as any[],
      fontes: (fontes.data ?? []) as any[],
      pessoas: (pessoas.data ?? []) as any[],
    };
  });

export const salvarEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    recusarNaoMapeado(CAMPOS_EVIDENCIA, data.valores);
    const valores = filtrar(CAMPOS_EVIDENCIA, data.valores);

    const r = data.id
      ? await supabase.from("evidences").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("evidences")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { id: r.data.id as string };
  });

/**
 * Elevação/rebaixamento de confiança sempre pelo histórico: registra a justificativa
 * e só então altera a evidência. O banco recusa salto INICIAL → ALTO.
 */
export const registrarValidacaoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      evidenceId: string;
      estadoNovo: string;
      confiancaNova: string;
      justificativa: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    if (data.justificativa.trim().length < 10) throw new Error("Justificativa exige pelo menos 10 caracteres.");

    const atual = await supabase
      .from("evidences")
      .select("id,epistemic_validation_status,confidence_level")
      .eq("id", data.evidenceId)
      .maybeSingle();
    if (atual.error) throw new Error(atual.error.message);
    if (!atual.data) throw new Error("Evidência não encontrada ou sem permissão de acesso.");

    const agora = new Date().toISOString();
    const hist = await supabase.from("evidence_validations").insert({
      organization_id: organizationId,
      evidence_id: data.evidenceId,
      estado_anterior: atual.data.epistemic_validation_status,
      estado_novo: data.estadoNovo,
      confianca_anterior: atual.data.confidence_level,
      confianca_nova: data.confiancaNova,
      justificativa: data.justificativa,
      revisado_por: context.userId as string,
      revisado_em: agora,
    });
    if (hist.error) throw new Error(hist.error.message);

    const upd = await supabase
      .from("evidences")
      .update({
        epistemic_validation_status: data.estadoNovo,
        confidence_level: data.confiancaNova,
        reviewed_by: context.userId as string,
        reviewed_at: agora,
      })
      .eq("id", data.evidenceId)
      .select("id")
      .maybeSingle();
    if (upd.error) throw new Error(upd.error.message);
    return { ok: true };
  });

export const salvarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    recusarNaoMapeado(CAMPOS_PROJECAO, data.valores);
    const valores = filtrar(CAMPOS_PROJECAO, data.valores);

    const r = data.id
      ? await supabase.from("app_projections").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("app_projections")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { id: r.data.id as string };
  });

/** Aprovação humana explícita: sem aprovação automática e sem publicação silenciosa. */
export const aprovarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; publicar: boolean }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    const agora = new Date().toISOString();
    const r = await supabase
      .from("app_projections")
      .update({
        approval_status: data.publicar ? "published" : "approved",
        approved_by: context.userId as string,
        approved_at: agora,
        effective_from: data.publicar ? agora : null,
      })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true };
  });

/** Sem exclusão física: apenas arquivamento com motivo. */
export const arquivarRegistroG03 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: "evidences" | "app_projections"; id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    if (data.motivo.trim().length < 5) throw new Error("Informe o motivo do arquivamento (mínimo 5 caracteres).");
    const patch: Record<string, unknown> = {
      archived_at: new Date().toISOString(),
      archived_reason: data.motivo,
    };
    if (data.tabela === "app_projections") patch["approval_status"] = "archived";
    const r = await supabase.from(data.tabela).update(patch).eq("id", data.id).select("id").maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });
