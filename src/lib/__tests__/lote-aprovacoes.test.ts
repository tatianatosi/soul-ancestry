import { describe, expect, it } from "vitest";

import {
  MOTIVO_MINIMO_LOTE,
  decisaoLoteDoItem,
  itensLoteS01aS05,
  montarLote,
  validarLote,
} from "@/lib/lote-aprovacoes";

const MOTIVO = "Decisão da proprietária após varredura de administração.";

describe("lote de aprovações S-01 a S-05", () => {
  it("projeta exatamente cinco itens numerados a partir de APR-01…APR-05", () => {
    const itens = itensLoteS01aS05();
    expect(itens.map((i) => i.id)).toEqual(["S-01", "S-02", "S-03", "S-04", "S-05"]);
    expect(itens.map((i) => i.origem_id)).toEqual(["APR-01", "APR-02", "APR-03", "APR-04", "APR-05"]);
  });

  it("define estado interno alvo conforme a exigência de confirmação externa", () => {
    for (const item of itensLoteS01aS05()) {
      expect(item.estadoInternoAlvo).toBe(
        item.exigeConfirmacaoExterna ? "pronto_para_confirmacao_externa" : "aprovado_internamente",
      );
    }
  });

  it("exige seleção, motivo mínimo e checkbox", () => {
    expect(validarLote({ selecionados: [], motivo: MOTIVO, checkboxConfirmado: true })).toContain(
      "Selecione ao menos um item de S-01 a S-05.",
    );
    expect(
      validarLote({ selecionados: ["S-01"], motivo: "curto", checkboxConfirmado: true }),
    ).toContain(`Motivo obrigatório com pelo menos ${MOTIVO_MINIMO_LOTE} caracteres.`);
    expect(
      validarLote({ selecionados: ["S-01"], motivo: MOTIVO, checkboxConfirmado: false }),
    ).toContain("Confirmação explícita obrigatória: marque a caixa de confirmação do lote.");
  });

  it("recusa item fora do lote", () => {
    expect(
      validarLote({ selecionados: ["S-09"], motivo: MOTIVO, checkboxConfirmado: true }),
    ).toContain("Item fora do lote S-01 a S-05.");
  });

  it("aceita lote completo válido e devolve uma decisão por item", () => {
    const r = montarLote({
      selecionados: ["S-01", "S-02", "S-03", "S-04", "S-05"],
      motivo: MOTIVO,
      checkboxConfirmado: true,
    });
    expect(r.valido).toBe(true);
    expect(r.decisoes).toHaveLength(5);
    expect(r.decisoes.map((d) => d.item.id)).toEqual(["S-01", "S-02", "S-03", "S-04", "S-05"]);
  });

  it("nenhuma decisão do lote representa ação externa executada", () => {
    for (const item of itensLoteS01aS05()) {
      const d = decisaoLoteDoItem(item, MOTIVO);
      expect(d.acao).toBe("aprovar_lote_item_interno");
      expect(d.fonte).toBe("janela_lote_s01_s05");
      expect(d.dados_teste).toBe(false);
      expect(d.valor_anterior).toBe("pendente");
      expect(d.valor_novo).toBe(item.estadoInternoAlvo);
    }
  });

  it("preserva a pendência de confirmação externa como pendência assumida", () => {
    const externo = itensLoteS01aS05().find((i) => i.exigeConfirmacaoExterna)!;
    const interno = itensLoteS01aS05().find((i) => !i.exigeConfirmacaoExterna)!;
    expect(decisaoLoteDoItem(externo, MOTIVO).pendencias_assumidas[0]).toContain(
      "confirmação externa explícita permanece pendente",
    );
    expect(decisaoLoteDoItem(interno, MOTIVO).pendencias_assumidas).toHaveLength(0);
  });
});
