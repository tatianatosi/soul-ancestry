import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semFixtures } from "@/lib/fixtures";
import { semCache } from "@/lib/no-store";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";

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

    const [membrosBrutos, log, cliente, nucleos, planos, timeline, blueprint, filaDrive, checksAtivacao, historicoFase] = await Promise.all([
      // (bloqueiosReais lido separadamente abaixo, fora do Promise.all de selects
      // simples, porque é uma chamada RPC. membrosBrutos é só para decidir se
      // precisa do fallback abaixo — quem alimenta a tela é `membrosComFallback`.)
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

    // 07/09/2026 — achado do cotejo tela a tela: esta ficha lia case_members
    // cru, sem cair para Núcleos quando faltasse linha — ao contrário de 4
    // outras telas (contrato, escopo, cadastro, consolidação) que já usam
    // `pessoasDoCasoComFallbackNucleo`. Funcionava hoje só porque a Ana tem
    // 4 linhas manuais em case_members; qualquer caso novo sem essa
    // sincronização manual mostraria a ficha vazia mesmo com núcleo
    // cadastrado. Passa a usar a mesma função única das outras 4 telas.
    const membrosComFallback = ((membrosBrutos.data ?? []) as Linha[]).length > 0
      ? (membrosBrutos.data as Linha[])
      : await pessoasDoCasoComFallbackNucleo(supabase, data.id);

    // 07/09/2026 — achado real reportado pela proprietária: esta ficha e a
    // tela de onboarding (/onboarding/$id) mostravam estados diferentes para
    // o mesmo caso, porque cada uma calculava "pronto?" com uma lógica
    // própria (esta ficha só olhava case_activation_checks via
    // estadoDerivadoPorGates; onboarding usa a função mais completa que
    // também lê onboarding_checklist, consentimento e qualidade). Passa a
    // ler a mesma função RPC (case_ativacao_bloqueios_reais) que já é a
    // fonte confiável da tela de onboarding, para as duas telas finalmente
    // concordarem.
    const { data: bloqueiosReaisData } = await supabase.rpc("case_ativacao_bloqueios_reais", {
      _case: data.id,
    });

    /*
      24/09/2026 — ordem P0 "Sistema Único Transversal": lead de origem do
      caso para o Estado Integrado. Vínculo real `leads.case_id` (gravado no
      handoff); só leitura, filtrada por organização e caso — nenhum dado do
      lead é copiado para o caso.
    */
    const { data: leadOrigem } = await supabase
      .from("leads")
      .select("id, nome, origem, estagio, created_at")
      .eq("organization_id", organizationId)
      .eq("case_id", data.id)
      .is("archived_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    // Completude do núcleo por critérios persistidos (ANA-B-01), nunca por existência de linha.
    const { data: completude } = await supabase.rpc("nucleo_completude", { _case: data.id });
    const nucleoCompletude = (completude ?? { nucleo_id: null, itens: [], completo: false }) as {
      nucleo_id: string | null;
      itens: { chave: string; rotulo: string; ok: boolean; motivo: string | null }[];
      completo: boolean;
    };

    return {
      caso: caso.data as Linha,
      membros: membrosComFallback as Linha[],
      log: (log.data ?? []) as Linha[],
      cliente: (cliente as any)?.data ?? null,
      leadOrigem: (leadOrigem ?? null) as Linha | null,
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
      bloqueiosReais: (bloqueiosReaisData ?? []) as {
        regra: string;
        dominio: string;
        motivo: string;
        tabela_campo: string;
        valor_atual: string;
        cta_tela: string | null;
      }[],
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
    /*
     * Varredura de demonstração em todas as abas (04/10/2026, pedido da
     * Proprietária). `semFixtures` remove a linha da lista operacional sem
     * apagar nada no banco. Esta função não tinha o filtro.
     */
    const { data, error } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("organization_id", organizationId)
      // 09/10/2026 — caso arquivado (inclusive os de teste retirados) não volta ao seletor.
      .is("archived_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { casos: semFixtures((data ?? []) as never) as unknown as Linha[] };
  });
