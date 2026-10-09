/**
 * Aviso de edição não salva — extraído do padrão já provado em
 * `casos.$caseId.index.tsx` (Corte 1, 27/09/2026) para reuso em qualquer tela.
 *
 * Achado (09/10/2026): esse padrão foi escrito uma vez, naquela tela, e nunca
 * generalizado — das 45 rotas do Desk com estado de formulário local
 * (`useState`), só UMA tinha proteção contra sair com edição pendente. As
 * duas telas mais usadas no fechamento do caso real (Pessoa 360, Contrato ›
 * preparar) estavam sem nenhuma. "Primeira fase sem continuidade" —
 * exatamente o apontado.
 *
 * Este módulo não decide o que é "sujo": cada tela sabe isso (normalmente
 * `Object.keys(rascunho).length > 0`). Aqui só ficam as DUAS partes que eram
 * reescritas à mão em cada tela: o aviso do navegador (fechar aba/recarregar)
 * e o texto padrão de confirmação ao sair pela navegação interna.
 */

/** Mensagem única de confirmação — mesmo texto em toda tela que usar o hook. */
export const AVISO_EDICAO_NAO_SALVA =
  "Há uma edição não salva nesta tela. Sair agora descarta o que foi digitado.";

/**
 * Handler puro para o evento `beforeunload`. Só READ/preventDefault — a tela
 * decide quando registrar/remover o listener (useEffect dependente de `sujo`).
 */
export function handlerBeforeUnload(e: BeforeUnloadEvent): void {
  e.preventDefault();
  e.returnValue = "";
}
