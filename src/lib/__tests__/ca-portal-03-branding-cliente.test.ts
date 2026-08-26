import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { AZUIS_RETIRADOS, MARCA_CORES } from "@/lib/marca";

const RETIRADAS = [...AZUIS_RETIRADOS, "#C9A84C", "#F5F0E8", "#8B4513"];

const SUPERFICIES_CLIENTE = [
  "src/components/portal/portal-shell.tsx",
  "src/components/portal/portal-visibilidade.tsx",
  "src/lib/contratos.server.ts",
  "src/components/client-research-one-page.tsx",
];

describe("CA-PORTAL-03 — branding das superfícies de cliente", () => {
  it("azul oficial é o do Guia de Marca", () => {
    expect(MARCA_CORES.azul).toBe("#2F4B6E");
  });

  it.each(SUPERFICIES_CLIENTE)("%s não usa cor retirada", (arquivo) => {
    const conteudo = readFileSync(arquivo, "utf8");
    for (const cor of RETIRADAS) {
      // A menção em comentário/lista de proibidos é permitida apenas em marca.ts.
      expect(conteudo.toUpperCase()).not.toContain(cor.toUpperCase());
    }
  });

  it("a matriz de copy e branding está versionada", () => {
    const doc = readFileSync("docs/portal/CA-PORTAL-03_Matriz_Copy_Branding.md", "utf8");
    expect(doc).toContain("Matriz de Copy e Branding");
    expect(doc).toContain("Guia de Marca");
    for (const tela of [
      "Jornada",
      "Radar",
      "Árvore",
      "Fase 01",
      "Fase 02",
      "Legado",
      "Faturas",
      "Proposta",
    ]) {
      expect(doc).toContain(tela);
    }
  });
});
