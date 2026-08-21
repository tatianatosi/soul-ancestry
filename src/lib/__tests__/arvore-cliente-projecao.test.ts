import { describe, expect, it } from "vitest";
import { projecaoLimpa, projetarArvoreCliente } from "@/lib/arvore-cliente-projecao";

const pessoas = [
  { id: "1", canonical_name: "Ana Luiza", birth_date: "1912-04-03T00:00:00Z", client_projection_status: "publicado", hipotese: "linha materna", confidence_level: "media" },
  { id: "2", canonical_name: "Pessoa em pesquisa", client_projection_status: "interno" },
  { id: "3", canonical_name: "Adair", client_projection_status: "autorizado", death_date: null },
];

describe("projeção da árvore no App Cliente", () => {
  it("projeta apenas pessoas aprovadas", () => {
    const r = projetarArvoreCliente(pessoas as any);
    expect(r.map((p) => p.id)).toEqual(["1", "3"]);
  });
  it("expõe somente nome e datas aprovadas", () => {
    const [ana] = projetarArvoreCliente(pessoas as any);
    expect(Object.keys(ana).sort()).toEqual(["falecimento", "id", "nascimento", "nome"]);
    expect(ana.nascimento).toBe("1912-04-03");
    expect(projecaoLimpa(ana as any)).toBe(true);
  });
  it("bloqueia objeto com campo interno", () => {
    expect(projecaoLimpa({ nome: "x", hipotese: "y" })).toBe(false);
  });
});
