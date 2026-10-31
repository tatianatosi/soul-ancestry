import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { pontesDeUniaoDeRamos, TIPO_UNIAO_RAMOS, validarUniaoDeRamos } from "@/lib/uniao-ramos";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";

/**
 * Corte 3c (03/10/2026) — a União de Ramos era aprovada desde 01/10 e tinha
 * só metade construída: a migration do vínculo (20261001120000) e a leitura
 * das duas pontas existiam, o escritor nunca existiu, e a aba Jornada montava
 * a ponte a partir de dois ids fixos da demo Sophia. Para cliente real a
 * ponte não aparecia nunca — mesmo com o campo pronto no banco.
 */

const legendas = (pares: [string, string][]) => new Map(pares);

describe("pontesDeUniaoDeRamos — vínculo explícito por id, nunca inferido", () => {
  const união = {
    id: "u1",
    projection_type: TIPO_UNIAO_RAMOS,
    content_sanitized: "O registro de 1912 confirma o ramo investigado nesta etapa.",
    source_entity_id: "p-historia",
    vinculo_projecao_id: "p-processo",
  };

  it("devolve a ponte quando as duas pontas estão visíveis ao cliente", () => {
    const pontes = pontesDeUniaoDeRamos(
      [união],
      ["p-historia", "p-processo"],
      legendas([["u1", "O registro de 1912 confirma o ramo investigado nesta etapa."]]),
    );
    expect(pontes).toEqual([
      {
        id: "u1",
        historiaProjecaoId: "p-historia",
        casoProjecaoId: "p-processo",
        legenda: "O registro de 1912 confirma o ramo investigado nesta etapa.",
      },
    ]);
  });

  it("NÃO devolve a ponte quando uma das pontas não chegou ao cliente", () => {
    // Ponta descartada pelo filtro de fronteira deixaria um elo pendurado na
    // tela — melhor ausência do que elo apontando para o nada.
    expect(pontesDeUniaoDeRamos([união], ["p-historia"], legendas([["u1", "x".repeat(20)]]))).toEqual([]);
    expect(pontesDeUniaoDeRamos([união], [], legendas([["u1", "x".repeat(20)]]))).toEqual([]);
  });

  it("ignora união sem as duas pontas, com pontas iguais, ou sem legenda sanitizada", () => {
    const base = { projection_type: TIPO_UNIAO_RAMOS, content_sanitized: "texto" };
    const casos = [
      { ...base, id: "a", source_entity_id: "x", vinculo_projecao_id: null },
      { ...base, id: "b", source_entity_id: null, vinculo_projecao_id: "y" },
      { ...base, id: "c", source_entity_id: "x", vinculo_projecao_id: "x" },
    ];
    expect(pontesDeUniaoDeRamos(casos, ["x", "y"], legendas([["a", "t"], ["b", "t"], ["c", "t"]]))).toEqual([]);
    // Legenda vazia = descartada pelo sanitizador de quem chama.
    expect(
      pontesDeUniaoDeRamos([união], ["p-historia", "p-processo"], legendas([["u1", "   "]])),
    ).toEqual([]);
  });

  it("não inventa ponte a partir de outro tipo de projeção", () => {
    const achado = { id: "a1", projection_type: "achado", content_sanitized: "t", source_entity_id: "p-historia", vinculo_projecao_id: "p-processo" };
    expect(pontesDeUniaoDeRamos([achado], ["p-historia", "p-processo"], legendas([["a1", "t"]]))).toEqual([]);
  });

  it("a mesma dupla publicada duas vezes conta uma — a tela mostra o encontro, não a republicação", () => {
    const pontes = pontesDeUniaoDeRamos(
      [união, { ...união, id: "u2" }],
      ["p-historia", "p-processo"],
      legendas([["u1", "legenda um aqui"], ["u2", "legenda dois aqui"]]),
    );
    expect(pontes).toHaveLength(1);
  });
});

describe("validarUniaoDeRamos — recusa antes de gravar, com motivo nomeado", () => {
  const ok = { historiaProjecaoId: "a", casoProjecaoId: "b", legenda: "legenda suficientemente longa", idsPublicadosDoCaso: ["a", "b"] };

  it("aceita o caso válido", () => {
    expect(validarUniaoDeRamos(ok)).toEqual([]);
  });

  it("recusa ponta ausente, ponta repetida e ponta não publicada", () => {
    expect(validarUniaoDeRamos({ ...ok, casoProjecaoId: "" }).join(" ")).toContain("duas pontas");
    expect(validarUniaoDeRamos({ ...ok, casoProjecaoId: "a" }).join(" ")).toContain("união consigo mesma");
    expect(validarUniaoDeRamos({ ...ok, idsPublicadosDoCaso: ["a"] }).join(" ")).toContain("processo não está publicada");
  });

  it("recusa legenda curta — é o texto que o cliente lê", () => {
    expect(validarUniaoDeRamos({ ...ok, legenda: "curta" }).join(" ")).toContain("legenda");
  });
});

describe("jornadaSanitizada — a união é ponte, não um marco a mais", () => {
  const brutas = [
    { id: "p-historia", projection_type: "achado", content_sanitized: "Encontramos o registro de casamento de 1912.", effective_from: "2026-09-01" },
    { id: "p-processo", projection_type: "marco", content_sanitized: "A etapa de conferência começou.", effective_from: "2026-09-10" },
    {
      id: "u1",
      projection_type: TIPO_UNIAO_RAMOS,
      content_sanitized: "O registro de 1912 confirma o ramo investigado nesta etapa.",
      source_entity_id: "p-historia",
      vinculo_projecao_id: "p-processo",
      effective_from: "2026-09-11",
    },
  ];

  it("a união sai da linha de marcos e entra em pontes — sem contar duas vezes", () => {
    const j = jornadaSanitizada(brutas as never);
    expect(j.linha.map((p) => p.id).sort()).toEqual(["p-historia", "p-processo"]);
    expect(j.marcosPublicados).toBe(2);
    expect(j.pontes).toHaveLength(1);
    expect(j.pontes[0].historiaProjecaoId).toBe("p-historia");
  });

  it("caso sem união nenhuma devolve pontes vazias, não erro nem texto inventado", () => {
    const j = jornadaSanitizada(brutas.slice(0, 2) as never);
    expect(j.pontes).toEqual([]);
  });
});

describe("Corte 3c — o escritor existe e a aba Jornada deixou de depender da demo", () => {
  it("existe escritor real, com persistência verificada e auditoria", () => {
    const src = readFileSync("src/lib/uniao-ramos.functions.ts", "utf8");
    expect(src).toContain("export const publicarUniaoDeRamos");
    expect(src).toContain("export const despublicarUniaoDeRamos");
    expect(src).toContain("inserirComVerificacao");
    expect(src).toContain("gravarComVerificacao");
    expect(src).toContain("audit_logs");
    expect(src).toContain("registrarTimelineCaso");
    // A fronteira do App vale para a legenda como para qualquer texto.
    expect(src).toContain("exigirPublicavelNoApp");
    // Despublicar arquiva com motivo; nunca apaga.
    expect(src).toContain('approval_status: "archived"');
    expect(src).not.toMatch(/\.delete\(\)/);
  });

  it("as pontas são lidas do banco, não aceitas da chamada", () => {
    const src = readFileSync("src/lib/uniao-ramos.functions.ts", "utf8");
    const leitura = src.indexOf("idsPublicadosDoCaso =");
    const validacao = src.indexOf("validarUniaoDeRamos({");
    expect(leitura).toBeGreaterThan(-1);
    expect(validacao).toBeGreaterThan(leitura);
  });

  it("uma união nunca é ponta de outra união", () => {
    const src = readFileSync("src/lib/uniao-ramos.functions.ts", "utf8");
    expect(src).toContain("tipo !== TIPO_UNIAO_RAMOS");
  });

  it("o Desk tem painel montado na Jornada do Caso 360", () => {
    const caso = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    const aba = caso.search(/<SecaoAncora\s+id="jornada"/);
    const painel = caso.indexOf("<PublicarUniaoRamos caseId={id} />", aba);
    expect(aba).toBeGreaterThan(-1);
    expect(painel).toBeGreaterThan(aba);
  });

  it("a aba Jornada monta as pontes do caso real a partir de jornada.pontes", () => {
    const src = readFileSync("src/routes/portal/jornada.tsx", "utf8");
    expect(src).toContain("jornada.pontes");
    // O demo segue existindo, mas só no ramo do demo.
    const demo = src.indexOf("UNIAO_DE_RAMOS_DEMO_SOPHIA.historiaProjecaoId");
    const ramoDemo = src.lastIndexOf("if (ehDemo) {", demo);
    expect(ramoDemo).toBeGreaterThan(-1);
    expect(demo).toBeGreaterThan(ramoDemo);
  });
});
