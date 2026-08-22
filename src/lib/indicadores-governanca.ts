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
  {
    codigo: "IND-RAD-01",
    nome: "Sinal preliminar de elegibilidade",
    matriz_origem: "Matriz do Radar de Elegibilidade (matriz-radar-v1.0)",
    definicao:
      "Faixa qualitativa (Forte, Provável, Possível com pesquisa, Baixa, Inconclusiva, Sem aderência) derivada de 12 fatores da ficha. Não é parecer jurídico nem probabilidade de êxito.",
    fonte_canonica: "leads (ficha de Discovery) + citizenship_tracks",
    consumido_em: ["Comercial → Leads"],
  },
  {
    codigo: "IND-RAD-02",
    nome: "Completude da leitura preliminar",
    matriz_origem: "Matriz do Radar de Elegibilidade",
    definicao: "Percentual de fatores da matriz efetivamente registrados no lead; mede preenchimento, não mérito.",
    fonte_canonica: "leads (ficha de Discovery)",
    consumido_em: ["Comercial → Leads"],
  },
  {
    codigo: "IND-MKT-01",
    nome: "CPL — custo por lead",
    matriz_origem: "Matriz de marketing e atribuição",
    definicao:
      "Investimento de mídia classificado dividido por leads atribuíveis no período. Sem custo classificado ou sem atribuição, retorna “Sem dados suficientes”.",
    fonte_canonica: "marketing_investments + attribution_records",
    consumido_em: ["Financeiro", "Comercial → Conversão e marketing"],
  },
  {
    codigo: "IND-MKT-02",
    nome: "CAC — custo de aquisição",
    matriz_origem: "Matriz de marketing e atribuição",
    definicao: "Investimento de mídia dividido por pagamentos iniciais confirmados atribuíveis; nunca usa proposta ou aceite verbal.",
    fonte_canonica: "marketing_investments + payments (confirmados)",
    consumido_em: ["Financeiro"],
  },
  {
    codigo: "IND-MKT-03",
    nome: "ROI/ROAS de mídia",
    matriz_origem: "Matriz de marketing e atribuição",
    definicao: "Relação entre receita recebida atribuível e investimento de mídia. Receita contratada não entra no cálculo.",
    fonte_canonica: "payments (recebidos) + marketing_investments",
    consumido_em: ["Financeiro"],
  },
  {
    codigo: "IND-FIN-01",
    nome: "Resultado de caixa do período",
    matriz_origem: "Matriz financeira real",
    definicao:
      "Receita recebida menos despesas operacionais do Clube e investimento de mídia. Despesa paga diretamente pelo cliente ao terceiro é contexto, nunca custo.",
    fonte_canonica: "payments + invoices + third_party_expenses",
    consumido_em: ["Financeiro"],
  },
  {
    codigo: "IND-FIN-02",
    nome: "Previsão contratada não recebida",
    matriz_origem: "Matriz financeira real",
    definicao: "Valor de contratos assinados ainda sem recebimento; exibido como previsão e jamais somado ao caixa.",
    fonte_canonica: "invoices + contracts",
    consumido_em: ["Financeiro"],
  },
  {
    codigo: "IND-COM-03",
    nome: "Fila humana de comunicação",
    matriz_origem: "Matriz de comunicação assistida",
    definicao:
      "Sugestões de contato em rascunho, por gatilho e prioridade, com motivo declarado. Nenhum envio é automático; aprovação e envio são humanos.",
    fonte_canonica: "communication_queue",
    consumido_em: ["Atendimento", "Visão geral → Painel Hoje"],
  },
];

/** Nenhum indicador é exposto ao App Cliente. */
export const REGRAS_INDICADORES = [
  "Indicador sem matriz de origem declarada não entra no registro.",
  "Toda métrica aponta a fonte canônica no Desk; planilhas e relatórios externos são cópia, nunca origem.",
  "Nenhum indicador, hipótese, fonte técnica, risco ou preço é projetado no App Cliente.",
  "Alteração de definição de indicador exige registro no Log de decisões, com data e responsável.",
  "Indicador sem base declarada exibe “Sem dados suficientes”; nunca zero, nunca estimativa.",
  "Demonstrações (is_demo) ficam fora de qualquer indicador real, salvo alternância explícita na tela.",
  "Nenhum indicador dispara ação, cobrança, comunicação ou pesquisa externa automática.",
];

