import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Continuação de DSA-10 (Painel → CaCard canônico): divergencias-catalogo.tsx
 * era um dos arquivos isolados listados como pendentes em
 * docs/design-system/componentes.md. Mesmo mecanismo mecânico já usado em
 * propostas.tsx/ordens-servico.tsx: import trocado, <Painel titulo=...>
 * vira <CaCard variante="compacto" titulo=...>.
 */

const ROTA = "src/routes/_authenticated/divergencias-catalogo.tsx";
const rota = readFileSync(ROTA, "utf8");

describe("divergencias-catalogo.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    expect(rota).not.toContain("Painel,");
    expect(rota).not.toMatch(/import\s*\{\s*Painel/);
  });

  it("importa CaCard e usa variante compacto nos 2 blocos", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota.match(/<CaCard variante="compacto"/g)?.length).toBe(2);
  });

  it("preserva o rótulo estático (Filtros) e o dinâmico (Divergências (N))", () => {
    expect(rota).toContain('titulo="Filtros"');
    expect(rota).toContain("titulo={`Divergências (${linhas.length})`}");
  });
});
