import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";
import { calcularCadencia } from "@/lib/jornada-cliente";
import { montarFilasHoje, type LeadDesk } from "@/lib/crm-desk";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * CA-CORTE-ALERTAS-ROTA-CANONICA (09/09/2026) — leitura única de `case_alerts`,
 * a mesma tabela já escrita por prepararAlertaProjecao, registrarProximaAcao,
 * alertaInternoTicket e registrarRevalidacaoProposta (todas já deduplicadas).
 * Nenhuma tabela, motor ou escritor novo: esta função só lê e junta contexto
 * de exibição (caso, tarefa aberta relacionada). `/painel` (subconjunto
 * prioritário) e `/alertas` (lista completa) chamam a mesma função.
 */
export type FiltroAlertas = {
  status?: string;
  criticidade?: string;
  tipo?: string;
  caseId?: string;
  limite?: number;
};

export type LinhaAlerta = {
  id: string;
  caseId: string;
  caseCodigo: string | null;
  caseTitulo: string | null;
  responsavel: string | null;
  tipo: string;
  origem: string;
  motivo: string | null;
  titulo: string;
  criticidade: string;
  status: string;
  dataOcorrencia: string;
  dueAt: string | null;
  acknowledgedAt: string | null;
  tarefaExistente: { id: string; titulo: string } | null;
};

export type AlertaCentral = {
  id: string;
  categoria: "cadencia_vencida" | "caso_sem_proxima_acao" | "lead_parado";
  entidadeId: string;
  caseId: string | null;
  codigo: string | null;
  titulo: string;
  motivo: string;
  responsavel: string | null;
  prazo: string | null;
  origem: "Jornada" | "Caso 360" | "CRM";
};

/**
 * Central somente leitura das três filas pedidas pela Proprietária. Os sinais
 * são derivados das fontes canônicas no momento da leitura; não viram uma
 * segunda tabela de alertas e registros demo/teste ficam fora.
 */
export const listarAlertasCentrais = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const [casosRes, leadsRes] = await Promise.all([
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,status,ativo,responsavel_principal,ultimo_touchpoint_em,created_at,aguardando_instituicao_externa,motivo_espera_externa,dados_teste,data_origin")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .limit(1000),
      supabase.from("leads").select("*").eq("organization_id", organizationId).is("archived_at", null).limit(1000),
    ]);
    if (casosRes.error) throw new Error(casosRes.error.message);
    if (leadsRes.error) throw new Error(leadsRes.error.message);

    const casos = (semFixtures((casosRes.data ?? []) as never) as any[]).filter((c) => c.dados_teste !== true);
    const leads = semFixtures((leadsRes.data ?? []) as never) as unknown as LeadDesk[];
    const hoje = new Date();
    const hojeIso = hoje.toISOString();

    const cadencias: AlertaCentral[] = casos.flatMap((c) => {
      const cadencia = calcularCadencia({
        hoje: hojeIso,
        ultimoTouchpointEm: c.ultimo_touchpoint_em ?? c.created_at ?? null,
        aguardandoInstituicaoExterna: c.aguardando_instituicao_externa === true,
        motivoEsperaExterna: c.motivo_espera_externa ?? null,
      });
      if (cadencia.status === "regular") return [];
      return [{
        id: `cadencia:${c.id}`,
        categoria: "cadencia_vencida" as const,
        entidadeId: String(c.id),
        caseId: String(c.id),
        codigo: c.codigo ?? null,
        titulo: c.titulo ?? c.codigo ?? "Caso",
        motivo: cadencia.motivo,
        responsavel: c.responsavel_principal ?? null,
        prazo: null,
        origem: "Jornada" as const,
      }];
    });

    const caseIds = casos.map((c) => String(c.id));
    const proximas = caseIds.length
      ? await supabase.rpc("proxima_acao_prioritaria_lote", { _cases: caseIds })
      : { data: [], error: null };
    if (proximas.error) throw new Error(proximas.error.message);
    const semAcaoIds = new Set(
      (proximas.data ?? []).filter((p: any) => Number(p.nivel) === 9).map((p: any) => String(p.case_id)),
    );
    const casosSemAcao: AlertaCentral[] = casos
      .filter((c) => semAcaoIds.has(String(c.id)))
      .map((c) => ({
        id: `proxima-acao:${c.id}`,
        categoria: "caso_sem_proxima_acao",
        entidadeId: String(c.id),
        caseId: String(c.id),
        codigo: c.codigo ?? null,
        titulo: c.titulo ?? c.codigo ?? "Caso",
        motivo: "Nenhuma próxima ação prioritária foi encontrada para o caso ativo.",
        responsavel: c.responsavel_principal ?? null,
        prazo: null,
        origem: "Caso 360",
      }));

    const filasLead = montarFilasHoje({ leads, casos: [], hoje });
    const chavesParadas = new Set(["acoes_vencidas", "leads_sem_proxima_acao", "propostas_sem_followup", "discoveries_sem_desdobramento"]);
    const leadsParadosPorId = new Map<string, AlertaCentral>();
    for (const fila of filasLead.filter((f) => chavesParadas.has(f.chave))) {
      for (const item of fila.itens) {
        if (leadsParadosPorId.has(item.id)) continue;
        leadsParadosPorId.set(item.id, {
          id: `lead:${item.id}`,
          categoria: "lead_parado",
          entidadeId: item.id,
          caseId: null,
          codigo: item.rotulo.split(" · ")[0] ?? null,
          titulo: item.rotulo.split(" · ").slice(1).join(" · ") || item.rotulo,
          motivo: item.detalhe,
          responsavel: item.responsavel,
          prazo: item.data,
          origem: "CRM",
        });
      }
    }

    return {
      cadencias,
      casosSemAcao,
      leadsParados: [...leadsParadosPorId.values()],
    };
  });

export const listarAlertas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: FiltroAlertas) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    let q = supabase
      .from("case_alerts")
      .select(
        "id,case_id,tipo,titulo,detalhe,criticidade,status,due_at,triggered_at,origem_regra,acknowledged_at",
      )
      .eq("organization_id", organizationId)
      .order("criticidade", { ascending: false })
      .order("triggered_at", { ascending: false });

    if (data.status) q = q.eq("status", data.status);
    else q = q.not("status", "in", "(completed)");
    if (data.criticidade) q = q.eq("criticidade", data.criticidade);
    if (data.tipo) q = q.eq("tipo", data.tipo);
    if (data.caseId) q = q.eq("case_id", data.caseId);
    if (data.limite) q = q.limit(data.limite);

    const { data: alertas, error } = await q;
    if (error) throw new Error(error.message);
    const linhas = alertas ?? [];

    const casoIds = [...new Set(linhas.map((a: any) => a.case_id as string))];
    const [{ data: casos }, { data: tarefasAbertas }] = await Promise.all([
      casoIds.length
        ? supabase
            .from("crm_casos")
            .select("id,codigo,titulo,responsavel_principal,dados_teste,data_origin")
            .eq("organization_id", organizationId)
            .in("id", casoIds)
        : Promise.resolve({ data: [] as any[] }),
      casoIds.length
        ? supabase
            .from("tarefas")
            .select("id,caso_id,titulo")
            .eq("organization_id", organizationId)
            .in("caso_id", casoIds)
            .not("status", "in", "(concluida,cancelada)")
            .is("archived_at", null)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const casoPorId = new Map((casos ?? []).map((c: any) => [c.id, c]));
    const tarefaPorCaso = new Map<string, { id: string; titulo: string }>();
    for (const t of tarefasAbertas ?? []) {
      if (!tarefaPorCaso.has(t.caso_id)) tarefaPorCaso.set(t.caso_id, { id: t.id, titulo: t.titulo });
    }

    /*
     * Varredura de demonstração em todas as abas (04/10/2026, pedido da
     * Proprietária): alerta de caso de demonstração sai da fila operacional.
     * A irmã `listarAlertasCentrais` já fazia isso; esta não. O filtro é pelo
     * caso, porque `case_alerts` não tem marca própria de demo. Nada é
     * apagado — a linha continua no banco.
     */
    const linhasReais = linhas.filter((a: any) => {
      const c = casoPorId.get(a.case_id);
      return !c || !ehFixtureLinha(c as never);
    });

    const resultado: LinhaAlerta[] = linhasReais.map((a: any) => {
      const caso = casoPorId.get(a.case_id) as Record<string, any> | undefined;
      return {
        id: a.id,
        caseId: a.case_id,
        caseCodigo: caso?.codigo ?? null,
        caseTitulo: caso?.titulo ?? null,
        responsavel: caso?.responsavel_principal ?? null,
        tipo: a.tipo,
        origem: a.origem_regra ?? a.tipo,
        motivo: a.detalhe,
        titulo: a.titulo,
        criticidade: a.criticidade,
        status: a.status,
        dataOcorrencia: a.triggered_at,
        dueAt: a.due_at,
        acknowledgedAt: a.acknowledged_at,
        tarefaExistente: tarefaPorCaso.get(a.case_id) ?? null,
      };
    });
    return resultado;
  });
