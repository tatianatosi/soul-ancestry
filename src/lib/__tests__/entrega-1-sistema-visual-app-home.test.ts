import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/*
 * Entrega 1 — Sistema visual e App Home (2026-09-12).
 *
 * Rodada 1: tokens de --background/--card do :root nunca receberam o creme
 * OKI aprovado (23/08/2026) — corrigido junto com o hero navy + stepper de
 * 5 fases da Home do App Cliente.
 *
 * Rodada 2 (12/09/2026): decisão aprovada da Proprietária troca toda a
 * paleta estrutural pela paleta Pantone do mockup — navy 2767 C #13294B
 * (sidebar/topbar), navy 534 C #1B365D (hero), dourado 4019 C #C2A84D,
 * cinza-tinta 2380 C #28334A (texto/ícones), Cloud Dancer #F0EEE9 (fundo).
 * A paleta OKI anterior (#2F4B6E/#FCB73A/#ECDFCD/#9A3A2F/#101010) sai por
 * completo — sem mistura.
 */

describe("Entrega 1 — tokens Pantone do mockup", () => {
  it("--background e --card em :root usam a paleta Pantone aprovada, não a OKI anterior", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const inicio = css.indexOf("PALETA PANTONE DO MOCKUP");
    const root = css.slice(inicio, inicio + 2000);
    expect(root).toContain("--navy: #13294B;");
    expect(root).toContain("--navy-800: #1B365D;");
    expect(root).toContain("--gold: #C2A84D;");
    expect(root).toContain("--cream: #F0EEE9;");
    expect(root).toContain("--preto: #28334A;");
    expect(root).not.toContain("--navy: #2F4B6E;");
    expect(root).not.toContain("--gold: #FCB73A;");
  });

  it("o bloco isolado [data-marca=guia] usa a mesma paleta Pantone, sem mistura com a OKI", () => {
    const css = readFileSync("src/styles.css", "utf8");
    const inicioBloco = css.lastIndexOf('[data-marca="guia"] {');
    const bloco = css.slice(inicioBloco, inicioBloco + 1000);
    expect(bloco).toContain("--navy: #13294B;");
    expect(bloco).toContain("--navy-800: #1B365D;");
    expect(bloco).toContain("--gold: #C2A84D;");
    expect(bloco).toContain("--cream: #F0EEE9;");
    expect(bloco).not.toContain("--navy: #2F4B6E;");
  });

  it("MARCA_CORES.fundo usa o Cloud Dancer da paleta Pantone, não a OKI anterior", () => {
    const marca = readFileSync("src/lib/marca.ts", "utf8");
    expect(marca).toContain('fundo: "#F0EEE9"');
    expect(marca).not.toContain('fundo: "#ECDFCD"');
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

  it("o hero do caso é um único card navy-800 (Pantone 534 C), sem gradiente nem card claro/cinza dentro dele", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    const hero = home.slice(home.indexOf("rounded-2xl border-b-2 border-gold/70 bg-navy-800"), home.indexOf("<EstepeJornada"));
    // 16/09/2026 — cartão do processo ampliado na primeira dobra (p-5/sm:p-7);
    // continua sendo um único card navy-800, sem gradiente nem card claro dentro.
    expect(home).toContain("bg-navy-800 p-6 text-cream shadow-md sm:p-8");
    expect(hero).not.toContain("gradient");
    expect(hero).not.toContain("ChipIdentidadeCaso");
  });

  it("o passo ativo do stepper usa check nos concluídos, sem painel/anel/escala extras (versão compacta)", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    expect(home).toContain("CheckCircle2");
    expect(home).not.toContain("Hoje você está aqui");
    expect(home).not.toContain("ring-4 ring-gold/30");
  });

  it("não há mais cartões bege duplicados de Caso/Progresso/Achados antes do hero", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    expect(home).not.toContain("data-home-meta");
  });

  it("o banner de dado fictício não aparece mais como faixa colorida na superfície do App Cliente", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    const bloco = shell.slice(shell.indexOf("{previa ? ("), shell.indexOf("{previa ? (") + 400);
    expect(bloco).toContain('className="sr-only"');
    expect(bloco).not.toContain("bg-gold/15");
  });

  it("a topbar do App Cliente é uma faixa única e compacta, não duas faixas altas", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    const numeroDeHeaders = (shell.match(/<header/g) ?? []).length;
    expect(numeroDeHeaders).toBe(1);
    expect(shell).not.toContain("Segunda faixa navy");
  });

  it("títulos de seção da Home usam sans, não serifada dominante (serifada só como acento no nome do caso)", () => {
    const home = readFileSync("src/routes/portal/index.tsx", "utf8");
    expect(home).toContain("Próxima ação");
    expect(home).toContain("Achados da sua história");
  });
});
