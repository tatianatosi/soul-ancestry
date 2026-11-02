import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auditoria 02/11/2026 (P0): `enviarParaAssinatura` gravava 4 valores que o banco recusa, então criar o
 * contrato para assinatura falhava sempre (exceto em casos que já tinham contract_id). Vocabulário lido
 * de pg_constraint em 02/11/2026.
 */
const STATUS_CONTRATO = [
  "draft",
  "pending_data",
  "ready_for_review",
  "under_human_review",
  "approved_for_send",
  "sent",
  "signed",
  "rejected",
  "cancelled",
  "archived",
];
const CATEGORIA_ESCOPO = [
  "contracted_scope",
  "deliverable",
  "operational_condition",
  "customer_obligation",
  "club_obligation",
  "exclusion",
  "dependency",
  "external_expense",
];
const STATUS_ESCOPO = ["included", "excluded", "pending", "conditional", "not_applicable"];
const FONTE_ESCOPO = ["proposal", "case", "manual_review", "template", "annex"];

describe("enviarParaAssinatura grava só vocabulário aceito pelo banco", () => {
  const src = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");
  const trecho = src.slice(src.indexOf("contract_base"), src.indexOf("NENHUMA_LINHA_AFETADA: envio"));

  it("status do contrato novo é válido e começa em rascunho", () => {
    const m = trecho.match(/\n\s+status: "([a-z_]+)",\n\s+purpose_summary/);
    expect(m?.[1]).toBe("draft");
    expect(STATUS_CONTRATO).toContain(m![1]);
  });

  it("categorias do escopo são válidas", () => {
    const cats = [...trecho.matchAll(/category: "([a-z_]+)"/g)].map((x) => x[1]);
    expect(cats.length).toBeGreaterThanOrEqual(3);
    for (const c of cats) expect(CATEGORIA_ESCOPO, c).toContain(c);
  });

  it("status e fonte dos itens de escopo são válidos", () => {
    expect(trecho).toContain('s.category === "exclusion" ? "excluded" : "included"');
    for (const v of ["excluded", "included"]) expect(STATUS_ESCOPO).toContain(v);
    const fonte = trecho.match(/source_type: "([a-z_]+)"/)?.[1];
    expect(FONTE_ESCOPO).toContain(fonte);
  });
});

import { TIPOS_EVENTO_REVISAO, tipoEventoDoBanco } from "@/lib/contratos.functions";

describe("contract_review_events: todo evento gravado tem tipo aceito pelo banco", () => {
  it("mapeia os eventos que o CHECK recusava", () => {
    for (const t of [
      "render_blocked",
      "send_drafted",
      "document_previewed",
      "conflito_mantido_com_motivo",
      "cpf_conflito_atualizar_snapshot",
      "nome_conflito_corrigir_pessoa_canonica",
    ]) {
      expect(TIPOS_EVENTO_REVISAO).toContain(tipoEventoDoBanco(t));
    }
    expect(tipoEventoDoBanco("approved_for_send")).toBe("approved_for_send");
  });

  it("o leitor da decisão 'manter com motivo' lê o tipo_original, não um tipo que o banco recusa", () => {
    const src = readFileSync("src/lib/contratos.functions.ts", "utf8");
    expect(src).not.toContain('.eq("event_type", "conflito_mantido_com_motivo")');
    expect(src).toContain('.eq("metadata->>tipo_original", "conflito_mantido_com_motivo")');
  });
});

describe("Outros dois escritores que o CHECK recusava para qualquer papel (relatório persistencia-banco)", () => {
  it("override do Painel Hoje grava categoria aceita por owner_override_events", () => {
    const src = readFileSync("src/lib/painel-hoje-acoes.functions.ts", "utf8");
    expect(src).not.toContain('"override_gate_interno"');
    expect(src).toContain('categoria: "override_interno"');
  });

  it("condição comercial do caso grava data_origin 'real'", () => {
    const src = readFileSync("src/lib/case-service-consolidacao.functions.ts", "utf8");
    expect(src).not.toContain('data_origin: "decisao_humana_interna"');
    expect(src).toContain('data_origin: "real"');
  });
});
