import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * CA17-MARKETING-E-INDICADORES-VIVOS (09/09/2026) — campanha, canal, período,
 * investimento, origem de lead e conversão já estavam ligados a dados reais
 * (CA10): filtro de período/canal já se aplicava a leads/eventos/investimentos/
 * atribuições antes de qualquer cálculo, e leads-por-origem, casos-por-origem
 * e desempenho-por-canal já eram honestos ("Sem dados suficientes" nunca
 * estimativa). A lacuna real: os 5 indicadores principais tinham fonte e
 * confiança declaradas, mas nenhum abria o detalhe correspondente — "fonte,
 * período e drill-down" exige as três coisas juntas, não duas. Não foi criada
 * nenhuma consulta nova: as âncoras já existem na própria página.
 */

const marketingTsx = readFileSync("src/routes/_authenticated/marketing.tsx", "utf8");

describe("CA17 — cada indicador principal abre o detalhe correspondente (drill-down)", () => {
  it("declara uma âncora de drill-down para os 5 indicadores principais", () => {
    const bloco = marketingTsx.slice(
      marketingTsx.indexOf("const ANCORA_DRILLDOWN"),
      marketingTsx.indexOf("const CONFIANCA_ROTULO"),
    );
    for (const chave of ["leads_por_origem", "conversoes_por_canal", "investimento_por_canal", "cac", "roi"]) {
      expect(bloco).toContain(`${chave}:`);
    }
  });

  it("o nome do indicador é um link para a âncora, não texto morto", () => {
    const bloco = marketingTsx.slice(
      marketingTsx.indexOf('data-marketing="metricas-principais"'),
      marketingTsx.indexOf('data-marketing="metricas-principais"') + 700,
    );
    expect(bloco).toMatch(/<a\s+href=\{`#\$\{ANCORA_DRILLDOWN/);
  });

  it("cac e roi apontam para a tabela real de desempenho por canal (mesma página, sem consulta nova)", () => {
    expect(marketingTsx).toContain('id="desempenho-canal"');
    const bloco = marketingTsx.slice(
      marketingTsx.indexOf("const ANCORA_DRILLDOWN"),
      marketingTsx.indexOf("const CONFIANCA_ROTULO"),
    );
    expect(bloco).toContain('cac: "desempenho-canal"');
    expect(bloco).toContain('roi: "desempenho-canal"');
  });

  it("leads por origem e conversão apontam para seções já existentes (atribuição/funil), sem rota nova", () => {
    const bloco = marketingTsx.slice(
      marketingTsx.indexOf("const ANCORA_DRILLDOWN"),
      marketingTsx.indexOf("const CONFIANCA_ROTULO"),
    );
    expect(bloco).toContain('leads_por_origem: "atribuicao"');
    expect(bloco).toContain('conversoes_por_canal: "funil-aquisicao"');
    expect(bloco).toContain('investimento_por_canal: "canais-campanhas"');
  });
});

describe("CA17 — período e canal já filtram todos os indicadores antes do drill-down (CA10, confirmado aqui)", () => {
  it("métricas principais (leituraMetricas → desempenhoAgregado) e casosPorOrigem recebem a entrada já filtrada", () => {
    expect(marketingTsx).toMatch(/leituraMetricas\(entrada\)/);
    expect(marketingTsx).toMatch(/casosPorOrigem\(entrada\)/);
    // `entrada` (não entradaBruta) é o resultado de filtrarEntrada — confirma
    // que o indicador nunca ignora o filtro de período/canal já aplicado.
    expect(marketingTsx).toMatch(/const entrada = useMemo\(\(\) => filtrarEntrada\(entradaBruta, filtro\)/);
    const aquisicao = readFileSync("src/lib/marketing-aquisicao.ts", "utf8");
    expect(aquisicao).toContain("desempenhoAgregado(entrada)");
  });
});
