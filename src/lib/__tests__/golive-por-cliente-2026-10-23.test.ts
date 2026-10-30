/**
 * GoLive por cliente — 23/10/2026 (decisão da Proprietária).
 * O GoLive é a vida COMPLETA de cada cliente; o Caso 360 é o resumo macro.
 * Garante: (1) gravação vai para o caso escolhido, nunca para o piloto por
 * engano; (2) o caso escolhido só vale dentro da organização; (3) as 19 telas
 * aceitam ?casoId= e mantêm o cliente ao navegar; (4) o GoLive mora em Casos.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { casoEscolhido, contextoDoCasoGoLive } from "@/lib/golive-escritores.functions";
import { CODIGO_CASO_GO_LIVE } from "@/lib/golive.functions";
import { GRUPOS_DESK } from "@/lib/navegacao-desk";
import { buscaGoLive } from "@/components/golive/dados";

const raiz = process.cwd();
const ler = (p: string) => readFileSync(join(raiz, p), "utf8");

type Filtro = [string, unknown];
function supabaseFalso(casos: Array<{ id: string; codigo: string; organization_id: string; cliente_id: string | null }>) {
  const consultas: Filtro[][] = [];
  const from = (tabela: string) => {
    const filtros: Filtro[] = [];
    consultas.push(filtros);
    const q: Record<string, unknown> = {
      select: () => q,
      eq: (c: string, v: unknown) => (filtros.push([c, v]), q),
      is: () => q,
      maybeSingle: async () => {
        if (tabela === "organization_members") return { data: { organization_id: "org-1" } };
        const achado = casos.find((c) => filtros.every(([k, v]) => (c as Record<string, unknown>)[k] === v));
        return { data: achado ?? null };
      },
    };
    return q;
  };
  return { cliente: { from }, consultas };
}

const CASOS = [
  { id: "11111111-1111-4111-8111-111111111111", codigo: CODIGO_CASO_GO_LIVE, organization_id: "org-1", cliente_id: "ana" },
  { id: "22222222-2222-4222-8222-222222222222", codigo: "CA-CID-IT-IND-2026-007", organization_id: "org-1", cliente_id: "x" },
  { id: "33333333-3333-4333-8333-333333333333", codigo: "CA-OUTRA-ORG-001", organization_id: "org-2", cliente_id: "y" },
];

describe("GoLive por cliente — servidor", () => {
  it("sem caso escolhido, continua no caso do piloto (comportamento anterior)", async () => {
    const { cliente } = supabaseFalso(CASOS);
    const ctx = await contextoDoCasoGoLive(cliente, "u1");
    expect(ctx.casoId).toBe(CASOS[0].id);
  });

  it("com caso escolhido (id), grava no caso X — nunca no da Ana", async () => {
    const { cliente } = supabaseFalso(CASOS);
    const ctx = await contextoDoCasoGoLive(cliente, "u1", CASOS[1].id);
    expect(ctx.casoId).toBe(CASOS[1].id);
    expect(ctx.casoId).not.toBe(CASOS[0].id);
  });

  it("aceita o código canônico do caso", async () => {
    const { cliente } = supabaseFalso(CASOS);
    const ctx = await contextoDoCasoGoLive(cliente, "u1", "CA-CID-IT-IND-2026-007");
    expect(ctx.casoId).toBe(CASOS[1].id);
  });

  it("caso de outra organização é recusado (não cai no piloto)", async () => {
    const { cliente } = supabaseFalso(CASOS);
    await expect(contextoDoCasoGoLive(cliente, "u1", CASOS[2].id)).rejects.toThrow(/não encontrado nesta organização/);
  });

  it("todo escritor GoLive repassa o caso escolhido ao contexto", () => {
    const fonte = ler("src/lib/golive-escritores.functions.ts");
    expect(fonte).not.toMatch(/contexto\(s, context\.userId as string\)/);
    expect((fonte.match(/contexto\(s, context\.userId as string, casoEscolhido\(data\)\)/g) ?? []).length).toBe(29);
  });

  it("casoEscolhido só aceita texto curto", () => {
    expect(casoEscolhido({ casoId: " abc " })).toBe("abc");
    expect(casoEscolhido({ casoId: 3 })).toBeUndefined();
    expect(casoEscolhido({ casoId: "x".repeat(81) })).toBeUndefined();
    expect(casoEscolhido(undefined)).toBeUndefined();
  });
});

describe("GoLive por cliente — telas", () => {
  const dir = "src/routes/_authenticated";
  const telas = readdirSync(join(raiz, dir)).filter((f) => f.startsWith("golive"));

  it("são 19 telas GoLive e todas aceitam ?casoId=", () => {
    expect(telas).toHaveLength(19);
    for (const t of telas) expect(ler(`${dir}/${t}`), t).toMatch(/validateSearch: buscaGoLive/);
  });

  it("links internos do GoLive mantêm o cliente escolhido", () => {
    for (const t of telas) {
      const fonte = ler(`${dir}/${t}`);
      expect(fonte, t).not.toMatch(/<Link to="\/golive/);
    }
  });

  it("gravações das telas GoLive usam o escritor com caso (nunca useServerFn direto)", () => {
    const escritores = [...ler("src/lib/golive-escritores.functions.ts").matchAll(/export const (\w+) = createServerFn/g)].map((m) => m[1]);
    for (const t of telas) {
      const fonte = ler(`${dir}/${t}`);
      for (const w of escritores) expect(fonte, `${t} → ${w}`).not.toMatch(new RegExp(`useServerFn\\(\\s*${w}\\s*\\)`));
    }
  });

  it("buscaGoLive só deixa passar casoId", () => {
    expect(buscaGoLive({ casoId: "CA-1", outro: "x" })).toEqual({ casoId: "CA-1" });
    expect(buscaGoLive({})).toEqual({});
  });
});

describe("GoLive tem lugar próprio dentro de Casos", () => {
  it("menu: Casos → GoLive · Vida do cliente", () => {
    const casos = GRUPOS_DESK.find((g) => g.id === "casos");
    expect(casos?.sub.some((s) => "to" in s && s.to === "/golive")).toBe(true);
    expect(casos?.prefixos).toContain("/golive");
  });

  it("Caso 360 e Todos os casos abrem o GoLive do mesmo caso", () => {
    expect(ler("src/routes/_authenticated/casos.$caseId.index.tsx")).toMatch(/to="\/golive"\s+search=\{\{ casoId: id \}\}/);
    expect(ler("src/routes/_authenticated/casos.index.tsx")).toMatch(/to="\/golive"\s+search=\{\{ casoId: String\(linha\["id"\]\) \}\}/);
  });

  it("Hoje (macro) não manda para o GoLive genérico nem para rota legada", () => {
    const hoje = ler("src/routes/_authenticated/painel.tsx");
    expect(hoje).not.toMatch(/to[=:] ?"\/golive"/);
    expect(hoje).not.toMatch(/\/golive\/microentregas/);
    expect(hoje).not.toMatch(/\/ops-excecoes/);
  });
});
