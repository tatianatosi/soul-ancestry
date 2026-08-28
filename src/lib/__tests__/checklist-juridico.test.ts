import { describe, expect, it } from "vitest";

import { montarChecklistJuridico } from "../checklist-juridico";

const completo = {
  contrato: { title: "Estudo genealógico", total_amount: 1000, execution_days: 90 },
  partes: [
    { party_role: "contratada", document_number: "00.000.000/0001-00" },
    { party_role: "contratante", document_number: "000.000.000-00" },
  ],
  escopo: [{ category: "incluso" }, { category: "exclusao" }],
  clausulas: [{ status: "approved", approved_at: "2026-01-01" }],
  anexos: ["I", "II", "III", "IV", "V"].map((annex_code) => ({ annex_code, status: "homologado" })),
  versoes: [{ version_number: 3, render_error: null }],
};

describe("checklist jurídico", () => {
  it("aprova instrumento completo", () => {
    const r = montarChecklistJuridico(completo);
    expect(r.bloqueios).toBe(0);
    expect(r.aptoParaRevisaoHumana).toBe(true);
    expect(r.conformes).toBe(r.total);
  });

  it("bloqueia quando faltam anexos, partes e versão", () => {
    const r = montarChecklistJuridico({
      contrato: { title: "" },
      anexos: [{ annex_code: "I", status: "draft" }],
    });
    expect(r.aptoParaRevisaoHumana).toBe(false);
    expect(r.itens.find((i) => i.chave === "anexos_obrigatorios")?.detalhe).toContain("II");
    expect(r.itens.find((i) => i.chave === "versao_gerada")?.estado).toBe("bloqueio");
  });

  it("ignora registros arquivados", () => {
    const r = montarChecklistJuridico({
      ...completo,
      partes: [
        ...completo.partes,
        { party_role: "contratante", document_number: "", archived_at: "2026-01-01" },
      ],
    });
    expect(r.itens.find((i) => i.chave === "partes_documento")?.estado).toBe("ok");
  });

  it("marca exclusões ausentes como pendência não bloqueante", () => {
    const r = montarChecklistJuridico({ ...completo, escopo: [{ category: "incluso" }] });
    expect(r.itens.find((i) => i.chave === "escopo_exclusoes")?.estado).toBe("pendente");
    expect(r.aptoParaRevisaoHumana).toBe(true);
  });
});
