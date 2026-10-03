import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ehFixtureLinha, semFixtures } from "@/lib/fixtures";

/**
 * Corte 1c-bis (03/10/2026) — item 4 da lista da Proprietária: "remover demos
 * dos seletores restantes e provar no caso Ana".
 *
 * Medido no banco ao vivo em 03/10: dos 4 casos ativos, DOIS são
 * demo/teste — `CA-DEMO-IT-2026-001` (demo = true, data_origin =
 * 'fixture_demo') e `CA-TESTE-VAL-2026-001` (as três flags em false; só a
 * rede de segurança do rótulo o pega). Os dois apareciam no painel de
 * Formalização e no seletor do checklist de Qualidade, ao lado do caso real
 * da Ana (`CA-CID-AT-FAM-2026-001`). Fixture continua no banco — sai só das
 * listas operacionais.
 */

/** As 4 linhas reais de `crm_casos` ativas, como o banco devolveu em 03/10. */
const CASOS_REAIS_DO_BANCO = [
  {
    codigo: "CA-DEMO-IT-2026-001",
    titulo: "Pesquisa genealógica — família Prade (demo)",
    demo: true,
    dados_teste: false,
    data_origin: "fixture_demo",
  },
  {
    codigo: "CA-TESTE-VAL-2026-001",
    titulo: "TESTE - Validacao do motor contratual",
    demo: false,
    dados_teste: false,
    data_origin: "real",
  },
  {
    codigo: "CA-CID-AT-FAM-2026-001",
    titulo: "Projeto familiar — Ana Luiza",
    demo: false,
    dados_teste: false,
    data_origin: "real",
  },
  {
    codigo: "CA-CID-PT-IND-2026-002",
    titulo: "Cidadania portuguesa por etapas — João (diagnóstico)",
    demo: false,
    dados_teste: false,
    data_origin: "real",
  },
];

describe("Corte 1c-bis — prova no dado real: só os dois casos demo/teste saem, Ana fica", () => {
  it("o caso da Ana nunca é tratado como fixture", () => {
    const ana = CASOS_REAIS_DO_BANCO.find((c) => c.codigo === "CA-CID-AT-FAM-2026-001")!;
    expect(ehFixtureLinha(ana)).toBe(false);
  });

  it("o caso demo sai pela flag e pelo data_origin", () => {
    const demo = CASOS_REAIS_DO_BANCO.find((c) => c.codigo === "CA-DEMO-IT-2026-001")!;
    expect(ehFixtureLinha(demo)).toBe(true);
  });

  it("o caso de TESTE sai só pela rede de segurança do rótulo — as três flags estão em false no banco", () => {
    const teste = CASOS_REAIS_DO_BANCO.find((c) => c.codigo === "CA-TESTE-VAL-2026-001")!;
    expect(teste.demo).toBe(false);
    expect(teste.dados_teste).toBe(false);
    expect(teste.data_origin).toBe("real");
    expect(ehFixtureLinha(teste)).toBe(true);
  });

  it("a lista operacional fica com os 2 casos reais, nesta ordem, sem apagar nada", () => {
    const operacional = semFixtures(CASOS_REAIS_DO_BANCO);
    expect(operacional.map((c) => c.codigo)).toEqual([
      "CA-CID-AT-FAM-2026-001",
      "CA-CID-PT-IND-2026-002",
    ]);
    expect(CASOS_REAIS_DO_BANCO).toHaveLength(4);
  });
});

describe("Corte 1c-bis — os seletores que ainda listavam tudo passaram a filtrar", () => {
  const alvos = [
    { arquivo: "src/lib/formalizacao-painel.functions.ts", motivo: "pipeline de Formalização" },
    { arquivo: "src/lib/qualidade.functions.ts", motivo: "seletor de caso do checklist" },
    { arquivo: "src/lib/clientes.functions.ts", motivo: "detecção de duplicidade de cliente" },
  ];

  for (const { arquivo, motivo } of alvos) {
    it(`${motivo} usa semFixtures do helper canônico`, () => {
      const src = readFileSync(arquivo, "utf8");
      expect(src, arquivo).toContain('from "@/lib/fixtures"');
      expect(src, arquivo).toContain("semFixtures(");
    });
  }

  it("quem filtra por flag também as SELECIONA — sem a coluna, o filtro não teria o que ler", () => {
    const formalizacao = readFileSync("src/lib/formalizacao-painel.functions.ts", "utf8");
    expect(formalizacao).toContain("demo,dados_teste,data_origin");
    const qualidade = readFileSync("src/lib/qualidade.functions.ts", "utf8");
    expect(qualidade).toContain("demo,dados_teste,data_origin");
    const clientes = readFileSync("src/lib/clientes.functions.ts", "utf8");
    expect(clientes).toContain("demo, is_demo, data_origin");
  });
});

describe("Corte 1c-bis — o que NÃO foi filtrado, e por quê (declarado, não esquecido)", () => {
  it("a origem de escopo rotula a fixture em vez de escondê-la: é tela de auditoria", () => {
    const src = readFileSync("src/lib/escopo-origem.ts", "utf8");
    expect(src).toContain("fixture_demo");
    expect(src).toMatch(/fixture: Boolean\(/);
  });

  it("leitura de caso único por id não é seletor e segue sem filtro (o caso já foi escolhido)", () => {
    const src = readFileSync("src/lib/fontes-documentos.functions.ts", "utf8");
    expect(src).toContain('.eq("id", caseId)');
    expect(src).not.toContain("semFixtures(");
  });
});
