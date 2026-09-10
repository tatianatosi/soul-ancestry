/**
 * NAVEGAÇÃO CANÔNICA DO DESK — 6 grupos, um endereço por função.
 *
 * Hoje · Marketing & Comercial · Pessoas & Casos · Inteligência & Pesquisa ·
 * Formalização & Financeiro · Governança & Administração.
 *
 * Pesquisa e bases moram na Inteligência. Matrizes individual/casal/familiar
 * moram na Formalização. CA-04 (CRM Mestre + Dicionário) é dicionário
 * administrativo: informa o Painel de Calls, mas não disputa o fluxo diário.
 * Planilha Mestre, conciliação e SKU legado ficam só em Governança.
 */

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

/** Nomes das 7 telas do mockup — taxonomia visual, não a sidebar. */
export const TELAS_DESK_MOCKUP = [
  "Visão Geral",
  "Casos 360",
  "Checklist",
  "Validação Jurídica",
  "Radar Interno",
  "Alertas",
  "Biblioteca Mestre",
] as const;

export const GRUPOS_OPERACIONAIS_DESK = [
  "Hoje",
  "Marketing & Comercial",
  "Pessoas & Casos",
  "Inteligência & Pesquisa",
  "Formalização & Financeiro",
  "Governança & Administração",
] as const;

export const GRUPOS_DESK: readonly GrupoDesk[] = [
  {
    id: "hoje",
    to: "/painel",
    label: "Hoje",
    descricao: "O que precisa de decisão agora — indicadores com ação, fila, alertas, bloqueios e prazos.",
    icone: "hoje",
    sub: [
      { to: "/painel", label: "Painel Hoje" },
      { to: "/painel", hash: "encontrar-no-desk", label: "Encontrar no Desk" },
      { to: "/alertas", label: "Alertas" },
    ],
  },
  {
    id: "comercial",
    to: "/leads",
    label: "Marketing & Comercial",
    descricao: "Origem da demanda, Calls, Discovery, proposta e conversão — CRM Vivo.",
    icone: "comercial",
    agrupador: true,
    sub: [
      { grupo: "Aquisição" },
      { to: "/marketing", label: "Marketing e aquisição" },
      { grupo: "CRM Vivo" },
      { to: "/leads", label: "Leads e triagem" },
      { to: "/calls", label: "Painel de Calls" },
      { to: "/propostas", label: "Propostas" },
      { to: "/conversao", label: "Conversão, follow-up e handoff" },
      { to: "/proximas-acoes", label: "Próximas ações dos leads" },
    ],
  },
  {
    id: "casos",
    to: "/casos",
    label: "Pessoas & Casos",
    descricao: "Pessoa, núcleo, caso, jornada, checklist e radar — sem copiar contrato nem pesquisa.",
    icone: "casos",
    agrupador: true,
    sub: [
      { grupo: "Carteira" },
      { to: "/casos", label: "Casos 360" },
      { to: "/nucleos", label: "Núcleos familiares e dossiê-mãe" },
      { to: "/nucleos-duplicidades", label: "Possíveis núcleos duplicados" },
      { to: "/clientes", label: "Clientes e pessoa 360" },
      { grupo: "Trabalho do caso" },
      { to: "/tarefas", label: "Checklist (tarefas e entregas internas)" },
      { to: "/ops", label: "Operação" },
      { to: "/ops-excecoes", label: "Exceções operacionais" },
      { to: "/qualidade", label: "Radar Interno e Qualidade" },
      { to: "/casos", hash: "jornada", label: "Fechamento e ativação do caso" },
      { grupo: "Portal" },
      { to: "/acessos-portal", label: "Acessos ao portal e App Cliente" },
      { to: "/atendimento", label: "Atendimento e solicitações de documentos" },
      { to: "/atendimento", hash: "publicacao", label: "Publicação de entregas autorizadas" },
      { to: "/app-cliente-como-pessoa", label: "App Cliente como pessoa (dado real)" },
    ],
  },
  {
    id: "pesquisa",
    to: "/biblioteca",
    label: "Inteligência & Pesquisa",
    descricao: "Biblioteca Mestre, bases genealógicas, evidências, dossiê do Legado e trilhas.",
    icone: "pesquisa",
    agrupador: true,
    sub: [
      { grupo: "Centro de inteligência" },
      { to: "/biblioteca", label: "Biblioteca Mestre" },
      { to: "/pesquisa-modulo", label: "Pesquisa Genealógica e Evidências" },
      { to: "/pesquisa", label: "Dossiê e repositório do Legado" },
      { to: "/pesquisa-modulo", hash: "assistente-ia", label: "Assistente IA de pesquisa" },
      { grupo: "Fontes e prova" },
      { to: "/fontes-genealogicas", label: "Fontes, consultas e bases genealógicas" },
      { to: "/evidencias", label: "Evidências e documentos" },
      { to: "/privacidade", label: "Privacidade e consentimento" },
      { grupo: "Trilha" },
      { to: "/matriz-juridica", label: "Validação Jurídica" },
      { to: "/biblioteca-mensagens", label: "Biblioteca de Mensagens" },
      { to: "/relatorios", label: "Relatórios" },
    ],
  },
  {
    id: "contratos",
    to: "/contratos",
    label: "Formalização & Financeiro",
    descricao: "Contrato vivo, matrizes individual/casal/familiar, catálogo homologado e financeiro.",
    icone: "contratos",
    agrupador: true,
    sub: [
      { grupo: "Formalização" },
      { to: "/contratos", label: "Contratos, versões e anexos" },
      { to: "/contrato-parametros", label: "Parâmetros contratuais" },
      { to: "/ordens-servico", label: "Ordens de serviço" },
      { grupo: "Matrizes de composição" },
      { to: "/governanca/contrato-base", label: "Contrato-base consolidado" },
      { to: "/governanca/modelo-individual", label: "Modelo individual + acompanhante" },
      { to: "/governanca/modelo-familiar-casal", label: "Modelo familiar — casal" },
      { to: "/governanca/modelos-contratuais", label: "Matriz de modelos contratuais" },
      { grupo: "Catálogo e financeiro" },
      { to: "/catalogo", label: "Catálogo homologado" },
      { to: "/financeiro", label: "Condições, faturas e pagamentos internos" },
    ],
  },
  {
    id: "governanca",
    to: "/configuracoes",
    label: "Governança & Administração",
    descricao: "Papéis, legado arquivado, integrações, DEMO e o que não decide o dia.",
    icone: "governanca",
    agrupador: true,
    sub: [
      { grupo: "Administração" },
      { to: "/configuracoes", label: "Configurações e preferências" },
      { to: "/equipe", label: "Equipe e papéis", adminOnly: true },
      { to: "/etiquetas", label: "Etiquetas canônicas" },
      { to: "/integracoes", label: "Integrações" },
      { to: "/importacoes", label: "Importações e migração" },
      { to: "/metricas", label: "Métricas comerciais e operacionais" },
      { grupo: "Dicionários e arquivo" },
      { to: "/crm-mestre", label: "CRM Mestre — mapa de regras (não é fila)" },
      { to: "/governanca/dicionario-calls-crm", label: "Dicionário Calls → CRM" },
      { to: "/governanca/catalogo-operacional-30", label: "Catálogo operacional 30 (legado)" },
      { to: "/homologacao-skus", label: "Homologação de SKUs (legado)" },
      { to: "/conciliacao-catalogo", label: "Conciliação de catálogo (legado)" },
      { to: "/divergencias-catalogo", label: "Divergências de catálogo (legado)" },
      { to: "/escopo-origem", label: "Origem do escopo (legado)" },
    ],
  },
] as const;

/**
 * Menu da conta — só a sessão DEMO. Equipe, configurações e legado moram
 * em Governança & Administração. Não é nona aba.
 */
export const MENU_CONTA: {
  id: "conta";
  label: string;
  descricao: string;
  itens: readonly ItemNav[];
} = {
  id: "conta",
  label: "Conta e administração",
  descricao: "Sessão DEMO do App Cliente — dado fictício, fora da operação.",
  itens: [{ to: "/app-cliente-demo", label: "Sessão demo do App Cliente (dado fictício)" }],
} as const;

/**
 * Rotas que existiam no menu anterior (7 grupos) e continuam com link direto.
 * Serve de trava de regressão: nenhuma delas pode sumir da navegação.
 *
 * 03/09/2026 — /piloto e /piloto-ana removidas desta lista por decisão
 * explícita da proprietária: o mecanismo de "piloto" da Ana convergiu para
 * o fluxo padrão de qualquer caso real (aba Jornada → Fechamento, 9 gates
 * de src/lib/fechamento-caso.ts). As rotas continuam existindo no
 * repositório, só saíram do menu.
 *
 * 06/09/2026 — /governanca/criterios-aceite, /governanca/matriz-conformidade,
 * /governanca/corte-vertical, /governanca/indicadores,
 * /governanca/inventario-recuperacao, /governanca/inventario-patrimonial,
 * /governanca/modulos-contextuais, /governanca/matriz-equivalencia,
 * /governanca/identificadores, /governanca/varredura-completude e /auditoria
 * removidas desta lista por decisão explícita da proprietária: "remova
 * todos os gates cerimoniais, não preciso de mais de 700 linhas de
 * auditoria pra um sistema que é meu". Eram telas de auditoria/diagnóstico
 * estático, não superfície de trabalho — nenhuma grava ou decide nada sobre
 * o caso real.
 *
 * 06/09/2026 (execução do PROMPT_REMOCAO_TOTAL_BARREIRAS_OPERACIONAIS, por
 * ordem direta e explícita da proprietária, independente do rótulo
 * "rejeitado" que um agente anterior deu a ele sem manifestação literal
 * dela) — as 11 rotas acima e /auditoria deixaram de "só sair do menu" e
 * tiveram o arquivo de rota fisicamente apagado do repositório: eram
 * exatamente o que o prompt pede pra remover ("não esconder só por CSS ou
 * navegação — remover renderização"). /governanca/decisoes foi mantida
 * porque é um link real usado por `referencias-normativas.tsx` (log de
 * decisões citado em pesquisa), não um card de auditoria isolado.
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

/** Rotas presentes apenas no menu da conta (fora dos 6 grupos principais). */
export function rotasDoMenuConta(): string[] {
  return MENU_CONTA.itens.flatMap((s) => ("to" in s ? [s.to] : []));
}

/** Rotas preservadas que perderam link de menu (devem ser zero). */
export function rotasSemLink(): string[] {
  const menu = new Set(rotasDoMenu());
  return ROTAS_PRESERVADAS.filter((r) => !menu.has(r));
}

/**
 * Um mesmo destino (rota + hash) não pode se repetir DENTRO de um grupo.
 * Entre grupos, a repetição é link contextual declarado (ex.: Validação
 * Jurídica em Governança com atalho em Comercial e Casos) — não é fila nova.
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
 * Mesmo destino (rota + hash) citado em mais de um grupo. Com os 6 grupos
 * sem sobreposição, a lista deve ficar vazia.
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

/** Sem atalhos cruzados: cada rota mora em um único grupo. */
export const LINKS_CONTEXTUAIS: readonly { rota: string; origem: string; tambemEm: string[] }[] = [];

/**
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

/**
 * Natureza de cada biblioteca do Desk.
 *
 * 26/08/2026 — princípio da Proprietária: "temos muitas bibliotecas que são e
 * podem ser chamadas por motores, outras são descritivas… muita info significa
 * nenhuma info".
 *
 * `motor`      — algo no sistema chama esta biblioteca e ela muda o que sai
 *                (template versionado, evidência vinculada a caso).
 * `descritiva` — referência para leitura humana; nada a consome para agir.
 *
 * A distinção é medida, não opinada: `motor` só vale para biblioteca com
 * função de servidor própria ou consumida por caminho que produz saída.
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
