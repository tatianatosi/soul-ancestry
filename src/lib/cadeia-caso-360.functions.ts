/* eslint-disable @typescript-eslint/no-explicit-any */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { montarCadeiaCaso360 } from "@/lib/cadeia-caso-360";
import { raciocinioJuridicoDoCaso } from "@/lib/motor-raciocinio-juridico";

/**
 * Cadeia Caso 360 (Corte 3, 27/09/2026): leitura unificada para a Visão do
 * caso — produto-pai, trilha jurídica, plano/jornada, estágio de
 * liberação Desk→App e o raciocínio jurídico automático (Corte 2). Só
 * leitura; nenhuma tabela ou writer novo.
 */
export const lerCadeiaCaso360 = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: String(d.caseId) }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const [casoRes, servicoRes, planoRes, projecoesRes, researchCaseRes, linhasRes] = await Promise.all([
      supabase
        .from("crm_casos")
        .select("id,documentos_minimos_ok")
        .eq("organization_id", organizationId)
        .eq("id", data.caseId)
        .maybeSingle(),
      supabase
        .from("case_services")
        .select("product_catalog_id,citizenship_track_id,composicao_familiar,condicao_comercial_aprovada")
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("case_plans")
        .select("produto_pai_id,fase_jornada,status,proxima_acao")
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("app_projections").select("approval_status").eq("case_id", data.caseId).is("archived_at", null),
      supabase
        .from("research_cases")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .maybeSingle(),
      supabase
        .from("lineage_paths")
        .select("id,status,evidencias_chave")
        .eq("case_id", data.caseId)
        .is("archived_at", null),
    ]);
    if (!casoRes.data) throw new Error("Caso não encontrado nesta organização.");

    const trackId = (servicoRes.data?.citizenship_track_id as string | null) ?? null;
    const produtoId = (servicoRes.data?.product_catalog_id as string | null) ?? null;
    const researchCaseId = (researchCaseRes.data?.id as string | undefined) ?? null;
    const linhas = (linhasRes.data ?? []) as { id: string; status: string; evidencias_chave: string[] }[];
    const linhaIds = linhas.map((l) => l.id);

    const [trackRes, produtoRes, regrasRes, marcosRes, evidenciasRes, encontrosRes] = await Promise.all([
      trackId
        ? supabase
            .from("citizenship_tracks")
            .select("pais,via_preliminar,status_via,lifecycle_status")
            .eq("id", trackId)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      produtoId
        ? supabase.from("product_catalog").select("code,nome_comercial").eq("id", produtoId).maybeSingle()
        : Promise.resolve({ data: null }),
      trackId
        ? supabase.from("versioned_legal_rules").select("status").eq("track_id", trackId).is("archived_at", null)
        : Promise.resolve({ data: [] }),
      trackId
        ? supabase
            .from("legal_reference_milestones")
            .select("status,lifecycle_status")
            .eq("track_id", trackId)
            .is("archived_at", null)
        : Promise.resolve({ data: [] }),
      researchCaseId
        ? supabase
            .from("research_evidence_items")
            .select("evidence_status")
            .eq("research_case_id", researchCaseId)
            .is("archived_at", null)
        : Promise.resolve({ data: [] }),
      linhaIds.length
        ? supabase
            .from("lineage_encounters")
            .select("id,lineage_path_a_id,lineage_path_b_id,confidence_internal,validation_status")
            .eq("case_id", data.caseId)
            .is("archived_at", null)
        : Promise.resolve({ data: [] }),
    ]);

    const raciocinio = raciocinioJuridicoDoCaso({
      linhas: linhas as any,
      encontros: (encontrosRes.data ?? []) as any,
      documentosMinimosOk: Boolean(casoRes.data.documentos_minimos_ok),
      evidencias: (evidenciasRes.data ?? []) as any,
      regras: (regrasRes.data ?? []) as any,
      marcos: (marcosRes.data ?? []) as any,
    });

    return montarCadeiaCaso360({
      caseService: (servicoRes.data ?? null) as any,
      produtoCatalogo: (produtoRes.data ?? null) as any,
      track: (trackRes.data ?? null) as any,
      plano: (planoRes.data ?? null) as any,
      projecoes: (projecoesRes.data ?? []) as any,
      raciocinioJuridico: raciocinio,
    });
  });
