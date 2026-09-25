/**
 * P3 (25/09/2026) — reconciliador único do D7.
 *
 * Fonte operacional: `ops_microentregas`. Espelhos derivados, gravados só
 * aqui: `onboarding_checklist.micro_entrega_d7` (o item que segura a ativação
 * no banco), o `checklist_inicial` do plano de onboarding,
 * `case_plans.proxima_microentrega` (plano ativo) e o alerta interno em
 * `case_alerts`. Reexecutar não duplica micro-entrega, evento nem alerta.
 * Nada é apagado; "não aplicável" humano é preservado.
 */
import {
  CRITERIO_ACEITE_D7,
  ITEM_CODE_D7,
  alertaD7Devido,
  lacunasD7,
  microentregaD7,
  patchChecklistD7,
  prazoD7,
  proximaAcaoD7,
  recusaTickManualD7,
  type MicroD7,
} from "@/lib/d7-microentrega";
import { checklistComGates, primeiraMicroentregaReal, TITULO_PRIMEIRA_MICROENTREGA, type ItemChecklistOnboarding } from "@/lib/onboarding-plano";
import { dossieMaeDoCaso } from "@/lib/nucleo-completude";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const TIPO_ALERTA_D7 = "primeira_microentrega_pendente";

export type ResultadoD7 = {
  microentregaId: string | null;
  criada: boolean;
  completou: string[];
  lacunas: string[];
  checklistD7: "concluido" | "pendente" | "inalterado" | "sem_item" | "nao_aplicavel";
  alerta: "aberto" | "resolvido" | "nenhum";
  proximaAcao: string;
};

async function lerMicroentregas(supabase: any, organizationId: string, caseId: string): Promise<MicroD7[]> {
  const { data, error } = await supabase
    .from("ops_microentregas")
    .select("id,titulo,status,prazo,responsavel_id,archived_at,created_at")
    .eq("organization_id", organizationId)
    .eq("caso_id", caseId)
    .is("archived_at", null);
  if (error) throw new Error(error.message);
  return (data ?? []) as MicroD7[];
}

/** Checklist do plano de onboarding, derivado do dado real (dossiê-mãe e D7). */
export async function espelharChecklistDoPlano(
  supabase: any,
  input: { organizationId: string; caseId: string; userId: string; temMicroentrega: boolean },
): Promise<boolean> {
  const plano = await supabase
    .from("onboarding_planos")
    .select("id,checklist_inicial")
    .eq("organization_id", input.organizationId)
    .eq("case_id", input.caseId)
    .is("archived_at", null)
    .maybeSingle();
  if (!plano.data || !Array.isArray(plano.data.checklist_inicial)) return false;
  const [caso, nucleo] = await Promise.all([
    supabase
      .from("crm_casos")
      .select("contrato_assinado,pagamento_confirmado,dossie_mae_referencia")
      .eq("organization_id", input.organizationId)
      .eq("id", input.caseId)
      .maybeSingle(),
    supabase
      .from("nucleos_familiares")
      .select("id,dossie_mae,dossie_status")
      .eq("organization_id", input.organizationId)
      .eq("case_id", input.caseId)
      .is("archived_at", null)
      .maybeSingle(),
  ]);
  const atual = plano.data.checklist_inicial as ItemChecklistOnboarding[];
  const checklist = checklistComGates(
    {
      contrato_assinado: Boolean(caso.data?.contrato_assinado),
      pagamento_confirmado: Boolean(caso.data?.pagamento_confirmado),
    },
    atual,
    {
      primeiraMicroentrega: input.temMicroentrega,
      dossieMaeAtivo: dossieMaeDoCaso(nucleo.data ?? null, caso.data?.dossie_mae_referencia ?? null).ativo,
    },
  );
  if (JSON.stringify(checklist) === JSON.stringify(atual)) return false;
  await gravarComVerificacao({
    supabase,
    tabela: "onboarding_planos",
    id: String(plano.data.id),
    organizationId: input.organizationId,
    userId: input.userId,
    payload: { checklist_inicial: checklist },
  });
  return true;
}

export async function reconciliarD7Caso(
  supabase: any,
  input: { organizationId: string; caseId: string; userId: string; criarSeFaltar: boolean },
): Promise<ResultadoD7> {
  const { organizationId, caseId, userId } = input;
  const hoje = new Date().toISOString();

  const { data: caso } = await supabase
    .from("crm_casos")
    .select("id,responsavel_id,onboarding_iniciado_em")
    .eq("organization_id", organizationId)
    .eq("id", caseId)
    .maybeSingle();
  if (!caso) throw new Error("Caso não encontrado nesta organização.");

  let micro = microentregaD7(await lerMicroentregas(supabase, organizationId, caseId));
  let criada = false;
  const completou: string[] = [];

  // 1. Fonte: cria só se falta; se existe, completa só o que está vazio.
  if (!micro && input.criarSeFaltar) {
    const nova = await inserirComVerificacao({
      supabase,
      tabela: "ops_microentregas",
      organizationId,
      userId,
      payload: {
        caso_id: caseId,
        titulo: TITULO_PRIMEIRA_MICROENTREGA,
        descricao: "Primeira micro-entrega do onboarding (D7). Interna — não publicada no App Cliente.",
        fase: "onboarding",
        status: "pendente",
        prioridade: "media",
        prazo: prazoD7(caso.onboarding_iniciado_em, hoje),
        responsavel_id: caso.responsavel_id ?? userId,
        criterio_aceite: CRITERIO_ACEITE_D7,
      },
    });
    micro = nova.registro as MicroD7;
    criada = true;
  } else if (micro && lacunasD7(micro).length) {
    const patch: Record<string, unknown> = {};
    if (!micro.responsavel_id) {
      patch.responsavel_id = caso.responsavel_id ?? userId;
      completou.push("responsável");
    }
    if (!micro.prazo) {
      patch.prazo = prazoD7(caso.onboarding_iniciado_em, hoje);
      completou.push("prazo");
    }
    const r = await gravarComVerificacao({
      supabase,
      tabela: "ops_microentregas",
      id: micro.id,
      organizationId,
      userId,
      payload: patch,
    });
    micro = { ...micro, ...(r.registro as MicroD7) };
  }

  // 2. Espelho: item micro_entrega_d7 do checklist que segura a ativação.
  let checklistD7: ResultadoD7["checklistD7"] = "sem_item";
  const { data: item } = await supabase
    .from("onboarding_checklist")
    .select("id,status,observacao")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .eq("item_code", ITEM_CODE_D7)
    .is("archived_at", null)
    .maybeSingle();
  if (item) {
    const patch = patchChecklistD7(micro, item);
    if (item.status === "nao_aplicavel") checklistD7 = "nao_aplicavel";
    else if (!patch) checklistD7 = "inalterado";
    else {
      await gravarComVerificacao({
        supabase,
        tabela: "onboarding_checklist",
        id: String(item.id),
        organizationId,
        userId,
        payload: {
          status: patch.status,
          observacao: patch.observacao,
          concluido_em: patch.status === "concluido" ? hoje : null,
          concluido_por: patch.status === "concluido" ? userId : null,
        },
      });
      checklistD7 = patch.status;
    }
  }

  // 3. Espelho: checklist do plano e próxima micro-entrega do plano ativo.
  await espelharChecklistDoPlano(supabase, {
    organizationId,
    caseId,
    userId,
    temMicroentrega: primeiraMicroentregaReal(micro ? [micro] : []),
  });
  const proximaMicro = micro && micro.status !== "concluida"
    ? `${micro.titulo ?? "Micro-entrega"}${micro.prazo ? ` — até ${String(micro.prazo).slice(0, 10)}` : ""}`
    : null;
  const { data: planosAtivos } = await supabase
    .from("case_plans")
    .select("id,proxima_microentrega")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .eq("status", "ativo")
    .is("archived_at", null);
  for (const p of (planosAtivos ?? []) as { id: string; proxima_microentrega: string | null }[]) {
    if ((p.proxima_microentrega ?? null) === proximaMicro) continue;
    await gravarComVerificacao({
      supabase,
      tabela: "case_plans",
      id: p.id,
      organizationId,
      userId,
      payload: { proxima_microentrega: proximaMicro },
    });
  }

  // 4. Alerta interno: abre só depois do D7 sem micro-entrega; resolve quando existe.
  let alerta: ResultadoD7["alerta"] = "nenhum";
  const { data: alertaAberto } = await supabase
    .from("case_alerts")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .eq("tipo", TIPO_ALERTA_D7)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  if (alertaD7Devido({ micro, onboardingIniciadoEm: caso.onboarding_iniciado_em, hojeIso: hoje })) {
    if (!alertaAberto?.id) {
      const { error } = await supabase.from("case_alerts").insert({
        organization_id: organizationId,
        case_id: caseId,
        tipo: TIPO_ALERTA_D7,
        criticidade: "atencao",
        titulo: "Primeira micro-entrega não planejada até D7",
        detalhe: "Nenhuma micro-entrega registrada em Ops depois do D7 do onboarding. Alerta interno — nada é enviado ao cliente.",
        status: "pending",
      });
      if (error) throw new Error(error.message);
    }
    alerta = "aberto";
  } else if (micro && alertaAberto?.id) {
    const { error } = await supabase
      .from("case_alerts")
      .update({ status: "completed", completed_at: hoje })
      .eq("id", alertaAberto.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    alerta = "resolvido";
  }

  // 5. Linha do tempo só quando algo mudou (reexecução silenciosa).
  const mudou = criada || completou.length > 0 || checklistD7 === "concluido" || checklistD7 === "pendente" || alerta === "resolvido";
  if (mudou) {
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId,
      eventType: "caso",
      title: criada ? "Micro-entrega D7 criada" : "D7 reconciliado com a micro-entrega real",
      summaryInternal: [
        micro?.titulo ?? null,
        completou.length ? `completado: ${completou.join(", ")}` : null,
        checklistD7 === "concluido" ? "checklist D7 concluído (derivado)" : null,
        checklistD7 === "pendente" ? "checklist D7 voltou a pendente" : null,
      ]
        .filter(Boolean)
        .join(" · ") || null,
      sourceEntityType: "ops_microentregas",
      sourceEntityId: micro?.id ?? caseId,
      userId,
      nextAction: proximaAcaoD7(micro),
    });
  }

  return {
    microentregaId: micro?.id ?? null,
    criada,
    completou,
    lacunas: lacunasD7(micro),
    checklistD7,
    alerta,
    proximaAcao: proximaAcaoD7(micro),
  };
}

/**
 * Tick manual no item `micro_entrega_d7` (tela de ativação ou Caso 360):
 * em vez de gravar a caixinha, reconcilia pelo dado real. Aceita quando o
 * pedido coincide com a realidade; recusa com o motivo quando não coincide.
 */
export async function tratarTickManualD7(
  supabase: any,
  input: { organizationId: string; caseId: string; userId: string; status: string },
): Promise<{ ok: true; erro: null; d7: ResultadoD7 } | { ok: false; erro: string; d7: ResultadoD7 }> {
  const d7 = await reconciliarD7Caso(supabase, { ...input, criarSeFaltar: false });
  const real = d7.microentregaId ? "concluido" : "pendente";
  if (input.status === real) return { ok: true, erro: null, d7 };
  const motivo = d7.microentregaId
    ? "Há micro-entrega real ativa neste caso; para o D7 voltar a pendente, cancele ou arquive a micro-entrega em Ops."
    : "Ainda não há micro-entrega real neste caso.";
  return { ok: false, erro: `${recusaTickManualD7(ITEM_CODE_D7, input.status)} ${motivo}`, d7 };
}
