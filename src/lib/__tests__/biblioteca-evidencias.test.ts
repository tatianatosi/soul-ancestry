import { describe, expect, it } from "vitest";

import {
  cadeiaDaEvidencia,
  conteudoProjetavel,
  evidenciaProjetavel,
  itensVisiveisNoApp,
  validarElevacaoConfianca,
  validarEvidencia,
  validarProjecao,
} from "@/lib/biblioteca-evidencias";

const evidenciaBase = {
  id: "ev-1",
  case_id: "caso-1",
  title_internal: "Certidão de nascimento — Adair",
  evidence_type: "certidao_nascimento",
  evidence_nature: "documental_oficial",
  access_level: "cliente_autorizado",
  workflow_status: "aprovada_para_entrega",
  epistemic_validation_status: "EM_VALIDACAO_DOCUMENTAL",
  confidence_level: "MEDIO",
};

describe("G-03 — evidências", () => {
  it("1. evidência interna não aparece no App sem projeção aprovada", () => {
    const visivel = itensVisiveisNoApp([evidenciaBase], [
      { id: "p1", approval_status: "approved", destination: "app", content_sanitized: "Marco de pesquisa concluído." },
    ]);
    expect(visivel.evidencias).toHaveLength(0);
    expect(visivel.projecoes).toHaveLength(0);
  });

  it("1b. só projeção publicada e sanitizada chega ao App", () => {
    const visivel = itensVisiveisNoApp([evidenciaBase], [
      { id: "p1", approval_status: "published", destination: "app", content_sanitized: "Marco de pesquisa concluído." },
    ]);
    expect(visivel.projecoes).toHaveLength(1);
    expect(visivel.projecoes[0]?.disclaimer).toContain("Não constitui parecer jurídico");
  });

  it("2. busca negativa persiste como evidência válida com fonte, data e próxima ação", () => {
    const negativa = {
      ...evidenciaBase,
      evidence_nature: "busca_negativa",
      negative_search_source: "Arquivo paroquial de Bolzano",
      negative_search_date: "2026-08-10",
      negative_search_next_action: "Solicitar índice decenal do mesmo período.",
    };
    expect(validarEvidencia(negativa).ok).toBe(true);
    expect(validarEvidencia({ ...negativa, negative_search_next_action: "" }).ok).toBe(false);
  });

  it("3. salto de confiança sem revisão é negado", () => {
    const semRevisao = validarElevacaoConfianca({ anterior: "BAIXO", nova: "MEDIO" });
    expect(semRevisao.ok).toBe(false);
    const salto = validarElevacaoConfianca({
      anterior: "INICIAL",
      nova: "ALTO",
      justificativa: "Documento oficial conferido em cartório.",
      revisadoPor: "u1",
      revisadoEm: "2026-08-20",
    });
    expect(salto.ok).toBe(false);
    expect(salto.erros.join(" ")).toContain("INICIAL para ALTO");
    const valida = validarElevacaoConfianca({
      anterior: "BAIXO",
      nova: "MEDIO",
      justificativa: "Certidão original conferida com o registro civil.",
      revisadoPor: "u1",
      revisadoEm: "2026-08-20",
    });
    expect(valida.ok).toBe(true);
  });

  it("4. conteúdo com URL interna ou nota interna não pode compor projeção", () => {
    expect(conteudoProjetavel("Veja https://drive.google.com/arquivo").ok).toBe(false);
    expect(conteudoProjetavel("Hipótese de vínculo com a linha materna.").ok).toBe(false);
    expect(conteudoProjetavel("Registro de nascimento localizado no arquivo paroquial.").ok).toBe(true);
  });

  it("5. evidência restrita não é projetável", () => {
    expect(evidenciaProjetavel({ ...evidenciaBase, access_level: "restrito" }).ok).toBe(false);
    expect(evidenciaProjetavel({ ...evidenciaBase, workflow_status: "em_revisao" }).ok).toBe(false);
    expect(evidenciaProjetavel(evidenciaBase).ok).toBe(true);
  });

  it("6. fonte colaborativa não valida sozinha vínculo ou direito", () => {
    const colaborativa = {
      ...evidenciaBase,
      evidence_nature: "colaborativa_familiar",
      epistemic_validation_status: "VALIDADO_POR_DOCUMENTO",
    };
    expect(validarEvidencia(colaborativa).ok).toBe(false);
    expect(validarEvidencia({ ...colaborativa, evidence_nature: "colaborativa_familiar", epistemic_validation_status: "INFORMACAO_COMPARTILHADA_FAMILIA", confidence_level: "ALTO" }).ok).toBe(false);
  });

  it("7. validação por documento exige responsável e data", () => {
    const semRevisor = { ...evidenciaBase, epistemic_validation_status: "VALIDADO_POR_DOCUMENTO" };
    expect(validarEvidencia(semRevisor).ok).toBe(false);
    expect(validarEvidencia({ ...semRevisor, reviewed_by: "u1", reviewed_at: "2026-08-20" }).ok).toBe(true);
  });

  it("8. projeção aprovada exige aprovador, data e evidência elegível", () => {
    const p = {
      projection_type: "marco_de_pesquisa",
      destination: "app",
      content_sanitized: "Registro localizado e conferido.",
      approval_status: "approved",
    };
    expect(validarProjecao(p, evidenciaBase).ok).toBe(false);
    expect(
      validarProjecao({ ...p, approved_by: "u1", approved_at: "2026-08-20" }, evidenciaBase).ok,
    ).toBe(true);
    expect(
      validarProjecao({ ...p, approved_by: "u1", approved_at: "2026-08-20" }, { ...evidenciaBase, access_level: "restrito" }).ok,
    ).toBe(false);
  });

  it("9. cadeia evidência → validação → projeção é auditável", () => {
    const c = cadeiaDaEvidencia(
      evidenciaBase,
      [
        { id: "v2", evidence_id: "ev-1", revisado_em: "2026-08-12", confianca_nova: "MEDIO" },
        { id: "v1", evidence_id: "ev-1", revisado_em: "2026-08-10", confianca_nova: "BAIXO" },
        { id: "v3", evidence_id: "outra", revisado_em: "2026-08-11", confianca_nova: "BAIXO" },
      ],
      [{ id: "p1", source_entity_type: "evidence", source_entity_id: "ev-1", approval_status: "published", destination: "app" }],
    );
    expect(c.validacoes.map((v) => v["id"])).toEqual(["v1", "v2"]);
    expect(c.publicadaNoApp).toBe(true);
  });

  it("10. evidência exige caso, título, tipo e natureza", () => {
    expect(validarEvidencia({}).ok).toBe(false);
    expect(validarEvidencia({}).erros.length).toBeGreaterThanOrEqual(4);
  });
});
