#!/usr/bin/env node
// Triagem somente leitura de branches não mescladas e de pendências escritas em documentos.
// Uso (na raiz do clone, depois de `git fetch --all`):  node scripts/triagem-branches-e-docs.mjs [--remote=origin] [--base=main]
//   --so-documentos   gera só docs/triagem/pendencias-em-documentos.csv (sem branches remotas disponíveis)
// Saída: docs/triagem/triagem-branches.csv e docs/triagem/pendencias-em-documentos.csv
// 05/11/2026 (LC-04/Q01): falha do git vira ERRO_GIT (antes virava 0 → JA_NA_MAIN); renomeação e remoção contam;
// sem branches remotas o script para em vez de gravar uma triagem vazia.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { classificarBranch, csv, lerNameStatus, marcadorDaLinha, VEREDITOS } from "./triagem-classificar.mjs";

const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? `--${n}=${d}`).split("=")[1];
const SO_DOCUMENTOS = process.argv.includes("--so-documentos");
const REMOTE = arg("remote", "origin");
const BASE = `${REMOTE}/${arg("base", "main")}`;
const git = (...a) =>
  execFileSync("git", a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] }).trim();
const tenta = (...a) => {
  try {
    return git(...a);
  } catch {
    return null;
  }
};

mkdirSync("docs/triagem", { recursive: true });
const linhas = [
  ["branch", "commits_a_frente", "arquivos", "so_documentacao", "iguais_na_main", "divergem", "ausentes_na_main", "removidos", "erros_git", "veredito"],
];

if (!SO_DOCUMENTOS) {
  const lista = tenta("for-each-ref", "--format=%(refname:short)", `refs/remotes/${REMOTE}`);
  if (lista === null) throw new Error(`git for-each-ref falhou em refs/remotes/${REMOTE}.`);
  if (tenta("rev-parse", "--verify", BASE) === null) throw new Error(`Base ${BASE} não encontrada: rode git fetch ${REMOTE}.`);
  const refs = lista.split("\n").filter((r) => r && r !== BASE && r !== REMOTE && !r.endsWith("/HEAD"));
  if (!refs.length) throw new Error(`Nenhuma branch remota em refs/remotes/${REMOTE}: rode git fetch --all ou use --so-documentos.`);

  for (const ref of refs) {
    const contagem = tenta("rev-list", "--count", `${BASE}..${ref}`);
    const frente = contagem === null ? null : Number(contagem);
    let arquivos = [];
    if (frente) {
      const nameStatus = tenta("diff", "--name-status", "-M", `${BASE}...${ref}`);
      if (nameStatus === null) arquivos = [{ status: "?", caminho: "(diff falhou)", erro: true }];
      else
        arquivos = lerNameStatus(nameStatus).map((e) => ({
          ...e,
          noRef: e.status === "D" ? null : tenta("rev-parse", `${ref}:${e.caminho}`),
          naMain: tenta("rev-parse", `${BASE}:${e.caminho}`),
        }));
    }
    const r = classificarBranch({ frente, arquivos });
    linhas.push([ref, frente ?? "erro", arquivos.length, r.soDocumentacao, r.iguais, r.divergem, r.ausentes, r.removidos, r.erros, r.veredito]);
  }
  writeFileSync("docs/triagem/triagem-branches.csv", csv(linhas));
}

const pend = [["arquivo", "linha", "marcador", "texto"]];
function varrer(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) {
      if (!p.includes("triagem")) varrer(p);
      continue;
    }
    if (!/\.(md|mdx)$/.test(n)) continue;
    readFileSync(p, "utf8")
      .split("\n")
      .forEach((t, i) => {
        const m = marcadorDaLinha(t);
        if (m) pend.push([p, i + 1, m, t.trim().slice(0, 200)]);
      });
  }
}
varrer("docs");
writeFileSync("docs/triagem/pendencias-em-documentos.csv", csv(pend));

const contagem = Object.fromEntries(VEREDITOS.map((v) => [v, linhas.filter((l) => l[9] === v).length]));
console.log(JSON.stringify({ branches: SO_DOCUMENTOS ? "não lidas (--so-documentos)" : linhas.length - 1, ...contagem, pendencias_em_docs: pend.length - 1 }));
