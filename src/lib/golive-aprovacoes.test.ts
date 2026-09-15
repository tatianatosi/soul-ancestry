import { describe, expect, it } from "vitest";

import { aprovacoesPorGrupo, filaDeAprovacoes, publicadoNoApp, resumoAprovacoes } from "./golive-aprovacoes";

const publicada = { id: "p1", estado: "published", tipo: "contrato", despublicadaEm: null };

describe("filaDeAprovacoes", () => {
  it("não pede nada quando não há registro", () => {
    expect(filaDeAprovacoes({})).toEqual([]);
    expect(resumoAprovacoes([])).toEqual({ pendentes: 0, prontos: 0, total: 0 });
  });

  it("achado sem validação vira pendente de aprovação", () => {
    const [item] = filaDeAprovacoes({ achados: [{ id: "a", titulo: "Vínculo materno", validacao: "a_confirmar" }] });
    expect(item?.acao).toBe("aprovar_achado");
    expect(item?.situacao).toBe("pendente");
  });

  it("hipótese de pesquisa não recebe CTA de aprovação", () => {
    const [item] = filaDeAprovacoes({ achados: [{ id: "a", tipo: "hipotese_pesquisa" }] });
    expect(item?.acao).toBe("nenhuma");
  });

  it("achado validado sai da fila de pendências", () => {
    const [item] = filaDeAprovacoes({
      achados: [{ id: "a", validacao: "validado_internamente", impactoArvore: "proposto" }],
    });
    expect(item?.situacao).toBe("pronto");
    expect(item?.acao).toBe("nenhuma");
  });

  it("proposta sem referência do Canva não libera aprovação de escopo", () => {
    const [item] = filaDeAprovacoes({ propostas: [{ id: "p", status: "rascunho", escopo: "Estudo" }] });
    expect(item?.acao).toBe("nenhuma");
    expect(item?.motivo).toContain("Canva");
  });

  it("proposta completa e não aprovada pede aprovação de escopo", () => {
    const [item] = filaDeAprovacoes({
      propostas: [{ id: "p", status: "rascunho", escopo: "Estudo", referencia: "canva/1" }],
    });
    expect(item?.acao).toBe("aprovar_escopo");
  });

  it("proposta aprovada sem projeção pede publicação; com projeção fica pronta", () => {
    const base = { id: "p", status: "aprovada", aprovadaEm: "2026-09-15" };
    expect(filaDeAprovacoes({ propostas: [base] })[0]?.acao).toBe("publicar");
    expect(
      filaDeAprovacoes({
        propostas: [base],
        projecoes: [{ id: "x", estado: "published", tipo: "proposta", despublicadaEm: null }],
      })[0]?.situacao,
    ).toBe("pronto");
  });

  it("contrato percorre revisão, assinatura e publicação", () => {
    expect(filaDeAprovacoes({ contratos: [{ id: "c", status: "pending_data" }] })[0]?.acao).toBe("enviar_revisao");
    expect(filaDeAprovacoes({ contratos: [{ id: "c", status: "under_human_review" }] })[0]?.acao).toBe(
      "registrar_assinatura",
    );
    expect(filaDeAprovacoes({ contratos: [{ id: "c", status: "signed" }] })[0]?.acao).toBe("publicar");
    expect(
      filaDeAprovacoes({ contratos: [{ id: "c", status: "signed" }], projecoes: [publicada] })[0]?.situacao,
    ).toBe("pronto");
  });

  it("projeção despublicada não conta como publicada", () => {
    expect(publicadoNoApp([{ ...publicada, despublicadaEm: "2026-09-15" }], "contrato")).toBe(false);
  });

  it("resumo e gráfico seguem ordem fixa", () => {
    const itens = filaDeAprovacoes({
      achados: [{ id: "a" }],
      propostas: [{ id: "p", status: "aprovada", aprovadaEm: "2026-09-15" }],
      contratos: [{ id: "c", status: "pending_data" }],
    });
    expect(resumoAprovacoes(itens)).toEqual({ pendentes: 3, prontos: 0, total: 3 });
    expect(aprovacoesPorGrupo(itens).map((g) => g.grupo)).toEqual(["Achado", "Proposta", "Contrato"]);
  });
});
