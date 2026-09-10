import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DETALHE_INDICADOR } from "@/lib/indicadores-governanca";

/*
 * CA22-GOVERNANCA-E-INDICADORES-UNICOS (09/09/2026) — auditoria dos conceitos
 * citados no objetivo (casos ativos, conversão, follow-up vencido, período
 * financeiro, CAC/ROI, próxima ação, parâmetros) mostrou que quase tudo já
 * tem fonte única de cortes anteriores:
 *  - casos ativos: um único contador (eixo_operacao === "caso_ativo"), lido
 *    igualmente por onboarding-jornada.functions.ts, desk-operacional.tsx e
 *    painel-onboarding-jornada.tsx.
 *  - conversão/funil e follow-up vencido: únicos em conversao-funil.ts,
 *    já com correção de bug documentada (07/09/2026).
 *  - CAC/ROI: única fórmula em indicadores-marketing.ts (cac/roi), reusada
 *    por marketing-aquisicao.ts (nunca reimplementada).
 *  - próxima ação: unificada em CA18 (obterProximaAcaoCanonica).
 *
 * A lacuna real: o registro único de indicadores (indicadores-governanca.ts)
 * declarava periodo="Mês corrente" para IND-FIN-01 (Financeiro) e
 * IND-MKT-01/02/03 (Marketing) — mas nenhuma das duas telas usa mês
 * calendário. /financeiro soma acumulado sem filtro de período (achado de
 * auditoria de 07/09/2026, já corrigido no texto da própria tela) e
 * /marketing usa um recorte selecionável (7d/30d/90d/365d/tudo, padrão
 * "tudo"). O registro que deveria ser a fonte única de nomenclatura estava
 * ele mesmo desatualizado em relação às telas reais — corrigido aqui.
 */

describe("CA22 — periodo declarado em indicadores-governanca.ts bate com a tela real", () => {
  it("IND-FIN-01 não afirma mais 'Mês corrente' (financeiro.tsx não filtra por período)", () => {
    expect(DETALHE_INDICADOR["IND-FIN-01"].periodo).not.toMatch(/mês corrente/i);
    expect(DETALHE_INDICADOR["IND-FIN-01"].periodo).toMatch(/acumulado/i);
  });

  it("IND-MKT-01/02/03 não afirmam mais 'Mês corrente' (marketing.tsx usa recorte selecionável, padrão tudo)", () => {
    for (const codigo of ["IND-MKT-01", "IND-MKT-02", "IND-MKT-03"] as const) {
      expect(DETALHE_INDICADOR[codigo].periodo).not.toMatch(/mês corrente/i);
      expect(DETALHE_INDICADOR[codigo].periodo).toMatch(/marketing/i);
    }
  });

  it("financeiro.tsx confirma, no próprio texto, o recorte acumulado sem filtro de período", () => {
    const arquivo = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");
    expect(arquivo).toMatch(/acumulado total, sem filtro de per[íi]odo/i);
  });

  it("marketing.tsx confirma o recorte selecionável com padrão 'tudo' (nunca mês calendário)", () => {
    const filtros = readFileSync("src/lib/marketing-filtros-csv.ts", "utf8");
    expect(filtros).toContain('"7d" | "30d" | "90d" | "365d" | "tudo"');
    expect(filtros).toContain('periodo: "tudo"');
  });
});

describe("CA22 — fontes únicas já existentes não foram duplicadas (regressão)", () => {
  it("casos ativos: um único contador, lido igualmente por onboarding-jornada e pelos painéis", () => {
    const funcoes = readFileSync("src/lib/onboarding-jornada.functions.ts", "utf8");
    expect(funcoes).toContain('eixo_operacao"] === "caso_ativo"');
    const deskOperacional = readFileSync("src/components/ops/desk-operacional.tsx", "utf8");
    const painelOnboarding = readFileSync("src/components/painel/painel-onboarding-jornada.tsx", "utf8");
    expect(deskOperacional).toContain('"casos_ativos"');
    expect(painelOnboarding).toContain('"casos_ativos"');
  });

  it("CAC/ROI: marketing-aquisicao.ts reusa cac/roi de indicadores-marketing.ts, nunca reimplementa a fórmula", () => {
    const aquisicao = readFileSync("src/lib/marketing-aquisicao.ts", "utf8");
    expect(aquisicao).toContain("cac as calcularCac");
    expect(aquisicao).toContain("roi as calcularRoi");
    expect(aquisicao).toContain('from "@/lib/indicadores-marketing"');
  });

  it("próxima ação segue canônica (CA18), não duplicada aqui", () => {
    const crmDesk = readFileSync("src/lib/crm-desk.ts", "utf8");
    expect(crmDesk).toContain("obterProximaAcaoCanonica");
  });
});
