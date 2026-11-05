import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Fila v2, B02 (05/11/2026): "Salvar rascunho" salva a edição atual na versão de trabalho aberta;
 * "Nova versão" é botão separado. Antes, "Salvar rascunho" criava uma versão nova a cada clique.
 */
const fn = readFileSync("src/lib/contratos.functions.ts", "utf8");
const tela = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");

const trecho = (fonte: string, de: string, ate: string) => fonte.slice(fonte.indexOf(de), fonte.indexOf(ate, fonte.indexOf(de)));

describe("B02 — Salvar rascunho × Nova versão", () => {
  const salvar = trecho(fn, "export const salvarRascunhoAtual", "export const executarValidacoes");

  it("salvar rascunho regrava a versão atual e nunca insere versão", () => {
    expect(salvar).toContain('tabela: "contract_versions"');
    expect(salvar).toContain("id: atual.id as string");
    expect(salvar).not.toContain(".insert(");
  });

  it("só versão de trabalho aberta muda; fechada orienta para Nova versão", () => {
    expect(salvar).toContain('atual.status !== "working" || atual.frozen_at');
    expect(salvar).toContain("Use “Nova versão” para registrar as alterações.");
  });

  it("arquivo vai para caminho novo, sem sobrescrever, antes de a versão apontar para ele", () => {
    expect(salvar).toContain("{ upsert: false }");
    expect(salvar).toContain("rascunho-${Date.now()}.html");
    expect(salvar.indexOf("upload(")).toBeLessThan(salvar.indexOf("gravarComVerificacao("));
  });

  it("as duas ações usam a mesma montagem do texto", () => {
    const nova = trecho(fn, "export const gerarRascunhoInterno", "export const salvarRascunhoAtual");
    expect(nova).toContain("montarConteudoDoInstrumento(");
    expect(salvar).toContain("montarConteudoDoInstrumento(");
    expect(fn.match(/helpers\.montarRascunho\(/g)?.length).toBe(1);
  });

  it("a tela tem dois botões distintos com as mutações certas", () => {
    expect(tela).toContain("onClick={() => mSalvar.mutate()}");
    expect(tela).toContain('"Nova versão" : "Criar primeira versão"');
    expect(tela).toContain("salvarAtual({ data: { contract_id: id } })");
    expect(tela).toContain("Nenhuma versão nova foi criada.");
  });
});
