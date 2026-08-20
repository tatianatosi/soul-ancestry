import { describe, expect, it } from "vitest";
import {
  ENTREGAS_ACEITE, aceitePendente, camposInternosPendentes, condicaoReferenciaInterna,
  consolidarCaseService, criterioDecidido, resumoCriterios, semearCriterios, type ItemCriterio,
} from "@/lib/case-service-consolidacao";

const catalogo = {
  id: "p1", code: "PROD-DIAG-FAM-MULTI", nome_comercial: "Diagnóstico Familiar Multipaís",
  status_homologacao: "homologado", preco_comercial_vigente: 9600, condicao_comercial_padrao: "Caso a caso",
};
const servicoOk = {
  product_catalog_id: "p1", citizenship_track_id: "t1", escopo_aprovado: "Escopo da proposta Canva conferida",
  composicao_familiar: "Ana, Adair, Alice; dependente Felipe", condicao_comercial_aprovada: "referência interna",
  observacao_interna: "sem cobrança", preco_acordado: 9600, preco_somente_leitura: true, status: "draft",
};
const nucleoOk = { titulares: ["Ana", "Adair", "Alice"], dependentes: ["Felipe"], representacaoPendente: false };
const escopoOk = { status: "aprovado_para_preparacao", camposAusentes: 0, conflitos: 0 };

describe("consolidação do case service", () => {
  it("approved só com tudo preenchido e conferido", () => {
    const r = consolidarCaseService({ servico: servicoOk, catalogo, propostaValor: 9600, escopoConferido: escopoOk, nucleo: nucleoOk });
    expect(r.statusPermitido).toBe("approved");
    expect(r.financeiroLiberado).toBe(false);
    expect(r.origemPreco).toBe("product_catalog");
  });
  it("campo interno faltando trava em draft", () => {
    const { escopo_aprovado: _x, ...sem } = servicoOk;
    const r = consolidarCaseService({ servico: sem, catalogo, propostaValor: 9600, escopoConferido: escopoOk, nucleo: nucleoOk });
    expect(r.statusPermitido).toBe("draft");
    expect(camposInternosPendentes(sem).map((c) => c.campo)).toContain("escopo_aprovado");
  });
  it("registra divergência de valor entre proposta/planejador e catálogo", () => {
    const r = consolidarCaseService({ servico: servicoOk, catalogo, propostaValor: 9000, planejadorValor: 9600, escopoConferido: escopoOk, nucleo: nucleoOk });
    expect(r.divergencias.some((d) => d.codigo === "VALOR_DIVERGENTE" && d.origem === "proposta_canva")).toBe(true);
    expect(r.statusPermitido).toBe("draft");
  });
  it("escopo não conferido e representação pendente bloqueiam", () => {
    const r = consolidarCaseService({
      servico: servicoOk, catalogo, propostaValor: 9600,
      escopoConferido: { status: "bloqueado", camposAusentes: 10, conflitos: 0 },
      nucleo: { ...nucleoOk, representacaoPendente: true },
    });
    expect(r.divergencias.map((d) => d.codigo)).toEqual(expect.arrayContaining(["ESCOPO_NAO_CONFERIDO", "REPRESENTACAO_PENDENTE"]));
  });
  it("condição é sempre referência interna sem cobrança", () => {
    expect(condicaoReferenciaInterna(9600)).toMatch(/referência interna/);
    expect(condicaoReferenciaInterna(9600)).toMatch(/Sem cobrança/);
  });
  it("critérios nascem pendentes de decisão humana", () => {
    const itens = semearCriterios() as ItemCriterio[];
    expect(itens.length).toBe(ENTREGAS_ACEITE.reduce((a, e) => a + e.criterios.length, 0));
    expect(itens.every((i) => i.status === "pendente_decisao_humana")).toBe(true);
    expect(aceitePendente(itens)).toBe(true);
    expect(criterioDecidido({ ...itens[0]!, status: "aceito" })).toBe(false);
    expect(criterioDecidido({ ...itens[0]!, status: "aceito", decidido_por: "Tatiana", decidido_em: "2026-08-20" })).toBe(true);
    expect(resumoCriterios(itens).length).toBe(ENTREGAS_ACEITE.length);
  });
});
