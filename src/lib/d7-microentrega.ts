/**
 * P3 (25/09/2026) — D7 de verdade.
 *
 * A primeira micro-entrega (D7) morava em quatro lugares: a linha real em
 * `ops_microentregas`, a caixinha manual `onboarding_checklist.micro_entrega_d7`
 * (obrigatória, segurava a ativação no banco), o item do `checklist_inicial`
 * do plano e o gate `primeira_microentrega` da jornada. A fonte operacional é
 * uma só: `ops_microentregas`. Tudo o mais é espelho derivado, gravado pelo
 * reconciliador (`d7-microentrega.server.ts`). Nada aqui grava; só decide.
 */
import { DIAS_PRIMEIRA_MICROENTREGA } from "@/lib/cadencia-limiares";
import { dataDoMarco } from "@/lib/onboarding-plano";

/** Código do item de `onboarding_checklist` que espelha o D7. */
export const ITEM_CODE_D7 = "micro_entrega_d7";

/** Prefixo da observação gravada pelo espelho — distingue derivado de manual. */
export const MARCA_DERIVADO_D7 = "Derivado de ops_microentregas";

export const CRITERIO_ACEITE_D7 =
  "Primeira entrega de valor do caso registrada e revisada internamente antes de qualquer publicação.";

export type MicroD7 = {
  id: string;
  titulo?: string | null;
  status?: string | null;
  prazo?: string | null;
  responsavel_id?: string | null;
  archived_at?: string | null;
  created_at?: string | null;
};

/** Micro-entrega que conta como D7: a mais antiga ativa (não arquivada, não cancelada). */
export function microentregaD7<T extends MicroD7>(linhas: T[] | null | undefined): T | null {
  const ativas = (linhas ?? []).filter((m) => !m.archived_at && m.status !== "cancelada");
  if (!ativas.length) return null;
  return [...ativas].sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")))[0];
}

/** Prazo D7: D0 do onboarding + 7; sem D0, hoje + 7. */
export function prazoD7(onboardingIniciadoEm: string | null | undefined, hojeIso: string): string {
  return (
    dataDoMarco(onboardingIniciadoEm, DIAS_PRIMEIRA_MICROENTREGA) ??
    (dataDoMarco(hojeIso, DIAS_PRIMEIRA_MICROENTREGA) as string)
  );
}

/** O que falta na micro-entrega D7 para ela ser operável. */
export function lacunasD7(micro: MicroD7 | null): string[] {
  if (!micro) return [];
  const faltas: string[] = [];
  if (!micro.responsavel_id) faltas.push("sem responsável");
  if (!micro.prazo) faltas.push("sem prazo");
  return faltas;
}

/** Próxima ação do D7, derivada do dado real. */
export function proximaAcaoD7(micro: MicroD7 | null): string {
  if (!micro) return "Criar a primeira micro-entrega do caso (D7).";
  if (micro.status === "concluida") return "Micro-entrega D7 concluída — seguir a cadência D10/D14.";
  const faltas = lacunasD7(micro);
  if (faltas.length) return `Completar a micro-entrega D7 (${faltas.join(", ")}).`;
  return `Entregar "${micro.titulo ?? "micro-entrega"}" até ${String(micro.prazo).slice(0, 10)}.`;
}

export function observacaoDerivadaD7(micro: MicroD7): string {
  return `${MARCA_DERIVADO_D7} ${micro.id}: ${micro.titulo ?? "micro-entrega"}`;
}

/**
 * Espelho do item `micro_entrega_d7`. Devolve o patch a gravar ou `null`
 * quando nada muda. Nunca desfaz um "não aplicável" humano; só volta a
 * pendente o que o próprio espelho concluiu.
 */
export function patchChecklistD7(
  micro: MicroD7 | null,
  item: { status?: string | null; observacao?: string | null },
): { status: "concluido" | "pendente"; observacao: string | null } | null {
  if (item.status === "nao_aplicavel") return null;
  if (micro) {
    const observacao = observacaoDerivadaD7(micro);
    if (item.status === "concluido" && item.observacao === observacao) return null;
    return { status: "concluido", observacao };
  }
  if (item.status === "concluido" && String(item.observacao ?? "").startsWith(MARCA_DERIVADO_D7)) {
    return { status: "pendente", observacao: null };
  }
  return null;
}

/** Alerta interno: passou do D7 do onboarding e não há micro-entrega. */
export function alertaD7Devido(input: {
  micro: MicroD7 | null;
  onboardingIniciadoEm: string | null | undefined;
  hojeIso: string;
}): boolean {
  if (input.micro) return false;
  const limite = dataDoMarco(input.onboardingIniciadoEm, DIAS_PRIMEIRA_MICROENTREGA);
  return Boolean(limite && input.hojeIso.slice(0, 10) > limite);
}

/**
 * Tick manual no item D7: "concluído"/"pendente" não se marcam à mão — o
 * reconciliador decide pelo dado real. Só "não aplicável" (com evidência)
 * continua manual. Devolve a mensagem de recusa ou `null`.
 */
export function recusaTickManualD7(itemCode: string | null | undefined, status: string): string | null {
  if (itemCode !== ITEM_CODE_D7) return null;
  if (status === "nao_aplicavel") return null;
  return "O D7 segue a micro-entrega real do caso (ops_microentregas): use \"Criar ou reconciliar micro-entrega D7\" no Caso 360, aba Onboarding.";
}

/** Contagem do cartão "SLA em risco" do Painel Hoje. */
export function contarSlaEmRisco(input: {
  microentregas: { caso_id?: string | null; prazo_status?: string | null }[];
  tarefas: { caso_id?: string | null; sla_status?: string | null }[];
  casosVisiveis: Set<string>;
}): { total: number; microentregas: number; tarefas: number } {
  const risco = (s: unknown) => s === "em_risco" || s === "atrasada";
  const visivel = (id: unknown) => input.casosVisiveis.has(String(id ?? ""));
  const microentregas = input.microentregas.filter((m) => risco(m.prazo_status) && visivel(m.caso_id)).length;
  const tarefas = input.tarefas.filter((t) => risco(t.sla_status) && visivel(t.caso_id)).length;
  return { total: microentregas + tarefas, microentregas, tarefas };
}
