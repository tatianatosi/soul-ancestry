import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoOps, exigirEscrita, type Sb } from "@/lib/ops.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { validarAprovacaoEventoCliente } from "@/lib/timeline-caso";

/**
 * REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026) — fecha o escritor que
 * faltava para `case_timeline_events.visibility = 'cliente_aprovado'`.
 *
 * A tabela, a coluna `summary_client_approved`, a policy de portal
 * `cte_select_portal` (migration 20260910184500_timeline_operacional_e_rls_portal.sql)
 * e o filtro `eventosVisiveisAoCliente` (timeline-caso.ts) já existiam.
 * Nenhum caminho de escrita real os alimentava: todo escritor gravava
 * `visibility: "interno"` fixo (`timeline-operacional.server.ts`). Sem
 * escritor, a aba Conta do App Cliente não tinha nenhum evento para exibir —
 * não porque o dado não existisse, mas porque ninguém podia aprová-lo.
 *
 * Reaproveita `case_timeline_events` (sem tabela nova) e o padrão
 * `contextoOps`/`exigirEscrita`/`gravarComVerificacao` já usado por
 * `jornada-cliente.functions.ts` para escritas equivalentes no mesmo caso.
 */
export const aprovarEventoTimelineParaCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { eventoId: string; resumoCliente: string }) => {
    if (!data?.eventoId) throw new Error("Selecione um evento da linha do tempo.");
    const checagem = validarAprovacaoEventoCliente(data.resumoCliente);
    if (!checagem.valido) throw new Error(checagem.motivo ?? "Resumo inválido.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);

    await gravarComVerificacao({
      supabase,
      tabela: "case_timeline_events",
      id: data.eventoId,
      organizationId: ctx.organizationId,
      userId: context.userId as string,
      payload: {
        visibility: "cliente_aprovado",
        summary_client_approved: data.resumoCliente.trim(),
      },
    });
    return { ok: true as const };
  });

/** Revoga a aprovação — o evento volta a ser visível só para a equipe interna. */
export const revogarEventoTimelineDoCliente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { eventoId: string }) => {
    if (!data?.eventoId) throw new Error("Selecione um evento da linha do tempo.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);

    await gravarComVerificacao({
      supabase,
      tabela: "case_timeline_events",
      id: data.eventoId,
      organizationId: ctx.organizationId,
      userId: context.userId as string,
      payload: {
        visibility: "interno",
      },
    });
    return { ok: true as const };
  });
