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
  /* ---------- casca duplicada: a lógica já chega à tela ---------- */
  ...(
    [
      "listarEvidenciasDoCaso",
      "salvarEvidenciaCanonica",
      "mudarSituacaoEvidencia",
      "arquivarEvidenciaCanonica",
    ] as const
  ).map((fn) => ({
    modulo: "evidencia-canonica.functions.ts",
    fn,
    veredicto: "CASCA_DUPLICADA" as const,
    motivo:
      "As 4 rotas de evidência chamam o núcleo por `evidencia-canonica.server.ts`; esta camada HTTP ficou sem uso depois do Corte 0.",
    destino: "src/lib/evidencia-canonica.server.ts (núcleo já em uso pelas 4 rotas)",
  })),
  {
    modulo: "golive-escritores.functions.ts",
    fn: "publicarNoAppGoLive",
    veredicto: "CASCA_DUPLICADA",
    motivo: "Virou caminho secundário depois que o rascunho editável passou a ser o fluxo de publicação.",
    destino: "Rascunho editável + publicação na Biblioteca de Evidências",
  },

  /* ---------- aposentada com classificação ---------- */
  {
    modulo: "contrato-preparar.functions.ts",
    fn: "auditoriaPreparacao",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      'Saiu da tela de contrato em 04/10/2026 ("retire as auditorias repetidas"): era a terceira cópia do mesmo registro.',
    destino: "listarAuditoria em /configuracoes — trilha única da organização",
  },
  ...(["registrarPerfilInstitucional", "registrarSnapshotInstitucional"] as const).map((fn) => ({
    modulo: "perfil-institucional-persistido.functions.ts",
    fn,
    veredicto: "CASCA_DUPLICADA" as const,
    motivo:
      "Corte F: eu havia classificado como RELIGAR sem medir. O perfil institucional JÁ chega à tela por `garantirPerfilInstitucionalDaSessao` (montada em casos.$caseId.contrato.preparar) e o snapshot JÁ é gravado por `gravarSnapshotInstitucional`, chamado em três pontos de contratos.functions.ts. Estas duas são a versão crua: a primeira pede `organizationId` ao cliente — o mesmo dado que o wrapper deriva no servidor.",
    destino:
      "src/lib/perfil-institucional-persistido.server.ts#garantirPerfilInstitucional e #gravarSnapshotInstitucional (ambos em uso)",
  })),
  {
    modulo: "saas.functions.ts",
    fn: "ativarCaso",
    veredicto: "APOSENTADA_CLASSIFICADA",
    motivo:
      "Corte F: eu havia classificado como RELIGAR sem medir. `ativarCasoComChecks` (onboarding.functions.ts) já está montada em /onboarding/$id e é mais forte — gate de papel, RPC case_ativacao_bloqueios_reais, override da proprietária auditado em owner_override_events e caminho da máquina de estados. Esta aqui só confere três booleanos, sem gate de papel nem máquina de estados: religá-la criaria um segundo caminho de ativação com guarda mais fraca.",
    destino: "src/lib/onboarding.functions.ts#ativarCasoComChecks, montada em /onboarding/$id",
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

  /* ---------- aguarda decisão da Proprietária ---------- */
  ...(
    ["registrarDiscoveryGoLive", "registrarCallGoLive", "resolverPessoaGoLive", "registrarPagamentoGoLive"] as const
  ).map((fn) => ({
    modulo: "golive-escritores.functions.ts",
    fn,
    veredicto: "AGUARDA_DECISAO" as const,
    motivo:
      "Escritores do Desk paralelo /golive, cuja canonicidade a Proprietária ainda não decidiu (AGENTS.md). Religar antes da decisão criaria segundo caminho vivo.",
    destino: "Decisão: /golive é canônico, é legado ou funde com o Desk do menu",
  })),
  ...(
    [
      "painelPiloto",
      "salvarDadoPiloto",
      "verificarDadoPiloto",
      // `resolverBloqueioPiloto` saiu desta lista em 24/10/2026: ela é a única
      // das seis que foi montada em tela, dentro do portão que /onboarding/$id
      // passou a mostrar (PR #188). Motivo: os 19 bloqueios críticos do caso da
      // Ana recusavam a ativação e NÃO havia tela alguma para resolvê-los — a
      // Proprietária não tinha botão. Montar esta ação não decide onde o piloto
      // mora; as outras cinco seguem aguardando essa decisão.
      "criarPesquisaPiloto",
      "liberarPortalPiloto",
    ] as const
  ).map((fn) => ({
    modulo: "piloto.functions.ts",
    fn,
    veredicto: "AGUARDA_DECISAO" as const,
    motivo:
      "Superfície do piloto 5A.1, escrita e nunca montada em tela. Precisa da decisão de manter o piloto como superfície própria ou absorvê-lo no Caso 360.",
    destino: "Decisão: piloto vira tela própria ou é absorvido pelo Caso 360",
  })),
  ...(["carregarPilotoAna", "definirIdCanonicoPiloto", "materializarPilotoAna"] as const).map((fn) => ({
    modulo: "piloto-ana.functions.ts",
    fn,
    veredicto: "AGUARDA_DECISAO" as const,
    motivo:
      "Leitor, escritor e materializador do piloto específico da Ana; mesma decisão pendente do piloto 5A.1.",
    destino: "Decisão: piloto vira tela própria ou é absorvido pelo Caso 360",
  })),

  /* ---------- aguarda decisão (17/10/2026) ---------- */
  {
    modulo: "radar-marcos-juridicos.functions.ts",
    fn: "radarMarcosJuridicosDoPainel",
    veredicto: "AGUARDA_DECISAO" as const,
    motivo:
      "Ficou órfã pelo corte radical de 17/10/2026 em /painel (Hoje vira só a grade da Prancha V4, desk-01-hoje): o bloco 'Radar de marcos jurídicos' não tem equivalente nessa grade e parou de ser chamado. A função e a consulta continuam corretas, só sem tela dona.",
    destino: "Decisão: ganha tela/aba própria (ex. dentro de Jurídico & Contrato) ou fica fora do Desk por ora",
  },

  /* ---------- religar: lacuna real de operação ---------- */
];

export function orfasPor(veredicto: VeredictoOrfa): OrfaClassificada[] {
  return ORFAS_CLASSIFICADAS.filter((o) => o.veredicto === veredicto);
}

/** Chave estável `modulo#fn`, do jeito que a varredura reporta. */
export function chaveOrfa(o: Pick<OrfaClassificada, "modulo" | "fn">): string {
  return `${o.modulo}#${o.fn}`;
}
