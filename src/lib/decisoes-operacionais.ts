/**
 * DECISÕES OPERACIONAIS APROVADAS — CLUBE ANCESTRAL
 *
 * Registro somente leitura das decisões que governam o motor contratual, a
 * estrutura familiar do caso canônico e a arquitetura de superfícies (CA-04).
 * Nenhuma decisão aqui executa fusão, exclusão, migração, cobrança, assinatura,
 * portal ou pesquisa externa: este módulo é texto normativo + critérios de
 * aceite usados pelas telas internas e pelos testes.
 */

export type StatusDecisao = "aprovada — implementação controlada" | "aprovada — correção de motor" | "aprovada — arquitetura";

export type Decisao = {
  codigo: string;
  titulo: string;
  versao: string;
  data: string;
  status: StatusDecisao;
  escopo: string;
  decisao: string;
  itens: { rotulo: string; valor: string }[];
  justificativa?: string;
  limites: string[];
  criteriosAceite: string[];
};

export const CASO_CANONICO = "CA-CID-AT-FAM-2026-001";

/** CA-DEC-2026-08-17-01 — estrutura familiar, CRM e contrato */
export const ESTRUTURA_FAMILIAR = {
  caso: CASO_CANONICO,
  nucleo: "Núcleo compartilhado da família Silveira / Friedmann-Reimer",
  crm: ["Ana Luiza", "Adair", "Alice"],
  signatarios: ["Ana Luiza", "Adair", "Alice"],
  dependentes: [
    {
      nome: "Felipe",
      vinculo: "Dependente/beneficiário menor vinculado ao Processo A de Ana Luiza",
      regra: "Não é cliente autônomo nem signatário; não recebe cadastro de contratante.",
    },
  ],
  contrato: "Um contrato-base familiar (MODELO-ESTUDO + BASE-GEN-V2)",
  anexosEstruturais: ["ANX-ESCOPO", "ANX-PRIVACIDADE", "ANX-COMERCIAL"],
  anexosIndividuais: [
    { instancia: "ANX-INDIVIDUAL — Ana Luiza + Felipe", motivo: "Titular adulta com dependente menor vinculado ao Processo A." },
    { instancia: "ANX-INDIVIDUAL — Adair", motivo: "Adulto contratante/signatário com processo individual." },
    { instancia: "ANX-INDIVIDUAL — Alice", motivo: "Adulta contratante/signatária com processo individual." },
  ],
  anexoCondicional: {
    codigo: "ANX-REPRESENTACAO",
    regra: "Só é gerado se dados/documentos do Felipe exigirem representação legal formal.",
  },
  dossie: "Um dossiê-mãe compartilhado, com vínculos individuais de requerente/processo",
  financeiro:
    "Uma condição comercial familiar, operacionalizada somente conforme proposta aprovada, contrato assinado e gates financeiros",
  portal: "Acesso individual e restrito; nunca expõe estrutura familiar bruta nem dados internos",
} as const;

/** CA-DEC-2026-08-17-04 — superfícies canônicas, uma responsabilidade cada */
export const SUPERFICIES_CANONICAS: { superficie: string; responsabilidade: string; naoContem: string }[] = [
  {
    superficie: "Painel de Calls",
    responsabilidade: "Entrada, Discovery, SPIN, consentimento, resultado, próxima ação e handoff.",
    naoContem: "Preço, contrato, pesquisa, documentos, evidências ou portal.",
  },
  {
    superficie: "Brief / Roteiro de Discovery",
    responsabilidade: "Narrativa, lacunas, perguntas, hipótese interna, contexto e preparação da call.",
    naoContem: "CRM estruturado, preço, contrato, evidência validada.",
  },
  {
    superficie: "CRM Mestre",
    responsabilidade: "Leads, oportunidades, proposta, formalização, responsáveis e lifecycle.",
    naoContem: "Dossiê bruto, transcrição, fontes e evidências.",
  },
  {
    superficie: "Desk Intelligence / Caso 360",
    responsabilidade: "Execução: caso, tarefas, pendências, SLA, saúde, financeiro por caso e entregas.",
    naoContem: "Pipeline de leads e árvore/evidência detalhada.",
  },
  {
    superficie: "Dossiê de Pesquisa / Biblioteca",
    responsabilidade: "Pessoas, relações, fontes, evidências, documentos, hipóteses, lacunas e agente de direcionamento.",
    naoContem: "Cards comerciais, SLA agregado, portal ou fonte transacional.",
  },
  {
    superficie: "CA OPS / Painel Mestre",
    responsabilidade: "KPIs agregados: capacidade, conversão, receita/status, riscos e atrasos.",
    naoContem: "Edição de evidência, roteiro de call ou documentos brutos.",
  },
  {
    superficie: "App Cliente",
    responsabilidade: "Jornada, entrega aprovada, documento liberado e próximo passo.",
    naoContem: "Inteligência interna, pesquisa bruta, SLA interno, KPI interno e dados sensíveis.",
  },
];

export const AGENTE_PESQUISA = {
  arquitetura:
    "Um único dossiê/biblioteca operacional por caso; o agente de direcionamento é camada dentro desse dossiê, não uma aba concorrente.",
  recebe: [
    "país e rota",
    "pessoas, geração e datas",
    "documentos e fontes já cadastradas",
    "lacunas e gates",
    "objetivos do caso",
  ],
  pode: [
    "devolver hipóteses rotuladas como hipóteses",
    "indicar documentos prioritários",
    "propor estratégia de busca e fontes potenciais",
    "apontar validações de consistência",
    "sugerir tarefas para o Desk",
    "listar perguntas em aberto",
    "explicitar critérios de elevação/rejeição de evidência",
  ],
  naoPode: [
    "executar pesquisa externa sem gate",
    "pedir documento ou acionar instituição automaticamente",
    "transformar transcrição ou relato em prova",
    "concluir cidadania ou elegibilidade",
    "publicar conteúdo ao cliente",
    "substituir validação humana",
  ],
} as const;

export const MATRIZ_SLA_KPI: { elemento: string; finalidade: string; onde: string }[] = [
  { elemento: "SLA", finalidade: "Prazo, risco e cumprimento por tarefa, pendência e microentrega.", onde: "Desk Intelligence" },
  {
    elemento: "KPI",
    finalidade: "Visão agregada: capacidade, casos, atraso, conversão, receita/status e carga.",
    onde: "CA OPS / Painel Mestre",
  },
  { elemento: "Checklist cliente", finalidade: "Pedidos, documentos e próximos passos autorizados.", onde: "Projeção do Desk/App" },
  { elemento: "Checklist interno", finalidade: "Onboarding, contrato, qualidade e execução.", onde: "Desk" },
  { elemento: "Checklist de pesquisa", finalidade: "Lacunas documentais, validação e plano de fontes.", onde: "Dossiê/Biblioteca" },
];

export const HANDOFF_CA04: string[] = [
  "Lead/oportunidade é criado ou aberto no Painel de Calls.",
  "Call é agendada.",
  "O sistema gera a instância do roteiro/Brief (identificação, origem, objetivo, país/linha, dados já recebidos, histórico, perguntas a evitar e lacuna prioritária) — sem cópia manual do master.",
  "Durante/pós-call, o Painel registra consentimento, SPIN, resultado, responsável e próxima ação.",
  "O Brief preserva narrativa, hipóteses e lacunas.",
  "O CRM recebe somente os campos estruturados.",
  "Desk/dossiê recebem dados apenas após os gates de onboarding, autorização e abertura de caso.",
];

/** CA-DEC-2026-08-17-03 — versionamento de prévia */
export const REGRAS_VERSIONAMENTO_PREVIA: { regra: string; decisao: string }[] = [
  { regra: "Rascunho", decisao: "Um rascunho de trabalho editável por caso + modelo ativo." },
  { regra: "Salvar", decisao: "Atualiza o mesmo rascunho; não cria versão nova." },
  {
    regra: "Snapshot imutável",
    decisao: "Somente em solicitar revisão, retorno para ajuste, aprovação, envio para assinatura e assinatura registrada.",
  },
  { regra: "Identificação", decisao: "Versão, data, autor, motivo, estado e vínculo de parâmetros/anexos." },
  { regra: "Duplicidade", decisao: "Rascunhos iguais são atualização, nunca versões novas." },
  { regra: "Histórico", decisao: "Não apagar versões; arquivar e manter trilha." },
];

export const ESTADOS_PROPOSTA: { estado: string; efeito: string }[] = [
  { estado: "rascunho", efeito: "Editável; não satisfaz gate de contrato." },
  { estado: "em_revisao", efeito: "Editável sob revisão; não satisfaz gate." },
  { estado: "enviada", efeito: "Não é alterada diretamente; ajuste gera rascunho derivado." },
  { estado: "em_negociacao", efeito: "Ativa; ajuste gera rascunho derivado." },
  { estado: "aceita", efeito: "Satisfaz o gate de proposta válida e pode pré-carregar campos comerciais." },
  { estado: "recusada", efeito: "Permanece no histórico; não satisfaz gate." },
  { estado: "substituida", efeito: "Histórico; não satisfaz gate." },
  { estado: "arquivada", efeito: "Sai de Ativas, aparece em Todas/Arquivadas e na busca; não satisfaz gate; recuperável." },
];

export const DECISOES: Decisao[] = [
  {
    codigo: "CA-DEC-2026-08-17-01",
    titulo: "Estrutura familiar, CRM e contrato da Ana",
    versao: "1.0",
    data: "17/08/2026",
    status: "aprovada — implementação controlada",
    escopo: "Ana Luiza, Adair, Alice e Felipe",
    decisao:
      "O projeto da Ana é modelado como um núcleo familiar, um caso familiar, três registros individuais no CRM e um contrato-base familiar.",
    itens: [
      { rotulo: "Caso canônico", valor: CASO_CANONICO },
      { rotulo: "Núcleo familiar", valor: ESTRUTURA_FAMILIAR.nucleo },
      { rotulo: "CRM", valor: "Três registros individuais: Ana Luiza, Adair e Alice" },
      { rotulo: "Felipe", valor: ESTRUTURA_FAMILIAR.dependentes[0].vinculo },
      { rotulo: "Contrato", valor: ESTRUTURA_FAMILIAR.contrato },
      { rotulo: "Signatários", valor: "Ana Luiza, Adair e Alice — adultos contratantes/signatários" },
      { rotulo: "Anexos estruturais", valor: ESTRUTURA_FAMILIAR.anexosEstruturais.join(", ") },
      { rotulo: "Anexos individuais", valor: "Ana + Felipe; Adair; Alice" },
      { rotulo: "Dossiê/pesquisa", valor: ESTRUTURA_FAMILIAR.dossie },
      { rotulo: "Financeiro", valor: ESTRUTURA_FAMILIAR.financeiro },
      { rotulo: "Portal", valor: ESTRUTURA_FAMILIAR.portal },
    ],
    justificativa:
      "A proposta familiar cobre três processos individuais com linha/dossiê compartilhado. A separação de CRM preserva dados, assinatura, acesso e documentação individual; o contrato único preserva escopo e condição familiar sem criar três instrumentos paralelos.",
    limites: [
      "Não criar três cases de cidadania nesta etapa.",
      "Não abrir três contratos independentes.",
      "Não tratar Adair e Alice apenas como beneficiários — ambos são adultos contratantes/signatários.",
      "Não cadastrar Felipe como signatário.",
      "Não preencher dados/documentos de Felipe sem base real e representação legal aplicável.",
      "Não criar cobrança, assinatura externa, portal ou pesquisa externa por esta decisão.",
    ],
    criteriosAceite: [
      "Existe um núcleo familiar vinculado ao caso canônico.",
      "Existem três registros individuais no CRM, sem duplicidade.",
      "Ana, Adair e Alice aparecem como partes/signatários no contrato familiar.",
      "Felipe aparece somente como dependente vinculado à Ana, quando aplicável.",
      "A tela contratual explica a estrutura familiar e os anexos aplicáveis.",
      "Nenhuma entidade DEMO, case_id alternativo ou contrato histórico é usada.",
    ],
  },
  {
    codigo: "CA-DEC-2026-08-17-03",
    titulo: "Motor contratual: versões, anexos, propostas e bloqueios",
    versao: "1.0",
    data: "17/08/2026",
    status: "aprovada — correção de motor",
    escopo: "Motor contratual e tela de preparação do caso de referência",
    decisao:
      "O motor contratual deixa de apenas bloquear e passa a orientar a resolução de pendências. A correção é de produto/aplicação e regras de motor, não de usuário preenchendo versões, anexos ou propostas ocultas.",
    itens: [
      { rotulo: "Bases geráveis", valor: "MODELO-ESTUDO e BASE-GEN-V2, exclusivamente" },
      { rotulo: "Referência histórica inutilizável", valor: "MODELO SIMPLES, Modelo 2024 e folha histórica em branco" },
      { rotulo: "Contrato da Ana", valor: "Contrato-base + anexos estruturais + anexos individuais aplicáveis" },
      {
        rotulo: "Gestão de anexos",
        valor: "Modelo jurídico-base versionado, regra de aplicabilidade e instância por caso — a ficha revisa a instância, nunca edita o modelo-base",
      },
      { rotulo: "Bloqueios", valor: "Acionáveis: título humano, severidade, entidade/campo, regra, origem, responsável, ação e link direto" },
      { rotulo: "Revisão humana", valor: "Indisponível enquanto houver bloqueio impeditivo, com motivo explicado" },
      { rotulo: "Auditoria", valor: "Uma abertura por usuário + caso por sessão/janela de 30 min; eventos consolidados e bloqueios deduplicados" },
    ],
    limites: [
      "Não editar modelo-base jurídico dentro da ficha do caso.",
      "Não apagar versões nem propostas: arquivar preservando trilha.",
      "Proposta arquivada/substituída não satisfaz gate de contrato.",
      "Nenhuma assinatura, cobrança, portal, pesquisa externa ou ação real é disparada pela correção.",
      "Não registrar dados sensíveis completos no texto de auditoria.",
    ],
    criteriosAceite: [
      "Salvar várias vezes não cria múltiplas versões idênticas.",
      "Anexos mostram finalidade, regra de seleção, campos, pendências e impacto.",
      "Proposta arquivada continua localizável e não libera contrato.",
      "Bloqueio abre a seção/campo correspondente.",
      "Solicitar revisão fica indisponível enquanto bloqueios impeditivos existirem.",
      "Nenhuma ação real é disparada pela correção.",
    ],
  },
  {
    codigo: "CA-DEC-2026-08-17-04",
    titulo: "Desk, pesquisa, SLA/KPIs e handoff CA-04",
    versao: "1.0",
    data: "17/08/2026",
    status: "aprovada — arquitetura",
    escopo: "Superfícies internas: Painel de Calls, Brief, CRM, Desk, Dossiê, CA OPS e App Cliente",
    decisao:
      "Resgatar a arquitetura original do CA-04 e reduzir a confusão de abas por responsabilidade. Nenhuma consolidação, exclusão, migração ou fusão de telas/tabelas é executada antes de correção controlada aprovada.",
    itens: SUPERFICIES_CANONICAS.map((s) => ({ rotulo: s.superficie, valor: s.responsabilidade })),
    limites: [
      "Não consolidar, apagar, migrar ou fundir telas/tabelas por esta decisão.",
      "Não manter duas abas concorrentes de pesquisa ativa sem finalidade distinta aprovada.",
      "Não confundir SLA (Desk) com KPI (CA OPS) ou checklist.",
      "Transcrição e narrativa ficam fora do CRM estruturado e do App Cliente.",
      "O agente de direcionamento não executa pesquisa externa, não conclui elegibilidade e não publica ao cliente.",
    ],
    criteriosAceite: [
      "Cada aba/tela tem responsabilidade única explícita.",
      "Não há duas abas concorrentes de pesquisa ativa sem finalidade distinta.",
      "SLA não é confundido com KPI ou checklist.",
      "Roteiro/Brief é instanciado a partir do Painel de Calls sem cópia manual do master.",
      "Transcrição e narrativa ficam fora do CRM estruturado e do App.",
      "Nenhuma fusão/exclusão de módulo é executada por esta decisão.",
    ],
  },
];

export type SituacaoCriterio = "atendido" | "parcial" | "pendente";

export type ConferenciaCriterio = {
  decisao: string;
  criterio: string;
  situacao: SituacaoCriterio;
  evidencia: string;
};

/**
 * Conferência declarada dos critérios de aceite — texto de governança, não
 * consulta ao banco. "pendente" significa correção controlada ainda não
 * aprovada; nenhuma ação é executada a partir daqui.
 */
export const CONFERENCIA: ConferenciaCriterio[] = [
  {
    decisao: "CA-DEC-2026-08-17-01",
    criterio: "Núcleo familiar vinculado ao caso canônico",
    situacao: "atendido",
    evidencia: `Caso ${CASO_CANONICO} com membros vinculados em case_members; nenhum case_id alternativo em uso.`,
  },
  {
    decisao: "CA-DEC-2026-08-17-01",
    criterio: "Três registros individuais no CRM, sem duplicidade",
    situacao: "atendido",
    evidencia: "Ana Luiza, Adair e Alice cadastrados individualmente; Felipe não recebe cadastro de contratante.",
  },
  {
    decisao: "CA-DEC-2026-08-17-01",
    criterio: "Ana, Adair e Alice como partes/signatários",
    situacao: "atendido",
    evidencia: "Três instâncias ANX-INDIVIDUAL e signatários adultos no contrato-base familiar.",
  },
  {
    decisao: "CA-DEC-2026-08-17-01",
    criterio: "Felipe somente como dependente vinculado à Ana",
    situacao: "atendido",
    evidencia: "Dependente escrito como 'Felipe (Ana Luiza)' agrega-se à instância da titular; nunca gera anexo próprio.",
  },
  {
    decisao: "CA-DEC-2026-08-17-01",
    criterio: "A tela contratual explica a estrutura familiar e os anexos aplicáveis",
    situacao: "atendido",
    evidencia: "Painel 'Estrutura familiar' + seção 'Anexos aplicáveis e por quê' na preparação contratual.",
  },
  {
    decisao: "CA-DEC-2026-08-17-03",
    criterio: "Salvar várias vezes não cria múltiplas versões idênticas",
    situacao: "atendido",
    evidencia: "Rascunho único por caso + modelo, com hash de conteúdo; snapshot só em evento de governança.",
  },
  {
    decisao: "CA-DEC-2026-08-17-03",
    criterio: "Proposta arquivada continua localizável e não libera contrato",
    situacao: "atendido",
    evidencia: "Filtros Ativas/Todas/Arquivadas, busca por caso/nome, motivo obrigatório e gate negado.",
  },
  {
    decisao: "CA-DEC-2026-08-17-03",
    criterio: "Bloqueio abre a seção/campo correspondente e trava revisão humana",
    situacao: "atendido",
    evidencia: "Painel de bloqueios resolutivos com link direto; botão de revisão desabilitado com motivo.",
  },
  {
    decisao: "CA-DEC-2026-08-17-04",
    criterio: "Roteiro/Brief instanciado a partir do Painel de Calls sem cópia manual",
    situacao: "pendente",
    evidencia: "Handoff descrito nesta decisão; correção controlada ainda não aprovada — nada foi construído ou fundido.",
  },
  {
    decisao: "CA-DEC-2026-08-17-04",
    criterio: "Não há duas abas concorrentes de pesquisa ativa",
    situacao: "parcial",
    evidencia:
      "Convivem /pesquisa e /pesquisa-modulo. Decisão registra o alvo (dossiê único com o agente como camada) e proíbe fusão/exclusão sem correção aprovada.",
  },
];
