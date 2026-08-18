/**
 * Transições permitidas dos módulos comerciais/financeiros.
 * Fonte compartilhada entre interface e servidor; o banco continua a autoridade final.
 */
export const FLUXO: Record<string, Record<string, string[]>> = {
  proposals: {
    rascunho: ["em_revisao", "enviada", "recusada"],
    em_revisao: ["rascunho", "enviada", "recusada"],
    enviada: ["em_negociacao", "aprovada", "recusada", "expirada"],
    em_negociacao: ["enviada", "aprovada", "recusada", "expirada", "substituida"],
    aprovada: ["substituida"],
    recusada: ["rascunho", "substituida"],
    expirada: ["em_revisao", "enviada", "aprovada", "substituida"],
    substituida: [],
  },

  service_orders: {
    draft: ["approved", "cancelled"],
    pending_approval: ["approved", "cancelled"],
    approved: ["active", "cancelled"],
    active: ["paused", "completed", "cancelled"],
    paused: ["active", "cancelled"],
    completed: [],
    cancelled: [],
    archived: [],
  },
  invoices: {
    rascunho: ["emitida", "cancelada"],
    emitida: ["pendente", "parcialmente_paga", "paga", "vencida", "cancelada"],
    pendente: ["parcialmente_paga", "paga", "vencida", "cancelada"],
    parcialmente_paga: ["paga", "vencida", "cancelada"],
    paga: [],
    vencida: ["parcialmente_paga", "paga", "cancelada"],
    cancelada: [],
  },
};

export function validarFluxo(recurso: string, de: string, para: string) {
  if (de === para) return;
  const permitidas = FLUXO[recurso]?.[de];
  if (!permitidas) return;
  if (!permitidas.includes(para)) {
    throw new Error(`Transição não permitida: ${de} → ${para}.`);
  }
}
