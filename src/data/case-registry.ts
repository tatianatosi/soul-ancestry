/**
 * Ancestral Canvas — registro central de casos (camada de dados persistente).
 *
 * Este módulo é ADITIVO: não substitui `src/data/casos.ts` (jornada/financeiro),
 * apenas concentra o "estado do caso" compartilhado entre App Cliente e Desk
 * Intelligence (proposta, contrato, pagamento, fases, checklist de go-live,
 * pessoas, documentos, relatórios e próximos passos).
 *
 * Dados demonstrativos. Nenhum conteúdo aqui afirma elegibilidade, vínculo
 * familiar ou conclusão jurídica que não esteja comprovada.
 *
 * Integração futura (hoje mockada): Planilha Mestre de Produtos (SKU),
 * Asaas (paymentUrl/status), CRM Mestre (lead/pipeline) e WhatsApp (marcos).
 */

export type CaseState =
  | "Proposta enviada"
  | "Proposta aceita"
  | "Contrato pendente"
  | "Contrato assinado"
  | "Pagamento pendente"
  | "Pagamento confirmado"
  | "Onboarding iniciado"
  | "Documentos solicitados"
  | "Pesquisa em andamento"
  | "Fase 01 entregue"
  | "Fase 02 prevista"
  | "Fase 02 em produção"
  | "Fase 02 entregue"
  | "Pausado/aguardando cliente"
  | "Concluído/Legado ativo";

export const CASE_STATES: CaseState[] = [
  "Proposta enviada",
  "Proposta aceita",
  "Contrato pendente",
  "Contrato assinado",
  "Pagamento pendente",
  "Pagamento confirmado",
  "Onboarding iniciado",
  "Documentos solicitados",
  "Pesquisa em andamento",
  "Fase 01 entregue",
  "Fase 02 prevista",
  "Fase 02 em produção",
  "Fase 02 entregue",
  "Pausado/aguardando cliente",
  "Concluído/Legado ativo",
];

/** Classificação obrigatória de confiança — nunca afirmar certeza sem prova. */
export type Confianca = "Confirmado" | "Em análise" | "Hipótese de pesquisa" | "Pendente de documento" | "Não aplicável";

export const CONFIANCA_TOM: Record<Confianca, string> = {
  Confirmado: "border-sage/40 bg-sage/10 text-sage",
  "Em análise": "border-gold/50 bg-gold/10 text-navy",
  "Hipótese de pesquisa": "border-plum/40 bg-plum/10 text-plum",
  "Pendente de documento": "border-terracotta/40 bg-terracotta/10 text-terracotta",
  "Não aplicável": "border-navy/20 bg-navy/5 text-navy/60",
};

export type ProposalStatus = "Não enviada" | "Enviada" | "Aceita" | "Recusada";
export type ContractStatus = "Não aplicável" | "Pendente" | "Enviado" | "Assinado";
export type PaymentStatusCase = "Não aplicável" | "Pendente" | "Confirmado";
export type PhaseStatus =
  | "Não prevista"
  | "Prevista"
  | "Em produção"
  | "Em revisão"
  | "Diagnóstico inicial disponível"
  | "Entregue";

export type PersonRef = { nome: string; papel: string; confianca: Confianca; nota?: string };
export type DocumentRef = {
  item: string;
  status: Confianca;
  origem: string;
  responsavel: string;
  atualizadoEm: string;
  observacao: string;
};
export type ReportRef = {
  id: string;
  tipo: "Fase 01 — Relatório Visual" | "Fase 02 — Relatório Completo" | "Linha do tempo familiar" | "Documentos e registros";
  titulo: string;
  status: PhaseStatus;
  versao: string;
  atualizadoEm: string;
  responsavel: string;
};

export type CaseRecord = {
  id: string;
  clientName: string;
  displayName: string;
  country: string;
  citizenshipPath: string;
  caseStatus: CaseState;
  proposalStatus: ProposalStatus;
  contractStatus: ContractStatus;
  paymentStatus: PaymentStatusCase;
  phase1Status: PhaseStatus;
  phase2Status: PhaseStatus;
  caseOwner: string;
  lastUpdate: string;
  nextAction: string;
  confidenceNote: string;
  sources: string[];
  people: PersonRef[];
  documents: DocumentRef[];
  checklist: { item: string; feito: boolean }[];
  reports: ReportRef[];
  proposalSummary: string;
  /** Configurável — integração futura com Asaas. Vazio = link ainda não disponível. */
  paymentUrl: string;
  /** Vincula, quando existir, ao caso da jornada em `src/data/casos.ts`. */
  casoJornadaId?: string;
  demo?: boolean;
  internalNotes?: string[];
  /** Checklist interno do caso (além do go-live padrão). */
  internalChecklist?: { item: string; feito: boolean }[];
  /** Fonte do relatório — arquivo/versão/validação, preenchida pela equipe. */
  reportSource?: {
    arquivo: string;
    data: string;
    versao: string;
    responsavel: string;
    observacoes: string;
    validacao: string;
  };
  /** Tipo do caso (ex.: "Modelo de entrega consultiva"). */
  caseType?: string;
};

/** Checklist de go-live disparado quando o caso vai para "Proposta aceita". */
export const GO_LIVE_CHECKLIST: string[] = [
  "Confirmar dados cadastrais e nome de exibição",
  "Criar/validar ID único do caso",
  "Criar acesso/convite do App Cliente",
  "Confirmar escopo contratado e plano/produto",
  "Confirmar contrato e assinatura",
  "Confirmar pagamento ou condição de início",
  "Configurar jornada do país/caso",
  "Configurar checklist documental inicial",
  "Criar Fase 01 do Relatório Visual",
  "Definir responsável interno e próxima ação",
  "Programar mensagem de boas-vindas/WhatsApp",
  "Criar primeira atualização/marco da Jornada",
  "Definir Fase 02: não prevista, prevista ou incluída no plano",
  "Arquivar proposta e versão de escopo no Desk",
];

const docLinha = (
  item: string,
  status: Confianca,
  origem: string,
  observacao: string,
  responsavel = "Equipe Clube Ancestral",
  atualizadoEm = "—",
): DocumentRef => ({ item, status, origem, responsavel, atualizadoEm, observacao });

const semChecklist = GO_LIVE_CHECKLIST.map((item) => ({ item, feito: false }));
const checklistAte = (n: number) => GO_LIVE_CHECKLIST.map((item, i) => ({ item, feito: i < n }));

export const CASE_REGISTRY: CaseRecord[] = [
  {
    id: "CA-ITA-SOPHI-PICCOLI",
    clientName: "Sophia Piccoli Santiago",
    displayName: "Sophia",
    country: "Itália",
    citizenshipPath: "Cidadania italiana por descendência — potencial em análise",
    caseStatus: "Pesquisa em andamento",
    caseType: "Modelo de entrega consultiva (com dados reais da linha Piccoli)",
    proposalStatus: "Não enviada",
    contractStatus: "Não aplicável",
    paymentStatus: "Não aplicável",
    phase1Status: "Diagnóstico inicial disponível",
    phase2Status: "Prevista",
    caseOwner: "Tatiana",
    lastUpdate: "09/08/2026",
    nextAction: "Preparar proposta de pesquisa documental completa na Itália",
    confidenceNote:
      "Potencial de cidadania italiana em análise. Sem elegibilidade confirmada, sem documentação localizada e sem via (administrativa ou judicial) definida.",
    sources: ["Relato familiar da linha Piccoli", "Diagnóstico inicial da Fase 01 (09/08/2026)"],
    people: [
      { nome: "Sophia Piccoli Santiago", papel: "Requerente (n. 18/05/2006)", confianca: "Pendente de documento" },
      { nome: "Juliana Picoli", papel: "Mãe — filha de Orlando e Sandra", confianca: "Pendente de documento" },
      { nome: "Orlando Picoli", papel: "Avô — filho de João", confianca: "Pendente de documento", nota: "Ex-esposa: Sandra da Silva Lopes (Sandra Silva Picoli), separados" },
      { nome: "João Picoli", papel: "Bisavô — filho de Ângelo, nascido no Brasil", confianca: "Pendente de documento" },
      { nome: "Ângelo Piccoli", papel: "Trisavô — ascendente italiano (n. 30/08/1872, Noventa Vicentina/VI)", confianca: "Em análise" },
      { nome: "Giovanni Piccoli", papel: "Pai de Ângelo (c. 1868, Istrana/TV)", confianca: "Hipótese de pesquisa" },
      { nome: "Benedetta Bresolin", papel: "Mãe de Ângelo (c. 1866, Padernello, Paese/TV)", confianca: "Hipótese de pesquisa" },
      { nome: "Isadora Picoli Santiago", papel: "Irmã — interesse futuro, fora do escopo atual", confianca: "Não aplicável" },
    ],
    documents: [
      docLinha("Certidão de nascimento italiana de Ângelo Piccoli", "Pendente de documento", "Comune de Noventa Vicentina", "Data e local vêm do relato familiar", "09/08/2026"),
      docLinha("Registros italianos de Giovanni Piccoli e Benedetta Bresolin", "Hipótese de pesquisa", "Comuni de Istrana e Paese", "Anos aproximados — busca por faixa", "09/08/2026"),
      docLinha("Certidões brasileiras da cadeia (João, Orlando, Juliana, Sophia)", "Pendente de documento", "Cartórios BR", "Preferência por inteiro teor", "09/08/2026"),
      docLinha("Casamento Orlando Picoli x Sandra da Silva Lopes", "Em análise", "Cartório BR", "Alteração de nome pode gerar divergência", "09/08/2026"),
      docLinha("Divergência de grafia Piccoli / Picoli", "Em análise", "Relato familiar", "Mapear grafia em cada certidão", "09/08/2026"),
      docLinha("Naturalização brasileira do ascendente italiano", "Pendente de documento", "Arquivo Nacional", "Determinante para a transmissão", "09/08/2026"),
    ],
    checklist: checklistAte(4),
    internalChecklist: [
      { item: "Revisar dados da linha Piccoli", feito: false },
      { item: "Inserir fontes ou anexos de cada dado informado", feito: false },
      { item: "Verificar grafias Piccoli/Picoli", feito: false },
      { item: "Definir serviço/SKU adequado para pesquisa documental", feito: false },
      { item: "Definir valor e link de pagamento, se aprovado comercialmente", feito: false },
      { item: "Enviar parecer e proposta para Sophia", feito: false },
      { item: "Registrar resposta e próximo evento comercial", feito: false },
    ],
    reportSource: {
      arquivo: "—",
      data: "09/08/2026",
      versao: "v0.1",
      responsavel: "Tatiana",
      observacoes: "Dados do relato familiar. Anexos e fontes documentais ainda não vinculados.",
      validacao: "Diagnóstico inicial disponível",
    },
    reports: [
      { id: "REL-SOPHI-F1", tipo: "Fase 01 — Relatório Visual", titulo: "Diagnóstico de Ancestralidade e Potencial de Cidadania Italiana — Sophia Piccoli Santiago", status: "Diagnóstico inicial disponível", versao: "v0.1", atualizadoEm: "09/08/2026", responsavel: "Tatiana" },
      { id: "REL-SOPHI-F2", tipo: "Fase 02 — Relatório Completo", titulo: "Relatório Completo de Pesquisa Genealógica — disponível após contratação da pesquisa aprofundada", status: "Prevista", versao: "—", atualizadoEm: "—", responsavel: "A definir" },
      { id: "REL-SOPHI-TL", tipo: "Linha do tempo familiar", titulo: "Linha do tempo familiar (em construção)", status: "Em produção", versao: "v0.1", atualizadoEm: "09/08/2026", responsavel: "Tatiana" },
      { id: "REL-SOPHI-DOC", tipo: "Documentos e registros", titulo: "Catálogo documental do caso (aguardando anexos)", status: "Em produção", versao: "v0.1", atualizadoEm: "09/08/2026", responsavel: "Equipe" },
    ],
    proposalSummary:
      "Proposta a preparar: pesquisa documental completa na Itália. Produto, SKU, valor e link de pagamento a definir pela equipe após análise humana da Fase 01.",
    paymentUrl: "",
    casoJornadaId: "CA-ITA-SOPHI-PICCOLI",
    demo: true,
    internalNotes: [
      "Caso-modelo reutilizável da entrega consultiva (Itália, Portugal, Espanha, Alemanha, Áustria e demais cidadanias).",
      "Conteúdo editorial da Fase 01 em src/data/caso-sophia.ts.",
      "Não fixar SKU automaticamente: a escolha depende da análise humana após a Fase 01.",
    ],
  },
  {
    id: "CA-ITA-GIOVANNA-PRADE",
    clientName: "Giovanna Prade",
    displayName: "Giovanna",
    country: "Itália",
    citizenshipPath: "Cidadania italiana — foco na linha paterna",
    caseStatus: "Proposta enviada",
    proposalStatus: "Enviada",
    contractStatus: "Pendente",
    paymentStatus: "Pendente",
    phase1Status: "Entregue",
    phase2Status: "Não prevista",
    caseOwner: "Tatiana",
    lastUpdate: "31/07/2026",
    nextAction: "Aguardando decisão/contratação — escolher formato e assinar procurações",
    confidenceNote: "Situação de registro familiar/consular a esclarecer antes de qualquer conclusão.",
    sources: ["Diagnóstico inicial contratado (CA-CID-001)", "Planilha CASOS"],
    people: [
      { nome: "Giovanna Prade", papel: "Requerente", confianca: "Confirmado" },
      { nome: "Linha paterna", papel: "Linha de trabalho", confianca: "Em análise" },
    ],
    documents: [
      docLinha("Procurações em português e italiano", "Pendente de documento", "Clube Ancestral", "Emitir após aceite"),
      docLinha("Relatório de situação e próximos passos", "Em análise", "Interno", "Consolidar leitura do diagnóstico"),
      docLinha("Documentação não disponível com a cliente", "Pendente de documento", "Cartórios / consulado", "Localizar antes da execução"),
    ],
    checklist: checklistAte(2),
    reports: [
      { id: "REL-GIO-F1", tipo: "Fase 01 — Relatório Visual", titulo: "Diagnóstico inicial — Giovanna Prade", status: "Entregue", versao: "v1.0", atualizadoEm: "31/07/2026", responsavel: "Tatiana" },
    ],
    proposalSummary: "Assessoria Completa de Cidadania Italiana + pasta e AIRE — aguardando escolha do formato de contratação.",
    paymentUrl: "",
    casoJornadaId: "CA-CID-IT-2026-001",
    internalNotes: ["Jornada inicial: Diagnóstico → Pendências → Execução → Complementos → Continuidade."],
  },
  {
    id: "CA-AUT-ANA-LUIZA-GOMES",
    clientName: "Ana Luiza Gomes Silveira",
    displayName: "Ana Luiza",
    country: "Áustria",
    citizenshipPath: "Cidadania austríaca por reparação histórica — hipótese forte em análise",
    caseStatus: "Proposta enviada",
    proposalStatus: "Enviada",
    contractStatus: "Pendente",
    paymentStatus: "Pendente",
    phase1Status: "Prevista",
    phase2Status: "Não prevista",
    caseOwner: "Tatiana",
    lastUpdate: "—",
    nextAction: "Organizar anexos recebidos por WhatsApp na pasta do caso",
    confidenceNote: "Caminho tratado como hipótese forte em análise — sem garantia de enquadramento.",
    sources: ["Mensagens e anexos recebidos por WhatsApp (a validar)", "Planilha CASOS"],
    people: [
      { nome: "Ana Luiza Gomes Silveira", papel: "Requerente", confianca: "Confirmado" },
      { nome: "Ascendente perseguido", papel: "Base da reparação histórica", confianca: "Em análise" },
      { nome: "Possíveis beneficiários diretos", papel: "A mapear", confianca: "Não aplicável", nota: "Inclusão não é automática" },
    ],
    documents: [
      docLinha("Anexos recebidos por WhatsApp", "Em análise", "Cliente", "Referência recebida — consolidar na pasta do caso"),
      docLinha("Passaporte/registro do ascendente", "Pendente de documento", "Cliente / arquivo", "Confirmar autenticidade e legibilidade"),
      docLinha("Certidões originais da cadeia", "Pendente de documento", "Cartórios BR", "Solicitar originais"),
      docLinha("Certidão de casamento antiga", "Pendente de documento", "Cartório de origem", "Localizar registro"),
      docLinha("Traduções e apostilas", "Não aplicável", "A definir", "Somente após validação das provas exigidas"),
    ],
    checklist: checklistAte(1),
    reports: [
      { id: "REL-ANA-F1", tipo: "Fase 01 — Relatório Visual", titulo: "Diagnóstico inicial — Ana Luiza Gomes Silveira", status: "Prevista", versao: "—", atualizadoEm: "—", responsavel: "Tatiana" },
    ],
    proposalSummary: "Parâmetros financeiros a definir (§ 58c StbG). Escopo depende da validação documental.",
    paymentUrl: "",
    casoJornadaId: "CA-CID-AT-2026-002",
    internalNotes: ["Alerta: organizar anexos do WhatsApp antes do início da pesquisa."],
  },
  {
    id: "CA-GEN-JOAO",
    clientName: "João",
    displayName: "João",
    country: "A definir",
    citizenshipPath: "A definir após briefing",
    caseStatus: "Proposta enviada",
    proposalStatus: "Enviada",
    contractStatus: "Não aplicável",
    paymentStatus: "Não aplicável",
    phase1Status: "Não prevista",
    phase2Status: "Não prevista",
    caseOwner: "A definir",
    lastUpdate: "—",
    nextAction: "Aguardando confirmação de contratação e briefing inicial",
    confidenceNote: "Nenhum dado de linhagem, país ou elegibilidade presumido.",
    sources: ["Cadastro interno de prontidão"],
    people: [{ nome: "João", papel: "Contato", confianca: "Em análise" }],
    documents: [
      docLinha("Briefing inicial (país de interesse, objetivo, linha familiar)", "Pendente de documento", "Cliente", "Formulário de onboarding"),
      docLinha("Documentos já disponíveis com o cliente", "Pendente de documento", "Cliente", "Levantar na primeira conversa"),
    ],
    checklist: semChecklist,
    reports: [],
    proposalSummary: "Caso a configurar após a contratação.",
    paymentUrl: "",
    internalNotes: ["Aguardando briefing/documentos iniciais."],
  },
  {
    id: "CA-GEN-LARA",
    clientName: "Lara",
    displayName: "Lara",
    country: "A definir",
    citizenshipPath: "A definir após briefing",
    caseStatus: "Proposta enviada",
    proposalStatus: "Enviada",
    contractStatus: "Não aplicável",
    paymentStatus: "Não aplicável",
    phase1Status: "Não prevista",
    phase2Status: "Não prevista",
    caseOwner: "A definir",
    lastUpdate: "—",
    nextAction: "Aguardando confirmação de contratação e briefing inicial",
    confidenceNote: "Nenhum dado de linhagem, país ou elegibilidade presumido.",
    sources: ["Cadastro interno de prontidão"],
    people: [{ nome: "Lara", papel: "Contato", confianca: "Em análise" }],
    documents: [
      docLinha("Briefing inicial (país de interesse, objetivo, linha familiar)", "Pendente de documento", "Cliente", "Formulário de onboarding"),
      docLinha("Familiares envolvidos e origem do lead", "Pendente de documento", "Cliente / CRM", "Registrar canal de contato preferido"),
    ],
    checklist: semChecklist,
    reports: [],
    proposalSummary: "Caso a configurar após a contratação.",
    paymentUrl: "",
    internalNotes: ["Aguardando briefing/documentos iniciais."],
  },
];

export const registryById = (id: string) => CASE_REGISTRY.find((c) => c.id === id);

/** Encontra o registro correspondente a um caso da jornada (`src/data/casos.ts`). */
export const registryByCasoId = (casoId: string) =>
  CASE_REGISTRY.find((c) => c.casoJornadaId === casoId || c.id === casoId);

export type CaseAlert = { nivel: "alto" | "medio"; titulo: string; caso: string; detalhe: string };

/** Regras de alerta do Desk — derivadas do estado do caso (sem automação externa). */
export function alertasDoRegistro(list: CaseRecord[] = CASE_REGISTRY): CaseAlert[] {
  const out: CaseAlert[] = [];
  for (const c of list) {
    const nome = c.clientName;
    if (c.proposalStatus === "Aceita" && c.contractStatus !== "Assinado")
      out.push({ nivel: "alto", titulo: "Proposta aceita sem contrato", caso: nome, detalhe: `Contrato: ${c.contractStatus}` });
    if (c.contractStatus === "Assinado" && c.paymentStatus !== "Confirmado")
      out.push({ nivel: "alto", titulo: "Contrato assinado sem pagamento confirmado", caso: nome, detalhe: `Pagamento: ${c.paymentStatus}` });
    if (c.paymentStatus === "Confirmado" && c.caseStatus === "Pagamento confirmado")
      out.push({ nivel: "medio", titulo: "Pagamento confirmado sem onboarding iniciado", caso: nome, detalhe: "Rodar checklist de go-live" });
    if (c.documents.some((d) => d.status === "Pendente de documento"))
      out.push({ nivel: "medio", titulo: "Documento pendente", caso: nome, detalhe: `${c.documents.filter((d) => d.status === "Pendente de documento").length} item(ns) aguardando envio` });
    if (c.phase1Status === "Entregue" && c.caseStatus === "Fase 01 entregue" && c.phase2Status === "Prevista" && c.caseOwner === "A definir")
      out.push({ nivel: "medio", titulo: "Fase 02 prevista sem responsável", caso: nome, detalhe: "Definir responsável e prazo" });
    if (c.lastUpdate === "—")
      out.push({ nivel: "medio", titulo: "Caso sem atualização recente", caso: nome, detalhe: "Registrar próxima ação e data" });
  }
  return out;
}

/** Mocks de integração — identificados como dados demonstrativos na interface. */
export const INTEGRACOES_FUTURAS = [
  { nome: "Planilha Mestre de Produtos", campos: "sku, nome, categoria, preco, status", estado: "Mock local" },
  { nome: "Asaas", campos: "paymentUrl por produto/etapa, status de cobrança", estado: "Campo configurável (vazio por padrão)" },
  { nome: "CRM Mestre", campos: "lead, cliente, origem, proposta, pipeline, responsável", estado: "Mock local" },
  { nome: "WhatsApp", campos: "boas-vindas e atualizações de marcos", estado: "Texto manual, sem automação" },
];

/**
 * Fallback neutro para casos da jornada que ainda não possuem registro próprio.
 * Não inventa dados: tudo fica marcado como a definir / pendente.
 */
export function registroOuFallback(casoId: string, cliente: string, pais: string, tipo: string): CaseRecord {
  const found = registryByCasoId(casoId);
  if (found) return found;
  return {
    id: casoId,
    clientName: cliente,
    displayName: cliente.split(" ")[0],
    country: pais,
    citizenshipPath: `${tipo} — escopo em análise`,
    caseStatus: "Proposta enviada",
    proposalStatus: "Enviada",
    contractStatus: "Pendente",
    paymentStatus: "Pendente",
    phase1Status: "Prevista",
    phase2Status: "Não prevista",
    caseOwner: "A definir",
    lastUpdate: "—",
    nextAction: "Definir próxima ação com a equipe",
    confidenceNote: "Sem conclusão de elegibilidade: informações pendentes de comprovação documental.",
    sources: [],
    people: [{ nome: cliente, papel: "Requerente", confianca: "Confirmado" }],
    documents: [],
    checklist: GO_LIVE_CHECKLIST.map((item) => ({ item, feito: false })),
    reports: [],
    proposalSummary: "Escopo a confirmar.",
    paymentUrl: "",
    casoJornadaId: casoId,
  };
}
