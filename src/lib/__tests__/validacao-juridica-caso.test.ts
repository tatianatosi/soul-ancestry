import { describe, expect, it } from "vitest";
import { avaliarValidacaoJuridicaCaso } from "@/lib/validacao-juridica-caso";

const TEMA_OK = {
  tema_codigo: "natureza_servico",
  tema: "Natureza intelectual/técnica do serviço",
  status: "aprovado",
  bloqueia_assinatura: true,
  versao_juridica_aplicavel: "v2026.1",
};

describe("avaliarValidacaoJuridicaCaso — CA08-JURIDICO-PROPORCIONAL", () => {
  it("sem rota aplicável mas com tema contratual pendente: ainda reporta pendência (nunca 'sem dados' quando há bloqueio real)", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: null,
      marcos: [],
      regras: [],
      temasMatriz: [{ ...TEMA_OK, status: "pendente_revisao_juridica", versao_juridica_aplicavel: null }],
      dependentes: [],
    });
    expect(r.semRotaAplicavel).toBe(true);
    expect(r.rota).toBeNull();
    expect(r.pendencias).toHaveLength(1);
    expect(r.pendencias[0]?.atoAfetado).toBe("assinatura");
    expect(r.atosAfetados).toEqual(["assinatura"]);
  });

  it("tudo em dia: rota vigente, marco vigente, regra aprovada, tema aprovado com versão — zero pendências", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: {
        trackId: "t1",
        pais: "Itália",
        nacionalidade: "italiana",
        viaPreliminar: "jure_sanguinis",
        statusVia: "confirmada",
        trackName: "Itália — jure sanguinis",
        lifecycleStatus: "vigente",
        revisaoHumanaJuridica: "obrigatoria",
      },
      marcos: [
        { id: "m1", track_id: "t1", label: "Lei 91/1992", reference_type: "lei", status: "vigente", review_required: "obrigatoria", lifecycle_status: "vigente" },
      ],
      regras: [{ id: "r1", track_id: "t1", tema: "Elegibilidade por linha materna", status: "aprovado", fonte_referencia: "STF" }],
      temasMatriz: [TEMA_OK],
      dependentes: [],
    });
    expect(r.semRotaAplicavel).toBe(false);
    expect(r.rota?.pais).toBe("Itália");
    expect(r.pendencias).toHaveLength(0);
    expect(r.atosAfetados).toEqual([]);
  });

  it("marco a_revisar com review_required obrigatória gera pendência de protocolo ou publicação conforme o tipo de referência", () => {
    const base = { track: { trackId: "t1", pais: "Itália", nacionalidade: null, viaPreliminar: null, statusVia: null, trackName: null, lifecycleStatus: "vigente", revisaoHumanaJuridica: null }, regras: [], temasMatriz: [], dependentes: [] };
    const rProcedimento = avaliarValidacaoJuridicaCaso({
      ...base,
      marcos: [{ id: "m1", track_id: "t1", label: "Procedimento consular", reference_type: "procedimento", status: "a_revisar", review_required: "obrigatoria", lifecycle_status: "em_revisao" }],
    });
    expect(rProcedimento.pendencias[0]?.atoAfetado).toBe("protocolo");

    const rLei = avaliarValidacaoJuridicaCaso({
      ...base,
      marcos: [{ id: "m2", track_id: "t1", label: "Lei X", reference_type: "lei", status: "desatualizado", review_required: "obrigatoria", lifecycle_status: "em_revisao" }],
    });
    expect(rLei.pendencias[0]?.atoAfetado).toBe("publicacao_juridica");
  });

  it("marco com review_required 'dispensa_homologada' nunca vira pendência", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: { trackId: "t1", pais: "Itália", nacionalidade: null, viaPreliminar: null, statusVia: null, trackName: null, lifecycleStatus: "vigente", revisaoHumanaJuridica: null },
      marcos: [{ id: "m1", track_id: "t1", label: "Marco dispensado", reference_type: "lei", status: "a_revisar", review_required: "dispensa_homologada", lifecycle_status: "em_revisao" }],
      regras: [],
      temasMatriz: [],
      dependentes: [],
    });
    expect(r.pendencias).toHaveLength(0);
  });

  it("regra não aprovada afeta publicação jurídica (protege o mesmo gate que marcoJuridicoProjetavel já exige)", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: { trackId: "t1", pais: "Itália", nacionalidade: null, viaPreliminar: null, statusVia: null, trackName: null, lifecycleStatus: "vigente", revisaoHumanaJuridica: null },
      marcos: [],
      regras: [{ id: "r1", track_id: "t1", tema: "Elegibilidade", status: "em_revisao", fonte_referencia: null }],
      temasMatriz: [],
      dependentes: [],
    });
    expect(r.pendencias[0]?.atoAfetado).toBe("publicacao_juridica");
    expect(r.pendencias[0]?.origem).toBe("regra");
  });

  it("dependente participante sem representação documentada afeta acesso sensível de menor, nunca a assinatura em si", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: null,
      marcos: [],
      regras: [],
      temasMatriz: [],
      dependentes: [{ nome: "Criança X", participa_do_contrato: true, status_representacao: "pendente" }],
    });
    expect(r.pendencias).toHaveLength(1);
    expect(r.pendencias[0]?.origem).toBe("representacao_menor");
    expect(r.pendencias[0]?.atoAfetado).toBe("acesso_sensivel_menor");
  });

  it("dependente que não participa do contrato nunca gera pendência", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: null,
      marcos: [],
      regras: [],
      temasMatriz: [],
      dependentes: [{ nome: "Criança Y", participa_do_contrato: false, status_representacao: null }],
    });
    expect(r.pendencias).toHaveLength(0);
  });

  it("tema não aplicável nunca vira pendência mesmo sem versão jurídica", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: null,
      marcos: [],
      regras: [],
      temasMatriz: [{ ...TEMA_OK, status: "nao_aplicavel", versao_juridica_aplicavel: null }],
      dependentes: [],
    });
    expect(r.pendencias).toHaveLength(0);
  });

  it("atosAfetados nunca repete o mesmo ato duas vezes mesmo com várias pendências do mesmo tipo", () => {
    const r = avaliarValidacaoJuridicaCaso({
      track: null,
      marcos: [],
      regras: [],
      temasMatriz: [
        { ...TEMA_OK, tema_codigo: "a", status: "pendente_revisao_juridica", versao_juridica_aplicavel: null },
        { ...TEMA_OK, tema_codigo: "b", status: "pendente_revisao_juridica", versao_juridica_aplicavel: null },
      ],
      dependentes: [],
    });
    expect(r.pendencias).toHaveLength(2);
    expect(r.atosAfetados).toEqual(["assinatura"]);
  });
});
