import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const pagina = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

// P25 (26/09/2026) — pedido explícito da Proprietária: "Casos ativos por
// fase, país, responsável e saúde" e "Radar de marcos jurídicos e casos
// impactados" no Painel Hoje/CRM Vivo.
describe("P25 — Painel Hoje ganha país/via e radar de marcos jurídicos", () => {
  it("usa casosPorPaisVia sobre a mesma carteira ativa já carregada (nenhuma query nova para país/via)", () => {
    expect(pagina).toContain("casosPorPaisVia(caso.carteira)");
    expect(pagina).toContain("Casos por país e via");
  });

  it("radar de marcos jurídicos usa consulta própria (dado que useGoLive não carrega marcos)", () => {
    expect(pagina).toContain("radarMarcosJuridicosDoPainel");
    expect(pagina).toContain("Radar de marcos jurídicos");
    expect(pagina).toContain("caso(s) afetado(s)");
  });

  it("nunca fabrica impacto: exibe a contagem real, inclusive quando é 0", () => {
    // O componente lê r.casosAfetados diretamente do servidor — não filtra
    // nem esconde marcos com 0 casos afetados.
    const inicioRadar = pagina.indexOf('titulo="Radar de marcos jurídicos"');
    const fimRadar = pagina.indexOf("</CaCard>", inicioRadar);
    const bloco = pagina.slice(inicioRadar, fimRadar);
    expect(bloco).toContain("r.casosAfetados");
    expect(bloco).not.toContain(".filter((r) => r.casosAfetados > 0)");
  });
});
