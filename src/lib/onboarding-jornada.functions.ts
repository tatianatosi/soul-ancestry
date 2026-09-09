import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  avaliarCadencia,
  derivarEstadoCaso,
  diagnosticarOnboarding,
  esperaExternaSuspendeAlerta,
} from "@/lib/onboarding-jornada";

/*
 * 09/09/2026 — consolidação de redundâncias (docs/relatorios/
 * 2026-09-09_consolidacao_jornada_checklists_gates_execucao.md). Este arquivo
 * tinha 11 exports de escrita (checklist, plano de caso, onboarding, ativação,
 * espera externa, entregas de cliente) — nenhum importado por rota ou
 * componente algum. `obterPainelJornada` é o único export vivo (painel
 * agregado, só leitura), mantido abaixo. Os escritores reais e testados são:
 * onboarding.functions.ts (checklist), onboarding-plano.functions.ts (plano
 * de onboarding), cadeia-operacional.server.ts (case_plans via
 * sincronizarPlanejador), casos-ativacao.functions.ts (ativação),
 * biblioteca-evidencias.functions.ts (microentregas via app_projections).
 * Removidos sem apagar dado nenhum: as tabelas seguem existindo, só o código
 * morto que nunca gravava nelas saiu.
 */

type Cliente = {
  from: (t: string) => any;
};

async function resolverOrg(supabase: Cliente, userId: string): Promise<string> {
  const r = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).limit(1).maybeSingle();
  if (!r.data?.organization_id) throw new Error("Usuário sem organização.");
  return r.data.organization_id as string;
}

/* -------------------------------------------------------------- leituras */

export const obterPainelJornada = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Cliente;
    const org = await resolverOrg(supabase, context.userId as string);

    const [casos, planos, checklist, entregas, esperas] = await Promise.all([
      supabase.from("crm_casos").select("*").eq("organization_id", org).is("archived_at", null),
      supabase.from("case_plans").select("*").eq("organization_id", org).is("archived_at", null),
      supabase.from("onboarding_checklist").select("*").eq("organization_id", org),
      supabase.from("client_deliverables").select("*").eq("organization_id", org),
      supabase.from("case_espera_externa").select("*").eq("organization_id", org).is("archived_at", null),
    ]);

    const listaCasos = (casos.data ?? []) as Record<string, any>[];
    const listaPlanos = (planos.data ?? []) as Record<string, any>[];
    const listaChecklist = (checklist.data ?? []) as Record<string, any>[];
    const listaEntregas = (entregas.data ?? []) as Record<string, any>[];

    let bloqueados = 0;
    let semProximaAcao = 0;
    let semMicroentrega = 0;
    let semTouchpoint10 = 0;
    let semAtualizacao14 = 0;
    const detalhes: {
      case_id: string;
      codigo: string | null;
      estado: string;
      diagnostico: string;
      proxima_acao: string | null;
      prazo: string | null;
      alertas: string[];
    }[] = [];

    for (const caso of listaCasos) {
      const plano = listaPlanos.find((p) => p["case_id"] === caso["id"] && p["status"] === "ativo") ?? null;
      const esperaAtiva =
        ((esperas.data ?? []) as Record<string, any>[]).find(
          (e) => e["case_id"] === caso["id"] && esperaExternaSuspendeAlerta(e),
        ) ?? null;
      const itens = listaChecklist.filter((c) => c["case_id"] === caso["id"]);
      const diag = diagnosticarOnboarding(caso as never, { checklist: itens as never, plano: plano as never });
      const estado = derivarEstadoCaso(caso as never, diag, { plano: plano as never });
      const cadencia = avaliarCadencia({
        onboardingIniciadoEm: caso["onboarding_iniciado_em"] ?? null,
        primeiraMicroentregaPlanejada: Boolean(plano?.["proxima_microentrega"]),
        ultimoTouchpointEm: plano?.["ultima_atualizacao_cliente_em"] ?? caso["onboarding_iniciado_em"] ?? null,
        ultimaAtualizacaoClienteEm: plano?.["ultima_atualizacao_cliente_em"] ?? null,
        esperaExternaAtiva: Boolean(esperaAtiva),
      });

      if (diag.bloqueios.length) bloqueados += 1;
      if (!plano?.["proxima_acao"] && !caso["proxima_acao"]) semProximaAcao += 1;
      if (!plano?.["proxima_microentrega"]) semMicroentrega += 1;
      if (cadencia.some((a) => a.regra === "D10")) semTouchpoint10 += 1;
      if (cadencia.some((a) => a.regra === "D14")) semAtualizacao14 += 1;

      detalhes.push({
        case_id: String(caso["id"]),
        codigo: caso["codigo"] ?? null,
        estado,
        diagnostico: diag.status,
        proxima_acao: diag.proxima_acao,
        prazo: diag.prazo,
        alertas: cadencia.map((a) => a.titulo),
      });
    }

    const emOnboarding = listaCasos.filter((c) => c["eixo_operacao"] === "onboarding_iniciado").length;
    const ativos = listaCasos.filter((c) => c["eixo_operacao"] === "caso_ativo").length;
    const entregasPendentesAprovacao = listaEntregas.filter(
      (e) => e["approval_status"] === "em_revisao" || e["approval_status"] === "rascunho",
    ).length;
    const entregasPublicadas = listaEntregas.filter((e) => e["approval_status"] === "publicado").length;

    return {
      contadores: {
        casos_em_onboarding: emOnboarding,
        casos_ativos: ativos,
        casos_bloqueados: bloqueados,
        sem_proxima_acao: semProximaAcao,
        sem_microentrega_planejada: semMicroentrega,
        sem_touchpoint_10d: semTouchpoint10,
        sem_atualizacao_14d: semAtualizacao14,
        entregas_aguardando_aprovacao: entregasPendentesAprovacao,
        entregas_publicadas: entregasPublicadas,
      },
      casos: detalhes,
    };
  });
