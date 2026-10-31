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
  TOUCHPOINTS_PADRAO,
  type DerivadosChecklist,
  type GatesPlano,
  type ItemChecklistOnboarding,
} from "@/lib/onboarding-plano";
import { dossieMaeDoCaso } from "@/lib/nucleo-completude";
import { espelharMotivosBloqueioEmCasePlans } from "@/lib/gate-onboarding-case-plans";
import { garantirTarefaAberta } from "@/lib/tarefa-garantida.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { reconciliarD7Caso } from "@/lib/d7-microentrega.server";
import { ITEM_CODE_D7, lacunasD7, microentregaD7, proximaAcaoD7, type MicroD7 } from "@/lib/d7-microentrega";

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
        .select("id,titulo,fase,status,prazo,concluida_em,prazo_status,evidencia_url,responsavel_id,created_at")
        .eq("organization_id", organizationId)
        .eq("caso_id", data.caseId)
        .is("archived_at", null)
        .order("prazo", { ascending: true, nullsFirst: false }),
    ]);

    const gates = {
      contrato_assinado: Boolean(caso.data?.contrato_assinado),
      pagamento_confirmado: Boolean(caso.data?.pagamento_confirmado),
    };

    // P3 (25/09/2026): resumo do D7 lido da micro-entrega real + espelho.
    const listaMicro = (microentregas.data ?? []) as Record<string, any>[];
    const micro = microentregaD7(listaMicro as MicroD7[]) as Record<string, any> | null;
    const [itemD7, responsavel] = await Promise.all([
      supabase
        .from("onboarding_checklist")
        .select("status,observacao")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .eq("item_code", ITEM_CODE_D7)
        .is("archived_at", null)
        .maybeSingle(),
      micro?.responsavel_id
        ? supabase.from("profiles").select("id,nome").eq("id", micro.responsavel_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    const d7 = {
      microentregaId: (micro?.id as string | undefined) ?? null,
      titulo: (micro?.titulo as string | undefined) ?? null,
      prazo: (micro?.prazo as string | undefined) ?? null,
      prazoStatus: (micro?.prazo_status as string | undefined) ?? null,
      status: (micro?.status as string | undefined) ?? null,
      responsavel: micro?.responsavel_id ? ((responsavel.data?.nome as string | undefined) ?? "Responsável definido") : null,
      lacunas: lacunasD7(micro as MicroD7 | null),
      proximaAcao: proximaAcaoD7(micro as MicroD7 | null),
      checklist: (itemD7.data?.status as string | undefined) ?? null,
    };

    return {
      d7,
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

    const plano = await garantirPlanoOnboarding(supabase, {
      organizationId,
      caseId: data.caseId,
      userId: context.userId as string,
      gates,
      responsavel: caso.data.responsavel_principal ?? null,
    });
    // 26/10/2026: parte do estado GRAVADO do plano. Antes passava um estado
    // sintético e todo recálculo voltava "em_andamento" para "liberado_preparacao".
    const estado = estadoDoPlano(gates, (plano as { estado?: string | null }).estado ?? null);

    const checklist = checklistComGates(
      gates,
      Array.isArray(plano.checklist_inicial) ? (plano.checklist_inicial as ItemChecklistOnboarding[]) : null,
      await derivadosDoCaso(supabase, organizationId, data.caseId),
    );
    const planoAcao =
      Array.isArray(plano.plano_acao) && plano.plano_acao.length > 0
        ? plano.plano_acao
        : planoAcaoDosTouchpoints();

    // 24/09/2026 — grava, relê e compara (antes só conferia o id afetado).
    await gravarComVerificacao({
      supabase,
      tabela: "onboarding_planos",
      id: String(plano.id),
      organizationId,
      userId: context.userId as string,
      payload: {
        estado,
        motivos_bloqueio: motivos,
        checklist_inicial: checklist,
        plano_acao: planoAcao,
      },
    });

    // Espelho em case_plans: devolve o estado (pré-migration, sem linha,
    // erro) em vez de engolir — a escrita real acima já valeu.
    const espelhoCasePlans = await espelharMotivosBloqueioEmCasePlans(supabase, {
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

    // P3: o D7 segue a micro-entrega real (sem criar nada aqui).
    const d7 = await reconciliarD7Caso(supabase, {
      organizationId,
      caseId: data.caseId,
      userId: context.userId as string,
      criarSeFaltar: false,
    });

    return { ok: true, estado, motivos, clienteAtivado: false, tarefas, espelhoCasePlans, d7 };
  });

/**
 * Cria ou reconcilia a micro-entrega D7 do caso (ops_microentregas).
 * P3 (25/09/2026): passa pelo reconciliador único (d7-microentrega.server.ts):
 * reaproveita qualquer micro-entrega ativa do caso (não só a de título fixo),
 * completa responsável/prazo vazios, espelha o item D7 do checklist, o plano
 * e o alerta. Não publica no App Cliente, não envia mensagem, não ativa o caso.
 */
export const criarPrimeiraMicroentregaOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const d7 = await reconciliarD7Caso(supabase, {
      organizationId,
      caseId: data.caseId,
      userId: context.userId as string,
      criarSeFaltar: true,
    });
    return { id: d7.microentregaId, reaproveitada: !d7.criada, clienteAtivado: false, d7 };
  });
