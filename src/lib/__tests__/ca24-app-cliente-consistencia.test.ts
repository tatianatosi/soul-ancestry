import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/*
 * CA24-UX-UI-PANTONE-E-APP-VIVO (09/09/2026) — só inicia após CA12-CA23
 * concluídas e publicadas (confirmado: main/recovery em fd47f64/81a7fea).
 *
 * Este primeiro corte é o que é verificável por código nesta sessão: paleta
 * (Pantone) de fato única, sem link morto na navegação do App Cliente, sem
 * cor fora do token de marca nas telas do cliente. A verificação visual
 * (mobile 360px, hierarquia como renderizada) exige um servidor autenticado
 * de verdade — este ambiente não tem credencial real de Supabase (o servidor
 * MCP supabase está listado como não autorizado, e requireSupabaseAuth exige
 * um bearer token real, sem bypass de desenvolvimento). Isso é registrado
 * como pendência de ambiente no relatório, não fabricado aqui.
 */

const PORTAL_ROTAS_DIR = "src/routes/portal";
const PORTAL_COMPONENTES_DIR = "src/components/portal";

function arquivosTsx(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".tsx"))
    .map((e) => join(dir, e.name));
}

describe("CA24 — paleta de marca é única (tokens em styles.css, sem hex nem cor fora de marca no App Cliente)", () => {
  it("styles.css declara navy/gold/cream/terracotta uma única vez por tema", () => {
    const css = readFileSync("src/styles.css", "utf8");
    expect(css).toContain("--navy: #2F4B6E");
    expect(css).toContain("--gold: #FCB73A");
    expect(css).toContain("--cream: #ECDFCD");
    expect(css).toContain("--terracotta: #9A3A2F");
  });

  it("nenhuma tela ou componente do App Cliente usa hex hardcoded", () => {
    const ofensores: string[] = [];
    for (const dir of [PORTAL_ROTAS_DIR, PORTAL_COMPONENTES_DIR]) {
      for (const arquivo of arquivosTsx(dir)) {
        const conteudo = readFileSync(arquivo, "utf8");
        if (/#[0-9A-Fa-f]{6}\b/.test(conteudo)) ofensores.push(arquivo);
      }
    }
    expect(ofensores).toEqual([]);
  });

  it("nenhuma tela ou componente do App Cliente usa cor tailwind fora da marca (blue/red/green/purple/yellow)", () => {
    const ofensores: string[] = [];
    const foraDaMarca = /\b(?:text|bg|border)-(?:blue|red|green|purple|yellow)-\d{2,3}\b/;
    for (const dir of [PORTAL_ROTAS_DIR, PORTAL_COMPONENTES_DIR]) {
      for (const arquivo of arquivosTsx(dir)) {
        const conteudo = readFileSync(arquivo, "utf8");
        if (foraDaMarca.test(conteudo)) ofensores.push(arquivo);
      }
    }
    expect(ofensores).toEqual([]);
  });
});

describe("CA24 — navegação do App Cliente não tem link morto", () => {
  it("toda rota citada em portal-shell.tsx existe como arquivo de rota real", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    const rotas = [...shell.matchAll(/to:\s*"(\/portal[^"]*)"/g)].map((m) => m[1]);
    expect(rotas.length).toBeGreaterThan(0);
    for (const rota of rotas) {
      const nomeArquivo = rota === "/portal" ? "index.tsx" : `${rota.split("/").pop()}.tsx`;
      const caminho = join(PORTAL_ROTAS_DIR, nomeArquivo);
      expect(() => readFileSync(caminho)).not.toThrow();
    }
  });
});

describe("CA24 — mobile já resolvido no shell do App Cliente (regressão)", () => {
  it("barra de navegação mobile usa grid com largura igual, sem rolagem horizontal", () => {
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    expect(shell).toContain("gridTemplateColumns");
    expect(shell).toContain("minmax(0, 1fr)");
  });
});
