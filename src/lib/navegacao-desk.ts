/**
 * NAVEGAÇÃO CANÔNICA DO DESK — 6 grupos, um endereço por função.
 *
 * Três camadas, sem concorrer:
 *   Abas     — definem onde cada função vive.
 *   Mesa     — faz a entrada comercial funcionar (/calls).
 *   KPIs     — mostram o que está parado, vencido ou precisa de decisão (/painel).
 *
 * Pesquisa e bases moram na Inteligência. Matrizes individual/casal/familiar
 * moram na Formalização. CA-04 mora no Comercial com a Mesa. URLs não mudam.
 * Planilha Mestre, conciliação e SKU legado saem da operação diária e ficam
 * em Governança, rotulados. Nada é apagado nesta rodada.
 */

/** As três camadas do Desk. Não são abas novas. */
export const CAMADAS_DESK = [
  {
    id: "abas",
    papel: "Onde cada função vive",
    frase: "Abas definem onde cada função vive.",
    superficie: "os 6 grupos",
  },
  {
    id: "mesa",
    papel: "A entrada comercial funciona",
    frase: "A Mesa de Discovery faz a entrada comercial funcionar.",
    superficie: "/calls",
    rota: "/calls",
  },
  {
    id: "kpis",
    papel: "O que está parado, vencido ou precisa de decisão",
    frase: "Os KPIs do Hoje mostram o que está parado, vencido ou precisa de decisão.",
    superficie: "/painel",
    rota: "/painel",
  },
] as const;

export type ItemNav =
  { grupo: string } | { to: string; label: string; hash?: string; adminOnly?: boolean };

export type GrupoDesk = {
  id: string;
  /** Rota de entrada do grupo (já existente). */
  to: string;
  label: string;
  /** Descrição curta e humana exibida no menu e no topo do grupo. */
  descricao: string;
  icone:
    | "hoje"
    | "comercial"
    | "casos"
    | "pesquisa"
    | "contratos"
    | "governanca"
    | "pessoas"
    | "marketing"
    | "financeiro";

  agrupador?: boolean;
  /** Prefixos de rota que acendem o grupo (subrotas e telas contextuais). */
  prefixos?: readonly string[];
  sub: readonly ItemNav[];
};

/**
 * Menu de primeiro nível das pranchas V4 (decisão da Proprietária, 02/10/2026,
 * "Sanear o Desk — Passo 1"). Cada destino é uma rota oficial já existente;
 * financeiro, jurídico/contrato e portal ficam dentro de Casos/Pesquisa.
 */
export const TELAS_DESK_MOCKUP = [
  "Hoje",
  "Comercial",
  "Casos",
  "Pessoas & Famílias",
  "Pesquisa",
  "Marketing",
  "Configuração",
] as const;

export const NAVEGACAO_V4_DESK = [
  { label: "Hoje", to: "/painel", icone: "hoje" },
  { label: "Comercial", to: "/calls", icone: "comercial" },
  { label: "Casos", to: "/casos", icone: "casos" },
  { label: "Pessoas & Famílias", to: "/clientes", icone: "casos" },
  { label: "Pesquisa", to: "/pesquisa-modulo", icone: "pesquisa" },
  { label: "Marketing", to: "/marketing", icone: "comercial" },
  { label: "Configuração", to: "/configuracoes", icone: "governanca" },
] as const satisfies readonly { label: string; to: string; icone: GrupoDesk["icone"] }[];

/**
 * Itens de dicionário, etiqueta, tipologia, catálogo, SKU e legado saem do
 * menu (Passo 1). As rotas continuam abertas por endereço direto.
 */
export const ROTAS_FORA_DO_MENU = [
  // ALIMENTO_CONTEXTUAL — vira opção dentro do ecossistema que usa, não tela.
  "/governanca/dicionario-calls-crm",
  "/crm-mestre",
  "/etiquetas",
  "/contrato-parametros",
  "/governanca/contrato-base",
  "/governanca/modelo-individual",
  "/governanca/modelo-familiar-casal",
  // LEGADO_SEM_MENU — rota preservada, sem link visível.
  "/governanca/catalogo-operacional-30",
  "/homologacao-skus",
  "/conciliacao-catalogo",
  "/divergencias-catalogo",
  "/escopo-origem",
  "/pesquisa",
  "/ops-excecoes",
] as const;

/**
 * Classificação do saneamento V4 (03/10/2026). Nenhuma rota foi apagada:
 * o que sai do menu continua aberto por endereço direto.
 */
export const CLASSIFICACAO_SANEAMENTO_V4: Readonly<
  Record<string, "ALIMENTO_CONTEXTUAL" | "LEGADO_SEM_MENU">
> = {
  "/governanca/dicionario-calls-crm": "ALIMENTO_CONTEXTUAL",
  "/crm-mestre": "ALIMENTO_CONTEXTUAL",
  "/etiquetas": "ALIMENTO_CONTEXTUAL",
  "/contrato-parametros": "ALIMENTO_CONTEXTUAL",
  "/governanca/contrato-base": "ALIMENTO_CONTEXTUAL",
  "/governanca/modelo-individual": "ALIMENTO_CONTEXTUAL",
  "/governanca/modelo-familiar-casal": "ALIMENTO_CONTEXTUAL",
  "/governanca/catalogo-operacional-30": "LEGADO_SEM_MENU",
  "/homologacao-skus": "LEGADO_SEM_MENU",
  "/conciliacao-catalogo": "LEGADO_SEM_MENU",
  "/divergencias-catalogo": "LEGADO_SEM_MENU",
  "/escopo-origem": "LEGADO_SEM_MENU",
  "/pesquisa": "LEGADO_SEM_MENU",
  "/ops-excecoes": "LEGADO_SEM_MENU",
  // 18/10/2026: estas rotas estão no prefixo dos seus setores em
  // SETORES_DESK_V5 (a lateral real) mas perderam a aba própria que tinham
  // no modelo anterior de 7 grupos — seguem abertas por endereço direto.
  // Alinhamento de testes autorizado pela Proprietária.
  "/relatorios": "ALIMENTO_CONTEXTUAL",
  "/privacidade": "ALIMENTO_CONTEXTUAL",
  "/governanca/modelos-contratuais": "ALIMENTO_CONTEXTUAL",
  "/biblioteca": "ALIMENTO_CONTEXTUAL",
  "/importacoes": "ALIMENTO_CONTEXTUAL",
  "/atendimento": "ALIMENTO_CONTEXTUAL",
};

/**
 * Rótulos dos grupos operacionais. Até 02/10 eram os 6 do saneamento anterior;
 * desde 03/10 são os 7 do V4, por diretriz explícita da Proprietária
 * ("SANEAMENTO REVERSÍVEL DO DESK V4 — EXECUTAR, NÃO PLANEJAR").
 *
 * Os 6 antigos ficam registrados abaixo porque vários testes e documentos os
 * citam como decisão anterior — a decisão não é apagada, é superada com data.
 */
export const GRUPOS_OPERACIONAIS_DESK_ATE_02_10 = [
  "Hoje",
  "Marketing & Comercial",
  "Pessoas & Casos",
  "Inteligência & Pesquisa",
  "Formalização & Financeiro",
  "Governança & Administração",
] as const;

export const GRUPOS_OPERACIONAIS_DESK = [
  "Hoje",
  "Comercial",
  "Casos",
  "Pessoas & Famílias",
  "Pesquisa",
  "Marketing",
  "Financeiro",
  "Configuração",
] as const;

/**
 * 18/10/2026 — decisão da Proprietária: primeiro nível = 7 grupos da V4 +
 * Financeiro como grupo próprio (8). O setor "Formalização & Financeiro" foi
 * desfeito: Contratos → Comercial; Ordens de serviço → Casos; Validação
 * jurídica → Configuração (Radar e matrizes), com atalho na Mesa de Discovery;
 * Exceções operacionais saem do menu e viram alerta no Hoje. Nenhuma rota
 * nova, nenhuma removida.
 */
export const GRUPOS_DESK: readonly GrupoDesk[] = [
  {
    id: "hoje",
    to: "/painel",
    label: "Hoje",
    descricao: "Decisões do dia, alertas com origem, próximas ações, tarefas e exceções abertas.",
    icone: "hoje",
    sub: [
      { to: "/painel", label: "Visão Geral" },
      { to: "/painel", hash: "encontrar-no-desk", label: "Encontrar no Desk" },
      { to: "/alertas", label: "Alertas" },
      { to: "/proximas-acoes", label: "Próximas ações" },
      { to: "/tarefas", label: "Tarefas" },
    ],
    prefixos: ["/painel", "/alertas", "/proximas-acoes", "/tarefas"],
  },
  {
    id: "comercial",
    to: "/leads",
    label: "Comercial",
    descricao:
      "Leads e oportunidades, Discovery, propostas, contratos e condições comerciais e origem.",
    icone: "comercial",
    agrupador: true,
    sub: [
      { to: "/leads", label: "Leads e oportunidades" },
      { to: "/calls", label: "Discovery" },
      { to: "/propostas", label: "Propostas" },
      { to: "/contratos", label: "Contratos e condições" },
      { to: "/conversao", label: "Conversão e origem" },
    ],
    prefixos: [
      "/leads",
      "/calls",
      "/propostas",
      "/contratos",
      "/contrato-parametros",
      "/conversao",
      "/crm-mestre",
    ],
  },
  {
    id: "casos",
    to: "/casos",
    label: "Casos",
    descricao:
      "Todos os casos, Caso 360, GoLive (vida do cliente), onboarding, ordens de serviço, entregas com validação e operação.",
    icone: "casos",
    agrupador: true,
    sub: [
      { to: "/casos", label: "Todos os casos" },
      { to: "/casos", hash: "visao", label: "Caso 360" },
      // 27/10/2026 (auditoria de espectro completo, achado 2.2): esta entrada
      // morava no grupo Pesquisa, enquanto as outras 3 variantes de `/casos`
      // ficavam aqui — mesma rota-base, dividida por âncora, em dois grupos
      // sem critério visível. Movida para junto das outras.
      { to: "/casos", hash: "tecnico", label: "Ficha Única do caso" },
      // 23/10/2026 — decisão da Proprietária: o GoLive é a vida COMPLETA de cada
      // cliente e tem lugar próprio dentro de Casos (o Caso 360 é o resumo macro).
      { to: "/golive", label: "GoLive · Vida do cliente" },
      { to: "/casos", hash: "jornada", label: "Onboarding e jornada" },
      { to: "/ordens-servico", label: "Ordens de serviço" },
      { to: "/microentregas", label: "Entregas e validações" },
      { to: "/ops", label: "Operação" },
    ],
    prefixos: ["/casos", "/ordens-servico", "/microentregas", "/ops", "/onboarding", "/golive"],
  },
  {
    id: "pessoas",
    to: "/clientes",
    label: "Pessoas & Famílias",
    descricao:
      "Pessoa 360, núcleos familiares, revisão de núcleos duplicados, acessos ao App Cliente e visão administrativa do App.",
    icone: "pessoas",
    agrupador: true,
    sub: [
      { to: "/clientes", label: "Pessoa 360" },
      { to: "/nucleos", label: "Núcleos familiares" },
      // J04 (05/11/2026): a tela revisa núcleos duplicados; não é cadastro separado de participante.
      { to: "/nucleos-duplicidades", label: "Possíveis núcleos duplicados" },
      { to: "/acessos-portal", label: "Acessos ao App Cliente" },
      { to: "/app-cliente-como-pessoa", label: "Visão administrativa do App" },
    ],
    prefixos: [
      "/clientes",
      "/pessoas",
      "/nucleos",
      "/nucleos-duplicidades",
      "/pessoas-linhagens",
      "/acessos-portal",
      "/app-cliente-como-pessoa",
    ],
  },
  {
    id: "pesquisa",
    to: "/pesquisa-modulo",
    label: "Pesquisa",
    descricao:
      "Painel de pesquisa, achados, hipóteses, evidências, solicitações documentais, bibliotecas, fontes e relatórios.",
    icone: "pesquisa",
    agrupador: true,
    sub: [
      { to: "/pesquisa-modulo", label: "Painel de pesquisa" },
      { to: "/evidencias", label: "Evidências" },
      { to: "/atendimento", label: "Solicitações documentais" },
      { to: "/biblioteca", label: "Biblioteca de documentos" },
      { to: "/fontes-genealogicas", label: "Bases e repositórios" },
      { to: "/relatorios", label: "Relatórios" },
      { to: "/pesquisa-modulo", hash: "assistente-ia", label: "Assistente de pesquisa" },
    ],
    prefixos: [
      "/pesquisa",
      "/evidencias",
      "/atendimento",
      "/biblioteca",
      "/biblioteca-evidencias",
      "/fontes-genealogicas",
      "/relatorios",
      "/relatorios-fase",
      "/studio-devolutivas",
      "/achados",
      "/plano-acao",
    ],
  },
  {
    id: "marketing",
    to: "/marketing",
    label: "Marketing",
    descricao:
      "Dashboard, campanhas, origem de leads, biblioteca de mensagens e métricas de campanha.",
    icone: "marketing",
    agrupador: true,
    sub: [
      { to: "/marketing", label: "Dashboard" },
      { to: "/biblioteca-mensagens", label: "Biblioteca de mensagens" },
      { to: "/metricas", label: "Métricas de campanha" },
    ],
    prefixos: ["/marketing", "/biblioteca-mensagens", "/metricas"],
  },
  {
    id: "financeiro",
    to: "/financeiro",
    label: "Financeiro",
    descricao: "Faturas e condições do caso: previsão separada de saldo e pagamento confirmado.",
    icone: "financeiro",
    sub: [{ to: "/financeiro", label: "Financeiro de casos" }],
    prefixos: ["/financeiro"],
  },
  {
    id: "governanca",
    to: "/configuracoes",
    label: "Configuração",
    descricao:
      "Perfil institucional, catálogo e preços, equipe, integrações, modelos, decisões, radar e matrizes jurídicas.",
    icone: "governanca",
    agrupador: true,
    sub: [
      { to: "/configuracoes", label: "Perfil institucional" },
      { to: "/catalogo", label: "Catálogo e preços" },
      { to: "/equipe", label: "Equipe e acessos", adminOnly: true },
      { to: "/integracoes", label: "Integrações operacionais" },
      { to: "/governanca/modelos-contratuais", label: "Modelos e templates" },
      { to: "/governanca/decisoes", label: "Decisões" },
      { to: "/importacoes", label: "Dados históricos" },
      { to: "/qualidade", label: "Radar e matrizes" },
      { to: "/matriz-juridica", label: "Validação jurídica" },
      { to: "/privacidade", label: "Privacidade e consentimento" },
    ],
    prefixos: [
      "/configuracoes",
      "/catalogo",
      "/equipe",
      "/integracoes",
      "/governanca",
      "/importacoes",
      "/qualidade",
      "/matriz-juridica",
      "/privacidade",
      "/etiquetas",
      "/homologacao-skus",
      "/conciliacao-catalogo",
      "/divergencias-catalogo",
      "/escopo-origem",
      "/historico",
      "/ops-excecoes",
    ],
  },
] as const;

export type AbaSetor = { label: string; to: string; hash?: string; adminOnly?: boolean };
export type SetorDesk = {
  id: string;
  label: string;
  to: string;
  icone: GrupoDesk["icone"];
  abas: readonly AbaSetor[];
  prefixos: readonly string[];
};

/**
 * Setores que a lateral renderiza — derivados de `GRUPOS_DESK` (fonte única).
 * O nome `SETORES_DESK_V5` fica como alias para quem ainda importa.
 *
 * 19/10/2026 — decisão da Proprietária (reconciliação com o Lovable): a
 * casca visual/taxonômica do menu é esta (derivada de `GRUPOS_DESK`, 8
 * grupos), não mais a versão de 6 grupos hand-authored que existia antes
 * nesta branch. As 13 superfícies que viviam em `SUPERFICIES_PRANCHA_V4`
 * continuam existindo como metadados/rotas internas (ver abaixo), nunca
 * como um segundo menu.
 */
export const SETORES_DESK: readonly SetorDesk[] = GRUPOS_DESK.map((g) => ({
  id: g.id,
  label: g.label,
  to: g.to,
  icone: g.icone,
  abas: g.sub.filter((s): s is Extract<ItemNav, { to: string }> => "to" in s),
  prefixos: g.prefixos ?? [g.to],
}));
export const SETORES_DESK_V5 = SETORES_DESK;

/** Rotas do menu de lado que precisam de caso: com caseId na URL, vão ao caso certo. */
export function destinoDaAba(
  aba: AbaSetor,
  rotaAtual: string,
): { to: string; hash?: string; caseId?: string } {
  const m = /^\/casos\/([^/#?]+)/.exec(rotaAtual);
  if (aba.to === "/casos" && aba.hash && m)
    return { to: "/casos/$caseId", hash: aba.hash, caseId: m[1] };
  return { to: aba.to, hash: aba.hash };
}

/**
 * As 13 superfícies da prancha, na ordem das pílulas do topo de toda tela
 * do Desk. Cada uma aponta para a rota real que a implementa.
 */
export const SUPERFICIES_PRANCHA_V4: readonly { label: string; to: string }[] = [
  { label: "Hoje", to: "/painel" },
  { label: "Comercial / CRM Vivo", to: "/leads" },
  { label: "Checklist / Kanban operacional", to: "/tarefas" },
  { label: "Caso 360", to: "/casos" },
  { label: "Pessoa 360", to: "/clientes" },
  { label: "Radar & Matrizes", to: "/qualidade" },
  { label: "Pesquisa", to: "/pesquisa-modulo" },
  { label: "Biblioteca Mestre", to: "/biblioteca" },
  { label: "Financeiro", to: "/financeiro" },
  { label: "Jurídico & Contrato", to: "/contratos" },
  { label: "Pessoas & Famílias", to: "/nucleos" },
  { label: "Portal do cliente (visão interna)", to: "/acessos-portal" },
  { label: "Configuração & Acesso", to: "/configuracoes" },
];

export const MENU_LEGADO_DESK: {
  label: string;
  itens: readonly { to: string; label: string }[];
} = {
  label: "Governança / Legado",
  itens: [],
} as const;

const casaPrefixoSetor = (rota: string, p: string) =>
  rota === p || rota.startsWith(`${p}/`) || (p === "/pesquisa" && rota.startsWith(`${p}-`));

export function setorDaRota(rota: string): SetorDesk | undefined {
  const path = (rota.split("#")[0] ?? "").replace(/\/$/, "") || "/";
  let melhor: { setor: SetorDesk; tamanho: number } | null = null;
  for (const s of SETORES_DESK_V5) {
    for (const p of s.prefixos) {
      if (!casaPrefixoSetor(path, p)) continue;
      if (!melhor || p.length > melhor.tamanho) melhor = { setor: s, tamanho: p.length };
    }
  }
  return melhor?.setor;
}

export const ROTAS_LEGADO_MENU_GOVERNANCA = [
  "/governanca/catalogo-operacional-30",
  "/homologacao-skus",
  "/conciliacao-catalogo",
  "/divergencias-catalogo",
  "/escopo-origem",
] as const;

export const MENU_CONTA: {
  id: "conta";
  label: string;
  descricao: string;
  itens: readonly ItemNav[];
} = {
  id: "conta",
  label: "Conta e administração",
  descricao: "Sem atalhos na lateral; sessão DEMO só por link direto.",
  itens: [],
} as const;

export const ROTAS_PRESERVADAS: readonly string[] = [
  "/painel",
  "/metricas",
  "/relatorios",
  "/leads",
  "/calls",
  "/crm-mestre",
  "/governanca/dicionario-calls-crm",
  "/proximas-acoes",
  "/propostas",
  "/conversao",
  "/clientes",
  "/casos",
  "/nucleos",
  "/tarefas",
  "/ops-excecoes",
  "/qualidade",
  "/pesquisa-modulo",
  "/pesquisa",
  "/evidencias",
  "/fontes-genealogicas",
  "/privacidade",
  "/contratos",
  "/ordens-servico",
  "/escopo-origem",
  "/conciliacao-catalogo",
  "/divergencias-catalogo",
  "/homologacao-skus",
  "/contrato-parametros",
  "/financeiro",
  "/governanca/contrato-base",
  "/governanca/modelo-individual",
  "/governanca/modelo-familiar-casal",
  "/governanca/modelos-contratuais",
  "/catalogo",
  "/biblioteca",
  "/biblioteca-mensagens",
  "/matriz-juridica",
  "/etiquetas",
  "/integracoes",
  "/importacoes",
  "/configuracoes",
  "/acessos-portal",
  "/atendimento",
  "/equipe",
] as const;

export function rotasDoMenu(): string[] {
  const set = new Set<string>();
  for (const s of SETORES_DESK_V5) {
    set.add(s.to);
    for (const a of s.abas) set.add(a.to);
  }
  return [...set];
}

export function rotasDoMenuConta(): string[] {
  return [];
}

export function rotasSemLink(): string[] {
  const menu = new Set(rotasDoMenu());
  return ROTAS_PRESERVADAS.filter((r) => !menu.has(r) && !(r in CLASSIFICACAO_SANEAMENTO_V4));
}

/*
 * Achado 13 (pendências da auditoria, 27/10/2026): esta função tinha lógica
 * real contando duplicatas dentro de cada grupo de GRUPOS_DESK; na
 * migração para SETORES_DESK_V5 (commit 68da7b21) o corpo foi substituído
 * por `return []` e nunca reescrito contra a nova fonte — ficou um guarda
 * inerte, sempre "limpo" mesmo que uma duplicata real apareça. RELIGADA:
 * GRUPOS_DESK continua sendo a fonte real (SETORES_DESK_V5 é só um apelido
 * derivado dela, linha 400), então a lógica original continua válida sem
 * nenhuma reescrita de dados.
 *
 * Um mesmo destino (rota + hash) não pode se repetir DENTRO de um grupo.
 * Entre grupos, a repetição é link contextual declarado (ex.: Validação
 * Jurídica em Governança com atalho em Comercial e Casos) — não é falha nova.
 */
export function destinosDuplicados(): string[] {
  const dup: string[] = [];
  for (const g of GRUPOS_DESK) {
    const vistos = new Set<string>();
    for (const s of g.sub) {
      if (!("to" in s)) continue;
      const chave = `${g.id}:${s.to}#${s.hash ?? ""}`;
      if (vistos.has(chave)) dup.push(chave);
      vistos.add(chave);
    }
  }
  return dup;
}

export function grupoDonoDaRota(rota: string): string | null {
  const path = (rota.split("#")[0] ?? "").replace(/\/$/, "") || "/";
  for (const s of SETORES_DESK_V5) {
    for (const a of s.abas) {
      if (a.to === path) return s.label;
    }
  }
  return null;
}

/*
 * Achado 13: mesmo caso de destinosDuplicados — ficou `return []` fixo
 * desde a migração para SETORES_DESK_V5. RELIGADA contra GRUPOS_DESK (a
 * mesma fonte real).
 *
 * Mesmo destino (rota + hash) citado em mais de um grupo. Com os grupos
 * sem sobreposição, a lista deve ficar vazia — mas agora é calculada, não
 * assumida.
 */
export function destinosSobrepostos(): string[] {
  const visto = new Map<string, string[]>();
  for (const g of GRUPOS_DESK) {
    for (const s of g.sub) {
      if (!("to" in s)) continue;
      const chave = `${s.to}#${s.hash ?? ""}`;
      const grupos = visto.get(chave) ?? [];
      grupos.push(g.id);
      visto.set(chave, grupos);
    }
  }
  return [...visto.entries()].filter(([, grupos]) => grupos.length > 1).map(([chave]) => chave);
}

/** Sem atalhos cruzados declarados hoje: cada rota mora em um único grupo. */
export const LINKS_CONTEXTUAIS: readonly { rota: string; origem: string; tambemEm: string[] }[] =
  [];

/*
 * Achado 13: o corpo também virou `return null` fixo na mesma migração.
 * Como LINKS_CONTEXTUAIS já é `[]`, o resultado observável não mudou — mas
 * a função parou de checar o registro, e um link contextual futuro
 * declarado em LINKS_CONTEXTUAIS seria ignorado em silêncio. RELIGADA.
 *
 * O grupo onde a rota mora, quando ela está sendo citada de fora dele.
 *
 * 26/08/2026 — a Proprietária leu o menu como tendo "muitas sobreposições".
 * As repetições são deliberadas (`LINKS_CONTEXTUAIS`), mas eram indistinguíveis
 * da entrada canônica: `/matriz-juridica` aparecia com o MESMO rótulo em três
 * grupos, sem nada dizendo que mora em Governança. Repetição sem marca lê-se
 * como duplicação.
 *
 * Devolve o grupo de origem quando o item é atalho, e null quando é a entrada
 * canônica — aí não há nada a marcar.
 */
export function origemDoAtalho(grupoLabel: string, rota: string): string | null {
  const registro = LINKS_CONTEXTUAIS.find((l) => l.rota === rota);
  if (!registro) return null;
  if (registro.origem === grupoLabel) return null;
  return registro.tambemEm.includes(grupoLabel) ? registro.origem : null;
}

export const NATUREZA_BIBLIOTECA: readonly {
  rota: string;
  natureza: "motor" | "descritiva";
  nota: string;
}[] = [
  {
    rota: "/biblioteca-mensagens",
    natureza: "motor",
    nota: "Template versionado que a fila de comunicação consome; muda o texto que sai.",
  },
  {
    rota: "/biblioteca",
    natureza: "descritiva",
    nota: "Curadoria e conhecimento. Nada a consome para produzir saída.",
  },
] as const;

export function naturezaDaBiblioteca(rota: string): (typeof NATUREZA_BIBLIOTECA)[number] | null {
  return NATUREZA_BIBLIOTECA.find((b) => b.rota === rota) ?? null;
}

export function rotaAtendeDestino(rotaAtual: string, destino: string): boolean {
  const normal = (p: string) => (p.split("#")[0] ?? "").replace(/\/$/, "") || "/";
  const atual = normal(rotaAtual);
  const alvo = normal(destino);
  if (!atual || !alvo) return false;
  if (atual === alvo) return true;
  if (alvo === "/") return false;
  // Subrota só conta com barra: /casos/xyz ∈ /casos, mas /pesquisa-modulo ∉ /pesquisa.
  return atual.startsWith(`${alvo}/`);
}

export type DestinoNav = { to: string; hash?: string };

function hashDaRota(valor: string): string {
  // Aceita tanto "/rota#ancora" quanto a âncora pura ("canais-campanhas").
  const partes = valor.split("#");
  return (partes.length > 1 ? partes[1] : (partes[0] ?? "")).trim();
}

/** Item de menu ativo: hash, quando existe, precisa bater; senão a rota (ou subrota). */
export function itemNavAtivo(atual: string, hashAtual: string, item: DestinoNav): boolean {
  const hash = hashDaRota(hashAtual);
  if (item.hash) return atual === item.to && hash === hashDaRota(item.hash);
  if (hash && atual === item.to) return false;
  return rotaAtendeDestino(atual, item.to);
}

/** Grupo ativo canônico: entrada do grupo ou item que mora nele — atalhos não douram o grupo errado. */
export function grupoNavAtivo(
  atual: string,
  hashAtual: string,
  grupo: { to: string; label: string; sub: readonly ItemNav[] },
): boolean {
  if (rotaAtendeDestino(atual, grupo.to) && !hashDaRota(hashAtual)) return true;
  return grupo.sub.some((s) => {
    if (!("to" in s)) return false;
    if (origemDoAtalho(grupo.label, s.to)) return false;
    return itemNavAtivo(atual, hashAtual, s);
  });
}

/** Lacunas conhecidas: sem fonte canônica, permanecem declaradas e não simuladas. */
export const LACUNAS_CONHECIDAS: readonly { item: string; motivo: string }[] = [
  { item: "Radar multi-país", motivo: "Sem fonte canônica definida; nenhum cálculo é simulado." },
  {
    item: "Atividade real de abertura/download no App Cliente",
    motivo: "Só é exibida quando houver evento canônico registrado.",
  },
  {
    item: "Espelho do App Cliente",
    motivo: "Reutiliza exclusivamente a projeção sanitizada; nenhuma cópia é criada.",
  },
] as const;
