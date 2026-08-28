import { describe, expect, it } from "vitest";

import { dicionarioAnexos } from "@/lib/anexos-dicionario";
import {
  agruparAuditoria,
  bloqueiosResolutivos,
  temBloqueioImpeditivo,
} from "@/lib/bloqueios-dicionario";
import { validarFluxo } from "@/lib/comercial-fluxo";
import { definicaoCampo, validarValorCampo } from "@/lib/parametros-dicionario";

describe("campos parametrizáveis controlados", () => {
  it("rejeita valor fora da lista em campo classificatório", () => {
    const r = validarValorCampo({
      campo: "forma_pagamento",
      valor: "combinado no zap",
      origem: "proposta",
    });
    expect(r.ok).toBe(false);
  });

  it("aceita valor da lista controlada", () => {
    const r = validarValorCampo({
      campo: "forma_pagamento",
      valor: "assinatura_mensal",
      origem: "proposta",
    });
    expect(r.ok).toBe(true);
  });

  it("preserva valor legado já gravado", () => {
    const r = validarValorCampo({
      campo: "pais_rota",
      valor: "Austria",
      origem: "planejador",
      justificativa: "valor homologado no Planejador",
      valorAtual: "Austria",
    });
    expect(r.ok).toBe(true);
  });

  it("exige justificativa em campo que a torna obrigatória", () => {
    const r = validarValorCampo({
      campo: "despesas_externas",
      valor: "estimada",
      origem: "proposta",
    });
    expect(r.ok).toBe(false);
  });

  it("rejeita origem não permitida para o campo", () => {
    const r = validarValorCampo({ campo: "produto_sku", valor: "qualquer", origem: "whatsapp" });
    expect(r.ok).toBe(false);
  });

  it("valida formato monetário", () => {
    expect(
      validarValorCampo({
        campo: "valor_total",
        valor: "9600",
        origem: "proposta",
        justificativa: "conforme proposta",
      }).ok,
    ).toBe(true);
    expect(
      validarValorCampo({
        campo: "valor_total",
        valor: "R$ 9.600",
        origem: "proposta",
        justificativa: "x",
      }).ok,
    ).toBe(false);
  });

  it("mantém texto identitário como texto livre", () => {
    expect(definicaoCampo("contratante_nome").tipo).toBe("texto_curto");
    expect(definicaoCampo("escopo_resumo").tipo).toBe("texto_longo");
  });
});

describe("dicionário de anexos", () => {
  it("torna ANX-INDIVIDUAL obrigatório com mais de uma pessoa", () => {
    const anexos = dicionarioAnexos({ beneficiarios: "Ana || Adair || Alice" });
    expect(anexos.find((a) => a.codigo === "ANX-INDIVIDUAL")?.obrigatorio).toBe(true);
  });

  it("não aplica ANX-REPRESENTACAO sem representação declarada", () => {
    const anexos = dicionarioAnexos({
      representacaoLegal: "Todos os beneficiários são maiores de idade.",
    });
    expect(anexos.find((a) => a.codigo === "ANX-REPRESENTACAO")?.aplicavel).toBe(false);
  });

  it("mantém escopo e privacidade sempre obrigatórios", () => {
    const anexos = dicionarioAnexos({});
    expect(anexos.filter((a) => a.obrigatorio).map((a) => a.codigo)).toEqual([
      "ANX-ESCOPO",
      "ANX-PRIVACIDADE",
    ]);
  });
});

describe("propostas", () => {
  it("permite negociação e substituição", () => {
    expect(() => validarFluxo("proposals", "enviada", "em_negociacao")).not.toThrow();
    expect(() => validarFluxo("proposals", "em_negociacao", "substituida")).not.toThrow();
  });

  it("bloqueia reativar proposta substituída", () => {
    expect(() => validarFluxo("proposals", "substituida", "aprovada")).toThrow();
  });
});

describe("bloqueios acionáveis e auditoria", () => {
  const valores = [
    {
      id: "v1",
      campo: "valor_total",
      label: "Valor total",
      obrigatorio: true,
      valor: null,
      status: "vazio",
    },
    {
      id: "v2",
      campo: "pais_rota",
      label: "País/rota",
      obrigatorio: true,
      valor: "Austria",
      status: "validado",
    },
  ];

  it("aponta os campos vazios do bloqueio", () => {
    const r = bloqueiosResolutivos(
      [{ chave: "campo_obrigatorio", motivo: "1 campo vazio" }],
      valores as any,
    );
    expect(r[0].camposAfetados).toEqual([{ id: "v1", label: "Valor total" }]);
    expect(temBloqueioImpeditivo(r)).toBe(true);
  });

  it("classifica revisão humana como não impeditiva", () => {
    const r = bloqueiosResolutivos(
      [{ chave: "revisao_humana", motivo: "pendente" }],
      valores as any,
    );
    expect(temBloqueioImpeditivo(r)).toBe(false);
  });

  it("agrupa eventos repetidos em janela de 30 minutos", () => {
    const base = Date.parse("2026-08-15T10:00:00Z");
    const eventos = [0, 5, 12, 90].map((min, i) => ({
      id: `e${i}`,
      acao: "contrato_preparacao_aberta",
      created_at: new Date(base + min * 60_000).toISOString(),
    }));
    const grupos = agruparAuditoria(eventos);
    expect(grupos).toHaveLength(2);
    expect(grupos[0].ocorrencias).toBe(3);
  });
});
