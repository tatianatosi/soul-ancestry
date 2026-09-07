import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

async function organizacaoDo(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}


/** Carrega a ficha operacional canônica do caso (dados reais, sem inferência). */
export const carregarFichaCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const caso = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const [membros, log, cliente, nucleos, planos, timeline, blueprint, filaDrive, checksAtivacao, historicoFase] = await Promise.all([
      supabase
        .from("case_members")
        .select("*")
        .eq("case_id", data.id)
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("caso_log")
        .select("*")
        .eq("case_id", data.id)
        .order("created_at", { ascending: false })
        .limit(80),
      caso.data.cliente_id
        ? supabase.from("clientes").select("id, nome, email, telefone").eq("id", caso.data.cliente_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("nucleos_familiares").select("*").eq("case_id", data.id).is("archived_at", null),
      supabase.from("tarefas").select("id").eq("caso_id", data.id).limit(1),
      supabase
        .from("case_timeline_events")
        .select("*")
        .eq("case_id", data.id)
        .is("archived_at", null)
        .order("occurred_at", { ascending: false })
        .limit(200),
      supabase.from("blueprint_parameters").select("*").eq("case_id", data.id).is("archived_at", null),
      supabase.from("drive_provisioning_queue").select("*").eq("case_id", data.id).is("archived_at", null),
      // Requisitos de ativação validados à mão. A ficha derivava tudo da linha
      // do caso e ignorava estes registros: o caso da Ana tinha os 14
      // validados e a tela continuava dizendo "ativação bloqueada".
      supabase.from("case_activation_checks").select("check_key,label,status,dominio,obrigatorio").eq("case_id", data.id),
      // 07/09/2026 — case_phase_history existe desde 06/09 (trigger automático
      // em crm_casos.fase, PROMPT-MOTORES-UNIFICADOS-CRM-VIVO.md seção 10),
      // mas nenhuma tela lia: a gravação era automática, a leitura nunca foi
      // ligada. Achado da proprietária.
      supabase
        .from("case_phase_history")
        .select("id,fase_anterior,fase_nova,changed_at,changed_by")
        .eq("case_id", data.id)
        .order("changed_at", { ascending: false }),
    ]);

    // Completude do núcleo por critérios persistidos (ANA-B-01), nunca por existência de linha.
    const { data: completude } = await supabase.rpc("nucleo_completude", { _case: data.id });
    const nucleoCompletude = (completude ?? { nucleo_id: null, itens: [], completo: false }) as {
      nucleo_id: string | null;
      itens: { chave: string; rotulo: string; ok: boolean; motivo: string | null }[];
      completo: boolean;
    };

    return {
      caso: caso.data as Linha,
      membros: (membros.data ?? []) as Linha[],
      log: (log.data ?? []) as Linha[],
      cliente: (cliente as any)?.data ?? null,
      nucleos: (nucleos.data ?? []) as Linha[],
      nucleoCompletude,
      nucleoCriterios: nucleoCompletude.itens,
      nucleoPendencias: nucleoCompletude.itens.filter((i) => !i.ok),
      nucleoOk: nucleoCompletude.completo,
      planoInicialOk: ((planos.data ?? []) as Linha[]).length > 0,
      timeline: (timeline.data ?? []) as Linha[],
      blueprint: (blueprint.data ?? []) as Linha[],
      filaDrive: (filaDrive.data ?? []) as Linha[],
      checksAtivacao: (checksAtivacao.data ?? []) as Linha[],
      historicoFase: (historicoFase.data ?? []) as Linha[],
    };
  });


/** Lista enxuta de casos para a aba Casos do Desk. */
export const listarCasosFicha = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { casos: (data ?? []) as Linha[] };
  });
