import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auditoria de prontidão de lançamento (18/10/2026): `integracoes.tsx`
 * (Centro de Integrações) não tinha nenhum teste automatizado. A tela
 * promete "estado real de cada conector" — este teste prova, por leitura
 * do código real, que ela de fato lê `PRONTIDAO_INTEGRACOES` (a matriz de
 * prontidão real, sem tabela/CHECK inventado) e renderiza os dois
 * componentes que a compõem, sem simular dado novo.
 */
const ROTA = readFileSync("src/routes/_authenticated/integracoes.tsx", "utf8");
const PRONTIDAO = readFileSync("src/lib/prontidao-integracoes.ts", "utf8");

describe("Rota /integracoes — Centro de Integrações", () => {
  it("importa a matriz de prontidão real, não inventa uma nova", () => {
    expect(ROTA).toMatch(/from "@\/lib\/prontidao-integracoes"/);
    expect(ROTA).toContain("PRONTIDAO_INTEGRACOES");
    expect(ROTA).toContain("EstadoIntegracao");
  });

  it("os KPIs contam a própria matriz já carregada, nunca uma fonte paralela", () => {
    expect(ROTA).toMatch(/contarEstado\s*=\s*\(estado: EstadoIntegracao\)\s*=>\s*PRONTIDAO_INTEGRACOES\.filter/);
    expect(ROTA).toContain('contarEstado("VALIDADA_EM_QA")');
    expect(ROTA).toContain('contarEstado("BLOQUEADA_POR_DADO")');
    expect(ROTA).toContain('contarEstado("AGUARDA_CONFIRMACAO_DA_PROPRIETARIA")');
  });

  it("renderiza a matriz de prontidão e o centro de integrações reais", () => {
    expect(ROTA).toMatch(/import\s*\{\s*MatrizProntidaoIntegracoes\s*\}\s*from\s*"@\/components\/integracoes\/prontidao"/);
    expect(ROTA).toMatch(/import\s*\{\s*CentroIntegracoes\s*\}\s*from\s*"@\/components\/integracoes\/centro"/);
    expect(ROTA).toContain("<MatrizProntidaoIntegracoes />");
    expect(ROTA).toContain("<CentroIntegracoes />");
  });

  it("declara explicitamente que nenhuma ação externa sai desta tela", () => {
    expect(ROTA).toMatch(/Nenhuma ação externa parte desta tela/);
  });

  it("os três estados contados pela tela existem de fato no vocabulário de EstadoIntegracao", () => {
    // Prova contra a própria fonte, sem vocabulário novo (AGENTS.md: nunca
    // CHECK/estado hipotético).
    for (const estado of ["VALIDADA_EM_QA", "BLOQUEADA_POR_DADO", "AGUARDA_CONFIRMACAO_DA_PROPRIETARIA"]) {
      expect(PRONTIDAO, `estado ausente em prontidao-integracoes.ts: ${estado}`).toContain(estado);
    }
  });

  it("head/meta da rota identifica a página como Centro de Integrações, sem indexação", () => {
    expect(ROTA).toContain('title: "Centro de Integrações — Clube Ancestral"');
    expect(ROTA).toMatch(/name: "robots", content: "noindex"/);
  });
});
