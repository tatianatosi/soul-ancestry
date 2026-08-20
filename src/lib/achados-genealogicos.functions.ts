import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";

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
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa achados genealógicos.");

    const org = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [achados, encontros, evidencias, fontes, nucleos, pesquisas, caso] = await Promise.all([
      org("genealogical_findings").eq("case_id", data.caseId).order("found_at", { ascending: false }),
      org("lineage_encounters").eq("case_id", data.caseId).order("created_at", { ascending: false }),
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
      supabase.from("crm_casos").select("id,codigo,titulo,pais").eq("id", data.caseId).maybeSingle(),
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
  if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode registrar achados ou encontros.");
  return organizationId;
}

export const salvarAchado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_ACHADO, data.valores);

    const r = data.id
      ? await supabase.from("genealogical_findings").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("genealogical_findings")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

export const salvarEncontro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_ENCONTRO, data.valores);

    const r = data.id
      ? await supabase.from("lineage_encounters").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("lineage_encounters")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

/** Sem exclusão física: apenas arquivamento com motivo. */
export const arquivarRegistroG06 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: "genealogical_findings" | "lineage_encounters"; id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    if (!data.motivo.trim()) throw new Error("Informe o motivo do arquivamento.");
    const r = await supabase
      .from(data.tabela)
      .update({ archived_at: new Date().toISOString(), archive_motivo: data.motivo })
      .eq("id", data.id);
    if (r.error) throw new Error(r.error.message);
    return { ok: true };
  });
