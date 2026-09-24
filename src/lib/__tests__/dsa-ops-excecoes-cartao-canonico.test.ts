import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Continuação de DSA-10 (Painel → CaCard canônico): ops-excecoes.tsx era
 * o último arquivo isolado listado como pendente em
 * docs/design-system/componentes.md. Mesmo mecanismo mecânico dos cortes
 * anteriores: import trocado, <Painel titulo=...> vira <CaCard
 * variante="compacto" titulo=...>.
 */

const ROTA = "src/routes/_authenticated/ops-excecoes.tsx";
const rota = readFileSync(ROTA, "utf8");

describe("ops-excecoes.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    expect(rota).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("importa CaCard e usa variante compacto nos 2 blocos", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota.match(/<CaCard variante="compacto"/g)?.length).toBe(2);
  });

  it("preserva os rótulos dos 2 blocos (Registrar exceção, Histórico de exceções)", () => {
    expect(rota).toContain('titulo="Registrar exceção"');
    expect(rota).toContain('titulo="Histórico de exceções"');
  });
});
