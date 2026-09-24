import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Continuação de DSA-10 (Painel → CaCard canônico): propostas.tsx era um
 * dos arquivos pendentes listados em docs/design-system/componentes.md
 * (família CRM/Comercial). Mesmo padrão mecânico já usado nos 15 arquivos
 * da família contratual: import trocado, <Painel titulo=...> vira
 * <CaCard variante="compacto" titulo=...>.
 */

const ROTA = "src/routes/_authenticated/propostas.tsx";
const rota = readFileSync(ROTA, "utf8");

describe("propostas.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(rota).not.toMatch(/<Painel[\s>]/);
    expect(rota).not.toContain("</Painel>");
    const importeBase = rota.slice(rota.indexOf('from "@/components/comercial/base"') - 300, rota.indexOf('from "@/components/comercial/base"'));
    expect(importeBase).not.toContain("Painel,");
  });

  it("importa CaCard e usa variante compacto nos 6 blocos", () => {
    expect(rota).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(rota.match(/<CaCard variante="compacto" titulo=/g)?.length).toBe(6);
  });

  it("preserva os rótulos dos 6 blocos (Resumo, Mover status, Renovar validade, Editar, Criar versão para ajuste, Histórico)", () => {
    for (const titulo of ["Resumo", "Mover status", "Renovar validade", "Editar", "Criar versão para ajuste", "Histórico"]) {
      expect(rota).toContain(`titulo="${titulo}"`);
    }
  });
});
