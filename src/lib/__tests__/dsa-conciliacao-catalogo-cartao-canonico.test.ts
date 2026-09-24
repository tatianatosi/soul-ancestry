import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Continuação de DSA-10 (Painel → CaCard canônico): conciliacao-catalogo.tsx
 * era um dos arquivos isolados listados como pendentes em
 * docs/design-system/componentes.md. Mesmo mecanismo mecânico já usado nos
 * cortes anteriores: import trocado, <Painel titulo=...> vira <CaCard
 * variante="compacto" titulo=...>.
 */

const ROTA = "src/routes/_authenticated/conciliacao-catalogo.tsx";
const rota = readFileSync(ROTA, "utf8");

describe("conciliacao-catalogo.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    expect(rota).not.toMatch(/import\s*\{\s*Painel/);
  });

  it("importa CaCard e usa variante compacto nos 2 blocos", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota.match(/<CaCard variante="compacto"/g)?.length).toBe(2);
  });

  it("preserva o rótulo estático e o dinâmico com key da lista", () => {
    expect(rota).toContain('titulo="Síntese da conciliação (sem DEMO/TESTE)"');
    expect(rota).toContain('<CaCard variante="compacto" key={l.proposalId} titulo={`${l.caso} — proposta v${l.versao ?? "—"}`}>');
  });
});
