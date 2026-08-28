import { describe, expect, it } from "vitest";
import { derivarJornada, VALORES_SEM_INFORMACAO } from "@/lib/derivacao-jornada";
import type { LeadDesk } from "@/lib/crm-desk";

const base = {
  eixo_formalizacao: "nao_iniciado",
  responsavel_nome: "Equipe TESTE",
  proxima_acao: "agendar_call",
  proxima_acao_em: "2026-08-23",
} as unknown as LeadDesk;

const massaCompleta = {
  ...base,
  eixo_comercial: "discovery_realizada",
  resumo_validado: true,
  pais_linha_prioritaria: "italia",
  nacionalidades_interesse: ["italiana"],
  estrutura_familiar: "nucleo_familiar",
  geracao_ascendente: "bisavo",
  linha_transmissao: "paterna",
  estado_documental_inicial: "chave_disponiveis",
  complexidade_documental: "media",
  risco_ruptura: "nenhum",
  objetivo: "cidadania",
  via_juridica_preliminar: "descendencia",
  status_via: "triagem_preliminar",
  pesquisa_previa_autorizacao: "registrada",
  servico_inicial_aprovado: "estudo_genealogico",
} as unknown as LeadDesk;

const massaIncompleta = {
  ...base,
  eixo_comercial: "triagem",
  resumo_validado: false,
  pais_linha_prioritaria: "a_definir",
  nacionalidades_interesse: [],
  estrutura_familiar: "a_definir",
  geracao_ascendente: "nao_identificado",
  linha_transmissao: "nao_confirmada",
  estado_documental_inicial: "sem_dados",
  complexidade_documental: null,
  risco_ruptura: "em_investigacao",
  objetivo: "objetivo_a_definir",
  via_juridica_preliminar: "via_a_confirmar",
  status_via: "em_confirmacao_juridica",
  pesquisa_previa_autorizacao: "pendente",
  servico_inicial_aprovado: null,
} as unknown as LeadDesk;

describe("derivação — massa TESTE completa e incompleta", () => {
  it("massa completa organiza a jornada sem pendência de entrada", () => {
    const r = derivarJornada(massaCompleta);
    expect(r.checklist_inicial.filter((i) => i.estado === "pendente")).toHaveLength(0);
    expect(r.fase).toBe("proposta_e_escopo");
    expect(r.proxima_acao_datada.estado).toBe("definida");
    expect(r.dependencias_cliente).toHaveLength(0);
  });

  it("massa incompleta permanece em triagem e não avança de fase", () => {
    const r = derivarJornada(massaIncompleta);
    expect(r.fase).toBe("triagem_inicial");
    expect(r.checklist_inicial.every((i) => i.estado === "pendente")).toBe(true);
    expect(r.dependencias_cliente.length).toBeGreaterThan(0);
    expect(r.pendencias_internas).toContain(
      "Registrar autorização de pesquisa antes de qualquer ação externa.",
    );
  });

  it("valores de catálogo que registram ausência não contam como entrada preenchida", () => {
    for (const sentinela of ["a_definir", "nao_identificado", "sem_dados", "via_a_confirmar"]) {
      expect(VALORES_SEM_INFORMACAO.has(sentinela)).toBe(true);
      const r = derivarJornada({ ...massaCompleta, objetivo: sentinela } as unknown as LeadDesk);
      expect(r.checklist_inicial.find((i) => i.chave === "objetivo")?.estado).toBe("pendente");
    }
  });

  it("bloqueios estruturais permanecem ativos nas duas massas", () => {
    for (const lead of [massaCompleta, massaIncompleta]) {
      const ativos = derivarJornada(lead)
        .bloqueios.filter((b) => b.ativo)
        .map((b) => b.codigo);
      expect(ativos).toEqual(expect.arrayContaining(["B1", "B2", "B3", "B4", "B6"]));
    }
  });
});
