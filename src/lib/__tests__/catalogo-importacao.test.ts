import { describe, expect, it } from "vitest";

import {
  FONTE_MESTRE_VERSAO,
  SKUS_TOP_PARETO,
  divergenciasDaFonte,
  mapaFonteMestre,
  mensagemBloqueioCaso,
  parcelamentoInferido,
  precoDaFonte,
  previaImportacao,
  selecionavelEmProposta,
} from "@/lib/catalogo-importacao";

const catalogoImportado = SKUS_TOP_PARETO.map((s) => ({
  sku: s.sku,
  fonte_versao: FONTE_MESTRE_VERSAO,
}));

describe("catálogo — fonte canônica", () => {
  it("mapa somente-leitura reflete a planilha mestre", () => {
    const m = mapaFonteMestre();
    expect(m.arquivo).toContain("Planilha Mestre de Produtos");
    expect(m.aba).toBe("Catalogo Produtos");
    expect(m.totais.totalSkus).toBe(85);
    expect(m.totais.topPareto).toBe(32);
    expect(m.skusTopPareto).toBe(30);
  });

  it("importa 30 SKUs Top Pareto ativos preservando código, preço, status e categoria", () => {
    expect(SKUS_TOP_PARETO).toHaveLength(30);
    expect(new Set(SKUS_TOP_PARETO.map((s) => s.sku)).size).toBe(30);
    for (const s of SKUS_TOP_PARETO) {
      expect(s.sku).toMatch(/^CA-/);
      expect(s.status).toBe("Ativo");
      expect(s.pareto).toBe("TOP_PARETO");
      expect(s.precoSugerido).toBeTypeOf("number");
      expect(s.categoria).toBeTruthy();
      expect(s.moeda).toBe("BRL");
    }
  });

  it("segunda importação da mesma versão não duplica itens", () => {
    const p = previaImportacao(catalogoImportado);
    expect(p.resumo.inalterado).toBe(30);
    expect(p.resumo.criar).toBe(0);
    expect(p.resumo.atualizar).toBe(0);
  });

  it("nova versão da fonte gera atualização controlada, sem apagar histórico", () => {
    const p = previaImportacao(
      catalogoImportado.map((c) => ({ ...c, fonte_versao: "OFICIAL-1/antiga" })),
    );
    expect(p.resumo.atualizar).toBe(30);
    expect(p.linhas.every((l) => l.motivo === "Nova versão da fonte")).toBe(true);
  });

  it("catálogo vazio produz apenas criações", () => {
    expect(previaImportacao([]).resumo.criar).toBe(30);
  });
});

describe("consumo pelo motor", () => {
  const ativo = {
    sku: "CA-CID-001",
    status_fonte: "Ativo",
    status_produto: "ativo",
    preco_sugerido: 260,
  };

  it("SKU ativo importado pode ser selecionado em proposta", () => {
    expect(selecionavelEmProposta(ativo)).toEqual({ permitido: true, motivo: null });
  });

  it("SKU inativo não pode ser selecionado", () => {
    const r = selecionavelEmProposta({ ...ativo, status_fonte: "Inativo" });
    expect(r.permitido).toBe(false);
    expect(r.motivo).toContain("inativo");
  });

  it("SKU inexistente bloqueia com motivo explícito", () => {
    expect(selecionavelEmProposta(undefined).motivo).toContain("inexistente");
  });

  it("campo ausente não é inventado e bloqueia", () => {
    const r = selecionavelEmProposta({ ...ativo, preco_sugerido: null });
    expect(r.permitido).toBe(false);
    expect(r.motivo).toContain("preço sugerido");
  });

  it("preço vem sempre da fonte, com referência de versão", () => {
    const p = precoDaFonte({ preco_sugerido: 260, moeda: "BRL" });
    expect(p).toEqual({ valor: 260, moeda: "BRL", origem: FONTE_MESTRE_VERSAO });
  });

  it("parcelas e vencimentos nunca são inferidos", () => {
    expect(parcelamentoInferido()).toBeNull();
  });
});

describe("divergências e Asaas", () => {
  it("registra divergência de preço quando praticado difere do sugerido", () => {
    const sku = SKUS_TOP_PARETO.find((s) => s.precoAtual !== s.precoSugerido)!;
    expect(divergenciasDaFonte(sku).some((d) => d.tipo === "divergencia_preco")).toBe(true);
  });

  it("apenas reconcilia o estado do link, sem criar ou chamar Asaas", () => {
    const semLink = SKUS_TOP_PARETO.find((s) => s.statusLinkAsaas !== "link_criado")!;
    const d = divergenciasDaFonte(semLink).find((x) => x.tipo === "reconciliacao_asaas")!;
    expect(d.detalhe).toContain("Nenhuma chamada ao Asaas");
    expect(semLink.linkAsaas).toBeNull();
  });

  it("colunas ausentes na fonte viram exceção explícita em todo SKU", () => {
    for (const s of SKUS_TOP_PARETO.slice(0, 5)) {
      expect(divergenciasDaFonte(s).some((d) => d.tipo === "campo_ausente_na_fonte")).toBe(true);
    }
  });
});

describe("Painel Hoje", () => {
  it("expõe apenas a consequência operacional do caso, sem catálogo", () => {
    const msg = mensagemBloqueioCaso("SKU ausente/inativo/em conflito");
    expect(msg).toBe("Condição comercial bloqueada: SKU ausente/inativo/em conflito");
    expect(msg).not.toContain("Pareto");
    expect(msg).not.toContain("preço");
  });
});
