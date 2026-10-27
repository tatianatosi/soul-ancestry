import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { GRUPOS_DESK, MENU_LEGADO_DESK } from "@/lib/navegacao-desk";

/**
 * Achados 2.1 e 2.2 da auditoria de espectro completo de 27/10/2026
 * (Frente de crítica de design, lente Desk V4).
 */
describe("Navegação do Desk — correções da auditoria de 27/10/2026", () => {
  it("2.1: o bloco de 'Governança / Legado' na lateral some quando não há item (mesmo guard de MENU_CONTA)", () => {
    const src = readFileSync("src/components/saas/shell.tsx", "utf8");
    expect(src).toContain('MENU_LEGADO_DESK.itens.length === 0 && "hidden"');
    // hoje a lista é vazia por definição — então o bloco deve estar, de fato, escondido.
    expect(MENU_LEGADO_DESK.itens.length).toBe(0);
  });

  it("2.2: 'Ficha Única do caso' mora no grupo Casos, junto das outras 3 variantes de /casos", () => {
    const casos = GRUPOS_DESK.find((g) => g.id === "casos");
    const pesquisa = GRUPOS_DESK.find((g) => g.id === "pesquisa");
    expect(
      casos?.sub.some(
        (s) =>
          "label" in s && s.label === "Ficha Única do caso" && "hash" in s && s.hash === "tecnico",
      ),
    ).toBe(true);
    expect(pesquisa?.sub.some((s) => "label" in s && s.label === "Ficha Única do caso")).toBe(
      false,
    );
  });
});
