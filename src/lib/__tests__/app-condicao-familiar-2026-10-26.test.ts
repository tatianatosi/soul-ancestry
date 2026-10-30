import { describe, expect, it } from "vitest";
import { condicaoComercialCliente } from "@/lib/portal-dados-vivos";
import { TELAS_SEMPRE_DISPONIVEIS, visibilidadeTela, type TelaApp } from "@/lib/app-visibilidade";

/**
 * 30/10/2026 — `condicaoFamiliarPrevista` (hardcoded só para o ID da Ana,
 * nunca lia o banco) foi substituída por `condicaoComercialCliente`, que lê a
 * versão aprovada de `case_commercial_condition` de QUALQUER caso. Os
 * números abaixo são os mesmos da versão vigente real da Ana no banco em
 * 30/10/2026 (versao 4: fees=9600, parcelas=10, valor_parcela=320, 3
 * responsáveis financeiros) — a trava continua a mesma, a fonte mudou.
 */
describe("Condição comercial do App — lida do banco, nunca hardcoded", () => {
  const linhaAprovadaDaAna = {
    approval_status: "aprovada",
    fees: 9600,
    parcelas: 10,
    valor_parcela: 320,
    moeda: "BRL",
    responsaveis_financeiros: [
      "Ana Luiza Gomes Silveira Rodrigues",
      "Adair Pinto Silveira Júnior",
      "Alice Gomes Silveira",
    ],
  };

  it("exibe três assinaturas mensais de R$ 320 por dez meses", () => {
    expect(condicaoComercialCliente(linhaAprovadaDaAna)).toMatchObject({
      assinaturas: 3,
      mensalCentavos: 32000,
      meses: 10,
    });
  });
  it("totaliza R$ 3.200 por adulto e R$ 9.600 para a família", () => {
    expect(condicaoComercialCliente(linhaAprovadaDaAna)).toMatchObject({
      adultoCentavos: 320000,
      totalCentavos: 960000,
    });
  });
  it("sem versão aprovada (substituída, ausente ou arquivada), nunca mostra número antigo", () => {
    expect(
      condicaoComercialCliente({ ...linhaAprovadaDaAna, approval_status: "substituida" }),
    ).toBeNull();
    expect(condicaoComercialCliente(null)).toBeNull();
    expect(condicaoComercialCliente(undefined)).toBeNull();
  });
  it("sem campo numérico completo (parcelas, valor ou responsáveis zerados), fica vazio honesto", () => {
    expect(condicaoComercialCliente({ ...linhaAprovadaDaAna, parcelas: 0 })).toBeNull();
    expect(condicaoComercialCliente({ ...linhaAprovadaDaAna, valor_parcela: 0 })).toBeNull();
    expect(
      condicaoComercialCliente({ ...linhaAprovadaDaAna, responsaveis_financeiros: [] }),
    ).toBeNull();
  });
});

describe("Sete abas completas sem entregas", () => {
  const abas: TelaApp[] = ["home", "jornada", "radar", "arvore", "docs", "biblio", "conta"];
  const escopo = {
    temAcesso: true,
    entregasLiberadas: 0,
    fase1Contratada: false,
    fase1Status: "nao_prevista" as const,
    escopoIncluiFase2: false,
    fase2Status: "nao_aplicavel" as const,
  };
  it.each(abas)("mantém %s disponível sem entregas", (aba) => {
    expect(TELAS_SEMPRE_DISPONIVEIS).toContain(aba);
    expect(visibilidadeTela(aba, escopo).estado).toBe("always_available");
  });
  it("preserva a proteção de acesso", () => {
    expect(visibilidadeTela("home", { ...escopo, temAcesso: false }).estado).toBe(
      "hidden_by_permission",
    );
  });
});
