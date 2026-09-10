/**
 * Limiares de dia únicos da regra de cadência (D7/D10/D14).
 *
 * Antes desta extração, `onboarding-jornada.ts` (CADENCIA) e
 * `jornada-cliente.ts` (calcularCadencia) declaravam os mesmos números
 * (10 dias = atenção, 14 dias = crítico) de forma independente — mesma
 * regra, duas fontes. Achado do de-para de onboarding/cadência (PR #75) e
 * confirmado de novo ao investigar a ligação entre o Planejador
 * (case_plans) e a orquestração de jornada (orquestracao-jornada.ts).
 *
 * Este módulo não muda nenhum comportamento: os dois módulos passam a
 * importar os mesmos três números em vez de redeclará-los.
 */
export const DIAS_PRIMEIRA_MICROENTREGA = 7;
export const DIAS_CADENCIA_ATENCAO = 10;
export const DIAS_CADENCIA_CRITICA = 14;
