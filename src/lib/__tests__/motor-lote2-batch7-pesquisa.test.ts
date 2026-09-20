import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 7. Nem
// pesquisa-modulo.functions.ts nem pesquisa.functions.ts importavam
// registrarTimelineCaso — nenhum escritor case-scoped da Pesquisa deixava
// rastro no histórico do caso.

const modulo = readFileSync("src/lib/pesquisa-modulo.functions.ts", "utf8");
const simples = readFileSync("src/lib/pesquisa.functions.ts", "utf8");

function trechoDe(conteudo: string, nomeFn: string, proximaFn: string) {
  return conteudo.slice(conteudo.indexOf(`export const ${nomeFn}`), conteudo.indexOf(`export const ${proximaFn}`));
}

describe("pesquisa-modulo.functions.ts — histórico em todos os escritores case-scoped", () => {
  it("import de registrarTimelineCaso presente", () => {
    expect(modulo).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("criarPesquisaParaCaso checa linha afetada e registra histórico", () => {
    const t = trechoDe(modulo, "criarPesquisaParaCaso", "carregarPesquisaModulo");
    expect(t).toContain("NENHUMA_LINHA_AFETADA: pesquisa não foi criada para o caso.");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("salvarBlocoPesquisa registra histórico na criação e na atualização, usando o case_id da pesquisa", () => {
    const t = trechoDe(modulo, "salvarBlocoPesquisa", "arquivarRegistroPesquisa");
    expect(t).toContain('pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId)');
    expect(t).toContain("const caseId = pesquisa[\"case_id\"]");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });

  it("arquivarRegistroPesquisa registra histórico", () => {
    const t = trechoDe(modulo, "arquivarRegistroPesquisa", "vincularEvidencia");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("resolverPendenciaPesquisa registra histórico", () => {
    const t = trechoDe(modulo, "resolverPendenciaPesquisa", "criarTarefaDaPendencia");
    expect(t).toContain("registrarTimelineCaso(");
  });

  it("registrarLiberacaoExterna registra histórico quando a pesquisa tem caso vinculado", () => {
    const t = trechoDe(modulo, "registrarLiberacaoExterna", "rodarScanPesquisa");
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("pesquisa.functions.ts — histórico em todos os escritores case-scoped", () => {
  it("import de registrarTimelineCaso presente", () => {
    expect(simples).toContain('import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";');
  });

  it("salvarPesquisa registra histórico na criação e na atualização", () => {
    const t = trechoDe(simples, "salvarPesquisa", "arquivarPesquisa");
    expect(t).toContain("NENHUMA_LINHA_AFETADA: registro de pesquisa não foi criado.");
    expect(t.match(/registrarTimelineCaso\(/g)?.length).toBe(2);
  });

  it("arquivarPesquisa registra histórico", () => {
    const t = trechoDe(simples, "arquivarPesquisa", "linkArquivoEvidencia");
    expect(t).toContain("registrarTimelineCaso(");
  });
});
