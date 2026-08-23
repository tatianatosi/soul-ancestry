import { describe, expect, it } from "vitest";

import { csvOrigemEscopo, montarOrigemEscopo, propostaDeclarada, resumirOrigem, type EntradaOrigem } from "@/lib/escopo-origem";

const base: EntradaOrigem = {
  itens: [],
  contratos: [{ id: "c1", contract_number: "CT-1", case_id: "k1", proposal_id: "p1", status: "signed", demo: false }],
  propostas: [{ id: "p1", versao: 2, status: "aprovada", case_id: "k1", product_catalog_id: "s1", dados_teste: false }],
  condicoes: [{ id: "cc1", codigo: "CC-1", status: "aprovada", case_id: "k1", proposal_id: "p1", product_catalog_id: "s1", dados_teste: false }],
  ordens: [{ id: "o1", service_order_number: "OS-1", status: "ativa", case_id: "k1", contract_id: "c1", commercial_condition_id: "cc1", dados_teste: false }],
  produtos: [{ id: "s1", code: "SKU-001", nome_comercial: "Estudo genealógico" }],
  casos: [{ id: "k1", codigo: "CA-CID-AT-FAM-2026-001", titulo: "Ana", demo: false, dados_teste: false }],
};

const item = (over: Partial<EntradaOrigem["itens"][number]> = {}) => ({
  id: "i1",
  contract_id: "c1",
  category: "deliverable",
  title: "Entrega 1",
  status: "ativo",
  source_type: "proposal",
  source_reference: "proposta v2 · entregas_jornada",
  scope_version: 1,
  proposal_id: null,
  commercial_condition_id: null,
  service_order_id: null,
  ...over,
});

describe("montarOrigemEscopo", () => {
  it("marca vínculos diretos como vinculados", () => {
    const [l] = montarOrigemEscopo({
      ...base,
      itens: [item({ proposal_id: "p1", commercial_condition_id: "cc1", service_order_id: "o1" })],
    });
    expect(l.proposta.estado).toBe("vinculado");
    expect(l.proposta.rotulo).toBe("Proposta v2");
    expect(l.condicao.estado).toBe("vinculado");
    expect(l.ordem.estado).toBe("vinculado");
    expect(l.sku.rotulo).toBe("SKU-001");
    expect(l.cadeia_completa).toBe(true);
  });

  it("herda proposta, condição e OS quando o item não tem vínculo próprio", () => {
    const [l] = montarOrigemEscopo({ ...base, itens: [item()] });
    expect(l.proposta.estado).toBe("herdado");
    expect(l.condicao.estado).toBe("herdado");
    expect(l.ordem.estado).toBe("herdado");
    expect(l.cadeia_completa).toBe(false);
    expect(l.lacunas.length).toBe(4);
  });

  it("mostra proposta apenas declarada e vínculos ausentes", () => {
    const [l] = montarOrigemEscopo({
      ...base,
      contratos: [{ id: "c1", contract_number: "CT-1", case_id: null, proposal_id: null, status: "draft", demo: false }],
      condicoes: [],
      ordens: [],
      itens: [item()],
    });
    expect(l.proposta.estado).toBe("declarado");
    expect(l.proposta.rotulo).toBe("Proposta v2");
    expect(l.condicao.estado).toBe("ausente");
    expect(l.ordem.estado).toBe("ausente");
    expect(l.sku.estado).toBe("ausente");
  });

  it("sinaliza fixtures de demonstração", () => {
    const [l] = montarOrigemEscopo({
      ...base,
      casos: [{ id: "k1", codigo: "CA-TESTE", titulo: "T", demo: true, dados_teste: false }],
      itens: [item()],
    });
    expect(l.fixture).toBe(true);
  });
});

describe("resumo e CSV", () => {
  it("conta cadeias completas e lacunas", () => {
    const linhas = montarOrigemEscopo({
      ...base,
      itens: [item({ proposal_id: "p1", commercial_condition_id: "cc1", service_order_id: "o1" }), item({ id: "i2" })],
    });
    const r = resumirOrigem(linhas);
    expect(r.total).toBe(2);
    expect(r.cadeias_completas).toBe(1);
    expect(r.com_lacuna).toBe(1);
    expect(r.por_eixo.proposta.vinculado).toBe(1);
    expect(r.por_eixo.proposta.herdado).toBe(1);
  });

  it("gera CSV com cabeçalho e uma linha por item", () => {
    const linhas = montarOrigemEscopo({ ...base, itens: [item()] });
    const csv = csvOrigemEscopo(linhas);
    expect(csv.split("\r\n")).toHaveLength(2);
    expect(csv).toContain("proposta_estado");
    expect(csv).toContain("CT-1");
  });

  it("extrai a versão declarada da referência", () => {
    expect(propostaDeclarada("proposta v3 · escopo")).toBe("Proposta v3");
    expect(propostaDeclarada("template padrão")).toBeNull();
  });
});
