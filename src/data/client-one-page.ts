/**
 * One-page de devolutiva inicial (cliente-facing).
 *
 * Template reutilizável: para um novo caso, adicione uma entrada em
 * `CLIENT_ONE_PAGES` com o mesmo formato. Nenhum conteúdo de caso deve ser
 * escrito dentro do componente visual.
 *
 * Proibido neste arquivo: SKU, código de caso, preço, link de pagamento,
 * contrato, documento pessoal, fonte crua, hipótese jurídica ou promessa.
 */

export type OnePageStatus =
  | "informação compartilhada pela família"
  | "dado de pesquisa inicial"
  | "em validação documental"
  | "em confirmação";

export type OnePageFinding = {
  title: string;
  detail: string;
  status?: OnePageStatus;
};

export type ClientOnePageData = {
  clientId: string;
  displayName: string;
  title: string;
  subtitle: string;
  /** Saudação curta e pessoal, no topo da leitura. */
  greeting?: string;
  readingIntro: string;
  /** Cadeia familiar em organização, do ascendente até o cliente. */
  lineageChain?: string[];
  findings: OnePageFinding[];
  confirmations: string[];
  relevanceText: string;
  recommendedNextStep: { title: string; description: string; items: string[] };
  /** Convite final acolhedor, imediatamente antes do CTA. */
  closingInvite?: string;
  /** Rótulo do CTA visual. */
  ctaLabel?: string;
  footer: string;
  whatsappIntro: string;
  whatsappFollowUp: string;
  visibility: "internal_preview" | "approved_external";
};

const RODAPE_PADRAO =
  "Esta é uma leitura inicial baseada nas informações disponíveis até aqui. A continuidade da pesquisa e qualquer estratégia dependem de validação documental e análise humana.";

const RELEVANCIA_PADRAO =
  "A linha organizada cria um ponto de partida para a pesquisa. Agora, precisamos confirmar os documentos e vínculos entre as gerações.";

const PROXIMA_ETAPA_PADRAO = {
  title: "Estratégia e validação documental da linha familiar",
  description:
    "Vamos organizar a cadeia familiar, investigar registros prioritários e entender os próximos caminhos a partir de evidências oficiais.",
  items: [
    "Organização da cadeia documental",
    "Pesquisa de registros prioritários",
    "Validação de grafias e vínculos",
    "Mapa de pendências",
    "Análise humana de estratégia após evidências suficientes",
  ],
};

export const ONE_PAGE_SOPHIA: ClientOnePageData = {
  clientId: "CA-ITA-SOPHI-PICCOLI",
  displayName: "Sophia Piccoli Santiago",
  title: "Resultado Inicial de Pesquisa",
  subtitle: "Sophia Piccoli Santiago · Linha familiar italiana em análise",
  readingIntro:
    "Organizamos os primeiros sinais da linha Piccoli da sua família. Esta leitura ainda depende de confirmação por documentos oficiais antes de indicar qualquer estratégia.",
  findings: [
    {
      title: "Ascendente familiar associado à origem italiana",
      detail:
        "Ângelo Piccoli é mencionado na linha familiar como referência inicial de origem italiana.",
      status: "informação compartilhada pela família",
    },
    {
      title: "Localidade inicial em análise",
      detail:
        "Noventa Vicentina, Vicenza, aparece como localidade inicial a confirmar documentalmente.",
      status: "dado de pesquisa inicial",
    },
    {
      title: "Referências familiares anteriores",
      detail:
        "Giovanni Piccoli e Benedetta Bresolin aparecem como referências familiares iniciais da geração anterior a Ângelo.",
      status: "dado de pesquisa inicial",
    },
    {
      title: "Cadeia familiar inicial organizada",
      detail:
        "A linhagem inicial foi organizada de Ângelo até Sophia, percorrendo as gerações brasileiras.",
      status: "dado de pesquisa inicial",
    },
    {
      title: "Variação de grafia mapeada",
      detail:
        "Piccoli / Picoli é um ponto de atenção documental na passagem para registros brasileiros.",
      status: "em validação documental",
    },
  ],
  confirmations: [
    "Certidão italiana de nascimento de Ângelo Piccoli",
    "Registros necessários da geração anterior, se aplicável",
    "Certidões brasileiras da cadeia João → Orlando → Juliana → Sophia",
    "Grafias e eventos civis relevantes em cada geração",
    "Continuidade documental entre cada geração, sem lacunas",
  ],
  relevanceText: RELEVANCIA_PADRAO,
  recommendedNextStep: PROXIMA_ETAPA_PADRAO,
  footer: RODAPE_PADRAO,
  whatsappIntro:
    "Sophia, organizamos uma leitura inicial da linha Piccoli da sua família. É um ponto de partida, ainda sem conclusão.",
  whatsappFollowUp:
    "Se fizer sentido, posso te explicar como funcionaria a próxima etapa de validação documental.",
  visibility: "internal_preview",
};

export const ONE_PAGE_GUILHERME: ClientOnePageData = {
  clientId: "CA-ITA-GUILH-CERONATTO",
  displayName: "Guilherme Antonio da Silva",
  title: "Resultado Inicial de Pesquisa",
  subtitle: "Guilherme Antonio da Silva · Linha familiar italiana Ceronatto em análise",
  greeting:
    "Guilherme, este é o retrato inicial da sua família — organizado a partir do que você compartilhou e da nossa primeira pesquisa.",
  lineageChain: ["Gaetano", "Bortolo", "Natal", "Marilda", "Guilherme"],
  readingIntro:
    "Organizamos os sinais iniciais da linha Ceronatto da sua família. Esta é uma leitura preliminar: os dados foram reunidos a partir de informações compartilhadas por você e de pesquisa inicial, e ainda não há conclusão sobre cidadania ou caminho possível. A continuidade depende de confirmação por documentos oficiais. Essa organização ajuda tanto a entender a origem da família quanto a preparar uma validação documental segura.",
  findings: [
    {
      title: "Identificação familiar",
      detail:
        "Guilherme Antonio da Silva, filho de Marilda Ceronatto da Silva, de Curitiba, e Antônio Vieira da Silva, de Bateias.",
      status: "informação compartilhada pela família",
    },
    {
      title: "Avós maternos",
      detail: "Maria de Lurdes Paulin Ceronatto e Natal Ceronatto, de Curitiba.",
      status: "informação compartilhada pela família",
    },
    {
      title: "Ascendente italiano",
      detail:
        "Gaetano Ceronatto, identificado na pesquisa inicial como possível ascendente de origem italiana ligado à linha materna.",
      status: "dado de pesquisa inicial",
    },
    {
      title: "Localidade de origem",
      detail: "Montecchio Precalcino, Vicenza, no Vêneto — localidade inicial a confirmar documentalmente.",
      status: "dado de pesquisa inicial",
    },
    {
      title: "Referências familiares",
      detail: "Maria Luisa Budel e Bortolo Ceronato aparecem como referências familiares iniciais.",
      status: "dado de pesquisa inicial",
    },
    {
      title: "Cadeia familiar inicial",
      detail:
        "Possível linhagem em organização: Gaetano → Bortolo → Natal → Marilda → Guilherme.",
      status: "dado de pesquisa inicial",
    },
    {
      title: "Variações de grafia",
      detail: "Ceronatto / Ceronato / Seronato é um ponto de atenção documental entre registros.",
      status: "em validação documental",
    },
  ],
  confirmations: [
    "Certidão italiana de nascimento de Gaetano Ceronatto",
    "Registros necessários da geração anterior a Gaetano, se aplicável",
    "Certidões brasileiras da cadeia Bortolo → Natal → Marilda → Guilherme",
    "Grafias, variações e eventos civis relevantes em cada geração",
    "Continuidade documental entre cada geração, sem lacunas",
  ],
  relevanceText:
    "A linha em organização oferece um ponto de partida concreto para a pesquisa — tanto para resgatar a história da sua família quanto para, no futuro, avaliar caminhos possíveis. Já é possível começar a visualizar a estrutura familiar e identificar os principais pontos de confirmação. No entanto, a continuidade entre gerações e os documentos oficiais precisam ser confirmados antes de definir qualquer estratégia. No seu tempo, sem etapas desnecessárias.",
  recommendedNextStep: {
    title: "Estratégia e validação documental",
    description:
      "Uma etapa de aprofundamento da linha familiar para confirmar a cadeia familiar, organizar documentos, investigar lacunas e avaliar os caminhos possíveis a partir de evidências oficiais.",
    items: [
      "Organização da cadeia documental",
      "Pesquisa de registros prioritários",
      "Validação de grafias e vínculos",
      "Mapa de pendências",
      "Análise humana de estratégia após evidências suficientes",
    ],
  },
  footer: RODAPE_PADRAO,
  whatsappIntro:
    "Guilherme, organizamos uma leitura inicial da linha Ceronatto da sua família. É um ponto de partida, ainda sem conclusão.",
  whatsappFollowUp: "Se fizer sentido, posso te explicar como funcionaria esta próxima etapa.",
  visibility: "internal_preview",
};

export const CLIENT_ONE_PAGES: Record<string, ClientOnePageData> = {
  [ONE_PAGE_SOPHIA.clientId]: ONE_PAGE_SOPHIA,
  [ONE_PAGE_GUILHERME.clientId]: ONE_PAGE_GUILHERME,
};

export const onePageByCaso = (id?: string): ClientOnePageData | undefined =>
  id ? CLIENT_ONE_PAGES[id] : undefined;

/** Base para novos casos: preencha apenas os campos de conteúdo. */
export function novaOnePage(
  overrides: Partial<ClientOnePageData> & { clientId: string; displayName: string },
): ClientOnePageData {
  return {
    title: "Resultado Inicial de Pesquisa",
    subtitle: `${overrides.displayName} · Linha familiar em análise`,
    readingIntro:
      "Organizamos os sinais iniciais da sua linha familiar. Esta é uma leitura preliminar: os dados foram reunidos a partir de informações compartilhadas e de pesquisa inicial, e ainda não há conclusão sobre cidadania ou caminho possível. A continuidade depende de confirmação por documentos oficiais.",
    findings: [],
    confirmations: [],
    relevanceText: RELEVANCIA_PADRAO,
    recommendedNextStep: PROXIMA_ETAPA_PADRAO,
    footer: RODAPE_PADRAO,
    whatsappIntro: "",
    whatsappFollowUp: "",
    visibility: "internal_preview",
    ...overrides,
  };
}
