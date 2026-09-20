import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 9. Nenhum dos três
// arquivos (Documentos/Consentimentos, Núcleos e Duplicidade de Núcleo)
// importava registrarTimelineCaso.

const documentos = readFileSync("src/lib/documentos.functions.ts", "utf8");
const nucleos = readFileSync("src/lib/nucleos-desk.functions.ts", "utf8");
const duplicidade = readFileSync("src/lib/nucleo-duplicidade.functions.ts", "utf8");

function trechoDe(conteudo: string, nomeFn: string, proximaFn: string) {
  return conteudo.slice(conteudo.indexOf(`export const ${nomeFn}`), conteudo.indexOf(`export const ${proximaFn}`));
}

describe("documentos.functions.ts — histórico nos escritores case-scoped", () => {
  it("import de registrarTimelineCaso presente", () => {
    expect(documentos).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("salvarDocumento registra histórico na criação e na atualização", () => {
    const t = trechoDe(documentos, "salvarDocumento", "baixarDocumento");
    expect(t).toContain("Documento atualizado");
    expect(t).toContain("Documento registrado");
    expect(t).toContain("NENHUMA_LINHA_AFETADA: documento não foi criado.");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });

  it("arquivarDocumento registra histórico", () => {
    const t = trechoDe(documentos, "arquivarDocumento", "listarConsentimentos");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("registrarConsentimento registra histórico quando há caso vinculado", () => {
    const t = trechoDe(documentos, "registrarConsentimento", "revogarConsentimento");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("revogarConsentimento registra histórico", () => {
    const t = trechoDe(documentos, "revogarConsentimento", "registrarExcecaoConsentimento");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("registrarExcecaoConsentimento registra histórico quando há caso vinculado", () => {
    const t = trechoDe(documentos, "registrarExcecaoConsentimento", "painelPrivacidade");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("nucleos-desk.functions.ts — histórico nos escritores case-scoped", () => {
  it("import de registrarTimelineCaso presente", () => {
    expect(nucleos).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("criarNucleo registra histórico quando vinculado a um caso", () => {
    const t = trechoDe(nucleos, "criarNucleo", "salvarDossieNucleo");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("salvarDossieNucleo resolve case_id/organization_id e registra histórico", () => {
    const t = trechoDe(nucleos, "salvarDossieNucleo", "salvarMembroNucleo");
    expect(t).toContain("case_id,organization_id");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("salvarMembroNucleo resolve o caso via o núcleo e registra histórico", () => {
    const t = trechoDe(nucleos, "salvarMembroNucleo", "encaminharFilaDrive");
    expect(t).toContain('.from("nucleos_familiares")');
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("encaminharFilaDrive registra histórico ao criar e ao transicionar a fila", () => {
    const t = nucleos.slice(nucleos.indexOf("export const encaminharFilaDrive"));
    expect(t).toContain("Núcleo encaminhado à fila do Drive");
    expect(t).toContain("Núcleo saiu da fila do Drive");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });
});

describe("nucleo-duplicidade.functions.ts — histórico na unificação", () => {
  it("import de registrarTimelineCaso presente", () => {
    expect(duplicidade).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("executarUnificacaoNucleo registra histórico quando há caso final", () => {
    const t = duplicidade.slice(duplicidade.indexOf("export const executarUnificacaoNucleo"));
    expect(t).toContain("if (plano.caso.caseIdFinal)");
    expect(t).toContain("registrarTimelineCaso(");
  });
});
