/**
 * Plano de onboarding do caso — preparação, nunca ativação.
 *
 * O plano nasce Bloqueado e só pode ser liberado para preparação quando
 * contrato assinado e pagamento inicial confirmado existirem como fato
 * registrado. Nada aqui envia boas-vindas, gera magic link, publica App,
 * cria pasta ou grupo externo.
 */

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

export const TOUCHPOINTS_PADRAO: Touchpoint[] = [
  { marco: "D7", descricao: "Primeira micro-entrega planejada", status: "planejado" },
  { marco: "D10", descricao: "Touchpoint de acompanhamento contextualizado", status: "planejado" },
  { marco: "D14", descricao: "Limite de atualização contextualizada ao cliente", status: "planejado" },
];

/** Data prevista de um marco (Dn) a partir do início do onboarding. */
export function dataDoMarco(inicio: string | null | undefined, dias: number): string | null {
  if (!inicio) return null;
  const base = new Date(inicio);
  if (Number.isNaN(base.getTime())) return null;
  const d = new Date(base.getTime() + dias * 86400000);
  return d.toISOString().slice(0, 10);
}
