import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { recortarRegistroSemana, rotuloEventoRegistro } from "@/lib/registro-semana";

const ev = (id: string, dia: string, title = `Evento ${id}`) => ({
  id,
  title,
  occurred_at: `${dia}T12:00:00.000Z`,
  case_id: "c1",
  case_codigo: "CA-CID-AT-FAM-2026-001",
});

describe("Registro da semana no Hoje", () => {
  it("separa ontem do restante da semana e ignora o que está fora", () => {
    const recorte = recortarRegistroSemana(
      [
        ev("hoje", "2026-09-11"),
        ev("ontem", "2026-09-10"),
        ev("semana", "2026-09-08"),
        ev("velho", "2026-08-01"),
      ],
      "2026-09-11",
    );
    expect(recorte.ontem.map((e) => e.id)).toEqual(["ontem"]);
    expect(recorte.semana.map((e) => e.id)).toEqual(["hoje", "semana"]);
  });

  it("sem occurred_at não inventa registro", () => {
    const recorte = recortarRegistroSemana(
      [{ id: "x", title: "Sem data", occurred_at: null, case_id: "c1" }],
      "2026-09-11",
    );
    expect(recorte.ontem).toEqual([]);
    expect(recorte.semana).toEqual([]);
  });

  it("o rótulo liga o evento ao caso", () => {
    expect(rotuloEventoRegistro(ev("a", "2026-09-10", "Touchpoint"))).toBe(
      "Touchpoint — CA-CID-AT-FAM-2026-001",
    );
  });

  it("o Hoje lê a timeline canônica, sem tabela nova", () => {
    const fn = readFileSync("src/lib/registro-semana.functions.ts", "utf8");
    expect(fn).toContain("case_timeline_events");
    expect(fn).not.toContain("cadence_runs");
  });
});
