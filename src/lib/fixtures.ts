/**
 * ANA-SAVE-SEC-01B — origem do dado e visibilidade de fixtures.
 *
 * Fixture de demonstração nunca aparece em Painel Hoje, filas, alertas,
 * cockpit, métricas, App Cliente ou listas operacionais padrão. Ela continua
 * existindo no banco (nunca apagada) e é rotulada quando aberta internamente.
 */

export const FIXTURE_ORIGIN = "fixture_demo";
export const ROTULO_DEMONSTRACAO = "DEMONSTRAÇÃO/FIXTURE";

export type LinhaComOrigem = { data_origin?: string | null; demo?: boolean | null };

/** Verdadeiro quando a linha é fixture de demonstração. */
export function ehFixtureLinha(linha: LinhaComOrigem | null | undefined): boolean {
  if (!linha) return false;
  return (linha.data_origin ?? "") === FIXTURE_ORIGIN || linha.demo === true;
}

/** Remove fixtures de qualquer lista operacional. */
export function semFixtures<T extends LinhaComOrigem>(linhas: readonly T[] | null | undefined): T[] {
  return (linhas ?? []).filter((l) => !ehFixtureLinha(l));
}

/** Mantém apenas fixtures — usado só em telas internas de governança. */
export function apenasFixtures<T extends LinhaComOrigem>(linhas: readonly T[] | null | undefined): T[] {
  return (linhas ?? []).filter((l) => ehFixtureLinha(l));
}

export function rotuloOrigem(linha: LinhaComOrigem | null | undefined): string | null {
  return ehFixtureLinha(linha) ? ROTULO_DEMONSTRACAO : null;
}
