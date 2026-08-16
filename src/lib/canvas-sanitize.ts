/**
 * Sanitização de textos cliente-facing do Canvas.
 *
 * Regra: o Canvas nunca deve expor juízo de mérito sobre o caso
 * ("hipótese forte", "potencial alto", "chance alta", probabilidades etc.).
 * O texto interno permanece intacto no banco; apenas a saída é neutralizada.
 */

const EXPRESSOES_DE_MERITO = [
  /hip[óo]tese\s+(muito\s+)?(forte|fraca|s[óo]lida|frágil|fragil)/gi,
  /potencial\s+(alto|baixo|forte|fraco|elevado)/gi,
  /chance[s]?\s+(alta[s]?|baixa[s]?|boa[s]?)/gi,
  /(alta|baixa)\s+probabilidade/gi,
  /prov[áa]vel\s+(êxito|exito|sucesso|deferimento)/gi,
  /(quase\s+)?(certo|garantido|garantia\s+de\s+êxito)/gi,
  /\b\d{1,3}\s*%\s*(de\s+)?(chance|êxito|exito|sucesso|aprova[çc][ãa]o)/gi,
];

/** Remove juízo de mérito de um rótulo exibido ao cliente. */
export function sanitizarRotuloCliente(texto: string | null): string | null {
  if (!texto) return texto;

  let saida = texto;
  for (const re of EXPRESSOES_DE_MERITO) {
    saida = saida.replace(re, "em análise");
  }

  // "X — em análise em análise" / duplicidades geradas pela substituição
  saida = saida.replace(/(em\s+análise)(\s*[—\-,]?\s*em\s+análise)+/gi, "em análise");
  // Sobras de conectores no fim do texto
  saida = saida.replace(/\s*[—\-–]\s*$/g, "");
  saida = saida.replace(/\s{2,}/g, " ").trim();

  return saida.length > 0 ? saida : null;
}
