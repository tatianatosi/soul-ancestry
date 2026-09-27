import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Auditoria pós-execução da Fase 3 (27/09/2026): o hub de Pesquisa
 * mostrava só um resumo em texto livre ("Hipótese interna") como se
 * cobrisse hipótese — a lista estruturada real (research_case_hypotheses,
 * com status/categoria/confiança) vivia isolada em /pesquisa-modulo/$id,
 * nunca alcançável a partir do hub. Fecha o link, sem fundir tabela.
 */
describe("Fase 3 (pós-auditoria) — hub linka para hipóteses estruturadas, sem fundir dado", () => {
  const pagina = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");

  it("rótulo do campo de texto livre foi clarificado (não é mais chamado só de 'Hipótese interna')", () => {
    expect(pagina).toContain("Hipótese interna (resumo em texto)");
  });

  it("link condicional para /pesquisa-modulo/$id usa c.pesquisa.id (o próprio research_case_id já carregado)", () => {
    expect(pagina).toContain('to="/pesquisa-modulo/$id"');
    expect(pagina).toContain("params={{ id: c.pesquisa.id }}");
    expect(pagina).toContain("Abrir hipóteses estruturadas");
  });

  it("link é condicional a c?.pesquisa?.id existir (nunca aponta para um id vazio)", () => {
    const inicio = pagina.indexOf('to="/pesquisa-modulo/$id"');
    const trecho = pagina.slice(Math.max(0, inicio - 400), inicio);
    expect(trecho).toContain("c?.pesquisa?.id ?");
  });

  it("nenhum novo writer de hipótese foi introduzido no hub (leitura + link, nada mais)", () => {
    expect(pagina).not.toContain('.from("research_case_hypotheses"');
    expect(pagina).not.toContain('.from("research_hypotheses"');
  });
});

describe("Fase 3 (pós-auditoria) — pesquisa-modulo continua a única superfície de CRUD de hipótese estruturada", () => {
  const funcoes = readFileSync("src/lib/pesquisa-modulo.functions.ts", "utf8");

  it("research_case_id referencia research_cases.id (confirma que c.pesquisa.id é o parâmetro certo)", () => {
    expect(funcoes).toContain('.from("research_cases")');
    expect(funcoes).toContain('.select("case_id")');
    expect(funcoes).toContain('.eq("id", data.researchCaseId)');
  });
});
