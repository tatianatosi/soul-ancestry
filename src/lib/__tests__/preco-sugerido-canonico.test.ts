import { describe, expect, it } from "vitest";

import {
  autorizaCobranca,
  avaliarOverrideDivergencia,
  contarEstados,
  exigeConfirmacaoExterna,
  podeIniciarRascunhoComercial,
  previsaoFinanceira,
  resolverPrecoSugerido,
  resolverValorOperacional,
  selecionavelNoPlanejador,
  sinaisPrecoPainel,
  SELO_PRECO_SUGERIDO,
  type SkuPrecoSugerido,
} from "@/lib/preco-sugerido-canonico";

const base: SkuPrecoSugerido = {
  id: "sku-1",
  code: "CA-CID-AT-001",
  nome: "Cidadania — atendimento familiar",
  preco_sugerido: 9600,
  preco_atual: 9600,
  moeda: "BRL",
  fonte_versao: "OFICIAL-2/2b0a6512abdf641f",
  vigencia_inicio: "2026-01-01",
  vigencia_fim: null,
  status_produto: "ativo",
  status_fonte: "Ativo",
  ativo: true,
  archived_at: null,
  dados_teste: false,
};

describe("estados derivados de preço sugerido", () => {
  it("classifica SKU com preço sugerido disponível", () => {
    const r = resolverPrecoSugerido(base, []);
    expect(r.estado).toBe("PRECO_SUGERIDO_DISPONIVEL");
    expect(r.valor).toBe(9600);
    expect(r.moeda).toBe("BRL");
    expect(r.origem).toBe(base.fonte_versao);
    expect(selecionavelNoPlanejador(r)).toBe(true);
    expect(r.selo).toBeNull();
  });

  it("classifica com ressalva quando há divergência informativa ou preço praticado diferente", () => {
    const r = resolverPrecoSugerido({ ...base, preco_atual: 8800 }, [
      { tipo: "campo_ausente_na_fonte", detalhe: "Canal de fechamento ausente." },
    ]);
    expect(r.estado).toBe("PRECO_SUGERIDO_COM_RESSALVA");
    expect(r.selo).toBe(SELO_PRECO_SUGERIDO);
    expect(podeIniciarRascunhoComercial(r)).toBe(true);
    expect(r.motivos.length).toBeGreaterThanOrEqual(2);
  });

  it("bloqueia sem valor, sem moeda, sem origem, fora de vigência, arquivado ou crítico", () => {
    expect(resolverPrecoSugerido({ ...base, preco_sugerido: null }).estado).toBe(
      "PRECO_SUGERIDO_BLOQUEADO",
    );
    expect(resolverPrecoSugerido({ ...base, moeda: null }).estado).toBe("PRECO_SUGERIDO_BLOQUEADO");
    expect(
      resolverPrecoSugerido({ ...base, fonte_versao: null, fonte_referencia: null }).estado,
    ).toBe("PRECO_SUGERIDO_BLOQUEADO");
    expect(
      resolverPrecoSugerido({ ...base, vigencia_fim: "2026-01-31" }, [], new Date("2026-08-23"))
        .estado,
    ).toBe("PRECO_SUGERIDO_BLOQUEADO");
    expect(resolverPrecoSugerido({ ...base, status_produto: "suspenso" }).estado).toBe(
      "PRECO_SUGERIDO_BLOQUEADO",
    );
    expect(
      resolverPrecoSugerido(base, [{ tipo: "divergencia_moeda", detalhe: "Moeda conflitante." }])
        .estado,
    ).toBe("PRECO_SUGERIDO_BLOQUEADO");
    expect(resolverPrecoSugerido(null).estado).toBe("PRECO_SUGERIDO_BLOQUEADO");
  });

  it("exclui DEMO/TESTE do uso operacional", () => {
    const r = resolverPrecoSugerido({ ...base, dados_teste: true });
    expect(r.estado).toBe("PRECO_SUGERIDO_BLOQUEADO");
    expect(r.motivos.some((m) => m.codigo === "PS_DADOS_TESTE")).toBe(true);
  });

  it("conta SKUs por estado", () => {
    const t = contarEstados([
      resolverPrecoSugerido(base),
      resolverPrecoSugerido({ ...base, preco_atual: 100 }),
      resolverPrecoSugerido({ ...base, preco_sugerido: null }),
    ]);
    expect(t).toEqual({
      PRECO_SUGERIDO_DISPONIVEL: 1,
      PRECO_SUGERIDO_COM_RESSALVA: 1,
      PRECO_SUGERIDO_BLOQUEADO: 1,
    });
  });
});

describe("matriz de precedência", () => {
  it("preço sugerido preenche rascunho de proposta como referência não final", () => {
    const v = resolverValorOperacional({ precoSugerido: resolverPrecoSugerido(base) });
    expect(v.origem).toBe("preco_sugerido_catalogo");
    expect(v.valor).toBe(9600);
    expect(v.valor_final).toBe(false);
    expect(v.requer_validacao_comercial).toBe(true);
  });

  it("condição aprovada prevalece sobre proposta e preço sugerido", () => {
    const v = resolverValorOperacional({
      condicaoAprovada: { valor: 8000 },
      propostaAprovada: { valor: 9600 },
      precoSugerido: resolverPrecoSugerido(base),
    });
    expect(v.origem).toBe("condicao_comercial_aprovada");
    expect(v.valor).toBe(8000);
  });

  it("proposta aprovada prevalece sobre preço sugerido", () => {
    const v = resolverValorOperacional({
      propostaAprovada: { valor: 9600 },
      precoSugerido: resolverPrecoSugerido({ ...base, preco_sugerido: 12000 }),
    });
    expect(v.origem).toBe("proposta_aprovada");
    expect(v.valor).toBe(9600);
  });

  it("sem preço utilizável resulta em sem_preco", () => {
    const v = resolverValorOperacional({
      precoSugerido: resolverPrecoSugerido({ ...base, preco_sugerido: null }),
    });
    expect(v.origem).toBe("sem_preco");
    expect(v.valor).toBeNull();
  });

  it("nunca autoriza cobrança/Asaas e financeiro trata como previsão", () => {
    const v = resolverValorOperacional({ precoSugerido: resolverPrecoSugerido(base) });
    expect(autorizaCobranca(v)).toBe(false);
    expect(previsaoFinanceira(v).caixa).toBe(false);
    for (const a of [
      "cobranca",
      "link_asaas",
      "assinatura",
      "pagamento",
      "comunicacao",
      "publicacao",
    ])
      expect(exigeConfirmacaoExterna(a)).toBe(true);
  });
});

describe("caso Ana Luiza — auditoria sem alteração", () => {
  it("mantém o valor aprovado da proposta como valor vigente", () => {
    const resolucao = resolverPrecoSugerido(null); // proposta sem SKU canônico vinculado
    const v = resolverValorOperacional({
      propostaAprovada: { valor: 9600, moeda: "BRL", referencia: "Proposta aprovada v1" },
      precoSugerido: resolucao,
    });
    expect(resolucao.estado).toBe("PRECO_SUGERIDO_BLOQUEADO");
    expect(v.valor).toBe(9600);
    expect(v.origem).toBe("proposta_aprovada");
  });
});

describe("override da Proprietária e sinais do Painel", () => {
  it("permite override auditado de divergência não crítica", () => {
    const r = avaliarOverrideDivergencia({
      papel: "admin",
      sku: "CA-CID-AT-001",
      motivo: "Assumido preço sugerido enquanto a homologação formal não ocorre.",
      fonte: "product_catalog / OFICIAL-2",
      valor_anterior: 8800,
      valor_novo: 9600,
      divergencias: [{ tipo: "campo_ausente_na_fonte" }],
      autora: "tati@pluggedresearch.com",
      em: "2026-08-23T01:00:00Z",
    });
    expect(r.permitido).toBe(true);
    if (r.permitido) expect(r.evento.estado_alvo).toBe("pronto_para_confirmacao_externa");
  });

  it("recusa override para outro papel e para divergência crítica", () => {
    const outro = avaliarOverrideDivergencia({
      papel: "comercial",
      sku: "X",
      motivo: "m",
      fonte: "f",
      valor_anterior: null,
      valor_novo: null,
      divergencias: [],
      autora: "a",
      em: "2026-08-23T01:00:00Z",
    });
    expect(outro.permitido).toBe(false);
    const critico = avaliarOverrideDivergencia({
      papel: "admin",
      sku: "X",
      motivo: "m",
      fonte: "f",
      valor_anterior: null,
      valor_novo: null,
      divergencias: [{ tipo: "divergencia_vigencia" }],
      autora: "a",
      em: "2026-08-23T01:00:00Z",
    });
    expect(critico.permitido).toBe(false);
  });

  it("Painel mostra apenas sinais relevantes, nunca o catálogo", () => {
    const sinais = sinaisPrecoPainel({
      casos: [
        {
          caseId: "c1",
          codigo: "CA-1",
          sku: null,
          resolucao: resolverPrecoSugerido(null),
          condicaoAprovada: false,
        },
        {
          caseId: "c2",
          codigo: "CA-2",
          sku: "S",
          resolucao: resolverPrecoSugerido(base),
          condicaoAprovada: true,
        },
        {
          caseId: "c3",
          codigo: "CA-3",
          sku: "S",
          resolucao: resolverPrecoSugerido(base),
          condicaoAprovada: true,
          condicaoVencida: true,
        },
      ],
    });
    expect(sinais.map((s) => s.codigo)).toEqual([
      "PAINEL_PRECO_SUGERIDO_BLOQUEADO",
      "PAINEL_CONDICAO_VENCIDA",
    ]);
    expect(sinais[0].destino).toBe("/casos/c1");
  });
});
