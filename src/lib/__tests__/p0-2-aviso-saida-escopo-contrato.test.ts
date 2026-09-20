import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * P0-2 (fatia real, não a versão assumida no pedido): `contratos.$id.tsx`
 * não tem UM formulário grande de edição em lote como `casos.$caseId.
 * index.tsx` — o campo "Resumo" já autosalva por campo (onBlur/onChange,
 * ver `Campo`), então o dirty-state clássico não se aplica lá. O risco
 * real de perda silenciosa está nos formulários de "adicionar item" que
 * só gravam ao clicar (Escopo, Partes, Cláusulas, Anexos, Fontes). Este
 * corte cobre o primeiro deles (Escopo — não é cláusula, anexo jurídico
 * nem assinatura) como fatia P0 comprovada; os demais ficam registrados
 * como P1 na matriz, mesmo padrão, mesmo risco menor.
 */
const ARQUIVO = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");

function corpoDaFuncao(nome: string): string {
  const inicio = ARQUIVO.indexOf(`function ${nome}(`);
  if (inicio === -1) throw new Error(`função ${nome} não encontrada`);
  const proximaFuncao = ARQUIVO.indexOf("\nfunction ", inicio + 1);
  return ARQUIVO.slice(inicio, proximaFuncao === -1 ? undefined : proximaFuncao);
}

describe("P0-2 — aviso de saída com rascunho não confirmado em Escopo do contrato", () => {
  it("useEffect está importado (pré-requisito para o listener)", () => {
    expect(ARQUIVO).toMatch(/import\s*\{\s*useEffect,\s*useState\s*\}\s*from\s*"react"/);
  });

  it("Escopo registra beforeunload só quando há título digitado, não incondicional", () => {
    const escopo = corpoDaFuncao("Escopo");
    expect(escopo).toMatch(/if\s*\(!titulo\.trim\(\)\)\s*return;/);
    expect(escopo).toMatch(/addEventListener\("beforeunload", h\)/);
    expect(escopo).toMatch(/removeEventListener\("beforeunload", h\)/);
    expect(escopo).toMatch(/e\.preventDefault\(\);/);
  });

  it("não toca lógica de cláusula, anexo jurídico ou assinatura — só Escopo foi alterado", () => {
    const clausulas = corpoDaFuncao("Clausulas");
    const anexos = corpoDaFuncao("Anexos");
    expect(clausulas).not.toMatch(/beforeunload/);
    expect(anexos).not.toMatch(/beforeunload/);
  });

  it("o item de escopo já tinha arquivamento com histórico antes deste corte (não recriado)", () => {
    const escopo = corpoDaFuncao("Escopo");
    expect(escopo).toMatch(/Arquiva o item de escopo/);
    expect(escopo).toMatch(/O registro permanece no histórico/);
  });
});
