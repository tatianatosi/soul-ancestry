import { describe, expect, it } from "vitest";
import { traduzirFase, rotuloComPrecisao } from "@/lib/jornada-de-para";

describe("jornada-de-para", () => {
  it("traduz jornada-cliente para o canônico com precisão exata", () => {
    const c = traduzirFase("jornada_cliente", "pesquisa_validacao");
    expect(c?.canonico).toBe("pesquisa_e_validacao");
    expect(c?.precisao).toBe("exata");
  });

  it("devolve null para valor desconhecido em vez de inventar", () => {
    expect(traduzirFase("jornada_cliente", "fase_que_nao_existe")).toBeNull();
    expect(traduzirFase("catalogo_operacional", "Etapa inventada")).toBeNull();
  });

  it("marca fases de pré-venda sem correspondência de caso como aproximada e sem canônico", () => {
    const c = traduzirFase("derivacao_jornada", "triagem_inicial");
    expect(c?.canonico).toBeNull();
    expect(c?.precisao).toBe("aproximada");
    expect(c?.motivo).not.toBe("");
  });

  it("traduz relatorios-fase para o canônico mais próximo, marcado aproximado quando agrupa fases finas", () => {
    const c = traduzirFase("relatorios_fase", "fase_2_pesquisa");
    expect(c?.canonico).toBe("pesquisa_e_validacao");
    expect(c?.precisao).toBe("aproximada");
  });

  it("traduz catalogo-operacional, incluindo a etapa pós-jornada sem canônico", () => {
    const documental = traduzirFase("catalogo_operacional", "Documentação e pendências");
    expect(documental?.canonico).toBe("preparacao_documental");
    expect(documental?.precisao).toBe("exata");

    const legado = traduzirFase("catalogo_operacional", "Legado e continuidade");
    expect(legado?.canonico).toBeNull();
  });

  it("aceita o dicionário canonico para uso uniforme", () => {
    const c = traduzirFase("canonico", "onboarding");
    expect(c?.canonico).toBe("onboarding");
    expect(c?.precisao).toBe("exata");
  });

  it("rotuloComPrecisao avisa quando a correspondência é aproximada", () => {
    const aproximado = traduzirFase("relatorios_fase", "fase_1_diagnostico")!;
    expect(rotuloComPrecisao(aproximado)).toMatch(/\(aproximado\)$/);

    const exato = traduzirFase("jornada_cliente", "onboarding")!;
    expect(rotuloComPrecisao(exato)).not.toMatch(/aproximado/);
  });
});
