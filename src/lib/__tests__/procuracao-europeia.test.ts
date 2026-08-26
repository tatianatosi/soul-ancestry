import { describe, expect, it } from "vitest";

import { anexoIVProcuracao, atividadeExternaComProcuracaoLiberada } from "@/lib/anexos-i-v";
import {
  AVISO_PREPARO_PROCURACAO,
  bloqueiosProcuracaoEuropeia,
  camposPendentesAposPais,
  CAMPOS_NUNCA_AUTOMATICOS,
  resolverContextoEuropeu,
  TITULO_PROCURACAO_BRASIL,
} from "@/lib/procuracao-europeia";

const baseEntrada = {
  caseId: "CA-TESTE-0001",
  clienteNome: null,
  responsavel: null,
  dataContratacao: null,
  contratoBaseVersao: "v1.0",
  modelo: "MODELO-ESTUDO",
  proposta: null,
  politicaDespesas: null,
  despesas: [],
  autorizacaoPesquisa: null,
  procuracao: null,
  alteracaoEscopo: null,
};

const ctxDe = (pais: string | null, fonte: "proposta" | "planejador" | "caso" = "proposta") =>
  resolverContextoEuropeu({
    propostaAprovadaVinculada: fonte === "proposta" ? { pais } : null,
    planejadorHomologado: fonte === "planejador" ? { pais } : null,
    casoConfirmado: fonte === "caso" ? { pais } : null,
  });

describe("procuração europeia parametrizada", () => {
  it("renderiza título da Áustria", () => {
    expect(ctxDe("Áustria").title).toBe("Procuração para atuação na Áustria");
  });

  it("renderiza título da Itália somente quando o país é Itália", () => {
    expect(ctxDe("Itália").title).toBe("Procuração para atuação na Itália");
  });

  it("renderiza título de Portugal com a preposição correta", () => {
    expect(ctxDe("Portugal").title).toBe("Procuração para atuação em Portugal");
  });

  it("mantém título genérico quando não há país declarado", () => {
    const c = resolverContextoEuropeu({});
    expect(c.title).toBe("Procuração europeia — país e órgão a confirmar");
    expect(c.country).toBe("A confirmar");
    expect(c.state).toBe("a_confirmar");
    expect(c.source).toBe("pendente");
  });

  it("não escolhe país por fallback em nenhuma hipótese", () => {
    for (const entrada of [
      {},
      { propostaAprovadaVinculada: { pais: "" } },
      { casoConfirmado: { pais: "Suíça" } },
    ]) {
      const c = resolverContextoEuropeu(entrada);
      expect(c.country).toBe("A confirmar");
      expect(c.title).not.toMatch(/Itália|Brasil/);
    }
  });

  it("respeita a precedência proposta > SKU > planejador > caso", () => {
    const c = resolverContextoEuropeu({
      propostaAprovadaVinculada: { pais: "Áustria" },
      produtoSkuHomologado: { pais: "Áustria" },
      planejadorHomologado: { pais: "Áustria" },
      casoConfirmado: { pais: "Áustria" },
    });
    expect(c.source).toBe("proposta_os_aprovada");
    expect(c.state).toBe("confirmado");
  });

  it("conflito entre Planejador e proposta bloqueia o Anexo IV", () => {
    const c = resolverContextoEuropeu({
      propostaAprovadaVinculada: { pais: "Áustria" },
      planejadorHomologado: { pais: "Itália" },
    });
    expect(c.state).toBe("conflito");
    expect(c.country).toBe("A confirmar");
    const b = bloqueiosProcuracaoEuropeia(c);
    expect(b.bloqueado).toBe(true);
    expect(b.gates).toContain("uso_anexo_iv");
    expect(b.gates).toContain("assinatura");

    const anexo = anexoIVProcuracao({
      ...baseEntrada,
      procuracao: {
        exigidaPorOrgao: true,
        tipo: "europa",
        finalidade: "x",
        orgaoDestinatario: "y",
        pessoas: ["a"],
        poderes: ["p"],
        status: "rascunho",
        revisaoJuridicaAprovada: true,
        contextoEuropeu: c,
      },
    });
    expect(anexo.pendencias.join(" ")).toMatch(/Conflito de país/);
    expect(anexo.gatesBloqueados).toContain("assinatura");
  });

  it("país a confirmar mantém a procuração não iniciada e sem instrumento", () => {
    const c = resolverContextoEuropeu({});
    expect(bloqueiosProcuracaoEuropeia(c).bloqueado).toBe(true);
    expect(
      atividadeExternaComProcuracaoLiberada({
        exigidaPorOrgao: true,
        tipo: "europa",
        finalidade: "x",
        orgaoDestinatario: "y",
        pessoas: ["a"],
        poderes: ["p"],
        status: "assinada",
        revisaoJuridicaAprovada: true,
        evidenciaAssinatura: "doc",
        contextoEuropeu: c,
      }),
    ).toBe(false);
  });

  it("país confirmado não preenche finalidade, órgão, poderes, idioma nem requisito formal", () => {
    const c = ctxDe("Áustria");
    expect(c.state).toBe("confirmado");
    expect(camposPendentesAposPais({})).toEqual([...CAMPOS_NUNCA_AUTOMATICOS]);
    const anexo = anexoIVProcuracao({
      ...baseEntrada,
      procuracao: {
        exigidaPorOrgao: true,
        tipo: "europa",
        finalidade: null,
        orgaoDestinatario: null,
        pessoas: [],
        poderes: [],
        status: "nao_iniciada",
        revisaoJuridicaAprovada: false,
        contextoEuropeu: c,
      },
    });
    const rotulos = anexo.campos.map((x) => x.rotulo);
    expect(rotulos).toContain("Idioma");
    expect(anexo.campos.find((x) => x.rotulo === "Título aplicável")?.valor).toBe(
      "Procuração para atuação na Áustria",
    );
    expect(anexo.campos.find((x) => x.rotulo === "Finalidade")?.valor).toBeNull();
    expect(anexo.campos.find((x) => x.rotulo === "Poderes necessários")?.valor).toBeNull();
    expect(anexo.campos.some((x) => x.valor === AVISO_PREPARO_PROCURACAO)).toBe(true);
  });

  it("Anexo III não substitui Anexo IV e vice-versa", () => {
    const anexo = anexoIVProcuracao({
      ...baseEntrada,
      procuracao: {
        exigidaPorOrgao: true,
        tipo: "europa",
        finalidade: null,
        orgaoDestinatario: null,
        pessoas: [],
        poderes: [],
        status: "nao_iniciada",
        revisaoJuridicaAprovada: false,
        contextoEuropeu: ctxDe("Itália"),
      },
    });
    expect(anexo.impactoAusencia).toMatch(/não substitui a autorização de pesquisa \(Anexo III\)/);
  });

  it("procuração de atuação no Brasil mantém rótulo próprio e não vira europeia", () => {
    expect(TITULO_PROCURACAO_BRASIL).toBe("Procuração para atuação no Brasil");
    expect(TITULO_PROCURACAO_BRASIL).not.toMatch(/europ/i);
  });

  it("nenhuma procuração, assinatura, envio ou pesquisa é criada pelo resolvedor", () => {
    const c = ctxDe("Portugal");
    expect(Object.keys(c).sort()).toEqual(
      [
        "conflito",
        "country",
        "country_label",
        "jurisdiction_scope",
        "motivos",
        "source",
        "source_label",
        "state",
        "title",
        "version",
      ].sort(),
    );
  });
});
