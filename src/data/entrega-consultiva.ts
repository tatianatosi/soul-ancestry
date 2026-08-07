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

/* ------------------------- regras por país ------------------------- */

export type RegraPais = {
  pais: Pais;
  transmissao: string;
  viaPadrao: ViaProcesso;
  atencao: string;
  docsCriticos: string[];
  produtoEtapa02: string;
  skuEtapa02: string;
  valorEtapa02: number;
};

export const REGRAS_PAIS: Record<string, RegraPais> = {
  Itália: {
    pais: "Itália",
    transmissao: "Transmissão por descendência sem limite de gerações, desde que não haja interrupção da linha.",
    viaPadrao: "judicial",
    atencao:
      "Linhas com transmissão por mulher antes de 1948 e filas consulares longas costumam levar o caso ao Judiciário italiano.",
    docsCriticos: [
      "Certidão de nascimento do ancestral italiano",
      "Certidão de não naturalização",
      "Certidões brasileiras retificadas",
    ],
    produtoEtapa02: "Etapa 02 — Estudo aprofundado + organização inicial da pasta italiana",
    skuEtapa02: "CA-CID-002",
    valorEtapa02: 1436,
  },
  Portugal: {
    pais: "Portugal",
    transmissao:
      "Transmissão por descendência até netos, com exigência de vínculo efetivo à comunidade portuguesa em alguns cenários.",
    viaPadrao: "administrativa",
    atencao: "Prazos e exigências de vínculo mudaram nos últimos anos: a leitura documental define o enquadramento correto.",
    docsCriticos: ["Assento de nascimento português", "Certidões brasileiras integrais", "Comprovação de vínculo (quando exigida)"],
    produtoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via portuguesa",
    skuEtapa02: "CA-CID-PT-E02",
    valorEtapa02: 1290,
  },
  Espanha: {
    pais: "Espanha",
    transmissao: "Transmissão por descendência com janelas legais específicas (Ley de Memoria Democrática e opções ordinárias).",
    viaPadrao: "administrativa",
    atencao: "Vários caminhos possuem prazo de adesão — a definição da janela correta é decisiva.",
    docsCriticos: ["Certidão espanhola do ancestral", "Documentos de saída/entrada", "Certidões brasileiras atualizadas"],
    produtoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via espanhola",
    skuEtapa02: "CA-CID-ES-E02",
    valorEtapa02: 1190,
  },
  Alemanha: {
    pais: "Alemanha",
    transmissao:
      "Transmissão por descendência com regras distintas conforme data de nascimento e perda de nacionalidade do ancestral.",
    viaPadrao: "administrativa",
    atencao: "Casos de perda por naturalização ou por regras de gênero anteriores a 1975 exigem enquadramento próprio (StAG).",
    docsCriticos: ["Registro alemão do ancestral", "Prova de não perda da nacionalidade", "Certidões brasileiras integrais"],
    produtoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via alemã",
    skuEtapa02: "CA-CID-DE-E02",
    valorEtapa02: 1290,
  },
  Croácia: {
    pais: "Croácia",
    transmissao: "Transmissão por descendência com comprovação da linha e vínculo com a Croácia.",
    viaPadrao: "administrativa",
    atencao: "Documentação de origem costuma exigir pesquisa em arquivos locais.",
    docsCriticos: ["Registro croata do ancestral", "Cadeia completa de certidões", "Tradução juramentada"],
    produtoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via croata",
    skuEtapa02: "CA-CID-HR-E02",
    valorEtapa02: 1290,
  },
};

export const REGRA_GENERICA: RegraPais = {
  pais: "Itália",
  transmissao: "Transmissão por descendência, com regras específicas do país de origem aplicáveis à sua linha.",
  viaPadrao: "a-definir",
  atencao: "A definição da via depende da leitura documental completa da linha.",
  docsCriticos: ["Registro do ancestral no país de origem", "Cadeia de certidões brasileiras", "Documento de identidade atual"],
  produtoEtapa02: "Estudo aprofundado de elegibilidade + desenho da via do seu caso",
  skuEtapa02: "CA-CID-GEN-E02",
  valorEtapa02: 1290,
};

export const regraPais = (pais: Pais): RegraPais => REGRAS_PAIS[pais] ?? { ...REGRA_GENERICA, pais };

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

/** Escopo padrão da Etapa 02 (SKU CA-CID-002). */
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
  suggestedRoute: "judicial",
  routeDisclaimer: ROUTE_DISCLAIMER,
  stage1Status: "ETAPA_02_PENDENTE",
  stage1DeliveredAt: "Entrega 1 concluída",
  isDemo: true,
  lineage: ["Avô italiano (nascido na Itália)", "Filha — nascida no Brasil", "Sophi — neta, pessoa-foco"],
  initialReading:
    "A linha de transmissão é curta e direta: avô italiano, filha brasileira e você. Isso é um bom sinal — quanto menos gerações, menor o volume documental e menor o risco de divergências de grafia.",
  eligibilitySummary: {
    viable: true,
    scenario: "Cenário mais provável: via judicial na Itália",
    text:
      "Pela leitura inicial, há viabilidade para o reconhecimento. O caminho mais provável hoje é o judicial, principalmente pela fila consular e pelo perfil da sua linha. Não é um problema: é apenas o trajeto com prazo mais previsível para o seu caso.",
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
    sku: "CA-CID-IT-E02",
    productName: "Estudo aprofundado de elegibilidade + desenho da via italiana judicial",
    description:
      "Análise completa da sua linha, verificação documental item a item e desenho do caminho jurídico com prazos, custos e ordem das providências.",
    benefit: "Você sai com clareza jurídica e documental e um plano concreto — sem precisar de reunião para começar.",
    price: 1436,
    currency: "R$",
    deliveryTime: "10 dias úteis",
    paymentUrl: "https://pagamento.clubeancestral.com/etapa-02-italia",
    paymentStatus: "pendente",
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
  const regra = regraPais(caso.pais);
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
    suggestedRoute: regra.viaPadrao,
    routeDisclaimer: ROUTE_DISCLAIMER,
    stage1Status: pago ? "ETAPA_02_EM_ANDAMENTO" : "ETAPA_02_PENDENTE",
    stage1DeliveredAt: caso.dataInicio,
    lineage: linha.length ? linha : ["Linha em levantamento"],
    initialReading: `${regra.transmissao} ${regra.atencao}`,
    eligibilitySummary: {
      viable: true,
      scenario: `Cenário mais provável: ${VIA_LABEL[regra.viaPadrao]}`,
      text: `Pela leitura inicial da sua linha (${caso.tipoProcesso}), há viabilidade para seguir. ${regra.atencao}`,
    },
    documentChecklist: [
      ...tem.map((d) => ({ item: d.item, situacao: "tem" as const })),
      ...parciais.map((d) => ({ item: d.item, situacao: "falta" as const })),
      ...criticos.map((d) => ({ item: d.item, situacao: "critico" as const })),
      ...regra.docsCriticos.slice(0, 1).map((item) => ({ item, situacao: "critico" as const })),
    ].slice(0, 6),
    stage2Offer: {
      offerId: `OFR-${caso.id}-E02`,
      sku: regra.skuEtapa02,
      productName: regra.produtoEtapa02,
      description:
        "Análise completa da sua linha, verificação documental item a item e desenho do caminho com prazos, custos e ordem das providências.",
      benefit: "Clareza jurídica e documental e um plano concreto para avançar, sem depender de reunião.",
      price: regra.valorEtapa02,
      currency: "R$",
      deliveryTime: "10 dias úteis",
      paymentUrl: caso.plano.linkPagamento || "https://pagamento.clubeancestral.com/etapa-02",
      paymentStatus: pago ? "confirmado" : "pendente",
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
