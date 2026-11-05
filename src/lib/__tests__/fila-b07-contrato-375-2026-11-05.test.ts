import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { ROTULO_CAPACIDADE_PARTE } from "@/components/contratos/rotulos";

/** Fila v2, B07 (05/11/2026): contrato a 375 px — uma coluna, âncoras roláveis, partes empilhadas e legíveis. */
const tela = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
const migration = readFileSync("supabase/migrations/20260816155807_0140001b-6791-4bce-89e7-33501041a4a5.sql", "utf8");

describe("B07 — contrato no celular", () => {
  it("a capacidade da parte tem rótulo humano para cada valor do CHECK do banco", () => {
    const check = migration.match(/legal_capacity_status in \(([^)]+)\)/)?.[1] ?? "";
    const valores = [...check.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(valores).toEqual(["adult", "minor", "legal_representative_required", "unknown"]);
    for (const v of valores) expect(ROTULO_CAPACIDADE_PARTE[v]).toBeTruthy();
  });

  it("a tela nunca mostra o valor técnico da capacidade", () => {
    expect(tela).not.toMatch(/>\{p\.legal_capacity_status\}</);
    expect(tela.split("ROTULO_CAPACIDADE_PARTE[p.legal_capacity_status]").length - 1).toBe(2);
  });

  it("as âncoras das seções rolam na horizontal e as partes empilham em cartões no celular", () => {
    expect(tela).toMatch(/aria-label="Seções do contrato"/);
    expect(tela).toMatch(/sticky top-0 z-10 mt-6 flex gap-1 overflow-x-auto/);
    expect(tela).toContain('className="mt-4 space-y-5"');
  });
});
