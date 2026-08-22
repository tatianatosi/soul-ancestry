import { describe, expect, it } from "vitest";

import {
  COD,
  conciliarCatalogo,
  mensagemBloqueio,
  type EntradaConciliacao,
  type ProdutoHomologado,
} from "@/lib/conciliacao-catalogo";

const produto: ProdutoHomologado = {
  id: "p1",
  code: "CA-CID-AT-001",
  nome: "Cidadania italiana — administrativa",
  ativo: true,
  archived_at: null,
  status_homologacao: "homologado",
  elegivel_para_proposta: true,
  preco_comercial_vigente: 12000,
  condicao_comercial_padrao: "12x no cartão",
  moeda: "BRL",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: null,
  inclusoes: ["Pesquisa documental", "Dossiê consolidado"],
  exclusoes: ["Taxas consulares"],
  entregaveis: ["Relatório final"],
  escopo_aprovado: "Escopo homologado",
};

const base: EntradaConciliacao = {
  caseId: "c1",
  skuObservado: "CA-CID-AT-001",
  produto,
  precoObservado: 12000,
  condicaoObservada: "12x no cartão",
  origemPreco: "product_catalog",
  escopo: {
    objetivo: "Reconhecimento de cidadania",
    servicos: ["Pesquisa documental"],
    inclusoes: ["Dossiê consolidado"],
    exclusoes: ["Taxas consulares"],
    entregas: ["Relatório final"],
    pessoas: 2,
  },
  condicaoComercialPersistida: true,
  hoje: new Date("2026-06-01"),
};

describe("conciliação de catálogo", () => {
  it("libera OS e contrato quando tudo é homologado e o escopo é suficiente", () => {
    const r = conciliarCatalogo(base);
    expect(r.bloqueios).toEqual([]);
    expect(r.pode_gerar_os).toBe(true);
    expect(r.pode_gerar_contrato).toBe(true);
    expect(r.fonte).toBe("product_catalog");
    expect(mensagemBloqueio(r)).toBeNull();
  });

  it("bloqueia SKU fora do catálogo", () => {
    const r = conciliarCatalogo({ ...base, produto: null });
    expect(r.divergencias.some((d) => d.codigo === COD.SKU_FORA_CATALOGO)).toBe(true);
    expect(r.pode_gerar_os).toBe(false);
  });

  it("bloqueia SKU não homologado", () => {
    const r = conciliarCatalogo({ ...base, produto: { ...produto, status_homologacao: "em_revisao" } });
    expect(r.divergencias.some((d) => d.codigo === COD.SKU_NAO_HOMOLOGADO)).toBe(true);
    expect(r.pode_gerar_contrato).toBe(false);
  });

  it("bloqueia preço divergente do homologado", () => {
    const r = conciliarCatalogo({ ...base, precoObservado: 9000 });
    const d = r.divergencias.find((x) => x.codigo === COD.PRECO_DIVERGENTE);
    expect(d?.severidade).toBe("bloqueante");
    expect(d?.valor_catalogo).toBe(12000);
  });

  it("aceita diferença dentro da tolerância de arredondamento", () => {
    const r = conciliarCatalogo({ ...base, precoObservado: 12000.005 });
    expect(r.divergencias.some((d) => d.codigo === COD.PRECO_DIVERGENTE)).toBe(false);
  });

  it("bloqueia origem de preço não canônica", () => {
    const r = conciliarCatalogo({ ...base, origemPreco: "whatsapp" });
    expect(r.divergencias.some((d) => d.codigo === COD.ORIGEM_PRECO_NAO_CANONICA)).toBe(true);
  });

  it("bloqueia escopo insuficiente para OS/contrato", () => {
    const r = conciliarCatalogo({ ...base, escopo: { ...base.escopo, entregas: [], pessoas: 0 } });
    const d = r.divergencias.find((x) => x.codigo === COD.ESCOPO_INSUFICIENTE);
    expect(d).toBeDefined();
    expect(r.pode_gerar_os).toBe(false);
    expect(mensagemBloqueio(r)).toContain("Conciliação de catálogo bloqueou a geração");
  });

  it("sinaliza como atenção item de escopo fora do catálogo e condição divergente", () => {
    const r = conciliarCatalogo({
      ...base,
      condicaoObservada: "à vista",
      escopo: { ...base.escopo, inclusoes: ["Consultoria extra"] },
    });
    expect(r.divergencias.find((d) => d.codigo === COD.ESCOPO_FORA_DO_CATALOGO)?.severidade).toBe("atencao");
    expect(r.divergencias.find((d) => d.codigo === COD.CONDICAO_DIVERGENTE)?.severidade).toBe("atencao");
    expect(r.pode_gerar_os).toBe(true);
  });

  it("bloqueia quando não há condição comercial persistida", () => {
    const r = conciliarCatalogo({ ...base, condicaoComercialPersistida: false });
    expect(r.divergencias.some((d) => d.codigo === COD.SEM_CONDICAO_PERSISTIDA)).toBe(true);
  });

  it("bloqueia SKU fora de vigência", () => {
    const r = conciliarCatalogo({ ...base, produto: { ...produto, vigencia_fim: "2026-01-31" } });
    expect(r.divergencias.some((d) => d.codigo === COD.FORA_VIGENCIA)).toBe(true);
  });
});
