/**
 * Matriz de preços resgatados (prompt v2.1) — fixture/spec pura.
 *
 * Espelha o que já foi semeado em `price_catalog_rescued` (migrations
 * 20260904180000 / 20260909000000). Não homologa, não cobra, não escreve.
 * Estados bloqueados nunca viram oferta/link.
 */

import {
  bloqueiaExposicaoComercial,
  itemPermitidoEmRecomendacaoComercial,
  podeExporPrecoComercialmente,
  type EstadoPrecoResgatado,
} from "@/lib/cadeia-catalogo-planejador";

export type PrecoResgatadoSpec = {
  chave: string;
  itemId: string | null;
  countryCode: string | null;
  priceComponent: "honorarios" | "despesas" | "taxas" | "parcelas_padrao";
  amount: number | null;
  priceStatus: EstadoPrecoResgatado;
  caseOnly: boolean;
  notes: string | null;
  /** Caso real quando CONDICAO_PARTICULAR_DE_CASO. */
  caseId?: string | null;
};

function refPais(
  countryCode: string,
  component: PrecoResgatadoSpec["priceComponent"],
  amount: number,
  notes: string | null = null,
): PrecoResgatadoSpec {
  return {
    chave: `${countryCode}:${component}`,
    itemId: null,
    countryCode,
    priceComponent: component,
    amount,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes,
  };
}

/** Referências por país/processo (honorários + despesas + taxas + parcelas). */
export const PRECOS_PAIS_RESGATADOS: readonly PrecoResgatadoSpec[] = [
  refPais("IT", "honorarios", 4700, "Divergência IT 4500/4700/4800 — não escolher automaticamente"),
  refPais("IT", "despesas", 1600),
  refPais("IT", "taxas", 500),
  refPais("IT", "parcelas_padrao", 6),
  refPais("HR", "honorarios", 4000),
  refPais("HR", "despesas", 1800),
  refPais("HR", "taxas", 600),
  refPais("HR", "parcelas_padrao", 4),
  refPais("PT", "honorarios", 4800, "Divergência PT 3800/4400/4800 — não escolher automaticamente"),
  refPais("PT", "despesas", 1400),
  refPais("PT", "taxas", 450),
  refPais("PT", "parcelas_padrao", 10),
  refPais("ES", "honorarios", 3200),
  refPais("ES", "despesas", 1200),
  refPais("ES", "taxas", 400),
  refPais("ES", "parcelas_padrao", 5),
  refPais("DE", "honorarios", 4200),
  refPais("DE", "despesas", 1500),
  refPais("DE", "taxas", 500),
  refPais("DE", "parcelas_padrao", 6),
  refPais("PL", "honorarios", 3900),
  refPais("PL", "despesas", 1500),
  refPais("PL", "taxas", 450),
  refPais("PL", "parcelas_padrao", 6),
  refPais("RO", "honorarios", 3600),
  refPais("RO", "despesas", 1400),
  refPais("RO", "taxas", 450),
  refPais("RO", "parcelas_padrao", 6),
  refPais("AT", "honorarios", 4800, "Não confundir com Ana Luiza R$ 9.600"),
  refPais("AT", "despesas", 1800),
  refPais("AT", "taxas", 600),
  refPais("AT", "parcelas_padrao", 10),
  refPais("BR", "honorarios", 900, "Naturalização brasileira"),
  refPais("BR", "despesas", 300),
  refPais("BR", "taxas", 0),
  refPais("BR", "parcelas_padrao", 3),
  refPais("FR", "honorarios", 1000, "Naturalização francesa"),
  refPais("FR", "despesas", 350),
  refPais("FR", "taxas", 250),
  refPais("FR", "parcelas_padrao", 3),
  refPais("EU", "honorarios", 3500, "Europa geral — só triagem legada, não produto final"),
  refPais("EU", "despesas", 1400),
  refPais("EU", "taxas", 500),
  refPais("EU", "parcelas_padrao", 6),
] as const;

/** Divergências explícitas (bloqueiam exposição). */
export const PRECOS_DIVERGENTES_SPEC: readonly PrecoResgatadoSpec[] = [
  {
    chave: "IT:honorarios:divergente-4500",
    itemId: null,
    countryCode: "IT",
    priceComponent: "honorarios",
    amount: 4500,
    priceStatus: "DIVERGENTE",
    caseOnly: false,
    notes: "Referência alternativa IT — bloquear até validação",
  },
  {
    chave: "IT:honorarios:divergente-4800",
    itemId: null,
    countryCode: "IT",
    priceComponent: "honorarios",
    amount: 4800,
    priceStatus: "DIVERGENTE",
    caseOnly: false,
    notes: "Referência alternativa IT — bloquear até validação",
  },
  {
    chave: "PT:honorarios:divergente-3800",
    itemId: null,
    countryCode: "PT",
    priceComponent: "honorarios",
    amount: 3800,
    priceStatus: "DIVERGENTE",
    caseOnly: false,
    notes: "Referência alternativa PT — bloquear até validação",
  },
  {
    chave: "PT:honorarios:divergente-4400",
    itemId: null,
    countryCode: "PT",
    priceComponent: "honorarios",
    amount: 4400,
    priceStatus: "DIVERGENTE",
    caseOnly: false,
    notes: "Referência alternativa PT — bloquear até validação",
  },
] as const;

/** Condição particular Ana Luiza — isolada do catálogo. */
export const PRECO_ANA_LUIZA_AT: PrecoResgatadoSpec = {
  chave: "AT:honorarios:ana-luiza-9600",
  itemId: null,
  countryCode: "AT",
  priceComponent: "honorarios",
  amount: 9600,
  priceStatus: "CONDICAO_PARTICULAR_DE_CASO",
  caseOnly: true,
  caseId: "CA-CID-AT-FAM-2026-001",
  notes: "Exclusiva do caso Ana Luiza; não substitui referência AT R$ 4.800",
};

function pendente(
  countryCode: string,
  itemId: string,
  notes: string,
): PrecoResgatadoSpec {
  return {
    chave: `${itemId}:${countryCode}:pendente`,
    itemId,
    countryCode,
    priceComponent: "honorarios",
    amount: null,
    priceStatus: "PENDENTE_DE_HOMOLOGACAO",
    caseOnly: false,
    notes,
  };
}

/** Estruturas sem número / specs pendentes — sem CTA, link ou cobrança. */
export const PRECOS_PENDENTES_HOMOLOGACAO: readonly PrecoResgatadoSpec[] = [
  pendente("HU", "CA-CID-HU-001", "Sem evidência numérica — não estimar"),
  pendente("HU", "CA-CID-HU-002", "Sem evidência numérica — não estimar"),
  pendente("HU", "CA-CID-HU-003", "Sem evidência numérica — não estimar"),
  pendente("LU", "CA-CID-LU-001", "Sem evidência numérica — não estimar"),
  pendente("LU", "CA-CID-LU-002", "Sem evidência numérica — não estimar"),
  pendente("LU", "CA-CID-LU-003", "Sem evidência numérica — não estimar"),
  pendente("IE", "CA-CID-IE-001", "Sem evidência numérica — não estimar"),
  pendente("IE", "CA-CID-IE-002", "Sem evidência numérica — não estimar"),
  pendente("IE", "CA-CID-IE-003", "Sem evidência numérica — não estimar"),
  pendente("HR", "CA-CID-HR-001", "Especificação pendente de validação"),
  pendente("HR", "CA-CID-HR-002", "Especificação pendente de validação"),
  pendente("HR", "CA-CID-HR-003", "Especificação pendente de validação"),
  pendente("PT", "CA-CID-PT-001", "Especificação pendente de validação"),
  pendente("PT", "CA-CID-PT-002", "Especificação pendente de validação"),
  pendente("PT", "CA-CID-PT-003", "Especificação pendente de validação"),
  pendente("ES", "CA-CID-ES-001", "Especificação pendente de validação"),
  pendente("ES", "CA-CID-ES-002", "Especificação pendente de validação"),
  pendente("ES", "CA-CID-ES-003", "Especificação pendente de validação"),
  pendente("PL", "CA-CID-PL-001", "Especificação pendente de validação"),
  pendente("PL", "CA-CID-PL-002", "Especificação pendente de validação"),
  pendente("PL", "CA-CID-PL-003", "Especificação pendente de validação"),
  pendente("RO", "CA-CID-RO-001", "Especificação pendente de validação"),
  pendente("RO", "CA-CID-RO-002", "Especificação pendente de validação"),
  pendente("RO", "CA-CID-RO-003", "Especificação pendente de validação"),
  pendente("AT", "CA-CID-AT-002", "Especificação pendente de validação"),
  pendente("AT", "CA-CID-AT-003", "Especificação pendente de validação"),
  pendente("BR", "CA-NAT-BR-001", "Especificação pendente de validação"),
  pendente("BR", "CA-NAT-BR-002", "Especificação pendente de validação"),
  pendente("FR", "CA-NAT-FR-001", "Especificação pendente de validação"),
  pendente("FR", "CA-NAT-FR-002", "Especificação pendente de validação"),
  pendente("EU", "CA-GEN-MULTI-001", "Base compartilhada multipaís — sem preço ativo"),
  pendente("EU", "CA-GEN-MULTI-002", "Diagnóstico comparativo — sem preço ativo"),
  pendente("EU", "CA-GEN-MULTI-003", "Ramo adicional — sem preço ativo"),
  pendente("EU", "CA-GEN-MULTI-004", "Pesquisa de segundo país — sem preço ativo"),
  pendente("EU", "CA-GEN-MULTI-005", "Dossiê multipaís — sem preço ativo"),
  pendente("EU", "CA-GEN-MULTI-006", "Acompanhamento paralelo — sem preço ativo"),
] as const;

function itemRef(
  itemId: string,
  countryCode: string | null,
  amount: number,
  notes: string | null = null,
): PrecoResgatadoSpec {
  return {
    chave: countryCode ? `${itemId}:${countryCode}` : itemId,
    itemId,
    countryCode,
    priceComponent: "honorarios",
    amount,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes,
  };
}

/** Itens/etapas localizados no Planejador (referência — não oferta). */
export const PRECOS_ITENS_RESGATADOS: readonly PrecoResgatadoSpec[] = [
  itemRef("CA-CID-001", "IT", 247),
  itemRef("CA-CID-002D", "IT", 390),
  itemRef("CA-CID-002A", "IT", 690),
  itemRef("CA-CID-002B", "IT", 890),
  itemRef("CA-CID-003", "IT", 530),
  itemRef("CA-CID-006", "IT", 280),
  itemRef("CA-CID-016", "IT", 1511, "Itália/família — registro de filhos adicionais"),
  itemRef("CA-CID-018", "IT", 1588),
  itemRef("CA-CID-019", "IT", 3881),
  itemRef("CA-CID-DE-001", "DE", 247),
  itemRef("CA-CID-DE-002", "DE", 1290),
  itemRef("CA-CID-DE-003b", "DE", 890),
  itemRef("CA-CID-AT-001", "AT", 4800),
  itemRef("CA-ASS-001", null, 179, "Continuidade — Plano Essência"),
  itemRef("CA-ASS-002", null, 269, "Continuidade — Plano Memórias"),
  itemRef("CA-ASS-003", null, 359, "Continuidade — Plano Legado"),
  itemRef("CA-WPP-001", null, 79, "Comunicação — só após homologação"),
  itemRef("CA-WPP-002", null, 149, "Comunicação — só após homologação"),
  itemRef("CA-FAM-001", null, 280),
  itemRef("CA-FAM-002", null, 490),
  {
    chave: "CA-CURSO-001:arquivado",
    itemId: "CA-CURSO-001",
    countryCode: null,
    priceComponent: "honorarios",
    amount: null,
    priceStatus: "ARQUIVADO",
    caseOnly: false,
    notes: "ARQUIVADO_DECISAO_PROPRIETARIA — ausente de recomendação",
  },
] as const;

export const MATRIZ_PRECOS_RESGATADOS: readonly PrecoResgatadoSpec[] = [
  ...PRECOS_PAIS_RESGATADOS,
  ...PRECOS_DIVERGENTES_SPEC,
  PRECO_ANA_LUIZA_AT,
  ...PRECOS_PENDENTES_HOMOLOGACAO,
  ...PRECOS_ITENS_RESGATADOS,
];

export type ResultadoExposicaoPreco = {
  podeExpor: boolean;
  motivo: string;
  status: EstadoPrecoResgatado;
};

/** Regra de aceite: só HOMOLOGADO_CATALOGO pode ir a oferta/link. */
export function avaliarExposicaoPrecoResgatado(p: PrecoResgatadoSpec): ResultadoExposicaoPreco {
  if (p.itemId && !itemPermitidoEmRecomendacaoComercial(p.itemId)) {
    return {
      podeExpor: false,
      motivo: `${p.itemId} arquivado por decisão da Proprietária — fora de recomendação comercial.`,
      status: p.priceStatus,
    };
  }
  if (p.caseOnly || p.priceStatus === "CONDICAO_PARTICULAR_DE_CASO") {
    return {
      podeExpor: false,
      motivo: `Condição particular${p.caseId ? ` do caso ${p.caseId}` : ""} — não vira catálogo.`,
      status: p.priceStatus,
    };
  }
  if (bloqueiaExposicaoComercial(p.priceStatus) || !podeExporPrecoComercialmente(p.priceStatus)) {
    return {
      podeExpor: false,
      motivo: `Status ${p.priceStatus} bloqueia exposição comercial.`,
      status: p.priceStatus,
    };
  }
  return { podeExpor: true, motivo: "", status: p.priceStatus };
}

/** Ana Luiza 9600 nunca substitui a referência AT 4800. */
export function anaLuizaIsoladaDoCatalogo(
  matriz: readonly PrecoResgatadoSpec[] = MATRIZ_PRECOS_RESGATADOS,
): boolean {
  const particular = matriz.find((p) => p.chave === PRECO_ANA_LUIZA_AT.chave);
  const referencia = matriz.find((p) => p.chave === "AT:honorarios");
  if (!particular || !referencia) return false;
  if (particular.amount !== 9600 || !particular.caseOnly) return false;
  if (referencia.amount !== 4800 || referencia.caseOnly) return false;
  return !avaliarExposicaoPrecoResgatado(particular).podeExpor;
}

export const MATRIZ_PRECOS_NUNCA_HOMOLOGA_SOZINHA = true as const;
