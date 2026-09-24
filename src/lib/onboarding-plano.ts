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

/** Atualiza o checklist pelos gates reais; não inventa item novo se já houver lista. */
export function checklistComGates(
  gates: GatesPlano,
  atual: ItemChecklistOnboarding[] | null | undefined,
): ItemChecklistOnboarding[] {
  const base = atual && atual.length > 0 ? atual : CHECKLIST_INICIAL_PADRAO;
  return base.map((item) => {
    if (/contrato assinado/i.test(item.item) && gates.contrato_assinado) {
      return { ...item, status: "ok" };
    }
    if (/pagamento inicial/i.test(item.item) && gates.pagamento_confirmado) {
      return { ...item, status: "ok" };
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
