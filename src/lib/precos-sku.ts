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

export const REGRAS_PRECO_SKU = [
  "Proposta, contrato e checkout só podem usar preço/condição homologados da Planilha Mestre para SKU ativo.",
  "Planejador, WhatsApp, transcrição, template, proposta antiga ou dado manual não são fontes oficiais de preço.",
  "SKU sem preço/condição homologados não pode gerar valor, cobrança ou checkout.",
  "Exceção comercial exige aprovação humana, motivo, validade, responsável e auditoria.",
  "Asaas recebe somente condição contratual aprovada, com assinatura e gates aplicáveis.",
];
