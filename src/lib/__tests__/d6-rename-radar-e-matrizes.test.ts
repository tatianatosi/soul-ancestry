import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * D6 — Renomeação autorizada explicitamente pela Proprietária (2026-09-23):
 * "Radar Interno" → "Radar & Matrizes" (§16 do De-Para) nas 4 fontes
 * canônicas declaradas como dívida em qualidade.tsx: navegação
 * (navegacao-desk.ts), rótulos humanos e descoberta/rota
 * (descoberta-desk.ts) e a própria rota/taxonomia (qualidade.tsx +
 * desk-arvore-canonica.ts). Eixos, cálculos e a separação Radar Desk (4
 * eixos) × Radar App (6 dimensões) não mudam — só o nome.
 */

describe("D6 · as 4 fontes canônicas usam Radar & Matrizes, nenhuma usa mais Radar Interno", () => {
  it("navegação (navegacao-desk.ts)", () => {
    const arquivo = readFileSync(resolve(__dirname, "../navegacao-desk.ts"), "utf8");
    /*
     * 04/10/2026 — decisão da Proprietária: "Retire todas as auditorias
     * repetidas do menu". O item passou de "Qualidade e auditoria" (rótulo da
     * prancha V4) para "Radar e matrizes", que é o que a rota realmente é. A
     * parte de qualidade/checklists continua dentro dela, recolhida.
     */
    expect(arquivo).toContain('label: "Radar e matrizes"');
    expect(arquivo).not.toContain('label: "Qualidade e auditoria"');
    expect(arquivo).not.toContain('label: "Radar Interno e Qualidade"');
  });

  it("rótulos humanos e descoberta/rota (descoberta-desk.ts)", () => {
    const arquivo = readFileSync(resolve(__dirname, "../descoberta-desk.ts"), "utf8");
    expect(arquivo).toContain('"/qualidade": "Radar & Matrizes"');
    expect(arquivo).toContain('atalho("/qualidade", "Radar & Matrizes")');
    expect(arquivo).not.toContain("Radar Interno");
  });

  it("rota e taxonomia (qualidade.tsx) — nenhum rótulo visível ao usuário usa mais o nome antigo", () => {
    const arquivo = readFileSync(
      resolve(__dirname, "../../routes/_authenticated/qualidade.tsx"),
      "utf8",
    );
    expect(arquivo).toContain('titulo="Radar & Matrizes"');
    expect(arquivo).toContain("Radar & Matrizes — Clube Ancestral");
    expect(arquivo).not.toMatch(/titulo="Radar Interno"/);
    expect(arquivo).not.toMatch(/"Radar Interno — Clube Ancestral"/);
    expect(arquivo).not.toMatch(/eyebrow="Radar Interno/);
  });

  it("árvore canônica do Desk (desk-arvore-canonica.ts)", () => {
    const arquivo = readFileSync(resolve(__dirname, "../desk-arvore-canonica.ts"), "utf8");
    expect(arquivo).toContain('nome: "Radar & Matrizes"');
    expect(arquivo).not.toContain('nome: "Radar Interno"');
  });
});

describe("D6 · eixos e cálculo do Radar Desk não mudaram (só o nome)", () => {
  it("continua 4 eixos internos, distintos das 6 dimensões do App", () => {
    const arquivo = readFileSync(
      resolve(__dirname, "../../routes/_authenticated/qualidade.tsx"),
      "utf8",
    );
    expect(arquivo).toContain("EIXOS_RADAR_CANONICOS");
    expect(arquivo).toContain("garantirEixosCanonicos");
    expect(arquivo).toMatch(/quatro eixos/);
    expect(arquivo).toMatch(/6 dimensões do App/);
  });

  it("radar-eixos.ts e radar-seis-eixos.ts continuam intocados (mesma fonte de cálculo)", () => {
    const eixos = readFileSync(resolve(__dirname, "../radar-eixos.ts"), "utf8");
    expect(eixos).toContain("EIXOS_RADAR_CANONICOS");
  });
});

describe("D6 · superfícies de UI adicionais também renomeadas", () => {
  it("link em casos.index.tsx aponta para Radar & Matrizes", () => {
    const arquivo = readFileSync(
      resolve(__dirname, "../../routes/_authenticated/casos.index.tsx"),
      "utf8",
    );
    expect(arquivo).toMatch(/Radar & Matrizes\s*<\/Link>/);
  });

  it("aria-label do RadarInternoIntegrado usa o novo nome", () => {
    const arquivo = readFileSync(
      resolve(__dirname, "../../components/desk/radar-interno-integrado.tsx"),
      "utf8",
    );
    expect(arquivo).toContain('aria-label="Modo do Radar & Matrizes"');
  });
});
