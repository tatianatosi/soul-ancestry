import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import {
  eventoDeModuloParaGenealogico,
  idsJaCopiados,
  relacaoDePesquisaParaGenealogica,
  type EventoModulo,
  type RelacaoPesquisa,
} from "@/lib/fontes-pesquisa-canonicas";
import { inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type ItemPonte = {
  origem: "research_relationships" | "research_case_events";
  origemId: string;
  caseId: string | null;
  acao: "copiar" | "ja_copiado" | "sem_caso" | "sem_pessoa";
};

/**
 * Ponte das fontes legadas da pesquisa para a camada genealógica canônica
 * (fontes-pesquisa-canonicas.ts). Copia — nunca apaga nem altera a origem.
 * Mesmo padrão de backfillGateOnboardingEmCasePlans: mostra o plano, só
 * grava com `confirmar: true`, e cada cópia leva a marca de origem, o que
 * torna a ponte idempotente.
 */
export const pontearFontesDePesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { confirmar?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const [casos, relacoes, eventos, relacoesCanonicas, eventosCanonicos] = await Promise.all([
      supabase.from("research_cases").select("id,case_id").eq("organization_id", organizationId),
      supabase
        .from("research_relationships")
        .select("id,research_case_id,person_a_id,person_b_id,relationship_type,directionality,status,confidence_level,supporting_evidence_count,notes_internal")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("research_case_events")
        .select("id,research_case_id,person_id,event_type,event_date,event_date_precision,location_text,country_context,status,notes_internal")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase.from("genealogical_relationships").select("internal_notes").eq("organization_id", organizationId),
      supabase.from("genealogical_events").select("description_internal").eq("organization_id", organizationId),
    ]);
    for (const r of [casos, relacoes, eventos, relacoesCanonicas, eventosCanonicos]) {
      if (r.error) throw new Error(`Não foi possível ler as fontes da pesquisa: ${r.error.message}`);
    }

    const casoDaPesquisa = new Map<string, string>(
      ((casos.data ?? []) as any[]).filter((c) => c.case_id).map((c) => [String(c.id), String(c.case_id)]),
    );
    const relacoesCopiadas = idsJaCopiados(
      ((relacoesCanonicas.data ?? []) as any[]).map((r) => r.internal_notes),
      "research_relationships",
    );
    const eventosCopiados = idsJaCopiados(
      ((eventosCanonicos.data ?? []) as any[]).map((e) => e.description_internal),
      "research_case_events",
    );

    const plano: (ItemPonte & { payload?: Record<string, unknown> })[] = [];
    for (const r of (relacoes.data ?? []) as (RelacaoPesquisa & { research_case_id: string })[]) {
      const caseId = casoDaPesquisa.get(String(r.research_case_id)) ?? null;
      const base = { origem: "research_relationships" as const, origemId: r.id, caseId };
      if (relacoesCopiadas.has(r.id.toLowerCase())) plano.push({ ...base, acao: "ja_copiado" });
      else if (!caseId) plano.push({ ...base, acao: "sem_caso" });
      else plano.push({ ...base, acao: "copiar", payload: relacaoDePesquisaParaGenealogica(r, caseId) });
    }
    for (const e of (eventos.data ?? []) as (EventoModulo & { research_case_id: string })[]) {
      const caseId = casoDaPesquisa.get(String(e.research_case_id)) ?? null;
      const base = { origem: "research_case_events" as const, origemId: e.id, caseId };
      if (eventosCopiados.has(e.id.toLowerCase())) plano.push({ ...base, acao: "ja_copiado" });
      else if (!caseId) plano.push({ ...base, acao: "sem_caso" });
      else {
        const payload = eventoDeModuloParaGenealogico(e, caseId);
        plano.push(payload ? { ...base, acao: "copiar", payload } : { ...base, acao: "sem_pessoa" });
      }
    }

    const resumo: ItemPonte[] = plano.map(({ payload: _p, ...item }) => item);
    if (!data.confirmar) return { simulado: true, plano: resumo, copiados: 0, falhas: [] as { origemId: string; motivo: string }[] };

    let copiados = 0;
    const falhas: { origemId: string; motivo: string }[] = [];
    for (const item of plano) {
      if (item.acao !== "copiar" || !item.payload) continue;
      const destino = item.origem === "research_relationships" ? "genealogical_relationships" : "genealogical_events";
      try {
        const r = await inserirComVerificacao({ supabase, tabela: destino, organizationId, userId, payload: item.payload });
        await supabase.from("audit_logs").insert({
          organization_id: organizationId,
          entidade: destino,
          entidade_id: r.id,
          acao: "ponte_fonte_pesquisa_copiada",
          user_id: userId,
          metadados: { origem: item.origem, origem_id: item.origemId, case_id: item.caseId },
        });
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId: String(item.caseId),
          eventType: "caso",
          title:
            destino === "genealogical_relationships"
              ? "Relação de pesquisa copiada para a ficha genealógica"
              : "Evento de pesquisa copiado para a linha do tempo genealógica",
          sourceEntityType: destino,
          sourceEntityId: r.id,
          userId,
        });
        copiados += 1;
      } catch (e) {
        falhas.push({ origemId: item.origemId, motivo: e instanceof Error ? e.message : String(e) });
      }
    }
    return { simulado: false, plano: resumo, copiados, falhas };
  });
