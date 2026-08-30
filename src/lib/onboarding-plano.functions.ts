import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { estadoDoPlano, motivosBloqueio } from "@/lib/onboarding-plano";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Plano de onboarding do caso: leitura e recálculo do estado. Nunca ativa cliente. */
export const carregarPlanoOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const [plano, caso, comunicacoes] = await Promise.all([
      supabase
        .from("onboarding_planos")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .maybeSingle(),
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
    };
  });

/** Recalcula o estado do plano a partir dos gates reais. Nunca libera envio nem ativa o caso. */
export const recalcularPlanoOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const caso = await supabase
      .from("crm_casos")
      .select("contrato_assinado,pagamento_confirmado")
      .eq("organization_id", organizationId)
      .eq("id", data.caseId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const gates = {
      contrato_assinado: Boolean(caso.data.contrato_assinado),
      pagamento_confirmado: Boolean(caso.data.pagamento_confirmado),
    };
    const motivos = motivosBloqueio(gates);
    const estado = motivos.length > 0 ? "bloqueado" : "liberado_preparacao";

    const { data: linhaAtualizada, error } = await supabase
      .from("onboarding_planos")
      .update({ estado, motivos_bloqueio: motivos, updated_by: context.userId })
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linhaAtualizada?.id) throw new Error("NENHUMA_LINHA_AFETADA: plano de onboarding não encontrado nesta organização.");

    return { ok: true, estado, motivos, clienteAtivado: false };
  });
