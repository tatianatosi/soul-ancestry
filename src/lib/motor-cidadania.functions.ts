import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { skuHomologadoParaCaso } from "@/lib/catalogo-sku.server";
import { avaliarFasesMotorCidadania, TITULO_TAREFA_AVALIACAO_CIDADANIA, type SinalFaseCidadania } from "@/lib/motor-cidadania";
import { garantirTarefaAberta } from "@/lib/tarefa-garantida.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Sinais do Planejador de Cidadania 0–8 nas tabelas que já existem.
 * Não cria `country_catalog`, não calcula % de elegibilidade, não grava preço.
 */
export const lerSinaisMotorCidadania = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const caso = await supabase
      .from("crm_casos")
      .select("id,codigo")
      .eq("organization_id", organizationId)
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const pesquisa = await supabase
      .from("research_cases")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .maybeSingle();
    const researchCaseId = pesquisa.data?.id as string | undefined;

    const [trilhas, marcos, pessoas, evidencias, plano, sku] = await Promise.all([
      supabase
        .from("citizenship_tracks")
        .select("id")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .limit(50),
      supabase
        .from("legal_reference_milestones")
        .select("id")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .limit(50),
      researchCaseId
        ? supabase
            .from("research_people")
            .select("id")
            .eq("organization_id", organizationId)
            .eq("research_case_id", researchCaseId)
            .is("archived_at", null)
            .limit(50)
        : Promise.resolve({ data: [] }),
      researchCaseId
        ? supabase
            .from("research_evidence_items")
            .select("id")
            .eq("organization_id", organizationId)
            .eq("research_case_id", researchCaseId)
            .is("archived_at", null)
            .limit(50)
        : Promise.resolve({ data: [] }),
      supabase
        .from("case_plans")
        .select("id")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .maybeSingle(),
      skuHomologadoParaCaso(supabase, organizationId, caso.data.codigo),
    ]);

    const sinal: SinalFaseCidadania = {
      trilhas: (trilhas.data ?? []).length,
      marcos: (marcos.data ?? []).length,
      pessoas: (pessoas.data ?? []).length,
      evidencias: (evidencias.data ?? []).length,
      planoCaso: Boolean(plano.data?.id),
      pesquisa: Boolean(researchCaseId),
      skuCatalogo: Boolean(sku),
    };

    return { sinal, fases: avaliarFasesMotorCidadania(sinal), sku: sku?.code ?? null };
  });

/**
 * Fase 4: grava uma tarefa de avaliação no caso. Não calcula % de elegibilidade,
 * não emite parecer, não cria citizenship_cases.
 */
export const registrarTarefaAvaliacaoCidadania = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const caso = await supabase
      .from("crm_casos")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const t = await garantirTarefaAberta(supabase, {
      organizationId,
      casoId: data.caseId,
      titulo: TITULO_TAREFA_AVALIACAO_CIDADANIA,
      tipo: "juridico",
      descricao:
        "Avaliação humana da próxima ação genealógica. Sem percentual de elegibilidade e sem parecer automático.",
      userId: context.userId as string,
    });
    return { id: t.id, criada: t.criada };
  });
