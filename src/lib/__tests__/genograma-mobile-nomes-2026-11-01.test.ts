import { describe, expect, it } from "vitest";
import { layoutGenograma } from "@/components/portal/genograma-layout";

describe("nomes completos no genograma compacto", () => {
  it("reserva linhas e altura para Ana e mantém cônjuges separados", () => {
    const nomes = ["Lotte Friedmann", "Otto Reimer", "Ana Luiza Gomes Silveira Rodrigues"];
    const pessoas = nomes.map((nome, i) => ({ chave: String(i), nome, geracao: i < 2 ? 5 : 1, vinculo: null }));
    const l = layoutGenograma(pessoas, { "2": "n. 2001" }, [], true);
    expect(l.largura).toBe(320);
    const [lotte, otto, ana] = l.nos;
    if (!lotte || !otto || !ana) throw new Error("Nós ausentes");
    expect(otto.x - lotte.x).toBeGreaterThan(l.cartaoLargura);
    expect(ana.linhas.join(" ")).toBe(nomes[2]);
    expect(ana.altura).toBeGreaterThan(26 + (ana.linhas.length - 1) * l.passoLinha + 20);
  });
});