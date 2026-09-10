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
  titulosTarefasDosGates,
  TITULO_PRIMEIRA_MICROENTREGA,
  TOUCHPOINTS_PADRAO,
  type ItemChecklistOnboarding,
} from "@/lib/onboarding-plano";
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

  if (criado) return criado as Record<string, any>;

  const corrida = await lerPlanoOnboarding(supabase, input.organizationId, input.caseId);
  if (corrida.data) return corrida.data as Record<string, any>;
  throw new Error(error?.message ?? "NENHUMA_LINHA_AFETADA: não foi possível criar o plano de onboarding.");
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
    return { id: nova.id as string, reaproveitada: false, clienteAtivado: false };
  });
