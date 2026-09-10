import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA21-BIBLIOTECA-MESTRE-CONECTADA (09/09/2026) — auditoria mostrou que
 * Acervo, Bases Genealógicas, Dicionários/Taxonomias e Trilhas já estão
 * conectados a usos concretos:
 *  - Bases/Dicionários/Trilhas/Acervo/Jurídico → Pesquisa, via
 *    referenciasNormativasDoCaso + ConsultaBasesHomologadas
 *    (pesquisa-evidencias.$caseId.tsx).
 *  - Catálogo (product_catalog/top30) → Comercial, via cadeia-operacional
 *    (SKU/preço/condição comercial — já extenso, não duplicado aqui).
 *  - Trilhas → Comercial/Leads, via trilha_referencia_id (leads.tsx).
 *
 * O único subárea sem nenhum uso concreto era "Modelos F1/F2"
 * (master_library_items, categoria=modelos): a Biblioteca Mestre já governa
 * versão/homologação de modelo de relatório, mas relatorios-fase (onde F1..F5
 * são de fato elaborados) nunca lia essa referência. case_reports não tem
 * campo de vínculo (mudança de schema fica fora desta CA); a conexão feita
 * aqui é de leitura: mostrar o modelo homologado no ponto de uso, sem gravar
 * vínculo novo nem duplicar a tela cheia da Biblioteca Mestre.
 */

describe("CA21 — Modelos F1/F2 da Biblioteca Mestre visíveis em Relatórios de fase", () => {
  it("painelRelatoriosFase lê master_library_items categoria=modelos, escopado por organização", () => {
    const arquivo = readFileSync("src/lib/relatorios-fase.functions.ts", "utf8");
    const bloco = arquivo.slice(
      arquivo.indexOf("export const painelRelatoriosFase"),
      arquivo.indexOf("export const salvarRelatorioFase"),
    );
    expect(bloco).toContain('.from("master_library_items")');
    expect(bloco).toContain('.eq("categoria", "modelos")');
    expect(bloco).toContain('.eq("organization_id", organizationId)');
    expect(bloco).toContain("modelosBiblioteca");
  });

  it("não introduz escrita nova em master_library_items nem em case_reports para o vínculo", () => {
    const arquivo = readFileSync("src/lib/relatorios-fase.functions.ts", "utf8");
    const bloco = arquivo.slice(
      arquivo.indexOf("export const painelRelatoriosFase"),
      arquivo.indexOf("export const salvarRelatorioFase"),
    );
    expect(bloco).not.toMatch(/\.insert\(/);
    expect(bloco).not.toMatch(/\.update\(/);
  });

  it("a rota de relatórios de fase renderiza o painel de modelos homologados e linka para a Biblioteca Mestre completa (sem duplicar a tela)", () => {
    const rota = readFileSync("src/routes/_authenticated/relatorios-fase.$caseId.tsx", "utf8");
    expect(rota).toContain("Modelos F1/F2 homologados");
    expect(rota).toContain("modelosBiblioteca");
    expect(rota).toContain('to="/biblioteca"');
  });

  it('"sem dado" declarado quando não há modelo cadastrado, nunca lista vazia silenciosa', () => {
    const rota = readFileSync("src/routes/_authenticated/relatorios-fase.$caseId.tsx", "utf8");
    const bloco = rota.slice(rota.indexOf("Modelos F1/F2 homologados"), rota.indexOf("Modelos F1/F2 homologados") + 1200);
    expect(bloco).toMatch(/Sem dado/);
  });
});

describe("CA21 — usos concretos já existentes das demais subáreas não foram duplicados (regressão)", () => {
  it("Bases/Dicionários/Trilhas/Acervo/Jurídico seguem lidos por referenciasNormativasDoCaso, única fonte para Pesquisa", () => {
    const arquivo = readFileSync("src/lib/referencias-normativas.functions.ts", "utf8");
    for (const tabela of [
      "master_library_items",
      "citizenship_tracks",
      "controlled_taxonomies",
      "versioned_legal_rules",
      "genealogical_sources_catalog",
    ]) {
      expect(arquivo).toContain(`.from("${tabela}")`);
    }
  });

  it("Catálogo (product_catalog) segue conectado ao Comercial via cadeia-operacional, não recriado aqui", () => {
    const arquivo = readFileSync("src/lib/cadeia-operacional.server.ts", "utf8");
    expect(arquivo).toContain('"product_catalog"');
  });

  it("Trilhas seguem conectadas a Leads/Comercial via trilha_referencia_id", () => {
    const arquivo = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
    expect(arquivo).toContain("listarTrilhasJuridicas");
    expect(arquivo).toContain("trilha_referencia_id");
  });
});
