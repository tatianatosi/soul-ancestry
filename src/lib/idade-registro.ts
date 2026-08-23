/**
 * Idade de um registro em dias, calculada sobre data real já persistida.
 * Nunca estima nem simula: sem data válida, devolve null e a UI não exibe nada.
 */
export function diasDesde(valor: unknown, agora: Date = new Date()): number | null {
  if (typeof valor !== "string" && !(valor instanceof Date)) return null;
  const d = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  const ms = agora.getTime() - d.getTime();
  if (ms < 0) return 0;
  return Math.floor(ms / 86_400_000);
}

/** Tom visual por limiar de atenção (padrão: 7 dias). */
export function tomIdade(dias: number | null, limiar = 7): "neutro" | "alerta" {
  if (dias === null) return "neutro";
  return dias >= limiar ? "alerta" : "neutro";
}

export function rotuloIdade(dias: number | null, sufixo = "sem retorno"): string | null {
  if (dias === null) return null;
  if (dias === 0) return `hoje · ${sufixo}`;
  return `há ${dias} ${dias === 1 ? "dia" : "dias"} ${sufixo}`;
}
