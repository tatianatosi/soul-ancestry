import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `pipeline.py` commita e dá push. Revisão de CLI de 31/10/2026 achou:
 *  - o argumento de commit entrava num `shell=True` (injeção);
 *  - não havia `--dry-run`, e `--help` virava a mensagem de commit;
 *  - erros saíam em stdout;
 *  - todo o corpo rodava no import, então importar `sensivel` já faria push.
 * Estes testes rodam o script de verdade, em repositórios temporários.
 */
const PIPELINE = resolve("pipeline.py");
const ENV = {
  ...process.env,
  PYTHONDONTWRITEBYTECODE: "1",
  GIT_AUTHOR_NAME: "teste",
  GIT_AUTHOR_EMAIL: "teste@example.com",
  GIT_COMMITTER_NAME: "teste",
  GIT_COMMITTER_EMAIL: "teste@example.com",
};

const temPython = spawnSync("python3", ["--version"]).status === 0;

function py(args: string[], cwd: string) {
  return spawnSync("python3", [PIPELINE, ...args], { cwd, env: ENV, encoding: "utf8" });
}

function git(args: string[], cwd: string) {
  return spawnSync("git", args, { cwd, env: ENV, encoding: "utf8" });
}

function repoDeTrabalho() {
  const raiz = mkdtempSync(join(tmpdir(), "pipeline-"));
  const remoto = join(raiz, "remoto.git");
  const obra = join(raiz, "obra");
  git(["init", "--bare", "-b", "main", remoto], raiz);
  git(["init", "-b", "work", obra], raiz);
  git(["remote", "add", "origin", remoto], obra);
  writeFileSync(
    join(obra, "package.json"),
    JSON.stringify({ scripts: { build: "node -e 0", typecheck: "node -e 0" } }),
  );
  git(["add", "."], obra);
  git(["commit", "-m", "base"], obra);
  return { raiz, obra, remoto };
}

describe.skipIf(!temPython)("pipeline.py endurecido (31/10/2026)", () => {
  it("o código não usa shell=True", () => {
    expect(readFileSync("pipeline.py", "utf8")).not.toContain("shell=True");
  });

  it("--help mostra o uso e sai com 0, sem rodar o pipeline", () => {
    const { raiz } = repoDeTrabalho();
    const r = py(["--help"], raiz);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("--dry-run");
    expect(r.stdout).not.toContain("INICIANDO PIPELINE");
  });

  it("opção desconhecida falha com código 2 e explica em stderr", () => {
    const { obra } = repoDeTrabalho();
    const r = py(["--forcar"], obra);
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("opção desconhecida");
  });

  it("importar o módulo não executa nada", () => {
    const { raiz } = repoDeTrabalho();
    const r = spawnSync(
      "python3",
      [
        "-c",
        `import sys; sys.path.insert(0, ${JSON.stringify(resolve("."))}); import pipeline; print(pipeline.sensivel(' M .env'))`,
      ],
      { cwd: raiz, env: ENV, encoding: "utf8" },
    );
    expect(r.status).toBe(0);
    expect(r.stdout.trim()).toBe("True");
    expect(r.stdout).not.toContain("INICIANDO");
  });

  it("--dry-run mostra o que seria commitado e não altera nada", () => {
    const { obra, remoto } = repoDeTrabalho();
    writeFileSync(join(obra, "novo.txt"), "conteúdo");
    const r = py(["--dry-run", "minha mensagem"], obra);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("novo.txt");
    expect(r.stdout).toContain("minha mensagem");
    expect(r.stdout).toContain("nada foi alterado");
    expect(git(["rev-list", "--count", "HEAD"], obra).stdout.trim()).toBe("1");
    expect(git(["status", "--porcelain"], obra).stdout).toContain("?? novo.txt");
    expect(git(["ls-remote", "--heads", remoto, "work"], obra).stdout.trim()).toBe("");
  }, 60_000);

  it("a mensagem de commit nunca é interpretada pelo shell", () => {
    const { obra, remoto } = repoDeTrabalho();
    writeFileSync(join(obra, "novo.txt"), "conteúdo");
    const maliciosa = 'x"; touch PWNED; echo "$(touch PWNED2) `touch PWNED3`';
    const r = py([maliciosa], obra);
    expect(r.status, r.stderr).toBe(0);
    for (const arquivo of ["PWNED", "PWNED2", "PWNED3"]) {
      expect(existsSync(join(obra, arquivo)), arquivo).toBe(false);
    }
    expect(git(["log", "-1", "--format=%s"], obra).stdout.trim()).toBe(maliciosa);
    expect(git(["ls-remote", "--heads", remoto, "work"], obra).stdout.trim()).not.toBe("");
  }, 60_000);

  it("erros saem em stderr, não em stdout", () => {
    const { obra } = repoDeTrabalho();
    git(["checkout", "-b", "main"], obra);
    const r = py([], obra);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("rode o pipeline numa branch de trabalho");
    expect(r.stdout).not.toContain("ERRO");
  }, 60_000);
});
