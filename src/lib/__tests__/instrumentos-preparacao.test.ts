import { describe, expect, it } from "vitest";

import { avaliarPreparacaoInstrumentos, type EntradaPreparacao } from "@/lib/instrumentos-preparacao";

const TEMAS = [
  { tema_codigo: "foro", tema: "Foro", status: "aprovado", bloqueia_assinatura: true, versao_juridica_aplicavel: "v2026.1" },
  { tema_codigo: "parcelamento", tema: "Parcelamento", status: "pendente_revisao_juridica", bloqueia_assinatura: false, versao_juridica_aplicavel: null },
];

const base = (): EntradaPreparacao => ({
  proposta: { existe: true, validade_estado: "vigente", paginas_extraidas: 7, campos_nao_localizados: [] },
  cadastro: { itens_obrigatorios: 10, itens_completos: 10, pessoas_sem_referencia: [], nucleo_criterios_pendentes: [] },
  dependentes: [{ nome: "Felipe", participa_do_contrato: true, status_representacao: "documentada", anexo_individual_aplicavel: true }],
  caseService: { existe: true, status: "approved", escopo_aprovado: true, preco_fonte_homologada: true },
  condicao: { existe: true, status: "homologada", homologado_por: "u1", homologado_em: "2026-08-01", campos_faltantes: [] },
  criterios: [{ criterio_codigo: "c1", status: "aceito", obrigatorio: true }],
  matriz: [...TEMAS],
  despesas: [],
  conflitos: [],
});

describe("ANA-D-01 — preparação interna de instrumentos", () => {
  it("1. proposta inválida bloqueia", () => {
    const e = base();
    e.proposta.validade_estado = "vencida";
    const r = avaliarPreparacaoInstrumentos(e);
    expect(r.status).toBe("bloqueado");
    expect(r.codigos_bloqueio).toContain("PROPOSTA_INVALIDA");
  });

  it("2. cadastro incompleto bloqueia", () => {
    const e = base();
    e.cadastro.itens_completos = 8;
    const r = avaliarPreparacaoInstrumentos(e);
    expect(r.status).toBe("bloqueado");
    expect(r.codigos_bloqueio).toContain("CADASTRO_INCOMPLETO");
  });

  it("3. case service em draft bloqueia", () => {
    const e = base();
    e.caseService.status = "draft";
    expect(avaliarPreparacaoInstrumentos(e).codigos_bloqueio).toContain("CASE_SERVICE_NAO_CONSOLIDADO");
  });

  it("4. condição sem homologação bloqueia", () => {
    const e = base();
    e.condicao.status = "rascunho";
    e.condicao.homologado_por = null;
    expect(avaliarPreparacaoInstrumentos(e).codigos_bloqueio).toContain("CONDICAO_NAO_HOMOLOGADA");
  });

  it("5. critério de aceite pendente bloqueia", () => {
    const e = base();
    e.criterios = [{ criterio_codigo: "c1", status: "pendente", obrigatorio: true }];
    expect(avaliarPreparacaoInstrumentos(e).codigos_bloqueio).toContain("CRITERIO_PENDENTE");
  });

  it("6. tema jurídico bloqueante pendente bloqueia", () => {
    const e = base();
    e.matriz = [{ tema_codigo: "foro", tema: "Foro", status: "pendente_revisao_juridica", bloqueia_assinatura: true, versao_juridica_aplicavel: null }];
    expect(avaliarPreparacaoInstrumentos(e).codigos_bloqueio).toContain("TEMA_JURIDICO_BLOQUEANTE_PENDENTE");
  });

  it("7. dependente participante sem representação bloqueia", () => {
    const e = base();
    e.dependentes = [{ nome: "Felipe", participa_do_contrato: true, status_representacao: "pendente", anexo_individual_aplicavel: true }];
    const r = avaliarPreparacaoInstrumentos(e);
    expect(r.status).toBe("bloqueado");
    expect(r.codigos_bloqueio).toContain("DEPENDENTE_SEM_REPRESENTACAO");
  });

  it("8. tudo válido retorna pronto para prévia interna, sem criar instrumento", () => {
    const r = avaliarPreparacaoInstrumentos(base());
    expect(r.status).toBe("pronto_para_previa_interna");
    expect(r.codigos_bloqueio).toEqual([]);
    expect(r.nenhuma_acao_externa).toBe(true);
    expect(r.anexos_condicionais.map((a) => a.codigo)).toContain("ANX-REPRESENTACAO");
    expect(r.versoes_juridicas_aplicaveis).toEqual([{ tema: "Foro", versao: "v2026.1" }]);
  });
});
