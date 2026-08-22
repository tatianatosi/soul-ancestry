/**
 * ARQUITETURA CONTEXTUAL DE MÓDULOS DO DESK (CA-UX-01.2)
 *
 * Cada módulo profundo reside DENTRO de uma das telas principais aprovadas do
 * Desk, como subrota ou painel contextual. Nenhum módulo profundo pode virar
 * nova aba principal. Este arquivo é a fonte normativa dessa alocação.
 */

/** Telas principais do Desk que recebem módulos contextuais. */
export type TelaDesk =
  | "overview"
  | "crm"
  | "casos"
  | "checklist"
  | "juridica"
  | "biblio"
  | "alertas"
  | "assistente";

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
  /** Descrição operacional curta, sem juízo de mérito sobre o caso. */
  descricao: string;
};

export const MODULOS_DESK: ModuloDesk[] = [
  // ---------------- CRM VIVO ----------------
  { id: "crm-leads", nome: "Leads e triagem", tela: "crm", destino: "/leads", forma: "subrota", descricao: "Fila de leads, discovery e próxima ação por responsável." },
  { id: "crm-propostas", nome: "Propostas", tela: "crm", destino: "/propostas · /casos/$id (aba Comercial)", forma: "subrota", descricao: "Propostas e páginas 1–7 homologadas. Aceite verbal não libera contrato nem App." },
  { id: "crm-clientes-nucleos", nome: "Clientes e núcleos", tela: "crm", destino: "/clientes", forma: "subrota", descricao: "Clientes, núcleos familiares e vínculos com casos." },

  // ---------------- CASOS 360 ----------------
  { id: "caso-visao-geral", nome: "Visão Geral do Caso", tela: "casos", destino: "/casos/$id (aba Visão Geral)", forma: "aba_interna", descricao: "Estado consolidado, marcos e bloqueios do caso." },
  { id: "caso-discovery", nome: "Discovery, brief e interações", tela: "casos", destino: "/casos/$id (aba Caso)", forma: "aba_interna", descricao: "Brief interno, interações registradas e origem do lead." },
  { id: "caso-proposta-blueprint", nome: "Proposta e Blueprint", tela: "casos", destino: "/casos/$id (aba Comercial) · /propostas", forma: "subrota", descricao: "Proposta aprovada, páginas 1–7 e blueprint paramétrico." },
  { id: "caso-produto-trilha", nome: "Produto-pai, trilha e case service", tela: "casos", destino: "/casos/$id (aba Produto/Trilha)", forma: "aba_interna", descricao: "Produto-pai, trilha de cidadania e serviços contratados." },
  { id: "caso-familia", nome: "Família, participantes e dependentes", tela: "casos", destino: "/casos/$id (aba Pessoas)", forma: "aba_interna", descricao: "Núcleo familiar, signatários e dependentes representados." },
  { id: "caso-pesquisa", nome: "Pesquisa genealógica", tela: "casos", destino: "/pesquisa/$id · /pesquisa-modulo/$id", forma: "subrota", descricao: "Hipóteses, eventos e plano de pesquisa do caso." },
  { id: "caso-ficha-piloto", nome: "Ficha piloto genealógica", tela: "casos", destino: "/piloto-ana · /piloto", forma: "subrota", descricao: "Ficha e conferência do caso-piloto." },
  { id: "caso-linhagens", nome: "Pessoas, linhagens, árvore e linha do tempo", tela: "casos", destino: "/casos/$id (aba Visão Geral → linha do tempo)", forma: "painel", descricao: "Pessoas, relações e eventos operacionais do caso." },
  { id: "caso-documentos", nome: "Documentos, fontes e evidências", tela: "casos", destino: "/evidencias · /privacidade/$id", forma: "subrota", descricao: "Documentos, fontes citadas e evidências vinculadas." },
  { id: "caso-achados", nome: "Achados e encontros de linhagem", tela: "casos", destino: "/casos/$id (aba Técnico)", forma: "painel", descricao: "Achados registrados e pontos de convergência de linhagem." },
  { id: "caso-onboarding", nome: "Onboarding", tela: "casos", destino: "/onboarding/$id", forma: "subrota", descricao: "Checks de ativação e liberação do caso." },
  { id: "caso-formalizacao", nome: "Formalização", tela: "casos", destino: "/casos/$id/contrato/preparar", forma: "subrota", descricao: "Preparação contratual, parâmetros e gates." },
  { id: "caso-go-live", nome: "Go-live", tela: "casos", destino: "/casos/$id (aba Fechamento) · /onboarding/$id", forma: "aba_interna", descricao: "Os 9 gates de fechamento e liberação do caso ativo. Nenhuma liberação automática." },
  { id: "caso-dossie", nome: "Dossiê e fila Drive", tela: "casos", destino: "/casos/$id (aba Visão Geral → dossiê)", forma: "painel", descricao: "Estado de preparação do dossiê. Nenhuma pasta é criada aqui." },
  { id: "caso-historico", nome: "Histórico e auditoria do caso", tela: "casos", destino: "/casos/$id (log) · /auditoria", forma: "painel", descricao: "Log granular de alterações do caso." },

  // ---------------- CHECKLIST ----------------
  { id: "chk-proximas-acoes", nome: "Próximas ações", tela: "checklist", destino: "/tarefas", forma: "subrota", descricao: "Próxima ação por caso e por responsável." },
  { id: "chk-plano-pesquisa", nome: "Plano de ação de pesquisa", tela: "checklist", destino: "Checklist semanal → Plano de ação de pesquisa · /plano-acao/$caseId", forma: "aba_interna", descricao: "Oito visões operacionais de ações, instituições, rechecagens e estimativas de terceiros." },
  { id: "chk-rechecagens", nome: "Rechecagens institucionais", tela: "checklist", destino: "/ops (rechecagens)", forma: "painel", descricao: "Rechecagens periódicas de fontes institucionais." },
  { id: "chk-d10-d14", nome: "D10 / D14", tela: "checklist", destino: "/ops (SLA D10/D14)", forma: "painel", descricao: "Marcos de acompanhamento D10 e D14." },
  { id: "chk-pendencias-resp", nome: "Pendências por responsável", tela: "checklist", destino: "/ops (fila por responsável)", forma: "painel", descricao: "Pendências agrupadas por pessoa responsável." },
  { id: "chk-semanal", nome: "Checklist semanal", tela: "checklist", destino: "Checklist semanal (tela principal)", forma: "painel", descricao: "Rotina semanal preservada do mockup aprovado." },
  { id: "chk-formalizacao", nome: "Ações de formalização", tela: "checklist", destino: "/ops-excecoes · /ordens-servico", forma: "subrota", descricao: "Ações operacionais que destravam gates de formalização." },

  // ---------------- VALIDAÇÃO JURÍDICA ----------------
  { id: "jur-matriz", nome: "Matriz jurídica", tela: "juridica", destino: "/matriz-juridica", forma: "subrota", descricao: "12 temas normativos e estado de revisão." },
  { id: "jur-marcos", nome: "Marcos jurídicos", tela: "juridica", destino: "/matriz-juridica (marcos)", forma: "painel", descricao: "Marcos legais aplicáveis por trilha." },
  { id: "jur-trilhas", nome: "Trilhas e regras", tela: "juridica", destino: "/matriz-juridica (trilhas)", forma: "painel", descricao: "Regras por trilha de cidadania." },
  { id: "jur-casos", nome: "Casos impactados", tela: "juridica", destino: "/matriz-juridica (casos)", forma: "painel", descricao: "Casos afetados por cada decisão jurídica." },
  { id: "jur-revisao", nome: "Revisão humana", tela: "juridica", destino: "/matriz-juridica (fila de revisão)", forma: "painel", descricao: "Itens pendentes de revisão jurídica humana." },

  // ---------------- BIBLIOTECA MESTRE ----------------
  { id: "bib-produto-top30", nome: "Produto-pai e Top 30", tela: "biblio", destino: "/biblioteca (catálogo) · product_catalog", forma: "painel", descricao: "Produto-pai e complementos homologados." },
  { id: "bib-fontes", nome: "Catálogo de fontes", tela: "biblio", destino: "/biblioteca (fontes)", forma: "painel", descricao: "Fontes institucionais catalogadas." },
  { id: "bib-5b-pre", nome: "Bloco 5B-Pre", tela: "biblio", destino: "/biblioteca (5B-Pre)", forma: "painel", descricao: "Bloco normativo 5B-Pre." },
  { id: "bib-dicionarios", nome: "Dicionários e glossário", tela: "biblio", destino: "/biblioteca (glossário) · /etiquetas", forma: "subrota", descricao: "Glossário, dicionários e taxonomia canônica." },
  { id: "bib-linguagem", nome: "Guia de linguagem", tela: "biblio", destino: "/biblioteca (linguagem)", forma: "painel", descricao: "Linguagem permitida ao cliente, sem juízo de mérito." },
  { id: "bib-tipos-doc", nome: "Tipos documentais e evidências", tela: "biblio", destino: "/biblioteca (tipos documentais)", forma: "painel", descricao: "Dicionário de tipos de documento e evidência." },
  { id: "bib-modelos", nome: "Modelos F1 / F2", tela: "biblio", destino: "/biblioteca (modelos)", forma: "painel", descricao: "Modelos de relatório Fase 01 e Fase 02." },
  { id: "bib-templates-com", nome: "Templates de comunicação", tela: "biblio", destino: "/biblioteca (templates)", forma: "painel", descricao: "Rascunhos de comunicação. Nenhum envio automático." },
  { id: "bib-curadoria", nome: "Curadoria por caso", tela: "biblio", destino: "/biblioteca (curadoria)", forma: "painel", descricao: "Itens de conhecimento vinculados a cada caso." },
  { id: "bib-versionamento", nome: "Histórico e versionamento", tela: "biblio", destino: "/governanca/decisoes · /governanca/inventario-recuperacao", forma: "subrota", descricao: "Versões, decisões e recuperação de ativos." },

  // ---------------- ALERTAS ----------------
  { id: "ale-achados", nome: "Achados novos", tela: "alertas", destino: "Alertas (achados)", forma: "painel", descricao: "Achados registrados aguardando leitura." },
  { id: "ale-microentregas", nome: "Micro-entregas em revisão", tela: "alertas", destino: "Alertas (micro-entregas)", forma: "painel", descricao: "Micro-entregas aguardando aprovação interna." },
  { id: "ale-documentos", nome: "Pendências documentais", tela: "alertas", destino: "Alertas (documentos)", forma: "painel", descricao: "Documentos pendentes por caso." },
  { id: "ale-acoes-vencidas", nome: "Próximas ações vencidas", tela: "alertas", destino: "Alertas (SLA)", forma: "painel", descricao: "Ações com prazo interno vencido." },
  { id: "ale-rascunhos", nome: "Rascunhos de comunicação", tela: "alertas", destino: "Alertas (comunicação)", forma: "painel", descricao: "Fila de comunicação em rascunho, sem envio." },
  { id: "ale-d10-d14", nome: "Alertas D10 / D14", tela: "alertas", destino: "Alertas (D10/D14)", forma: "painel", descricao: "Marcos D10 e D14 próximos ou vencidos." },
  { id: "ale-fila-revisao", nome: "Fila de revisão", tela: "alertas", destino: "Alertas (fila de revisão)", forma: "painel", descricao: "Itens aguardando revisão humana." },

  // ---------------- VISÃO GERAL ----------------
  { id: "ov-receita", nome: "Receita", tela: "overview", destino: "Card → /financeiro", forma: "painel", descricao: "Indicador de receita. O card abre a subrota, não uma nova aba." },
  { id: "ov-conversao", nome: "Conversão e funil", tela: "overview", destino: "Card → /conversao", forma: "painel", descricao: "Funil e conversão. O card abre a subrota." },
  { id: "ov-indicadores", nome: "Indicadores operacionais", tela: "overview", destino: "Card → /painel · /ops", forma: "painel", descricao: "Indicadores do dia com destino contextual." },

  // ---------------- ASSISTENTE ----------------
  { id: "ai-assistente", nome: "Assistente AI contextual", tela: "assistente", destino: "Painel lateral global", forma: "lateral", descricao: "Botão lateral em todas as telas, com contexto da rota/caso aberto. Não é aba principal." },
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
  return m.forma === "subrota" || m.forma === "painel" || m.forma === "aba_interna" || m.forma === "lateral"
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

/** Verifica se, a partir da Biblioteca Mestre, é possível alcançar um domínio. */
export function bibliotecaAlcanca(dominio: "fontes" | "catalogo" | "glossario" | "modelos"): boolean {
  const mapa: Record<string, string> = {
    fontes: "bib-fontes",
    catalogo: "bib-produto-top30",
    glossario: "bib-dicionarios",
    modelos: "bib-modelos",
  };
  return modulosDaTela("biblio").some((m) => m.id === mapa[dominio]);
}
