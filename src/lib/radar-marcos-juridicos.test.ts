import { describe, expect, it } from "vitest";
import { radarMarcosJuridicos } from "./radar-marcos-juridicos";

// P25 (26/09/2026) — "Radar de marcos jurídicos e casos impactados",
// pedido explícito da Proprietária no Painel Hoje/CRM Vivo.
describe("radarMarcosJuridicos", () => {
  const trilhas = [
    { id: "t-at", pais: "Áustria", code: "TRK-AT-58C" },
    { id: "t-it", pais: "Itália", code: "TRK-IT-DESC" },
    { id: "t-sem-marco", pais: "Alemanha", code: "TRILHA_ALEMANHA" },
  ];
  const marcos = [
    { id: "m-at", track_id: "t-at", label: "§58c StbG", status: "a_revisar", review_required: "obrigatoria" },
    { id: "m-it", track_id: "t-it", label: "Lei nº 91/1992", status: "vigente", review_required: "dispensa_homologada" },
  ];
  const casos = [
    { id: "c1", citizenship_track_id: "t-at" },
    { id: "c2", citizenship_track_id: "t-at" },
    { id: "c3", citizenship_track_id: null },
  ];

  it("conta só casos realmente ligados à trilha do marco — nunca inventa impacto", () => {
    const linhas = radarMarcosJuridicos(trilhas, marcos, casos);
    expect(linhas.find((l) => l.marcoId === "m-at")?.casosAfetados).toBe(2);
    expect(linhas.find((l) => l.marcoId === "m-it")?.casosAfetados).toBe(0);
  });

  it("trilha sem marco registrado (legado) não aparece no radar", () => {
    const linhas = radarMarcosJuridicos(trilhas, marcos, casos);
    expect(linhas.some((l) => l.trilhaCode === "TRILHA_ALEMANHA")).toBe(false);
    expect(linhas).toHaveLength(2);
  });

  it("ordena por casos afetados, país como desempate", () => {
    const linhas = radarMarcosJuridicos(trilhas, marcos, casos);
    expect(linhas[0].marcoId).toBe("m-at");
  });

  it("marco de trilha inexistente (dado inconsistente) é descartado, não quebra", () => {
    const linhas = radarMarcosJuridicos(trilhas, [...marcos, { id: "m-orfao", track_id: "sem-trilha", label: "x", status: "vigente", review_required: "a_definir" }], casos);
    expect(linhas.find((l) => l.marcoId === "m-orfao")).toBeUndefined();
  });
});
