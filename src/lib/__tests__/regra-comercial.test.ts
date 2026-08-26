import { describe, expect, it } from "vitest";

import {
  CLAUSULA_DESPESAS_TERCEIROS,
  pendenciasDespesa,
  podeExecutarDespesa,
  type Despesa,
} from "@/lib/despesas-terceiros";
import { bloqueiosDePreco, extrairSku, fonteOficialDePreco } from "@/lib/precos-sku";

const base: Despesa = {
  id: "1",
  descricao: "Emolumentos de cartório na Áustria",
  categoria: "cartorio",
  estado: "estimativa_pendente",
  estimativa_min: null,
  estimativa_max: null,
  moeda: "EUR",
  pagador: "cliente",
  comunicado_em: null,
  aprovado_pelo_cliente_em: null,
  aprovacao_evidencia: null,
  executado_em: null,
  valor_pago: null,
  excecao_id: null,
};

describe("despesas de terceiros", () => {
  it("cláusula institucional é literal", () => {
    expect(CLAUSULA_DESPESAS_TERCEIROS).toContain(
      "não estão incluídas nos honorários do Clube Ancestral",
    );
    expect(CLAUSULA_DESPESAS_TERCEIROS).toContain(
      "pagas diretamente pelo cliente, mediante aprovação registrada",
    );
  });

  it("estimativa pendente não exige comunicação ainda", () => {
    expect(pendenciasDespesa(base)).toEqual([]);
    expect(podeExecutarDespesa(base)).toBe(false);
  });

  it("comunicação exige estimativa registrada", () => {
    const d = { ...base, estado: "estimada_comunicada" };
    expect(pendenciasDespesa(d)).toContain("Estimativa ou faixa de valor não registrada.");
  });

  it("execução exige aprovação com evidência", () => {
    const d = {
      ...base,
      estado: "aprovada",
      estimativa_min: 100,
      comunicado_em: "2026-08-18T00:00:00Z",
    };
    expect(pendenciasDespesa(d)).toContain("Aprovação do cliente não registrada.");
    const ok = {
      ...d,
      aprovado_pelo_cliente_em: "2026-08-18T01:00:00Z",
      aprovacao_evidencia: "WhatsApp 18/08",
    };
    expect(pendenciasDespesa(ok)).toEqual([]);
    expect(podeExecutarDespesa(ok)).toBe(true);
  });

  it("pagador diferente do cliente exige exceção formal", () => {
    const d = { ...base, pagador: "terceiro_autorizado" };
    expect(pendenciasDespesa(d)).toContain(
      "Pagador diferente do cliente sem exceção formal aprovada.",
    );
  });
});

describe("preço de SKU", () => {
  it("só Planilha Mestre e exceção aprovada são fontes oficiais", () => {
    expect(fonteOficialDePreco("planilha_mestre")).toBe(true);
    expect(fonteOficialDePreco("excecao_comercial_aprovada")).toBe(true);
    for (const f of [
      "planejador",
      "whatsapp",
      "transcricao",
      "template",
      "proposta_antiga",
      "manual",
    ]) {
      expect(fonteOficialDePreco(f)).toBe(false);
    }
  });

  it("extrai o SKU do parâmetro", () => {
    expect(extrairSku("CA-CID-AT-001 — Cidadania austríaca")).toBe("CA-CID-AT-001");
    expect(extrairSku(null)).toBeNull();
  });

  it("SKU sem preço homologado bloqueia valor e cobrança", () => {
    expect(
      bloqueiosDePreco({ ok: false, motivo: "SKU sem preço/condição homologados." }),
    ).toHaveLength(1);
    expect(bloqueiosDePreco({ ok: true, fonte: "planilha_mestre" })).toEqual([]);
  });
});
