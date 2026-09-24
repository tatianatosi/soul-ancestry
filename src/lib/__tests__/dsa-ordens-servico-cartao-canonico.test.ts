import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Continuação de DSA-10 (Painel → CaCard canônico): ordens-servico.tsx era
 * um dos arquivos isolados listados como pendentes em
 * docs/design-system/componentes.md. Mesmo mecanismo mecânico já usado em
 * propostas.tsx e na família contratual: import trocado, <Painel
 * titulo=...> vira <CaCard variante="compacto" titulo=...>.
 */

const ROTA = "src/routes/_authenticated/ordens-servico.tsx";
const rota = readFileSync(ROTA, "utf8");

describe("ordens-servico.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    const importeBase = rota.slice(rota.indexOf('from "@/components/comercial/base"') - 300, rota.indexOf('from "@/components/comercial/base"'));
    expect(importeBase).not.toContain("Painel,");
  });

  it("importa CaCard e usa variante compacto nos 5 blocos", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota.match(/<CaCard variante="compacto" titulo=/g)?.length).toBe(5);
  });

  it("preserva os rótulos dos 5 blocos (Resumo, Escopo / observação, Planejamento, Mover status, Histórico)", () => {
    for (const titulo of [
      "Resumo",
      "Escopo / observação",
      "Planejamento (responsável, início, prazo)",
      "Mover status",
      "Histórico",
    ]) {
      expect(rota).toContain(`titulo="${titulo}"`);
    }
  });
});
