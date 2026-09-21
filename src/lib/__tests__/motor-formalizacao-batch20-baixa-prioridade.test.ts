import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// Auditoria de Formalização/Jurídico, batch 20 (Baixa, opcional, encerra a
// auditoria): escopo-conferencia.functions.ts (histórico do override interno
// da proprietária) e contratos.functions.ts::salvarItemContrato (insert cru
// → inserirComVerificacao).

const escopoConferenciaFn = readFileSync("src/lib/escopo-conferencia.functions.ts", "utf8");
const contratosFn = readFileSync("src/lib/contratos.functions.ts", "utf8");

describe("escopo-conferencia.functions.ts::registrarOverrideGateInterno — passou a registrar histórico", () => {
  it("chama registrarTimelineCaso com o motivo do override", () => {
    const trecho = escopoConferenciaFn.slice(escopoConferenciaFn.indexOf("export const registrarOverrideGateInterno"));
    expect(trecho).toContain("registrarTimelineCaso(supabase, {");
    expect(trecho).toContain("summaryInternal: motivo,");
  });
});

describe("contratos.functions.ts::salvarItemContrato — insert passou a verificar linha gravada", () => {
  it("usa inserirComVerificacao em vez de insert cru no ramo de criação", () => {
    const trecho = contratosFn.slice(
      contratosFn.indexOf("export const salvarItemContrato"),
      contratosFn.indexOf("export const sincronizarPessoaDoCaso"),
    );
    expect(trecho).toContain("const inserido = await inserirComVerificacao({");
    expect(trecho).not.toContain("await supabase.from(data.tabela).insert({");
  });

  it("usa o id real do registro inserido no evento de histórico", () => {
    const trecho = contratosFn.slice(
      contratosFn.indexOf("export const salvarItemContrato"),
      contratosFn.indexOf("export const sincronizarPessoaDoCaso"),
    );
    expect(trecho).toContain("sourceEntityId: idGravado ?? data.contract_id,");
  });
});
