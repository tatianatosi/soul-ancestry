import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import {
  CHECKLIST_INICIAL_PADRAO,
  checklistComGates,
  estadoDoPlano,
  motivosBloqueio,
  planoAcaoDosTouchpoints,
  primeiraMicroentregaReal,
  titulosTarefasDosGates,
  TITULO_PRIMEIRA_MICROENTREGA,
  TOUCHPOINTS_PADRAO,
  type DerivadosChecklist,
  type GatesPlano,
  type ItemChecklistOnboarding,
} from "@/lib/onboarding-plano";
import { dossieMaeDoCaso } from "@/lib/nucleo-completude";
import { garantirTarefaAberta } from "@/lib/tarefa-garantida.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function lerPlanoOnboarding(
  supabase: any,
  organizationId: string,
  caseId: string,
) {
  return supabase
    .from("onboarding_planos")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .is("archived_at", null)
    .maybeSingle();
}

/**
 * Garante uma linha em `onboarding_planos` (UNIQUE case_id).
 * Não ativa cliente, não envia mensagem, não abre pesquisa externa.
 */
async function garantirPlanoOnboarding(
  supabase: any,
  input: {
    organizationId: string;
    caseId: string;
    userId: string;
    gates: GatesPlano;
    responsavel: string | null;
  },
) {
  const existente = await lerPlanoOnboarding(supabase, input.organizationId, input.caseId);
  if (existente.data) return existente.data as Record<string, any>;

  const motivos = motivosBloqueio(input.gates);
  const estado = estadoDoPlano(input.gates, null);
  const { data: criado, error } = await supabase
    .from("onboarding_planos")
    .insert({
      organization_id: input.organizationId,
      case_id: input.caseId,
      estado,
      motivos_bloqueio: motivos,
      responsavel_principal: input.responsavel,
      touchpoints: TOUCHPOINTS_PADRAO,
      checklist_inicial: checklistComGates(input.gates, CHECKLIST_INICIAL_PADRAO),
      plano_acao: planoAcaoDosTouchpoints(),
      created_by: input.userId,
      updated_by: input.userId,
    })
    .select("*")
    .maybeSingle();

  if (criado) {
    await espelharMotivosBloqueioEmCasePlans(supabase, {
      organizationId: input.organizationId,
      caseId: input.caseId,
      motivos,
      userId: input.userId,
    });
    return criado as Record<string, any>;
  }

  const corrida = await lerPlanoOnboarding(supabase, input.organizationId, input.caseId);
  if (corrida.data) return corrida.data as Record<string, any>;
  throw new Error(error?.message ?? "NENHUMA_LINHA_AFETADA: não foi possível criar o plano de onboarding.");
}

/**
 * Espelha `motivos_bloqueio` (o único campo do gate que este escritor de
 * fato grava, entre os que a migration 2026-09-24 replicou em case_plans)
 * para a linha de case_plans com fase_jornada = 'onboarding', quando ela já
 * existe. Decisão da Proprietária (2026-09-24, opção "migrar case_plans"):
 * case_plans passa a também carregar o gate, mas os leitores
 * (fechamento-caso.functions.ts, case-service-consolidacao.functions.ts,
 * cadencia-onboarding.ts) continuam em onboarding_planos até um corte
 * seguinte confirmar o backfill histórico — por isso este espelhamento é
 * best-effort e nunca derruba a escrita real em onboarding_planos: se a
 * linha de case_plans daquela fase ainda não existe (ela é criada por
 * outros motores, não por este), não cria uma aqui, só não espelha ainda.
 */
async function espelharMotivosBloqueioEmCasePlans(
  supabase: any,
  input: { organizationId: string; caseId: string; motivos: string[]; userId: string },
) {
  try {
    await supabase
      .from("case_plans")
      .update({ motivos_bloqueio: input.motivos, updated_by: input.userId })
      .eq("organization_id", input.organizationId)
      .eq("case_id", input.caseId)
      .eq("fase_jornada", "onboarding")
      .is("archived_at", null);
  } catch {
    // Best-effort: onboarding_planos continua sendo a fonte real até o
    // corte de corte dos leitores. Uma falha aqui nunca deve invalidar a
    // escrita do gate de onboarding em si.
  }
}

/**
 * 24/09/2026 — corte D: os itens "Dossiê-mãe identificado" e "Primeira
 * micro-entrega planejada" do checklist passam a vir do dado real (núcleo
 * do caso e ops_microentregas), nunca de marcação manual.
 */
async function derivadosDoCaso(
  supabase: any,
  organizationId: string,
  caseId: string,
): Promise<DerivadosChecklist> {
  const [micro, nucleo, caso] = await Promise.all([
    supabase
      .from("ops_microentregas")
      .select("id,status,archived_at")
      .eq("organization_id", organizationId)
      .eq("caso_id", caseId)
      .is("archived_at", null),
    supabase
      .from("nucleos_familiares")
      .select("id,dossie_mae,dossie_status")
      .eq("organization_id", organizationId)
      .eq("case_id", caseId)
      .is("archived_at", null)
      .maybeSingle(),
    supabase
      .from("crm_casos")
      .select("dossie_mae_referencia")
      .eq("organization_id", organizationId)
      .eq("id", caseId)
      .maybeSingle(),
  ]);
  return {
    primeiraMicroentrega: primeiraMicroentregaReal(micro.data ?? []),
    dossieMaeAtivo: dossieMaeDoCaso(nucleo.data ?? null, caso.data?.dossie_mae_referencia ?? null).ativo,
  };
}

/** Plano de onboarding do caso: leitura. Nunca ativa cliente. */
export const carregarPlanoOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const [plano, caso, comunicacoes, microentregas] = await Promise.all([
      lerPlanoOnboarding(supabase, organizationId, data.caseId),
      supabase
        .from("crm_casos")
        .select("id,codigo,contrato_assinado,pagamento_confirmado,responsavel_principal")
        .eq("organization_id", organizationId)
        .eq("id", data.caseId)
        .maybeSingle(),
      supabase
        .from("communication_queue")
        .select("id,acao_codigo,assunto,corpo_rascunho,status,requires_human_approval,sent_at")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .eq("status", "draft")
        .order("created_at", { ascending: true }),
      supabase
        .from("v_ops_microentregas")
        .select("id,titulo,fase,status,prazo,concluida_em,prazo_status,evidencia_url")
        .eq("organization_id", organizationId)
        .eq("caso_id", data.caseId)
        .is("archived_at", null)
        .order("prazo", { ascending: true, nullsFirst: false }),
    ]);

    const gates = {
      contrato_assinado: Boolean(caso.data?.contrato_assinado),
      pagamento_confirmado: Boolean(caso.data?.pagamento_confirmado),
    };

    return {
      plano: (plano.data ?? null) as Record<string, any> | null,
      gates,
      motivos: motivosBloqueio(gates),
      estadoCalculado: estadoDoPlano(gates, plano.data?.estado ?? null),
      rascunhos: (comunicacoes.data ?? []) as Record<string, any>[],
      microentregas: (microentregas.data ?? []) as Record<string, any>[],
    };
  });

/** Recalcula o estado do plano a partir dos gates reais. Cria a linha se faltar. Nunca libera envio nem ativa o caso. */
export const recalcularPlanoOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const caso = await supabase
      .from("crm_casos")
      .select("contrato_assinado,pagamento_confirmado,responsavel_principal")
      .eq("organization_id", organizationId)
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const gates = {
      contrato_assinado: Boolean(caso.data.contrato_assinado),
      pagamento_confirmado: Boolean(caso.data.pagamento_confirmado),
    };
    const motivos = motivosBloqueio(gates);
    const estado = estadoDoPlano(gates, motivos.length > 0 ? "bloqueado" : "liberado_preparacao");

    const plano = await garantirPlanoOnboarding(supabase, {
      organizationId,
      caseId: data.caseId,
      userId: context.userId as string,
      gates,
      responsavel: caso.data.responsavel_principal ?? null,
    });

    const checklist = checklistComGates(
      gates,
      Array.isArray(plano.checklist_inicial) ? (plano.checklist_inicial as ItemChecklistOnboarding[]) : null,
      await derivadosDoCaso(supabase, organizationId, data.caseId),
    );
    const planoAcao =
      Array.isArray(plano.plano_acao) && plano.plano_acao.length > 0
        ? plano.plano_acao
        : planoAcaoDosTouchpoints();

    const { data: linhaAtualizada, error } = await supabase
      .from("onboarding_planos")
      .update({
        estado,
        motivos_bloqueio: motivos,
        checklist_inicial: checklist,
        plano_acao: planoAcao,
        updated_by: context.userId,
      })
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linhaAtualizada?.id) {
      throw new Error("NENHUMA_LINHA_AFETADA: plano de onboarding não encontrado nesta organização.");
    }

    await espelharMotivosBloqueioEmCasePlans(supabase, {
      organizationId,
      caseId: data.caseId,
      motivos,
      userId: context.userId as string,
    });

    const tarefas: { id: string; titulo: string; criada: boolean }[] = [];
    for (const titulo of titulosTarefasDosGates(gates)) {
      const t = await garantirTarefaAberta(supabase, {
        organizationId,
        casoId: data.caseId,
        titulo,
        tipo: "geral",
        descricao: "Pendência de gate do onboarding. Não ativa o cliente.",
        userId: context.userId as string,
      });
      tarefas.push({ id: t.id, titulo, criada: t.criada });
    }

    return { ok: true, estado, motivos, clienteAtivado: false, tarefas };
  });

/**
 * Cria a primeira micro-entrega interna do caso (ops_microentregas).
 * Não publica no App Cliente, não envia mensagem, não ativa o caso.
 */
export const criarPrimeiraMicroentregaOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const caso = await supabase
      .from("crm_casos")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const { data: existente } = await supabase
      .from("ops_microentregas")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("caso_id", data.caseId)
      .eq("titulo", TITULO_PRIMEIRA_MICROENTREGA)
      .is("archived_at", null)
      .maybeSingle();
    if (existente?.id) return { id: existente.id as string, reaproveitada: true, clienteAtivado: false };

    const prazo = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    const { data: nova, error } = await supabase
      .from("ops_microentregas")
      .insert({
        organization_id: organizationId,
        caso_id: data.caseId,
        titulo: TITULO_PRIMEIRA_MICROENTREGA,
        descricao: "Rascunho interno do onboarding. Não publicado no App Cliente.",
        fase: "onboarding",
        status: "pendente",
        prioridade: "media",
        prazo,
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    if (!nova?.id) throw new Error("NENHUMA_LINHA_AFETADA: a micro-entrega não foi criada.");

    // O item "Primeira micro-entrega planejada" do plano reflete a linha
    // recém-gravada (não um tick). Se o plano ainda não existe, o próximo
    // recálculo o cria já com o item derivado.
    const plano = await lerPlanoOnboarding(supabase, organizationId, data.caseId);
    if (plano.data && Array.isArray(plano.data.checklist_inicial)) {
      const caso2 = await supabase
        .from("crm_casos")
        .select("contrato_assinado,pagamento_confirmado")
        .eq("organization_id", organizationId)
        .eq("id", data.caseId)
        .maybeSingle();
      const checklist = checklistComGates(
        {
          contrato_assinado: Boolean(caso2.data?.contrato_assinado),
          pagamento_confirmado: Boolean(caso2.data?.pagamento_confirmado),
        },
        plano.data.checklist_inicial as ItemChecklistOnboarding[],
        await derivadosDoCaso(supabase, organizationId, data.caseId),
      );
      await supabase
        .from("onboarding_planos")
        .update({ checklist_inicial: checklist, updated_by: userId })
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId);
    }
    return { id: nova.id as string, reaproveitada: false, clienteAtivado: false };
  });
