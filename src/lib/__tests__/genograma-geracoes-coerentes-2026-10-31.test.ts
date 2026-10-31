import { describe, expect, it } from "vitest";
import { geracoesCoerentes, layoutGenograma } from "@/components/portal/genograma-layout";

/*
 * 31/10/2026 — no caso real, mãe e filha foram publicadas com o mesmo número
 * de geração, e a linha da filiação passava por cima de outra pessoa. Regra:
 * filiação explícita publicada (de = pai/mãe) coloca o pai/mãe pelo menos uma
 * linha acima; cônjuges ficam na mesma linha; ninguém sem vínculo explícito muda.
 */
const p = (chave: string, geracao: number) => ({ chave, nome: chave, vinculo: null, geracao });

describe("gerações coerentes com a filiação publicada", () => {
  const pessoas = [p("bisavo", 6), p("avo", 5), p("mae1", 4), p("pai1", 4), p("mae2", 3), p("filha", 3), p("pai3", 2), p("voce", 1)];
  const vinculos = [
    { de: "bisavo", para: "avo", tipo: "pai_mae" as const },
    { de: "avo", para: "mae1", tipo: "pai_mae" as const },
    { de: "pai1", para: "mae1", tipo: "conjuge" as const },
    { de: "pai1", para: "mae2", tipo: "pai_mae" as const },
    { de: "mae1", para: "mae2", tipo: "pai_mae" as const },
    { de: "mae2", para: "filha", tipo: "pai_mae" as const },
    { de: "filha", para: "pai3", tipo: "pai_mae" as const },
    { de: "pai3", para: "voce", tipo: "pai_mae" as const },
  ];
  const g = Object.fromEntries(geracoesCoerentes(pessoas, vinculos).map((x) => [x.chave, x.geracao]));

  it("mãe publicada na mesma geração da filha sobe uma linha, e os ancestrais acompanham", () => {
    expect(g).toEqual({ bisavo: 7, avo: 6, mae1: 5, pai1: 5, mae2: 4, filha: 3, pai3: 2, voce: 1 });
  });

  it("sem vínculo explícito, a geração publicada não muda", () => {
    const soltas = [p("a", 3), p("b", 3)];
    expect(geracoesCoerentes(soltas, []).map((x) => x.geracao)).toEqual([3, 3]);
  });

  it("nenhuma filiação desenhada fica na mesma linha ou de baixo para cima", () => {
    const { nos } = layoutGenograma(geracoesCoerentes(pessoas, vinculos), undefined, vinculos);
    const y = new Map(nos.map((n) => [n.pessoa.chave, n.y]));
    for (const v of vinculos.filter((v) => v.tipo === "pai_mae")) expect(y.get(v.de)!).toBeLessThan(y.get(v.para)!);
  });

  it("filhos ficam sob os pais na linha seguinte", () => {
    const pessoas2 = [p("A", 2), p("B", 2), p("filhoB", 1), p("filhoA", 1)];
    const v2 = [{ de: "A", para: "filhoA", tipo: "pai_mae" as const }, { de: "B", para: "filhoB", tipo: "pai_mae" as const }];
    const { nos } = layoutGenograma(pessoas2, undefined, v2);
    const x = new Map(nos.map((n) => [n.pessoa.chave, n.x]));
    expect(x.get("filhoA")!).toBeLessThan(x.get("filhoB")!);
  });
});
