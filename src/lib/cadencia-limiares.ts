/**
 * Limiares únicos da regra de cadência (D7 / D10 / D14).
 *
 * Arquitetura: P3 do PROMPT-MESTRE-MOTORES-A-IMPLANTAR e PRs #75 / #76 / #80.
 * Antes, `onboarding-jornada.ts` (CADENCIA) e `jornada-cliente.ts`
 * (`calcularCadencia`) declaravam 10 = atenção e 14 = crítico cada um por
 * conta própria — mesma regra, duas fontes. `catalogo-top30.functions.ts`
 * e `caso-ficha.ts` repetiam os números.
 *
 * Sem tabela nova: os limiares alimentam `case_plans`, `crm_casos.ultimo_touchpoint_em`,
 * `onboarding_planos` e `client_deliverables` já existentes. Não criar
 * `cadence_runs`.
 */
export const DIAS_PRIMEIRA_MICROENTREGA = 7;
export const DIAS_CADENCIA_ATENCAO = 10;
export const DIAS_CADENCIA_CRITICA = 14;
