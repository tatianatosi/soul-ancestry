import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — último item do levantamento:
// publicar/despublicar (aprovarProjecao/despublicarProjecao). A UI já exige
// confirmação humana (AcaoOperacional/acaoExterna já presentes em
// biblioteca-evidencias.$caseId.tsx) e a fila já saía corretamente (alerta
// "pronta para liberação" criado ao aprovar sem publicar). Faltava: (1)
// evento de histórico nas duas ações; (2) despublicarProjecao resolvia
// organizationId e descartava — a escrita não filtrava por organização.

const funcoes = readFileSync("src/lib/biblioteca-evidencias.functions.ts", "utf8");

const trechoAprovar = funcoes.slice(
  funcoes.indexOf("export const aprovarProjecao"),
  funcoes.indexOf("/**\n * Grava/reaproveita"),
);
const trechoDespublicar = funcoes.slice(
  funcoes.indexOf("export const despublicarProjecao"),
  funcoes.indexOf("/**\n * Rascunho de alerta interno"),
);

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — aprovarProjecao (publicar/aprovar)", () => {
  it("filtra a leitura e a escrita por organização — antes a leitura inicial não filtrava", () => {
    const selects = trechoAprovar.match(/\.eq\("organization_id", organizationId\)/g) ?? [];
    expect(selects.length).toBeGreaterThanOrEqual(2);
  });

  it("registra histórico depois da escrita confirmada, distinguindo publicar de só aprovar", () => {
    const posEscrita = trechoAprovar.indexOf("if (!r.data?.id)");
    const posTimeline = trechoAprovar.indexOf("registrarTimelineCaso(");
    expect(posEscrita).toBeGreaterThan(-1);
    expect(posTimeline).toBeGreaterThan(posEscrita);
    expect(trechoAprovar).toContain('"Achado publicado no App Cliente"');
    expect(trechoAprovar).toContain('"Achado aprovado (aguardando publicação)"');
    expect(trechoAprovar).toContain('sourceEntityType: "app_projections"');
  });

  it("não regride o alerta 'pronta para liberação' já existente", () => {
    expect(trechoAprovar).toContain("criarOuReaproveitarAlertaProjecao(supabase, organizationId, {");
  });
});

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — despublicarProjecao", () => {
  it("agora filtra a escrita por organização — antes organizationId era descartado", () => {
    expect(trechoDespublicar).toContain("const organizationId = await autorizarEscrita(");
    expect(trechoDespublicar).toContain('.eq("organization_id", organizationId)');
  });

  it("registra histórico depois da escrita confirmada", () => {
    const posEscrita = trechoDespublicar.indexOf("if (!r.data?.id)");
    const posTimeline = trechoDespublicar.indexOf("registrarTimelineCaso(");
    expect(posEscrita).toBeGreaterThan(-1);
    expect(posTimeline).toBeGreaterThan(posEscrita);
    expect(trechoDespublicar).toContain('"Achado despublicado do App Cliente"');
  });

  it("continua checando erro e linha afetada — comportamento preservado", () => {
    expect(trechoDespublicar).toContain("if (r.error) throw new Error(r.error.message);");
    expect(trechoDespublicar).toContain("NENHUMA_LINHA_AFETADA");
  });
});

describe("MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — confirmação humana já existente não regride", () => {
  const rota = readFileSync("src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx", "utf8");

  it("publicar/despublicar continuam dentro de AcaoOperacional com acaoExterna", () => {
    expect(rota).toContain('acaoExterna="publicar_no_app_cliente"');
    expect(rota).toContain('acaoExterna="despublicar_no_app_cliente"');
  });
});
