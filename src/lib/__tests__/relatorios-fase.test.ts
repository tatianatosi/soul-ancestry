import { describe, expect, it } from "vitest";

import {
  cardsDeFase,
  projetarParaApp,
  resolverRelatorioDaMicroentrega,
  validarRelatorio,
  vincularEvidencia,
  visivelNoApp,
} from "@/lib/relatorios-fase";

describe("G-05 relatórios de fase", () => {
  it("F1 e F2 aparecem como cards distintos", () => {
    const cards = cardsDeFase([{ report_type: "REPORT_F1_DIAGNOSTICO" }]);
    const f1 = cards.find((c) => c.tipo === "REPORT_F1_DIAGNOSTICO")!;
    const f2 = cards.find((c) => c.tipo === "REPORT_F2_PESQUISA")!;
    expect(f1.rotulo).toContain("Diagnóstico e Direcionamento");
    expect(f2.rotulo).toContain("Pesquisa Genealógica e Evidências");
    expect(f1.fase).not.toBe(f2.fase);
    expect(f1.existentes).toBe(1);
    expect(f2.existentes).toBe(0);
  });

  it("evidência é vinculada sem ser duplicada", () => {
    const link = { report_id: "r1", evidence_id: "e1" };
    const um = vincularEvidencia([], link);
    const dois = vincularEvidencia(um, { ...link });
    expect(um).toHaveLength(1);
    expect(dois).toHaveLength(1);
    expect(vincularEvidencia(dois, { report_id: "r1", evidence_id: "e2" })).toHaveLength(2);
  });

  it("relatório não publicado não aparece no App", () => {
    const base = { report_status: "aprovado_internamente", publicado_no_app: false, resumo_aprovado_cliente: "Resumo." };
    expect(visivelNoApp(base)).toBe(false);
    expect(projetarParaApp(base)).toBeNull();
    expect(visivelNoApp({ ...base, report_status: "entregue", publicado_no_app: true })).toBe(true);
  });

  it("micro-entrega vinculada não cria novo relatório", () => {
    const relatorios = [{ id: "r1", report_type: "REPORT_F2_PESQUISA", fase_jornada: "fase_2_pesquisa" }];
    expect(resolverRelatorioDaMicroentrega(relatorios, { fase: "fase_2_pesquisa" })).toEqual({ ok: true, reportId: "r1" });
    const semRelatorio = resolverRelatorioDaMicroentrega(relatorios, { fase: "fase_3_prontidao" });
    expect(semRelatorio.ok).toBe(false);
  });

  it("entrega e publicação exigem projeção aprovada", () => {
    expect(validarRelatorio({ report_type: "REPORT_F1_DIAGNOSTICO", report_status: "entregue" }).length).toBeGreaterThan(0);
    expect(
      validarRelatorio({
        report_type: "REPORT_F1_DIAGNOSTICO",
        report_status: "entregue",
        data_aprovacao: "2026-08-20",
        data_entrega: "2026-08-20",
        resumo_aprovado_cliente: "Resumo aprovado.",
        versao: 1,
      }),
    ).toEqual([]);
    expect(
      validarRelatorio({
        report_type: "REPORT_F2_PESQUISA",
        report_status: "em_revisao",
        publicado_no_app: true,
        versao: 1,
      }),
    ).toContain("Relatório não entregue não pode ser publicado no App.");
  });
});
