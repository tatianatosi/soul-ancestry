/**
 * NAVEGAÇÃO CANÔNICA DO DESK — decisão da proprietária em 11/09/2026.
 *
 * Face principal (sempre visível): as 7 telas do mockup de 17 páginas.
 * Camada interna (submenu recolhido): 6 grupos operacionais.
 * Nada é apagado. Nenhuma 8ª tela. Nenhuma barra concorrente.
 */

export type ItemNav =
  { grupo: string } | { to: string; label: string; hash?: string; adminOnly?: boolean };

export type IconeDesk =
  | "visao-geral"
  | "casos"
  | "checklist"
  | "juridica"
  | "radar"
  | "alertas"
  | "biblioteca";

export type GrupoDesk = {
  id: string;
  /** Rota de entrada da tela (já existente). */
  to: string;
  label: string;
  /** Descrição curta e humana exibida no menu e no topo do grupo. */
  descricao: string;
  icone: IconeDesk;
  agrupador?: boolean;
  sub: readonly ItemNav[];
};

/** Face principal — exatamente estes 7 rótulos, nesta ordem. */
export const TELAS_DESK_MOCKUP = [
  "Visão Geral",
  "Casos 360",
  "Checklist",
  "Validação Jurídica",
  "Radar Interno",
  "Alertas",
  "Biblioteca Mestre",
] as const;

/** Seis grupos internos — submenu/contexto, nunca a barra. */
export const GRUPOS_OPERACIONAIS_DESK = [
  "Hoje",
  "Comercial",
  "Casos & Pessoas",
  "Pesquisa",
  "Formalização",
  "Governança",
] as const;

export type GrupoInternoId = "hoje" | "comercial" | "casos" | "pesquisa" | "contratos" | "governanca";

export const INTERNO_DO_CABECALHO: Record<string, GrupoInternoId> = {
  Hoje: "hoje",
  Comercial: "comercial",
  "Casos & Pessoas": "casos",
  Pesquisa: "pesquisa",
  Formalização: "contratos",
  Governança: "governanca",
};

const INTERNO_PADRAO_DA_TELA: Record<string, GrupoInternoId> = {
  "visao-geral": "hoje",
  casos: "casos",
  checklist: "casos",
  juridica: "contratos",
  radar: "casos",
  alertas: "hoje",
  biblioteca: "pesquisa",
};

export const GRUPOS_DESK: readonly GrupoDesk[] = [
  {
    id: "visao-geral",
    to: "/painel",
    label: "Visão Geral",
    descricao: "O dia, o funil e o atalho para a Mesa de Discovery — sem virar CRM paralelo.",
    icone: "visao-geral",
    agrupador: true,
    sub: [
      { grupo: "Hoje" },
      { to: "/painel", label: "Painel Hoje" },
      { to: "/painel", hash: "encontrar-no-desk", label: "Encontrar no Desk" },
      { to: "/metricas", label: "Métricas comerciais e operacionais" },
      { to: "/relatorios", label: "Relatórios" },
      { grupo: "Comercial" },
      { to: "/marketing", label: "Marketing e aquisição" },
      { to: "/leads", label: "Leads e triagem" },
      { to: "/calls", label: "Painel de Calls — Mesa de Discovery" },
      { to: "/propostas", label: "Propostas" },
      { to: "/conversao", label: "Conversão, follow-up e handoff" },
      { to: "/proximas-acoes", label: "Próximas ações dos leads" },
    ],
  },
  {
    id: "casos",
    to: "/casos",
    label: "Casos 360",
    descricao: "Pessoa, núcleo, caso, contrato e financeiro do mesmo dossiê — sem silo de menu.",
    icone: "casos",
    agrupador: true,
    sub: [
      { grupo: "Casos & Pessoas" },
      { to: "/casos", label: "Lista de casos" },
      { to: "/nucleos", label: "Núcleos familiares e dossiê-mãe" },
      { to: "/nucleos-duplicidades", label: "Possíveis núcleos duplicados" },
      { to: "/clientes", label: "Clientes e pessoa 360" },
      { to: "/casos", hash: "jornada", label: "Fechamento e ativação do caso" },
      { to: "/acessos-portal", label: "Acessos ao portal e App Cliente" },
      { to: "/atendimento", label: "Atendimento e solicitações de documentos" },
      { to: "/atendimento", hash: "publicacao", label: "Publicação de entregas autorizadas" },
      { to: "/app-cliente-como-pessoa", label: "App Cliente como pessoa (dado real)" },
      { grupo: "Formalização" },
      { to: "/contratos", label: "Contratos, versões e anexos" },
      { to: "/contrato-parametros", label: "Parâmetros contratuais" },
      { to: "/ordens-servico", label: "Ordens de serviço" },
      { to: "/financeiro", label: "Condições, faturas e pagamentos internos" },
      { to: "/governanca/contrato-base", label: "Contrato-base consolidado" },
      { to: "/governanca/modelo-individual", label: "Modelo individual + acompanhante" },
      { to: "/governanca/modelo-familiar-casal", label: "Modelo familiar — casal" },
      { to: "/governanca/modelos-contratuais", label: "Matriz de modelos contratuais" },
    ],
  },
  {
    id: "checklist",
    to: "/tarefas",
    label: "Checklist",
    descricao: "Tarefas, operação e exceções do dia — a lista, não um segundo caso.",
    icone: "checklist",
    sub: [
      { grupo: "Hoje" },
      { to: "/tarefas", label: "Checklist (tarefas e entregas internas)" },
      { to: "/ops", label: "Operação" },
      { to: "/ops-excecoes", label: "Exceções operacionais" },
    ],
  },
  {
    id: "juridica",
    to: "/matriz-juridica",
    label: "Validação Jurídica",
    descricao: "Matriz jurídica do caso — pendência informa, não trava a proprietária.",
    icone: "juridica",
    sub: [],
  },
  {
    id: "radar",
    to: "/qualidade",
    label: "Radar Interno",
    descricao: "Risco e qualidade da carteira, com uma fonte por número.",
    icone: "radar",
    sub: [],
  },
  {
    id: "alertas",
    to: "/alertas",
    label: "Alertas",
    descricao: "Achados pendentes. Enviar só depois da confirmação humana.",
    icone: "alertas",
    sub: [],
  },
  {
    id: "biblioteca",
    to: "/biblioteca",
    label: "Biblioteca Mestre",
    descricao: "Pesquisa, acervo e governança — catálogo e legado nunca na primeira dobra.",
    icone: "biblioteca",
    agrupador: true,
    sub: [
      { grupo: "Pesquisa" },
      { to: "/biblioteca", label: "Acervo da Biblioteca Mestre" },
      { to: "/pesquisa-modulo", label: "Pesquisa Genealógica e Evidências" },
      { to: "/pesquisa", label: "Dossiê e repositório do Legado" },
      { to: "/pesquisa-modulo", hash: "assistente-ia", label: "Assistente IA de pesquisa" },
      { to: "/fontes-genealogicas", label: "Fontes, consultas e bases genealógicas" },
      { to: "/evidencias", label: "Evidências e documentos" },
      { to: "/privacidade", label: "Privacidade e consentimento" },
      { to: "/biblioteca-mensagens", label: "Biblioteca de Mensagens" },
      { grupo: "Governança" },
      { to: "/catalogo", label: "Catálogo homologado" },
      { to: "/configuracoes", label: "Configurações e preferências" },
      { to: "/equipe", label: "Equipe e papéis", adminOnly: true },
      { to: "/etiquetas", label: "Etiquetas canônicas" },
      { to: "/integracoes", label: "Integrações" },
      { to: "/importacoes", label: "Importações e migração" },
      { to: "/app-cliente-demo", label: "Sessão demo do App Cliente (dado fictício)" },
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
 * Menu da conta — vazio. Equipe, configurações, legado e a sessão DEMO
 * moram em Biblioteca Mestre → Governança (submenu recolhido). Não é nona
 * aba e não é a aba Conta do App Cliente (`/portal/conta`).
 */
export const MENU_CONTA: {
  id: "conta";
  label: string;
  descricao: string;
  itens: readonly ItemNav[];
} = {
  id: "conta",
  label: "Conta e administração",
  descricao: "Preferências da sessão. Administração e DEMO moram em Governança.",
  itens: [],
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

function considerarPrefixo(
  pathname: string,
  alvo: string,
  id: GrupoInternoId,
  melhor: { id: GrupoInternoId; tamanho: number } | null,
): { id: GrupoInternoId; tamanho: number } | null {
  const casa = pathname === alvo || pathname.startsWith(`${alvo}/`);
  if (!casa) return melhor;
  if (alvo.length > (melhor?.tamanho ?? -1)) return { id, tamanho: alvo.length };
  return melhor;
}

/**
 * Grupo interno da rota — metadado para o assistente e filtros, não
 * o id da tela de face. A proprietária não vê estes nomes no 1º nível.
 */
export function grupoInternoDaRota(rota: string): GrupoInternoId | null {
  const pathname = rota.split("#")[0] ?? rota;
  let melhor: { id: GrupoInternoId; tamanho: number } | null = null;
  for (const tela of GRUPOS_DESK) {
    const padrao = INTERNO_PADRAO_DA_TELA[tela.id] ?? "hoje";
    let grupoAtual: GrupoInternoId = padrao;
    for (const s of tela.sub) {
      if ("grupo" in s) {
        grupoAtual = INTERNO_DO_CABECALHO[s.grupo] ?? grupoAtual;
        continue;
      }
      melhor = considerarPrefixo(pathname, s.to, grupoAtual, melhor);
    }
    melhor = considerarPrefixo(pathname, tela.to, padrao, melhor);
  }
  for (const s of MENU_CONTA.itens) {
    if ("to" in s) melhor = considerarPrefixo(pathname, s.to, "governanca", melhor);
  }
  return melhor?.id ?? null;
}

/** Itens do submenu interno (Hoje, Comercial, …) em qualquer tela de face. */
export function itensDoGrupoInterno(
  id: GrupoInternoId,
): { to: string; label: string; adminOnly?: boolean }[] {
  const itens: { to: string; label: string; adminOnly?: boolean }[] = [];
  for (const tela of GRUPOS_DESK) {
    const padrao = INTERNO_PADRAO_DA_TELA[tela.id] ?? "hoje";
    if (padrao === id && !tela.sub.some((s) => "to" in s && s.to === tela.to)) {
      itens.push({ to: tela.to, label: tela.label });
    }
    let grupoAtual: GrupoInternoId = padrao;
    for (const s of tela.sub) {
      if ("grupo" in s) {
        grupoAtual = INTERNO_DO_CABECALHO[s.grupo] ?? grupoAtual;
        continue;
      }
      if (grupoAtual === id) itens.push(s);
    }
  }
  return itens;
}

export function rotasDoGrupoInterno(id: GrupoInternoId): string[] {
  return [...new Set(itensDoGrupoInterno(id).map((s) => s.to))];
}

/** Itens do menu da conta (vazio: equipe/config estão em Biblioteca → Governança). */
export function rotasDoMenuConta(): string[] {
  return MENU_CONTA.itens.flatMap((s) => ("to" in s ? [s.to] : []));
}

/** Rotas preservadas que perderam link de menu (devem ser zero). */
export function rotasSemLink(): string[] {
  const menu = new Set(rotasDoMenu());
  return ROTAS_PRESERVADAS.filter((r) => !menu.has(r));
}

/**
 * Um mesmo destino (rota + hash) não pode se repetir DENTRO de uma tela
 * de face. Entre telas, a repetição só é permitida se estiver em
 * LINKS_CONTEXTUAIS (hoje vazio: cada rota tem um único slot).
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
 * Mesmo destino (rota + hash) citado em mais de uma tela de face.
 * Com um slot por rota, a lista deve ficar vazia.
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

/** Sem atalhos cruzados: cada rota mora em uma única tela de face. */
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
