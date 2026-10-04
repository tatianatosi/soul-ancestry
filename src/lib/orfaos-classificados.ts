/**
 * Inventário classificado dos `createServerFn` sem chamador de tela.
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
  /** Religar: fecha lacuna real de operação. Entra na fila de execução. */
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
      "resolverBloqueioPiloto",
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

  /* ---------- religar: lacuna real de operação ---------- */
  {
    modulo: "pesquisa-modulo.functions.ts",
    fn: "vincularEvidencia",
    veredicto: "RELIGAR",
    motivo:
      "Liga a evidência à pessoa, à fonte ou ao achado (research_evidence_links). Sem chamador, o vínculo só nasce por SQL e a evidência fica solta no caso.",
    destino: "/pesquisa-modulo/$id (bloco Evidências) e /biblioteca-evidencias/$caseId",
  },
  {
    modulo: "documentos.functions.ts",
    fn: "listarConsentimentos",
    veredicto: "RELIGAR",
    motivo: "Consentimento de LGPD gravado e sem nenhuma leitura em tela — a equipe não consegue conferir o que foi consentido.",
    destino: "/privacidade (bloco de consentimentos do caso)",
  },
  {
    modulo: "message-library.functions.ts",
    fn: "salvarTemplate",
    veredicto: "RELIGAR",
    motivo: "A Biblioteca de mensagens lista templates mas não deixa criar nem corrigir nenhum pela tela.",
    destino: "/biblioteca-mensagens",
  },
  ...(["registrarPerfilInstitucional", "registrarSnapshotInstitucional"] as const).map((fn) => ({
    modulo: "perfil-institucional-persistido.functions.ts",
    fn,
    veredicto: "RELIGAR" as const,
    motivo:
      "O perfil institucional é cláusula fixa do contrato (qualificação da contratada) e hoje só muda por SQL.",
    destino: "/configuracoes (Perfil institucional)",
  })),
  {
    modulo: "contratos.functions.ts",
    fn: "painelContratual",
    veredicto: "RELIGAR",
    motivo: "Leitor agregado do estado contratual da organização, sem consumidor.",
    destino: "/contratos (cabeçalho do módulo)",
  },
  {
    modulo: "contrato-parametros.functions.ts",
    fn: "sincronizarContratoBase",
    veredicto: "RELIGAR",
    motivo:
      "Sincroniza a ficha do caso com a versão vigente do contrato-base; hoje a atualização do contrato-base não chega aos casos abertos.",
    destino: "Caso 360 › Formalização (ação de sincronizar a versão do contrato-base)",
  },
  {
    modulo: "atos-representacao.functions.ts",
    fn: "verificarAtoEmNomeDoCliente",
    veredicto: "RELIGAR",
    motivo:
      "Verifica no servidor os anexos exigidos (III e IV) antes de ato em nome do cliente; sem chamador, o gate de procuração não é exercido por nenhuma tela.",
    destino: "Caso 360 › Formalização e módulo de Pesquisa (antes de ato externo)",
  },
  {
    modulo: "saas.functions.ts",
    fn: "verificarCondicoesCaso",
    veredicto: "RELIGAR",
    motivo: "Verificação servidor-side das condições de ativação do caso, sem tela que a exerça.",
    destino: "Caso 360 › Visão (antes de ativar)",
  },
  {
    modulo: "saas.functions.ts",
    fn: "ativarCaso",
    veredicto: "RELIGAR",
    motivo: "Ativação do caso só por SQL; é o passo que tira o caso de 'em ativação'.",
    destino: "Caso 360 › Visão",
  },
  {
    modulo: "saas.functions.ts",
    fn: "restaurarRegistro",
    veredicto: "RELIGAR",
    motivo:
      "Desarquivar registro é o par do arquivamento, que a tela já faz; sem ele, arquivar por engano só se desfaz por SQL.",
    destino: "Telas que arquivam (casos, clientes, leads, documentos)",
  },
];

export function orfasPor(veredicto: VeredictoOrfa): OrfaClassificada[] {
  return ORFAS_CLASSIFICADAS.filter((o) => o.veredicto === veredicto);
}

/** Chave estável `modulo#fn`, do jeito que a varredura reporta. */
export function chaveOrfa(o: Pick<OrfaClassificada, "modulo" | "fn">): string {
  return `${o.modulo}#${o.fn}`;
}
