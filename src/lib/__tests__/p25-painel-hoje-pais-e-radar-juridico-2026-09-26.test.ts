import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const pagina = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");

// P25 (26/09/2026) — pedido explícito da Proprietária: "Casos ativos por
// fase, país, responsável e saúde" e "Radar de marcos jurídicos e casos
// impactados" no Painel Hoje/CRM Vivo.
//
// SUPERSEDIDO em 17/10/2026 — decisão canônica da Proprietária: `/painel`
// vira exclusivamente a grade da Prancha V4 ("corte radical", mockup
// desk-01-hoje), sem bloco abaixo do donut "Distribuição das prioridades".
// "Casos por país e via" e "Radar de marcos jurídicos" não têm equivalente
// nessa grade e saíram da RENDERIZAÇÃO desta rota — nada foi deletado:
// `casosPorPaisVia` (golive-operacao.ts) e `radarMarcosJuridicosDoPainel`
// (radar-marcos-juridicos.functions.ts) continuam existindo, testadas no
// próprio nível de unidade, só não são mais chamadas por `painel.tsx`.
describe("P25 — Painel Hoje ganha país/via e radar de marcos jurídicos (supersedido 17/10/2026)", () => {
  it("país/via e radar jurídico saíram da grade V4 de /painel — não renderizam mais aqui", () => {
    expect(pagina).not.toContain("casosPorPaisVia(caso.carteira)");
    expect(pagina).not.toContain("Casos por país e via");
    expect(pagina).not.toContain("radarMarcosJuridicosDoPainel");
    expect(pagina).not.toContain("Radar de marcos jurídicos");
  });

  it("a página termina no donut de prioridades — corte radical, nada pendurado abaixo", () => {
    const fimDonut = pagina.lastIndexOf("Distribuição das prioridades");
    expect(fimDonut).toBeGreaterThan(-1);
    const resto = pagina.slice(fimDonut);
    expect(resto).not.toContain("<CaCard");
  });
});
