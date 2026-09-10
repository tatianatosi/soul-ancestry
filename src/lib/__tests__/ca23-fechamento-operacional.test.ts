import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DETALHE_INDICADOR } from "@/lib/indicadores-governanca";

/*
 * CA23-FECHAMENTO-OPERACIONAL (09/09/2026) — última CA da série CA12-CA22
 * antes de CA24 (UX/UI). Não é feature nova: é checagem de não regressão das
 * rotas centrais e das fontes vivas conectadas ao longo da série, censo único
 * em vez de repetir os testes de cada CA individual.
 *
 * Aceite do objetivo: contratos/anexos/matrizes acessíveis; Pesquisa/
 * Biblioteca/Governança/Financeiro/Marketing/Cockpit com fontes vivas;
 * suíte/tsc/build limpos. Verificação visual (desktop e 360px) não é
 * executável neste ambiente: não há credencial real de Supabase para
 * autenticar um servidor de desenvolvimento e navegar pelas rotas
 * autenticadas — registrado como limitação de ambiente, não como pendência
 * que bloqueia CA24 (que fará a revisão visual em si).
 */

function conteudo(caminho: string): string {
  return readFileSync(caminho, "utf8");
}

describe("CA23 — rotas centrais existem e estão registradas", () => {
  const rotas: [string, string][] = [
    ["src/routes/_authenticated/contratos.index.tsx", '"/_authenticated/contratos/"'],
    ["src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", '"/_authenticated/casos/$caseId/contrato/preparar"'],
    ["src/routes/_authenticated/biblioteca.tsx", '"/_authenticated/biblioteca"'],
    ["src/routes/_authenticated/financeiro.tsx", '"/_authenticated/financeiro"'],
    ["src/routes/_authenticated/marketing.tsx", '"/_authenticated/marketing"'],
    ["src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", '"/_authenticated/pesquisa-evidencias/$caseId"'],
    ["src/routes/_authenticated/relatorios-fase.$caseId.tsx", '"/_authenticated/relatorios-fase/$caseId"'],
    ["src/routes/_authenticated/painel.tsx", '"/_authenticated/painel"'],
    ["src/routes/_authenticated/casos.$caseId.index.tsx", '"/_authenticated/casos/$caseId/"'],
  ];
  for (const [arquivo, chaveRota] of rotas) {
    it(`${arquivo} declara a rota ${chaveRota}`, () => {
      expect(conteudo(arquivo)).toContain(chaveRota);
    });
  }
});

describe("CA23 — Contratos: v2, anexos e matrizes acessíveis (CA13/CA14)", () => {
  it("contratos.index.tsx mostra o inventário do contrato-base e anexos", () => {
    const arquivo = conteudo("src/routes/_authenticated/contratos.index.tsx");
    expect(arquivo).toContain("INVENTARIO_DATA");
    expect(arquivo).toContain("itensPorDominio(\"contrato_base\")");
    expect(arquivo).toContain("itensPorDominio(\"anexos\")");
  });

  it("preparar contrato mostra a matriz de composição aplicável", () => {
    const arquivo = conteudo("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx");
    expect(arquivo).toContain("modeloAplicavelAoCaso");
  });
});

describe("CA23 — Pesquisa com fonte viva (CA20)", () => {
  it("Caso 360 resume pesquisa via cadeiaPesquisaDoCaso", () => {
    const arquivo = conteudo("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(arquivo).toContain("cadeiaPesquisaDoCaso");
  });
});

describe("CA23 — Biblioteca Mestre conectada (CA21)", () => {
  it("Relatórios de fase mostra Modelos F1/F2 homologados da Biblioteca Mestre", () => {
    const arquivo = conteudo("src/routes/_authenticated/relatorios-fase.$caseId.tsx");
    expect(arquivo).toContain("modelosBiblioteca");
    expect(arquivo).toContain('to="/biblioteca"');
  });
});

describe("CA23 — Governança: fontes únicas (CA22)", () => {
  it("indicadores-governanca.ts não afirma período incompatível com as telas reais", () => {
    for (const codigo of ["IND-FIN-01", "IND-MKT-01", "IND-MKT-02", "IND-MKT-03"] as const) {
      expect(DETALHE_INDICADOR[codigo].periodo).not.toMatch(/mês corrente/i);
    }
  });
});

describe("CA23 — Financeiro e Marketing com fontes vivas (CA16/CA17)", () => {
  it("Financeiro mostra reembolsos (pagamentos estornados)", () => {
    const arquivo = conteudo("src/routes/_authenticated/casos.$caseId.index.tsx");
    expect(arquivo).toContain("Reembolsos (pagamentos estornados)");
  });

  it("Marketing liga indicadores a drill-down real, não card decorativo", () => {
    const arquivo = conteudo("src/routes/_authenticated/marketing.tsx");
    expect(arquivo).toContain("ANCORA_DRILLDOWN");
  });
});

describe("CA23 — Cockpit/Painel usa próxima ação canônica (CA18)", () => {
  it("crm-desk (Painel Hoje) usa obterProximaAcaoCanonica", () => {
    expect(conteudo("src/lib/crm-desk.ts")).toContain("obterProximaAcaoCanonica");
  });
});
