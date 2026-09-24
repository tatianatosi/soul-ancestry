import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Últimos dois arquivos isolados de DSA-10 (Painel → CaCard canônico) fora
 * de financeiro.tsx, que continua sendo exceção deliberada
 * (DSA-7-FINANCEIRO — CaCard e Painel lado a lado por decisão explícita,
 * não tocado aqui). Mesmo mecanismo mecânico dos cortes anteriores.
 */

describe("contrato-parametros.index.tsx — migrado para CaCard canônico", () => {
  const rota = readFileSync("src/routes/_authenticated/contrato-parametros.index.tsx", "utf8");

  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    expect(rota).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("importa CaCard e usa variante compacto nos 2 blocos", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota.match(/<CaCard variante="compacto"/g)?.length).toBe(2);
  });

  it("preserva os rótulos (Como funciona, Casos reais)", () => {
    expect(rota).toContain('titulo="Como funciona"');
    expect(rota).toContain('titulo="Casos reais"');
  });
});

describe("escopo-origem.tsx — migrado para CaCard canônico", () => {
  const rota = readFileSync("src/routes/_authenticated/escopo-origem.tsx", "utf8");

  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    expect(rota).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("importa CaCard e usa variante compacto no bloco de síntese", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota).toContain('<CaCard variante="compacto" titulo="Síntese da cadeia (sem DEMO/TESTE)">');
  });
});

describe("financeiro.tsx — exceção deliberada DSA-7-FINANCEIRO, não tocada", () => {
  const rota = readFileSync("src/routes/_authenticated/financeiro.tsx", "utf8");

  it("continua usando Painel e CaCard lado a lado por decisão explícita", () => {
    expect(rota).toContain("DSA-7-FINANCEIRO");
    expect(rota).toMatch(/<Painel[\s>]/);
  });
});
