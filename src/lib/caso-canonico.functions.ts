import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo, payloadServico, rascunhoDaAcao, type Linha } from "@/lib/caso-canonico.server";
import { mapaDaAcao } from "@/lib/caso-ficha";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Catálogos, serviços, etiquetas, alertas, comunicação e onboarding do caso. */
export const carregarCanonico = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const eq = (t: string) => supabase.from(t).select("*").eq("organization_id", organizationId);

    const [produtos, trilhas, servicos, taxonomia, etiquetas, alertas, comunicacoes, onboarding, nucleos, entregas] =
      await Promise.all([
        eq("product_catalog").is("archived_at", null).order("nome_comercial"),
        eq("citizenship_tracks").is("archived_at", null).order("pais"),
        eq("case_services").eq("case_id", data.caseId).is("archived_at", null).order("created_at"),
        eq("label_taxonomy").eq("active", true).order("sort_order"),
        eq("entity_labels").eq("entity_id", data.caseId).is("removed_at", null),
        eq("case_alerts").eq("case_id", data.caseId).order("triggered_at", { ascending: false }),
        eq("communication_queue").eq("case_id", data.caseId).order("created_at", { ascending: false }),
        eq("onboarding_checklist").eq("case_id", data.caseId).order("ordem"),
        eq("nucleos_familiares").eq("case_id", data.caseId).is("archived_at", null),
        eq("client_deliverables").eq("case_id", data.caseId).is("archived_at", null).order("created_at"),
      ]);

    const nucleoIds = ((nucleos.data ?? []) as Linha[]).map((n) => n.id);
    const membrosNucleo = nucleoIds.length
      ? await supabase.from("nucleo_membros").select("*").in("nucleo_id", nucleoIds).is("archived_at", null)
      : { data: [] };

    return {
      produtos: (produtos.data ?? []) as Linha[],
      trilhas: (trilhas.data ?? []) as Linha[],
      servicos: (servicos.data ?? []) as Linha[],
      taxonomia: (taxonomia.data ?? []) as Linha[],
      etiquetas: (etiquetas.data ?? []) as Linha[],
      alertas: (alertas.data ?? []) as Linha[],
      comunicacoes: (comunicacoes.data ?? []) as Linha[],
      onboarding: (onboarding.data ?? []) as Linha[],
      nucleos: (nucleos.data ?? []) as Linha[],
      membrosNucleo: ((membrosNucleo as any).data ?? []) as Linha[],
      entregas: (entregas.data ?? []) as Linha[],
    };
  });

/** Cria ou atualiza o case service (produto-pai + trilha + escopo + condição comercial). */
export const salvarCaseService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; id?: string; dados: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const payload = payloadServico(data.dados);

    // Preço vem sempre do catálogo homologado, nunca da tela.
    if (payload["product_catalog_id"]) {
      const prod = await supabase
        .from("product_catalog")
        .select("preco_comercial_vigente, condicao_comercial_padrao")
        .eq("id", payload["product_catalog_id"])
        .eq("organization_id", organizationId)
        .maybeSingle();
      payload["preco_acordado"] = prod.data?.preco_comercial_vigente ?? null;
      payload["preco_somente_leitura"] = true;
    }

    if (data.id) {
      const { data: linhas, error } = await supabase
        .from("case_services")
        .update({ ...payload, updated_by: context.userId })
        .eq("id", data.id)
        .eq("organization_id", organizationId)
        .select("id");
      if (error) throw new Error(error.message);
      if (!linhas?.length) throw new Error("Nada foi gravado: seu papel não permite editar este serviço.");
      return { id: data.id, salvoEm: new Date().toISOString() };
    }

    const { data: linha, error } = await supabase
      .from("case_services")
      .insert({
        ...payload,
        case_id: data.caseId,
        organization_id: organizationId,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string, salvoEm: new Date().toISOString() };
  });

/** Aplica etiqueta canônica (nunca cria etiqueta livre fora da taxonomia). */
export const aplicarEtiqueta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entityType: string; entityId: string; labelId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const existe = await supabase
      .from("label_taxonomy")
      .select("id")
      .eq("id", data.labelId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!existe.data) throw new Error("Etiqueta fora da taxonomia canônica.");
    const { error } = await supabase.from("entity_labels").insert({
      organization_id: organizationId,
      label_id: data.labelId,
      entity_type: data.entityType,
      entity_id: data.entityId,
      applied_by: context.userId,
      source: "desk_manual",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removerEtiqueta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const { error } = await supabase
      .from("entity_labels")
      .update({ removed_at: new Date().toISOString(), removed_by: context.userId })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Registra a próxima ação: alerta interno sempre; rascunho de comunicação
 * quando o público é externo. Nenhum envio externo é executado.
 */
export const registrarProximaAcao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const caso = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");
    const c = caso.data as Linha;
    if (!c.proxima_acao_codigo) throw new Error("Defina a próxima ação antes de registrar o alerta.");
    if (!c.prazo_proxima_acao) throw new Error("Defina o prazo da próxima ação.");
    if (!c.responsavel_principal) throw new Error("Defina o responsável principal.");

    const mapa = mapaDaAcao(c.proxima_acao_codigo);
    const externo = c.target_audience && c.target_audience !== "interno_tatiana";

    await supabase.from("case_alerts").insert({
      organization_id: organizationId,
      case_id: data.caseId,
      tipo: "proxima_acao",
      criticidade: "atencao",
      titulo: `Próxima ação: ${c.proxima_acao ?? c.proxima_acao_codigo}`,
      detalhe: `Responsável: ${c.responsavel_principal}. Público: ${c.target_audience}. Canal sugerido: ${c.suggested_channel}.`,
      status: "pending",
      due_at: new Date(`${c.prazo_proxima_acao}T12:00:00-03:00`).toISOString(),
    });

    let comunicacaoId: string | null = null;
    if (externo && mapa.rascunhoWhatsapp) {
      const modelo = rascunhoDaAcao(String(c.proxima_acao_codigo));
      const { data: q, error } = await supabase
        .from("communication_queue")
        .insert({
          organization_id: organizationId,
          case_id: data.caseId,
          acao_codigo: c.proxima_acao_codigo,
          target_audience: c.target_audience,
          visibility: c.visibility,
          suggested_channel: c.suggested_channel,
          assunto: modelo.assunto,
          corpo_rascunho: modelo.corpo,
          status: "awaiting_approval",
          requires_human_approval: true,
          created_by: context.userId,
          observacao_interna: "Rascunho criado pelo Desk. Envio externo depende de aprovação humana.",
        })
        .select("id")
        .maybeSingle();
      if (error) throw new Error(error.message);
      comunicacaoId = (q?.id as string) ?? null;
    }

    await supabase
      .from("crm_casos")
      .update({
        alert_status: "alerted",
        alert_triggered_at: new Date().toISOString(),
        communication_status: comunicacaoId ? "awaiting_approval" : "not_applicable",
        communication_queue_id: comunicacaoId,
        updated_by: context.userId,
      })
      .eq("id", data.caseId)
      .eq("organization_id", organizationId);

    return { ok: true, comunicacaoId, rascunhoCriado: Boolean(comunicacaoId) };
  });

export const atualizarAlerta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "acknowledged") {
      patch["acknowledged_at"] = new Date().toISOString();
      patch["acknowledged_by"] = context.userId;
    }
    if (data.status === "completed") patch["completed_at"] = new Date().toISOString();
    const { error } = await supabase
      .from("case_alerts")
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Aprova o rascunho — aprovação é registro interno; não há envio nesta entrega. */
export const aprovarRascunho = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; corpo?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const { error } = await supabase
      .from("communication_queue")
      .update({
        corpo_rascunho: data.corpo,
        status: "approved",
        approved_at: new Date().toISOString(),
        approved_by: context.userId,
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true, enviado: false };
  });

export const atualizarItemOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string; observacao?: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const { error } = await supabase
      .from("onboarding_checklist")
      .update({
        status: data.status,
        observacao: data.observacao ?? null,
        concluido_em: data.status === "concluido" ? new Date().toISOString() : null,
        concluido_por: data.status === "concluido" ? context.userId : null,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true, salvoEm: new Date().toISOString() };
  });

/** Taxonomia completa + mapa de equivalência com o Meta Agent (sem sincronizar). */
export const carregarMapaEtiquetas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const [taxonomia, aplicadas] = await Promise.all([
      supabase.from("label_taxonomy").select("*").eq("organization_id", organizationId).order("sort_order"),
      supabase.from("entity_labels").select("label_id").eq("organization_id", organizationId).is("removed_at", null),
    ]);
    const uso = new Map<string, number>();
    for (const a of (aplicadas.data ?? []) as Linha[]) uso.set(a.label_id, (uso.get(a.label_id) ?? 0) + 1);
    return {
      taxonomia: ((taxonomia.data ?? []) as Linha[]).map((l) => ({ ...l, aplicacoes: uso.get(l.id) ?? 0 })),
    };
  });
