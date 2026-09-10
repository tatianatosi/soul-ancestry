/**
 * ARQUITETURA CONTEXTUAL DE MÓDULOS DO DESK (CA-UX-01.2)
 *
 * Cada módulo profundo reside DENTRO de uma das telas principais aprovadas do
 * Desk, como subrota ou painel contextual. Nenhum módulo profundo pode virar
 * nova aba principal. Este arquivo é a fonte normativa dessa alocação.
 */

/** Telas principais do Desk que recebem módulos contextuais. */
export type TelaDesk =
  "overview" | "crm" | "casos" | "checklist" | "juridica" | "biblio" | "alertas" | "assistente";

export const TELA_DESK_LABEL: Record<TelaDesk, string> = {
  overview: "Visão Geral",
  crm: "CRM Vivo",
  casos: "Casos 360",
  checklist: "Checklist semanal",
  juridica: "Validação Jurídica",
  biblio: "Biblioteca Mestre",
  alertas: "Alertas",
  assistente: "Assistente AI (painel lateral)",
};

/** As 7 telas principais do Desk que este corte precisa preservar. */
export const TELAS_PRINCIPAIS_DESK = [
  "overview",
  "crm",
  "casos",
  "checklist",
  "juridica",
  "alertas",
  "biblio",
] as const;

export type ModuloDesk = {
  /** Identificador estável do módulo profundo. */
  id: string;
  /** Nome exibido no painel contextual. */
  nome: string;
  /** Tela principal onde o módulo reside. */
  tela: TelaDesk;
  /** Subrota ou painel dentro da tela principal. */
  destino: string;
  /** Como o módulo é apresentado dentro da tela principal. */
  forma: "subrota" | "painel" | "aba_interna" | "lateral";
  /**
   * Classificação CA-UX-01.3 (auditoria módulos vs. métricas):
   * - operacional: dado e ação próprios, merece painel/subrota dedicada;
   * - metrica: número derivado de módulo operacional, exibido como badge no cabeçalho da aba;
   * - duplicado: mesmo sinal já exibido em outra tela; aqui vira contador com link para a fonte;
   * - a_confirmar: fonte de dado não confirmada — decisão pendente da Proprietária.
   */
  tipo: TipoModuloDesk;
  /** Para módulos "duplicado": id do módulo que é a fonte única de exibição operacional. */
  fonteUnica?: string;
  /** Descrição operacional curta, sem juízo de mérito sobre o caso. */
  descricao: string;
  /**
   * CA-OPS-02: estado real verificado no código. O catálogo nunca pode afirmar
   * que existe rota navegável quando ela não existe.
   */
  estadoReal?:
    "conectado" | "catalogado, sem superfície implementada" | "gap real — não implementado";
};

export type TipoModuloDesk = "operacional" | "metrica" | "duplicado" | "a_confirmar";

export const TIPO_MODULO_LABEL: Record<TipoModuloDesk, string> = {
  operacional: "Operacional",
  metrica: "Métrica",
  duplicado: "Duplicado",
  a_confirmar: "A confirmar",
};

export const MODULOS_DESK: ModuloDesk[] = [
  // ---------------- CRM VIVO ----------------
  {
    id: "crm-leads",
    nome: "Leads e triagem",
    tela: "crm",
    destino: "/leads",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Fila de leads, discovery e próxima ação por responsável.",
  },
  {
    id: "crm-propostas",
    nome: "Propostas",
    tela: "crm",
    destino: "/propostas · /casos/$id (aba Comercial)",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Propostas e páginas 1–7 homologadas. Aceite verbal não libera contrato nem App.",
  },
  {
    id: "crm-clientes-nucleos",
    nome: "Clientes e núcleos",
    tela: "crm",
    destino: "/clientes",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Clientes, núcleos familiares e vínculos com casos.",
  },

  // ---------------- CASOS 360 ----------------
  {
    id: "caso-visao-geral",
    nome: "Visão Geral do Caso",
    tela: "casos",
    destino: "/casos/$id (aba Visão Geral)",
    forma: "aba_interna",
    tipo: "operacional",
    descricao: "Estado consolidado, marcos e bloqueios do caso.",
  },
  {
    id: "caso-discovery",
    nome: "Discovery, brief e interações",
    tela: "casos",
    destino: "/casos/$id (aba Caso)",
    forma: "aba_interna",
    tipo: "operacional",
    descricao: "Brief interno, interações registradas e origem do lead.",
  },
  {
    id: "caso-proposta-blueprint",
    nome: "Proposta e Blueprint",
    tela: "casos",
    destino: "/casos/$id (aba Comercial) · /propostas",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Proposta aprovada, páginas 1–7 e blueprint paramétrico.",
  },
  {
    id: "caso-produto-trilha",
    nome: "Produto-pai, trilha e case service",
    tela: "casos",
    destino: "/casos/$id (aba Produto/Trilha)",
    forma: "aba_interna",
    tipo: "operacional",
    descricao: "Produto-pai, trilha de cidadania e serviços contratados.",
  },
  {
    id: "caso-familia",
    nome: "Família, participantes e dependentes",
    tela: "casos",
    destino: "/casos/$id (aba Pessoas)",
    forma: "aba_interna",
    tipo: "operacional",
    descricao: "Núcleo familiar, signatários e dependentes representados.",
  },
  {
    id: "caso-pesquisa",
    nome: "Pesquisa genealógica",
    tela: "casos",
    destino: "/pesquisa/$id · /pesquisa-modulo/$id",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Hipóteses, eventos e plano de pesquisa do caso.",
  },
  {
    id: "caso-ficha-piloto",
    nome: "Ficha de pesquisa do caso",
    tela: "casos",
    destino: "/piloto-ana · /piloto",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Ficha e conferência do caso-piloto.",
  },
  {
    id: "caso-linhagens",
    nome: "Pessoas, linhagens, árvore e linha do tempo",
    tela: "casos",
    destino: "/casos/$id (aba Visão Geral → linha do tempo)",
    forma: "painel",
    tipo: "operacional",
    descricao: "Pessoas, relações e eventos operacionais do caso.",
  },
  {
    id: "caso-documentos",
    nome: "Documentos, fontes e evidências",
    tela: "casos",
    destino: "/evidencias · /privacidade/$id",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Documentos, fontes citadas e evidências vinculadas.",
  },
  {
    id: "caso-achados",
    nome: "Achados e encontros de linhagem",
    tela: "casos",
    destino: "/casos/$id (aba Técnico)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Achados registrados e pontos de convergência de linhagem.",
  },
  {
    id: "caso-onboarding",
    nome: "Onboarding",
    tela: "casos",
    destino: "/onboarding/$id",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Checks de ativação e liberação do caso.",
  },
  {
    id: "caso-formalizacao",
    nome: "Formalização",
    tela: "casos",
    destino: "/casos/$id/contrato/preparar",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Preparação contratual, parâmetros e gates.",
  },
  {
    id: "caso-go-live",
    nome: "Go-live",
    tela: "casos",
    destino: "/casos/$id (aba Fechamento) · /onboarding/$id",
    forma: "aba_interna",
    tipo: "operacional",
    descricao: "Os 9 gates de fechamento e liberação do caso ativo. Nenhuma liberação automática.",
  },
  {
    id: "caso-dossie",
    nome: "Dossiê e fila Drive",
    tela: "casos",
    destino: "/casos/$id (aba Visão Geral → dossiê)",
    forma: "painel",
    tipo: "operacional",
    descricao: "Estado de preparação do dossiê. Nenhuma pasta é criada aqui.",
  },
  {
    id: "caso-historico",
    nome: "Histórico e auditoria do caso",
    tela: "casos",
    destino: "/casos/$id (log) · /auditoria",
    forma: "painel",
    tipo: "operacional",
    descricao: "Log granular de alterações do caso.",
  },

  // ---------------- CHECKLIST ----------------
  {
    id: "chk-proximas-acoes",
    nome: "Próximas ações",
    tela: "checklist",
    destino: "/tarefas",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Próxima ação por caso e por responsável.",
  },
  {
    id: "chk-plano-pesquisa",
    nome: "Plano de ação de pesquisa",
    tela: "checklist",
    destino: "Checklist semanal → Plano de ação de pesquisa · /plano-acao/$caseId",
    forma: "aba_interna",
    tipo: "operacional",
    descricao:
      "Oito visões operacionais de ações, instituições, rechecagens e estimativas de terceiros.",
  },
  {
    id: "chk-rechecagens",
    nome: "Rechecagens institucionais",
    tela: "checklist",
    destino: "/ops (rechecagens)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Rechecagens periódicas de fontes institucionais.",
  },
  {
    id: "chk-d10-d14",
    nome: "D10 / D14",
    tela: "checklist",
    destino: "/ops (SLA D10/D14)",
    forma: "painel",
    tipo: "metrica",
    descricao: "Marcos de acompanhamento D10 e D14.",
  },
  {
    id: "chk-pendencias-resp",
    nome: "Pendências por responsável",
    tela: "checklist",
    destino: "/ops (fila por responsável)",
    forma: "painel",
    tipo: "metrica",
    descricao: "Pendências agrupadas por pessoa responsável.",
  },
  {
    id: "chk-semanal",
    nome: "Checklist semanal",
    tela: "checklist",
    destino: "Checklist semanal (tela principal)",
    forma: "painel",
    tipo: "operacional",
    descricao: "Rotina semanal preservada do mockup aprovado.",
  },
  {
    id: "chk-formalizacao",
    nome: "Ações de formalização",
    tela: "checklist",
    destino: "/ops-excecoes · /ordens-servico",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Ações operacionais que destravam gates de formalização.",
  },

  // ---------------- VALIDAÇÃO JURÍDICA ----------------
  {
    id: "jur-matriz",
    nome: "Matriz jurídica",
    tela: "juridica",
    destino: "/matriz-juridica",
    forma: "subrota",
    tipo: "operacional",
    descricao: "12 temas normativos e estado de revisão.",
  },
  {
    id: "jur-marcos",
    nome: "Marcos jurídicos",
    tela: "juridica",
    destino: "/matriz-juridica (marcos)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Marcos legais aplicáveis por trilha.",
  },
  {
    id: "jur-trilhas",
    nome: "Trilhas e regras",
    tela: "juridica",
    destino: "/matriz-juridica (trilhas)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Regras por trilha de cidadania.",
  },
  {
    id: "jur-casos",
    nome: "Casos impactados",
    tela: "juridica",
    destino: "/matriz-juridica (casos)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Casos afetados por cada decisão jurídica.",
  },
  {
    id: "jur-revisao",
    nome: "Revisão humana",
    tela: "juridica",
    destino: "/matriz-juridica (fila de revisão)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Itens pendentes de revisão jurídica humana.",
  },

  // ---------------- BIBLIOTECA MESTRE ----------------
  {
    id: "bib-produto-top30",
    nome: "Produto-pai e Top 30",
    tela: "biblio",
    destino: "/biblioteca (catálogo) · product_catalog",
    forma: "painel",
    tipo: "operacional",
    descricao: "Produto-pai e complementos homologados.",
  },
  {
    id: "bib-fontes",
    nome: "Catálogo de fontes",
    tela: "biblio",
    destino: "/biblioteca (fontes)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Fontes institucionais catalogadas.",
  },
  {
    id: "bib-5b-pre",
    nome: "Bloco 5B-Pre",
    tela: "biblio",
    destino: "/biblioteca (5B-Pre)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Bloco normativo 5B-Pre.",
  },
  {
    id: "bib-dicionarios",
    nome: "Dicionários e glossário",
    tela: "biblio",
    destino: "/biblioteca (glossário) · /etiquetas",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Glossário, dicionários e taxonomia canônica.",
  },
  {
    id: "bib-linguagem",
    nome: "Guia de linguagem",
    tela: "biblio",
    destino: "/biblioteca (linguagem)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Linguagem permitida ao cliente, sem juízo de mérito.",
  },
  {
    id: "bib-tipos-doc",
    nome: "Tipos documentais e evidências",
    tela: "biblio",
    destino: "/biblioteca (tipos documentais)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Dicionário de tipos de documento e evidência.",
  },
  {
    id: "bib-modelos",
    nome: "Modelos F1 / F2",
    tela: "biblio",
    destino: "/biblioteca (modelos)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Modelos de relatório Fase 01 e Fase 02.",
  },
  {
    id: "bib-templates-com",
    nome: "Modelos institucionais",
    tela: "biblio",
    destino: "Apontador histórico (CA-OPS-03) — fonte canônica: /biblioteca-mensagens",
    forma: "painel",
    tipo: "duplicado",
    fonteUnica: "biblioteca-mensagens",
    estadoReal: "catalogado, sem superfície implementada",
    descricao:
      "Entrada histórica sem dados próprios. Todo modelo de comunicação vive na Biblioteca de Mensagens.",
  },
  {
    id: "bib-curadoria",
    nome: "Curadoria por caso",
    tela: "biblio",
    destino: "/biblioteca (curadoria)",
    forma: "painel",
    tipo: "a_confirmar",
    descricao: "Itens de conhecimento vinculados a cada caso.",
  },
  {
    id: "bib-versionamento",
    nome: "Histórico e versionamento",
    tela: "biblio",
    destino: "/governanca/decisoes · /governanca/inventario-recuperacao",
    forma: "subrota",
    tipo: "operacional",
    descricao: "Versões, decisões e recuperação de ativos.",
  },

  // ---------------- ALERTAS ----------------
  {
    id: "ale-achados",
    nome: "Achados novos",
    tela: "alertas",
    destino: "/achados/$caseId",
    forma: "subrota",
    tipo: "duplicado",
    fonteUnica: "caso-achados",
    estadoReal: "conectado",
    descricao: "Achados registrados por caso. Sem contador global.",
  },
  {
    id: "ale-microentregas",
    nome: "Micro-entregas em revisão",
    tela: "alertas",
    destino: "/ops (entregas aguardando aprovação)",
    forma: "painel",
    tipo: "duplicado",
    fonteUnica: "chk-pendencias-resp",
    estadoReal: "conectado",
    descricao: "Contador do Onboarding-Jornada sobre client_deliverables.",
  },
  {
    id: "ale-documentos",
    nome: "Pendências documentais",
    tela: "alertas",
    destino: "/evidencias · /biblioteca-evidencias/$caseId",
    forma: "subrota",
    tipo: "duplicado",
    fonteUnica: "caso-documentos",
    estadoReal: "conectado",
    descricao: "Evidências e documentos por caso, com estado de validação.",
  },
  {
    id: "ale-acoes-vencidas",
    nome: "Próximas ações vencidas",
    tela: "alertas",
    destino: "/tarefas",
    forma: "subrota",
    tipo: "duplicado",
    fonteUnica: "chk-pendencias-resp",
    estadoReal: "conectado",
    descricao: "Tarefas com prazo interno vencido.",
  },
  {
    id: "ale-rascunhos",
    nome: "Rascunhos de comunicação",
    tela: "alertas",
    destino: "Sem rota navegável — lógica em src/lib/fila-comunicacao.ts",
    forma: "painel",
    tipo: "a_confirmar",
    estadoReal: "catalogado, sem superfície implementada",
    descricao: "Fila humana calculada em memória. Envio externo desligado.",
  },
  {
    id: "ale-d10-d14",
    nome: "Alertas D10 / D14",
    tela: "alertas",
    destino: "/ops (Onboarding e jornada)",
    forma: "painel",
    tipo: "duplicado",
    fonteUnica: "chk-d10-d14",
    estadoReal: "conectado",
    descricao: "avaliarCadencia: 10+ dias sem touchpoint e 14+ dias sem atualização.",
  },
  {
    id: "ale-fila-revisao",
    nome: "Fila de revisão",
    tela: "alertas",
    destino: "/matriz-juridica · Painel Hoje (fila de revisão jurídica)",
    forma: "painel",
    tipo: "duplicado",
    fonteUnica: "jur-revisao",
    estadoReal: "conectado",
    descricao: "Itens jurídicos aguardando revisão humana.",
  },

  // ---------------- VISÃO GERAL ----------------
  {
    id: "ov-receita",
    nome: "Receita",
    tela: "overview",
    destino: "Card → /financeiro",
    forma: "painel",
    tipo: "metrica",
    descricao: "Indicador de receita. O card abre a subrota, não uma nova aba.",
  },
  {
    id: "ov-conversao",
    nome: "Conversão e funil",
    tela: "overview",
    destino: "Card → /conversao",
    forma: "painel",
    tipo: "metrica",
    descricao: "Funil e conversão. O card abre a subrota.",
  },
  {
    id: "ov-indicadores",
    nome: "Indicadores operacionais",
    tela: "overview",
    destino: "Card → /painel · /ops",
    forma: "painel",
    tipo: "metrica",
    descricao: "Indicadores do dia com destino contextual.",
  },

  // ---------------- ASSISTENTE ----------------
  {
    id: "ai-assistente",
    nome: "Assistente AI contextual",
    tela: "assistente",
    destino: "Painel lateral global",
    forma: "lateral",
    tipo: "operacional",
    descricao:
      "Botão lateral em todas as telas, com contexto da rota/caso aberto. Não é aba principal.",
  },
];

export function modulosDaTela(tela: TelaDesk): ModuloDesk[] {
  return MODULOS_DESK.filter((m) => m.tela === tela);
}

export function contarPorTela(): Record<TelaDesk, number> {
  const base = {} as Record<TelaDesk, number>;
  (Object.keys(TELA_DESK_LABEL) as TelaDesk[]).forEach((t) => (base[t] = 0));
  MODULOS_DESK.forEach((m) => (base[m.tela] += 1));
  return base;
}

/** Nenhum módulo profundo pode virar aba principal nova. */
export function moduloEhAbaPrincipal(id: string): boolean {
  const m = MODULOS_DESK.find((x) => x.id === id);
  if (!m) return false;
  return m.forma === "subrota" ||
    m.forma === "painel" ||
    m.forma === "aba_interna" ||
    m.forma === "lateral"
    ? false
    : true;
}

/** Verifica se, a partir de Casos 360, é possível alcançar um domínio. */
export function casos360Alcanca(
  dominio: "pesquisa" | "proposta" | "formalizacao" | "onboarding" | "go_live",
): boolean {
  const mapa: Record<string, string> = {
    pesquisa: "caso-pesquisa",
    proposta: "caso-proposta-blueprint",
    formalizacao: "caso-formalizacao",
    onboarding: "caso-onboarding",
    go_live: "caso-go-live",
  };
  return modulosDaTela("casos").some((m) => m.id === mapa[dominio]);
}

/** Verifica se, a partir do CRM Vivo, é possível alcançar um domínio comercial. */
export function crmVivoAlcanca(dominio: "leads" | "propostas" | "clientes"): boolean {
  const mapa: Record<string, string> = {
    leads: "crm-leads",
    propostas: "crm-propostas",
    clientes: "crm-clientes-nucleos",
  };
  return modulosDaTela("crm").some((m) => m.id === mapa[dominio]);
}

/**
 * Bibliotecas que vivem dentro dos módulos contextuais, classificadas pelo que
 * elas fazem — não pelo que se espera delas.
 *
 * 26/08/2026 — princípio da Proprietária: "muitas bibliotecas que são e podem
 * ser chamadas por motores, outras são descritivas… muita info significa
 * nenhuma info".
 *
 * A classificação é lida do próprio catálogo, não escrita à mão:
 *  - `motor`      — `tipo: "operacional"`: há caminho que a consome para agir;
 *  - `referência` — `tipo: "a_confirmar"`: catalogada, sem consumo confirmado;
 *  - `duplicada`  — `tipo: "duplicado"`: tem fonte única em outro lugar.
 *
 * Uma biblioteca `a_confirmar` não é defeito: é honestidade sobre o que ainda
 * não foi ligado. O defeito seria ela aparecer no menu igual a uma que funciona.
 */
export type NaturezaModuloBiblioteca = "motor" | "referência" | "duplicada";

export function naturezaDoModulo(tipo: ModuloDesk["tipo"]): NaturezaModuloBiblioteca | null {
  if (tipo === "operacional") return "motor";
  if (tipo === "a_confirmar") return "referência";
  if (tipo === "duplicado") return "duplicada";
  return null;
}

/** As bibliotecas catalogadas dentro dos módulos contextuais. */
export function bibliotecasContextuais(): {
  id: string;
  nome: string;
  natureza: NaturezaModuloBiblioteca;
  fonteUnica?: string;
  estadoReal?: string;
}[] {
  return MODULOS_DESK.filter((m) => m.tela === "biblio")
    .map((m) => {
      const natureza = naturezaDoModulo(m.tipo);
      return natureza
        ? { id: m.id, nome: m.nome, natureza, fonteUnica: m.fonteUnica, estadoReal: m.estadoReal }
        : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

/** Contagem por natureza — o número que torna "muitas bibliotecas" verificável. */
export function resumoBibliotecasContextuais(): Record<NaturezaModuloBiblioteca, number> {
  const r: Record<NaturezaModuloBiblioteca, number> = { motor: 0, referência: 0, duplicada: 0 };
  for (const b of bibliotecasContextuais()) r[b.natureza] += 1;
  return r;
}

/** Verifica se, a partir da Biblioteca Mestre, é possível alcançar um domínio. */
export function bibliotecaAlcanca(
  dominio: "fontes" | "catalogo" | "glossario" | "modelos",
): boolean {
  const mapa: Record<string, string> = {
    fontes: "bib-fontes",
    catalogo: "bib-produto-top30",
    glossario: "bib-dicionarios",
    modelos: "bib-modelos",
  };
  return modulosDaTela("biblio").some((m) => m.id === mapa[dominio]);
}

/** Resumo por tela: quantos operacionais, métricas, duplicados e a confirmar. */
export function resumoPorTela(): Record<TelaDesk, Record<TipoModuloDesk, number>> {
  const base = {} as Record<TelaDesk, Record<TipoModuloDesk, number>>;
  (Object.keys(TELA_DESK_LABEL) as TelaDesk[]).forEach((t) => {
    base[t] = { operacional: 0, metrica: 0, duplicado: 0, a_confirmar: 0 };
  });
  MODULOS_DESK.forEach((m) => (base[m.tela][m.tipo] += 1));
  return base;
}

export function contarPorTipo(): Record<TipoModuloDesk, number> {
  const base: Record<TipoModuloDesk, number> = {
    operacional: 0,
    metrica: 0,
    duplicado: 0,
    a_confirmar: 0,
  };
  MODULOS_DESK.forEach((m) => (base[m.tipo] += 1));
  return base;
}

/** Módulo de origem (fonte única) de um módulo classificado como duplicado. */
export function fonteUnicaDe(id: string): ModuloDesk | undefined {
  const m = MODULOS_DESK.find((x) => x.id === id);
  if (!m?.fonteUnica) return undefined;
  return MODULOS_DESK.find((x) => x.id === m.fonteUnica);
}
