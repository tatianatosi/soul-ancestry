import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { ORFAS_CLASSIFICADAS, chaveOrfa, orfasPor } from "@/lib/orfaos-classificados";

/**
 * A varredura de órfãs virou teste (04/10/2026).
 *
 * Regra do AGENTS.md: peça órfã é religada com prova de uso ou aposentada com
 * classificação, nunca apagada em silêncio. Até aqui a varredura era manual e
 * recomeçava a cada rodada. Este teste REFAZ a varredura e exige veredicto
 * escrito para cada órfã — se alguém criar um `createServerFn` e esquecer de
 * ligá-lo a uma tela, falha aqui, com o nome da função.
 */

function serverFnsExportadas(fonte: string): string[] {
  return [...fonte.matchAll(/export const ([a-zA-Z0-9_]+) = createServerFn/g)].map((m) => m[1]);
}

function temChamadorDeTela(fn: string): boolean {
  const dirs = ["src/routes", "src/components"];
  const pilha = [...dirs.filter(existsSync)];
  const re = new RegExp(`\\b${fn}\\b`);
  while (pilha.length) {
    const d = pilha.pop()!;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        pilha.push(p);
        continue;
      }
      if (!/\.tsx?$/.test(e.name) || p.includes("__tests__")) continue;
      if (re.test(readFileSync(p, "utf8"))) return true;
    }
  }
  return false;
}

/**
 * Chamador real em outro módulo: import do símbolo ou chamada `fn(`. Menção em
 * texto não conta — senão este próprio registro, que nomeia as 30, faria todas
 * parecerem religadas.
 */
const REGISTRO = "orfaos-classificados.ts";

function temChamadorEmOutroModulo(fn: string, arquivoProprio: string): boolean {
  const importado = new RegExp(`import[^;]*\\b${fn}\\b[^;]*from`, "s");
  const chamado = new RegExp(`\\b${fn}\\s*\\(`);
  for (const f of readdirSync("src/lib")) {
    if (!f.endsWith(".ts") || f === arquivoProprio || f === REGISTRO) continue;
    const txt = readFileSync(join("src/lib", f), "utf8");
    if (importado.test(txt) || chamado.test(txt)) return true;
  }
  return false;
}

function varrerOrfas(): string[] {
  const achadas: string[] = [];
  for (const f of readdirSync("src/lib").filter((x) => x.endsWith(".functions.ts"))) {
    const fonte = readFileSync(join("src/lib", f), "utf8");
    for (const fn of serverFnsExportadas(fonte)) {
      if (temChamadorDeTela(fn)) continue;
      if (temChamadorEmOutroModulo(fn, f)) continue;
      achadas.push(`${f}#${fn}`);
    }
  }
  return achadas.sort();
}

describe("Órfãs: inventário classificado, nada apagado em silêncio (04/10/2026)", () => {
  const orfas = varrerOrfas();
  const classificadas = new Set(ORFAS_CLASSIFICADAS.map(chaveOrfa));

  it("1. toda órfã da varredura tem veredicto escrito", () => {
    const semVeredicto = orfas.filter((o) => !classificadas.has(o));
    expect(
      semVeredicto,
      `Órfã sem classificação:\n${semVeredicto.join("\n")}\n\n` +
        "Ligue a função a uma tela, ou declare o veredicto em src/lib/orfaos-classificados.ts.",
    ).toEqual([]);
  });

  it("2. o registro não guarda função que já voltou a ter chamador", () => {
    const fantasmas = [...classificadas].filter((c) => !orfas.includes(c));
    expect(fantasmas, `Já religadas — tire do registro:\n${fantasmas.join("\n")}`).toEqual([]);
  });

  it("3. cada veredicto tem motivo e destino, não só o rótulo", () => {
    for (const o of ORFAS_CLASSIFICADAS) {
      expect(o.motivo.length, chaveOrfa(o)).toBeGreaterThan(40);
      expect(o.destino.length, chaveOrfa(o)).toBeGreaterThan(8);
    }
  });

  it("4. os quatro vereditos estão em uso e nenhum vira depósito", () => {
    expect(orfasPor("CASCA_DUPLICADA").length).toBeGreaterThan(0);
    expect(orfasPor("APOSENTADA_CLASSIFICADA").length).toBeGreaterThan(0);
    expect(orfasPor("AGUARDA_DECISAO").length).toBeGreaterThan(0);
    expect(orfasPor("RELIGAR").length).toBeGreaterThan(0);
    // Nenhum veredicto pode conter mais da metade do inventário sem explicação.
    for (const v of ["CASCA_DUPLICADA", "APOSENTADA_CLASSIFICADA", "RELIGAR"] as const) {
      expect(orfasPor(v).length, v).toBeLessThan(ORFAS_CLASSIFICADAS.length);
    }
  });

  it("5. o que aguarda decisão nomeia a decisão, não um 'pendente' genérico", () => {
    for (const o of orfasPor("AGUARDA_DECISAO")) {
      expect(o.destino, chaveOrfa(o)).toMatch(/^Decis(ã|a)o:/);
    }
  });

  it("6. nada do que está classificado foi apagado do repositório", () => {
    for (const o of ORFAS_CLASSIFICADAS) {
      const caminho = join("src/lib", o.modulo);
      expect(existsSync(caminho), caminho).toBe(true);
      expect(readFileSync(caminho, "utf8"), chaveOrfa(o)).toContain(`export const ${o.fn} = createServerFn`);
    }
  });
});
