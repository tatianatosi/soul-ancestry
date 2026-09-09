import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";

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
  "pessoa_id",
  "due_at",
  "projection_type",
  "destination",
  "content_sanitized",
  "approval_status",
  "approved_by",
  "approved_at",
  "visibility_scope",
  "effective_from",
  // Decisão da Proprietária (09/09/2026) — "achado é compartilhável apenas
  // quando sanitizado e autorizado": quando visibility_scope='titular',
  // titular_client_id é a pessoa (clientes.id) que vê o achado por padrão.
  "titular_client_id",
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

    const [evidencias, projecoes, fontes, pessoas, caso, casoServicos] = await Promise.all([
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
      supabase
        .from("case_services")
        .select("citizenship_track_id")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
    ]);

    // Elo marco jurídico -> caso: trilha(s) do caso (case_services) já ligam a
    // regra jurídica aprovada e ao marco/citação (consolidado em 08-09/09/2026).
    // Só regra `aprovado` e não arquivada vira opção de origem de projeção —
    // mesma trava de evidenciaProjetavel, aplicada à regra (marcoJuridicoProjetavel).
    const trackIds = [...new Set((casoServicos.data ?? []).map((s: any) => s.citizenship_track_id).filter(Boolean))];
    const marcosJuridicos = trackIds.length
      ? await supabase
          .from("versioned_legal_rules")
          .select("id,track_id,tema,status,archived_at,fonte_referencia")
          .in("track_id", trackIds)
          .is("archived_at", null)
          .eq("status", "aprovado")
      : { data: [] as any[] };

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
      marcosJuridicos: (marcosJuridicos.data ?? []) as any[],
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
    const justificativa = (data.justificativa ?? "").trim() || "Sem justificativa informada.";

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
      justificativa,
      revisado_por: context.userId as string,
      revisado_em: agora,
    });
    if (hist.error) throw new Error(hist.error.message);

    await gravarComVerificacao({
      supabase,
      tabela: "evidences",
      id: data.evidenceId,
      organizationId,
      userId: context.userId as string,
      payload: {
        epistemic_validation_status: data.estadoNovo,
        confidence_level: data.confiancaNova,
        reviewed_by: context.userId as string,
        reviewed_at: agora,
      },
    });
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

/** Envia rascunho/aprovada de volta para revisão — nunca pula etapa às cegas. */
export const revisarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    const r = await supabase
      .from("app_projections")
      .update({ approval_status: "in_review" })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true };
  });

/**
 * Despublica sem arquivar: some do App Cliente (a view portal_projecoes exige
 * approval_status = published), mas continua editável como aprovada — ação
 * reversível, distinta de arquivar (que exige motivo e é definitiva).
 */
export const despublicarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    const r = await supabase
      .from("app_projections")
      .update({ approval_status: "approved", effective_from: null })
      .eq("id", data.id)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { ok: true };
  });

/**
 * Rascunho de alerta interno sobre a microentrega — nunca envia WhatsApp,
 * e-mail ou qualquer canal externo. Mesma tabela (`case_alerts`) já usada por
 * `registrarProximaAcao` (caso-canonico.functions.ts), aqui escopada à
 * projeção específica.
 *
 * 09/09/2026 — deduplicação: mesmo padrão de `registrarRevalidacaoProposta`
 * (escopo-conferencia.functions.ts), a única rotina que já evitava alerta
 * repetido. Um alerta `pending` do mesmo tipo já aberto para o caso é
 * reaproveitado, nunca duplicado.
 */
export const prepararAlertaProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; caseId: string; titulo: string; detalhe?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);

    const { data: existente } = await supabase
      .from("case_alerts")
      .select("id")
      .eq("case_id", data.caseId)
      .eq("tipo", "microentrega_pendente")
      .eq("status", "pending")
      .limit(1)
      .maybeSingle();
    if (existente?.id) return { id: existente.id as string, criado: false };

    const r = await supabase
      .from("case_alerts")
      .insert({
        organization_id: organizationId,
        case_id: data.caseId,
        tipo: "microentrega_pendente",
        criticidade: "atencao",
        titulo: data.titulo,
        detalhe: data.detalhe ?? `Projeção ${data.id} aguarda revisão/aprovação.`,
        status: "pending",
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { id: r.data.id as string, criado: true };
  });

/** Sem exclusão física: apenas arquivamento com motivo. */
export const arquivarRegistroG03 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: "evidences" | "app_projections"; id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const patch: Record<string, unknown> = {
      archived_at: new Date().toISOString(),
      archived_reason: motivo,
    };
    if (data.tabela === "app_projections") patch["approval_status"] = "archived";
    await gravarComVerificacao({
      supabase,
      tabela: data.tabela,
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
    return { ok: true };
  });

/* ===================== COMPARTILHAMENTO DE ACHADO (LGPD) ===================== */

/**
 * Decisão da Proprietária (09/09/2026) — "achado é compartilhável apenas
 * quando sanitizado e autorizado": registra que o TITULAR autorizou
 * (por telefone, presencialmente etc. — a equipe registra em nome dele,
 * deixando explícito quem autorizou) o compartilhamento de UM achado
 * sanitizado com UM outro membro da família. Nunca compartilha o documento
 * original — só o `content_sanitized` já aprovado/publicado da projeção.
 */
export const registrarCompartilhamentoAchado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projecaoId: string; compartilharComClienteId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);

    const { data: projecao } = await supabase
      .from("app_projections")
      .select("id,organization_id,titular_client_id,approval_status")
      .eq("id", data.projecaoId)
      .maybeSingle();
    if (!projecao || projecao.organization_id !== organizationId) {
      throw new Error("Achado não encontrado nesta organização.");
    }
    if (!projecao.titular_client_id) {
      throw new Error("Este achado não tem titular definido — associe o titular antes de compartilhar.");
    }
    if (projecao.approval_status !== "approved" && projecao.approval_status !== "published") {
      throw new Error("Só um achado já aprovado pode ser compartilhado.");
    }

    const r = await supabase
      .from("app_projection_shares")
      .insert({
        organization_id: organizationId,
        projection_id: data.projecaoId,
        compartilhado_com_client_id: data.compartilharComClienteId,
        autorizado_por: "equipe_interna",
        autorizado_por_user_id: context.userId as string,
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

/** Revoga uma autorização de compartilhamento — nunca exclusão física. */
export const revogarCompartilhamentoAchado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    await gravarComVerificacao({
      supabase,
      tabela: "app_projection_shares",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        revogado_em: new Date().toISOString(),
        revogado_por_user_id: context.userId as string,
        revogado_motivo: (data.motivo ?? "").trim() || "Sem motivo informado.",
      },
    });
    return { ok: true };
  });

/** Lista as autorizações de compartilhamento de um achado. */
export const listarCompartilhamentosAchado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projecaoId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    const { data: linhas, error } = await supabase
      .from("app_projection_shares")
      .select("*")
      .eq("projection_id", data.projecaoId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Record<string, any>[];
  });
