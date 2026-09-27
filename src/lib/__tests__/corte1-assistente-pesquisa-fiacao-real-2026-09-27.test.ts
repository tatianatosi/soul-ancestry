import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { mapearEvidenciaEstruturada, mapearHipoteseEstruturada } from "@/lib/pesquisa-ia.server";

/**
 * Corte 1 (27/09/2026): o Assistente de Pesquisa já existia e funcionava,
 * mas lia as tabelas erradas/vazias (research_hypotheses, evidencias) em vez
 * das reais e populadas (research_case_hypotheses, research_evidence_items,
 * chaveadas por research_case_id). Corrige a fiação, sem mudar o formato do
 * dossiê nem criar segunda fonte.
 */
describe("Corte 1 — rota do assistente lê as tabelas reais, via research_case_id", () => {
  const rota = readFileSync("src/routes/api/pesquisa-assistente.ts", "utf8");

  it("resolve research_case_id a partir de research_cases.case_id", () => {
    expect(rota).toContain('.from("research_cases")');
    expect(rota).toContain('.eq("case_id", body.casoId)');
  });

  it("consulta research_case_hypotheses e research_evidence_items por research_case_id", () => {
    expect(rota).toContain('listaPorResearchCase("research_case_hypotheses")');
    expect(rota).toContain('listaPorResearchCase("research_evidence_items")');
    expect(rota).toContain('.eq("research_case_id", researchCaseId)');
  });

  it("não lê mais as tabelas antigas/vazias como fonte de hipótese/evidência do caso", () => {
    expect(rota).not.toContain('lista("research_hypotheses", "case_id")');
    expect(rota).not.toContain('lista("evidencias", "caso_id")');
  });

  it("sem research_case (caso ainda sem pesquisa estruturada), devolve listas vazias em vez de erro", () => {
    const inicio = rota.indexOf("listaPorResearchCase = (tabela: string)");
    const trecho = rota.slice(inicio, inicio + 500);
    expect(trecho).toContain("researchCaseId");
    expect(trecho).toContain("Promise.resolve({ data: [] as Record<string, unknown>[] })");
  });
});

describe("Corte 1 — tradução de colunas reais para o formato do dossiê (montarDossie inalterado)", () => {
  it("mapearHipoteseEstruturada traduz title/status/confidence_level/related_person_id/statement", () => {
    const h = mapearHipoteseEstruturada({
      id: "h1",
      title: "Linha materna via avó Silveira",
      status: "under_review",
      confidence_level: "medium",
      related_person_id: "p1",
      statement: "Avó materna nasceu na Itália antes de 1948.",
    });
    expect(h).toEqual({
      id: "h1",
      titulo: "Linha materna via avó Silveira",
      status: "under_review",
      grau_confianca: "medium",
      person_id: "p1",
      descricao: "Avó materna nasceu na Itália antes de 1948.",
      justificativa: null,
    });
  });

  it("mapearEvidenciaEstruturada traduz title/evidence_type/evidence_status/confidence_level/description", () => {
    const e = mapearEvidenciaEstruturada({
      id: "e1",
      title: "Certidão de nascimento",
      evidence_type: "registry_entry",
      evidence_status: "validated",
      confidence_level: "high",
      external_reference: "Cartório de Roma, livro 12",
      person_id: "p1",
      description: "Certidão original localizada.",
      validation_rationale: "Conferida contra o original.",
    });
    expect(e.titulo).toBe("Certidão de nascimento");
    expect(e.tipo).toBe("registry_entry");
    expect(e.status).toBe("validated");
    expect(e.grau_confianca).toBe("high");
    expect(e.fonte).toBe("Cartório de Roma, livro 12");
    expect(e.person_id).toBe("p1");
    expect(e.descricao).toBe("Certidão original localizada.");
    expect(e.observacao).toBe("Conferida contra o original.");
  });
});
