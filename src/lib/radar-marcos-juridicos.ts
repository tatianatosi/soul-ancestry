/**
 * Radar de marcos jurídicos × casos potencialmente afetados (P25,
 * 2026-09-26) — pedido explícito da Proprietária: "Radar de marcos
 * jurídicos e casos impactados" no Painel Hoje/CRM Vivo.
 *
 * Função pura: recebe as linhas já lidas (trilhas, marcos, casos) e produz
 * uma linha por marco real, com a contagem de casos ativos ligados àquela
 * trilha. Nunca inventa impacto: sem caso ligado, a contagem é 0 — não
 * "sem dado".
 */

export type TrilhaJuridicaLinha = { id: string; pais: string | null; code: string | null };
export type MarcoJuridicoLinha = {
  id: string;
  track_id: string;
  label: string | null;
  status: string | null;
  review_required: string | null;
};
export type CasoLigadoTrilha = { id: string; citizenship_track_id: string | null };

export type LinhaRadarMarco = {
  marcoId: string;
  pais: string;
  trilhaCode: string;
  marco: string;
  statusMarco: string;
  revisaoObrigatoria: boolean;
  casosAfetados: number;
};

export function radarMarcosJuridicos(
  trilhas: readonly TrilhaJuridicaLinha[],
  marcos: readonly MarcoJuridicoLinha[],
  casos: readonly CasoLigadoTrilha[],
): LinhaRadarMarco[] {
  const trilhaPorId = new Map(trilhas.map((t) => [t.id, t]));
  const contagemPorTrilha = new Map<string, number>();
  for (const c of casos) {
    if (!c.citizenship_track_id) continue;
    contagemPorTrilha.set(c.citizenship_track_id, (contagemPorTrilha.get(c.citizenship_track_id) ?? 0) + 1);
  }
  return marcos
    .map((m) => {
      const trilha = trilhaPorId.get(m.track_id);
      if (!trilha) return null;
      const linha: LinhaRadarMarco = {
        marcoId: m.id,
        pais: trilha.pais?.trim() || "País não registrado",
        trilhaCode: trilha.code ?? "—",
        marco: m.label?.trim() || "Marco sem título registrado",
        statusMarco: m.status ?? "—",
        revisaoObrigatoria: m.review_required === "obrigatoria",
        casosAfetados: contagemPorTrilha.get(m.track_id) ?? 0,
      };
      return linha;
    })
    .filter((l): l is LinhaRadarMarco => l !== null)
    .sort((a, b) => b.casosAfetados - a.casosAfetados || a.pais.localeCompare(b.pais));
}
