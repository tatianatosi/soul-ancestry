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
    expect(funcoes).toContain("export const GERACAO_MAXIMA_LINHAGEM = 10;");
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
