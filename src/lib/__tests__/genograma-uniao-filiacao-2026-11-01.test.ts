import { describe, expect, it } from "vitest";
import { caminhoFiliacaoDaUniao, geracoesCoerentes, layoutGenograma } from "@/components/portal/genograma-layout";

const pessoa = (chave: string, geracao: number, nome = chave) => ({ chave, nome, geracao, vinculo: null });
const pessoas = [pessoa("lotte", 5), pessoa("otto", 5), pessoa("anaMaria", 4), pessoa("cleusa", 3), pessoa("ana", 1, "Ana Luiza Gomes Silveira Rodrigues")];
const vinculos = [
  { de: "lotte", para: "otto", tipo: "conjuge" as const },
  { de: "lotte", para: "anaMaria", tipo: "pai_mae" as const },
  { de: "otto", para: "anaMaria", tipo: "pai_mae" as const },
  { de: "anaMaria", para: "cleusa", tipo: "pai_mae" as const },
];

describe("filiação publicada de Lotte e Otto", () => {
  it("desce da união até Ana Maria sem atravessar os cartões de Ana Maria ou Cleusa", () => {
    const { nos } = layoutGenograma(geracoesCoerentes(pessoas, vinculos), undefined, vinculos);
    const lotte = nos.find((n) => n.pessoa.chave === "lotte");
    const otto = nos.find((n) => n.pessoa.chave === "otto");
    const filha = nos.find((n) => n.pessoa.chave === "anaMaria");
    if (!lotte || !otto || !filha) throw new Error("Pessoas ausentes");
    const x = (lotte.x + otto.x) / 2;
    const meio = (lotte.y + lotte.altura + filha.y) / 2;
    for (const v of vinculos.slice(1, 3)) {
      expect(caminhoFiliacaoDaUniao(v, nos, vinculos)).toBe(`M${x} ${lotte.y + lotte.altura / 2} V${meio} H${filha.x} V${filha.y}`);
    }
    expect(nos.find((n) => n.pessoa.chave === "ana")?.linhas.join(" ")).toBe("Ana Luiza Gomes Silveira Rodrigues");
  });

  it("não atribui filho ao casal quando só uma filiação está publicada", () => {
    const v = [vinculos[0], vinculos[1]];
    const { nos } = layoutGenograma(pessoas, undefined, v);
    expect(caminhoFiliacaoDaUniao(vinculos[1], nos, v)).toBeNull();
  });
});