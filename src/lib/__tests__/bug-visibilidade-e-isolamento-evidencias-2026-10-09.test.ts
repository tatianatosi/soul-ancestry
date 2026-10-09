import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Dois bugs medidos no caso da Ana (CA-CID-AT-FAM-2026-001) em 09/10/2026,
 * reportados pela Proprietária com print.
 *
 * 1. "Não consigo mudar a visibilidade de nenhum parente da Ana para
 *    aprovada; salva e não persiste." Medido no banco: os 6 ancestrais estão
 *    `aprovada`, e exatamente os 4 vivos (Ana, Adair, Alice, Felipe) estão
 *    presos em `interna`. Causa: o seletor gravava no rascunho, mas
 *    `client_visibility` não estava no payload do botão "Salvar perfil" —
 *    os outros campos salvavam, então o toast dizia "salvo".
 *
 * 2. "Na tabela de evidências só tem demos linkados." Medido: o seletor lia
 *    `research_evidence_items` da ORGANIZAÇÃO INTEIRA, sem filtrar pelo
 *    caso — entravam as 4 evidências "DEMO —" do caso 3f2b7d10 ao lado da
 *    única real da Ana. Vazamento entre casos, não só ruído de lista.
 */

const TELA = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");
const LEITOR = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");

describe("visibilidade ao cliente chega ao servidor", () => {
  it("o payload de Salvar perfil inclui client_visibility", () => {
    const payload = TELA.slice(TELA.indexOf("onSalvar(p.id, {"), TELA.indexOf("}, () =>"));
    expect(payload).toContain("client_visibility: e.client_visibility");
  });

  it("o campo que o seletor edita é o mesmo que o payload envia", () => {
    expect(TELA).toContain('set("client_visibility", v)');
  });

  it("client_visibility continua gravável no servidor", () => {
    const campos = LEITOR.slice(LEITOR.indexOf("const CAMPOS_PERFIL"), LEITOR.indexOf("const CAMPOS_VARIANTE"));
    expect(campos).toContain('"client_visibility"');
  });
});

describe("evidência e fonte são do caso, nunca da organização inteira", () => {
  it("as duas consultas filtram por research_case_id das pesquisas do caso", () => {
    const trecho = LEITOR.slice(
      LEITOR.indexOf('.from("research_evidence_items")'),
      LEITOR.indexOf('org("nucleos_familiares")'),
    );
    expect(trecho).toContain('.in("research_case_id", pesquisaIds)');
    expect(trecho.match(/\.in\("research_case_id", pesquisaIds\)/g)).toHaveLength(2);
  });

  it("caso sem pesquisa devolve lista vazia, não a da organização", () => {
    const trecho = LEITOR.slice(
      LEITOR.indexOf('.from("research_evidence_items")') - 400,
      LEITOR.indexOf('org("nucleos_familiares")'),
    );
    expect(trecho).toContain("pesquisaIds.length");
    expect(trecho).toContain("Promise.resolve({ data: [] as any[] })");
  });

  it("nenhuma das duas lê a tabela sem o filtro de caso", () => {
    for (const tabela of ["research_evidence_items", "research_sources"]) {
      const i = LEITOR.indexOf(`.from("${tabela}")`);
      const bloco = LEITOR.slice(i, i + 320);
      expect(bloco).toContain('.in("research_case_id", pesquisaIds)');
    }
  });
});
