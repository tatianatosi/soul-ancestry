import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  avaliarCadencia,
  derivarEstadoCaso,
  diagnosticarOnboarding,
  esperaExternaSuspendeAlerta,
  podeAtivarCaso,
  podeIniciarOnboarding,
  projetarEntregasCliente,
  saudeDoPlano,
  CHECKLIST_ONBOARDING_PADRAO,
  contemConteudoInterno,
  diasEntre,
} from "@/lib/onboarding-jornada";

type Cliente = {
  from: (t: string) => any;
};

async function resolverOrg(supabase: Cliente, userId: string): Promise<string> {
  const r = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).limit(1).maybeSingle();
  if (!r.data?.organization_id) throw new Error("Usuário sem organização.");
  return r.data.organization_id as string;
}

async function auditar(
  supabase: Cliente,
  org: string,
  userId: string,
  acao: string,
  entidade: string,
  entidadeId: string | null,
  metadados: Record<string, unknown>,
) {
  await supabase.from("audit_logs").insert({
    organization_id: org,
    ator_id: userId,
    acao,
    entidade,
    entidade_id: entidadeId,
    metadados,
  });
}

async function carregarContexto(supabase: Cliente, org: string, caseId: string) {
  const [caso, checklist, plano, espera, entregas, alertas, touchpoints] = await Promise.all([
    supabase.from("crm_casos").select("*").eq("organization_id", org).eq("id", caseId).maybeSingle(),
    supabase.from("onboarding_checklist").select("*").eq("organization_id", org).eq("case_id", caseId),
    supabase
      .from("case_plans")
      .select("*")
      .eq("organization_id", org)
      .eq("case_id", caseId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
    supabase
      .from("case_espera_externa")
      .select("*")
      .eq("organization_id", org)
      .eq("case_id", caseId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false }),
    supabase.from("client_deliverables").select("*").eq("organization_id", org).eq("case_id", caseId),
    supabase
      .from("case_alerts")
      .select("*")
      .eq("organization_id", org)
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("touchpoints")
      .select("*")
      .eq("case_id", caseId)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  if (!caso.data) throw new Error("Caso não encontrado nesta organização.");
  return {
    caso: caso.data as Record<string, any>,
    checklist: (checklist.data ?? []) as Record<string, any>[],
    planos: (plano.data ?? []) as Record<string, any>[],
    esperas: (espera.data ?? []) as Record<string, any>[],
    entregas: (entregas.data ?? []) as Record<string, any>[],
    alertas: (alertas.data ?? []) as Record<string, any>[],
    ultimoTouchpoint: ((touchpoints.data ?? [])[0] ?? null) as Record<string, any> | null,
  };
}

function montarDiagnostico(ctx: Awaited<ReturnType<typeof carregarContexto>>) {
  const planoAtivo = ctx.planos.find((p) => p["status"] === "ativo") ?? null;
  const esperaAtiva = ctx.esperas.find((e) => esperaExternaSuspendeAlerta(e)) ?? null;

  const diag = diagnosticarOnboarding(ctx.caso as never, {
    checklist: ctx.checklist as never,
    plano: planoAtivo as never,
    nucleoValidado: Boolean(ctx.caso["nucleo_id"] ?? ctx.caso["nucleo_familiar_validado"]),
    participantesVinculados: Boolean(ctx.caso["cliente_id"]),
    representacaoOk: ctx.caso["possui_menor"] ? Boolean(ctx.caso["representacao_documentada"]) : true,
    escopoAprovado: Boolean(ctx.caso["escopo_aprovado"] ?? ctx.caso["case_service_id"]),
    checklistDocumentalCriado: ctx.checklist.some((c) => c["item_code"] === "checklist_documental"),
    bloqueiosExternos: [],
  });

  const ultimoTouch =
    (ctx.ultimoTouchpoint?.["created_at"] as string | undefined) ??
    (planoAtivo?.["ultima_atualizacao_cliente_em"] as string | undefined) ??
    (ctx.caso["onboarding_iniciado_em"] as string | undefined) ??
    null;

  const cadencia = avaliarCadencia({
    onboardingIniciadoEm: ctx.caso["onboarding_iniciado_em"] ?? null,
    primeiraMicroentregaPlanejada: Boolean(planoAtivo?.["proxima_microentrega"]),
    ultimoTouchpointEm: ultimoTouch,
    ultimaAtualizacaoClienteEm: planoAtivo?.["ultima_atualizacao_cliente_em"] ?? null,
    esperaExternaAtiva: Boolean(esperaAtiva),
  });

  const dias = diasEntre(ultimoTouch) ?? 0;

  return {
    diagnostico: diag,
    estado_derivado: derivarEstadoCaso(ctx.caso as never, diag, { plano: planoAtivo as never }),
    plano: planoAtivo,
    planos: ctx.planos,
    espera_externa: esperaAtiva,
    esperas: ctx.esperas,
    checklist: ctx.checklist,
    alertas_cadencia: cadencia,
    alertas_registrados: ctx.alertas,
    dias_sem_touchpoint: dias,
    saude: saudeDoPlano(dias),
    entregas: ctx.entregas,
    caso: ctx.caso,
  };
}

/* -------------------------------------------------------------- leituras */

export const obterJornadaCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const ctx = await carregarContexto(supabase, org, data.caseId);
    return montarDiagnostico(ctx);
  });

export const obterPainelJornada = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);

    const [casos, planos, checklist, entregas, esperas] = await Promise.all([
      supabase.from("crm_casos").select("*").eq("organization_id", org).is("archived_at", null),
      supabase.from("case_plans").select("*").eq("organization_id", org).is("archived_at", null),
      supabase.from("onboarding_checklist").select("*").eq("organization_id", org),
      supabase.from("client_deliverables").select("*").eq("organization_id", org),
      supabase.from("case_espera_externa").select("*").eq("organization_id", org).is("archived_at", null),
    ]);

    const listaCasos = (casos.data ?? []) as Record<string, any>[];
    const listaPlanos = (planos.data ?? []) as Record<string, any>[];
    const listaChecklist = (checklist.data ?? []) as Record<string, any>[];
    const listaEntregas = (entregas.data ?? []) as Record<string, any>[];

    let bloqueados = 0;
    let semProximaAcao = 0;
    let semMicroentrega = 0;
    let semTouchpoint10 = 0;
    let semAtualizacao14 = 0;
    const detalhes: {
      case_id: string;
      codigo: string | null;
      estado: string;
      diagnostico: string;
      proxima_acao: string | null;
      prazo: string | null;
      alertas: string[];
    }[] = [];

    for (const caso of listaCasos) {
      const plano = listaPlanos.find((p) => p["case_id"] === caso["id"] && p["status"] === "ativo") ?? null;
      const esperaAtiva =
        ((esperas.data ?? []) as Record<string, any>[]).find(
          (e) => e["case_id"] === caso["id"] && esperaExternaSuspendeAlerta(e),
        ) ?? null;
      const itens = listaChecklist.filter((c) => c["case_id"] === caso["id"]);
      const diag = diagnosticarOnboarding(caso as never, { checklist: itens as never, plano: plano as never });
      const estado = derivarEstadoCaso(caso as never, diag, { plano: plano as never });
      const cadencia = avaliarCadencia({
        onboardingIniciadoEm: caso["onboarding_iniciado_em"] ?? null,
        primeiraMicroentregaPlanejada: Boolean(plano?.["proxima_microentrega"]),
        ultimoTouchpointEm: plano?.["ultima_atualizacao_cliente_em"] ?? caso["onboarding_iniciado_em"] ?? null,
        ultimaAtualizacaoClienteEm: plano?.["ultima_atualizacao_cliente_em"] ?? null,
        esperaExternaAtiva: Boolean(esperaAtiva),
      });

      if (diag.bloqueios.length) bloqueados += 1;
      if (!plano?.["proxima_acao"] && !caso["proxima_acao"]) semProximaAcao += 1;
      if (!plano?.["proxima_microentrega"]) semMicroentrega += 1;
      if (cadencia.some((a) => a.regra === "D10")) semTouchpoint10 += 1;
      if (cadencia.some((a) => a.regra === "D14")) semAtualizacao14 += 1;

      detalhes.push({
        case_id: String(caso["id"]),
        codigo: caso["codigo"] ?? null,
        estado,
        diagnostico: diag.status,
        proxima_acao: diag.proxima_acao,
        prazo: diag.prazo,
        alertas: cadencia.map((a) => a.titulo),
      });
    }

    const emOnboarding = listaCasos.filter((c) => c["eixo_operacao"] === "onboarding_iniciado").length;
    const ativos = listaCasos.filter((c) => c["eixo_operacao"] === "caso_ativo").length;
    const entregasPendentesAprovacao = listaEntregas.filter(
      (e) => e["approval_status"] === "em_revisao" || e["approval_status"] === "rascunho",
    ).length;
    const entregasPublicadas = listaEntregas.filter((e) => e["approval_status"] === "publicado").length;

    return {
      contadores: {
        casos_em_onboarding: emOnboarding,
        casos_ativos: ativos,
        casos_bloqueados: bloqueados,
        sem_proxima_acao: semProximaAcao,
        sem_microentrega_planejada: semMicroentrega,
        sem_touchpoint_10d: semTouchpoint10,
        sem_atualizacao_14d: semAtualizacao14,
        entregas_aguardando_aprovacao: entregasPendentesAprovacao,
        entregas_publicadas: entregasPublicadas,
      },
      casos: detalhes,
    };
  });

/* ------------------------------------------------------------- transições */

export const criarChecklistOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const ctx = await carregarContexto(supabase, org, data.caseId);

    const existentes = new Set(ctx.checklist.map((c) => c["item_code"]));
    const novos = CHECKLIST_ONBOARDING_PADRAO.filter((i) => !existentes.has(i.item_codigo)).map((i) => ({
      organization_id: org,
      case_id: data.caseId,
      item_code: i.item_codigo,
      titulo: i.titulo,
      descricao_interna: i.descricao_interna,
      obrigatorio: i.obrigatorio,
      status: "pendente",
    }));
    if (!novos.length) return { criados: 0 };

    const r = await supabase.from("onboarding_checklist").insert(novos).select("id");
    if (r.error) throw new Error(r.error.message);
    await auditar(supabase, org, context.userId, "checklist_onboarding_criado", "crm_casos", data.caseId, {
      criados: novos.length,
    });
    return { criados: novos.length };
  });

export const atualizarItemChecklist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      itemId: string;
      status: string;
      responsavelUserId?: string | null;
      evidenciaReferenciaInterna?: string | null;
      bloqueioCodigo?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    if (data.status === "bloqueado" && !data.bloqueioCodigo?.trim()) {
      throw new Error("Item bloqueado exige código de bloqueio.");
    }
    const r = await supabase
      .from("onboarding_checklist")
      .update({
        status: data.status,
        responsavel_user_id: data.responsavelUserId ?? null,
        evidencia_referencia_interna: data.evidenciaReferenciaInterna ?? null,
        bloqueio_codigo: data.bloqueioCodigo ?? null,
      })
      .eq("organization_id", org)
      .eq("id", data.itemId)
      .select("id,case_id,item_code,status")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Item não encontrado ou sem permissão de escrita.");
    await auditar(supabase, org, context.userId, "checklist_item_atualizado", "onboarding_checklist", data.itemId, {
      status: data.status,
    });
    return r.data;
  });

export const salvarPlanoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      faseJornada: string;
      marcoAtual?: string | null;
      responsavelUserId: string;
      proximaAcao: string;
      prazoProximaAcao: string;
      proximaMicroentrega?: string | null;
      entregaRobustaAtual?: string | null;
      proximaAtualizacaoLimiteEm?: string | null;
      pendenciasCliente?: string[];
      pendenciasInternas?: string[];
      observacaoInterna?: string | null;
      ativar?: boolean;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    if (!data.responsavelUserId || !data.proximaAcao?.trim() || !data.prazoProximaAcao) {
      throw new Error("Plano exige responsável, próxima ação e prazo.");
    }

    const existente = await supabase
      .from("case_plans")
      .select("id")
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .eq("fase_jornada", data.faseJornada)
      .is("archived_at", null)
      .maybeSingle();

    const payload = {
      organization_id: org,
      case_id: data.caseId,
      fase_jornada: data.faseJornada,
      marco_atual: data.marcoAtual ?? null,
      responsavel_user_id: data.responsavelUserId,
      proxima_acao: data.proximaAcao.trim(),
      prazo_proxima_acao: data.prazoProximaAcao,
      proxima_microentrega: data.proximaMicroentrega ?? null,
      entrega_robusta_atual: data.entregaRobustaAtual ?? null,
      proxima_atualizacao_limite_em: data.proximaAtualizacaoLimiteEm ?? null,
      pendencias_cliente: data.pendenciasCliente ?? [],
      pendencias_internas: data.pendenciasInternas ?? [],
      observacao_interna: data.observacaoInterna ?? null,
      status: data.ativar ? "ativo" : "rascunho",
      updated_by: context.userId,
    };

    const r = existente.data?.id
      ? await supabase.from("case_plans").update(payload).eq("id", existente.data.id).select("*").maybeSingle()
      : await supabase
          .from("case_plans")
          .insert({ ...payload, created_by: context.userId })
          .select("*")
          .maybeSingle();

    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Plano não foi gravado. Verifique permissão de escrita.");
    await auditar(supabase, org, context.userId, "plano_caso_salvo", "case_plans", r.data.id, {
      fase: data.faseJornada,
      status: payload.status,
    });
    return r.data;
  });

export const iniciarOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const ctx = await carregarContexto(supabase, org, data.caseId);
    const resumo = montarDiagnostico(ctx);
    const permitido = podeIniciarOnboarding(resumo.diagnostico);
    if (!permitido.ok) throw new Error(permitido.motivo ?? "Onboarding bloqueado.");

    const r = await supabase
      .from("crm_casos")
      .update({
        eixo_operacao: "onboarding_iniciado",
        onboarding_iniciado_em: new Date().toISOString(),
        onboarding_iniciado_por: context.userId,
      })
      .eq("organization_id", org)
      .eq("id", data.caseId)
      .select("id,eixo_operacao,onboarding_iniciado_em")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Não foi possível iniciar o onboarding.");
    await auditar(supabase, org, context.userId, "onboarding_iniciado", "crm_casos", data.caseId, {
      gates_ok: resumo.diagnostico.gates_ok.length,
    });
    return r.data;
  });

export const ativarCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const ctx = await carregarContexto(supabase, org, data.caseId);
    const resumo = montarDiagnostico(ctx);
    const permitido = podeAtivarCaso(ctx.caso as never, resumo.diagnostico);
    if (!permitido.ok) throw new Error(permitido.motivo ?? "Ativação bloqueada.");

    const r = await supabase
      .from("crm_casos")
      .update({ eixo_operacao: "caso_ativo" })
      .eq("organization_id", org)
      .eq("id", data.caseId)
      .select("id,eixo_operacao")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Não foi possível ativar o caso.");
    await auditar(supabase, org, context.userId, "caso_ativado", "crm_casos", data.caseId, {});
    return r.data;
  });

export const registrarEsperaExterna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      motivo: string;
      responsavelUserId: string;
      prazoRechecagem: string;
      observacaoInterna?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    if (!data.motivo?.trim() || !data.responsavelUserId || !data.prazoRechecagem) {
      throw new Error("Espera externa exige motivo, responsável e prazo de rechecagem.");
    }
    const r = await supabase
      .from("case_espera_externa")
      .insert({
        organization_id: org,
        case_id: data.caseId,
        motivo: data.motivo.trim(),
        responsavel_user_id: data.responsavelUserId,
        prazo_rechecagem: data.prazoRechecagem,
        ultima_atualizacao_contextualizada_em: new Date().toISOString(),
        observacao_interna: data.observacaoInterna ?? null,
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("*")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    await auditar(supabase, org, context.userId, "espera_externa_registrada", "case_espera_externa", r.data?.id ?? null, {
      case_id: data.caseId,
    });
    return r.data;
  });

/* -------------------------------------------------------------- entregas */

export const salvarEntregaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      deliverableId?: string | null;
      tipo: string;
      fase: string;
      tituloCliente: string;
      resumoAprovado: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    if (contemConteudoInterno(data.tituloCliente) || contemConteudoInterno(data.resumoAprovado)) {
      throw new Error("Texto contém conteúdo interno (preço, fonte, hipótese, evidência ou contrato).");
    }
    const payload = {
      organization_id: org,
      case_id: data.caseId,
      deliverable_type: data.tipo,
      journey_phase: data.fase,
      title_client: data.tituloCliente.trim(),
      summary_approved: data.resumoAprovado.trim(),
      approval_status: "em_revisao",
    };
    const r = data.deliverableId
      ? await supabase
          .from("client_deliverables")
          .update(payload)
          .eq("organization_id", org)
          .eq("id", data.deliverableId)
          .select("*")
          .maybeSingle()
      : await supabase.from("client_deliverables").insert(payload).select("*").maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Entrega não foi gravada.");
    await auditar(supabase, org, context.userId, "entrega_salva", "client_deliverables", r.data.id, {
      status: "em_revisao",
    });
    return r.data;
  });

export const aprovarEntregaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { deliverableId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const r = await supabase
      .from("client_deliverables")
      .update({ approval_status: "aprovado", approved_by: context.userId, approved_at: new Date().toISOString() })
      .eq("organization_id", org)
      .eq("id", data.deliverableId)
      .select("*")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Entrega não encontrada.");
    await auditar(supabase, org, context.userId, "entrega_aprovada", "client_deliverables", data.deliverableId, {});
    return r.data;
  });

export const publicarEntregaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { deliverableId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const atual = await supabase
      .from("client_deliverables")
      .select("*")
      .eq("organization_id", org)
      .eq("id", data.deliverableId)
      .maybeSingle();
    if (!atual.data) throw new Error("Entrega não encontrada.");
    if (atual.data.approval_status !== "aprovado" || !atual.data.approved_by) {
      throw new Error("Publicação exige aprovação humana registrada.");
    }
    if (contemConteudoInterno(atual.data.summary_approved) || contemConteudoInterno(atual.data.title_client)) {
      throw new Error("Conteúdo não sanitizado. Publicação bloqueada.");
    }
    const r = await supabase
      .from("client_deliverables")
      .update({ approval_status: "publicado", published_at: new Date().toISOString() })
      .eq("organization_id", org)
      .eq("id", data.deliverableId)
      .select("*")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data) throw new Error("Entrega não foi publicada. Verifique permissão de escrita.");
    await auditar(supabase, org, context.userId, "entrega_publicada", "client_deliverables", data.deliverableId, {});
    return r.data;
  });

export const listarEntregasPublicadas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);
    const r = await supabase
      .from("client_deliverables")
      .select("*")
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .eq("approval_status", "publicado");
    return projetarEntregasCliente((r.data ?? []) as never, data.caseId);
  });
