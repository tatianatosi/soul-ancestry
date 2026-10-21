import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const golive = readFileSync("src/lib/golive.functions.ts", "utf8");
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const marketing = readFileSync("src/routes/_authenticated/marketing.tsx", "utf8");
const leads = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const pesquisa = readFileSync("src/routes/_authenticated/pesquisa-modulo.index.tsx", "utf8");
const configuracoes = readFileSync("src/routes/_authenticated/configuracoes.tsx", "utf8");
const financeiro = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");

describe("21/10/2026 — carregarGoLive({ casoId? })", () => {
  it("aceita casoId e cai no caso-piloto quando ausente", () => {
    expect(golive).toContain("casoId?: string");
    expect(golive).toMatch(/porId \? consulta\.eq\("id", porId\) : consulta\.eq\("codigo", CODIGO_CASO_GO_LIVE\)/);
    expect(golive).toContain('.eq("organization_id", organizationId)');
  });

  it("o Caso 360 passa o id do caso aberto, sem trava de caso-piloto", () => {
    expect(caso360).toContain("<FichaQuatroLotesGoLive casoId={String(caso[\"id\"] ?? \"\")} />");
    expect(caso360).toContain("carregar({ data: { casoId } })");
    expect(caso360).not.toContain("não recebe caseId ainda");
  });
});

describe("21/10/2026 — Marketing: origens, casos pagos e campanhas fora do <details>", () => {
  it("Atribuição e origem e Aprendizados das campanhas vêm antes do <details>", () => {
    const details = marketing.indexOf("<CaCard>\n        <details>");
    expect(details).toBeGreaterThan(0);
    expect(marketing.indexOf('<Bloco id="atribuicao"')).toBeLessThan(details);
    expect(marketing.indexOf('<Bloco id="aprendizados"')).toBeLessThan(details);
    expect(marketing.indexOf('<Bloco id="canais-campanhas"')).toBeLessThan(details);
  });

  it("com 0 linhas, vazio honesto — nada estimado", () => {
    expect(marketing).toContain('data-marketing-vazio="casos-origem"');
    expect(marketing).toContain("Sem leads no recorte para classificar origem.");
    expect(marketing).toContain("{desempenho.length > 0 && (");
  });
});

describe("21/10/2026 — textos da main devolvidos (auditoria de não regressão)", () => {
  it("rótulos devolvidos", () => {
    expect(leads).toContain(">Quadro por etapa</h3>");
    expect(caso360).toContain('titulo="Núcleo familiar e participantes"');
    expect(pesquisa).toContain('titulo="Pesquisa Genealógica e Evidências"');
    expect(configuracoes).toContain("<GovernancaConectada />");
    expect(configuracoes).toContain('aria-label="Resumo de acesso master"');
    expect(financeiro).toContain("Ver lista →");
  });
});
