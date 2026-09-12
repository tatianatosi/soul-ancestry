import { describe, expect, it } from "vitest";

import { jornadaSanitizada, partirJornadaEmDuasLinhas } from "@/lib/portal-dados-vivos";
import { PROJECOES_DEMO_SOPHIA } from "@/lib/portal-demo-sophia";

describe("partirJornadaEmDuasLinhas — mockup 17", () => {
  it("separa História (família/registro) de Seu caso (acompanhamento) sem inventar itens", () => {
    const jornada = jornadaSanitizada(PROJECOES_DEMO_SOPHIA, new Date("2026-08-25"));
    const { historia, seuCaso, uniaoDeRamos } = partirJornadaEmDuasLinhas(jornada.linha);

    expect(historia.length + seuCaso.length).toBe(jornada.linha.length);
    expect(historia.every((p) => ["arvore", "achado", "evidencia", "linha_tempo", "legado"].includes(p.tipo))).toBe(
      true,
    );
    expect(seuCaso.every((p) => !["arvore", "achado", "evidencia", "linha_tempo", "legado"].includes(p.tipo))).toBe(
      true,
    );
    expect(historia.length).toBeGreaterThan(0);
    expect(seuCaso.length).toBeGreaterThan(0);
    expect(uniaoDeRamos).toBe(true);
  });

  it("não marca União de Ramos com coluna vazia", () => {
    const soCaso = partirJornadaEmDuasLinhas([
      {
        id: "1",
        tipo: "marco",
        tipoRotulo: "Marco da jornada",
        conteudo: "Abertura",
        publicadoEm: "2026-01-01",
      },
    ]);
    expect(soCaso.historia).toEqual([]);
    expect(soCaso.seuCaso).toHaveLength(1);
    expect(soCaso.uniaoDeRamos).toBe(false);
  });
});
