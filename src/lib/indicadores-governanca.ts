/**
 * Registro interno de indicadores do Desk Intelligence.
 * Cada indicador declara matriz de origem, definição, fonte canônica e onde é consumido.
 * Conteúdo estritamente interno: nenhum item deste registro é projetado no App Cliente.
 */

export type Indicador = {
  codigo: string;
  nome: string;
  matriz_origem: string;
  definicao: string;
  fonte_canonica: string;
  consumido_em: string[];
};

export const INDICADORES: Indicador[] = [
  {
    codigo: "IND-COM-01",
    nome: "Leads por origem",
    matriz_origem: "Matriz comercial — entrada e triagem",
    definicao: "Contagem de leads ativos agrupada pela origem declarada, em lista fechada.",
    fonte_canonica: "leads.origem (Desk Intelligence)",
    consumido_em: ["Comercial → Leads", "Comercial → Conversão e marketing"],
  },
  {
    codigo: "IND-COM-02",
    nome: "Conversão por marco",
    matriz_origem: "Matriz comercial — funil canônico",
    definicao: "Proporção de oportunidades que atingiram cada marco do funil, sem projeção de receita.",
    fonte_canonica: "conversion_events",
    consumido_em: ["Comercial → Conversão e marketing"],
  },
  {
    codigo: "IND-JOR-01",
    nome: "Ativados em 48h",
    matriz_origem: "Matriz da jornada de valor — 9 gates",
    definicao: "Casos que concluíram os gates de ativação em até 48h após o pagamento inicial confirmado.",
    fonte_canonica: "crm_casos + case_activation_checks",
    consumido_em: ["Casos → Fechamento", "Visão geral → Painel Hoje"],
  },
  {
    codigo: "IND-JOR-02",
    nome: "Tempo até valor",
    matriz_origem: "Matriz da jornada de valor — 8 fases",
    definicao: "Dias entre a ativação do caso e a primeira micro-entrega publicada ao cliente.",
    fonte_canonica: "client_deliverables (publicadas)",
    consumido_em: ["Casos → Fechamento", "Operação"],
  },
  {
    codigo: "IND-JOR-03",
    nome: "Dias sem touchpoint",
    matriz_origem: "Matriz de cadência D7/D10/D14",
    definicao: "Dias corridos desde a última interação registrada com o cliente do caso.",
    fonte_canonica: "crm_interactions (imutáveis)",
    consumido_em: ["Visão geral → Painel Hoje", "Casos e núcleos"],
  },
  {
    codigo: "IND-PES-01",
    nome: "Maturidade das fontes",
    matriz_origem: "Matriz de avaliação de fontes genealógicas",
    definicao: "Classificação de cada base quanto a documentação, termos de uso e risco declarado.",
    fonte_canonica: "genealogical_sources_catalog + source_evaluation_matrix",
    consumido_em: ["Governança → Bases Genealógicas", "Pesquisa → Fontes e consultas"],
  },
  {
    codigo: "IND-PES-02",
    nome: "Backlog de ativação de fontes",
    matriz_origem: "Matriz de avaliação de fontes genealógicas",
    definicao: "Fontes candidatas aguardando parecer interno; nunca dispara consulta externa automática.",
    fonte_canonica: "sources_activation_backlog",
    consumido_em: ["Governança → Bases Genealógicas"],
  },
  {
    codigo: "IND-QUA-01",
    nome: "Pendências de qualidade",
    matriz_origem: "Matriz de conformidade e critérios de aceite",
    definicao: "Itens de checklist reprovados ou não verificados por caso.",
    fonte_canonica: "quality_issues + case_checklist_items",
    consumido_em: ["Operação → Qualidade", "Casos → Ficha operacional"],
  },
  {
    codigo: "IND-BIB-01",
    nome: "Ativos homologados vigentes",
    matriz_origem: "Matriz de homologação da Biblioteca Mestre",
    definicao: "Itens da Biblioteca Mestre com homologação vigente, por subárea e país.",
    fonte_canonica: "master_library_items",
    consumido_em: ["Governança → Biblioteca Mestre"],
  },
];

/** Nenhum indicador é exposto ao App Cliente. */
export const REGRAS_INDICADORES = [
  "Indicador sem matriz de origem declarada não entra no registro.",
  "Toda métrica aponta a fonte canônica no Desk; planilhas e relatórios externos são cópia, nunca origem.",
  "Nenhum indicador, hipótese, fonte técnica, risco ou preço é projetado no App Cliente.",
  "Alteração de definição de indicador exige registro no Log de decisões, com data e responsável.",
];
