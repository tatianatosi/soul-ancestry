import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { traduzirRecusa } from "@/lib/recusa-traducao.server";

function sqls(dir: string): string {
  return readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => readFileSync(join(dir, f), "utf8"))
    .join("\n");
}
const BANCO = sqls("supabase/migrations") + sqls("supabase/pendentes");

describe("traduzirRecusa não depende do início exato da mensagem (31/10/2026)", () => {
  const casos = [
    "Ativação operacional NO_GO. Bloqueios críticos abertos: consentimento",
    "Ativação bloqueada. Requisitos pendentes: contrato",
    "Somente admin ou operações podem ativar um caso.",
  ];

  it.each(casos)("traduz com prefixo de transporte: %s", (cru) => {
    for (const envelope of [`Error: ${cru}`, `ERROR:  ${cru}`, `[500] ${cru}`, cru]) {
      expect(traduzirRecusa(envelope), envelope).not.toBe(envelope);
    }
  });

  it("mensagem desconhecida volta intacta", () => {
    expect(traduzirRecusa("Algo que ninguém leu")).toBe("Algo que ninguém leu");
  });

  it.each(casos.map((c) => c.split(/[.:]/)[0]))("o texto ainda existe no SQL do banco: %s", (trecho) => {
    expect(BANCO).toContain(trecho);
  });
});
