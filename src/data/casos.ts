/**
 * Ancestral Canvas — estruturas de dados dos casos.
 *
 * ORIGEM DOS DADOS (a substituir pelos arquivos reais):
 *  - CASOS / CONVENCAO_IDS / PARAMETROS / SKUS_REFERENCIA / RESUMO_CASOS / PAINEL /
 *    MARCOS_JURIDICOS_SYNC -> planejador-universal-simulador-todas-cidadanias.xlsx
 *  - Checklist_AppCliente -> checklists_go_live_casos_clientes.xlsx
 *  - Prioridades (T-003, T-017, T-018, T-026, T-043) -> checklist_prioridades_clube_ancestral.xlsx
 *
 * Os valores abaixo são EXEMPLOS ESTRUTURADOS (origem: "exemplo") apenas para o mockup.
 * Basta trocar o conteúdo destes arrays pelos dados das planilhas — a UI não muda.
 */

export const ORIGEM_DADOS = "exemplo — aguardando planilhas" as const;

export type Pais = "Itália" | "Áustria" | "Portugal" | "Espanha" | "Alemanha";
export type StatusCaso = "em-andamento" | "proposta-aceita" | "em-proposta";
export type EtapaKey = "diagnostico" | "pendencias" | "execucao" | "complementos" | "continuidade";

export const ETAPAS: { key: EtapaKey; label: string }[] = [
  { key: "diagnostico", label: "Diagnóstico" },
  { key: "pendencias", label: "Pendências" },
  { key: "execucao", label: "Execução" },
  { key: "complementos", label: "Complementos" },
  { key: "continuidade", label: "Continuidade" },
];

export type ItemStatus = "pendente" | "parcial" | "ok";

export type Caso = {
  id: string; // CONVENCAO_IDS: CA-<PAÍS>-<ANO>-<SEQ>
  cliente: string;
  iniciais: string;
  tipoProcesso: string; // ex.: "Cidadania Italiana"
  pais: Pais;
  baseJuridica: string; // MARCOS_JURIDICOS_SYNC
  responsavel: string;
  status: StatusCaso;
  dataInicio: string;
  etapaAtual: EtapaKey;
  progresso: number;
  saude: "saudavel" | "atencao" | "critico";
  proximaAcao: string;
  linhaAncestral: { ano: string; texto: string; uniao?: boolean }[];
  linhaProcesso: { etapa: EtapaKey; data: string; realizado: boolean }[];
  checklistDocs: { item: string; status: ItemStatus }[];
  checklistAppCliente: { item: string; feito: boolean }[];
  proximosPassos: { titulo: string; sub: string; tom: "urgent" | "info" | "soft" }[];
  achados: { data: string; titulo: string; desc: string }[];
  radar: { k: string; v: number }[];
  marcosJuridicos: { titulo: string; situacao: "aberta" | "condicionada" | "fechada"; nota: string }[];
  plano: {
    nome: string;
    formato: "à vista" | "recorrência" | "por etapas";
    honorariosBase: number;
    despesasPrevistas: number;
    taxasPrevistas: number;
    parcelas: string;
    skus: string[];
    linkPagamento: string; // placeholder Asaas/Autentique
  };
  financeiro: { pagoCliente: number; desembolsadoClube: number };
  historico: { t: string; d: string }[];
};

const RADAR_EIXOS = ["Documentação", "Origem", "Conexões", "Elegibilidade", "Memória", "Legado"];
const radar = (v: number[]) => RADAR_EIXOS.map((k, i) => ({ k, v: v[i] }));

const CHECKLIST_APP_PADRAO = (feitos: number) =>
  [
    "Configurar jornada do caso no app",
    "Criar slot de chamada inicial",
    "Preparar percurso das 5 etapas",
    "Publicar checklist de documentos",
    "Ativar alertas de achados",
  ].map((item, i) => ({ item, feito: i < feitos }));

const DOCS_PADRAO: Record<Pais, string[]> = {
  "Itália": [
    "Procuração italiana (apostilada)",
    "Procuração brasileira",
    "RG ou CNH",
    "CPF",
    "Certidões brasileiras retificadas",
    "Certidão do antenato italiano (comune)",
    "Non rinuncia (CGI e comune)",
    "Transcrições no comune",
    "Inscrição AIRE",
    "Montagem da pasta consular",
  ],
  "Áustria": [
    "Procuração austríaca",
    "Procuração brasileira",
    "RG ou CNH",
    "CPF",
    "Certidões brasileiras completas",
    "Prova de perseguição do antenato (§ 58c StbG)",
    "Documento de saída da Áustria (1933–1955)",
    "Traduções juramentadas (alemão)",
    "Formulário consular austríaco",
    "Diagnóstico de elegibilidade assinado",
  ],
  "Portugal": [
    "Procuração portuguesa",
    "Procuração brasileira",
    "RG ou CNH",
    "CPF",
    "Certidões brasileiras em inteiro teor",
    "Certidão do antenato português (conservatória)",
    "Comprovante de vínculo com a comunidade",
    "Registro de nascimento a transcrever",
    "Requerimento à Conservatória Central",
    "Montagem do processo",
  ],
  "Espanha": ["Procuração espanhola", "RG ou CNH", "CPF", "Certidões brasileiras", "Documento do antenato espanhol"],
  "Alemanha": ["Procuração alemã", "RG ou CNH", "CPF", "Certidões brasileiras", "Prova § 15 StAG"],
};

const docs = (pais: Pais, oks: number, parciais: number) =>
  DOCS_PADRAO[pais].map((item, i) => ({
    item,
    status: (i < oks ? "ok" : i < oks + parciais ? "parcial" : "pendente") as ItemStatus,
  }));

export const CASOS: Caso[] = [
  {
    id: "CA-IT-2026-001",
    cliente: "Giovanna Ferraro",
    iniciais: "GF",
    tipoProcesso: "Cidadania Italiana",
    pais: "Itália",
    baseJuridica: "Jus sanguinis — via judicial (linha materna 1948)",
    responsavel: "Equipe Clube Ancestral",
    status: "proposta-aceita",
    dataInicio: "12/05/2026",
    etapaAtual: "pendencias",
    progresso: 38,
    saude: "saudavel",
    proximaAcao: "Agendar chamada inicial",
    linhaAncestral: [
      { ano: "1820", texto: "Origem do ramo Ferraro — Campânia, Itália" },
      { ano: "1887", texto: "Nascimento do antenato Giuseppe Ferraro" },
      { ano: "1923", texto: "União dos ramos Ferraro e Russo", uniao: true },
      { ano: "1965", texto: "Reencontro dos ramos no Brasil", uniao: true },
      { ano: "2026", texto: "Início da jornada Clube Ancestral" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "12/05/2026", realizado: true },
      { etapa: "pendencias", data: "05/07/2026", realizado: false },
      { etapa: "execucao", data: "20/09/2026", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Itália", 3, 2),
    checklistAppCliente: CHECKLIST_APP_PADRAO(3),
    proximosPassos: [
      { titulo: "Agendar chamada inicial", sub: "Slot disponível esta semana", tom: "urgent" },
      { titulo: "Enviar certidões brasileiras", sub: "3 documentos pendentes", tom: "info" },
      { titulo: "Assinar procuração italiana", sub: "Link será enviado após a chamada", tom: "soft" },
    ],
    achados: [
      { data: "28 jun 2026", titulo: "Antenato localizado no comune de Nola", desc: "Registro civil confirma a linha materna sem naturalização anterior." },
      { data: "14 jun 2026", titulo: "Lista de embarque — Gênova, 1912", desc: "Confirma a saída do antenato rumo a Santos." },
    ],
    radar: radar([62, 88, 70, 80, 55, 35]),
    marcosJuridicos: [
      { titulo: "Via italiana aberta por ação judicial (1948)", situacao: "aberta", nota: "Linha materna anterior a 1948 exige ação em Roma." },
      { titulo: "Transcrição no comune após sentença", situacao: "condicionada", nota: "Depende da pasta completa e apostilamento." },
    ],
    plano: {
      nome: "Percurso Itália — Judicial",
      formato: "por etapas",
      honorariosBase: 24000,
      despesasPrevistas: 6800,
      taxasPrevistas: 2400,
      parcelas: "Entrada + 10x",
      skus: ["SKU-DIAG-01", "SKU-PASTA-IT", "SKU-JUD-IT", "SKU-AIRE"],
      linkPagamento: "https://pagamento.exemplo/asaas/CA-IT-2026-001",
    },
    financeiro: { pagoCliente: 9600, desembolsadoClube: 3200 },
    historico: [
      { t: "💳 Pagamento confirmado", d: "02 jul 2026" },
      { t: "📄 Proposta aceita", d: "30 jun 2026" },
      { t: "🔎 Achado documental", d: "28 jun 2026" },
      { t: "🎯 Caso iniciado", d: "12 mai 2026" },
    ],
  },
  {
    id: "CA-AT-2026-002",
    cliente: "Ana Luiza Steiner",
    iniciais: "AS",
    tipoProcesso: "Cidadania Austríaca",
    pais: "Áustria",
    baseJuridica: "§ 58c StbG — via de reparação",
    responsavel: "Equipe Clube Ancestral",
    status: "em-andamento",
    dataInicio: "03/03/2026",
    etapaAtual: "execucao",
    progresso: 61,
    saude: "atencao",
    proximaAcao: "Reunir prova de perseguição",
    linhaAncestral: [
      { ano: "1901", texto: "Nascimento do antenato em Viena" },
      { ano: "1938", texto: "Saída forçada da Áustria" },
      { ano: "1946", texto: "União dos ramos no Brasil", uniao: true },
      { ano: "2026", texto: "Início da jornada Clube Ancestral" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "03/03/2026", realizado: true },
      { etapa: "pendencias", data: "18/04/2026", realizado: true },
      { etapa: "execucao", data: "12/07/2026", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Áustria", 5, 2),
    checklistAppCliente: CHECKLIST_APP_PADRAO(4),
    proximosPassos: [
      { titulo: "Enviar documento de saída (1938)", sub: "Prova central da via de reparação", tom: "urgent" },
      { titulo: "Traduções juramentadas", sub: "2 certidões em fila", tom: "info" },
      { titulo: "Revisar formulário consular", sub: "Aguardando conferência da equipe", tom: "soft" },
    ],
    achados: [
      { data: "22 jun 2026", titulo: "Registro de residência em Viena, 1935", desc: "Meldezettel localizado no arquivo municipal." },
    ],
    radar: radar([74, 82, 58, 86, 60, 40]),
    marcosJuridicos: [
      { titulo: "Via austríaca de reparação aberta (§ 58c)", situacao: "aberta", nota: "Sem limite de gerações para descendentes de perseguidos." },
      { titulo: "Dupla cidadania permitida nesta via", situacao: "aberta", nota: "Não exige renúncia à nacionalidade brasileira." },
    ],
    plano: {
      nome: "Percurso Áustria — Reparação",
      formato: "recorrência",
      honorariosBase: 19800,
      despesasPrevistas: 4200,
      taxasPrevistas: 1600,
      parcelas: "12x mensais",
      skus: ["SKU-DIAG-01", "SKU-PASTA-AT", "SKU-TRAD-DE"],
      linkPagamento: "https://pagamento.exemplo/asaas/CA-AT-2026-002",
    },
    financeiro: { pagoCliente: 8250, desembolsadoClube: 2900 },
    historico: [
      { t: "📄 Documentos recebidos", d: "22 jun 2026" },
      { t: "💬 Chamada realizada", d: "05 mai 2026" },
      { t: "🎯 Caso iniciado", d: "03 mar 2026" },
    ],
  },
  {
    id: "CA-IT-2026-003",
    cliente: "Lara Bianchi",
    iniciais: "LB",
    tipoProcesso: "Cidadania Italiana",
    pais: "Itália",
    baseJuridica: "Jus sanguinis — via administrativa (comune)",
    responsavel: "Equipe Clube Ancestral",
    status: "em-proposta",
    dataInicio: "20/06/2026",
    etapaAtual: "diagnostico",
    progresso: 15,
    saude: "atencao",
    proximaAcao: "Enviar proposta para assinatura",
    linhaAncestral: [
      { ano: "1875", texto: "Origem do ramo Bianchi — Lombardia" },
      { ano: "1908", texto: "Emigração para o Brasil" },
      { ano: "2026", texto: "Início do diagnóstico" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "20/06/2026", realizado: true },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Itália", 2, 1),
    checklistAppCliente: CHECKLIST_APP_PADRAO(1),
    proximosPassos: [
      { titulo: "Assinar proposta", sub: "Link Autentique enviado", tom: "urgent" },
      { titulo: "Confirmar dados do antenato", sub: "Comune de origem a validar", tom: "info" },
      { titulo: "Agendar diagnóstico completo", sub: "Após aceite da proposta", tom: "soft" },
    ],
    achados: [
      { data: "25 jun 2026", titulo: "Sobrenome confirmado em 3 gerações", desc: "Cruzamento de registros paroquiais e civis brasileiros." },
    ],
    radar: radar([40, 70, 45, 58, 35, 20]),
    marcosJuridicos: [
      { titulo: "Via italiana administrativa aberta", situacao: "condicionada", nota: "Depende da inexistência de naturalização antes do nascimento seguinte." },
    ],
    plano: {
      nome: "Percurso Itália — Administrativo",
      formato: "à vista",
      honorariosBase: 16500,
      despesasPrevistas: 5200,
      taxasPrevistas: 1800,
      parcelas: "À vista com desconto",
      skus: ["SKU-DIAG-01", "SKU-PASTA-IT", "SKU-TRANSCR"],
      linkPagamento: "https://pagamento.exemplo/autentique/CA-IT-2026-003",
    },
    financeiro: { pagoCliente: 0, desembolsadoClube: 450 },
    historico: [
      { t: "📄 Proposta enviada", d: "26 jun 2026" },
      { t: "🎯 Diagnóstico iniciado", d: "20 jun 2026" },
    ],
  },
  {
    id: "CA-PT-2026-004",
    cliente: "João Ferreira",
    iniciais: "JF",
    tipoProcesso: "Cidadania Portuguesa",
    pais: "Portugal",
    baseJuridica: "Neto de português — art. 1º-B, Lei 37/81",
    responsavel: "Equipe Clube Ancestral",
    status: "em-andamento",
    dataInicio: "15/01/2026",
    etapaAtual: "complementos",
    progresso: 78,
    saude: "saudavel",
    proximaAcao: "Protocolar na Conservatória Central",
    linhaAncestral: [
      { ano: "1820", texto: "Origem do ramo Ferreira — Minho, Portugal" },
      { ano: "1902", texto: "Nascimento do avô português" },
      { ano: "1948", texto: "União dos ramos Ferreira e Sousa", uniao: true },
      { ano: "2026", texto: "Fase final do processo" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "15/01/2026", realizado: true },
      { etapa: "pendencias", data: "02/03/2026", realizado: true },
      { etapa: "execucao", data: "28/04/2026", realizado: true },
      { etapa: "complementos", data: "10/07/2026", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Portugal", 7, 2),
    checklistAppCliente: CHECKLIST_APP_PADRAO(5),
    proximosPassos: [
      { titulo: "Conferir requerimento final", sub: "Revisão da equipe jurídica", tom: "urgent" },
      { titulo: "Comprovar vínculo com a comunidade", sub: "1 documento complementar", tom: "info" },
      { titulo: "Planejar continuidade familiar", sub: "Transmissão aos filhos", tom: "soft" },
    ],
    achados: [
      { data: "18 jun 2026", titulo: "Assento de nascimento — Braga, 1902", desc: "Certidão em inteiro teor emitida pela conservatória local." },
    ],
    radar: radar([88, 84, 76, 82, 68, 52]),
    marcosJuridicos: [
      { titulo: "Via portuguesa aberta para netos", situacao: "aberta", nota: "Art. 1º-B com prova de vínculo efetivo à comunidade." },
      { titulo: "Transmissão aos filhos após registro", situacao: "aberta", nota: "Habilita continuidade da linha." },
    ],
    plano: {
      nome: "Percurso Portugal — Neto",
      formato: "por etapas",
      honorariosBase: 14200,
      despesasPrevistas: 3600,
      taxasPrevistas: 1250,
      parcelas: "Entrada + 6x",
      skus: ["SKU-DIAG-01", "SKU-PASTA-PT", "SKU-CONSERV"],
      linkPagamento: "https://pagamento.exemplo/asaas/CA-PT-2026-004",
    },
    financeiro: { pagoCliente: 12800, desembolsadoClube: 4100 },
    historico: [
      { t: "💳 Parcela 5 confirmada", d: "01 jul 2026" },
      { t: "📄 Certidão recebida", d: "18 jun 2026" },
      { t: "🎯 Caso iniciado", d: "15 jan 2026" },
    ],
  },
];

export const casoById = (id: string) => CASOS.find((c) => c.id === id) ?? CASOS[0];

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/* ---- Resumo financeiro por caso (RESUMO_CASOS) ---- */
export const resumoCaso = (c: Caso) => {
  const previsto = c.plano.honorariosBase + c.plano.despesasPrevistas + c.plano.taxasPrevistas;
  const saldo = previsto - c.financeiro.pagoCliente;
  return { previsto, saldo };
};

/* ---- Painel universal (aba PAINEL) ---- */
export const painelUniversal = () => {
  const honorarios = CASOS.reduce((s, c) => s + c.plano.honorariosBase, 0);
  const despesas = CASOS.reduce((s, c) => s + c.plano.despesasPrevistas, 0);
  const taxas = CASOS.reduce((s, c) => s + c.plano.taxasPrevistas, 0);
  const pago = CASOS.reduce((s, c) => s + c.financeiro.pagoCliente, 0);
  const saldo = honorarios + despesas + taxas - pago;
  return {
    honorarios,
    despesas,
    taxas,
    saldo,
    casos: CASOS.length,
    ticketMedio: Math.round(honorarios / CASOS.length),
  };
};

/* ---- Plano Legado (upsell comum) ---- */
export const PLANO_LEGADO = {
  nome: "Plano Legado",
  descricao: "Livro impresso, dossiê narrativo e árvore expandida completa para as próximas gerações.",
  itens: ["Álbum ilustrado impresso", "Narrativa completa em áudio", "Árvore expandida", "Cerimônia de entrega"],
  precoRef: 4900,
};

/* ---- Integração de pagamentos (T-003 / T-017 / T-018) ---- */
export type FlagIntegracao = "configurado" | "em-teste" | "pendente";
export const INTEGRACOES: { tarefa: string; titulo: string; desc: string; flag: FlagIntegracao }[] = [
  { tarefa: "T-003", titulo: "Reconciliação Asaas ↔ Banco", desc: "Conciliação diária de recebimentos e repasses.", flag: "em-teste" },
  { tarefa: "T-017", titulo: "Integração app ↔ pagamentos", desc: "Exibir status de cobrança e link de pagamento no app cliente.", flag: "pendente" },
  { tarefa: "T-018", titulo: "Webhooks de cobrança", desc: "Receber confirmação automática e liberar o caso.", flag: "pendente" },
];

/* ---- Status App Cliente MVP vs fase 2 (T-026 / T-043) ---- */
export const STATUS_APP: { tela: string; fase: "MVP" | "Fase 2"; ativo: boolean; nota: string }[] = [
  { tela: "Home — painel do caso", fase: "MVP", ativo: true, nota: "Progresso das 5 etapas + próximos passos" },
  { tela: "Jornada", fase: "MVP", ativo: true, nota: "Linha ancestral + linha do processo" },
  { tela: "Radar", fase: "MVP", ativo: true, nota: "6 dimensões + marcos jurídicos" },
  { tela: "Documentos", fase: "MVP", ativo: true, nota: "Checklist por item com upload" },
  { tela: "Legado", fase: "MVP", ativo: true, nota: "Achados + upsell Plano Legado" },
  { tela: "Conta", fase: "MVP", ativo: true, nota: "Plano contratado, pagamento e histórico" },
  { tela: "Gamificação — pontos e selos", fase: "Fase 2", ativo: false, nota: "T-026" },
  { tela: "Ranking familiar e conquistas", fase: "Fase 2", ativo: false, nota: "T-043" },
];
