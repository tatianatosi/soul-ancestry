/**
 * Resiliência a falhas de rede no App Cliente (12/10/2026).
 *
 * Regra: falha de rede nunca vira ausência de dados. Toda consulta do portal
 * termina em sucesso, vazio honesto ou erro com "Tentar novamente" — nunca
 * em espera infinita.
 */

export const TIMEOUT_PADRAO_PORTAL_MS = 15_000;

export class TempoEsgotadoError extends Error {
  constructor(ms: number) {
    super(`Tempo de resposta esgotado (${ms} ms).`);
    this.name = "TempoEsgotadoError";
  }
}

/** Rejeita se a promessa não resolver em `ms`. */
export function comTimeout<T>(promessa: Promise<T>, ms: number = TIMEOUT_PADRAO_PORTAL_MS): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const limite = new Promise<never>((_, rejeitar) => {
    id = setTimeout(() => rejeitar(new TempoEsgotadoError(ms)), ms);
  });
  return Promise.race([promessa, limite]).finally(() => {
    if (id !== undefined) clearTimeout(id);
  });
}

export type EstadoCarga = "carregando" | "erro" | "vazio" | "dados";

/**
 * Erro ≠ vazio. Com dado já exibido, falha de atualização em segundo plano
 * mantém os dados (não apaga a tela).
 */
export function estadoDaCarga({
  carregando,
  erro,
  temDados,
  vazio,
}: {
  carregando: boolean;
  erro: boolean;
  temDados: boolean;
  vazio: boolean;
}): EstadoCarga {
  if (temDados) return vazio ? "vazio" : "dados";
  if (carregando) return "carregando";
  if (erro) return "erro";
  return "erro"; // sem dado, sem erro e sem carga: falha de contrato, nunca vazio.
}

export const MENSAGEM_CONTEUDO_MANTIDO = "Falha de conexão — seu conteúdo foi mantido.";
export const MENSAGEM_INSTABILIDADE_FINANCEIRA = "Instabilidade de conexão ao carregar seus dados financeiros.";
