#!/usr/bin/env node
// Triagem somente leitura de branches não mescladas e de pendências escritas em documentos.
// Uso (na raiz do clone):  node scripts/triagem-branches-e-docs.mjs [--remote=origin] [--base=main]
// Saída: docs/triagem/triagem-branches.csv e docs/triagem/pendencias-em-documentos.csv
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const arg = (n, d) => (process.argv.find((a) => a.startsWith(`--${n}=`)) ?? `--${n}=${d}`).split("=")[1];
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

const ehDoc = (p) =>
  /^(docs|\.lovable|\.cursor|reviews|\.cartographer)\//.test(p) ||
  (/\.(md|mdx|txt|csv|json)$/.test(p) && !/^(src|supabase|scripts)\//.test(p));

const refs = git("for-each-ref", "--format=%(refname:short)", `refs/remotes/${REMOTE}`)
  .split("\n")
  .filter((r) => r && r !== BASE && r !== REMOTE && !r.endsWith("/HEAD"));

const linhas = [["branch", "commits_a_frente", "arquivos", "so_documentacao", "iguais_na_main", "divergem", "ausentes_na_main", "veredito"]];
for (const ref of refs) {
  const frente = Number(tenta("rev-list", "--count", `${BASE}..${ref}`) ?? 0);
  if (!frente) {
    linhas.push([ref, 0, 0, "", 0, 0, 0, "JA_NA_MAIN"]);
    continue;
  }
  const arquivos = (tenta("diff", "--name-only", `${BASE}...${ref}`) ?? "").split("\n").filter(Boolean);
  const codigo = arquivos.filter((f) => !ehDoc(f));
  let iguais = 0,
    divergem = 0,
    ausentes = 0;
  for (const f of codigo) {
    const noRef = tenta("rev-parse", `${ref}:${f}`);
    const naMain = tenta("rev-parse", `${BASE}:${f}`);
    if (!noRef) continue; // removido no ref
    if (!naMain) ausentes++;
    else if (naMain === noRef) iguais++;
    else divergem++;
  }
  let veredito;
  if (!codigo.length) veredito = "DOC_SEM_EXECUCAO";
  else if (!divergem && !ausentes) veredito = "ENTREGUE";
  else if (ausentes && !divergem) veredito = "PORTAR_ARQUIVOS_NOVOS";
  else veredito = "PORTAR_OU_SUPERADO_REVISAR";
  linhas.push([ref, frente, arquivos.length, !codigo.length, iguais, divergem, ausentes, veredito]);
}
mkdirSync("docs/triagem", { recursive: true });
const csv = (m) => m.map((l) => l.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n") + "\n";
writeFileSync("docs/triagem/triagem-branches.csv", csv(linhas));

const marcadores = [
  ["PLANEJADO", /\[PLANEJADO\]/],
  ["PENDENTE", /PENDENTE/i],
  ["CHECKBOX_ABERTO", /^\s*[-*] \[ \]/],
  ["PROXIMOS_PASSOS", /Pr[oó]ximos passos/i],
  ["TODO", /\bTODO\b/],
];
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
        const m = marcadores.find(([, r]) => r.test(t));
        if (m) pend.push([p, i + 1, m[0], t.trim().slice(0, 200)]);
      });
  }
}
varrer("docs");
writeFileSync("docs/triagem/pendencias-em-documentos.csv", csv(pend));
const cont = (v) => linhas.filter((l) => l[7] === v).length;
console.log(
  JSON.stringify({
    branches: linhas.length - 1,
    DOC_SEM_EXECUCAO: cont("DOC_SEM_EXECUCAO"),
    ENTREGUE: cont("ENTREGUE"),
    JA_NA_MAIN: cont("JA_NA_MAIN"),
    PORTAR_ARQUIVOS_NOVOS: cont("PORTAR_ARQUIVOS_NOVOS"),
    PORTAR_OU_SUPERADO_REVISAR: cont("PORTAR_OU_SUPERADO_REVISAR"),
    pendencias_em_docs: pend.length - 1,
  }),
);
