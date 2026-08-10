/**
 * Ancestral Canvas — Entrega Consultiva (template parametrizável).
 *
 * Fluxo: Etapa 01 (leitura inicial + elegibilidade sintética + checklist mínimo)
 * entregue dentro do app, com CTA direto para a Etapa 02 paga.
 *
 * Uma nova entrega é criada apenas trocando os dados do objeto do caso
 * (país, linha, checklist, via sugerida, SKU, produto, valor, prazo e link de
 * pagamento) — nenhum componente carrega valores fixos.
 *
 * O caso "Sophi Piccoli" é o modelo de demonstração (dados ilustrativos).
 */

import type { Caso, Pais } from "./casos";

export type ViaProcesso = "administrativa" | "judicial" | "a-definir";

/** Estados operacionais/visuais da entrega. */
export type EstadoEntrega =
  | "ETAPA_01_ENTREGUE"
  | "ETAPA_02_PENDENTE"
  | "ETAPA_02_LINK_ACESSADO"
  | "ETAPA_02_PAGA"
  | "ETAPA_02_EM_ANDAMENTO"
  | "ETAPA_02_CONCLUIDA";

export const ESTADOS_ENTREGA: EstadoEntrega[] = [
  "ETAPA_01_ENTREGUE",
  "ETAPA_02_PENDENTE",
  "ETAPA_02_LINK_ACESSADO",
  "ETAPA_02_PAGA",
  "ETAPA_02_EM_ANDAMENTO",
  "ETAPA_02_CONCLUIDA",
];

export const ESTADO_ENTREGA_LABEL: Record<EstadoEntrega, string> = {
  ETAPA_01_ENTREGUE: "Etapa 01 entregue",
  ETAPA_02_PENDENTE: "Etapa 02 pendente",
  ETAPA_02_LINK_ACESSADO: "Condições visualizadas",
  ETAPA_02_PAGA: "Etapa 02 paga",
  ETAPA_02_EM_ANDAMENTO: "Etapa 02 em andamento",
  ETAPA_02_CONCLUIDA: "Etapa 02 concluída",
};

export type PaymentStatus = "pendente" | "link_acessado" | "confirmado" | "recusado";

export const VIA_LABEL: Record<ViaProcesso, string> = {
  administrativa: "via administrativa",
  judicial: "via judicial",
  "a-definir": "via a definir",
};

export const ROUTE_DISCLAIMER =
  "Indicação preliminar: a via definitiva será validada documental e tecnicamente na Etapa 02.";

/* ------------------- regras por país + via sugerida ------------------- */

export type RegraPais = {
  pais: Pais;
  via: ViaProcesso;
  transmissao: string;
  viaPadrao: ViaProcesso;
  atencao: string;
  docsCriticos: string[];
  produtoEtapa02: string;
  skuEtapa02: string;
  descricaoEtapa02: string;
  valorEtapa02: number;
  prazoEtapa02: string;
  incluiEtapa02: string[];
  naoIncluiEtapa02: string[];
};

/** Escopo padrão do estudo aprofundado (via administrativa / a definir). */
export const ETAPA02_INCLUI = [
  "Análise da cadeia documental",
  "Checklist técnico de pendências",
  "Leitura de riscos de grafia, datas e naturalização",
  "Organização inicial da pasta",
  "Plano de ação priorizado",
  "Entrega pelo app e PDF em até 10 dias úteis",
];

export const ETAPA02_NAO_INCLUI = [
  "Protocolo judicial",
  "Honorários advocatícios",
  "Emissão de certidões, traduções, apostilas e retificações",
  "Taxas públicas",
  "Acompanhamento completo do processo",
];

/** Escopo da assessoria completa por via judicial (Itália). */
export const ETAPA02_JUDICIAL_INCLUI = [
  "Organização e auditoria completa da cadeia documental",
  "Coordenação de retificações, traduções juramentadas e apostilamentos",
  "Intermediação e coordenação com advogado parceiro na Itália",
  "Preparação e protocolo do processo judicial no tribunal competente",
  "Acompanhamento do processo até o reconhecimento (sentença)",
  "Atualizações periódicas pelo app e canal direto com a equipe",
];

export const ETAPA02_JUDICIAL_NAO_INCLUI = [
  "Honorários do advogado italiano (contratados à parte, com valor informado antes)",
  "Taxa judicial e taxa de protocolo no tribunal italiano",
  "Emolumentos de cartórios, traduções, apostilas e retificações",
  "Taxas consulares e emissão de passaporte após o reconhecimento",
  "Despesas de viagem ou representação presencial extraordinária",
];

type BasePais = Pick<RegraPais, "pais" | "transmissao" | "viaPadrao" | "atencao" | "docsCriticos">;
type OfertaVia = Pick<
  RegraPais,
  "produtoEtapa02" | "skuEtapa02" | "descricaoEtapa02" | "valorEtapa02" | "prazoEtapa02" | "incluiEtapa02" | "naoIncluiEtapa02"
>;

const estudoAprofundado = (produto: string, sku: string, valor: number): OfertaVia => ({
  produtoEtapa02: produto,
  skuEtapa02: sku,
  descricaoEtapa02:
    "Conferência técnica da linha familiar, verificação dos documentos disponíveis, mapa de pendências, identificação de divergências, organização inicial da pasta e plano de ação priorizado.",
  valorEtapa02: valor,
  prazoEtapa02: "10 dias úteis",
  incluiEtapa02: ETAPA02_INCLUI,
  naoIncluiEtapa02: ETAPA02_NAO_INCLUI,
});

const montar = (base: BasePais, ofertas: Record<ViaProcesso, OfertaVia>): Record<ViaProcesso, RegraPais> => ({
  administrativa: { ...base, via: "administrativa", ...ofertas.administrativa },
  judicial: { ...base, via: "judicial", ...ofertas.judicial },
  "a-definir": { ...base, via: "a-definir", ...ofertas["a-definir"] },
});

const ITALIA_BASE: BasePais = {
  pais: "Itália",
  transmissao: "Transmissão por descendência sem limite de gerações, desde que não haja interrupção da linha.",
  viaPadrao: "judicial",
  atencao:
    "Linhas com transmissão por mulher antes de 1948, gerações mais distantes e filas consulares longas costumam levar o caso ao Judiciário italiano.",
  docsCriticos: [
    "Certidão de nascimento do ancestral italiano",
    "Certidão de não naturalização",
    "Certidões brasileiras retificadas",
  ],
};

const ITALIA_ADMINISTRATIVA = estudoAprofundado(
  "Etapa 02 — Estudo aprofundado + organização inicial da pasta italiana",
  "CA-CID-002",
  1436,
);

const ITALIA_JUDICIAL: OfertaVia = {
  produtoEtapa02: "Assessoria Completa de Cidadania Italiana — Via Judicial",
  skuEtapa02: "CA-CID-023-JUD",
  descricaoEtapa02:
    "Condução completa do reconhecimento pela via judicial: auditoria e organização documental, coordenação de retificações, traduções e apostilamentos, intermediação com advogado parceiro na Itália, protocolo do processo judicial e acompanhamento até o reconhecimento.",
  valorEtapa02: 9800,
  prazoEtapa02: "início em até 15 dias úteis após a contratação",
  incluiEtapa02: ETAPA02_JUDICIAL_INCLUI,
  naoIncluiEtapa02: ETAPA02_JUDICIAL_NAO_INCLUI,
};

export const REGRAS_PAIS: Record<string, Record<ViaProcesso, RegraPais>> = {
  Itália: montar(ITALIA_BASE, {
    administrativa: ITALIA_ADMINISTRATIVA,
    judicial: ITALIA_JUDICIAL,
    "a-definir": ITALIA_ADMINISTRATIVA,
  }),
  Portugal: montar(
    {
      pais: "Portugal",
      transmissao:
        "Transmissão por descendência até netos, com exigência de vínculo efetivo à comunidade portuguesa em alguns cenários.",
      viaPadrao: "administrativa",
      atencao:
        "Prazos e exigências de vínculo mudaram nos últimos anos: a leitura documental define o enquadramento correto.",
      docsCriticos: [
        "Assento de nascimento português",
        "Certidões brasileiras integrais",
        "Comprovação de vínculo (quando exigida)",
      ],
    },
    {
      administrativa: estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via portuguesa",
        "CA-CID-PT-E02",
        1290,
      ),
      judicial: estudoAprofundado(
        "Estudo aprofundado + desenho da via portuguesa com contencioso",
        "CA-CID-PT-E02-JUD",
        1690,
      ),
      "a-definir": estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via portuguesa",
        "CA-CID-PT-E02",
        1290,
      ),
    },
  ),
  Espanha: montar(
    {
      pais: "Espanha",
      transmissao: "Transmissão por descendência com janelas legais específicas (Ley de Memoria Democrática e opções ordinárias).",
      viaPadrao: "administrativa",
      atencao: "Vários caminhos possuem prazo de adesão — a definição da janela correta é decisiva.",
      docsCriticos: ["Certidão espanhola do ancestral", "Documentos de saída/entrada", "Certidões brasileiras atualizadas"],
    },
    {
      administrativa: estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via espanhola",
        "CA-CID-ES-E02",
        1190,
      ),
      judicial: estudoAprofundado(
        "Estudo aprofundado + desenho da via espanhola com contencioso",
        "CA-CID-ES-E02-JUD",
        1590,
      ),
      "a-definir": estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via espanhola",
        "CA-CID-ES-E02",
        1190,
      ),
    },
  ),
  Alemanha: montar(
    {
      pais: "Alemanha",
      transmissao:
        "Transmissão por descendência com regras distintas conforme data de nascimento e perda de nacionalidade do ancestral.",
      viaPadrao: "administrativa",
      atencao: "Casos de perda por naturalização ou por regras de gênero anteriores a 1975 exigem enquadramento próprio (StAG).",
      docsCriticos: ["Registro alemão do ancestral", "Prova de não perda da nacionalidade", "Certidões brasileiras integrais"],
    },
    {
      administrativa: estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via alemã",
        "CA-CID-DE-E02",
        1290,
      ),
      judicial: estudoAprofundado(
        "Estudo aprofundado + desenho da via alemã com contencioso",
        "CA-CID-DE-E02-JUD",
        1690,
      ),
      "a-definir": estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via alemã",
        "CA-CID-DE-E02",
        1290,
      ),
    },
  ),
  Croácia: montar(
    {
      pais: "Croácia",
      transmissao: "Transmissão por descendência com comprovação da linha e vínculo com a Croácia.",
      viaPadrao: "administrativa",
      atencao: "Documentação de origem costuma exigir pesquisa em arquivos locais.",
      docsCriticos: ["Registro croata do ancestral", "Cadeia completa de certidões", "Tradução juramentada"],
    },
    {
      administrativa: estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via croata",
        "CA-CID-HR-E02",
        1290,
      ),
      judicial: estudoAprofundado(
        "Estudo aprofundado + desenho da via croata com contencioso",
        "CA-CID-HR-E02-JUD",
        1690,
      ),
      "a-definir": estudoAprofundado(
        "Estudo aprofundado de elegibilidade + desenho da via croata",
        "CA-CID-HR-E02",
        1290,
      ),
    },
  ),
};

export const REGRA_GENERICA: RegraPais = {
  pais: "Itália",
  via: "a-definir",
  transmissao: "Transmissão por descendência, com regras específicas do país de origem aplicáveis à sua linha.",
  viaPadrao: "a-definir",
  atencao: "A definição da via depende da leitura documental completa da linha.",
  docsCriticos: ["Registro do ancestral no país de origem", "Cadeia de certidões brasileiras", "Documento de identidade atual"],
  ...estudoAprofundado("Estudo aprofundado de elegibilidade + desenho da via do seu caso", "CA-CID-GEN-E02", 1290),
};

/**
 * Regra aplicável ao caso: depende do país **e** da via sugerida.
 * Sem via informada, usa a via padrão do país.
 */
export const regraPais = (pais: Pais, via?: ViaProcesso): RegraPais => {
  const porVia = REGRAS_PAIS[pais];
  if (!porVia) return { ...REGRA_GENERICA, pais, via: via ?? "a-definir" };
  return porVia[via ?? porVia["a-definir"].viaPadrao];
};


/* --------------------------- modelo de dados --------------------------- */

export type ChecklistSituacao = "tem" | "falta" | "critico";

export const CHECKLIST_LABEL: Record<ChecklistSituacao, string> = {
  tem: "Já temos",
  falta: "Falta",
  critico: "Crítico",
};

export type Stage2Offer = {
  offerId: string;
  sku: string;
  productName: string;
  description: string;
  benefit: string;
  price: number;
  currency: string;
  deliveryTime: string;
  paymentUrl: string;
  paymentStatus: PaymentStatus;
  /** blocos de escopo (opcionais) */
  included?: string[];
  notIncluded?: string[];
};




export type EntregaConsultiva = {
  caseId: string;
  clientId: string;
  clientName: string;
  clientFirstName: string;
  country: Pais;
  citizenshipType: string;
  suggestedRoute: ViaProcesso;
  routeDisclaimer: string;
  stage1Status: EstadoEntrega;
  stage1DeliveredAt: string;
  isDemo?: boolean;
  /** bloco 1 — leitura inicial da linha */
  lineage: string[];
  initialReading: string;
  /** bloco 2 — elegibilidade sintética */
  eligibilitySummary: { viable: boolean; scenario: string; text: string };
  /** bloco 3 — checklist mínimo */
  documentChecklist: { item: string; situacao: ChecklistSituacao }[];
  /** bloco 4 — próximo passo pago */
  stage2Offer: Stage2Offer;
  /** metadados do relatório */
  report: { reportId: string; reportVersion: string; generatedAt: string; exportStatus: "nao_exportado" | "exportado" };
};

export const money = (currency: string, value: number) =>
  `${currency} ${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

/** Caso modelo (dados ilustrativos, sem informação real de cliente). */
export const CASO_MODELO: EntregaConsultiva = {
  caseId: "CA-CID-IT-MODELO-001",
  clientId: "CLI-MODELO-SOPHI",
  clientName: "Sophi Piccoli",
  clientFirstName: "Sophi",
  country: "Itália",
  citizenshipType: "Cidadania Italiana",
  suggestedRoute: "a-definir",
  routeDisclaimer: ROUTE_DISCLAIMER,
  stage1Status: "ETAPA_02_PENDENTE",
  stage1DeliveredAt: "Entrega 1 concluída",
  isDemo: true,
  lineage: ["Avô italiano (nascido na Itália)", "Filha — nascida no Brasil", "Sophi — neta, pessoa-foco"],
  initialReading:
    "A linha de transmissão é curta e direta: avô italiano, filha brasileira e você. Isso é um bom sinal — quanto menos gerações, menor o volume documental e menor o risco de divergências de grafia.",
  eligibilitySummary: {
    viable: true,
    scenario: "Cenário mais provável: reconhecimento da cidadania italiana por descendência",
    text:
      "Pela leitura inicial, há viabilidade para o reconhecimento. A hipótese de via judicial será validada a partir da conferência documental da Etapa 02.",
  },
  documentChecklist: [
    { item: "Identificação do ancestral italiano", situacao: "tem" },
    { item: "Certidões brasileiras da linha (nascimento e casamento)", situacao: "tem" },
    { item: "Certidão de nascimento italiana do ancestral", situacao: "critico" },
    { item: "Certidão de não naturalização", situacao: "critico" },
    { item: "Retificações de grafia nas certidões brasileiras", situacao: "falta" },
  ],
  stage2Offer: {
    offerId: "OFR-IT-E02-001",
    sku: "CA-CID-002",
    productName: "Etapa 02 — Estudo aprofundado + organização inicial da pasta italiana",
    description:
      "Conferência técnica da linha familiar, verificação dos documentos já disponíveis, mapa de pendências, identificação de divergências, organização inicial da pasta e plano de ação para validar a estratégia de cidadania italiana, inclusive a hipótese de via judicial quando aplicável.",
    benefit: "Você sai com clareza documental, pendências mapeadas e um plano de ação priorizado — sem depender de reunião.",
    price: 1436,
    currency: "R$",
    deliveryTime: "10 dias úteis",
    paymentUrl: import.meta.env["VITE_ETAPA02_PAYMENT_URL"] ?? "https://pagamento.clubeancestral.com/etapa-02-italia",
    paymentStatus: "pendente",
    included: ETAPA02_INCLUI,
    notIncluded: ETAPA02_NAO_INCLUI,
  },
  report: {
    reportId: "REL-MODELO-SOPHI",
    reportVersion: "v1.0",
    generatedAt: "07/08/2026",
    exportStatus: "nao_exportado",
  },
};

/** Gera a entrega consultiva a partir de um caso do Canvas (template reaproveitável). */
export function entregaByCaso(caso: Caso): EntregaConsultiva {
  /** Oferta: só muda quando o caso tem via definida; sem isso mantém a oferta padrão do país. */
  const via: ViaProcesso = caso.viaSugerida ?? "a-definir";
  const regra = regraPais(caso.pais, via);
  const viaExibida: ViaProcesso = caso.viaSugerida ?? regra.viaPadrao;

  const linha = caso.linhaAncestral.slice(0, 4).map((l) => `${l.texto} · ${l.ano}`);
  const criticos = caso.checklistDocs.filter((d) => d.status === "pendente").slice(0, 3);
  const tem = caso.checklistDocs.filter((d) => d.status === "ok").slice(0, 2);
  const parciais = caso.checklistDocs.filter((d) => d.status === "parcial").slice(0, 2);
  const pago = caso.status === "proposta-aceita";

  return {
    caseId: caso.id,
    clientId: `CLI-${caso.id}`,
    clientName: caso.cliente,
    clientFirstName: caso.cliente.split(" ")[0],
    country: caso.pais,
    citizenshipType: caso.tipoProcesso,
    suggestedRoute: via,
    routeDisclaimer: ROUTE_DISCLAIMER,
    stage1Status: pago ? "ETAPA_02_EM_ANDAMENTO" : "ETAPA_02_PENDENTE",
    stage1DeliveredAt: caso.dataInicio,
    lineage: linha.length ? linha : ["Linha em levantamento"],
    initialReading: `${regra.transmissao} ${regra.atencao}`,
    eligibilitySummary: {
      viable: true,
      scenario: `Cenário mais provável: ${VIA_LABEL[via]}`,
      text: `Pela leitura inicial da sua linha (${caso.tipoProcesso}), há viabilidade para seguir. ${regra.atencao}`,
    },
    documentChecklist: [
      ...tem.map((d) => ({ item: d.item, situacao: "tem" as const })),
      ...parciais.map((d) => ({ item: d.item, situacao: "falta" as const })),
      ...criticos.map((d) => ({ item: d.item, situacao: "critico" as const })),
      ...regra.docsCriticos.slice(0, 1).map((item) => ({ item, situacao: "critico" as const })),
    ].slice(0, 6),
    stage2Offer: {
      offerId: `OFR-${caso.id}-E02-${via.toUpperCase()}`,
      sku: regra.skuEtapa02,
      productName: regra.produtoEtapa02,
      description: regra.descricaoEtapa02,
      benefit:
        via === "judicial"
          ? "Você tem o caso conduzido de ponta a ponta: documentação organizada, advogado parceiro na Itália e acompanhamento até o reconhecimento."
          : "Clareza jurídica e documental e um plano concreto para avançar, sem depender de reunião.",
      price: regra.valorEtapa02,
      currency: "R$",
      deliveryTime: regra.prazoEtapa02,
      paymentUrl: caso.plano.linkPagamento || "https://pagamento.clubeancestral.com/etapa-02",
      paymentStatus: pago ? "confirmado" : "pendente",
      included: regra.incluiEtapa02,
      notIncluded: regra.naoIncluiEtapa02,
    },

    report: {
      reportId: `REL-${caso.id}`,
      reportVersion: "v1.0",
      generatedAt: caso.dataInicio,
      exportStatus: "nao_exportado",
    },
  };
}

/** Texto-base de WhatsApp (envio manual pela equipe). */
export function textoWhatsapp(e: EntregaConsultiva): string {
  const o = e.stage2Offer;
  return [
    `Oi, ${e.clientFirstName}! Tudo bem?`,
    "",
    "Sua *Entrega 1 — Leitura inicial do seu caso* já está disponível no app do Clube Ancestral.",
    `Nela você encontra a leitura da sua linha em ${e.country}, a síntese de elegibilidade e o checklist mínimo de documentos.`,
    "",
    `Pelo que identificamos até aqui, há sinais de que a ${VIA_LABEL[e.suggestedRoute]} pode ser a alternativa mais aderente ao seu caso. Essa é uma indicação preliminar, que será validada documental e tecnicamente na próxima etapa.`,
    "",
    `O próximo passo recomendado é a *Etapa 02 — ${o.productName}* (${money(o.currency, o.price)}, entrega em até ${o.deliveryTime}).`,
    "",
    'Se quiser avançar, toque em "Quero avançar para a Etapa 02" dentro do app ou use este link:',
    o.paymentUrl,
    "",
    "Qualquer dúvida, pode responder por aqui mesmo.",
  ].join("\n");
}
