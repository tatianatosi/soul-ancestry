/**
 * NAVEGAÇÃO CANÔNICA DO DESK — 7 telas do mockup aprovado (primeiro nível).
 *
 * Decisão vinculante da proprietária (2026-09-11):
 *   docs/politicas/ADENDO-SIDEBAR-7-TELAS-MOCKUP-2026-09-11.md
 *
 * Face do produto (sidebar):
 *   Visão Geral · Casos 360 · Checklist · Validação Jurídica ·
 *   Radar Interno · Alertas · Biblioteca Mestre
 *
 * Organização interna (NÃO é menu de primeiro nível):
 *   Hoje · Comercial · Casos & Pessoas · Pesquisa · Formalização · Governança
 *   → CTAs, filtros e submenus recolhidos dentro das telas certas.
 *
 * Nenhuma rota operacional some. Comercial/Marketing/Formalização/Governança
 * continuam acessíveis em no máximo dois cliques via submenu/contexto.
 */

/** As três camadas do Desk. Não são abas novas. */
export const CAMADAS_DESK = [
  {
    id: "abas",
    papel: "Onde cada função vive",
    frase: "As sete telas do mockup definem a navegação principal.",
    superficie: "as 7 telas",
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
  | { grupo: string }
  | { to: string; label: string; hash?: string; adminOnly?: boolean };

export type GrupoDesk = {
  id: string;
  /** Rota de entrada da tela (já existente). */
  to: string;
  label: string;
  /** Descrição curta e humana exibida no menu e no topo. */
  descricao: string;
  icone:
    | "visao-geral"
    | "casos"
    | "checklist"
    | "juridico"
    | "radar"
    | "alertas"
    | "biblioteca";
  /** Quando true, o submenu de contexto pode agrupar rótulos. */
  agrupador?: boolean;
  sub: readonly ItemNav[];
};

/** Nomes das 7 telas do mockup — face do produto / sidebar. */
export const TELAS_DESK_MOCKUP = [
  "Visão Geral",
  "Casos 360",
  "Checklist",
  "Validação Jurídica",
  "Radar Interno",
  "Alertas",
  "Biblioteca Mestre",
] as const;

/**
 * Organização interna de referência (filtros/CTA/contexto).
 * Não é a sidebar de primeiro nível desde 2026-09-11.
 */
export const GRUPOS_OPERACIONAIS_DESK = [
  "Hoje",
  "Comercial",
  "Casos & Pessoas",
  "Pesquisa",
  "Formalização",
  "Governança",
] as const;

/** Sidebar principal = exatamente as 7 telas do mockup. */
export const GRUPOS_DESK: readonly GrupoDesk[] = [
  {
    id: "visao-geral",
    to: "/painel",
    label: "Visão Geral",
    descricao: "Cockpit do dia: prioridades, alertas e o que precisa de decisão agora.",
    icone: "visao-geral",
    agrupador: true,
    sub: [
      { grupo: "Comercial (contexto)" },
      { to: "/calls", label: "Mesa de Discovery" },
      { to: "/leads", label: "Leads e triagem" },
      { to: "/crm-mestre", label: "CRM Mestre — Discovery e Handoff" },
      { to: "/propostas", label: "Propostas" },
      { to: "/conversao", label: "Conversão e handoff" },
      { to: "/proximas-acoes", label: "Próximas ações dos leads" },
      { grupo: "Marketing (contexto)" },
      { to: "/marketing", label: "Marketing e aquisição" },
      { to: "/governanca/dicionario-calls-crm", label: "Dicionário Calls → CRM" },
      { grupo: "Atalhos" },
      { to: "/painel", hash: "encontrar-no-desk", label: "Encontrar no Desk" },
    ],
  },
  {
    id: "casos-360",
    to: "/casos",
    label: "Casos 360",
    descricao: "Carteira de casos, pessoas e formalização do caso — sem segunda ficha da mesma pessoa.",
    icone: "casos",
    agrupador: true,
    sub: [
      { grupo: "Pessoas e família" },
      { to: "/clientes", label: "Pessoas 360" },
      { to: "/nucleos", label: "Núcleos familiares" },
      { to: "/nucleos-duplicidades", label: "Possíveis núcleos duplicados" },
      { grupo: "Formalização (contexto)" },
      { to: "/contratos", label: "Contratos, versões e anexos" },
      { to: "/ordens-servico", label: "Ordens de serviço" },
      { to: "/contrato-parametros", label: "Parâmetros contratuais" },
      { to: "/financeiro", label: "Condições, faturas e pagamentos" },
      { to: "/catalogo", label: "Catálogo homologado" },
      { to: "/governanca/contrato-base", label: "Contrato-base consolidado" },
      { to: "/governanca/modelo-individual", label: "Modelo individual + acompanhante" },
      { to: "/governanca/modelo-familiar-casal", label: "Modelo familiar — casal" },
      { to: "/governanca/modelos-contratuais", label: "Matriz de modelos contratuais" },
      { grupo: "App Cliente (contexto)" },
      { to: "/acessos-portal", label: "Acessos ao App Cliente" },
      { to: "/atendimento", label: "Atendimento e documentos" },
      { to: "/atendimento", hash: "publicacao", label: "Publicação de entregas autorizadas" },
      { to: "/app-cliente-como-pessoa", label: "App Cliente como pessoa" },
    ],
  },
  {
    id: "checklist",
    to: "/tarefas",
    label: "Checklist",
    descricao: "Tarefas por prioridade, responsável, prazo e caso.",
    icone: "checklist",
    agrupador: true,
    sub: [
      { grupo: "Trabalho" },
      { to: "/ops", label: "Operação" },
      { to: "/ops-excecoes", label: "Exceções operacionais" },
    ],
  },
  {
    id: "validacao-juridica",
    to: "/matriz-juridica",
    label: "Validação Jurídica",
    descricao: "Elegibilidade, requisito legal e parecer humano por caso.",
    icone: "juridico",
    sub: [],
  },
  {
    id: "radar-interno",
    to: "/qualidade",
    label: "Radar Interno",
    descricao: "Riscos, prioridades e saúde da carteira.",
    icone: "radar",
    agrupador: true,
    sub: [
      { grupo: "Leitura de carteira" },
      { to: "/metricas", label: "Métricas comerciais e operacionais" },
      { to: "/relatorios", label: "Relatórios" },
    ],
  },
  {
    id: "alertas",
    to: "/alertas",
    label: "Alertas",
    descricao: "Achados e notificações acionáveis — abrir origem e resolver sem apagar evidência.",
    icone: "alertas",
    sub: [],
  },
  {
    id: "biblioteca-mestre",
    to: "/biblioteca",
    label: "Biblioteca Mestre",
    descricao: "Conteúdo, pesquisa, fontes e modelos reutilizáveis — sem virar tela técnica.",
    icone: "biblioteca",
    agrupador: true,
    sub: [
      { grupo: "Pesquisa" },
      { to: "/pesquisa-modulo", label: "Pesquisa genealógica e evidências" },
      { to: "/pesquisa", label: "Dossiê e repositório do Legado" },
      { to: "/pesquisa-modulo", hash: "assistente-ia", label: "Assistente IA de pesquisa" },
      { to: "/evidencias", label: "Evidências e documentos" },
      { to: "/fontes-genealogicas", label: "Fontes e bases genealógicas" },
      { grupo: "Modelos" },
      { to: "/biblioteca-mensagens", label: "Biblioteca de Mensagens" },
    ],
  },
] as const;

/**
 * Legado no menu da conta (consulta). Decisão de 10/09/2026: preservado.
 * Não é operação diária nem item da sidebar principal.
 */
export const ROTAS_LEGADO_MENU_GOVERNANCA = [
  "/governanca/catalogo-operacional-30",
  "/homologacao-skus",
  "/conciliacao-catalogo",
  "/divergencias-catalogo",
  "/escopo-origem",
] as const;

/**
 * Menu da conta — administração, legado rotulado e sessão DEMO.
 * Não é oitava aba da sidebar; fica abaixo das 7 telas.
 */
export const MENU_CONTA: {
  id: "conta";
  label: string;
  descricao: string;
  itens: readonly ItemNav[];
} = {
  id: "conta",
  label: "Conta e administração",
  descricao: "Configurações, equipe, legado rotulado e sessão DEMO.",
  itens: [
    { grupo: "Administração" },
    { to: "/configuracoes", label: "Configurações e preferências" },
    { to: "/equipe", label: "Equipe e papéis", adminOnly: true },
    { to: "/etiquetas", label: "Etiquetas canônicas" },
    { to: "/integracoes", label: "Integrações" },
    { to: "/importacoes", label: "Importações e migração" },
    { to: "/privacidade", label: "Privacidade e consentimento" },
    { grupo: "Legado (consulta)" },
    { to: "/governanca/catalogo-operacional-30", label: "Catálogo operacional 30 (legado)" },
    { to: "/homologacao-skus", label: "Homologação de SKUs (legado)" },
    { to: "/conciliacao-catalogo", label: "Conciliação de catálogo (legado)" },
    { to: "/divergencias-catalogo", label: "Divergências de catálogo (legado)" },
    { to: "/escopo-origem", label: "Origem do escopo (legado)" },
    { grupo: "Demo" },
    { to: "/app-cliente-demo", label: "Sessão demo do App Cliente (dado fictício)" },
  ],
} as const;

/**
 * Rotas que existiam no menu anterior e continuam com link direto.
 * Serve de trava de regressão: nenhuma delas pode sumir da navegação.
 *
 * 03/09/2026 — /piloto e /piloto-ana removidas desta lista por decisão
 * explícita da proprietária.
 *
 * 06/09/2026 — rotas de auditoria/diagnóstico estático removidas por ordem
 * da proprietária.
 */
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
  "/alertas",
  "/governanca/catalogo-operacional-30",
] as const;

/** Todas as rotas com link direto no menu principal ou no menu da conta. */
export function rotasDoMenu(): string[] {
  const set = new Set<string>();
  for (const g of GRUPOS_DESK) {
    set.add(g.to);
    for (const s of g.sub) if ("to" in s) set.add(s.to);
  }
  for (const s of MENU_CONTA.itens) if ("to" in s) set.add(s.to);
  return [...set];
}

/** Rotas presentes apenas no menu da conta (fora das 7 telas principais). */
export function rotasDoMenuConta(): string[] {
  return MENU_CONTA.itens.flatMap((s) => ("to" in s ? [s.to] : []));
}

/** Rotas preservadas que perderam link de menu (devem ser zero). */
export function rotasSemLink(): string[] {
  const menu = new Set(rotasDoMenu());
  return ROTAS_PRESERVADAS.filter((r) => !menu.has(r));
}

/**
 * Um mesmo destino (rota + hash) não pode se repetir DENTRO de uma tela.
 * Entre telas, a repetição é link contextual declarado — não é fila nova.
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

/**
 * Tela dona da rota: o trabalho completo mora aqui. Nos demais lugares,
 * só resumo e link. Sem dono = rota fora do menu (não inventar aba).
 */
export function grupoDonoDaRota(rota: string): string | null {
  const path = (rota.split("#")[0] ?? "").replace(/\/$/, "") || "/";
  for (const g of GRUPOS_DESK) {
    for (const s of g.sub) {
      if ("to" in s && s.to === path) return g.label;
    }
  }
  for (const g of GRUPOS_DESK) {
    if (g.to === path) return g.label;
  }
  for (const g of GRUPOS_DESK) {
    for (const s of g.sub) {
      if (!("to" in s)) continue;
      if (rotaAtendeDestino(path, s.to)) return g.label;
    }
  }
  return null;
}

/**
 * Mesmo destino (rota + hash) citado em mais de uma tela.
 * Com ownership único, a lista deve ficar vazia.
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

/** Sem atalhos cruzados: cada rota mora em uma única tela. */
export const LINKS_CONTEXTUAIS: readonly { rota: string; origem: string; tambemEm: string[] }[] = [];

/**
 * O grupo onde a rota mora, quando ela está sendo citada de fora dele.
 * Devolve o grupo de origem quando o item é atalho, e null quando é a entrada
 * canônica.
 */
export function origemDoAtalho(grupoLabel: string, rota: string): string | null {
  const registro = LINKS_CONTEXTUAIS.find((l) => l.rota === rota);
  if (!registro) return null;
  if (registro.origem === grupoLabel) return null;
  return registro.tambemEm.includes(grupoLabel) ? registro.origem : null;
}

/**
 * Natureza de cada biblioteca do Desk.
 *
 * `motor`      — algo no sistema chama esta biblioteca e ela muda o que sai.
 * `descritiva` — referência para leitura humana; nada a consome para agir.
 */
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

/** Hash da URL sem `#`, para comparar destino de menu com a rota atual. */
export function hashDaRota(hash: string | undefined | null): string {
  return (hash ?? "").replace(/^#/, "");
}

/**
 * Destino de menu sem colisão de prefixo.
 * `/pesquisa` não marca `/pesquisa-modulo`; `/casos` marca `/casos/$id`.
 */
export function rotaAtendeDestino(atual: string, destino: string): boolean {
  if (!atual || !destino) return false;
  if (atual === destino) return true;
  if (destino === "/") return false;
  return atual.startsWith(`${destino}/`);
}

export type DestinoNav = { to: string; hash?: string };

/** Item de menu ativo: hash, quando existe, precisa bater; senão a rota (ou subrota). */
export function itemNavAtivo(atual: string, hashAtual: string, item: DestinoNav): boolean {
  const hash = hashDaRota(hashAtual);
  if (item.hash) return atual === item.to && hash === hashDaRota(item.hash);
  if (hash && atual === item.to) return false;
  return rotaAtendeDestino(atual, item.to);
}

/** Tela ativa canônica: entrada da tela ou item que mora nela — atalhos não douram a tela errada. */
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
