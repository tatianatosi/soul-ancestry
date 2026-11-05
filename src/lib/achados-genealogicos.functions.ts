import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_ACHADO = [
  "case_id",
  "family_id",
  "research_item_id",
  "primary_research_person_id",
  "title",
  "generation",
  "finding_type",
  "internal_summary",
  "confirmed_facts",
  "facts_to_confirm",
  "period_start",
  "period_end",
  "locality",
  "family_relationship",
  "relevance",
  "validation_status",
  "evidence_links",
  "source_links",
  "negative_source_consulted_at",
  "negative_next_action",
  "tree_impact",
  "timeline_impact",
  "planning_impact",
  "eligible_for_client_deliverable",
  "client_deliverable_id",
  "responsible_user_id",
  "found_at",
  "internal_notes",
];

const CAMPOS_ENCONTRO = [
  "case_id",
  "family_id",
  "lineage_path_a_id",
  "lineage_path_b_id",
  "encounter_type",
  "title_internal",
  "title_client",
  "contexto_historico",
  "territorios_migratorios",
  "memoria_familiar",
  "praticas_culturais_documentadas",
  "encontros_no_brasil",
  "repertorios_narrativos",
  "resumo_interno",
  "resumo_aprovado_cliente",
  "evidence_links_a",
  "evidence_links_b",
  "confidence_internal",
  "validation_status",
  "disclaimer_obrigatorio",
  "tree_impact",
  "timeline_impact",
  "approval_status",
  "client_deliverable_id",
  "responsible_user_id",
  "data_marco",
];

function filtrar(campos: string[], entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of campos) if (c in entrada) out[c] = entrada[c];
  return out;
}

/** Painel interno: achados, encontros e insumos (evidências, fontes, núcleos). */
export const painelAchados = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel))
      throw new Error("Seu papel não acessa achados genealógicos.");

    const org = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [achados, encontros, evidencias, fontes, nucleos, pesquisas, caso] = await Promise.all([
      org("genealogical_findings")
        .eq("case_id", data.caseId)
        .order("found_at", { ascending: false }),
      org("lineage_encounters")
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("research_evidence_items")
        .select("id,title,evidence_status,research_case_id")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("research_sources")
        .select("id,title,source_type,source_status,access_level,research_case_id")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      org("nucleos_familiares").eq("case_id", data.caseId).is("archived_at", null),
      org("research_cases").eq("case_id", data.caseId).is("archived_at", null),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,pais")
        .eq("id", data.caseId)
        .maybeSingle(),
    ]);

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      caso: caso.data ?? null,
      achados: (achados.data ?? []) as Record<string, any>[],
      encontros: (encontros.data ?? []) as Record<string, any>[],
      evidencias: (evidencias.data ?? []) as Record<string, any>[],
      fontes: (fontes.data ?? []) as Record<string, any>[],
      nucleos: (nucleos.data ?? []) as Record<string, any>[],
      pesquisas: (pesquisas.data ?? []) as Record<string, any>[],
    };
  });

async function autorizarEscrita(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel))
    throw new Error("Seu papel não pode registrar achados ou encontros.");
  return organizationId;
}

/**
 * CA11-CENTRO-INTELIGENCIA (09/09/2026) — achado nunca fica como linha sem
 * consequência. Os campos `eligible_for_client_deliverable`/`client_deliverable_id`
 * já existiam no schema e nunca eram lidos por nenhum gravador: marcar um
 * achado como elegível para entrega e não vinculá-lo a uma microentrega
 * ficava sem nenhum rastro operacional. Agora isso abre (ou atualiza) um
 * alerta interno pendente por caso em `case_alerts` — nunca cria, projeta ou
 * publica nada no App Cliente sozinho; a decisão de gerar a microentrega
 * continua humana. Deixar de ser elegível ou já ter entrega vinculada
 * resolve o alerta automaticamente, sem deixar pendência fantasma.
 */
export async function prepararConsequenciaAchado(
  supabase: Sb,
  organizationId: string,
  achado: Record<string, any>,
): Promise<void> {
  if (!achado?.case_id) return;
  const pendente =
    Boolean(achado.eligible_for_client_deliverable) &&
    !achado.client_deliverable_id &&
    !achado.archived_at;

  const { data: existente } = await supabase
    .from("case_alerts")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", achado.case_id)
    .eq("tipo", "achado_pendente_decisao")
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (pendente) {
    const payload = {
      organization_id: organizationId,
      case_id: achado.case_id,
      tipo: "achado_pendente_decisao",
      criticidade: "atencao",
      titulo: `Achado elegível para microentrega: ${achado.title ?? "sem título"}`,
      detalhe: `Achado ${achado.id} marcado como elegível para entrega ao cliente e ainda sem microentrega vinculada. Decisão humana pendente — nada é publicado automaticamente.`,
      status: "pending",
    };
    if (existente?.id) {
      const { error } = await supabase.from("case_alerts").update(payload).eq("id", existente.id);
      if (error) throw new Error(`sincronizarAlertaMicroentrega(update): ${error.message}`);
    } else {
      const { error } = await supabase.from("case_alerts").insert(payload);
      if (error) throw new Error(`sincronizarAlertaMicroentrega(insert): ${error.message}`);
    }
  } else if (existente?.id) {
    const { error } = await supabase
      .from("case_alerts")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", existente.id);
    if (error) throw new Error(`sincronizarAlertaMicroentrega(complete): ${error.message}`);
  }
}

export const salvarAchado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_ACHADO, data.valores);

    const criando = !data.id;
    let registro: Record<string, any>;
    if (data.id) {
      const r = await gravarComVerificacao({
        supabase,
        tabela: "genealogical_findings",
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: valores,
      });
      registro = r.registro;
    } else {
      const r = await inserirComVerificacao({
        supabase,
        tabela: "genealogical_findings",
        organizationId,
        userId: context.userId as string,
        payload: valores,
      });
      registro = r.registro;
    }

    // P5 (26/09/2026) — Estágio 4 (Achado) nunca deixava evento em
    // `case_timeline_events`; só existia o alerta operacional de
    // `prepararConsequenciaAchado` (outra coisa — consequência, não histórico
    // de mudança do próprio achado).
    if (registro.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: String(registro.case_id),
        eventType: "caso",
        title: criando
          ? `Achado registrado — ${registro.title ?? "sem título"}`
          : `Achado atualizado — ${registro.title ?? "sem título"}`,
        summaryInternal: `Status de validação: ${String(registro.validation_status ?? "não informado")}`,
        sourceEntityType: "genealogical_findings",
        sourceEntityId: String(registro.id),
        userId: context.userId as string,
      });
    }

    await prepararConsequenciaAchado(supabase, organizationId, registro);
    return { id: registro.id as string };
  });

export const salvarEncontro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_ENCONTRO, data.valores);

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "lineage_encounters",
        id: data.id,
        organizationId,
        userId: context.userId as string,
        payload: valores,
      });
      return { id: data.id };
    }
    const { data: linha, error } = await supabase
      .from("lineage_encounters")
      .insert({ ...valores, organization_id: organizationId })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
  });

/** Sem exclusão física: apenas arquivamento com motivo. */
export const arquivarRegistroG06 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { tabela: "genealogical_findings" | "lineage_encounters"; id: string; motivo: string }) =>
      d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    if (!data.motivo.trim()) throw new Error("Informe o motivo do arquivamento.");
    const r = await gravarComVerificacao({
      supabase,
      tabela: data.tabela,
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { archived_at: new Date().toISOString(), archive_motivo: data.motivo },
    });
    if (r.registro.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: String(r.registro.case_id),
        eventType: "caso",
        title:
          data.tabela === "genealogical_findings"
            ? "Achado arquivado"
            : "Encontro de linhagem arquivado",
        summaryInternal: data.motivo,
        sourceEntityType: data.tabela,
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    if (data.tabela === "genealogical_findings") {
      await prepararConsequenciaAchado(supabase, organizationId, r.registro);
    }
    return { ok: true };
  });
