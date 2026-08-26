import { describe, expect, it } from "vitest";

import {
  ROTEIRO_DISCOVERY,
  marcoUsavelExternamente,
  pesquisaExternaPermitida,
  sinaisQualidadeLead,
} from "@/lib/discovery-roteiro";
import { validarLead, type LeadDesk } from "@/lib/crm-desk";

const base: LeadDesk = { nome: "Teste" } as LeadDesk;

describe("Roteiro vivo de Discovery", () => {
  it("mantém os cinco blocos contextuais com perguntas e campos", () => {
    expect(ROTEIRO_DISCOVERY).toHaveLength(5);
    for (const b of ROTEIRO_DISCOVERY) {
      expect(b.perguntas.length).toBeGreaterThan(2);
      expect(b.campos.length).toBeGreaterThan(2);
    }
  });

  it("bloqueia gravação sem consentimento concedido", () => {
    const erros = validarLead({ ...base, gravacao_link_interno: "ref-01" });
    expect(erros.some((e) => e.campo === "gravacao_link_interno")).toBe(true);
  });

  it("exige data, canal e versão do aviso quando o consentimento é concedido", () => {
    const erros = validarLead({ ...base, consentimento_status: "concedido" });
    expect(erros.map((e) => e.campo)).toEqual(
      expect.arrayContaining([
        "consentimento_em",
        "consentimento_canal",
        "consentimento_versao_aviso",
      ]),
    );
  });

  it("não deixa escopo de pesquisa prévia sem autorização registrada", () => {
    const erros = validarLead({ ...base, pesquisa_previa_escopo: ["triagem_publica"] });
    expect(erros.some((e) => e.campo === "pesquisa_previa_escopo")).toBe(true);
    expect(pesquisaExternaPermitida(base)).toBe(false);
    expect(pesquisaExternaPermitida({ ...base, pesquisa_previa_autorizacao: "registrada" })).toBe(
      true,
    );
  });

  it("marco a revisar nunca sustenta comunicação externa", () => {
    expect(marcoUsavelExternamente("a_revisar")).toBe(false);
    expect(marcoUsavelExternamente("vigente")).toBe(true);
    const s = sinaisQualidadeLead(base, { status_marco: "desatualizado" });
    expect(s.some((x) => x.chave === "marco_a_revisar")).toBe(true);
  });

  it("sinaliza triagem forte incompleta sem concluir elegibilidade", () => {
    const s = sinaisQualidadeLead({ ...base, elegibilidade_preliminar: "forte" });
    const sinal = s.find((x) => x.chave === "triagem_incompleta");
    expect(sinal?.motivo).toContain("preliminar");
  });
});
