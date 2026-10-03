import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  A7_AUTORIZACAO,
  assinaturaPublicada,
  conteudoAssinatura,
  formatarValor,
  TIPO_ASSINATURA,
  TIPO_UPSELL,
  upsellsPublicados,
  validarAssinatura,
  valorEmCentavos,
} from "@/lib/assinatura-app";
import { tipoChegaAoCliente, TIPOS_ENTREGA_APP, TIPOS_FORA_DO_APP } from "@/lib/projecoes-cliente";
import { jornadaSanitizada } from "@/lib/portal-dados-vivos";

/**
 * A7 (03/10/2026) — "somente devemos mostrar sua assinatura e possibilidade
 * de upsell com preço também precisa de um campo para editar se não tiver no
 * app e no desk".
 */

const ok = { nome: "Acompanhamento Familiar", valorCentavos: 32000, periodicidade: "mensal", situacao: "ativa" };

describe("o valor entra como campo estruturado", () => {
  it("lê R$ 320, 320,00 e 320", () => {
    expect(valorEmCentavos("R$ 320")).toBe(32000);
    expect(valorEmCentavos("320,00")).toBe(32000);
    expect(valorEmCentavos("320")).toBe(32000);
    expect(valorEmCentavos("1.234,56")).toBe(123456);
  });

  it("recusa o que não é valor, em vez de gravar zero", () => {
    for (const x of ["", "grátis", "a combinar", "3x de 320", "abc"]) expect(valorEmCentavos(x)).toBeNull();
  });

  it("formata em real brasileiro", () => {
    expect(formatarValor(32000).replace(/ /g, " ")).toBe("R$ 320,00");
  });
});

describe("o texto livre continua sem preço — a exceção é só do campo de valor", () => {
  it("aceita a entrada correta", () => {
    expect(validarAssinatura(ok)).toEqual([]);
  });

  it("recusa preço escrito dentro do nome do plano", () => {
    const e = validarAssinatura({ ...ok, nome: "Acompanhamento — 3 parcelas de R$ 320" });
    expect(e.join(" ")).toMatch(/O valor vai no campo de valor/);
  });

  it("recusa vocabulário interno no nome", () => {
    expect(validarAssinatura({ ...ok, nome: "Dossiê de evidências da fonte" }).length).toBeGreaterThan(0);
  });

  it("recusa preço ou vocabulário interno na situação", () => {
    expect(validarAssinatura({ ...ok, situacao: "ativa, R$ 320" }).length).toBeGreaterThan(0);
  });

  it("recusa valor ausente, zero, negativo e acima do limite de segurança", () => {
    for (const v of [0, -1, 100_000_01]) {
      expect(validarAssinatura({ ...ok, valorCentavos: v }).length, String(v)).toBeGreaterThan(0);
    }
  });

  it("recusa periodicidade fora da lista", () => {
    expect(validarAssinatura({ ...ok, periodicidade: "semanal" }).length).toBeGreaterThan(0);
  });
});

describe("leitura no App", () => {
  const proj = (tipo: string, conteudo: string, quando: string, id = tipo) => ({
    id,
    projection_type: tipo,
    content_sanitized: conteudo,
    effective_from: quando,
  });

  it("devolve a assinatura publicada mais recente", () => {
    const a = assinaturaPublicada([
      proj(TIPO_ASSINATURA, conteudoAssinatura(ok), "2026-09-01", "velha"),
      proj(TIPO_ASSINATURA, conteudoAssinatura({ ...ok, valorCentavos: 39000 }), "2026-10-01", "nova"),
    ]);
    expect(a?.id).toBe("nova");
    expect(a?.valor.replace(/ /g, " ")).toBe("R$ 390,00");
    expect(a?.periodicidadeRotulo).toBe("por mês");
  });

  it("sem publicação devolve null — estado vazio honesto, nunca plano inventado", () => {
    expect(assinaturaPublicada([])).toBeNull();
    expect(upsellsPublicados([])).toEqual([]);
  });

  it("upsell é lista, assinatura é uma", () => {
    const us = upsellsPublicados([
      proj(TIPO_UPSELL, conteudoAssinatura({ ...ok, nome: "Legado" }), "2026-10-01", "u1"),
      proj(TIPO_UPSELL, conteudoAssinatura({ ...ok, nome: "Memórias" }), "2026-10-02", "u2"),
    ]);
    expect(us.map((u) => u.id)).toEqual(["u2", "u1"]);
  });
});

describe("fronteira do App preservada", () => {
  it("os dois tipos chegam ao cliente, contrato e proposta não", () => {
    expect(tipoChegaAoCliente(TIPO_ASSINATURA)).toBe(true);
    expect(tipoChegaAoCliente(TIPO_UPSELL)).toBe(true);
    expect(TIPOS_FORA_DO_APP.has("contrato")).toBe(true);
    expect(TIPOS_FORA_DO_APP.has("proposta")).toBe(true);
  });

  it("nenhum dos dois rende cartão de entrega na jornada", () => {
    expect(TIPOS_ENTREGA_APP.has(TIPO_ASSINATURA)).toBe(false);
    expect(TIPOS_ENTREGA_APP.has(TIPO_UPSELL)).toBe(false);
  });

  it("assinatura e upsell não aparecem na linha da Jornada — são blocos da Conta", () => {
    const j = jornadaSanitizada(
      [
        { id: "a", projection_type: TIPO_ASSINATURA, content_sanitized: conteudoAssinatura(ok), effective_from: "2026-10-01" },
        { id: "m", projection_type: "marco", content_sanitized: "Primeira etapa concluída", effective_from: "2026-10-02" },
      ] as never,
      new Date("2026-10-03T00:00:00Z"),
    );
    expect(j.linha.map((l) => l.id)).toEqual(["m"]);
  });
});

describe("o campo editável existe nas duas superfícies", () => {
  it("no Desk, em Caso 360 › Formalização", () => {
    const caso = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
    expect(caso).toMatch(/PublicarAssinaturaApp/);
    const painel = readFileSync("src/components/contrato/publicar-assinatura-app.tsx", "utf8");
    expect(painel).toMatch(/publicarAssinaturaNoApp/);
    expect(painel).toMatch(/label="Valor"/);
  });

  it("no App, na Conta, com valor e upsell", () => {
    const conta = readFileSync("src/routes/portal/conta.tsx", "utf8");
    expect(conta).toMatch(/data-conta-assinatura-valor/);
    expect(conta).toMatch(/data-conta-upsell/);
    expect(conta).toMatch(/Sua assinatura/);
    expect(conta).toMatch(/Próximo nível disponível/);
  });

  it("o App não cobra nem gera pagamento — só mostra", () => {
    const conta = readFileSync("src/routes/portal/conta.tsx", "utf8");
    expect(conta).toMatch(/Nada é cobrado por aqui/);
    expect(conta).not.toMatch(/asaas|checkout|pagar|boleto|pix/i);
  });

  it("a autorização fica registrada no código, com escopo", () => {
    expect(A7_AUTORIZACAO.data).toBe("2026-10-03");
    expect(A7_AUTORIZACAO.escopo).toMatch(/Nunca parcela, desconto, cobrança/);
  });
});
