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

/** Referências por país/processo (honorários-base do Planejador). */
export const PRECOS_PAIS_RESGATADOS: readonly PrecoResgatadoSpec[] = [
  {
    chave: "IT:honorarios",
    itemId: null,
    countryCode: "IT",
    priceComponent: "honorarios",
    amount: 4700,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: "Divergência IT 4500/4700/4800 — não escolher automaticamente",
  },
  {
    chave: "HR:honorarios",
    itemId: null,
    countryCode: "HR",
    priceComponent: "honorarios",
    amount: 4000,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
  {
    chave: "PT:honorarios",
    itemId: null,
    countryCode: "PT",
    priceComponent: "honorarios",
    amount: 4800,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: "Divergência PT 3800/4400/4800 — não escolher automaticamente",
  },
  {
    chave: "ES:honorarios",
    itemId: null,
    countryCode: "ES",
    priceComponent: "honorarios",
    amount: 3200,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
  {
    chave: "DE:honorarios",
    itemId: null,
    countryCode: "DE",
    priceComponent: "honorarios",
    amount: 4200,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
  {
    chave: "PL:honorarios",
    itemId: null,
    countryCode: "PL",
    priceComponent: "honorarios",
    amount: 3900,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
  {
    chave: "RO:honorarios",
    itemId: null,
    countryCode: "RO",
    priceComponent: "honorarios",
    amount: 3600,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
  {
    chave: "AT:honorarios",
    itemId: null,
    countryCode: "AT",
    priceComponent: "honorarios",
    amount: 4800,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: "Não confundir com Ana Luiza R$ 9.600",
  },
  {
    chave: "BR:honorarios",
    itemId: null,
    countryCode: "BR",
    priceComponent: "honorarios",
    amount: 900,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: "Naturalização brasileira",
  },
  {
    chave: "FR:honorarios",
    itemId: null,
    countryCode: "FR",
    priceComponent: "honorarios",
    amount: 1000,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: "Naturalização francesa",
  },
  {
    chave: "EU:honorarios",
    itemId: null,
    countryCode: "EU",
    priceComponent: "honorarios",
    amount: 3500,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: "Europa geral — só triagem legada, não produto final",
  },
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

/** Hungria, Luxemburgo, Irlanda — estrutura sem número. */
export const PRECOS_PENDENTES_HOMOLOGACAO: readonly PrecoResgatadoSpec[] = [
  {
    chave: "HU:honorarios:pendente",
    itemId: "CA-CID-HU-001",
    countryCode: "HU",
    priceComponent: "honorarios",
    amount: null,
    priceStatus: "PENDENTE_DE_HOMOLOGACAO",
    caseOnly: false,
    notes: "Sem evidência numérica — não estimar",
  },
  {
    chave: "LU:honorarios:pendente",
    itemId: "CA-CID-LU-001",
    countryCode: "LU",
    priceComponent: "honorarios",
    amount: null,
    priceStatus: "PENDENTE_DE_HOMOLOGACAO",
    caseOnly: false,
    notes: "Sem evidência numérica — não estimar",
  },
  {
    chave: "IE:honorarios:pendente",
    itemId: "CA-CID-IE-001",
    countryCode: "IE",
    priceComponent: "honorarios",
    amount: null,
    priceStatus: "PENDENTE_DE_HOMOLOGACAO",
    caseOnly: false,
    notes: "Sem evidência numérica — não estimar",
  },
] as const;

/** Itens por etapa já localizados (amostra canônica do prompt). */
export const PRECOS_ITENS_RESGATADOS: readonly PrecoResgatadoSpec[] = [
  {
    chave: "CA-CID-001:IT",
    itemId: "CA-CID-001",
    countryCode: "IT",
    priceComponent: "honorarios",
    amount: 247,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
  {
    chave: "CA-CID-DE-001:DE",
    itemId: "CA-CID-DE-001",
    countryCode: "DE",
    priceComponent: "honorarios",
    amount: 247,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
  {
    chave: "CA-CID-AT-001:AT",
    itemId: "CA-CID-AT-001",
    countryCode: "AT",
    priceComponent: "honorarios",
    amount: 4800,
    priceStatus: "REFERENCIA_RESGATADA",
    caseOnly: false,
    notes: null,
  },
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
export function anaLuizaIsoladaDoCatalogo(matriz: readonly PrecoResgatadoSpec[] = MATRIZ_PRECOS_RESGATADOS): boolean {
  const particular = matriz.find((p) => p.chave === PRECO_ANA_LUIZA_AT.chave);
  const referencia = matriz.find((p) => p.chave === "AT:honorarios");
  if (!particular || !referencia) return false;
  if (particular.amount !== 9600 || !particular.caseOnly) return false;
  if (referencia.amount !== 4800 || referencia.caseOnly) return false;
  return !avaliarExposicaoPrecoResgatado(particular).podeExpor;
}

export const MATRIZ_PRECOS_NUNCA_HOMOLOGA_SOZINHA = true as const;
