import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { MODULOS_ORFAOS } from "@/lib/orfaos-modulos-classificados";

/**
 * A varredura de módulos órfãos virou teste (31/10/2026).
 *
 * `orfaos-classificados-2026-10-04.test.ts` cobre só `createServerFn`. Aqui a
 * mesma regra do AGENTS.md vale para componente e módulo: se alguém criar um
 * arquivo em `src/components` ou `src/lib` e nenhum arquivo de produção o
 * importar, falha aqui, com o caminho, até haver veredicto escrito. Importar
 * só em teste não conta como uso.
 */

function listar(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) listar(p, acc);
    else if (/\.(ts|tsx|css)$/.test(e.name)) acc.push(p.replace(/\\/g, "/"));
  }
  return acc;
}

const TODOS = listar("src");
const ehTeste = (p: string) => p.includes("__tests__") || /\.test\.tsx?$/.test(p);
const FONTES = new Map<string, string>(TODOS.map((p) => [p, readFileSync(p, "utf8")]));
const PRODUCAO = TODOS.filter((p) => !ehTeste(p) && !p.endsWith("routeTree.gen.ts"));

const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Alvos de import que apontam para este arquivo (alias `@/`, relativo ou diretório do index). */
function importadores(arquivo: string): string[] {
  const semExt = arquivo.replace(/\.(ts|tsx)$/, "");
  const ehIndex = basename(semExt) === "index";
  const alvo = ehIndex ? dirname(semExt) : semExt;
  const alias = "@/" + alvo.slice("src/".length);
  const nome = basename(alvo);
  const re = new RegExp(
    `(?:from\\s+|import\\(\\s*|import\\s+)["'](?:${escapar(alias)}|\\.{1,2}/(?:[^"']*/)?${escapar(nome)})["']`,
  );
  return PRODUCAO.filter((p) => p !== arquivo && re.test(FONTES.get(p) ?? ""));
}

function excluido(arquivo: string): boolean {
  const nome = basename(arquivo);
  if (arquivo.startsWith("src/components/ui/") && !nome.startsWith("ca-")) return true; // shadcn
  if (nome.endsWith(".functions.ts")) return true; // coberto pelo registro de createServerFn
  if (nome.startsWith("orfaos-")) return true; // os próprios registros
  return false;
}

const CANDIDATAS = TODOS.filter(
  (p) =>
    /^src\/(components|lib)\//.test(p) &&
    /\.(ts|tsx)$/.test(p) &&
    !p.endsWith(".d.ts") &&
    !ehTeste(p) &&
    !excluido(p),
);
const ORFAS = CANDIDATAS.filter((p) => importadores(p).length === 0)
  .map((p) => relative("src", p).replace(/\\/g, "/"))
  .sort();
const REGISTRADAS = new Set(MODULOS_ORFAOS.map((o) => o.modulo));

describe("Módulos órfãos: inventário classificado, nada apagado em silêncio (31/10/2026)", () => {
  it("1. todo módulo sem importador de produção tem veredicto escrito", () => {
    const semVeredicto = ORFAS.filter((o) => !REGISTRADAS.has(o));
    expect(
      semVeredicto,
      `Módulo sem importador e sem veredicto:\n${semVeredicto.join("\n")}\n\n` +
        "Ligue-o a uma tela ou declare o veredicto em src/lib/orfaos-modulos-classificados.ts " +
        "(skill classificar-orfao).",
    ).toEqual([]);
  });

  it("2. o registro não guarda módulo que já voltou a ter importador", () => {
    const fantasmas = [...REGISTRADAS].filter((o) => !ORFAS.includes(o));
    expect(fantasmas, `Já religados — tire do registro:\n${fantasmas.join("\n")}`).toEqual([]);
  });

  it("3. cada veredicto tem motivo e destino, não só o rótulo", () => {
    for (const o of MODULOS_ORFAOS) {
      expect(o.motivo.length, o.modulo).toBeGreaterThan(40);
      expect(o.destino.length, o.modulo).toBeGreaterThan(8);
    }
  });

  it("4. o que aguarda decisão nomeia a decisão", () => {
    for (const o of MODULOS_ORFAOS.filter((x) => x.veredicto === "AGUARDA_DECISAO")) {
      expect(o.destino, o.modulo).toMatch(/^Decis(ã|a)o:/);
    }
  });

  it("5. substituto citado em CASCA_DUPLICADA e APOSENTADA_CLASSIFICADA existe no repositório", () => {
    for (const o of MODULOS_ORFAOS.filter(
      (x) => x.veredicto === "CASCA_DUPLICADA" || x.veredicto === "APOSENTADA_CLASSIFICADA",
    )) {
      const caminhos = [
        ...o.destino.matchAll(/(?:src\/)?((?:components|lib|routes)\/[\w./$-]+\.(?:tsx|ts)\b)/g),
      ].map((m) => m[1]);
      for (const c of caminhos) {
        expect(existsSync(join("src", c)), `${o.modulo} cita ${c}, que não existe`).toBe(true);
      }
    }
  });

  it("6. nada do que está classificado foi apagado do repositório", () => {
    for (const o of MODULOS_ORFAOS) {
      expect(existsSync(join("src", o.modulo)), o.modulo).toBe(true);
    }
  });

  it("7. quem carrega dado de família não é religado sem decisão: risco marcado nunca é RELIGAR", () => {
    for (const o of MODULOS_ORFAOS.filter((x) => x.riscoVazamento)) {
      expect(o.veredicto, `${o.modulo} tem dado de família e está marcado para religar`).not.toBe(
        "RELIGAR",
      );
    }
  });

  it("8. o `painel-dia.tsx` segue aguardando a decisão do AGENTS.md e não foi tocado de classificação", () => {
    const e = MODULOS_ORFAOS.find((o) => o.modulo === "components/painel/painel-dia.tsx");
    expect(e?.veredicto).toBe("AGUARDA_DECISAO");
  });
});
