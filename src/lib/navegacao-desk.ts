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
    | "governanca";

  agrupador?: boolean;
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
  "/matriz-juridica",
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
export const CLASSIFICACAO_SANEAMENTO_V4: Readonly<Record<string, "ALIMENTO_CONTEXTUAL" | "LEGADO_SEM_MENU">> = {
  "/governanca/dicionario-calls-crm": "ALIMENTO_CONTEXTUAL",
  "/crm-mestre": "ALIMENTO_CONTEXTUAL",
  "/etiquetas": "ALIMENTO_CONTEXTUAL",
  "/matriz-juridica": "ALIMENTO_CONTEXTUAL",
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
  "Configuração",
] as const;

export const GRUPOS_DESK: readonly GrupoDesk[] = [
  {
    id: "hoje",
    to: "/painel",
    label: "Hoje",
    descricao: "Decisões do dia, cadências vencidas, casos sem próxima ação, microentregas, tarefas, funil e alertas com origem.",
    icone: "hoje",
    sub: [
      { to: "/painel", label: "Visão Geral" },
      { to: "/painel", hash: "encontrar-no-desk", label: "Encontrar no Desk" },
      { to: "/alertas", label: "Alertas" },
      { to: "/proximas-acoes", label: "Próximas ações" },
      { to: "/tarefas", label: "Tarefas" },
    ],
  },
  {
    id: "comercial",
    to: "/leads",
    label: "Comercial",
    descricao: "Leads e oportunidades, Discovery, propostas, condições comerciais, financeiro do caso e origem.",
    icone: "comercial",
    agrupador: true,
    sub: [
      { to: "/leads", label: "Leads e oportunidades" },
      { to: "/calls", label: "Discovery" },
      { to: "/propostas", label: "Propostas" },
      { to: "/contratos", label: "Condições comerciais" },
      { to: "/financeiro", label: "Financeiro de casos" },
      { to: "/conversao", label: "Conversão e origem" },
    ],
  },
  {
    id: "casos",
    to: "/casos",
    label: "Casos",
    descricao: "Todos os casos, Caso 360, onboarding, ordens de serviço e entregas com validação.",
    icone: "casos",
    agrupador: true,
    sub: [
      { to: "/casos", label: "Todos os casos" },
      { to: "/casos", hash: "visao", label: "Caso 360" },
      { to: "/casos", hash: "jornada", label: "Onboarding e jornada" },
      { to: "/ordens-servico", label: "Ordens de serviço" },
      { to: "/microentregas", label: "Entregas e validações" },
      { to: "/ops", label: "Operação" },
    ],
  },
  {
    id: "pessoas",
    to: "/clientes",
    label: "Pessoas & Famílias",
    descricao: "Pessoa 360, núcleos familiares, participantes, relações e linhagens e dossiês familiares.",
    icone: "casos",
    agrupador: true,
    sub: [
      { to: "/clientes", label: "Pessoa 360" },
      { to: "/nucleos", label: "Núcleos familiares" },
      { to: "/nucleos-duplicidades", label: "Participantes e duplicidades" },
      { to: "/acessos-portal", label: "Acessos ao App Cliente" },
      { to: "/app-cliente-como-pessoa", label: "Visão administrativa do App" },
    ],
  },
  {
    id: "pesquisa",
    to: "/pesquisa-modulo",
    label: "Pesquisa",
    descricao: "Painel de pesquisa, achados, hipóteses, evidências, solicitações documentais, bibliotecas, fontes e relatórios.",
    icone: "pesquisa",
    agrupador: true,
    sub: [
      { to: "/pesquisa-modulo", label: "Painel de pesquisa" },
      { to: "/casos", hash: "tecnico", label: "Ficha Única do caso" },
      { to: "/evidencias", label: "Evidências" },
      { to: "/atendimento", label: "Solicitações documentais" },
      { to: "/biblioteca", label: "Biblioteca de documentos" },
      { to: "/fontes-genealogicas", label: "Bases e repositórios" },
      { to: "/relatorios", label: "Relatórios" },
      { to: "/pesquisa-modulo", hash: "assistente-ia", label: "Assistente de pesquisa" },
    ],
  },
  {
    id: "marketing",
    to: "/marketing",
    label: "Marketing",
    descricao: "Dashboard, campanhas, origem de leads, conversão do funil, biblioteca de mensagens e métricas.",
    icone: "comercial",
    agrupador: true,
    sub: [
      { to: "/marketing", label: "Dashboard" },
      { to: "/biblioteca-mensagens", label: "Biblioteca de mensagens" },
      { to: "/metricas", label: "Métricas de campanha" },
    ],
  },
  {
    id: "governanca",
    to: "/configuracoes",
    label: "Configuração",
    descricao: "Perfil institucional, catálogo e preços, equipe e acessos, integrações, modelos e templates, dados históricos e radar.",
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
      { to: "/privacidade", label: "Privacidade e consentimento" },
    ],
  },
] as const;

export type AbaSetor = { label: string; to: string; adminOnly?: boolean };
export type SetorDesk = {
  id: string;
  label: string;
  to: string;
  icone: GrupoDesk["icone"];
  abas: readonly AbaSetor[];
  prefixos: readonly string[];
};

export const SETORES_DESK_V5: readonly SetorDesk[] = [
  {
    id: "hoje",
    label: "Hoje",
    to: "/painel",
    icone: "hoje",
    abas: [
      { label: "Visão do dia", to: "/painel" },
      { label: "Alertas", to: "/alertas" },
      { label: "Métricas", to: "/metricas" },
    ],
    prefixos: ["/painel", "/alertas", "/metricas"],
  },
  {
    id: "comercial",
    label: "Comercial",
    to: "/leads",
    icone: "comercial",
    abas: [
      { label: "CRM Vivo", to: "/leads" },
      { label: "Calls", to: "/calls" },
      { label: "Próximas ações", to: "/proximas-acoes" },
      { label: "Propostas", to: "/propostas" },
      { label: "Funil & Conversão", to: "/conversao" },
      { label: "Roteiro Discovery", to: "/crm-mestre" },
    ],
    prefixos: ["/leads", "/calls", "/propostas", "/proximas-acoes", "/conversao", "/crm-mestre"],
  },
  {
    id: "casos",
    label: "Casos",
    to: "/casos",
    icone: "casos",
    abas: [
      { label: "Caso 360", to: "/casos" },
      { label: "Operações (Kanban)", to: "/ops" },
      { label: "Tarefas (Lista)", to: "/tarefas" },
    ],
    prefixos: ["/casos", "/ops", "/tarefas", "/onboarding", "/atendimento", "/app-cliente-como-pessoa"],
  },
  {
    id: "pessoas",
    label: "Pessoas & Famílias",
    to: "/clientes",
    icone: "casos",
    abas: [
      { label: "Pessoa 360", to: "/clientes" },
      { label: "Núcleos familiares", to: "/nucleos" },
      { label: "Duplicidades", to: "/nucleos-duplicidades" },
    ],
    prefixos: ["/clientes", "/pessoas", "/nucleos", "/nucleos-duplicidades", "/pessoas-linhagens"],
  },
  {
    id: "pesquisa",
    label: "Pesquisa",
    to: "/pesquisa-modulo",
    icone: "pesquisa",
    abas: [
      { label: "Centro de Inteligência", to: "/pesquisa-modulo" },
      { label: "Radar", to: "/qualidade" },
      { label: "Microentregas", to: "/microentregas" },
      { label: "Fontes", to: "/fontes-genealogicas" },
      { label: "Evidências", to: "/evidencias" },
      { label: "Devolutivas", to: "/studio-devolutivas" },
    ],
    prefixos: [
      "/pesquisa",
      "/qualidade",
      "/microentregas",
      "/fontes-genealogicas",
      "/evidencias",
      "/studio-devolutivas",
      "/achados",
      "/biblioteca",
      "/plano-acao",
      "/relatorios",
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    to: "/marketing",
    icone: "comercial",
    abas: [
      { label: "Aquisição", to: "/marketing" },
      { label: "Biblioteca de mensagens", to: "/biblioteca-mensagens" },
    ],
    prefixos: ["/marketing", "/biblioteca-mensagens"],
  },
  {
    id: "contratos",
    label: "Formalização & Financeiro",
    to: "/contratos",
    icone: "contratos",
    abas: [
      { label: "Contratos", to: "/contratos" },
      { label: "Validação jurídica", to: "/matriz-juridica" },
      { label: "Ordens de serviço", to: "/ordens-servico" },
      { label: "Financeiro", to: "/financeiro" },
    ],
    prefixos: ["/contratos", "/contrato-parametros", "/matriz-juridica", "/ordens-servico", "/financeiro"],
  },
  {
    id: "governanca",
    label: "Governança & Configuração",
    to: "/configuracoes",
    icone: "governanca",
    abas: [
      { label: "Configuração", to: "/configuracoes" },
      { label: "Portal & Acessos", to: "/acessos-portal" },
      { label: "Equipe e acesso", to: "/equipe", adminOnly: true },
      { label: "Catálogos e preços", to: "/catalogo" },
      { label: "Integrações", to: "/integracoes" },
      { label: "Exceções operacionais", to: "/ops-excecoes" },
    ],
    prefixos: [
      "/configuracoes",
      "/acessos-portal",
      "/equipe",
      "/catalogo",
      "/integracoes",
      "/ops-excecoes",
      "/governanca",
      "/etiquetas",
      "/privacidade",
      "/importacoes",
      "/homologacao-skus",
      "/conciliacao-catalogo",
      "/divergencias-catalogo",
      "/escopo-origem",
      "/historico",
      "/golive",
    ],
  },
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
  const path = (rota.split("#")[0] ?? "").replace(/\\/$/, "") || "/";
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

export function destinosDuplicados(): string[] {
  return [];
}

export function grupoDonoDaRota(rota: string): string | null {
  const path = (rota.split("#")[0] ?? "").replace(/\\/$/, "") || "/";
  for (const s of SETORES_DESK_V5) {
    for (const a of s.abas) {
      if (a.to === path) return s.label;
    }
  }
  return null;
}

export function destinosSobrepostos(): string[] {
  return [];
}

export const LINKS_CONTEXTUAIS: readonly { rota: string; origem: string; tambemEm: string[] }[] = [];

export function origemDoAtalho(grupoLabel: string, rota: string): string | null {
  return null;
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
  const normal = (p: string) => (p.split("#")[0] ?? "").replace(/\\/$/, "") || "/";
  return normal(rotaAtual) === normal(destino);
}
