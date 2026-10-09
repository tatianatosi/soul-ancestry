/**
 * Aviso de edição não salva — "F5 / sair da linha", em uma linha por tela.
 *
 * Achado medido em 09/10/2026: das 45 rotas do Desk com estado de formulário
 * local (`useState`), só UMA tinha proteção contra sair com edição pendente —
 * o padrão foi escrito uma vez em `casos.$caseId.index.tsx` (Corte 1, 27/09) e
 * nunca generalizado. As duas telas mais usadas no fechamento do caso real
 * (Pessoa 360, Contrato › preparar) estavam sem nenhuma. "Primeira fase sem
 * continuidade", exatamente como a Proprietária descreveu.
 *
 * Este módulo não decide o que é "sujo": cada tela sabe disso (quase sempre
 * `Object.keys(rascunho).length > 0`). O que ele elimina é a reescrita, tela a
 * tela, das duas metades que o padrão exige — o aviso do navegador (recarregar
 * ou fechar a aba) e o bloqueio da navegação interna do Desk.
 */

import { useEffect } from "react";
import { useBlocker } from "@tanstack/react-router";

/** Mensagem única — mesmo texto em toda tela que usa o hook. */
export const AVISO_EDICAO_NAO_SALVA =
  "Há uma edição não salva nesta tela. Sair agora descarta o que foi digitado.";

/**
 * Handler puro do `beforeunload`. Exportado para teste e para telas que
 * precisem registrar o listener por conta própria.
 */
export function handlerBeforeUnload(e: BeforeUnloadEvent): void {
  e.preventDefault();
  e.returnValue = "";
}

/**
 * Trava a saída enquanto houver edição pendente: aviso do navegador (F5,
 * fechar aba) + bloqueio da navegação interna entre rotas/abas do Desk.
 *
 * Uso, uma linha por tela:
 *
 *     const sujo = Object.keys(form).length > 0;
 *     useAvisoEdicaoNaoSalva(sujo);
 *
 * Com `sujo === false` o hook não registra nada — nenhuma tela paga custo por
 * estar limpa.
 */
export function useAvisoEdicaoNaoSalva(sujo: boolean) {
  useEffect(() => {
    if (!sujo) return;
    window.addEventListener("beforeunload", handlerBeforeUnload);
    return () => window.removeEventListener("beforeunload", handlerBeforeUnload);
  }, [sujo]);

  /**
   * Devolvido para a tela que quer desenhar a própria confirmação (Caso 360
   * já desenhava a sua antes deste módulo existir). Quem não usa o retorno
   * fica com o diálogo padrão do router — é o caso da maioria das telas.
   */
  return useBlocker({
    shouldBlockFn: () => sujo,
    enableBeforeUnload: false,
    withResolver: true,
  });
}
