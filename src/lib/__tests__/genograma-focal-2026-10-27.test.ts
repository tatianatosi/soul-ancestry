import { describe, expect, it } from "vitest";
import { enquadramentoGenograma, layoutGenograma, linhasNome, raizAutorizada } from "@/components/portal/genograma-layout";
import { pessoasDaArvore } from "@/lib/arvore-publicacao";

describe("correção focal do genograma", () => {
  const otto = { chave: "b923bd30-21a4-49de-8384-f3a9d74429f0", nome: "Otto Reimer", vinculo: null, geracao: 4 };
  it("outro caso nunca destaca Otto pelo nome ou pelo mesmo identificador", () => {
    expect(raizAutorizada("outro-caso", [otto])).toBeUndefined();
    expect(raizAutorizada("a11a0000-0000-4000-8000-000000000002", [{ ...otto, chave: "homonimo" }])).toBeUndefined();
    expect(raizAutorizada("a11a0000-0000-4000-8000-000000000002", [otto])).toBe(otto.chave);
  });
  it("não assume a pessoa da maior geração como raiz", () => {
    expect(raizAutorizada("outro-caso", [{ ...otto, geracao: 12 }])).toBeUndefined();
  });
  it("mantém uma geração 11 realmente publicada, sem teto ilustrativo", () => {
    const pessoas = pessoasDaArvore([{ id: "publicacao", pessoa_id: "p11", projection_type: "arvore", content_sanitized: "Ancestral publicado", geracao_cliente: 11 }]);
    expect(layoutGenograma(pessoas).nos.map((n) => n.pessoa.geracao)).toEqual([11]);
  });
  it("restaurar usa enquadramento com margem e centro em 375 e 1280", () => {
    expect(enquadramentoGenograma(540, 375)).toEqual({ zoom: 0.65, left: 0, top: 0 });
    expect(enquadramentoGenograma(540, 1280)).toEqual({ zoom: 1, left: 0, top: 0 });
    expect(enquadramentoGenograma(2000, 375)).toEqual({ zoom: 0.4, left: 212.5, top: 0 });
  });
  it("preserva todos os caracteres de nomes longos e reserva altura", () => {
    const nome = "Maria Alexandrina de Albuquerque Vasconcelos WWWWWWWWWWWWWWWWWWWWWWWW";
    expect(linhasNome(nome).join("").replace(/\s/g, "")).toBe(nome.replace(/\s/g, ""));
    const layout = layoutGenograma([{ ...otto, nome }, { ...otto, chave: "filho", geracao: 3 }]);
    const [pai, filho] = layout.nos;
    expect(pai?.linhas.length).toBeGreaterThan(2);
    expect((filho?.y ?? 0) - ((pai?.y ?? 0) + (pai?.geracaoY ?? 0))).toBeGreaterThan(100);
  });
});