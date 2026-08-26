import { describe, expect, it } from "vitest";

import {
  agruparCatalogo,
  fontesSugeridas,
  pendenciasGovernanca,
  permiteConsultaAutomatica,
  podeAvancarMaturidade,
  validarRegistroAcessoFuturo,
  vincularFonteAPesquisa,
} from "@/lib/fontes-genealogicas";

const base = {
  nome: "Arquivo Diocesano (exemplo interno)",
  pais_eixo: "AT",
  nivel_de_fonte: "primaria",
  acesso: "restrito",
  custo: "nao_avaliado",
  risco: "medio",
  prioridade: "alta",
  modo_de_uso_permitido: "manual",
  scraping_status: "proibido_por_padrao",
  status_documentacao: "completa",
  status_integracao: "uso_manual",
  estagio_maturidade: "DOCUMENTADA",
  trata_dados_pessoais: true,
  licenca_termos: "Uso interno mediante solicitação formal",
  ultima_verificacao: "2026-08-01",
  responsavel_revisao: "Equipe jurídica",
  observacao_risco: "Dados pessoais sensíveis: uso restrito ao caso.",
  archived_at: null,
};

describe("G-08 — catálogo e governança de fontes genealógicas", () => {
  it("1. fonte catalogada não permite consulta automática", () => {
    const r = permiteConsultaAutomatica({
      ...base,
      estagio_maturidade: "CATALOGADA",
      status_integracao: "sem_integracao",
    });
    expect(r.permitido).toBe(false);
    expect(r.motivo).toMatch(/catalogada não é integração/i);
  });

  it("1b. nem fonte homologada por API executa consulta neste corte", () => {
    const r = permiteConsultaAutomatica({
      ...base,
      estagio_maturidade: "HOMOLOGADA_API",
      modo_de_uso_permitido: "api_validada",
    });
    expect(r.permitido).toBe(false);
  });

  it("2. fonte com termos a confirmar não pode ser homologada nem ir a piloto", () => {
    const f = {
      ...base,
      estagio_maturidade: "TERMOS_A_CONFIRMAR",
      status_documentacao: "termos_a_confirmar",
    };
    expect(podeAvancarMaturidade(f, "HOMOLOGADA_MANUAL").ok).toBe(false);
    expect(podeAvancarMaturidade(f, "ELEGIVEL_PARA_PILOTO").ok).toBe(false);
    expect(podeAvancarMaturidade(f, "PILOTO_INTERNO").motivo).toMatch(/termos/i);
  });

  it("2b. fonte manual não equivale a API homologada", () => {
    expect(
      podeAvancarMaturidade({ ...base, modo_de_uso_permitido: "manual" }, "HOMOLOGADA_API").ok,
    ).toBe(false);
    expect(podeAvancarMaturidade({ ...base }, "HOMOLOGADA_MANUAL").ok).toBe(true);
  });

  it("3. fonte manual pode ser vinculada a item de pesquisa sem acesso externo", () => {
    const r = vincularFonteAPesquisa({ ...base, modo_de_uso_permitido: "manual" });
    expect(r.permitido).toBe(true);
    expect(r.acessoExterno).toBe(false);
    expect(r.consultaExecutada).toBe(false);
  });

  it("4. fonte restrita ou descontinuada não aparece em sugestão de pesquisa", () => {
    const lista = [
      { ...base, nome: "Manual OK" },
      { ...base, nome: "Restrita", estagio_maturidade: "RESTRITA" },
      { ...base, nome: "Descontinuada", estagio_maturidade: "DESCONTINUADA" },
      {
        ...base,
        nome: "Não validada",
        modo_de_uso_permitido: "nao_validado",
        estagio_maturidade: "CATALOGADA",
      },
    ];
    const nomes = fontesSugeridas(lista).map((f) => f.nome);
    expect(nomes).toEqual(["Manual OK"]);
    expect(vincularFonteAPesquisa({ ...base, estagio_maturidade: "RESTRITA" }).permitido).toBe(
      false,
    );
  });

  it("5. logs futuros não aceitam token, credencial ou payload bruto", () => {
    expect(validarRegistroAcessoFuturo({ resumo_interno: "Bearer eyJhbGciOi..." }).ok).toBe(false);
    expect(validarRegistroAcessoFuturo({ resumo_interno: "api_key=123" }).ok).toBe(false);
    expect(validarRegistroAcessoFuturo({ resumo_interno: "x".repeat(600) }).ok).toBe(false);
    expect(
      validarRegistroAcessoFuturo({
        resumo_interno: "Consulta presencial registrada em ata interna.",
      }).ok,
    ).toBe(true);
  });

  it("agrupamento separa termos a confirmar, bloqueadas e recomendáveis", () => {
    const g = agruparCatalogo([
      { ...base },
      {
        ...base,
        nome: "T",
        estagio_maturidade: "TERMOS_A_CONFIRMAR",
        status_documentacao: "termos_a_confirmar",
      },
      { ...base, nome: "R", estagio_maturidade: "RESTRITA" },
    ]);
    expect(g.total).toBe(3);
    expect(g.termosAConfirmar).toHaveLength(1);
    expect(g.bloqueadas).toHaveLength(1);
    expect(g.recomendaveis.map((f) => f.nome)).toEqual([base.nome]);
  });

  it("pendências de governança apontam lacunas documentais", () => {
    const p = pendenciasGovernanca({
      ...base,
      licenca_termos: null,
      ultima_verificacao: null,
      risco: "nao_avaliado",
    });
    expect(p.length).toBeGreaterThanOrEqual(3);
  });
});
