import { describe, expect, it } from "vitest";

import { montarChecklistJuridico } from "../checklist-juridico";

/**
 * Nomes e valores de campo aqui espelham o schema real (contract_parties.role
 * = "provider"/"contracting_client"; contract_clause_overrides.
 * requires_human_review/reviewed_at) — não os rótulos em português que o
 * checklist chegou a comparar por engano (party_role/"contratada",
 * status/approved_at), o que fazia "Contratada qualificada" e "Cláusulas
 * alteradas aprovadas" falharem sempre, em qualquer contrato real.
 */
const completo = {
  contrato: { title: "Estudo genealógico", effective_end_date: "2026-12-31" },
  partes: [
    { role: "provider", document_number: "00.000.000/0001-00" },
    { role: "contracting_client", document_number: "000.000.000-00" },
  ],
  escopo: [{ category: "incluso" }, { category: "exclusao" }],
  clausulas: [{ requires_human_review: false, reviewed_at: "2026-01-01" }],
  anexos: ["I", "II", "III", "IV", "V"].map((annex_code) => ({ annex_code, status: "homologado" })),
  versoes: [{ version_number: 3, render_error: null }],
  valorReferencia: "1000",
  prazoReferencia: "2026-12-31",
};

describe("checklist jurídico", () => {
  it("aprova instrumento completo", () => {
    const r = montarChecklistJuridico(completo);
    expect(r.bloqueios).toBe(0);
    expect(r.aptoParaRevisaoHumana).toBe(true);
    expect(r.conformes).toBe(r.total);
  });

  it("reconhece contratada (provider) e contratante (contracting_client) pelos valores reais do banco", () => {
    const r = montarChecklistJuridico(completo);
    expect(r.itens.find((i) => i.chave === "parte_contratada")?.estado).toBe("ok");
    expect(r.itens.find((i) => i.chave === "parte_contratante")?.estado).toBe("ok");
  });

  it("bloqueia quando faltam anexos, partes e versão", () => {
    const r = montarChecklistJuridico({
      contrato: { title: "" },
      anexos: [{ annex_code: "I", status: "draft" }],
    });
    expect(r.aptoParaRevisaoHumana).toBe(false);
    expect(r.itens.find((i) => i.chave === "anexos_obrigatorios")?.detalhe).toContain("II");
    expect(r.itens.find((i) => i.chave === "versao_gerada")?.estado).toBe("bloqueio");
    expect(r.itens.find((i) => i.chave === "parte_contratada")?.estado).toBe("bloqueio");
  });

  it("ignora registros arquivados", () => {
    const r = montarChecklistJuridico({
      ...completo,
      partes: [
        ...completo.partes,
        { role: "contracting_client", document_number: "", archived_at: "2026-01-01" },
      ],
    });
    expect(r.itens.find((i) => i.chave === "partes_documento")?.estado).toBe("ok");
  });

  it("marca exclusões ausentes como pendência não bloqueante", () => {
    const r = montarChecklistJuridico({ ...completo, escopo: [{ category: "incluso" }] });
    expect(r.itens.find((i) => i.chave === "escopo_exclusoes")?.estado).toBe("pendente");
    expect(r.aptoParaRevisaoHumana).toBe(true);
  });

  it("valor e prazo vêm da referência dos parâmetros do Planejador, não de colunas inexistentes em contracts", () => {
    const semReferencia = montarChecklistJuridico({ ...completo, valorReferencia: null, prazoReferencia: null });
    expect(semReferencia.itens.find((i) => i.chave === "valor")?.estado).toBe("bloqueio");
    expect(semReferencia.itens.find((i) => i.chave === "prazo")?.estado).toBe("ok"); // effective_end_date cobre o prazo

    const comReferencia = montarChecklistJuridico({ ...completo, contrato: { title: "x" }, prazoReferencia: "2026-10-01" });
    expect(comReferencia.itens.find((i) => i.chave === "valor")?.estado).toBe("ok");
    expect(comReferencia.itens.find((i) => i.chave === "prazo")?.estado).toBe("ok");
  });

  it("cláusula alterada sem revisão humana pendente é aprovada; com revisão pendente, bloqueia", () => {
    const aprovada = montarChecklistJuridico({
      ...completo,
      clausulas: [{ requires_human_review: false, reviewed_at: null }],
    });
    expect(aprovada.itens.find((i) => i.chave === "clausulas_override")?.estado).toBe("ok");

    const pendente = montarChecklistJuridico({
      ...completo,
      clausulas: [{ requires_human_review: true, reviewed_at: null }],
    });
    expect(pendente.itens.find((i) => i.chave === "clausulas_override")?.estado).toBe("bloqueio");
  });
});
