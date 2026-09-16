/**
 * Seção de superfície do Desk.
 *
 * As telas que antes viviam nas prévias `/golive/*` agora entram dentro da
 * tela dona, com o mesmo shell aprovado do Desk. Aqui só há o cabeçalho de
 * contexto e o empilhamento do conteúdo — nenhuma navegação paralela.
 */
import type { ReactNode } from "react";

export function SuperficieGoLive({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  // O título e o apoio já vêm do cabeçalho da tela dona: repetir aqui criaria
  // dois títulos na mesma dobra.
  void titulo;
  void descricao;
  return <section className="min-w-0 space-y-5">{children}</section>;
}
