import { describe, expect, it } from "vitest";

import {
  META_CAMPO_ROTEIRO,
  PERGUNTAS_MESA,
  ROTEIRO_DISCOVERY,
  ROTULO_CAMPO_ROTEIRO,
  estadoResposta,
  indicePrimeiraPerguntaPendente,
  marcoUsavelExternamente,
  pesquisaExternaPermitida,
  progressoRoteiro,
  progressoSpin,
  sinaisQualidadeLead,
  spinDerivadoDoLead,
} from "@/lib/discovery-roteiro";
import { CATALOGOS, validarLead, type LeadDesk } from "@/lib/crm-desk";

const base: LeadDesk = { nome: "Teste" } as LeadDesk;

describe("Roteiro vivo de Discovery", () => {
  it("mantém os cinco blocos contextuais com perguntas e campos", () => {
    expect(ROTEIRO_DISCOVERY).toHaveLength(5);
    for (const b of ROTEIRO_DISCOVERY) {
      expect(b.perguntas.length).toBeGreaterThan(2);
      expect(b.campos.length).toBeGreaterThan(2);
    }
  });

  it("progressoRoteiro: lead vazio começa 0/total em todos os blocos", () => {
    const progresso = progressoRoteiro(base);
    expect(progresso).toHaveLength(5);
    for (const p of progresso) {
      expect(p.preenchidos).toBe(0);
      expect(p.completo).toBe(false);
    }
  });

  it("progressoRoteiro: conta só os campos do próprio bloco preenchidos, não os outros", () => {
    const abertura = ROTEIRO_DISCOVERY.find((b) => b.chave === "abertura")!;
    const parcial: LeadDesk = { ...base } as LeadDesk;
    for (const c of abertura.campos) (parcial as unknown as Record<string, unknown>)[c] = "preenchido";

    const progresso = progressoRoteiro(parcial);
    const bloco = progresso.find((p) => p.chave === "abertura")!;
    expect(bloco.preenchidos).toBe(abertura.campos.length);
    expect(bloco.completo).toBe(true);

    // "documentos" não compartilha nenhum campo com "abertura" — permanece 0.
    expect(progresso.find((p) => p.chave === "documentos")!.preenchidos).toBe(0);
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

// CA02-CRM-VIVO-PAINEL-CALLS (09/09/2026): "formulário sobre formulário e
// perguntas SPIN sem local evidente para resposta/destino" — cada campo do
// roteiro precisa ter card completo (por que importa, destino, consequência)
// e um controle real. Estes testes garantem que nenhuma pergunta fica órfã.
describe("card por pergunta (CA02-CRM-VIVO-PAINEL-CALLS)", () => {
  const todosOsCampos = [...new Set(ROTEIRO_DISCOVERY.flatMap((b) => b.campos))];

  it("todo campo do roteiro tem metadado de card (por que importa, destino, consequência)", () => {
    for (const c of todosOsCampos) {
      expect(META_CAMPO_ROTEIRO[c], `campo sem metadado: ${c}`).toBeDefined();
      expect(META_CAMPO_ROTEIRO[c].porQueImporta.length).toBeGreaterThan(5);
      expect(META_CAMPO_ROTEIRO[c].destino.length).toBeGreaterThan(3);
      expect(META_CAMPO_ROTEIRO[c].consequencia.length).toBeGreaterThan(5);
    }
  });

  it("todo campo do roteiro tem rótulo humano para o card", () => {
    for (const c of todosOsCampos) expect(ROTULO_CAMPO_ROTEIRO[c], `campo sem rótulo: ${c}`).toBeDefined();
  });

  it("todo campo do tipo select tem catálogo real de opções (nunca controle sem opções)", () => {
    for (const c of todosOsCampos) {
      if (META_CAMPO_ROTEIRO[c].tipo === "select") {
        expect(CATALOGOS[c]?.length, `select sem catálogo: ${c}`).toBeGreaterThan(0);
      }
    }
  });

  it("elegibilidade_preliminar (síntese da call) agora tem card — não fica fora do roteiro", () => {
    const decisao = ROTEIRO_DISCOVERY.find((b) => b.chave === "decisao")!;
    expect(decisao.campos).toContain("elegibilidade_preliminar");
  });
});

describe("estadoResposta — confirmado/informado a confirmar/hipótese/pendente", () => {
  it("sem valor e sem achado é pendente", () => {
    expect(estadoResposta({ valorSalvo: null, valorRascunho: null, emRascunho: false, marcadaComoHipotese: false })).toBe(
      "pendente",
    );
  });

  it("valor só em rascunho (digitado ou de achado aplicado) é informado — a confirmar", () => {
    expect(
      estadoResposta({ valorSalvo: null, valorRascunho: "Itália", emRascunho: true, marcadaComoHipotese: false }),
    ).toBe("informado_a_confirmar");
  });

  it("valor já gravado no lead canônico é confirmado", () => {
    expect(
      estadoResposta({ valorSalvo: "Itália", valorRascunho: null, emRascunho: false, marcadaComoHipotese: false }),
    ).toBe("confirmado");
  });

  it("marcado como hipótese nunca vira confirmado automaticamente, mesmo já salvo", () => {
    expect(
      estadoResposta({ valorSalvo: "Itália", valorRascunho: null, emRascunho: false, marcadaComoHipotese: true }),
    ).toBe("hipotese");
  });

  it("array vazio (multi-seleção) conta como não preenchido", () => {
    expect(
      estadoResposta({ valorSalvo: [], valorRascunho: null, emRascunho: false, marcadaComoHipotese: false }),
    ).toBe("pendente");
  });
});

describe("Mesa de Discovery — SPIN sai das respostas", () => {
  it("cada pergunta da Mesa aponta para campo que já existe no roteiro e tem meta", () => {
    const camposDoRoteiro = new Set(ROTEIRO_DISCOVERY.flatMap((b) => b.campos));
    expect(PERGUNTAS_MESA.length).toBeGreaterThanOrEqual(16);
    for (const p of PERGUNTAS_MESA) {
      expect(p.campos.length).toBeGreaterThan(0);
      for (const c of p.campos) {
        expect(camposDoRoteiro.has(c), c).toBe(true);
        expect(META_CAMPO_ROTEIRO[c], c).toBeDefined();
      }
    }
  });

  it("lead vazio começa com SPIN falso e primeira pergunta pendente no índice 0", () => {
    expect(spinDerivadoDoLead(base)).toEqual({
      spin_situacao: false,
      spin_problema: false,
      spin_implicacao: false,
      spin_necessidade: false,
    });
    expect(indicePrimeiraPerguntaPendente(base)).toBe(0);
    for (const e of progressoSpin(base)) {
      expect(e.preenchidas).toBe(0);
      expect(e.completo).toBe(false);
    }
  });

  it("responder um campo da etapa marca só aquela flag SPIN", () => {
    const comObjetivo = { ...base, objetivo: "cidadania" } as LeadDesk;
    expect(spinDerivadoDoLead(comObjetivo).spin_situacao).toBe(true);
    expect(spinDerivadoDoLead(comObjetivo).spin_problema).toBe(false);
    expect(indicePrimeiraPerguntaPendente(comObjetivo)).toBeGreaterThan(0);
  });
});
