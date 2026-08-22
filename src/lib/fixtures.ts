/**
 * ANA-SAVE-SEC-01B — origem do dado e visibilidade de fixtures.
 *
 * Fixture de demonstração nunca aparece em Painel Hoje, filas, alertas,
 * cockpit, métricas, App Cliente ou listas operacionais padrão. Ela continua
 * existindo no banco (nunca apagada) e é rotulada quando aberta internamente.
 */

export const FIXTURE_ORIGIN = "fixture_demo";
export const ROTULO_DEMONSTRACAO = "DEMONSTRAÇÃO/FIXTURE";

export type LinhaComOrigem = {
  data_origin?: string | null;
  demo?: boolean | null;
  is_demo?: boolean | null;
  dados_teste?: boolean | null;
  codigo?: string | null;
  titulo?: string | null;
  nome?: string | null;
};

/**
 * Rede de segurança determinística de exibição: código/título marcados como
 * TESTE, DEMO ou FIXTURE contam como fixture mesmo quando a coluna booleana
 * ainda não foi corrigida no banco. Nada é apagado nem alterado por isto.
 */
const PADRAO_ROTULO_DEMO = /\b(teste|demo|demonstra\w*|fixture|sandbox)\b/i;

export function rotuloIndicaDemo(texto: string | null | undefined): boolean {
  return PADRAO_ROTULO_DEMO.test(texto ?? "");
}

/** Verdadeiro quando a linha é fixture de demonstração ou massa de teste. */
export function ehFixtureLinha(linha: LinhaComOrigem | null | undefined): boolean {
  if (!linha) return false;
  if ((linha.data_origin ?? "") === FIXTURE_ORIGIN) return true;
  if (linha.demo === true || linha.is_demo === true || linha.dados_teste === true) return true;
  return [linha.codigo, linha.titulo, linha.nome].some(rotuloIndicaDemo);
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
