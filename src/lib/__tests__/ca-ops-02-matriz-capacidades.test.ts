import { describe, expect, it } from "vitest";
import {
  CAPACIDADES,
  MATRIZ_CAPACIDADES,
  capacidade,
  capacidadesDoElo,
  elosSemCobertura,
} from "../matriz-capacidades-jornada";

describe("CA-OPS-02 — matriz de capacidades da jornada", () => {
  it("cobre exatamente as 9 capacidades, sem duplicidade", () => {
    expect(MATRIZ_CAPACIDADES).toHaveLength(9);
    expect(new Set(MATRIZ_CAPACIDADES.map((l) => l.capacidade)).size).toBe(CAPACIDADES.length);
  });

  it("cada linha tem papel operacional, rota, elos e guardas", () => {
    for (const linha of MATRIZ_CAPACIDADES) {
      expect(linha.papelOperacional.length).toBeGreaterThan(10);
      expect(linha.rotaCanonica.startsWith("/")).toBe(true);
      expect(linha.elos.length).toBeGreaterThan(0);
      expect(linha.guardas.length).toBeGreaterThan(0);
      expect(linha.acaoExternaAutomatica).toBe(false);
    }
  });

  it("todos os elos da cadeia têm ao menos uma capacidade responsável", () => {
    expect(elosSemCobertura()).toEqual([]);
  });

  it("resolve capacidade por id e por elo", () => {
    expect(capacidade("whatsapp").rotaCanonica).toBe("/integracoes");
    expect(capacidadesDoElo("template_sugerido").map((l) => l.capacidade)).toContain(
      "biblioteca_mensagens",
    );
  });

  it("WhatsApp mantém envio externo desligado", () => {
    expect(capacidade("whatsapp").guardas.join(" ")).toContain("desligado");
  });
});
