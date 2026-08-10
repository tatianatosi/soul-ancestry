/**
 * Ancestral Canvas — saneamento de copy cliente-facing (Fase 1).
 *
 * Remove marcações técnicas que nunca devem aparecer para o cliente:
 * placeholders, colchetes, IDs de caso, SKUs, valores vazios e sobras
 * de concatenação. Não altera dados de origem — apenas a exibição.
 */

const PADROES_TECNICOS: RegExp[] = [
  /\{\{[^}]*\}\}/g, // {{PLACEHOLDER}}
  /\bCA-[A-Z0-9]+(?:-[A-Z0-9]+)+\b/g, // IDs de caso e SKUs
  /\b(?:PACOTE|NAT)-[A-Z0-9]+(?:-[A-Z0-9]+)*\b/g, // SKUs de pacote
  /\bT-\d{3}\b/g, // códigos internos de checklist
  /§\s?\d+[a-z]?\s?StbG/gi, // referência legal técnica
];

const VAZIOS = new Set(["", "—", "-", "undefined", "null", "n/a", "na", "todo", "placeholder"]);

/** Limpa uma string para exibição ao cliente. Retorna "" quando não sobra conteúdo útil. */
export function limparCopy(valor: unknown): string {
  if (typeof valor !== "string") return "";
  let s = valor;
  for (const re of PADROES_TECNICOS) s = s.replace(re, "");
  s = s
    .replace(/\(\s*[.,;·-]*\s*\)/g, "") // parênteses que ficaram vazios
    .replace(/\[\s*\]/g, "")
    .replace(/[[\]{}]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/·\s*·/g, "·")
    .replace(/^[\s·,;:—-]+|[\s·,;:—-]+$/g, "")
    .trim();
  if (VAZIOS.has(s.toLowerCase())) return "";
  return s;
}

/** Limpa uma lista, descartando itens que ficaram vazios ou duplicados. */
export function limparLista(itens: unknown[]): string[] {
  const out: string[] = [];
  for (const i of itens) {
    const s = limparCopy(i);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

/** Primeiro valor não vazio, já limpo; senão a mensagem institucional informada. */
export function primeiroOuMensagem(valores: unknown[], mensagem: string): string {
  for (const v of valores) {
    const s = limparCopy(v);
    if (s) return s;
  }
  return mensagem;
}
