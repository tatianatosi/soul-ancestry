/**
 * Inventário classificado dos `createServerFn` sem chamador de tela.
 *
 * Corte F (05/10/2026) — a fila RELIGAR foi zerada: as 8 funções que ela
 * nomeava passaram a ser chamadas por tela. Três entradas que eu havia posto
 * em RELIGAR estavam **classificadas erradas por mim** e foram corrigidas
 * depois de medir o repositório, não religadas: religá-las criaria um segundo
 * caminho vivo para o que já chega à tela por outro, que é exatamente o que o
 * AGENTS.md proíbe. O veredicto está em cada entrada, com a função que faz o
 * trabalho hoje.
 *
 * Regra do AGENTS.md para peça órfã: **religada com prova de uso** ou
 * **aposentada com classificação**, nunca apagada em silêncio. Até aqui a
 * varredura era manual e recomeçava a cada rodada; este registro a congela:
 * o teste que o acompanha falha quando aparece órfã nova sem veredicto.
 *
 * Medido em 04/10/2026 pela varredura que acompanha este arquivo: 32 funções sem chamador em
 * `src/routes` ou `src/components`. Nenhuma linha de código é apagada por
 * este arquivo — ele só diz, por escrito, o que cada uma é.
 */

export type VeredictoOrfa =
  /**
   * Religar: fecha lacuna real de operação. Entra na fila de execução.
   * Vazio depois do Corte F — e vazio aqui é o objetivo, não uma falha.
   */
  | "RELIGAR"
  /** Casca duplicada: a lógica já chega à tela por outro caminho. Não religar. */
  | "CASCA_DUPLICADA"
  /** Aposentada com classificação: a função que a substituiu está nomeada. */
  | "APOSENTADA_CLASSIFICADA"
  /** Depende de decisão da Proprietária antes de qualquer religação. */
  | "AGUARDA_DECISAO";

export type OrfaClassificada = {
  modulo: string;
  fn: string;
  veredicto: VeredictoOrfa;
  /** Por que, em uma frase. Sem isto o registro não vale nada. */
  motivo: string;
  /** Para RELIGAR: onde a tela deve chamar. Para o resto: quem faz o trabalho hoje. */
  destino: string;
};

export const ORFAS_CLASSIFICADAS: OrfaClassificada[] = [
  /*
   * 31/10/2026 — religadas a telas e retiradas daqui (a regra do teste manda
   * tirar o que voltou a ter chamador): evidência canônica (4), perfil
   * institucional (2), `ativarCaso`, GoLive (5), piloto 5A.1 (5), piloto da
   * Ana (3) e `radarMarcosJuridicosDoPainel`. Ficaram só as duas leituras do
   * portal, aposentadas, e uma casca nova.
   */
  {
    modulo: "pesquisa-cadeia.functions.ts",
    fn: "mudarEstadoEvidencia",
    veredicto: "CASCA_DUPLICADA",
    motivo:
      "Ficou sem chamador quando a tela de evidências passou a usar `mudarSituacaoEvidencia`, que tem o gate de papel no servidor.",
    destino: "src/lib/evidencia-canonica.functions.ts#mudarSituacaoEvidencia",
  },
  {
    modulo: "portal.functions.ts",
    fn: "portalCaso",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo: "Reader sanitizado sem consumidor: as 7 abas do App leem por `portal-dados-vivos`.",
    destino: "src/lib/portal-dados-vivos.functions.ts",
  },
  {
    modulo: "portal.functions.ts",
    fn: "portalDocumentos",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo: "Mesma dívida declarada: a aba Documentos do App lê por `minhasEntregas`.",
    destino: "src/lib/portal-cliente.server.ts#minhasEntregas",
  },
];

export function orfasPor(veredicto: VeredictoOrfa): OrfaClassificada[] {
  return ORFAS_CLASSIFICADAS.filter((o) => o.veredicto === veredicto);
}

/** Chave estável `modulo#fn`, do jeito que a varredura reporta. */
export function chaveOrfa(o: Pick<OrfaClassificada, "modulo" | "fn">): string {
  return `${o.modulo}#${o.fn}`;
}
