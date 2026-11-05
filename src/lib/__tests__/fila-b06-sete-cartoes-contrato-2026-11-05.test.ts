import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** Fila v2, B06 (05/11/2026): o contrato é lido em sete cartões, nesta ordem, sem leitor ou gravador novo. */
const tela = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
const corpo = tela.slice(tela.indexOf('<div className="mt-4 space-y-5">'), tela.indexOf("function Campo("));
const ORDEM = [
  "Partes",
  "Escopo e entregas",
  "Condições e vigência",
  "Anexos e OS",
  "Texto do contrato",
  "Assinatura",
];

describe("B06 — sete cartões do contrato", () => {
  it("os cartões com título aparecem na ordem da fila, e o Histórico fecha a página", () => {
    const titulos = [...corpo.matchAll(/<CaCard titulo="([^"]+)"/g)].map((m) => m[1]);
    expect(titulos).toEqual(ORDEM);
    expect(corpo).toContain('<summary className="cursor-pointer font-serif text-lg text-navy">Histórico</summary>');
    expect(corpo.lastIndexOf('id="contrato-historico"')).toBeGreaterThan(corpo.indexOf('id="contrato-assinatura"'));
  });

  it("a navegação lista as mesmas sete seções, com alvo de toque de 44 px", () => {
    const nav = tela.slice(tela.indexOf("const SECOES_CONTRATO"), tela.indexOf("] as const;", tela.indexOf("const SECOES_CONTRATO")));
    const rotulos = [...nav.matchAll(/rotulo: "([^"]+)"/g)].map((m) => m[1]);
    expect(rotulos).toEqual([...ORDEM, "Histórico"]);
    expect(tela).toContain("{SECOES_CONTRATO.map((secao) => (");
    expect(tela).toContain("inline-flex min-h-11 shrink-0");
  });

  it("Fontes ficam dentro do Texto; a Validação jurídica fica em Assinatura, antes da revisão", () => {
    const texto = corpo.slice(corpo.indexOf('id="contrato-texto"'), corpo.indexOf('id="contrato-assinatura"'));
    expect(texto).toContain("<Clausulas ");
    expect(texto).toContain("<Fontes ");
    const assinatura = corpo.slice(corpo.indexOf('id="contrato-assinatura"'), corpo.indexOf('id="contrato-historico"'));
    expect(assinatura.indexOf("<Validacoes ")).toBeGreaterThan(-1);
    expect(assinatura.indexOf("<Validacoes ")).toBeLessThan(assinatura.indexOf("<Revisao "));
  });

  it("o status do item de escopo aparece com rótulo humano, não com o valor técnico", () => {
    expect(tela).toContain("{ROTULO_STATUS_ESCOPO[v] ?? v}");
  });
});
