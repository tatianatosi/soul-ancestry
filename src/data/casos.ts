/**
 * Ancestral Canvas — estruturas de dados dos casos.
 *
 * ORIGEM DOS DADOS (planilhas reais anexadas ao projeto):
 *  - CASOS / CONVENCAO_IDS / PARAMETROS / SKUS_REFERENCIA / LANCAMENTOS / PAGAMENTOS /
 *    MARCOS_JURIDICOS_SYNC / PAINEL -> planejador-universal-simulador-todas-cidadanias.xlsx
 *  - Checklist_AppCliente e demais checklists por caso -> checklists_go_live_casos_clientes.xlsx
 *  - T-003 / T-017 / T-018 / T-026 / T-043 -> checklist_prioridades_clube_ancestral.xlsx
 *
 * Convenção de IDs (aba CONVENCAO_IDS): CA-[TIPO]-[PAÍS]-[ANO]-[SEQ]
 *   TIPO: CID = cidadania | NAT = naturalizacao | REG = regularizacao | POS = pos-cidadania
 *   PAÍS: IT | HR | PT | ES | DE | PL | RO | FR | BR | AT | EU     SEQ: 3 dígitos
 */

export const ORIGEM_DADOS = "planilhas" as const;

export const CONVENCAO_IDS = {
  formato: "CA-[TIPO]-[PAÍS]-[ANO]-[SEQ]",
  tipos: { CID: "cidadania", NAT: "naturalizacao", REG: "regularizacao", POS: "pos-cidadania" },
  paises:
    "IT Itália | HR Croácia | PT Portugal | ES Espanha | DE Alemanha | PL Polônia | RO Romênia | FR França | BR Brasil | AT Áustria | EU Europa geral",
  sequencia: "3 dígitos: 001, 002, 003...",
  skuInterno: "CA-[TIPO]-[PAÍS]-PAC-[NN]",
};

export type Pais =
  | "Itália"
  | "Áustria"
  | "Portugal"
  | "Espanha"
  | "Alemanha"
  | "Croácia"
  | "França"
  | "Brasil";
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
  id: string; // CONVENCAO_IDS: CA-[TIPO]-[PAÍS]-[ANO]-[SEQ]
  cliente: string;
  iniciais: string;
  tipoProcesso: string; // PARAMETROS / CASOS
  pais: Pais;
  baseJuridica: string; // CASOS.Pais/Base Juridica + MARCOS_JURIDICOS_SYNC
  /** Via mais provável para o caso — define o produto/SKU/preço da Etapa 02. */
  viaSugerida?: "administrativa" | "judicial" | "a-definir";
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
  marcosJuridicos: {
    titulo: string;
    situacao: "aberta" | "condicionada" | "fechada";
    nota: string;
  }[];
  plano: {
    nome: string;
    formato: "à vista" | "recorrência" | "por etapas";
    honorariosBase: number;
    despesasPrevistas: number;
    taxasPrevistas: number;
    parcelas: string;
    skus: string[];
    linkPagamento: string;
  };
  financeiro: { pagoCliente: number; desembolsadoClube: number };
  historico: { t: string; d: string }[];
  observacoes?: string;
};

/* ---- PARAMETROS (planejador universal) ---- */
export const PARAMETROS: Record<
  string,
  { honorarios: number; despesas: number; taxas: number; parcelas: number; obs: string }
> = {
  "Cidadania Italiana": {
    honorarios: 4500,
    despesas: 1600,
    taxas: 500,
    parcelas: 6,
    obs: "Base premium completa",
  },
  "Cidadania Croata": {
    honorarios: 4000,
    despesas: 1800,
    taxas: 600,
    parcelas: 4,
    obs: "Separar taxas consulares e passaporte",
  },
  "Cidadania Portuguesa": {
    honorarios: 5300,
    despesas: 1400,
    taxas: 450,
    parcelas: 6,
    obs: "Ajustar conforme cartórios e ACP",
  },
  "Cidadania Espanhola": {
    honorarios: 3200,
    despesas: 1200,
    taxas: 400,
    parcelas: 5,
    obs: "Modelo ajustável",
  },
  "Cidadania Alemã": {
    honorarios: 4200,
    despesas: 1500,
    taxas: 500,
    parcelas: 6,
    obs: "Modelo ajustável",
  },
  "Cidadania Polonesa": {
    honorarios: 3900,
    despesas: 1500,
    taxas: 450,
    parcelas: 6,
    obs: "Modelo ajustável",
  },
  "Cidadania Romena": {
    honorarios: 3600,
    despesas: 1400,
    taxas: 450,
    parcelas: 6,
    obs: "Modelo ajustável",
  },
  "Cidadania Europeia Geral": {
    honorarios: 3500,
    despesas: 1400,
    taxas: 500,
    parcelas: 6,
    obs: "Modelo genérico",
  },
  "Naturalização Brasileira": {
    honorarios: 900,
    despesas: 300,
    taxas: 0,
    parcelas: 3,
    obs: "Serviço leve",
  },
  "Naturalização Francesa": {
    honorarios: 1000,
    despesas: 350,
    taxas: 250,
    parcelas: 3,
    obs: "Pacote leve",
  },
  "Cidadania Austríaca": {
    honorarios: 0,
    despesas: 0,
    taxas: 0,
    parcelas: 3,
    obs: "Preencher manualmente",
  },
};

/* ---- SKUS_REFERENCIA ---- */
export const SKUS_REFERENCIA: {
  sku: string;
  nome: string;
  tipo: string;
  preco: number;
  status: string;
}[] = [
  {
    sku: "CA-CID-023",
    nome: "Assessoria Completa de Cidadania Italiana",
    tipo: "Cidadania Italiana",
    preco: 4500,
    status: "Ativo",
  },
  {
    sku: "CA-CID-025",
    nome: "Acompanhamento Familiar – Processo Compartilhado",
    tipo: "Cidadania Italiana",
    preco: 990,
    status: "Ativo",
  },
  {
    sku: "CA-CID-001",
    nome: "Diagnóstico e Checklist Inicial (Itália)",
    tipo: "Cidadania Italiana",
    preco: 247,
    status: "Ativo",
  },
  {
    sku: "CA-CID-006",
    nome: "Codice Fiscale + SPID",
    tipo: "Cidadania Italiana",
    preco: 280,
    status: "Ativo",
  },
  {
    sku: "CA-CID-003",
    nome: "Verificação/Atualização AIRE",
    tipo: "Cidadania Italiana",
    preco: 530,
    status: "Ativo",
  },
  {
    sku: "CA-CID-002D",
    nome: "Pasta + Checklist de Pendências",
    tipo: "Cidadania Italiana",
    preco: 390,
    status: "Ativo",
  },
  {
    sku: "CA-CID-002A",
    nome: "Revisão de Pasta (se necessário)",
    tipo: "Cidadania Italiana",
    preco: 690,
    status: "Ativo",
  },
  {
    sku: "CA-CID-002B",
    nome: "Atualização de Pasta (se necessário)",
    tipo: "Cidadania Italiana",
    preco: 890,
    status: "Ativo",
  },
  {
    sku: "CA-CID-018",
    nome: "Transcrição de Atos (se pendente)",
    tipo: "Cidadania Italiana",
    preco: 1588,
    status: "Ativo",
  },
  {
    sku: "CA-CID-016",
    nome: "Registro de Filhos Adicionais (upsell)",
    tipo: "Cidadania Italiana",
    preco: 1511,
    status: "Ativo",
  },
  {
    sku: "CA-CID-019",
    nome: "Declaração de Valor (upsell)",
    tipo: "Cidadania Italiana",
    preco: 3881,
    status: "Ativo",
  },
  {
    sku: "PACOTE-CROACIA-01",
    nome: "Pacote Cidadania Croata por Descendência",
    tipo: "Cidadania Croata",
    preco: 4000,
    status: "Novo",
  },
  {
    sku: "PACOTE-PT-01",
    nome: "Pacote Cidadania Portuguesa",
    tipo: "Cidadania Portuguesa",
    preco: 3800,
    status: "Novo",
  },
  {
    sku: "PACOTE-ES-01",
    nome: "Pacote Cidadania Espanhola",
    tipo: "Cidadania Espanhola",
    preco: 3200,
    status: "Novo",
  },
  {
    sku: "PACOTE-DE-01",
    nome: "Pacote Cidadania Alemã",
    tipo: "Cidadania Alemã",
    preco: 4200,
    status: "Novo",
  },
  {
    sku: "CA-CID-DE-001",
    nome: "Diagnóstico de Linha Alemã",
    tipo: "Cidadania Alemã",
    preco: 247,
    status: "Ativo",
  },
  {
    sku: "CA-CID-DE-002",
    nome: "Pesquisa e Montagem Documental (Alemã)",
    tipo: "Cidadania Alemã",
    preco: 1290,
    status: "Ativo",
  },
  {
    sku: "CA-CID-DE-003b",
    nome: "Acompanhamento de Protocolo (Alemã)",
    tipo: "Cidadania Alemã",
    preco: 890,
    status: "Ativo",
  },
  {
    sku: "PACOTE-PL-01",
    nome: "Pacote Cidadania Polonesa",
    tipo: "Cidadania Polonesa",
    preco: 3900,
    status: "Novo",
  },
  {
    sku: "PACOTE-RO-01",
    nome: "Pacote Cidadania Romena",
    tipo: "Cidadania Romena",
    preco: 3600,
    status: "Novo",
  },
  {
    sku: "PACOTE-EU-01",
    nome: "Pacote Cidadania Europeia Geral",
    tipo: "Cidadania Europeia Geral",
    preco: 3500,
    status: "Novo",
  },
  {
    sku: "NAT-BR-01",
    nome: "Pacote Naturalização Brasileira",
    tipo: "Naturalização Brasileira",
    preco: 900,
    status: "Novo",
  },
  {
    sku: "PACOTE-FR-01",
    nome: "Pacote Naturalização Francesa",
    tipo: "Naturalização Francesa",
    preco: 1000,
    status: "Novo",
  },
];

export const skuNome = (sku: string) => SKUS_REFERENCIA.find((s) => s.sku === sku)?.nome ?? sku;

const RADAR_EIXOS = ["Documentação", "Origem", "Conexões", "Elegibilidade", "Memória", "Legado"];
const radar = (v: number[]) => RADAR_EIXOS.map((k, i) => ({ k, v: v[i] }));

/**
 * Checklist_AppCliente + demais colunas de checklist da planilha
 * checklists_go_live_casos_clientes.xlsx (um bloco por caso).
 */
const checklist = (itens: string[], feitos: number) =>
  itens.map((item, i) => ({ item, feito: i < feitos }));

const CHECKLIST_GO_LIVE: Record<string, string[]> = {
  // CA-ITA-DANILO-PAI1985
  "CA-CID-IT-2026-002": [
    "Configurar jornada do caso italiano no app cliente (cards, etapas, prazos)",
    "Confirmar dados do reconhecimento de 1985 e cenário jurídico atual",
    "Mapear certidões italianas e brasileiras ligadas ao pai e à linha paterna",
    "Definir contrato e honorários do Clube Ancestral (caso italiano)",
    "Simular custos oficiais e fluxo Asaas para o caso italiano do Danilo",
  ],
  // CA-CRO-DANILO-LINHA_CROATA
  "CA-CID-HR-2026-001": [
    "Criar slot no app cliente para acompanhamento do caso croata",
    "Levantar árvore mínima da linha croata e hipóteses de transmissão",
    "Identificar documentos croatas/brasileiros necessários e fontes de busca",
    "Esboçar contrato específico ou aditivo para estudo croata",
    "Estimativa de taxas e honorários para cenário croata",
  ],
  // CA-BRA-AMIGO-NATURALIZACAO
  "CA-NAT-BR-2026-001": [
    "Preparar percurso desse caso no app (etapas, checklist e alertas)",
    "Coletar dados pessoais e histórico migratório do amigo",
    "Mapear documentos exigidos para naturalização brasileira",
    "Modelar contrato de honorários do Clube Ancestral para o caso",
    "Simular custos de taxas oficiais e honorários (naturalização)",
  ],
  // CA-ALE-DANILO-LINHA_ALEMA
  "CA-CID-DE-2026-001": [
    "Criar card no app cliente para caso alemão ligado ao Danilo",
    "Levantar árvore mínima da linha alemã com foco em transmissão",
    "Identificar documentos e órgãos (BVA, registros civis) relevantes",
    "Adequar contrato/planejamento para eventual processo alemão",
    "Simular cenários de custo/prazo com base nos artefatos alemães",
  ],
};

const CHECKLIST_PADRAO = [
  "Configurar jornada do caso no app cliente (cards, etapas, prazos)",
  "Criar slot no app cliente para acompanhamento do caso",
  "Preparar percurso desse caso no app (etapas, checklist e alertas)",
  "Definir contrato e honorários do Clube Ancestral",
  "Simular custos oficiais e fluxo Asaas para o caso",
];

const DOCS_PADRAO: Record<Pais, string[]> = {
  Itália: [
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
  Áustria: [
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
  Portugal: [
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
  Croácia: [
    "Procuração croata",
    "RG ou CNH",
    "CPF",
    "Certidões brasileiras em inteiro teor da linha Kluyber",
    "Desarquivamento de registros (cartórios SP)",
    "Certidões croatas do antenato",
    "Traduções juramentadas (croata)",
    "Apostilamentos do bloco documental",
    "Formulário consular (Consulado SP)",
    "Agendamento consular",
  ],
  Alemanha: [
    "Procuração alemã",
    "RG ou CNH",
    "CPF",
    "Certidões brasileiras da linha alemã",
    "Registros civis alemães do antenato",
    "Traduções juramentadas (alemão)",
    "Apostilamentos",
    "Formulário BVA (Feststellung / § 13 StAG)",
    "Acompanhamento de protocolo",
  ],
  França: [
    "Procuração / mandato",
    "RG ou CNH",
    "CPF",
    "Certidões brasileiras",
    "Comprovantes de residência e integração",
    "Traduções juramentadas (francês)",
    "Formulário de naturalização francesa",
  ],
  Brasil: [
    "RG ou CNH",
    "CPF",
    "Registro migratório (CRNM)",
    "Certidões de antecedentes",
    "Comprovante de residência",
    "Certidões de nascimento/casamento traduzidas",
    "Formulário de naturalização",
  ],
  Espanha: [
    "Procuração espanhola",
    "RG ou CNH",
    "CPF",
    "Certidões brasileiras",
    "Certidão do ascendente espanhol de origem",
    "Prova de exílio (quando aplicável)",
  ],
};

const docs = (pais: Pais, oks: number, parciais: number) =>
  DOCS_PADRAO[pais].map((item, i) => ({
    item,
    status: (i < oks ? "ok" : i < oks + parciais ? "parcial" : "pendente") as ItemStatus,
  }));

/* ---- MARCOS_JURIDICOS_SYNC ---- */
export const MARCOS_JURIDICOS: Record<
  Pais,
  { titulo: string; situacao: "aberta" | "condicionada" | "fechada"; nota: string }[]
> = {
  Itália: [
    {
      titulo: "Descendência (jus sanguinis) sem limite de gerações — Lei nº 91/1992",
      situacao: "aberta",
      nota: "Aberta, sem prazo; via judicial se ramo materno pré-1948 (unificação em 17/03/1861).",
    },
    {
      titulo: "Transcrição de atos no comune",
      situacao: "condicionada",
      nota: "Depende de cadeia documental completa e apostilamento.",
    },
  ],
  Áustria: [
    {
      titulo: "Reparação histórica — § 58c StbG (emenda de 2020)",
      situacao: "aberta",
      nota: "Vigente desde 01/09/2020, sem prazo para requerer; descendentes de perseguidos pelo nazismo.",
    },
    {
      titulo: "Dupla cidadania admitida nesta via",
      situacao: "aberta",
      nota: "Não exige renúncia à nacionalidade brasileira.",
    },
  ],
  Portugal: [
    {
      titulo: "Descendência direta — Lei nº 37/1981",
      situacao: "aberta",
      nota: "Via direta aberta, sem prazo; filhos e netos em linha direta.",
    },
    {
      titulo: "Via sefardita (Lei 30-A/2015)",
      situacao: "fechada",
      nota: "Não aceita novos pedidos desde 2024.",
    },
  ],
  Alemanha: [
    {
      titulo: "Art. 116, §2 da Grundgesetz / StAG § 15",
      situacao: "aberta",
      nota: "Reparação por perseguição entre 30/01/1933 e 08/05/1945; sem limite de gerações e sem prazo.",
    },
  ],
  Espanha: [
    {
      titulo: "Ley 20/2022 — Memória Democrática",
      situacao: "condicionada",
      nota: "Janela de 22/10/2022 a 22/10/2025 (prorrogável); via sefardita encerrada em 2019.",
    },
  ],
  Croácia: [
    {
      titulo: "Cidadania croata por descendência (Consulado SP)",
      situacao: "condicionada",
      nota: "Depende da confirmação da ancestralidade e da cadeia documental croata/brasileira.",
    },
  ],
  França: [
    {
      titulo: "Naturalização francesa por residência",
      situacao: "condicionada",
      nota: "Processo administrativo; pacote leve de acompanhamento.",
    },
  ],
  Brasil: [
    {
      titulo: "Naturalização brasileira (situação migratória)",
      situacao: "condicionada",
      nota: "Depende do histórico migratório e do registro CRNM regular.",
    },
  ],
};

const plano = (
  tipo: string,
  nome: string,
  formato: "à vista" | "recorrência" | "por etapas",
  skus: string[],
  id: string,
) => {
  const p = PARAMETROS[tipo];
  return {
    nome,
    formato,
    honorariosBase: p.honorarios,
    despesasPrevistas: p.despesas,
    taxasPrevistas: p.taxas,
    parcelas: `${p.parcelas}x (padrão PARAMETROS)`,
    skus,
    linkPagamento: `https://pagamento.exemplo/asaas/${id}`,
  };
};

export const CASOS: Caso[] = [
  {
    id: "CA-CID-IT-2026-001",
    cliente: "Giovanna Prade",
    iniciais: "GP",
    tipoProcesso: "Cidadania Italiana",
    pais: "Itália",
    baseJuridica: "Itália / cidadania — rota em validação documental (linha paterna Prade)",
    responsavel: "Tatiana",
    status: "em-proposta",
    dataInicio: "31/07/2026",
    etapaAtual: "diagnostico",
    progresso: 20,
    saude: "saudavel",
    proximaAcao: "Configurar jornada do caso italiano no app cliente (cards, etapas, prazos)",
    linhaAncestral: [
      { ano: "1861", texto: "Unificação do Reino da Itália — marco da Lei nº 91/1992" },
      {
        ano: "1980s",
        texto: "Pai reconhecido cidadão italiano — linha direta já constituída",
        uniao: true,
      },
      { ano: "2026", texto: "Início do caso CA-CID-IT-2026-001 — AIRE, pasta e acompanhamento" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "31/07/2026", realizado: true },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    // Nenhuma procuração iniciada e nenhum documento oficial vinculado até a formalização.
    checklistDocs: docs("Itália", 0, 0),
    checklistAppCliente: checklist(CHECKLIST_PADRAO, 1),
    proximosPassos: [
      {
        titulo: "Formalização do contrato CA-CID-023",
        sub: "Assessoria Completa de Cidadania Italiana — aguardando confirmação",
        tom: "urgent",
      },
      {
        titulo: "Escopo documental da Fase 1",
        sub: "Fase 1 integra a Assessoria Completa — não é produto avulso",
        tom: "info",
      },
      {
        titulo: "Procurações (português e italiano)",
        sub: "Não iniciadas — preparar após definição do órgão competente",
        tom: "soft",
      },
    ],
    achados: [
      {
        data: "10 ago 2026",
        titulo: "Linha paterna Prade conectada",
        desc: "Referências genealógicas localizadas — validação por documentos oficiais em andamento.",
      },
    ],
    radar: radar([45, 75, 55, 70, 40, 25]),
    marcosJuridicos: MARCOS_JURIDICOS["Itália"],
    plano: plano(
      "Cidadania Italiana",
      "Assessoria Completa de Cidadania Italiana",
      "por etapas",
      ["CA-CID-023", "CA-CID-002D", "CA-CID-003", "CA-CID-018", "CA-CID-016"],
      "CA-CID-IT-2026-001",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [
      { t: "📄 Proposta enviada", d: "31 jul 2026" },
      { t: "🌳 Linha paterna Prade conectada", d: "10 ago 2026" },
    ],
    observacoes:
      "Produto contratado: CA-CID-023 — Assessoria Completa de Cidadania Italiana. A Fase 1 é a abertura operacional dentro da assessoria. Procurações não iniciadas; nenhuma consulta externa realizada.",
  },
  {
    id: "CA-CID-AT-2026-002",
    cliente: "Ana Luiza Gomes Silveira",
    iniciais: "AS",
    tipoProcesso: "Cidadania Austríaca",
    pais: "Áustria",
    baseJuridica: "Áustria / reparação histórica — § 58c StbG",
    responsavel: "Tatiana",
    status: "em-proposta",
    dataInicio: "—",
    etapaAtual: "diagnostico",
    progresso: 10,
    saude: "atencao",
    proximaAcao: "Preencher parâmetros financeiros do caso austríaco (PARAMETROS pendentes)",
    linhaAncestral: [
      { ano: "1933–1945", texto: "Período de perseguição que fundamenta a via § 58c" },
      { ano: "2020", texto: "Emenda à StbG em vigor desde 01/09/2020", uniao: true },
      { ano: "2026", texto: "Início do caso CA-CID-AT-2026-002" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "—", realizado: false },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Áustria", 1, 2),
    checklistAppCliente: checklist(CHECKLIST_PADRAO, 0),
    proximosPassos: [
      {
        titulo: "Definir honorários e despesas",
        sub: "PARAMETROS: “Preencher manualmente”",
        tom: "urgent",
      },
      {
        titulo: "Levantar prova de perseguição",
        sub: "Requisito central do § 58c StbG",
        tom: "info",
      },
      { titulo: "Traduções juramentadas (alemão)", sub: "Após reunir certidões", tom: "soft" },
    ],
    achados: [],
    radar: radar([25, 60, 40, 72, 30, 15]),
    marcosJuridicos: MARCOS_JURIDICOS["Áustria"],
    plano: plano(
      "Cidadania Austríaca",
      "Cidadania Austríaca — parâmetros a preencher",
      "por etapas",
      [],
      "CA-CID-AT-2026-002",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [{ t: "🎯 Caso cadastrado em CASOS", d: "—" }],
    observacoes:
      "Linha da planilha CASOS sem ID/parâmetros — ID gerado pela convenção e valores a preencher.",
  },
  {
    id: "CA-CID-PT-2026-002",
    cliente: "João Marcelo Faria Moraes",
    iniciais: "JM",
    tipoProcesso: "Cidadania Portuguesa",
    pais: "Portugal",
    baseJuridica: "Portugal / cidadania — descendência direta (Lei nº 37/1981)",
    responsavel: "Tatiana",
    status: "em-proposta",
    dataInicio: "—",
    etapaAtual: "diagnostico",
    progresso: 15,
    saude: "atencao",
    proximaAcao: "Confirmar linha e SKU base (PACOTE-PT-01)",
    linhaAncestral: [
      { ano: "1981", texto: "Lei da Nacionalidade nº 37/1981 — base da via direta" },
      { ano: "2024", texto: "Encerramento da via sefardita (Lei 30-A/2015)", uniao: true },
      { ano: "2026", texto: "Início do caso CA-CID-PT-2026-002" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "—", realizado: false },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Portugal", 2, 2),
    checklistAppCliente: checklist(CHECKLIST_PADRAO, 0),
    proximosPassos: [
      {
        titulo: "Pacote Cidadania Portuguesa (PACOTE-PT-01)",
        sub: "Preço de referência R$ 3.800",
        tom: "urgent",
      },
      { titulo: "Certidão do antenato português", sub: "Conservatória de origem", tom: "info" },
      {
        titulo: "Requerimento à Conservatória Central",
        sub: "Após montagem do processo",
        tom: "soft",
      },
    ],
    achados: [],
    radar: radar([35, 65, 45, 68, 35, 20]),
    marcosJuridicos: MARCOS_JURIDICOS["Portugal"],
    plano: plano(
      "Cidadania Portuguesa",
      "Pacote Cidadania Portuguesa",
      "por etapas",
      ["PACOTE-PT-01"],
      "CA-CID-PT-2026-002",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [{ t: "🎯 Caso cadastrado em CASOS", d: "—" }],
    observacoes: "Honorários base R$ 5.300 (PARAMETROS) — ajustar conforme cartórios e ACP.",
  },
  {
    id: "CA-CID-HR-2026-001",
    cliente: "Danilo Kluyber de Souza",
    iniciais: "DK",
    tipoProcesso: "Cidadania Croata",
    pais: "Croácia",
    baseJuridica: "Croácia / descendência / Consulado SP",
    responsavel: "Tatiana",
    status: "em-andamento",
    dataInicio: "27/07/2026",
    etapaAtual: "pendencias",
    progresso: 45,
    saude: "saudavel",
    proximaAcao: "Criar slot no app cliente para acompanhamento do caso croata",
    linhaAncestral: [
      { ano: "—", texto: "Andrija Kluyber — casamento (Perdizes)" },
      { ano: "—", texto: "Catarina Kluyber — nascimento (Perdizes)", uniao: true },
      { ano: "—", texto: "João Kluyber — óbito (Tucuruvi)" },
      { ano: "2026", texto: "Pré-estudo da linha croata concluído" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "20/08/2025", realizado: true },
      { etapa: "pendencias", data: "27/07/2026", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Croácia", 4, 2),
    checklistAppCliente: checklist(CHECKLIST_GO_LIVE["CA-CID-HR-2026-001"], 2),
    proximosPassos: [
      {
        titulo: "Bloco de certidões BR/HR",
        sub: "R$ 1.050 previstos no pré-estudo",
        tom: "urgent",
      },
      { titulo: "Bloco de traduções", sub: "R$ 1.470 previstos", tom: "info" },
      {
        titulo: "Bloco de apostilas + taxa consular",
        sub: "R$ 455 + R$ 139,36 previstos",
        tom: "soft",
      },
    ],
    achados: [
      {
        data: "26 ago 2025",
        titulo: "Desarquivamento — Andrija Kluyber (Perdizes)",
        desc: "Registro localizado e desarquivado (R$ 235,63).",
      },
      {
        data: "20 ago 2025",
        titulo: "Certidão de óbito — João Kluyber (Tucuruvi)",
        desc: "Inteiro teor obtido (R$ 109,97).",
      },
      {
        data: "15 ago 2025",
        titulo: "Certidões de Perdizes localizadas",
        desc: "Casamento de Andrija e nascimento de Catarina em inteiro teor.",
      },
    ],
    radar: radar([65, 80, 60, 62, 55, 30]),
    marcosJuridicos: MARCOS_JURIDICOS["Croácia"],
    plano: plano(
      "Cidadania Croata",
      "Pacote Cidadania Croata por Descendência",
      "por etapas",
      ["PACOTE-CROACIA-01"],
      "CA-CID-HR-2026-001",
    ),
    financeiro: { pagoCliente: 269, desembolsadoClube: 554.54 },
    historico: [
      { t: "💳 Análise documental paga (R$ 269)", d: "29 ago 2025" },
      { t: "📄 Desarquivamento concluído", d: "26 ago 2025" },
      { t: "🎯 Caso base com pré-estudo", d: "27 jul 2026" },
    ],
    observacoes: "Caso base com pré-estudo (planilha CASOS).",
  },
  {
    id: "CA-CID-IT-2026-002",
    cliente: "Danilo Kluyber",
    iniciais: "DK",
    tipoProcesso: "Cidadania Italiana",
    pais: "Itália",
    baseJuridica: "Itália / linha paterna (pai reconhecido em 1985)",
    responsavel: "Tatiana",
    status: "em-proposta",
    dataInicio: "—",
    etapaAtual: "diagnostico",
    progresso: 10,
    saude: "critico",
    proximaAcao: "Configurar jornada do caso italiano no app cliente (cards, etapas, prazos)",
    linhaAncestral: [
      { ano: "1985", texto: "Reconhecimento do pai — base do caso" },
      { ano: "2026", texto: "Revisão do cenário jurídico atual" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "15/08/2026", realizado: false },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Itália", 1, 2),
    checklistAppCliente: checklist(CHECKLIST_GO_LIVE["CA-CID-IT-2026-002"], 0),
    proximosPassos: [
      {
        titulo: "Confirmar dados do reconhecimento de 1985",
        sub: "Prioridade go-live: Crítica · prazo 15/08/2026",
        tom: "urgent",
      },
      {
        titulo: "Mapear certidões da linha paterna",
        sub: "Documentos italianos e brasileiros",
        tom: "info",
      },
      { titulo: "Definir contrato e honorários", sub: "Caso italiano do Danilo", tom: "soft" },
    ],
    achados: [],
    radar: radar([30, 70, 50, 60, 35, 20]),
    marcosJuridicos: MARCOS_JURIDICOS["Itália"],
    plano: plano(
      "Cidadania Italiana",
      "Revisão / reconhecimento de cidadania italiana",
      "por etapas",
      ["CA-CID-001", "CA-CID-023"],
      "CA-CID-IT-2026-002",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [{ t: "🎯 Caso a iniciar (go-live)", d: "prazo 15 ago 2026" }],
    observacoes: "checklists_go_live: CA-ITA-DANILO-PAI1985 — prioridade Crítica.",
  },
  {
    id: "CA-CID-DE-2026-001",
    cliente: "Danilo Kluyber",
    iniciais: "DK",
    tipoProcesso: "Cidadania Alemã",
    pais: "Alemanha",
    baseJuridica: "Alemanha / linha alemã (a estudar) — Art. 116 §2 GG / StAG § 15",
    responsavel: "Tatiana",
    status: "em-proposta",
    dataInicio: "—",
    etapaAtual: "diagnostico",
    progresso: 8,
    saude: "atencao",
    proximaAcao: "Criar card no app cliente para caso alemão ligado ao Danilo",
    linhaAncestral: [
      { ano: "1933–1945", texto: "Período de perseguição (base do Art. 116 §2)" },
      { ano: "2026", texto: "Estudo de elegibilidade da linha alemã" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "10/09/2026", realizado: false },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Alemanha", 0, 2),
    checklistAppCliente: checklist(CHECKLIST_GO_LIVE["CA-CID-DE-2026-001"], 0),
    proximosPassos: [
      {
        titulo: "Diagnóstico de Linha Alemã (CA-CID-DE-001)",
        sub: "R$ 247 — Feststellung vs § 13 StAG",
        tom: "urgent",
      },
      {
        titulo: "Pesquisa e Montagem Documental (CA-CID-DE-002)",
        sub: "R$ 1.290 — certidões, tradução e apostila",
        tom: "info",
      },
      {
        titulo: "Acompanhamento de Protocolo (CA-CID-DE-003b)",
        sub: "R$ 890 — revisão final e agendamento",
        tom: "soft",
      },
    ],
    achados: [],
    radar: radar([20, 55, 40, 65, 30, 15]),
    marcosJuridicos: MARCOS_JURIDICOS["Alemanha"],
    plano: plano(
      "Cidadania Alemã",
      "Estudo de elegibilidade cidadania alemã",
      "por etapas",
      ["CA-CID-DE-001", "CA-CID-DE-002", "CA-CID-DE-003b"],
      "CA-CID-DE-2026-001",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [{ t: "🎯 Caso a iniciar (go-live)", d: "prazo 10 set 2026" }],
    observacoes: "checklists_go_live: CA-ALE-DANILO-LINHA_ALEMA — prioridade Média.",
  },
  {
    id: "CA-NAT-BR-2026-001",
    cliente: "Amigo do Danilo",
    iniciais: "AD",
    tipoProcesso: "Naturalização Brasileira",
    pais: "Brasil",
    baseJuridica: "Brasil / naturalização (situação migratória)",
    responsavel: "Tatiana",
    status: "em-proposta",
    dataInicio: "—",
    etapaAtual: "diagnostico",
    progresso: 12,
    saude: "atencao",
    proximaAcao: "Preparar percurso desse caso no app (etapas, checklist e alertas)",
    linhaAncestral: [{ ano: "2026", texto: "Histórico migratório em levantamento" }],
    linhaProcesso: [
      { etapa: "diagnostico", data: "20/08/2026", realizado: false },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Brasil", 1, 2),
    checklistAppCliente: checklist(CHECKLIST_GO_LIVE["CA-NAT-BR-2026-001"], 0),
    proximosPassos: [
      {
        titulo: "Coletar dados pessoais e histórico migratório",
        sub: "Prioridade go-live: Alta · prazo 20/08/2026",
        tom: "urgent",
      },
      { titulo: "Mapear documentos exigidos", sub: "Naturalização brasileira", tom: "info" },
      { titulo: "Modelar contrato de honorários", sub: "Pacote NAT-BR-01 (R$ 900)", tom: "soft" },
    ],
    achados: [],
    radar: radar([20, 40, 35, 55, 20, 10]),
    marcosJuridicos: MARCOS_JURIDICOS["Brasil"],
    plano: plano(
      "Naturalização Brasileira",
      "Pacote Naturalização Brasileira",
      "à vista",
      ["NAT-BR-01"],
      "CA-NAT-BR-2026-001",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [{ t: "🎯 Indicação registrada", d: "prazo 20 ago 2026" }],
    observacoes: "Relacionamento: Indicação (checklists_go_live).",
  },
  {
    id: "CA-NAT-FR-2026-001",
    cliente: "Amigo Francês",
    iniciais: "AF",
    tipoProcesso: "Naturalização Francesa",
    pais: "França",
    baseJuridica: "França / naturalização",
    responsavel: "Tatiana",
    status: "em-andamento",
    dataInicio: "27/07/2026",
    etapaAtual: "diagnostico",
    progresso: 25,
    saude: "saudavel",
    proximaAcao: "Confirmar entrada do pacote leve (PACOTE-FR-01)",
    linhaAncestral: [{ ano: "2026", texto: "Pré-estudo do pacote leve francês" }],
    linhaProcesso: [
      { etapa: "diagnostico", data: "27/07/2026", realizado: true },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("França", 2, 1),
    checklistAppCliente: checklist(CHECKLIST_PADRAO, 1),
    proximosPassos: [
      {
        titulo: "Entrada do pacote leve",
        sub: "Pagamento Pix registrado em PAGAMENTOS",
        tom: "urgent",
      },
      {
        titulo: "Reunir comprovantes de residência",
        sub: "Requisito do processo francês",
        tom: "info",
      },
      {
        titulo: "Traduções juramentadas (francês)",
        sub: "Após certidões brasileiras",
        tom: "soft",
      },
    ],
    achados: [],
    radar: radar([30, 45, 40, 60, 25, 15]),
    marcosJuridicos: MARCOS_JURIDICOS["França"],
    plano: plano(
      "Naturalização Francesa",
      "Pacote Naturalização Francesa",
      "à vista",
      ["PACOTE-FR-01"],
      "CA-NAT-FR-2026-001",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [{ t: "🎯 Pré-estudo iniciado", d: "27 jul 2026" }],
    observacoes: "Pacote leve (planilha CASOS).",
  },
  {
    /**
     * Caso-modelo persistente da entrega consultiva em duas fases.
     * Conteúdo de demonstração — nenhuma afirmação de elegibilidade confirmada.
     */
    id: "CA-ITA-SOPHI-PICCOLI",
    cliente: "Sophia Piccoli Santiago",
    iniciais: "SP",
    tipoProcesso: "Cidadania Italiana",
    pais: "Itália",
    baseJuridica: "Itália / cidadania — potencial em análise (cenário de via judicial: trisavô, 4ª geração)",
    viaSugerida: "judicial",

    responsavel: "Tatiana",
    status: "em-andamento",
    dataInicio: "07/08/2026",
    etapaAtual: "diagnostico",
    progresso: 30,
    saude: "saudavel",
    proximaAcao: "Preparar proposta de pesquisa documental completa na Itália",
    linhaAncestral: [
      {
        ano: "c. 1868",
        texto: "Giovanni Piccoli — Istrana, Treviso (IT) — dado de pesquisa inicial",
      },
      {
        ano: "c. 1866",
        texto: "Benedetta Bresolin — Padernello, Paese, Treviso (IT)",
        uniao: true,
      },
      {
        ano: "1872",
        texto: "Ângelo Piccoli — n. 30/08/1872, Noventa Vicentina, Vicenza (IT) — trisavô",
      },
      { ano: "—", texto: "João Picoli — bisavô, nascido no Brasil — registros a confirmar" },
      { ano: "—", texto: "Orlando Picoli — avô — casamento com Sandra da Silva Lopes a confirmar" },
      { ano: "—", texto: "Juliana Picoli — mãe — registros a confirmar" },
      { ano: "2006", texto: "Sophia Piccoli Santiago — requerente (n. 18/05/2006)" },
    ],
    linhaProcesso: [
      { etapa: "diagnostico", data: "07/08/2026", realizado: true },
      { etapa: "pendencias", data: "—", realizado: false },
      { etapa: "execucao", data: "—", realizado: false },
      { etapa: "complementos", data: "—", realizado: false },
      { etapa: "continuidade", data: "—", realizado: false },
    ],
    checklistDocs: docs("Itália", 1, 2),
    checklistAppCliente: checklist(CHECKLIST_PADRAO, 2),
    proximosPassos: [
      {
        titulo: "Pesquisa documental completa na Itália",
        sub: "Proposta a preparar — produto e valor a definir pela equipe",
        tom: "urgent",
      },
      {
        titulo: "Confirmar registros de Ângelo Piccoli",
        sub: "Comune de Noventa Vicentina (VI) — certidão de nascimento",
        tom: "info",
      },
      {
        titulo: "Reunir certidões brasileiras da cadeia",
        sub: "Inteiro teor, quando disponíveis",
        tom: "soft",
      },
    ],
    achados: [
      {
        data: "09 ago 2026",
        titulo: "Diagnóstico inicial — Fase 01",
        desc: "Linha Piccoli organizada até Ângelo Piccoli (Noventa Vicentina/VI) com nomes e localidades dos pais no Veneto — validação documental pendente.",
      },
    ],
    radar: radar([35, 55, 45, 50, 30, 20]),
    marcosJuridicos: MARCOS_JURIDICOS["Itália"],
    plano: plano(
      "Cidadania Italiana",
      "Entrega consultiva em duas fases (caso-modelo)",
      "por etapas",
      ["CA-CID-001", "CA-CID-002"],
      "CA-ITA-SOPHI-PICCOLI",
    ),
    financeiro: { pagoCliente: 0, desembolsadoClube: 0 },
    historico: [{ t: "📄 Fase 01 — diagnóstico inicial disponível", d: "09 ago 2026" }],
    observacoes:
      "Modelo de entrega consultiva com dados reais da linha Piccoli. Leitura inicial: sem cidadania reconhecida, elegibilidade confirmada, documentação localizada ou via definida.",
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
  const desembolsado = CASOS.reduce((s, c) => s + c.financeiro.desembolsadoClube, 0);
  const saldo = honorarios + despesas + taxas - pago;
  return {
    honorarios,
    despesas,
    taxas,
    pago,
    desembolsado,
    saldo,
    casos: CASOS.length,
    ticketMedio: Math.round(honorarios / CASOS.length),
  };
};

/* ---- Plano Legado (upsell — SKU CA-CID-025 / extensões familiares) ---- */
export const PLANO_LEGADO = {
  nome: "Plano Legado",
  descricao:
    "Acompanhamento Familiar – Processo Compartilhado (CA-CID-025) e extensões: Registro de Filhos Adicionais (CA-CID-016) e Declaração de Valor (CA-CID-019).",
  itens: [
    "Acompanhamento Familiar – Processo Compartilhado (R$ 990)",
    "Registro de Filhos Adicionais (R$ 1.511)",
    "Declaração de Valor (R$ 3.881)",
    "Codice Fiscale + SPID (R$ 280)",
  ],
  precoRef: 990,
};

/* ---- Integração de pagamentos (T-003 / T-017 / T-018 — checklist_prioridades) ---- */
export type FlagIntegracao = "configurado" | "em-teste" | "pendente";
export const INTEGRACOES: { tarefa: string; titulo: string; desc: string; flag: FlagIntegracao }[] =
  [
    {
      tarefa: "T-003",
      titulo: "Reconciliação Asaas ↔ Banco",
      desc: "Pipeline e rotina de conciliação (Pagamentos_Asaas + Reconciliação_Financeira). Criticidade: Alta · Financeiro/Automação.",
      flag: "em-teste",
    },
    {
      tarefa: "T-018",
      titulo: "Gatilho diário Apps Script",
      desc: "Rotina automática diária de conciliação dos recebimentos Asaas. Criticidade: Alta · Automação.",
      flag: "pendente",
    },
    {
      tarefa: "T-017",
      titulo: "Integração bot / CRM / app cliente ligada a pagamentos",
      desc: "Status de cobrança e liberação do caso no app cliente a partir do pagamento. Criticidade: Alta · Automação.",
      flag: "pendente",
    },
    {
      tarefa: "T-036",
      titulo: "Dados reais antes da reconciliação retroativa",
      desc: "Substituir planilhas template por dados reais (Financeiro · Criticidade Crítica).",
      flag: "em-teste",
    },
  ];

/* ---- Status App Cliente MVP vs fase 2 (T-026 / T-043 — Produto · Criticidade Crítica) ---- */
export const STATUS_APP: { tela: string; fase: "MVP" | "Fase 2"; ativo: boolean; nota: string }[] =
  [
    {
      tela: "Home — painel do caso",
      fase: "MVP",
      ativo: true,
      nota: "Progresso das 5 etapas + próximos passos",
    },
    { tela: "Jornada", fase: "MVP", ativo: true, nota: "Linha ancestral + linha do processo" },
    {
      tela: "Radar",
      fase: "MVP",
      ativo: true,
      nota: "6 dimensões + marcos jurídicos (MARCOS_JURIDICOS_SYNC)",
    },
    { tela: "Documentos", fase: "MVP", ativo: true, nota: "Checklist por item com upload" },
    { tela: "Legado", fase: "MVP", ativo: true, nota: "Achados + upsell CA-CID-025" },
    {
      tela: "Conta",
      fase: "MVP",
      ativo: true,
      nota: "Plano contratado (PARAMETROS/SKUS), pagamento e histórico",
    },
    {
      tela: "Gamificação — pontos e selos",
      fase: "Fase 2",
      ativo: false,
      nota: "T-026: decidir MVP x fase 2 da gamificação",
    },
    {
      tela: "Ranking familiar e conquistas",
      fase: "Fase 2",
      ativo: false,
      nota: "T-043: reincorporar lógica sem conflitar com o MVP",
    },
  ];
