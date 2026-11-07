import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { proprietariaOperando } from "@/lib/autoridade.server";

/**
 * 03/11/2026 — a proprietária não pode ser bloqueada por vocabulário errado nem por linha repetida.
 *
 * 1) O assistente de pesquisa exigia estado_de_autorizacao_pesquisa === "autorizada", valor que o CHECK
 *    do banco não aceita (nao_autorizada | autorizada_interna | autorizada_externa | suspensa): HTTP 409 em todo caso.
 * 2) proprietariaOperando usava maybeSingle(); duas linhas de staff_access para a mesma pessoa viravam
 *    "não é proprietária" em silêncio.
 */

const RAIZ = resolve(__dirname, "../../..");
const ler = (rel: string) => readFileSync(resolve(RAIZ, rel), "utf8");

function valoresDoCheckDeAutorizacao(): string[] {
  const sql = ler("supabase/migrations/20260821135341_6a8d63e6-0395-41e3-b0fe-845f61e621e4.sql");
  const m = /estado_de_autorizacao_pesquisa IN \(([^)]*)\)/.exec(sql);
  if (!m) throw new Error("CHECK de estado_de_autorizacao_pesquisa não encontrado na migration.");
  return [...(m[1] ?? "").matchAll(/'([^']+)'/g)].map((x) => x[1] ?? "");
}

function clienteFalso(linhas: unknown[]) {
  const cadeia: Record<string, unknown> = {};
  cadeia["select"] = () => cadeia;
  cadeia["eq"] = () => cadeia;
  cadeia["is"] = () => Promise.resolve({ data: linhas, error: null });
  return { from: () => cadeia } as never;
}

describe("Autorização de pesquisa — vocabulário igual ao do banco", () => {
  it("o assistente só aceita valores que o CHECK do banco aceita", () => {
    const rota = ler("src/routes/api/pesquisa-assistente.ts");
    const bloco = /ESTADOS_AUTORIZADOS = \[([^\]]*)\]/.exec(rota);
    expect(bloco).not.toBeNull();
    const aceitos = [...(bloco?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((x) => x[1] ?? "");
    const doBanco = valoresDoCheckDeAutorizacao();
    expect(aceitos).toContain("autorizada_interna");
    for (const v of aceitos) expect(doBanco).toContain(v);
  });

  it("o literal \"autorizada\" não existe no banco e a rota não compara com ele", () => {
    expect(valoresDoCheckDeAutorizacao()).not.toContain("autorizada");
    expect(ler("src/routes/api/pesquisa-assistente.ts")).not.toMatch(/!==\s*"autorizada"/);
  });
});

describe("proprietariaOperando — papel lido em todas as linhas de staff_access", () => {
  it("não usa maybeSingle", () => {
    const fonte = ler("src/lib/autoridade.server.ts");
    const corpo = fonte.slice(
      fonte.indexOf("export async function proprietariaOperando"),
      fonte.indexOf("/** Variante assíncrona"),
    );
    expect(corpo).not.toContain("maybeSingle");
    expect(corpo).toContain(".some(");
  });

  it("duas linhas para a mesma pessoa: basta uma ativa com papel de proprietária", async () => {
    const ok = await proprietariaOperando(
      clienteFalso([
        { role: "operacoes", status: "suspended" },
        { role: "admin", status: "active" },
      ]),
      "u1",
    );
    expect(ok).toBe(true);
  });

  it("aceita proprietaria_administradora, como a tela e o servidor já aceitam em outros pontos", async () => {
    expect(await proprietariaOperando(clienteFalso([{ role: "proprietaria_administradora", status: "active" }]), "u1")).toBe(true);
  });

  it("sem linha ativa de proprietária continua falso", async () => {
    expect(await proprietariaOperando(clienteFalso([{ role: "operacoes", status: "active" }]), "u1")).toBe(false);
    expect(await proprietariaOperando(clienteFalso([{ role: "admin", status: "suspended" }]), "u1")).toBe(false);
  });
});
