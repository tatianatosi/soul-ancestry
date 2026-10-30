/**
 * Rótulo do selo do caso no vocabulário da FAMÍLIA (L3, 24/10/2026).
 * O selo nunca mostra o estado operacional do Desk ("Pronto para ativar",
 * "Aguardando pagamento"…) nem "Não registrado": a fase interna de
 * preparação vira "Em preparação"; sem status conhecido, o selo some.
 */
export function rotuloSeloCaso(status: string | null | undefined, ativo?: boolean): string | null {
  if (ativo || status === "ativo") return "Caso ativo";
  switch (status) {
    case "rascunho":
    case "aguardando_documentos":
    case "aguardando_pagamento":
    case "pronto_para_ativar":
      return "Em preparação";
    case "pausado":
      return "Caso pausado";
    case "concluido":
      return "Caso concluído";
    case "encerrado":
    case "arquivado":
      return "Caso encerrado";
    default:
      return null;
  }
}
