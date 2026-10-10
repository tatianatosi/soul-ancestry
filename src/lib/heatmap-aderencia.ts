/**
 * Heatmap de aderência por país (§58c Áustria, Itália, …) — leitura pura.
 *
 * Fonte: `lineage_paths.aderencia_percentual` (um ramo por linha; país vem de
 * `citizenship_tracks.pais`). O percentual é aderência operacional/documental
 * do ramo, calculada/gravada pela equipe — nunca parecer jurídico, direito
 * reconhecido ou elegibilidade definitiva. Ramo sem percentual aparece como
 * "não calculada", nunca como 0%.
 *
 * Reusa `validarAderenciaPercentual` (o mesmo validador do escritor) para
 * normalizar o que vem do banco: valor fora de 0–100 inteiro vira ausência.
 */
import { validarAderenciaPercentual } from "@/lib/pessoas-linhagens";

export type RamoHeatmapBruto = {
  id: string;
  nome_da_linha: string;
  pais: string | null;
  aderencia_percentual: unknown;
  evidencias_chave: string[] | null;
};

export type RamoHeatmap = {
  id: string;
  nome: string;
  pct: number | null;
  evidencias: number;
};

export type LinhaHeatmapPais = {
  pais: string;
  /** Maior aderência entre os ramos do país; null se nenhum foi calculado. */
  pct: number | null;
  ramos: RamoHeatmap[];
  /** Soma de evidências-chave registradas nos ramos do país. */
  evidencias: number;
};

export const PAIS_NAO_INFORMADO = "País não informado";

function pctSeguro(bruto: unknown): number | null {
  try {
    return validarAderenciaPercentual(bruto);
  } catch {
    return null;
  }
}

export function agruparHeatmapPorPais(ramos: RamoHeatmapBruto[]): LinhaHeatmapPais[] {
  const porPais = new Map<string, LinhaHeatmapPais>();
  for (const r of ramos) {
    const pais = (r.pais ?? "").trim() || PAIS_NAO_INFORMADO;
    const linha = porPais.get(pais) ?? { pais, pct: null, ramos: [], evidencias: 0 };
    const pct = pctSeguro(r.aderencia_percentual);
    const evidencias = (r.evidencias_chave ?? []).length;
    linha.ramos.push({ id: r.id, nome: r.nome_da_linha, pct, evidencias });
    linha.evidencias += evidencias;
    if (pct !== null && (linha.pct === null || pct > linha.pct)) linha.pct = pct;
    porPais.set(pais, linha);
  }
  // Mais aderente primeiro; país sem percentual calculado vai por último.
  return [...porPais.values()].sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
}

export type FaixaCalor = "nao_calculada" | "baixa" | "media" | "alta";

export function faixaDeCalor(pct: number | null): FaixaCalor {
  if (pct === null) return "nao_calculada";
  if (pct >= 70) return "alta";
  if (pct >= 40) return "media";
  return "baixa";
}

export const ROTULO_FAIXA: Record<FaixaCalor, string> = {
  nao_calculada: "não calculada",
  baixa: "baixa",
  media: "média",
  alta: "alta",
};
