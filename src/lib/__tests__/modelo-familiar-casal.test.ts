import { describe, expect, it } from "vitest";

import {
  ANEXOS_MODELO_FAMILIAR_CASAL,
  MODELO_FAMILIAR_CASAL_BASE,
  MODELO_FAMILIAR_CASAL_STATUS,
  MODELO_FAMILIAR_CASAL_VERSAO,
  NUCLEO_FAMILIAR_CASAL,
  anexosCondicionaisAplicaveis,
  anexosIndividuaisFamiliar,
  avaliarGeracaoContratoFamiliar,
  criarAdultoFamiliar,
  podeAssinarFamiliar,
  previaTesteModeloFamiliarCasal,
  validarComposicaoFamiliarCasal,
  type ComposicaoFamiliarCasal,
} from "@/lib/modelo-familiar-casal";

function adulto(papel: "requerente_principal" | "conjuge_segunda_requerente") {
  return criarAdultoFamiliar(papel, {
    identificado: true,
    vinculoDeclarado: "[VÍNCULO DECLARADO]",
    parteContratante: true,
    signatario: true,
    confirmacao: "confirmado_humano",
  });
}

const casalValido: ComposicaoFamiliarCasal = {
  adultos: [adulto("requerente_principal"), adulto("conjuge_segunda_requerente")],
};

describe("FAMILIAR — CASAL DOIS ADULTOS v1.0", () => {
  it("28/08/2026 — nasce com versão v1.0 e status vigente (revisão jurídica concluída)", () => {
    expect(MODELO_FAMILIAR_CASAL_VERSAO).toBe("v1.0");
    expect(MODELO_FAMILIAR_CASAL_STATUS).toBe("vigente");
    expect(MODELO_FAMILIAR_CASAL_BASE).toBe("MODELO-ESTUDO + BASE-GEN-V2");
  });

  it("define núcleo com exatamente dois adultos, sem dependentes nem representação", () => {
    expect(NUCLEO_FAMILIAR_CASAL.adultos_minimos).toBe(2);
    expect(NUCLEO_FAMILIAR_CASAL.adultos_maximos).toBe(2);
    expect(NUCLEO_FAMILIAR_CASAL.dependentes_permitidos).toBe(false);
    expect(NUCLEO_FAMILIAR_CASAL.representacao_legal_padrao).toBe(false);
  });

  it("não instancia com uma pessoa adulta", () => {
    const r = validarComposicaoFamiliarCasal({ adultos: [adulto("requerente_principal")] });
    expect(r.valido).toBe(false);
    expect(r.bloqueios.some((b) => b.codigo === "MF-G01")).toBe(true);
  });

  it("não instancia com três ou mais pessoas adultas", () => {
    const r = validarComposicaoFamiliarCasal({
      adultos: [
        adulto("requerente_principal"),
        adulto("conjuge_segunda_requerente"),
        adulto("conjuge_segunda_requerente"),
      ],
    });
    expect(r.valido).toBe(false);
    expect(r.bloqueios.some((b) => b.codigo === "MF-G01")).toBe(true);
  });

  it("instancia com exatamente dois adultos identificados", () => {
    const r = validarComposicaoFamiliarCasal(casalValido);
    expect(r.valido).toBe(true);
    expect(r.bloqueios).toHaveLength(0);
  });

  it("produz dois anexos individuais quando os dois adultos são aplicáveis", () => {
    expect(anexosIndividuaisFamiliar(casalValido)).toHaveLength(2);
    const r = validarComposicaoFamiliarCasal(casalValido);
    expect(r.anexosAplicaveis.filter((a) => a === "ANX-INDIVIDUAL")).toHaveLength(2);
  });

  it("não torna signatário quem não é parte contratante", () => {
    const r = validarComposicaoFamiliarCasal({
      adultos: [
        adulto("requerente_principal"),
        criarAdultoFamiliar("conjuge_segunda_requerente", {
          identificado: true,
          vinculoDeclarado: "[VÍNCULO DECLARADO]",
          parteContratante: false,
          signatario: true,
        }),
      ],
    });
    expect(r.valido).toBe(false);
    expect(r.bloqueios.some((b) => b.codigo === "MF-G03")).toBe(true);
  });

  it("não cria ANX-REPRESENTACAO por padrão", () => {
    const anexo = ANEXOS_MODELO_FAMILIAR_CASAL.find((a) => a.codigo === "ANX-REPRESENTACAO");
    expect(anexo?.classe).toBe("nao_aplicavel_por_padrao");
    expect(anexo?.instanciasMaximas).toBe(0);
    expect(anexosCondicionaisAplicaveis()).not.toContain("ANX-REPRESENTACAO");
    const r = validarComposicaoFamiliarCasal(casalValido);
    expect(r.anexosAplicaveis).not.toContain("ANX-REPRESENTACAO");
  });

  it("não cria Anexos I, III, IV ou V sem seus gatilhos", () => {
    expect(anexosCondicionaisAplicaveis()).toEqual([]);
    expect(
      anexosCondicionaisAplicaveis({ propostaOsAprovada: true, escopoCompleto: true }),
    ).not.toContain("ANEXO-I");
    expect(
      anexosCondicionaisAplicaveis({ atividadeExigeProcuracao: true, paisOrgaoConfirmado: false }),
    ).not.toContain("ANEXO-IV");
  });

  it("cria os anexos condicionais quando os gatilhos formais existem", () => {
    const aplicaveis = anexosCondicionaisAplicaveis({
      propostaOsAprovada: true,
      escopoCompleto: true,
      condicaoComercialHomologada: true,
      acaoExternaAplicavel: true,
      atividadeExigeProcuracao: true,
      paisOrgaoConfirmado: true,
      alteracaoFormalPosterior: true,
    });
    expect(aplicaveis).toEqual(["ANEXO-I", "ANEXO-III", "ANEXO-IV", "ANEXO-V"]);
  });

  it("não permite preço sem SKU homologado nem parcelas/vencimentos inferidos", () => {
    const r = avaliarGeracaoContratoFamiliar({
      composicao: casalValido,
      propostaOsAprovada: true,
      escopoCompleto: true,
      condicaoComercialHomologada: true,
      precoInformado: true,
      skuHomologado: false,
      parcelasInferidas: true,
      vencimentosInferidos: true,
    });
    expect(r.valido).toBe(false);
    expect(r.bloqueios.filter((b) => b.codigo === "MF-G06").length).toBeGreaterThanOrEqual(2);
  });

  it("não permite contrato nem assinatura sem proposta/OS válida", () => {
    const contrato = avaliarGeracaoContratoFamiliar({
      composicao: casalValido,
      propostaOsAprovada: false,
      escopoCompleto: true,
      condicaoComercialHomologada: true,
    });
    expect(contrato.valido).toBe(false);
    expect(contrato.bloqueios.some((b) => b.codigo === "MF-G04")).toBe(true);

    const assinatura = podeAssinarFamiliar({
      composicao: casalValido,
      propostaOsAprovada: false,
      revisaoHumana: true,
      anexosAplicaveisPersistidos: true,
    });
    expect(assinatura.valido).toBe(false);
  });

  it("bloqueia assinatura sem revisão humana, anexos persistidos ou confirmação de pessoa", () => {
    const semRevisao = podeAssinarFamiliar({
      composicao: casalValido,
      propostaOsAprovada: true,
      escopoCompleto: true,
      condicaoComercialHomologada: true,
      revisaoHumana: false,
      anexosAplicaveisPersistidos: false,
    });
    expect(semRevisao.bloqueios.filter((b) => b.codigo === "MF-G10").length).toBe(2);

    const pendente = podeAssinarFamiliar({
      composicao: {
        adultos: [
          adulto("requerente_principal"),
          criarAdultoFamiliar("conjuge_segunda_requerente", {
            identificado: true,
            vinculoDeclarado: "[VÍNCULO DECLARADO]",
            parteContratante: true,
            signatario: true,
          }),
        ],
      },
      propostaOsAprovada: true,
      escopoCompleto: true,
      condicaoComercialHomologada: true,
      revisaoHumana: true,
      anexosAplicaveisPersistidos: true,
    });
    expect(pendente.valido).toBe(false);
    expect(pendente.bloqueios.some((b) => b.mensagem.includes("confirmação humana"))).toBe(true);
  });

  it("libera assinatura apenas com todos os gates aprovados", () => {
    const r = podeAssinarFamiliar({
      composicao: casalValido,
      propostaOsAprovada: true,
      escopoCompleto: true,
      condicaoComercialHomologada: true,
      skuHomologado: true,
      precoInformado: true,
      revisaoHumana: true,
      anexosAplicaveisPersistidos: true,
    });
    expect(r.valido).toBe(true);
  });

  it("bloqueia dependentes e representação legal por padrão", () => {
    const r = validarComposicaoFamiliarCasal({
      ...casalValido,
      dependentes: [{}],
      representacaoLegal: true,
    });
    expect(r.valido).toBe(false);
    expect(r.bloqueios.filter((b) => b.codigo === "MF-G09").length).toBe(2);
  });

  it("prévia TESTE usa apenas placeholders neutros, sem dados reais ou DEMO", () => {
    const previa = previaTesteModeloFamiliarCasal();
    const conteudos = previa.blocos
      .map((b) => b.conteudo)
      .join(" ")
      .toLowerCase();
    expect(previa.marca).toContain("PRÉVIA TESTE");
    for (const bloco of previa.blocos) {
      expect(bloco.conteudo.startsWith("[")).toBe(true);
      expect(bloco.conteudo.endsWith("]")).toBe(true);
    }
    expect(conteudos).not.toContain("ana");
    expect(conteudos).not.toContain("demo");
  });
});
