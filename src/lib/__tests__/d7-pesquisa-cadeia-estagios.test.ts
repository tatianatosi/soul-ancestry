import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

import { CADEIA_PESQUISA, estagiosCadeiaPesquisa } from "@/lib/pesquisa-cadeia";

/**
 * D7 (§17 do De-Para — Desk Pesquisa, linha 6: "Faixa de processo... Cada
 * etapa precisa ter artefato/estado"). Conecta a cadeia canônica já
 * existente e testada (`CADEIA_PESQUISA`, usada por `/pesquisa-evidencias`)
 * ao dossiê nav-canônico `/pesquisa-modulo/$id`, sem query nova e sem
 * inventar um segundo vocabulário de estágio.
 */

describe("D7 · estagiosCadeiaPesquisa — função pura", () => {
  it("devolve os 6 estágios internos, excluindo 'app' (fronteira sanitizada, fora deste dossiê)", () => {
    const estagios = estagiosCadeiaPesquisa({
      pessoas: 0,
      fontes: 0,
      evidencias: 0,
      evidenciasValidadas: 0,
      hipotesesComResultado: 0,
      relatorios: 0,
    });
    expect(estagios).toHaveLength(CADEIA_PESQUISA.length - 1);
    expect(estagios.some((e) => (e.etapa as string) === "app")).toBe(false);
  });

  it("cada estágio reflete se há artefato real, sem inventar estado intermediário", () => {
    const estagios = estagiosCadeiaPesquisa({
      pessoas: 2,
      fontes: 0,
      evidencias: 3,
      evidenciasValidadas: 0,
      hipotesesComResultado: 0,
      relatorios: 0,
    });
    const porEtapa = Object.fromEntries(estagios.map((e) => [e.etapa, e.temArtefato]));
    expect(porEtapa["ficha"]).toBe(true);
    expect(porEtapa["fonte"]).toBe(false);
    expect(porEtapa["evidencia"]).toBe(true);
    expect(porEtapa["validacao"]).toBe(false);
    expect(porEtapa["achado"]).toBe(false);
    expect(porEtapa["relatorio"]).toBe(false);
  });

  it("validação e achado exigem estado avançado, não só existência da linha crua", () => {
    // evidencias=5 mas nenhuma validada; hipoteses=4 mas nenhuma com resultado
    const estagios = estagiosCadeiaPesquisa({
      pessoas: 1,
      fontes: 1,
      evidencias: 5,
      evidenciasValidadas: 0,
      hipotesesComResultado: 0,
      relatorios: 0,
    });
    const porEtapa = Object.fromEntries(estagios.map((e) => [e.etapa, e.temArtefato]));
    expect(porEtapa["evidencia"]).toBe(true);
    expect(porEtapa["validacao"]).toBe(false);
    expect(porEtapa["achado"]).toBe(false);
  });

  it("mantém rotulo e produz do CADEIA_PESQUISA original — não redefine texto", () => {
    const estagios = estagiosCadeiaPesquisa({
      pessoas: 0,
      fontes: 0,
      evidencias: 0,
      evidenciasValidadas: 0,
      hipotesesComResultado: 0,
      relatorios: 0,
    });
    for (const e of estagios) {
      const original = CADEIA_PESQUISA.find((c) => c.etapa === e.etapa);
      expect(original).toBeDefined();
      expect(e.rotulo).toBe(original?.rotulo);
      expect(e.produz).toBe(original?.produz);
    }
  });
});

describe("D7 · PainelPesquisaModulo renderiza a faixa de processo", () => {
  const componente = readFileSync(
    resolve(__dirname, "../../components/pesquisa/modulo.tsx"),
    "utf8",
  );

  it("importa e usa estagiosCadeiaPesquisa, sem query nova", () => {
    expect(componente).toMatch(/from "@\/lib\/pesquisa-cadeia"/);
    expect(componente).toContain("estagiosCadeiaPesquisa(");
  });

  it("renderiza o bloco com data-pesquisa-cadeia-estagios, marcado por etapa", () => {
    expect(componente).toContain("data-pesquisa-cadeia-estagios");
    expect(componente).toContain("data-pesquisa-cadeia-estagio=");
    expect(componente).toContain("data-pesquisa-cadeia-tem-artefato=");
  });

  it("é colocado logo após o cabeçalho da pesquisa, antes das abas", () => {
    const idxFaixa = componente.indexOf("<EstagiosDaCadeia");
    const idxAbas = componente.indexOf("{ABAS.map(");
    expect(idxFaixa).toBeGreaterThan(0);
    expect(idxAbas).toBeGreaterThan(idxFaixa);
  });

  it("declara a divergência de vocabulário §29 no comentário da fonte", () => {
    const cadeia = readFileSync(resolve(__dirname, "../pesquisa-cadeia.ts"), "utf8");
    expect(cadeia).toMatch(/DIVERGÊNCIA REGISTRADA \(§29\)/);
  });
});
