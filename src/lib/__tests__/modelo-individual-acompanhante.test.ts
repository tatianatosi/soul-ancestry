import { describe, expect, it } from "vitest";

import {
  ANEXOS_MODELO_INDIVIDUAL,
  GATES_MODELO_INDIVIDUAL,
  MODELO_INDIVIDUAL_BASE,
  MODELO_INDIVIDUAL_STATUS,
  MODELO_INDIVIDUAL_VERSAO,
  PLACEHOLDERS_TESTE,
  TRAVAS_ACOMPANHANTE,
  anexosIndividuaisDaComposicao,
  criarAcompanhante,
  criarRequerentePrincipal,
  previaTesteModeloIndividual,
  requisitosInclusaoAcompanhante,
  validarComposicaoIndividual,
} from "@/lib/modelo-individual-acompanhante";

describe("modelo individual — requerente único com acompanhante", () => {
  it("nasce como v1.0 e under_legal_review, complementar ao modelo-base", () => {
    expect(MODELO_INDIVIDUAL_VERSAO).toBe("v1.0");
    expect(MODELO_INDIVIDUAL_STATUS).toBe("under_legal_review");
    expect(MODELO_INDIVIDUAL_BASE).toBe("MODELO-ESTUDO + BASE-GEN-V2");
  });

  it("aceita exatamente um requerente principal", () => {
    const r = validarComposicaoIndividual({ requerentes: [criarRequerentePrincipal()] });
    expect(r.valido).toBe(true);
    expect(r.anexosAplicaveis).toContain("ANX-INDIVIDUAL");
  });

  it("rejeita zero ou dois requerentes principais", () => {
    expect(validarComposicaoIndividual({ requerentes: [] }).valido).toBe(false);
    const dois = validarComposicaoIndividual({
      requerentes: [criarRequerentePrincipal(), criarRequerentePrincipal()],
    });
    expect(dois.valido).toBe(false);
    expect(dois.bloqueios[0]?.codigo).toBe("MI-G01");
  });

  it("acompanhante é opcional e não gera ANX-INDIVIDUAL", () => {
    const composicao = {
      requerentes: [criarRequerentePrincipal()],
      acompanhante: criarAcompanhante({ vinculoDeclarado: "não informado" }),
    };
    expect(validarComposicaoIndividual(composicao).valido).toBe(true);
    expect(anexosIndividuaisDaComposicao(composicao)).toHaveLength(1);
  });

  it("acompanhante não é parte, signatária, requerente nem beneficiária automática", () => {
    expect(TRAVAS_ACOMPANHANTE.parte_contratante).toBe(false);
    expect(TRAVAS_ACOMPANHANTE.signatario).toBe(false);
    expect(TRAVAS_ACOMPANHANTE.requerente).toBe(false);
    expect(TRAVAS_ACOMPANHANTE.beneficiario_automatico_do_escopo).toBe(false);
    expect(TRAVAS_ACOMPANHANTE.anexo_individual_aplicavel).toBe(false);
  });

  it("acompanhante não recebe acesso a dados/portal por padrão", () => {
    expect(TRAVAS_ACOMPANHANTE.pode_acessar_dados).toBe(false);
    const r = validarComposicaoIndividual({
      requerentes: [criarRequerentePrincipal()],
      acompanhante: { ...criarAcompanhante(), podeAcessarDados: true } as never,
    });
    expect(r.valido).toBe(false);
    expect(r.bloqueios.some((b) => b.codigo === "MI-G02")).toBe(true);
  });

  it("inclusão posterior exige Anexo V e nova versão do Anexo I", () => {
    const req = requisitosInclusaoAcompanhante().join(" | ");
    expect(req).toContain("ANEXO-V");
    expect(req).toContain("ANEXO-I");
    expect(req).toContain("Revisão humana");
  });

  it("não permite preço, vencimento, procuração, país ou consentimento inferidos", () => {
    const codigos = GATES_MODELO_INDIVIDUAL.map((g) => g.codigo);
    expect(codigos).toContain("MI-G05");
    expect(codigos).toContain("MI-G06");
    expect(codigos).toContain("MI-G07");
    const condicionais = ANEXOS_MODELO_INDIVIDUAL.filter((a) =>
      ["ANEXO-I", "ANEXO-III", "ANEXO-IV", "ANEXO-V"].includes(a.codigo),
    );
    expect(condicionais.every((a) => a.classe === "condicional")).toBe(true);
    expect(
      ANEXOS_MODELO_INDIVIDUAL.find((a) => a.codigo === "ANX-REPRESENTACAO")?.classe,
    ).toBe("nao_aplicavel_por_padrao");
  });

  it("prévia TESTE usa apenas placeholders neutros", () => {
    const previa = previaTesteModeloIndividual();
    const texto = previa.blocos.map((b) => b.conteudo).join(" ");
    expect(texto).toContain(PLACEHOLDERS_TESTE.requerente);
    expect(texto).toContain(PLACEHOLDERS_TESTE.acompanhante);
    expect(texto).not.toMatch(/Ana|João|Danilo|R\$|CPF/i);
  });
});
