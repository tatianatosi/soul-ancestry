import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * Entrega 1 — Sistema visual e App Home (2026-09-12).
 *
 * Tokens de --background/--card do :root nunca receberam o creme OKI
 * aprovado (23/08/2026) — o app inteiro renderizava fundo bege/branco em
 * vez do creme aprovado desde o commit que introduziu a paleta. Corrigido
 * aqui junto com o hero navy + stepper de 5 fases da Home do App Cliente
 * (só na demo pública — não existe policy de portal para fase real do
 * caso ainda, então o cliente real nunca recebe fase/percentual inventado).
 */

describe("Entrega 1 — tokens do guia de marca", () => {
  it("--background e --card em :root usam o creme OKI aprovado, não a paleta SaaS antiga", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const inicio = css.indexOf("GUIA DE MARCA OFICIAL");
    const root = css.slice(inicio, inicio + 1400);
    expect(root).toContain("--background: #ECDFCD;");
    expect(root).toContain("--card: #F5EEE3;");
    expect(root).not.toContain("--background: #F7F1E7;");
    expect(root).not.toContain("--card: #FFFFFF;");
  });

  it("o bloco isolado [data-marca=guia] usa o mesmo creme OKI, não branco/bege SaaS", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const inicioBloco = css.lastIndexOf('[data-marca="guia"] {');
    const bloco = css.slice(inicioBloco, inicioBloco + 900);
    expect(bloco).toContain("--background: #ECDFCD;");
    expect(bloco).toContain("--card: #F5EEE3;");
  });

  it("MARCA_CORES.fundo não fica mais na paleta SaaS antiga", () => {
    const marca = readFileSync("src/lib/marca.ts", "utf8");
    expect(marca).toContain('fundo: "#ECDFCD"');
  });
});

describe("Entrega 1 — hero navy + stepper de 5 fases na Home", () => {
  it("a Home usa as 5 fases do mockup aprovado, só como fixture da demo", () => {
    const demo = readFileSync("src/lib/portal-demo-sophia.ts", "utf8");
    expect(demo).toContain('"Diagnóstico", "Pesquisa", "Reconstrução", "Validação", "Entrega"');
  });

  it("o caminho do cliente real não recebe fase/percentual inventado (sem dado = sem dado)", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    const blocoReal = home.slice(home.indexOf("return (\n    <PortalShell"), home.indexOf("function PainelHomeMockup"));
    expect(blocoReal).not.toContain("fase={{");
  });

  it("a demo passa fase/percentual explicitamente para o hero", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    expect(home).toContain("FASE_ATUAL_DEMO_SOPHIA_INDICE");
    expect(home).toContain("FASE_ATUAL_DEMO_SOPHIA_PERCENTUAL");
  });

  it("o hero do caso é navy em gradiente, não mais o cartão claro anterior", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    expect(home).toContain("bg-gradient-to-br from-navy to-navy-soft");
  });

  it("o passo ativo do stepper usa o destaque em anel/gold do mockup, os concluídos usam check", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    expect(home).toContain("ring-4 ring-gold/30");
    expect(home).toContain("CheckCircle2");
  });
});
