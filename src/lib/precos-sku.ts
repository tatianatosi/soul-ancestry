/**
 * Regra institucional — preço e condição de SKU.
 *
 * Única fonte oficial: Planilha Mestre homologada para SKU ativo.
 * Planejador, WhatsApp, transcrição, template, proposta antiga ou dado manual
 * não valem como preço. Exceção comercial exige aprovação humana, motivo,
 * validade, responsável e auditoria.
 */

export const FONTES_OFICIAIS_PRECO = ["planilha_mestre", "excecao_comercial_aprovada"] as const;

export const FONTES_NAO_OFICIAIS_PRECO = [
  "planejador",
  "whatsapp",
  "transcricao",
  "template",
  "proposta_antiga",
  "manual",
] as const;

export const ROTULO_FONTE_PRECO: Record<string, string> = {
  planilha_mestre: "Planilha Mestre (homologada)",
  excecao_comercial_aprovada: "Exceção comercial aprovada",
  planejador: "Planejador",
  whatsapp: "WhatsApp",
  transcricao: "Transcrição",
  template: "Template",
  proposta_antiga: "Proposta antiga",
  manual: "Dado manual",
};

export function fonteOficialDePreco(origem?: string | null): boolean {
  if (!origem) return false;
  return (FONTES_OFICIAIS_PRECO as readonly string[]).includes(origem);
}

export type ConferenciaPreco = {
  ok: boolean;
  motivo?: string;
  fonte?: string;
  sku?: string;
  nome?: string | null;
  moeda?: string | null;
  preco_total?: number | null;
  condicao_pagamento?: string | null;
  parcelas?: number | null;
  excecao_valida_ate?: string | null;
};

/** Extrai o código do SKU de um valor parametrizado ("CA-CID-AT-001 — nome"). */
export function extrairSku(valor?: string | null): string | null {
  if (!valor) return null;
  const m = valor.match(/CA-[A-Z0-9]+(?:-[A-Z0-9]+)+/i);
  return m ? m[0].toUpperCase() : null;
}

/** Gates que dependem de preço homologado. */
export function bloqueiosDePreco(c: ConferenciaPreco | null): string[] {
  if (!c) return ["Conferência de preço não executada."];
  if (c.ok) return [];
  return [c.motivo ?? "SKU sem preço/condição homologados: valor, cobrança e checkout bloqueados."];
}

export type SolicitacaoExcecaoComercial = {
  sku: string;
  caseId: string;
  motivo: string;
  precoTotal: number;
  condicaoPagamento: string;
  validoAte: string;
};

export const MOTIVO_MINIMO_EXCECAO_COMERCIAL = 15;

/**
 * Validação pura da exceção comercial de preço/SKU, espelhando exatamente o
 * que `fn_sku_price_exception_guard` (trigger em `sku_price_exceptions`)
 * exige para aceitar uma exceção já aprovada: motivo, preço/condição e
 * validade futura. Só o banco decide de fato — isto só evita uma viagem ao
 * servidor para um erro já previsível na tela.
 */
export function validarExcecaoComercial(s: SolicitacaoExcecaoComercial): { valida: boolean; erros: string[] } {
  const erros: string[] = [];
  if (!s.sku?.trim()) erros.push("SKU obrigatório.");
  if (!s.caseId?.trim()) erros.push("Caso obrigatório.");
  if ((s.motivo ?? "").trim().length < MOTIVO_MINIMO_EXCECAO_COMERCIAL) {
    erros.push(`Motivo obrigatório e específico, com pelo menos ${MOTIVO_MINIMO_EXCECAO_COMERCIAL} caracteres.`);
  }
  if (!(s.precoTotal > 0)) erros.push("Preço total deve ser maior que zero.");
  if (!s.condicaoPagamento?.trim()) erros.push("Condição de pagamento obrigatória.");
  if (!s.validoAte?.trim() || Number.isNaN(Date.parse(s.validoAte))) {
    erros.push("Validade obrigatória e válida.");
  } else if (new Date(s.validoAte).getTime() < Date.now()) {
    erros.push("Validade da exceção precisa ser uma data futura.");
  }
  return { valida: erros.length === 0, erros };
}

export const REGRAS_PRECO_SKU = [
  "Proposta, contrato e checkout só podem usar preço/condição homologados da Planilha Mestre para SKU ativo.",
  "Planejador, WhatsApp, transcrição, template, proposta antiga ou dado manual não são fontes oficiais de preço.",
  "SKU sem preço/condição homologados não pode gerar valor, cobrança ou checkout.",
  "Exceção comercial exige aprovação humana, motivo, validade, responsável e auditoria.",
  "Asaas recebe somente condição contratual aprovada, com assinatura e gates aplicáveis.",
];
