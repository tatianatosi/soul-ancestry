/**
 * Versão do renderizador do contrato (09/10/2026).
 *
 * Suba este valor SEMPRE que a saída de `renderCorpoContratual` ou de
 * `montarPrevia` mudar — texto, ordem, origem declarada, rótulo. A prévia
 * gravada guarda a versão que a produziu (`renderizador_versao`); se for
 * diferente desta, a tela mostra "Prévia desatualizada" e PDF, revisão e
 * assinatura ficam bloqueados até regerar.
 *
 * Sem isso, a regra de defasagem só olhava os parâmetros: corrigir o
 * renderizador deixava a prévia velha liberada com o texto errado — foi o que
 * aconteceu com a origem do objeto no contrato da Ana.
 *
 * Histórico:
 *  - 2026-10-09.1 — origem do objeto e da contratada vem do parâmetro
 *    (`fonteDeclarada`); escopo de valor zero não repete "sem cobrança própria".
 */
export const RENDERIZADOR_VERSAO = "2026-10-09.1";
