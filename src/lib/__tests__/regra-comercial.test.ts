import { describe, expect, it } from "vitest";

import {
  CLAUSULA_DESPESAS_TERCEIROS,
  pendenciasDespesa,
  podeExecutarDespesa,
  type Despesa,
} from "@/lib/despesas-terceiros";
import {
  bloqueiosDePreco,
  extrairSku,
  fonteOficialDePreco,
  MOTIVO_MINIMO_EXCECAO_COMERCIAL,
  validarExcecaoComercial,
  type SolicitacaoExcecaoComercial,
} from "@/lib/precos-sku";

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
  it("só product_catalog e exceção aprovada são fontes oficiais — Planilha é legado", () => {
    expect(fonteOficialDePreco("product_catalog")).toBe(true);
    expect(fonteOficialDePreco("excecao_comercial_aprovada")).toBe(true);
    expect(fonteOficialDePreco("planilha_mestre")).toBe(false);
    for (const f of [
      "planejador",
      "whatsapp",
      "transcricao",
      "template",
      "proposta_antiga",
      "manual",
      "price_catalog_rescued",
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
    expect(bloqueiosDePreco({ ok: true, fonte: "product_catalog" })).toEqual([]);
  });
});

describe("exceção comercial de preço/SKU (CA-BLOQ-ADMIN-ALL-001)", () => {
  const validoAteFuturo = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const solicitacao = (over: Partial<SolicitacaoExcecaoComercial> = {}): SolicitacaoExcecaoComercial => ({
    sku: "CA-CID-AT-001",
    caseId: "caso-1",
    motivo: "Preço acertado direto com a cliente antes da homologação formal do SKU.",
    precoTotal: 4500,
    condicaoPagamento: "à vista",
    validoAte: validoAteFuturo,
    ...over,
  });

  it("aceita uma solicitação completa e válida", () => {
    const r = validarExcecaoComercial(solicitacao());
    expect(r.valida).toBe(true);
    expect(r.erros).toEqual([]);
  });

  it("exige motivo específico com tamanho mínimo", () => {
    const r = validarExcecaoComercial(solicitacao({ motivo: "ok" }));
    expect(r.valida).toBe(false);
    expect(r.erros.join(" ")).toMatch(new RegExp(`pelo menos ${MOTIVO_MINIMO_EXCECAO_COMERCIAL}`));
  });

  it("exige preço total maior que zero", () => {
    expect(validarExcecaoComercial(solicitacao({ precoTotal: 0 })).valida).toBe(false);
    expect(validarExcecaoComercial(solicitacao({ precoTotal: -10 })).valida).toBe(false);
  });

  it("exige condição de pagamento", () => {
    expect(validarExcecaoComercial(solicitacao({ condicaoPagamento: "" })).valida).toBe(false);
  });

  it("exige validade futura — nunca aceita uma exceção já expirada", () => {
    expect(validarExcecaoComercial(solicitacao({ validoAte: "2020-01-01" })).valida).toBe(false);
    expect(validarExcecaoComercial(solicitacao({ validoAte: "data-invalida" })).valida).toBe(false);
  });

  it("exige SKU e caso", () => {
    expect(validarExcecaoComercial(solicitacao({ sku: "" })).valida).toBe(false);
    expect(validarExcecaoComercial(solicitacao({ caseId: "" })).valida).toBe(false);
  });
});
