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

/**
 * MENU V4 — aplicado em 03/10/2026, por diretriz explícita da Proprietária
 * ("SANEAMENTO REVERSÍVEL DO DESK V4 — EXECUTAR, NÃO PLANEJAR").
 *
 * `NAVEGACAO_V4_DESK` e `ROTAS_FORA_DO_MENU` existiam desde 02/10 e nunca
 * tinham sido aplicados ao menu que de fato renderiza — o mesmo padrão de
 * decidir e não executar. Agora `GRUPOS_DESK` É o V4.
 *
 * Primeiro nível, literal da diretriz: Hoje · Comercial · Casos ·
 * Pessoas & Famílias · Pesquisa · Marketing · Configuração.
 *
 * O que saiu do menu NÃO foi apagado: a rota continua aberta por endereço
 * direto e está listada em `ROTAS_FORA_DO_MENU` com a classificação
 * (ALIMENTO_CONTEXTUAL ou LEGADO_SEM_MENU). A matriz completa está em
 * docs/arquitetura/2026-10-03-SANEAMENTO-DESK-V4.md.
 */
/**
 * MENU V4 — aplicado em 03/10/2026 por diretriz explícita da Proprietária
 * ("SANEAMENTO REVERSÍVEL DO DESK V4 — EXECUTAR, NÃO PLANEJAR") e confirmado
 * por ela em seguida: "Confirmo que o v4 substitui".
 *
 * A autoridade é a prancha V4, enviada pela Proprietária: sete itens de
 * primeiro nível e, dentro de cada um, as abas que a prancha desenha. Os seis
 * grupos anteriores (02/10) ficam registrados em
 * `GRUPOS_OPERACIONAIS_DESK_ATE_02_10` — decisão superada com data, não
 * apagada.
 *
 * `NAVEGACAO_V4_DESK` e `ROTAS_FORA_DO_MENU` já existiam desde 02/10 e nunca
 * tinham sido aplicados ao menu que de fato renderiza. Agora `GRUPOS_DESK` é
 * o V4.
 *
 * Nada foi apagado: o que ficou fora do menu continua aberto por endereço
 * direto, classificado em `CLASSIFICACAO_SANEAMENTO_V4`.
 */
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
      /*
       * 04/10/2026 — "Retire todas as auditorias repetidas do menu": o rótulo
       * "Qualidade e auditoria" vendia auditoria como item de menu. A rota é a
       * leitura operacional (matriz de elegibilidade × urgência e Radar
       * Individual); a parte de qualidade/checklists segue recolhida dentro
       * dela. A rota não mudou, só o nome no menu.
       */
      { to: "/qualidade", label: "Radar e matrizes" },
      { to: "/privacidade", label: "Privacidade e consentimento" },
    ],
  },
] as const;

/**
 * Legado no menu de Governança. Decisão de 10/09/2026: fica aqui agora.
 * No pente fino, sai do Desk e vai para arquivo GitHub — não apagar nesta rodada.
 */
export const ROTAS_LEGADO_MENU_GOVERNANCA = [
  "/governanca/catalogo-operacional-30",
  "/homologacao-skus",
  "/conciliacao-catalogo",
  "/divergencias-catalogo",
  "/escopo-origem",
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
/**
 * Rota preservada que perdeu o link de menu E não foi classificada no
 * saneamento V4. Tem de ser sempre vazio: uma rota ou está no menu, ou está
 * declarada como ALIMENTO_CONTEXTUAL / LEGADO_SEM_MENU. Nenhuma some em
 * silêncio.
 */
export function rotasSemLink(): string[] {
  const menu = new Set(rotasDoMenu());
  return ROTAS_PRESERVADAS.filter((r) => !menu.has(r) && !(r in CLASSIFICACAO_SANEAMENTO_V4));
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
 * Grupo dono da rota: o trabalho completo mora aqui. Nos demais lugares,
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
    for (const s of g.sub) {
      if (!("to" in s)) continue;
      if (rotaAtendeDestino(path, s.to)) return g.label;
    }
  }
  return null;
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
