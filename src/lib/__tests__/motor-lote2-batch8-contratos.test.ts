import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 8. contratos.functions.ts
// só tinha contract_review_events (trilha interna do instrumento), nunca
// aparecia no histórico do Caso 360 (case_timeline_events). Blocos filhos
// (partes, escopo, cláusulas, anexos, exceções) só têm contract_id, não
// case_id — resolvidos via o novo helper casoDoContrato. Em
// contrato-parametros.functions.ts, registrarAssinatura já registrava
// histórico; faltavam garantirParametros, salvarParametro,
// definirStatusParametro e congelarPrevia.

const contratos = readFileSync("src/lib/contratos.functions.ts", "utf8");
const parametros = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

function trechoDe(conteudo: string, nomeFn: string, proximaFn: string) {
  return conteudo.slice(conteudo.indexOf(`export const ${nomeFn}`), conteudo.indexOf(`export const ${proximaFn}`));
}

describe("contratos.functions.ts — histórico em todos os escritores case-scoped", () => {
  it("import de registrarTimelineCaso e helper casoDoContrato presentes", () => {
    expect(contratos).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
    expect(contratos).toContain("async function casoDoContrato(supabase: Sb, organizationId: string, contractId: string)");
  });

  it("criarInstrumento registra histórico quando há caso vinculado", () => {
    const t = trechoDe(contratos, "criarInstrumento", "atualizarContrato");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("atualizarContrato registra histórico via o case_id relido do contrato", () => {
    const t = trechoDe(contratos, "atualizarContrato", "salvarItemContrato");
    expect(t).toContain('r.registro["case_id"]');
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("salvarItemContrato resolve o caso via casoDoContrato e registra histórico", () => {
    const t = trechoDe(contratos, "salvarItemContrato", "sincronizarPessoaDoCaso");
    expect(t).toContain("await casoDoContrato(supabase, organizationId, data.contract_id)");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("arquivarItemContrato registra histórico", () => {
    const t = trechoDe(contratos, "arquivarItemContrato", "gerarRascunhoInterno");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("gerarRascunhoInterno registra histórico (versão do rascunho)", () => {
    const t = trechoDe(contratos, "gerarRascunhoInterno", "executarValidacoes");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("solicitarRevisaoHumana registra histórico", () => {
    const t = trechoDe(contratos, "solicitarRevisaoHumana", "registrarDecisaoRevisao");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("registrarDecisaoRevisao registra histórico com a decisão", () => {
    const t = trechoDe(contratos, "registrarDecisaoRevisao", "aprovarParaEnvio");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("aprovarParaEnvio registra histórico", () => {
    const t = trechoDe(contratos, "aprovarParaEnvio", "tentarEtapaExterna");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("arquivarContrato registra histórico", () => {
    const t = trechoDe(contratos, "arquivarContrato", "salvarOrdemServico");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("criarExcecao resolve o caso via casoDoContrato e registra histórico", () => {
    const t = trechoDe(contratos, "criarExcecao", "visualizarVersaoInterna");
    expect(t).toContain("await casoDoContrato(supabase, organizationId, data.contract_id)");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("contrato-parametros.functions.ts — histórico nos escritores que faltavam", () => {
  it("helper casoDoRegistroParametros presente (resolve case_id via contract_case_parameters)", () => {
    expect(parametros).toContain("async function casoDoRegistroParametros(supabase: Sb, parametersId: string)");
  });

  it("garantirParametros registra histórico na criação", () => {
    const t = parametros.slice(
      parametros.indexOf("export const garantirParametros"),
      parametros.indexOf("export const painelParametros"),
    );
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("salvarParametro resolve o caso via casoDoRegistroParametros e registra histórico", () => {
    const t = parametros.slice(
      parametros.indexOf("export const salvarParametro"),
      parametros.indexOf("export const definirStatusParametro"),
    );
    expect(t).toContain("await casoDoRegistroParametros(supabase, linha.parameters_id as string)");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("definirStatusParametro resolve o caso via casoDoRegistroParametros e registra histórico", () => {
    const t = parametros.slice(
      parametros.indexOf("export const definirStatusParametro"),
      parametros.indexOf("async function montarDoRegistro"),
    );
    expect(t).toContain("await casoDoRegistroParametros(supabase, atual.parameters_id as string)");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("congelarPrevia registra histórico quando o registro tem caso vinculado", () => {
    const t = parametros.slice(
      parametros.indexOf("export const congelarPrevia"),
      parametros.indexOf("export const lerPrevia"),
    );
    expect(t).toContain("if (registro.case_id)");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("registrarAssinatura já registrava histórico (Lote 1) — não regrediu", () => {
    const t = parametros.slice(
      parametros.indexOf("export const registrarAssinatura"),
      parametros.indexOf("export const destinosParametros"),
    );
    expect(t).toContain("registrarTimelineCaso(");
  });
});
