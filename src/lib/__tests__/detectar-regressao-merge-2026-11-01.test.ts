import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

// S1 (01/11/2026): o detector acusa o merge que perde trabalho (caso 00ab0cc5) e fica quieto no merge correto.
const SCRIPT = resolve("scripts/detectar-regressao-merge.sh");
const raiz = mkdtempSync(join(tmpdir(), "regressao-"));
afterAll(() => rmSync(raiz, { recursive: true, force: true }));

const git = (...a: string[]) =>
  execFileSync("git", a, { cwd: raiz, encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@t", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@t" } }).trim();
const escrever = (f: string, c: string) => {
  mkdirSync(join(raiz, f, ".."), { recursive: true });
  writeFileSync(join(raiz, f), c);
};
const rodar = (sha: string, limite = 2) => {
  try {
    return { cod: 0, saida: execFileSync("bash", [SCRIPT, sha, String(limite)], { cwd: raiz, encoding: "utf8" }) };
  } catch (e) {
    const err = e as { status: number; stdout: string };
    return { cod: err.status, saida: err.stdout };
  }
};

describe("detectar-regressao-merge.sh", () => {
  git("init", "-q", "-b", "main");
  for (const f of ["a", "b", "c"]) escrever(`src/${f}.ts`, `${f} v1\n`);
  git("add", "-A"); git("commit", "-q", "-m", "base");
  const base = git("rev-parse", "HEAD");

  // linha A (main): altera a, b, c
  for (const f of ["a", "b", "c"]) escrever(`src/${f}.ts`, `${f} v2 da main\n`);
  git("commit", "-qam", "main altera");
  const linhaMain = git("rev-parse", "HEAD");

  // linha B (editor): parte da base e altera só d (novo)
  git("checkout", "-q", "-b", "editor", base);
  escrever("src/d.ts", "d editor\n");
  git("add", "-A"); git("commit", "-q", "-m", "editor altera");

  it("acusa o merge que devolveu a, b e c à versão da base (alteração da main sumiu)", () => {
    git("checkout", "-q", "-b", "ruim", "editor");
    git("merge", "-q", "--no-commit", "--no-ff", linhaMain);
    for (const f of ["a", "b", "c"]) escrever(`src/${f}.ts`, `${f} v1\n`); // resolve "errado": volta à base
    git("add", "-A"); git("commit", "-q", "-m", "merge ruim");
    const r = rodar("HEAD", 2);
    expect(r.cod).toBe(3);
    expect(r.saida).toMatch(/PERDIDOS=3/);
    expect(r.saida).toMatch(/REVERTEU src\/a\.ts/);
  });

  it("não acusa o merge correto das mesmas duas linhas", () => {
    git("checkout", "-q", "-b", "bom", "editor");
    git("merge", "-q", "--no-edit", linhaMain);
    const r = rodar("HEAD", 2);
    expect(r.cod).toBe(0);
    expect(r.saida).toMatch(/PERDIDOS=0/);
  });

  it("commit simples só conta arquivos apagados", () => {
    git("checkout", "-q", "bom");
    git("rm", "-q", "src/a.ts", "src/b.ts", "src/c.ts");
    git("commit", "-q", "-m", "apaga três");
    expect(rodar("HEAD", 3).cod).toBe(3);
    expect(rodar("HEAD", 4).cod).toBe(0);
  });
});
