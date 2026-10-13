import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { geracaoAscendente, type Perfil, type Relacao } from "@/lib/pessoas-linhagens";

/*
 * 13/10/2026 — Proprietária: Pessoas & Linhagens na composição da Prancha V4
 * em /nucleos; "a linhagem vai até G10".
 */
const componente = readFileSync("src/components/pessoas/composicao-linhagem-v4.tsx", "utf8");
const funcoes = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");
const nucleos = readFileSync("src/routes/_authenticated/nucleos.tsx", "utf8");

const leitura = funcoes.slice(
  funcoes.indexOf("export const lerLinhagemDoCaso"),
  funcoes.indexOf("export const painelPessoasLinhagens"),
);

describe("Pessoas & Linhagens — prancha V4 em /nucleos", () => {
  it("o teto das gerações é G10", () => {
    expect(readFileSync("src/lib/pessoas-linhagens.ts", "utf8")).toContain("export const GERACAO_MAXIMA_LINHAGEM = 10;");
    expect(leitura).toContain("g.geracao <= GERACAO_MAXIMA_LINHAGEM");
    expect(componente).toContain("Gerações G1–G{GERACAO_MAXIMA_LINHAGEM}");
    expect(componente).toContain("grid-cols-10");
  });

  it("a leitura de linhagem é pura: nenhuma escrita no banco", () => {
    expect(leitura).toContain('createServerFn({ method: "GET" })');
    for (const escrita of [".insert(", ".update(", ".upsert(", ".delete("]) {
      expect(leitura).not.toContain(escrita);
    }
    expect(leitura).toContain("geracaoAscendente(linhaFoco?.pessoa_ancora_id");
  });

  it("compõe os blocos da prancha na ordem: gerações, leitura, árvore, rede, cobertura", () => {
    const ordem = [
      "data-linhagem-geracoes",
      "data-linhagem-leitura",
      "data-linhagem-arvore-nucleo",
      "data-linhagem-rede-vinculos",
      "data-linhagem-cobertura",
    ].map((m) => componente.indexOf(m));
    for (const p of ordem) expect(p).toBeGreaterThan(-1);
    expect([...ordem].sort((a, b) => a - b)).toEqual(ordem);
  });

  it("cobertura é contagem, nunca percentual estimado; sem dado demonstrativo", () => {
    expect(componente).toContain("Sem percentual estimado");
    for (const proibido of ["Bianchi", "Rossi", "Lucca", "valor: 92", "demonstrativ"]) {
      expect(componente).not.toContain(proibido);
    }
  });

  it("/nucleos monta a composição para o núcleo em foco", () => {
    expect(nucleos).toContain("<ComposicaoLinhagemV4 nucleo={foco} />");
    expect(nucleos).toContain("const foco = atual ??");
  });
});

describe("geracaoAscendente sobe até G10 só por filiação persistida", () => {
  const perfil = (id: string): Perfil =>
    ({ id: `p-${id}`, research_person_id: id, nome_completo: `Pessoa ${id}`, status_verificacao: "pendente", archived_at: null }) as unknown as Perfil;
  const pai = (de: string, para: string): Relacao =>
    ({ id: `${de}-${para}`, person_from_id: de, person_to_id: para, relation_type: "pai_mae", status_pesquisa: "confirmado", archived_at: null }) as unknown as Relacao;

  it("uma linha de 12 gerações chega a G12 no cálculo; o Desk corta em G10", () => {
    const ids = Array.from({ length: 12 }, (_, i) => `g${i + 1}`);
    const relacoes = ids.slice(1).map((id, i) => pai(id, ids[i]!));
    const resultado = geracaoAscendente("g1", ids.map(perfil), relacoes);
    expect(Math.max(...resultado.map((r) => r.geracao))).toBe(12);
    expect(resultado.filter((r) => r.geracao <= 10)).toHaveLength(10);
  });

  it("sem pessoa âncora, nenhuma geração é inventada", () => {
    expect(geracaoAscendente(null, [perfil("a")], [])).toEqual([]);
  });
});

describe("Árvore do núcleo — só filiação gravada, sem parentesco suposto", () => {
  it("desenha uma linha por aresta gravada e nenhuma entre pessoas sem filiação", async () => {
    const { createElement } = await import("react");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { ArvoreFiliacao } = await import("@/components/pessoas/composicao-linhagem-v4");
    const geracoes = [
      { personId: "a", nome: "Pessoa A", status: "confirmado", geracao: 1 },
      { personId: "b", nome: "Pessoa B Silva", status: "pendente", geracao: 2 },
      { personId: "c", nome: "Pessoa C Silva", status: "pendente", geracao: 2 },
    ];
    // B é mãe/pai de A; C tem o mesmo sobrenome de B, mas sem aresta gravada.
    const html = renderToStaticMarkup(
      createElement(ArvoreFiliacao, { geracoes, arestas: [{ pai: "b", filho: "a" }], requerentes: new Set(["a"]) }),
    );
    expect(html.match(/data-aresta-filiacao/g)).toHaveLength(1);
    expect(html).toContain("G1 · requerente");
    expect(html).not.toContain("G2 · requerente");
  });

  it("a árvore não liga membros do núcleo em fila", () => {
    expect(componente).toContain("data-linhagem-membros-sem-vinculo");
    expect(componente).not.toContain("<ol className=\"mt-5 flex overflow-x-auto pb-1\">");
    expect(funcoes).toContain("exibidas.has(a.pai) && exibidas.has(a.filho)");
  });
});

describe("Cartões de núcleo também contam até G10", () => {
  it("coberturaPorGeracao aceita o teto; /nucleos pede G10 e o GoLive segue em G5", async () => {
    const { coberturaPorGeracao } = await import("@/lib/golive-pessoas");
    const pessoas = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      paiId: i < 11 ? `p${i + 1}` : null,
      maeId: null,
      titular: i === 0,
      requerente: i === 0,
      contratante: false,
    }));
    expect(coberturaPorGeracao(pessoas as never)).toHaveLength(5);
    const g10 = coberturaPorGeracao(pessoas as never, 10);
    expect(g10).toHaveLength(10);
    expect(g10.at(-1)).toEqual({ rotulo: "G10", valor: 1 });
    expect(readFileSync("src/lib/nucleos-desk.functions.ts", "utf8")).toContain(
      "coberturaPorGeracao(membros, GERACAO_MAXIMA_LINHAGEM)",
    );
  });
});
