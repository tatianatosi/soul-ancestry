/**
 * Plano de onboarding do caso — preparação, nunca ativação.
 *
 * O plano nasce Bloqueado e só pode ser liberado para preparação quando
 * contrato assinado e pagamento inicial confirmado existirem como fato
 * registrado. Nada aqui envia boas-vindas, gera magic link, publica App,
 * cria pasta ou grupo externo.
 */

import {
  DIAS_CADENCIA_ATENCAO,
  DIAS_CADENCIA_CRITICA,
  DIAS_PRIMEIRA_MICROENTREGA,
} from "@/lib/cadencia-limiares";

export type GatesPlano = {
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
};

export const ESTADO_PLANO: Record<string, string> = {
  bloqueado: "Bloqueado",
  liberado_preparacao: "Liberado para preparação",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_DOSSIE: Record<string, string> = {
  nao_iniciado: "Não iniciado",
  em_preparacao: "Em preparação",
  validado: "Validado",
};

export const STATUS_GRUPO_FAMILIAR: Record<string, string> = {
  pendente: "Pendente",
  planejado: "Planejado",
  criado: "Criado",
  nao_aplicavel: "Não aplicável",
};

/** Motivos que mantêm o plano bloqueado. Lista vazia = elegível a liberação humana. */
export function motivosBloqueio(gates: GatesPlano): string[] {
  const motivos: string[] = [];
  if (!gates.contrato_assinado) motivos.push("Contrato assinado pendente.");
  if (!gates.pagamento_confirmado) motivos.push("Pagamento inicial confirmado pendente.");
  return motivos;
}

export function estadoDoPlano(gates: GatesPlano, estadoAtual?: string | null): string {
  if (motivosBloqueio(gates).length > 0) return "bloqueado";
  if (estadoAtual && estadoAtual !== "bloqueado") return estadoAtual;
  return "liberado_preparacao";
}

/**
 * O gate de onboarding está liberado (`estado !== "bloqueado"`)?
 *
 * `onboarding_planos.estado` é derivado só disto: `estadoDoPlano` acima
 * nunca grava outro valor além de "bloqueado"/"liberado_preparacao" pela
 * aplicação. Por isso `estado !== "bloqueado"` é matematicamente igual a
 * `motivos_bloqueio.length === 0` — e `case_plans.motivos_bloqueio`
 * (espelhado desde a migration 2026-09-24) é a fonte preferida, com
 * `onboarding_planos.estado` como fallback enquanto a linha de case_plans
 * daquela fase não existir. Usado por fechamento-caso.functions.ts
 * (onboardingIniciado) e case-service-consolidacao.functions.ts
 * (onboardingLiberado) — mesma regra, um só lugar.
 *
 * 24/09/2026 — regra conservadora, aplicada antes de efetivar a migration:
 * `case_plans.motivos_bloqueio` nasce `[]` por default. Uma linha de
 * case_plans (fase onboarding) criada por outro motor e ainda não
 * espelhada diria "liberado" enquanto onboarding_planos diz "bloqueado".
 * Por isso, com as duas fontes presentes, só libera se AMBAS disserem
 * liberado; divergência = bloqueado até o espelho/backfill alinhar.
 */
export function onboardingLiberadoDoCaso(input: {
  motivosBloqueioCasePlans?: unknown;
  estadoOnboardingPlanos?: string | null;
}): boolean {
  const temEstado = input.estadoOnboardingPlanos != null;
  const liberadoPorEstado = temEstado && input.estadoOnboardingPlanos !== "bloqueado";
  if (Array.isArray(input.motivosBloqueioCasePlans)) {
    const liberadoPorCasePlans = input.motivosBloqueioCasePlans.length === 0;
    return temEstado ? liberadoPorCasePlans && liberadoPorEstado : liberadoPorCasePlans;
  }
  return liberadoPorEstado;
}

/** Onboarding preparado nunca ativa o caso nem abre pesquisa externa. */
export function podeAtivarCliente(): false {
  return false;
}

export type Touchpoint = { marco: string; descricao: string; status: string };

/*
  Marcos derivados da régua única de cadência (cadencia-limiares.ts) — o
  rótulo "D7"/"D10"/"D14" nunca é digitado à mão, para não divergir se o
  limiar mudar.
*/
export const TOUCHPOINTS_PADRAO: Touchpoint[] = [
  { marco: `D${DIAS_PRIMEIRA_MICROENTREGA}`, descricao: "Primeira micro-entrega planejada", status: "planejado" },
  { marco: `D${DIAS_CADENCIA_ATENCAO}`, descricao: "Touchpoint de acompanhamento contextualizado", status: "planejado" },
  { marco: `D${DIAS_CADENCIA_CRITICA}`, descricao: "Limite de atualização contextualizada ao cliente", status: "planejado" },
];

export type ItemChecklistOnboarding = { item: string; responsavel: string; status: string };

export const CHECKLIST_INICIAL_PADRAO: ItemChecklistOnboarding[] = [
  { item: "Contrato assinado no caso", responsavel: "Comercial", status: "pendente" },
  { item: "Pagamento inicial confirmado", responsavel: "Financeiro", status: "pendente" },
  { item: "Dossiê-mãe identificado", responsavel: "Pesquisa", status: "pendente" },
  { item: "Primeira micro-entrega planejada", responsavel: "Operações", status: "pendente" },
];

/**
 * Sinais derivados de dado real (nunca de checkbox): existe micro-entrega em
 * ops_microentregas e o dossiê-mãe do núcleo está ativo (dossieMaeDoCaso).
 * Campo ausente = "não calculado aqui", o item fica como está.
 */
export type DerivadosChecklist = {
  primeiraMicroentrega?: boolean;
  dossieMaeAtivo?: boolean;
};

/**
 * D7: há micro-entrega real do caso? Conta qualquer linha de
 * ops_microentregas não arquivada e não cancelada — planejada já basta
 * (o marco é "planejada até D7", não "concluída").
 */
export function primeiraMicroentregaReal(
  microentregas: { status?: string | null; archived_at?: string | null }[] | null | undefined,
): boolean {
  return (microentregas ?? []).some((m) => !m.archived_at && m.status !== "cancelada");
}

/** Atualiza o checklist pelos gates reais; não inventa item novo se já houver lista. */
export function checklistComGates(
  gates: GatesPlano,
  atual: ItemChecklistOnboarding[] | null | undefined,
  derivados: DerivadosChecklist = {},
): ItemChecklistOnboarding[] {
  const base = atual && atual.length > 0 ? atual : CHECKLIST_INICIAL_PADRAO;
  return base.map((item) => {
    if (/contrato assinado/i.test(item.item) && gates.contrato_assinado) {
      return { ...item, status: "ok" };
    }
    if (/pagamento inicial/i.test(item.item) && gates.pagamento_confirmado) {
      return { ...item, status: "ok" };
    }
    if (/dossi[êe]-m[ãa]e/i.test(item.item) && derivados.dossieMaeAtivo !== undefined) {
      return { ...item, status: derivados.dossieMaeAtivo ? "ok" : "pendente" };
    }
    if (/primeira micro-?entrega/i.test(item.item) && derivados.primeiraMicroentrega !== undefined) {
      return { ...item, status: derivados.primeiraMicroentrega ? "ok" : "pendente" };
    }
    return item;
  });
}

export function planoAcaoDosTouchpoints(): { ordem: number; acao: string; prazo: string }[] {
  return TOUCHPOINTS_PADRAO.map((tp, i) => ({ ordem: i + 1, acao: tp.descricao, prazo: tp.marco }));
}

/** Títulos estáveis — idempotência da tarefa de onboarding. */
export function titulosTarefasDosGates(gates: GatesPlano): string[] {
  const titulos: string[] = [];
  if (!gates.contrato_assinado) titulos.push("Onboarding: registrar contrato assinado");
  if (!gates.pagamento_confirmado) titulos.push("Onboarding: registrar pagamento inicial");
  return titulos;
}

export const TITULO_PRIMEIRA_MICROENTREGA = "Primeira micro-entrega do onboarding";

/** Data prevista de um marco (Dn) a partir do início do onboarding. */
export function dataDoMarco(inicio: string | null | undefined, dias: number): string | null {
  if (!inicio) return null;
  const base = new Date(inicio);
  if (Number.isNaN(base.getTime())) return null;
  const d = new Date(base.getTime() + dias * 86400000);
  return d.toISOString().slice(0, 10);
}
