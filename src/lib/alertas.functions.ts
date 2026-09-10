import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";

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
            .select("id,codigo,titulo,responsavel_principal")
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

    const resultado: LinhaAlerta[] = linhas.map((a: any) => {
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
