import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_ITEM = [
  "case_id",
  "research_item_id",
  "document_request_id",
  "evidence_id",
  "finding_id",
  "institution_id",
  "action_type",
  "titulo",
  "priority",
  "reason",
  "status",
  "due_date",
  "responsible_user_id",
  "suggested_channel",
  "communication_draft",
  "contacted_at",
  "contact_result_internal",
  "next_action",
  "next_check_at",
  "estimated_cost_amount",
  "estimated_cost_currency",
  "expense_approval_status",
  "payer",
  "internal_evidence_link",
  "notes_internal",
];

const CAMPOS_INSTITUICAO = [
  "name",
  "institution_type",
  "country",
  "city",
  "email",
  "phone",
  "opening_hours",
  "preferred_channel",
  "operational_instruction",
  "contact_source",
  "last_verified_at",
  "verified_by",
  "update_status",
  "notes_internal",
];

const CAMPOS_ESTIMATIVA = [
  "case_id",
  "research_action_plan_item_id",
  "institution_id",
  "expense_type",
  "quantity",
  "unit_price_min",
  "unit_price_max",
  "currency",
  "estimated_wait_days_min",
  "estimated_wait_days_max",
  "estimate_source",
  "client_approval_status",
  "payer",
  "notes_internal",
];

function filtrar(campos: string[], entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of campos) if (c in entrada) out[c] = entrada[c] === "" ? null : entrada[c];
  return out;
}

/** Painel interno do plano de ação: itens, instituições, previsões e alertas. */
export const painelPlanoAcao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa o plano de ação de pesquisa.");

    const org = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);
    const [itens, instituicoes, estimativas, alertas, rascunhos, interacoes, caso] = await Promise.all([
      org("research_action_plan_items").eq("case_id", data.caseId).order("due_date", { ascending: true }),
      org("institutions").is("archived_at", null).order("name", { ascending: true }),
      org("expense_estimates").eq("case_id", data.caseId).is("archived_at", null),
      org("case_alerts").eq("case_id", data.caseId).eq("tipo", "plano_acao_critico").eq("status", "pending"),
      org("communication_queue").eq("case_id", data.caseId).eq("acao_codigo", "g07_plano_acao"),
      org("crm_interactions").eq("case_id", data.caseId).order("ocorrido_em", { ascending: false }),
      supabase.from("crm_casos").select("id,codigo,titulo,pais").eq("id", data.caseId).maybeSingle(),
    ]);

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      caso: caso.data ?? null,
      itens: (itens.data ?? []) as Record<string, any>[],
      instituicoes: (instituicoes.data ?? []) as Record<string, any>[],
      estimativas: (estimativas.data ?? []) as Record<string, any>[],
      alertas: (alertas.data ?? []) as Record<string, any>[],
      rascunhos: (rascunhos.data ?? []) as Record<string, any>[],
      interacoes: (interacoes.data ?? []) as Record<string, any>[],
    };
  });

async function autorizarEscrita(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode editar o plano de ação de pesquisa.");
  return organizationId;
}

export const salvarItemPlano = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_ITEM, data.valores);

    const r = data.id
      ? await supabase.from("research_action_plan_items").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("research_action_plan_items")
          .insert({ ...valores, organization_id: organizationId, requires_human_approval: true })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

export const salvarInstituicao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_INSTITUICAO, data.valores);

    const r = data.id
      ? await supabase.from("institutions").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("institutions")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

export const salvarEstimativa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const valores = filtrar(CAMPOS_ESTIMATIVA, data.valores);

    const r = data.id
      ? await supabase.from("expense_estimates").update(valores).eq("id", data.id).select("id").maybeSingle()
      : await supabase
          .from("expense_estimates")
          .insert({ ...valores, organization_id: organizationId })
          .select("id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

/** Sem exclusão física: apenas arquivamento com motivo. */
export const arquivarRegistroG07 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: { tabela: "research_action_plan_items" | "institutions" | "expense_estimates"; id: string; motivo: string }) => d,
  )
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

/**
 * G-07B — pendências críticas de pesquisa para o Painel Hoje.
 * Somente leitura: crítica, prazo hoje/vencido, aberta e sem fixture.
 */
export const pendenciasCriticasPainel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) return { itens: [] as Record<string, any>[], casos: [] as Record<string, any>[] };

    const hoje = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("research_action_plan_items")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("priority", "critica")
      .is("archived_at", null)
      .not("due_date", "is", null)
      .lte("due_date", hoje)
      .order("due_date", { ascending: true });

    const itens = ((data ?? []) as Record<string, any>[]).filter(
      (i) => i.status !== "concluida" && i.status !== "cancelada" && i.data_origin !== "fixture_demo" && i.data_origin !== "development_fixture",
    );
    const ids = [...new Set(itens.map((i) => i.case_id).filter(Boolean))];
    const casos = ids.length
      ? ((await supabase.from("crm_casos").select("id,codigo,titulo").in("id", ids)).data ?? [])
      : [];
    return { itens, casos: casos as Record<string, any>[] };
  });
