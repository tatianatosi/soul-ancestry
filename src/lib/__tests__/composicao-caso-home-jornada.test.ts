import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { composicaoDoCasoCliente } from "@/lib/portal-dados-vivos";
import { COMPOSICOES } from "@/lib/cadeia-operacional";

const home = readFileSync("src/routes/portal/index.tsx", "utf8");
const jornada = readFileSync("src/routes/portal/jornada.tsx", "utf8");
const migracaoColuna = readFileSync(
  "supabase/migrations/20260822182106_ff124b82-76c5-44f2-975e-2f51963c880e.sql",
  "utf8",
);

describe("composição é valor canônico e persistido", () => {
  it("o vocabulário tem exatamente os três valores", () => {
    expect([...COMPOSICOES]).toEqual(["individual", "casal", "nucleo_familiar"]);
  });

  it("a coluna existe em case_plans", () => {
    expect(migracaoColuna).toContain("ADD COLUMN IF NOT EXISTS composicao text");
  });
});

describe("os três valores viram vocabulário de cliente", () => {
  it.each([
    ["individual", "Caso individual"],
    ["casal", "Caso do casal"],
    ["nucleo_familiar", "Caso da família"],
  ])("%s → %s", (valor, rotulo) => {
    expect(composicaoDoCasoCliente(valor)).toBe(rotulo);
  });

  it("nenhum rótulo carrega vocabulário técnico", () => {
    for (const c of COMPOSICOES) {
      const rotulo = composicaoDoCasoCliente(c)!;
      expect(rotulo).not.toContain("_");
      expect(rotulo.toLowerCase()).not.toContain("nucleo");
    }
  });
});

describe("ausente e inválido não viram fallback inventado", () => {
  it.each([null, undefined, "", "   "])("%s não vira rótulo", (v) => {
    expect(composicaoDoCasoCliente(v as string | null)).toBeNull();
  });

  it("valor fora do vocabulário devolve nulo, não o valor cru", () => {
    expect(composicaoDoCasoCliente("familia_extensa")).toBeNull();
    expect(composicaoDoCasoCliente("INDIVIDUAL ")).toBe("Caso individual");
  });
});

describe("a mesma composição aparece na Home e na Jornada", () => {
  it("as duas leem a mesma fonte sanitizada do servidor", () => {
    expect(home).toContain("composicao={vivo.data?.composicao ?? null}");
    expect(jornada).toContain("vivo.composicao");
  });

  it("Home não renderiza composição ausente; Jornada usa texto narrativo genérico", () => {
    expect(home).toContain("{composicao ? <span");
    expect(jornada).toContain('{vivo.composicao ?? "A história da sua família"}');
  });

  it("nenhuma das duas inventa texto para o caso vazio", () => {
    for (const [nome, src] of [["home", home], ["jornada", jornada]] as const) {
      expect(src, nome).not.toContain("Composição não informada");
      expect(src, nome).not.toContain("nucleo_familiar");
    }
  });
});
