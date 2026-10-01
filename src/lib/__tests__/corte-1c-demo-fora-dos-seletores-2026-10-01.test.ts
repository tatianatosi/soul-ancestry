import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";

/**
 * Corte 1c (01/10/2026) — DEFECTIVO_COMPROVADO: seletores de caso e cliente
 * ofereciam registros de demonstração junto com os reais, sem filtro e sem
 * rótulo. O pior deles abria caso operacional com cliente de demonstração.
 *
 * O helper já existia (`src/lib/fixtures.ts`) e quase ninguém usava.
 */
const ler = (p: string) => readFileSync(p, "utf8");

describe("o helper reconhece demonstração por coluna e por rótulo", () => {
  it("pega booleano, data_origin e nome/código marcados", () => {
    expect(ehFixtureLinha({ is_demo: true })).toBe(true);
    expect(ehFixtureLinha({ dados_teste: true })).toBe(true);
    expect(ehFixtureLinha({ data_origin: "fixture_demo" })).toBe(true);
    expect(ehFixtureLinha({ codigo: "CA-DEMO-IT-2026-001" })).toBe(true);
    expect(ehFixtureLinha({ nome: "João (dado de teste)" })).toBe(true);
    expect(ehFixtureLinha({ nome: "Ana Luiza Gomes Silveira Rodrigues" })).toBe(false);
  });

  it("semFixtures tira só a demonstração e preserva a ordem do resto", () => {
    const linhas = [
      { id: "1", nome: "Ana Luiza" },
      { id: "2", nome: "Sophia (demo)" },
      { id: "3", nome: "Giovanna", is_demo: true },
      { id: "4", nome: "Adair" },
    ];
    expect(semFixtures(linhas).map((l) => l.id)).toEqual(["1", "4"]);
  });
});

describe("nenhum seletor de caso ou cliente real oferece demonstração", () => {
  const SELETORES: [string, number][] = [
    // arquivo, quantas listas de <option> passam pelo filtro
    ["src/components/caso/abrir-caso-motor.tsx", 1],
    ["src/routes/_authenticated/contratos.index.tsx", 1],
    ["src/routes/_authenticated/propostas.tsx", 2],
    ["src/components/ops/desk-operacional.tsx", 3],
    ["src/components/qualidade/painel.tsx", 1],
    ["src/routes/_authenticated/ordens-servico.tsx", 1],
    ["src/routes/_authenticated/ops-excecoes.tsx", 1],
    ["src/routes/_authenticated/pesquisa-modulo.index.tsx", 1],
  ];

  for (const [arquivo, quantas] of SELETORES) {
    it(`${arquivo} filtra ${quantas} lista(s) de opções`, () => {
      const src = ler(arquivo);
      expect(src).toContain('from "@/lib/fixtures"');
      expect((src.match(/semFixtures\(/g) ?? []).length).toBeGreaterThanOrEqual(quantas);
    });
  }

  it("abrir caso operacional é o caso mais grave e está coberto", () => {
    // Abrir um caso real com cliente de demonstração contamina a operação
    // inteira a jusante: contrato, OS, financeiro e App.
    const src = ler("src/components/caso/abrir-caso-motor.tsx");
    expect(src).toMatch(/semFixtures\(clientes as LinhaComOrigem\[\]\)/);
  });

  it("as listas com alternância própria não foram tocadas — o toggle continua", () => {
    // Estas telas já escondiam por padrão e deixam a pessoa pedir para ver.
    expect(ler("src/routes/_authenticated/casos.index.tsx")).toContain("mostrarDemo");
    expect(ler("src/components/crm/painel-calls.tsx")).toContain("mostrarTeste");
  });
});
