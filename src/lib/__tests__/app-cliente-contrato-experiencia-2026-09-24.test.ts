import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";

import { PORTAL_ABAS_CANONICAS, PORTAL_ROTAS_SPEC } from "@/lib/portal-navegacao";
import { ABAS_APP_CLIENTE } from "@/components/portal/abas-app-cliente";

/**
 * Contrato de experiência do App Cliente (autorização da Proprietária, 24/09/2026).
 * Trava: barra = 7 abas; layout cliente sem controles de Desk/master/admin;
 * fronteira de acesso continua no servidor/RLS; bloqueio humano sem motivo interno.
 */
const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
const layout = readFileSync("src/routes/portal/route.tsx", "utf8");
const fonte = readFileSync("src/components/portal/fonte-portal.tsx", "utf8");
const gate = readFileSync("src/lib/app-cliente-gate.ts", "utf8");
const dadosVivos = readFileSync("src/lib/portal-dados-vivos.functions.ts", "utf8");

describe("A — sete abas e somente sete", () => {
  it("ordem e rótulos canônicos", () => {
    expect([...PORTAL_ABAS_CANONICAS]).toEqual(["Home", "Jornada", "Radar", "Árvore", "Documentos", "Legado", "Conta"]);
    expect(ABAS_APP_CLIENTE.map((a) => a.rota)).toEqual([
      "/portal",
      "/portal/jornada",
      "/portal/radar",
      "/portal/arvore",
      "/portal/documentos",
      "/portal/legado",
      "/portal/conta",
    ]);
    expect(PORTAL_ROTAS_SPEC.filter((r) => r.abaPrimeiroNivel).length).toBe(7);
  });
  it("a barra do shell lista exatamente as 7 rotas", () => {
    const rotasNav = [...shell.matchAll(/\{ to: "(\/portal[^"]*)", label:/g)].map((m) => m[1]);
    expect(rotasNav).toEqual(ABAS_APP_CLIENTE.map((a) => a.rota));
  });
  it("rotas profundas existentes não entram na barra", () => {
    const arquivos = readdirSync("src/routes/portal");
    expect(arquivos).toEqual(expect.arrayContaining(["index.tsx", "jornada.tsx", "radar.tsx", "arvore.tsx", "documentos.tsx", "legado.tsx", "conta.tsx"]));
    for (const profunda of ["/portal/entregas", "/portal/fase-01", "/portal/fase-02", "/portal/faturas", "/portal/proposta"]) {
      expect(shell).not.toContain(`to: "${profunda}"`);
    }
  });
});

describe("A — layout cliente sem controles internos", () => {
  it("sem Sair, busca, seletor de caso, master/demo visível ou ID técnico", () => {
    expect(shell).not.toMatch(/>\s*Sair\s*</);
    expect(shell).not.toMatch(/signOut\(/);
    expect(shell).not.toMatch(/type="search"|placeholder="Buscar/);
    expect(shell).not.toMatch(/<select/);
    expect(shell).not.toMatch(/>\s*(Master|DEMO|Visão Master)\s*</);
    expect(shell).not.toMatch(/case_id|crm_casos|organization_id/);
  });
  it("selo de prévia só existe em prévia e fora do fluxo visual", () => {
    expect(shell).toMatch(/previa \? \(\s*[\s\S]*?data-previa-portal[\s\S]*?className="sr-only"/);
  });
  it("header canônico: marca + selo Aplicativo da família + título serif", () => {
    expect(shell).toContain("BrandLogo");
    expect(shell).toContain("Aplicativo da família");
    expect(shell).toContain("font-serif");
  });
});

describe("B — fronteira de acesso real", () => {
  it("URL direta sem sessão volta a /acesso; layout não é SSR", () => {
    expect(layout).toContain("ssr: false");
    expect(layout).toContain('redirect({ to: "/acesso" })');
  });
  it("usuário não autorizado/revogado é levado ao estado seguro", () => {
    expect(shell).toContain("!data.autorizado");
    expect(shell).toContain('"/acesso/sem-permissao"');
  });
  it("troca de caso não reaproveita cache do caso anterior", () => {
    expect(fonte).toContain('queryKey: ["portal-dados-vivos", casoId ?? "padrao"]');
  });
  it("prévia do Desk nunca consulta o servidor como cliente", () => {
    expect(fonte).toContain("enabled: externa === null");
  });
  it("leitura do portal exige sessão autenticada no servidor", () => {
    expect(dadosVivos).toContain("requireSupabaseAuth");
  });
  it("bloqueio não revela motivo interno", () => {
    expect(gate).toContain("Nunca revela por que algo está indisponível");
    expect(gate).not.toMatch(/policy|rls|tabela|gate interno/i);
  });
});
