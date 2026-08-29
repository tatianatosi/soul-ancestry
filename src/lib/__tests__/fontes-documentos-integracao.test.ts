import { describe, expect, it } from "vitest";

import {
  alvoUnico,
  CAMPOS_PROIBIDOS_NO_VINCULO,
  COLUNA_ALVO,
  EFEITOS_EM_CADEIA_PROIBIDOS,
  payloadLimpo,
  podeExcluirVinculoFisicamente,
  rascunhoEvidenciaDeDocumento,
  validarDesvinculo,
  validarVinculo,
  vinculoVisivelNoAppCliente,
  type EntradaVinculo,
} from "@/lib/fontes-documentos-integracao";

const ORG = "org-1";
const CASO = "caso-ana";

function entrada(over: Partial<EntradaVinculo> = {}): EntradaVinculo {
  return {
    tipoVinculo: "comprova",
    tipoAlvo: "evidencia",
    alvoId: "ev-1",
    documentoCaseId: CASO,
    documentoOrganizationId: ORG,
    alvoCaseId: CASO,
    alvoOrganizationId: ORG,
    papel: "pesquisador",
    ...over,
  };
}

const DOC = {
  id: "doc-1",
  case_id: CASO,
  organization_id: ORG,
  titulo_interno: "Certidão de nascimento — Alice",
  nome_arquivo: "alice.pdf",
  tipo_documento: "certidao_nascimento",
  data_documento: "1932-04-10",
  cidade: "Graz",
  estado_provincia: "Estíria",
  pais: "Áustria",
  pessoa_ref_id: "pessoa-alice",
  confidencialidade: "equipe_do_caso",
};

describe("G-08B — vínculos entre fontes e o resto da pesquisa", () => {
  it("1. exige exatamente um alvo por vínculo", () => {
    expect(alvoUnico({ [COLUNA_ALVO.evidencia]: "ev-1" })).toBe(true);
    expect(alvoUnico({ [COLUNA_ALVO.evidencia]: "ev-1", [COLUNA_ALVO.pessoa]: "p-1" })).toBe(false);
    expect(alvoUnico({})).toBe(false);
    expect(validarVinculo(entrada({ alvoId: "" })).ok).toBe(false);
  });

  it("2. recusa alvo de outro caso ou de outra organização", () => {
    const outroCaso = validarVinculo(entrada({ alvoCaseId: "caso-outro" }));
    expect(outroCaso.ok).toBe(false);
    expect(outroCaso.ok === false && outroCaso.erros).toContain("ALVO_DE_OUTRO_CASO");

    const outraOrg = validarVinculo(entrada({ alvoOrganizationId: "org-2" }));
    expect(outraOrg.ok === false && outraOrg.erros).toContain("ALVO_DE_OUTRA_ORGANIZACAO");

    // Pessoa da pesquisa é da organização, não do caso.
    expect(
      validarVinculo(
        entrada({ tipoAlvo: "pessoa", tipoVinculo: "refere_pessoa", alvoCaseId: null }),
      ).ok,
    ).toBe(true);
  });

  it("3. evidência criada a partir do documento nasce em rascunho e confiança mínima", () => {
    const r = rascunhoEvidenciaDeDocumento(DOC);
    expect(r.workflow_status).toBe("rascunho");
    expect(r.confidence_level).toBe("indicio");
    expect(r.epistemic_validation_status).toBe("nao_validado");
    expect(r.legal_review_status).toBe("nao_revisado");
    expect(r.reference_location).toBe("Graz, Estíria, Áustria");
    expect(r.title_internal).toBe("Certidão de nascimento — Alice");
  });

  it("4. vincular não cria pessoa, relação, evento, linhagem, achado nem relatório", () => {
    const campos = Object.keys(rascunhoEvidenciaDeDocumento(DOC));
    for (const proibida of EFEITOS_EM_CADEIA_PROIBIDOS) {
      expect(campos.some((c) => c.includes(proibida))).toBe(false);
    }
    expect(EFEITOS_EM_CADEIA_PROIBIDOS).toContain("genealogical_person_profiles");
    expect(EFEITOS_EM_CADEIA_PROIBIDOS).toContain("genealogical_findings");
    expect(EFEITOS_EM_CADEIA_PROIBIDOS).toContain("case_reports");
  });

  it("5. desvínculo nunca exige motivo (fricção removida) e exclusão física é negada", () => {
    expect(validarDesvinculo("", "admin").ok).toBe(true);
    expect(validarDesvinculo("dup", "admin").ok).toBe(true);
    expect(validarDesvinculo("documento anexado por engano", "admin").ok).toBe(true);
    expect(podeExcluirVinculoFisicamente()).toBe(false);
  });

  it("6. papel leitura não vincula nem desvincula", () => {
    const v = validarVinculo(entrada({ papel: "leitura" }));
    expect(v.ok === false && v.erros).toContain("PAPEL_SEM_ESCRITA");
    const d = validarDesvinculo("motivo suficiente", "leitura");
    expect(d.ok === false && d.erros).toContain("PAPEL_SEM_ESCRITA");
  });

  it("7. vínculo nunca aparece no App Cliente", () => {
    expect(vinculoVisivelNoAppCliente()).toBe(false);
    expect(EFEITOS_EM_CADEIA_PROIBIDOS).toContain("app_projections");
    expect(EFEITOS_EM_CADEIA_PROIBIDOS).toContain("client_deliverables");
  });

  it("8. payload do vínculo não carrega mérito, CPF, preço ou condição comercial", () => {
    expect(payloadLimpo({ tipo_vinculo: "comprova", observacao_interna: "ok" }).ok).toBe(true);
    const sujo = payloadLimpo({
      tipo_vinculo: "comprova",
      cpf: "000",
      preco: 10,
      chance_de_exito: "alta",
    });
    expect(sujo.ok).toBe(false);
    for (const c of ["cpf", "preco", "chance"]) expect(CAMPOS_PROIBIDOS_NO_VINCULO).toContain(c);
  });

  it("9. tipo de vínculo precisa corresponder ao tipo de alvo", () => {
    const errado = validarVinculo(
      entrada({ tipoAlvo: "solicitacao", tipoVinculo: "comprova", alvoCaseId: CASO }),
    );
    expect(errado.ok === false && errado.erros).toContain("TIPO_VINCULO_NAO_CORRESPONDE_AO_ALVO");
    expect(
      validarVinculo(entrada({ tipoAlvo: "solicitacao", tipoVinculo: "atende_solicitacao" })).ok,
    ).toBe(true);
    expect(validarVinculo(entrada({ tipoVinculo: "inventado" })).ok).toBe(false);
  });
});
