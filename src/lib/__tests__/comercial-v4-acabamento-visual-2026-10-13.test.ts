import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Feedback de homologação visual (Proprietária, 13/10/2026): menos réguas/
 * divisórias, mais respiro (gap-6/p-6), e paleta enriquecida com os tons
 * semânticos já previstos no design system (sucesso/atencao/critico do
 * kit.tsx e navy/gold/terracotta para canais) — nunca classes de cor cruas
 * fora do sistema (sem rose-50/amber-50/emerald-50/slate-200 etc.) e nunca
 * hex literal.
 */
const rota = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");

describe("Comercial — respiro (menos réguas, mais padding/gap)", () => {
  it("os cartões V4 usam padding generoso único (p-6) e gap-6 de margem, não mais p-5 sm:p-6", () => {
    expect(rota).not.toContain("rounded-2xl p-5 sm:p-6");
    const ocorrencias = rota.match(/rounded-2xl p-6/g) ?? [];
    expect(ocorrencias.length).toBeGreaterThanOrEqual(5);
  });

  it("a lista de Leads ativos não corta mais cada linha com border-b — respiro por espaçamento (space-y)", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-ativos-tabela"), rota.indexOf("</CaCard>", rota.indexOf("data-leads-ativos-tabela")));
    expect(trecho).not.toContain("border-b border-navy/5");
    expect(trecho).toContain("space-y-4");
  });
});

describe("Comercial — paleta semântica enriquecida, sem cor fora do design system", () => {
  it("canais usam os 3 tons de marca já existentes (navy/gold/terracotta), nunca uma classe de cor crua nova", () => {
    expect(rota).toContain("const TONS_CANAL: readonly (\"navy\" | \"gold\" | \"terracotta\")[]");
    expect(rota).not.toMatch(/rose-|amber-|emerald-|slate-\d/);
    expect(rota).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });

  it("badge de canal em Leads ativos usa o tom real do canal do lead, não um texto plano", () => {
    const trecho = rota.slice(rota.indexOf("data-leads-ativos-tabela"), rota.indexOf("</CaCard>", rota.indexOf("data-leads-ativos-tabela")));
    expect(trecho).toContain("CLASSE_BADGE_CANAL[tomDoCanal(l.origem)]");
  });

  it("barras de Saúde comercial & canais recebem tom por canal (BarrasHorizontais aceita navy/gold/terracotta)", () => {
    const trecho = rota.slice(rota.indexOf("const distribuicaoCanais"), rota.indexOf("const leadsAtivosTabela"));
    expect(trecho).toContain("tom: tomDoCanal(o.valor)");
  });

  it("estados de proposta e estagnação continuam usando sucesso/atencao/critico/neutro — tokens já existentes, não rose/amber/emerald do Tailwind cru", () => {
    expect(rota).toContain('aprovada: "sucesso"');
    expect(rota).toContain('"critico"');
  });
});
