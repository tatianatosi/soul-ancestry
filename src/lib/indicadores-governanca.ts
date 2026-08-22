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

export type DetalheIndicador = {
  /** Fórmula explícita de cálculo, em linguagem verificável. */
  formula: string;
  /** Janela de apuração declarada. */
  periodo: string;
  /** Estado atual da apuração no Desk. */
  status: "apurado" | "sem_dados" | "parcial";
  /** Condição objetiva que produz “Sem dados suficientes”. */
  condicao_sem_dados: string;
};

export const ROTULO_STATUS_INDICADOR: Record<DetalheIndicador["status"], string> = {
  apurado: "Apurado",
  parcial: "Parcial",
  sem_dados: "Sem dados suficientes",
};

/** Fórmula, período e status de apuração declarados por indicador. */
export const DETALHE_INDICADOR: Record<string, DetalheIndicador> = {
  "IND-COM-01": {
    formula: "contagem(leads ativos) agrupada por leads.origem",
    periodo: "Estado atual (sem janela)",
    status: "parcial",
    condicao_sem_dados: "Leads sem origem declarada ficam fora do agrupamento e aparecem como sinal de higiene.",
  },
  "IND-COM-02": {
    formula: "entidades na etapa ÷ entidades na etapa anterior",
    periodo: "Acumulado dos eventos registrados",
    status: "sem_dados",
    condicao_sem_dados: "Sem denominador na etapa anterior a taxa exibe “—”, nunca zero.",
  },
  "IND-JOR-01": {
    formula: "casos com 9 gates concluídos ≤ 48h após pagamento inicial ÷ casos pagos",
    periodo: "Mês corrente",
    status: "sem_dados",
    condicao_sem_dados: "Nenhum pagamento inicial confirmado no período.",
  },
  "IND-JOR-02": {
    formula: "data da 1ª micro-entrega publicada − data de ativação (dias)",
    periodo: "Por caso ativado",
    status: "sem_dados",
    condicao_sem_dados: "Caso sem ativação ou sem micro-entrega publicada.",
  },
  "IND-JOR-03": {
    formula: "hoje − data da última interação registrada (dias corridos)",
    periodo: "Estado atual por caso",
    status: "apurado",
    condicao_sem_dados: "Caso sem nenhuma interação registrada é listado como “sem contato registrado”.",
  },
  "IND-PES-01": {
    formula: "classificação declarada por fonte na matriz de avaliação",
    periodo: "Estado atual do catálogo",
    status: "parcial",
    condicao_sem_dados: "Fonte sem parecer interno permanece como candidata, não classificada.",
  },
  "IND-PES-02": {
    formula: "contagem(fontes candidatas sem parecer)",
    periodo: "Estado atual",
    status: "apurado",
    condicao_sem_dados: "Não se aplica: contagem direta de backlog.",
  },
  "IND-QUA-01": {
    formula: "contagem(itens de checklist reprovados ou não verificados) por caso",
    periodo: "Estado atual por caso",
    status: "apurado",
    condicao_sem_dados: "Caso sem checklist aplicado exibe “checklist não iniciado”.",
  },
  "IND-BIB-01": {
    formula: "contagem(itens com vigencia_estado = vigente) por subárea e país",
    periodo: "Estado atual",
    status: "apurado",
    condicao_sem_dados: "Subárea sem item homologado exibe ausência explícita.",
  },
  "IND-RAD-01": {
    formula: "faixa qualitativa da matriz-radar-v1.0 sobre 12 fatores da ficha",
    periodo: "Estado atual do lead",
    status: "parcial",
    condicao_sem_dados: "Sem objetivo, país/linha e estrutura ou estado documental a leitura é Inconclusiva.",
  },
  "IND-RAD-02": {
    formula: "fatores preenchidos ÷ 12 fatores da matriz",
    periodo: "Estado atual do lead",
    status: "apurado",
    condicao_sem_dados: "Não se aplica: mede preenchimento, não mérito.",
  },
  "IND-MKT-01": {
    formula: "investimento de mídia classificado ÷ leads atribuíveis",
    periodo: "Mês corrente",
    status: "sem_dados",
    condicao_sem_dados: "Sem investimento classificado ou sem atribuição de leads.",
  },
  "IND-MKT-02": {
    formula: "investimento de mídia ÷ pagamentos iniciais confirmados atribuíveis",
    periodo: "Mês corrente",
    status: "sem_dados",
    condicao_sem_dados: "Sem investimento classificado ou sem pagamento atribuível confirmado.",
  },
  "IND-MKT-03": {
    formula: "(receita recebida atribuível − investimento) ÷ investimento",
    periodo: "Mês corrente",
    status: "sem_dados",
    condicao_sem_dados: "Sem investimento classificado ou sem receita recebida atribuível.",
  },
  "IND-FIN-01": {
    formula: "receita recebida − despesas operacionais do Clube − investimento de mídia",
    periodo: "Mês corrente",
    status: "parcial",
    condicao_sem_dados: "Receita recebida não apurada no período.",
  },
  "IND-FIN-02": {
    formula: "soma(contratos assinados) − soma(recebimentos confirmados)",
    periodo: "Estado atual da carteira",
    status: "apurado",
    condicao_sem_dados: "Sem contrato assinado registrado.",
  },
  "IND-COM-03": {
    formula: "contagem(sugestões em rascunho) por gatilho e prioridade",
    periodo: "Estado atual da fila",
    status: "apurado",
    condicao_sem_dados: "Fila vazia é exibida como fila vazia, nunca como zero de desempenho.",
  },
};

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


/**
 * Manifestação operacional de cada indicador: onde ele aparece, em que componente,
 * qual condição o torna sinal e qual rota abre a ação. Nenhum item dispara envio,
 * cobrança ou pesquisa externa: a coluna “Ação/rota” apenas navega.
 */
export type TipoUsoIndicador = "kpi" | "sinal_diario" | "bloqueio" | "qualidade" | "contexto";

export const ROTULO_TIPO_USO: Record<TipoUsoIndicador, string> = {
  kpi: "KPI",
  sinal_diario: "Sinal diário",
  bloqueio: "Bloqueio operacional",
  qualidade: "Qualidade de dados",
  contexto: "Contexto",
};

export type ManifestacaoIndicador = {
  tipos: TipoUsoIndicador[];
  /** Telas de consumo, na ordem de prioridade operacional. */
  telas: string[];
  /** Componente concreto onde o número aparece. */
  componente: string;
  /** Condição objetiva que transforma o indicador em sinal acionável. */
  gatilho: string;
  /** Rótulo da ação e rota aberta ao clicar. */
  acao: string;
  rota: string;
};

export const MANIFESTACAO_INDICADOR: Record<string, ManifestacaoIndicador> = {
  "IND-COM-01": {
    tipos: ["kpi", "qualidade"],
    telas: ["/conversao", "/governanca/indicadores"],
    componente: "Card de origem no funil + fila de higiene em Painel Hoje",
    gatilho: "Lead ativo com origem “Não classificada”.",
    acao: "Abrir leads sem origem declarada",
    rota: "/leads",
  },
  "IND-COM-02": {
    tipos: ["kpi", "sinal_diario"],
    telas: ["/conversao", "/painel"],
    componente: "Tabela do funil + callout “Gargalo principal”",
    gatilho: "Etapa com queda relevante em relação à etapa anterior.",
    acao: "Abrir a lista de entidades daquele marco",
    rota: "/conversao",
  },
  "IND-JOR-01": {
    tipos: ["kpi", "bloqueio"],
    telas: ["/casos", "/painel"],
    componente: "Card de risco de onboarding + fila de casos",
    gatilho:
      "Pagamento inicial confirmado e pré-requisitos de formalização satisfeitos, sem ativação concluída em 48h. Sem pagamento confirmado o caso não entra na contagem.",
    acao: "Abrir casos pagos aguardando ativação",
    rota: "/casos",
  },
  "IND-JOR-02": {
    tipos: ["kpi", "contexto"],
    telas: ["/casos", "/operacao"],
    componente: "Detalhe de ficha do caso + fila de cadência",
    gatilho:
      "Caso ativado sem primeira micro-entrega publicada e aprovada no prazo configurado. Rascunho não conta como entrega.",
    acao: "Abrir casos ativados sem primeira entrega",
    rota: "/casos",
  },
  "IND-JOR-03": {
    tipos: ["sinal_diario"],
    telas: ["/painel", "/casos"],
    componente: "Fila “Casos e cadência” no Painel Hoje",
    gatilho: "Caso sem touchpoint registrado após D7/D10/D14 configurado.",
    acao: "Abrir casos sem contato no prazo",
    rota: "/casos",
  },
  "IND-PES-01": {
    tipos: ["contexto"],
    telas: ["/pesquisa", "/biblioteca"],
    componente: "Badge de maturidade na fonte + filtro do catálogo",
    gatilho: "Fonte suspensa, a revisar ou sem a maturidade exigida pelo uso pretendido.",
    acao: "Abrir o catálogo de fontes",
    rota: "/biblioteca",
  },
  "IND-PES-02": {
    tipos: ["contexto"],
    telas: ["/biblioteca"],
    componente: "Lista de backlog de ativação de fontes",
    gatilho: "Não sobe ao Painel Hoje: serve ao planejamento de bases, não à fila do dia.",
    acao: "Abrir backlog de fontes candidatas",
    rota: "/biblioteca",
  },
  "IND-QUA-01": {
    tipos: ["bloqueio", "qualidade"],
    telas: ["/casos", "/qualidade", "/painel"],
    componente: "Badge de bloqueio na ficha + fila de qualidade",
    gatilho: "Item de checklist reprovado ou pendência sem responsável definido.",
    acao: "Abrir pendências de qualidade",
    rota: "/qualidade",
  },
  "IND-BIB-01": {
    tipos: ["bloqueio", "contexto"],
    telas: ["/biblioteca", "/propostas", "/contratos"],
    componente: "Badge de vigência no item + bloqueio na criação de proposta e contrato",
    gatilho: "Item obrigatório sem vigência ativa bloqueia novo uso em proposta ou contrato.",
    acao: "Abrir Biblioteca Mestre por vigência",
    rota: "/biblioteca",
  },
  "IND-RAD-01": {
    tipos: ["sinal_diario", "contexto"],
    telas: ["/leads", "/casos", "/painel"],
    componente: "Bloco do Radar na ficha do lead + fila de triagem",
    gatilho: "Leitura inconclusiva sem próximo passo, revisão humana obrigatória ou via restrita.",
    acao: "Abrir leads com leitura pendente de revisão",
    rota: "/leads",
  },
  "IND-RAD-02": {
    tipos: ["qualidade"],
    telas: ["/leads", "/painel"],
    componente: "Faixa de completude na ficha do lead",
    gatilho: "Completude abaixo do mínimo em call realizada ou Discovery concluída.",
    acao: "Abrir Discovery com leitura incompleta",
    rota: "/leads",
  },
  "IND-MKT-01": {
    tipos: ["kpi", "qualidade"],
    telas: ["/financeiro", "/conversao", "/governanca/indicadores"],
    componente: "Card de eficiência de mídia no mesmo recorte de período do caixa",
    gatilho: "“Sem dados suficientes” indica origens ou custos sem classificação.",
    acao: "Abrir custos e origens sem classificação",
    rota: "/financeiro",
  },
  "IND-MKT-02": {
    tipos: ["kpi"],
    telas: ["/financeiro", "/governanca/indicadores"],
    componente: "Card de aquisição no bloco de eficiência de mídia",
    gatilho: "Só calcula com pagamento confirmado e atribuição válida; caso contrário sinaliza lacuna.",
    acao: "Abrir pagamentos confirmados e atribuição",
    rota: "/financeiro",
  },
  "IND-MKT-03": {
    tipos: ["kpi"],
    telas: ["/financeiro", "/governanca/indicadores"],
    componente: "Card de retorno no bloco de eficiência de mídia",
    gatilho: "Sem atribuição não há ROI/ROAS: é lacuna de dado, nunca falha comercial.",
    acao: "Abrir receita recebida atribuível",
    rota: "/financeiro",
  },
  "IND-FIN-01": {
    tipos: ["kpi", "sinal_diario"],
    telas: ["/financeiro", "/painel"],
    componente: "Card “Resultado de caixa do período”",
    gatilho: "Resultado de caixa negativo ou dados financeiros pendentes de apuração.",
    acao: "Abrir o caixa realizado do período",
    rota: "/financeiro",
  },
  "IND-FIN-02": {
    tipos: ["contexto"],
    telas: ["/financeiro", "/casos"],
    componente: "Linha de previsão no bloco “Em aberto e previsão”",
    gatilho: "Contrato assinado sem recebimento entra como acompanhamento; nunca entra em caixa.",
    acao: "Abrir previsão contratada não recebida",
    rota: "/financeiro",
  },
  "IND-COM-03": {
    tipos: ["sinal_diario"],
    telas: ["/painel", "/atendimento"],
    componente: "Fila “Comunicação humana” no Painel Hoje, sem botão de disparo",
    gatilho: "Sugestões de contato em rascunho, ordenadas por prioridade e motivo declarado.",
    acao: "Abrir a fila humana em Atendimento",
    rota: "/atendimento",
  },
};
