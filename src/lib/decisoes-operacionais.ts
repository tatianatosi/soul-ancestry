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

/* ------------------------------------------------------------------ *
 * CA-DEC-2026-08-19-01 — Arquitetura e decisões vigentes
 * Texto normativo somente leitura. Não executa fusão, migração,
 * cobrança, assinatura, portal, comunicação ou pesquisa externa.
 * ------------------------------------------------------------------ */

/** Cadeia operacional canônica, do Painel de Calls à projeção no App Cliente. */
export const CADEIA_OPERACIONAL: { etapa: string; detalhe: string }[] = [
  { etapa: "Painel de Calls", detalhe: "Origem do lead/oportunidade, agenda, consentimento e resultado da call." },
  { etapa: "Brief/Roteiro de Discovery", detalhe: "Narrativa, hipóteses e lacunas — fora do CRM estruturado e do App." },
  { etapa: "CRM Mestre / Oportunidade", detalhe: "Somente campos estruturados da oportunidade." },
  { etapa: "Proposta Canva / OS aprovada", detalhe: "Escopo, entregas, prazos e condição do caso (páginas 1–7)." },
  { etapa: "Motor Contratual / MODELO-ESTUDO", detalhe: "Texto institucional versionado + parâmetros do caso; um rascunho editável." },
  { etapa: "Assinatura externa, quando aplicável", detalhe: "Registro humano da assinatura; nunca disparo automático." },
  { etapa: "Financeiro / Asaas", detalhe: "Somente condição homologada; estado muda após confirmação da fonte transacional." },
  { etapa: "Onboarding e acesso sem senha autorizado", detalhe: "Link mágico/OTP de uso único, curto, revogável e vinculado a caso e RLS." },
  { etapa: "Caso / Desk Intelligence", detalhe: "Cockpit operacional soberano, com a Memória de Bases Genealógicas como módulo nativo." },
  { etapa: "Pesquisa, Biblioteca, documentos e entregas", detalhe: "Dossiê e evidências sob RLS, com gates de pesquisa externa." },
  { etapa: "Projeção autorizada no App Cliente", detalhe: "Painel, Jornada, Documentos, Origem/Radar, Árvore, Descobertas, Biblioteca e Conta." },
];

/** Fonte canônica por tema — e o que nunca vale como fonte final. */
export const FONTES_DE_VERDADE: { tema: string; canonica: string; nuncaFinal: string }[] = [
  {
    tema: "Escopo, entregas, prazos e condição do caso",
    canonica: "Proposta/OS master aprovada, páginas 1–7",
    nuncaFinal: "CRM, transcrição, WhatsApp, campo livre ou mockup",
  },
  {
    tema: "Texto institucional do contrato",
    canonica: "Modelo jurídico institucional versionado e aprovado",
    nuncaFinal: "Texto copiado em caso individual ou proposta antiga",
  },
  {
    tema: "Preço, SKU, condição e cobrança",
    canonica: "Fonte financeira homologada (catálogo/planilha mestre) e Asaas reconciliado",
    nuncaFinal: "Mockup, proposta antiga, dado DEMO ou valor inferido",
  },
  {
    tema: "Caso, documentos, evidência e pesquisa",
    canonica: "Desk / Dossiê / Biblioteca com RLS",
    nuncaFinal: "App Cliente, resposta de IA ou narrativa não confirmada",
  },
  {
    tema: "Algoritmos, prompts e fontes por país",
    canonica: "Memória de Bases Genealógicas no Desk, corpus aprovado e versionado",
    nuncaFinal: "Gem/app separado, resposta sem citação ou fonte externa não homologada",
  },
  {
    tema: "Portal / App Cliente",
    canonica: "Projeções client-facing autorizadas por caso",
    nuncaFinal: "Tabelas internas, CRM, Desk, fontes, logs ou dados de outros casos",
  },
];

/**
 * Perfil institucional versionado do contrato-base. Dados pessoais da
 * responsável (CPF, RG, nascimento, e-mail/contato pessoal) nunca entram em
 * contrato padrão, prévia, log ou App.
 */
export const PERFIL_INSTITUCIONAL = {
  contratoBase: "Contrato de Serviços de Pesquisa Genealógica — Clube Ancestral",
  subtitulo: "Contrato-Base de Prestação de Serviços Genealógicos e Jornada Documental",
  razaoEmpresarial: "TATIANA MELANI TOSI – ME",
  nomeOperacao: "Clube Ancestral",
  cnpj: "10.448.812/0001-58",
  endereco: "Rua Nova York, 822, Apt. 142, Brooklin, CEP 04560-001, São Paulo–SP, Brasil",
  email: "atendimento@clubeancestral.com.br",
  site: "https://clubeancestral.com.br",
  whatsapp: "Somente referência ao canal institucional homologado",
  vedacoes: [
    "Não incluir CPF, RG, data de nascimento, e-mail pessoal ou contato pessoal da responsável.",
    "Perfil institucional precisa estar ativo e aprovado para gerar MODELO-ESTUDO.",
  ],
} as const;

/** Estado consolidado do caso Ana Luiza e o gate correspondente. */
export const ESTADO_CASO_ANA: { dimensao: string; estado: string; gate: string }[] = [
  { dimensao: "Caso canônico", estado: CASO_CANONICO, gate: "Resolver aliases antigos sem duplicar caso, contrato ou cobrança." },
  {
    dimensao: "Núcleo",
    estado: "Ana, Adair e Alice; Felipe é dependente de Ana",
    gate: "Conferir qualificação, papéis, acesso e representação do menor.",
  },
  { dimensao: "Adriel", estado: "Fora do escopo de cidadania familiar por padrão", gate: "Incluir só por nova OS/processo específico." },
  { dimensao: "Rota austríaca", estado: "§ 58c é hipótese em validação", gate: "Não tratar como direito confirmado ou promessa." },
  {
    dimensao: "Dossiê/Checklist",
    estado: "Dossiê Consolidado e Checklist § 58c existentes",
    gate: "Revisar fontes, documentos, lacunas e estados; não recriar.",
  },
  {
    dimensao: "Propostas",
    estado: "Proposta familiar no Canva com múltiplas cópias/versões; proposta individual também localizada",
    gate: "Eleger uma única proposta/OS master por revisão humana.",
  },
  {
    dimensao: "Proposta individual",
    estado: "Referência CA-CID-AT-20026-001, validade declarada até 12/08/2026, com inconsistência editorial",
    gate: "Não usar automaticamente para o contrato familiar; tratar como versão/referência.",
  },
  { dimensao: "Aceite", estado: "Registro anterior: verbalmente aprovado, formal pendente", gate: "Confirmar evidência escrita; não inferir." },
  {
    dimensao: "Contrato",
    estado: "Contrato-Mãe existia como placeholder no inventário anterior",
    gate: "Localizar estado atual; preencher apenas pelo modelo aprovado.",
  },
  {
    dimensao: "Cobrança / pesquisa externa",
    estado: "Condicionadas a contrato e primeira cobrança",
    gate: "Confirmar que não houve ativação indevida.",
  },
  {
    dimensao: "Último prompt pausado",
    estado: "Auditoria de escopo do motor vs proposta/OS",
    gate: "Próxima tarefa do caso, sem alteração de estado.",
  },
];

/** Trilhas de programa vigentes. */
export const TRILHAS_PROGRAMA: { codigo: string; escopo: string }[] = [
  { codigo: "CA-06", escopo: "KPIs e SLA internos, complementares ao Desk." },
  { codigo: "CA-07", escopo: "Saneamento, RLS, DEMO, fontes, auditoria e erros." },
  { codigo: "CA-08", escopo: "Go-Live, onboarding, suporte, observabilidade, revogação e rollback." },
];

DECISOES.push({
  codigo: "CA-DEC-2026-08-19-01",
  titulo: "Arquitetura, fontes de verdade, contrato-base e Go-Live",
  versao: "1.0",
  data: "19/08/2026",
  status: "aprovada — arquitetura",
  escopo: "Cadeia operacional completa, fontes canônicas, motor contratual, conversão/Go-Live e caso Ana Luiza",
  decisao:
    "O Desk Intelligence é o cockpit operacional soberano. A cadeia vai do Painel de Calls à projeção autorizada no App Cliente, cada tema tem uma fonte canônica única e nenhuma cobrança, assinatura, pesquisa externa, portal ou comunicação é disparada automaticamente.",
  itens: [
    { rotulo: "Cockpit", valor: "Desk Intelligence é soberano; App Cliente é projeção autorizada." },
    {
      rotulo: "Memória de Bases Genealógicas",
      valor: "Módulo nativo do Desk; Memória Italiana passa a ser Base Itália, preparada para Áustria, Portugal, Espanha, Polônia e outras bases homologadas.",
    },
    {
      rotulo: "Natureza consultiva",
      valor: "A Memória de Bases não confirma fatos, não conclui juridicamente e não cria dados, tarefas, e-mails ou pesquisas externas sem confirmação humana.",
    },
    { rotulo: "Elegibilidade", valor: "Leitura interna de triagem/hipótese; nunca direito confirmado, percentual de chance ou promessa cliente-facing." },
    { rotulo: "Contrato-base", valor: `${PERFIL_INSTITUCIONAL.contratoBase} — ${PERFIL_INSTITUCIONAL.subtitulo}` },
    { rotulo: "Perfil institucional", valor: "Somente dados institucionais versionados; nenhum dado pessoal da responsável." },
    { rotulo: "Gate de escopo", valor: "Proposta/OS válida, aprovada e vinculada ao mesmo caso, páginas 1–7." },
    { rotulo: "Versionamento", valor: "Um rascunho editável por caso/modelo; snapshots imutáveis em revisão, aprovação, envio e assinatura." },
    { rotulo: "Caso familiar", valor: "Adultos aplicáveis como signatários; menor como dependente, com representação em anexo quando necessário." },
    {
      rotulo: "Despesas de terceiros",
      valor: "São do cliente, comunicadas e aprovadas previamente; antecipação excepcional exige autorização, teto e regra de reembolso.",
    },
    {
      rotulo: "Acesso sem senha",
      valor: "Link mágico/OTP de uso único, curta duração, revogável e vinculado a identidade, organização, caso e RLS; nunca URL pública por case_id.",
    },
    { rotulo: "Checkout", valor: "Exige SKU, preço e condição homologados; pagamento muda estado apenas após confirmação da fonte transacional." },
    {
      rotulo: "Fluxo alvo de conversão",
      valor: "Proposta/OS aceita → reconciliação comercial → contrato quando aplicável → cobrança autorizada → comunicação consentida → pagamento confirmado → onboarding/acesso autorizado.",
    },
    ...TRILHAS_PROGRAMA.map((t) => ({ rotulo: t.codigo, valor: t.escopo })),
  ],
  limites: [
    "Nenhuma cobrança, assinatura, pesquisa externa, portal ou comunicação é disparada automaticamente.",
    "MODELO-ESTUDO só é gerável com texto-base e perfil institucional ativos e aprovados.",
    "Proposta arquivada, recusada, substituída, expirada ou de outro caso não satisfaz gate.",
    "O App nunca mostra fontes cruas, prompts, regras internas, hipótese, risco, auditoria, RLS, preço técnico, margem, dados de terceiros ou documentos não liberados.",
    "Não incluir dados pessoais da responsável em contrato padrão, prévia, log ou App.",
    "Não duplicar caso, contrato ou cobrança ao resolver aliases históricos do caso da Ana.",
  ],
  criteriosAceite: [
    "Cada tema tem fonte canônica declarada e origens não canônicas viram divergência, nunca valor final.",
    "O motor bloqueia versão final, assinatura, cobrança e onboarding sem proposta/OS válida, preço homologado e gates atendidos.",
    "O contrato-base usa somente o perfil institucional versionado.",
    "Uma única proposta/OS master é eleita por revisão humana no caso da Ana.",
    "Acesso do cliente ocorre por link de uso único revogável, nunca por URL pública com case_id.",
    "Nenhuma ação externa é disparada por esta decisão.",
  ],
});
