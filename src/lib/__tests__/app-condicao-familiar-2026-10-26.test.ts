import { describe, expect, it } from "vitest";
import { condicaoFamiliarPrevista } from "@/components/portal/condicao-familiar";
import { TELAS_SEMPRE_DISPONIVEIS, visibilidadeTela, type TelaApp } from "@/lib/app-visibilidade";

describe("Condição prevista autorizada da Ana", () => {
  it("exibe três assinaturas mensais de R$ 320 por dez meses", () => {
    expect(condicaoFamiliarPrevista("CA-CID-AT-FAM-2026-001")).toMatchObject({ assinaturas: 3, mensalCentavos: 32000, meses: 10 });
  });
  it("totaliza R$ 3.200 por adulto e R$ 9.600 para a família", () => {
    expect(condicaoFamiliarPrevista("a11a0000-0000-4000-8000-000000000002")).toMatchObject({ adultoCentavos: 320000, totalCentavos: 960000 });
  });
  it("não transfere a condição a outro caso ou caso ausente", () => {
    expect(condicaoFamiliarPrevista("outro-caso")).toBeNull();
    expect(condicaoFamiliarPrevista(null)).toBeNull();
  });
});

describe("Sete abas completas sem entregas", () => {
  const abas: TelaApp[] = ["home", "jornada", "radar", "arvore", "docs", "biblio", "conta"];
  const escopo = { temAcesso: true, entregasLiberadas: 0, fase1Contratada: false, fase1Status: "nao_prevista" as const, escopoIncluiFase2: false, fase2Status: "nao_aplicavel" as const };
  it.each(abas)("mantém %s disponível sem entregas", (aba) => {
    expect(TELAS_SEMPRE_DISPONIVEIS).toContain(aba);
    expect(visibilidadeTela(aba, escopo).estado).toBe("always_available");
  });
  it("preserva a proteção de acesso", () => {
    expect(visibilidadeTela("home", { ...escopo, temAcesso: false }).estado).toBe("hidden_by_permission");
  });
});