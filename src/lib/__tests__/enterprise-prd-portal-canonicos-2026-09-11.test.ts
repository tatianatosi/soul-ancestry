import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  PORTAL_ABAS_CANONICAS,
  abasCanonicasDoPortal,
  PORTAL_ROTAS_PROFUNDAS,
} from "@/lib/portal-navegacao";

const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
const core = readFileSync(".cursor/rules/clube-ancestral-core.mdc", "utf8");
const adendo = readFileSync("docs/politicas/ADENDO-ENTERPRISE-PRD-VS-CORE-2026-09-11.md", "utf8");

describe("Enterprise PRD × App Cliente canônico (2026-09-11)", () => {
  it("barra canônica tem exatamente 7 abas na ordem do mockup", () => {
    expect([...PORTAL_ABAS_CANONICAS]).toEqual([
      "Home",
      "Jornada",
      "Radar",
      "Árvore",
      "Documentos",
      "Legado",
      "Conta",
    ]);
    expect(abasCanonicasDoPortal().map((a) => a.rotulo)).toEqual([...PORTAL_ABAS_CANONICAS]);
  });

  it("Entregas e Fases são rotas profundas, não abas", () => {
    expect(PORTAL_ROTAS_PROFUNDAS.map((r) => r.rota)).toEqual([
      "/portal/entregas",
      "/portal/fase-01",
      "/portal/fase-02",
    ]);
    expect(shell).not.toContain('to: "/portal/entregas"');
    expect(shell).not.toContain('to: "/portal/fase-01"');
    expect(shell).not.toContain('to: "/portal/fase-02"');
  });

  it("core e adendo registram o PRD sem autorizar schema paralelo", () => {
    expect(core).toContain("CLUBE_ANCESTRAL_ENTERPRISE_PRD");
    expect(adendo).toContain("O que o PRD");
    expect(adendo).toContain("autoriza mais");
    expect(adendo).toContain("client_accounts");
  });
});
