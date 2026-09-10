/**
 * Leitura de consulta sem silêncio.
 *
 * Diagnóstico de 05/09/2026: havia 353 pontos no servidor escrevendo
 * `consulta.data ?? []`. Quando a consulta falhava — rede, token, política do
 * banco — `data` vinha nulo, o erro era descartado e a tela recebia lista
 * vazia. A proprietária via "nenhum registro" e concluía que o aplicativo não
 * funcionava. Era falha de carga travestida de base vazia.
 *
 * `linhas()` recusa esse silêncio: se a consulta falhou, lança com o contexto
 * legível. A interface trata o erro em `EstadoDados`, mostrando causa e
 * caminho de correção.
 */

export type ResultadoConsulta<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/** Linhas da consulta. Lança quando a consulta falhou, em vez de devolver vazio. */
export function linhas<T>(resultado: ResultadoConsulta<T>, contexto: string): T[] {
  if (resultado?.error) {
    throw new Error(`Falha ao carregar ${contexto}: ${resultado.error.message}`);
  }
  return resultado?.data ?? [];
}

/** Uma linha da consulta, ou null quando não existe. Lança quando falhou. */
export function linha<T>(
  resultado: { data: T | null; error: { message: string } | null },
  contexto: string,
): T | null {
  if (resultado?.error) {
    throw new Error(`Falha ao carregar ${contexto}: ${resultado.error.message}`);
  }
  return resultado?.data ?? null;
}
