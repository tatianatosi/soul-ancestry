import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 3, batch 13 (pontos de baixo
// risco identificados junto com o batch 12: arquivamento/desvínculo em
// telas de Pesquisa e Biblioteca ainda usando window.prompt()).

const fontesDocumentos = readFileSync("src/components/pesquisa/fontes-documentos.tsx", "utf8");
const fontesVinculos = readFileSync("src/components/pesquisa/fontes-vinculos.tsx", "utf8");
const painel = readFileSync("src/components/pesquisa/painel.tsx", "utf8");
const pesquisaEvidencias = readFileSync("src/routes/_authenticated/pesquisa-evidencias.$caseId.tsx", "utf8");
const bibliotecaEvidencias = readFileSync("src/routes/_authenticated/biblioteca-evidencias.$caseId.tsx", "utf8");

describe("nenhum window.prompt() restante nos seis arquivos do levantamento", () => {
  it.each([
    ["fontes-documentos.tsx", fontesDocumentos],
    ["fontes-vinculos.tsx", fontesVinculos],
    ["painel.tsx", painel],
    ["pesquisa-evidencias.$caseId.tsx", pesquisaEvidencias],
    ["biblioteca-evidencias.$caseId.tsx", bibliotecaEvidencias],
  ])("%s não usa mais window.prompt()", (_nome, conteudo) => {
    expect(conteudo).not.toContain("window.prompt(");
  });
});

describe("fontes-documentos.tsx — Arquivar documento-fonte", () => {
  it("está dentro de AcaoOperacional", () => {
    expect(fontesDocumentos).toContain('import { AcaoOperacional } from "@/components/saas/acao-operacional";');
    expect(fontesDocumentos).toContain('acaoExterna="arquivar_fonte_documento"');
    expect(fontesDocumentos).toContain("onConfirmar={(motivo) => arquivar.mutate({ id: l.id, motivo })}");
  });
});

describe("fontes-vinculos.tsx — Desvincular", () => {
  it("está dentro de AcaoOperacional", () => {
    expect(fontesVinculos).toContain('import { AcaoOperacional } from "@/components/saas/acao-operacional";');
    expect(fontesVinculos).toContain('acaoExterna="desvincular_fonte_pesquisa"');
  });
});

describe("painel.tsx — Arquivar (Acoes, reusado em todos os blocos)", () => {
  it("está dentro de AcaoOperacional; pedirArquivar foi removido", () => {
    expect(painel).toContain('import { AcaoOperacional } from "@/components/saas/acao-operacional";');
    expect(painel).toContain('acaoExterna="arquivar_registro_pesquisa"');
    expect(painel).not.toContain("const pedirArquivar");
  });
});

describe("pesquisa-evidencias.$caseId.tsx — arquivar solicitação documental", () => {
  it("está dentro de AcaoOperacional", () => {
    expect(pesquisaEvidencias).toContain('import { AcaoOperacional } from "@/components/saas/acao-operacional";');
    expect(pesquisaEvidencias).toContain('acaoExterna="arquivar_solicitacao_documental"');
  });
});

describe("biblioteca-evidencias.$caseId.tsx — arquivar evidência e arquivar projeção", () => {
  it("os dois pontos que faltavam estão dentro de AcaoOperacional", () => {
    expect(bibliotecaEvidencias).toContain('acaoExterna="arquivar_evidencia"');
    expect(bibliotecaEvidencias).toContain('acaoExterna="arquivar_projecao_app_cliente"');
  });

  it("os três AcaoOperacional já existentes (Aprovar, Aprovar e publicar, Despublicar) não regrediram", () => {
    expect(bibliotecaEvidencias).toContain('acaoExterna="publicar_no_app_cliente"');
    expect(bibliotecaEvidencias).toContain('acaoExterna="despublicar_no_app_cliente"');
  });
});
