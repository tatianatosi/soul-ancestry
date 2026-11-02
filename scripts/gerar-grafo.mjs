#!/usr/bin/env node
// Gera o grafo de dependências de src/ (somente leitura do código).
// Saídas: docs/grafo/grafo-codigo.json, grafo-dominios.mmd, orfaos-sem-importador.txt
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, relative, dirname, resolve } from "node:path";

const RAIZ = resolve(process.argv[2] ?? ".");
const SRC = join(RAIZ, "src");
const SAIDA = join(RAIZ, "docs", "grafo");
const EXT = [".ts", ".tsx"];

function varrer(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) varrer(p, acc);
    else if (EXT.some((e) => n.endsWith(e)) && !n.endsWith(".d.ts")) acc.push(p);
  }
  return acc;
}
const arquivos = varrer(SRC);
const rel = (p) => relative(RAIZ, p).split("\\").join("/");
const conjunto = new Set(arquivos.map(rel));
const ehTeste = (f) => /__tests__|\.test\.tsx?$/.test(f);

function resolver(de, alvo) {
  let base;
  if (alvo.startsWith("@/")) base = join(SRC, alvo.slice(2));
  else if (alvo.startsWith(".")) base = resolve(dirname(join(RAIZ, de)), alvo);
  else return null;
  const r = rel(base);
  for (const c of [r, ...EXT.map((e) => r + e), ...EXT.map((e) => r + "/index" + e)])
    if (conjunto.has(c)) return c;
  return null;
}
const RE = /(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|import\s*['"]([^'"]+)['"]|import\(\s*['"]([^'"]+)['"]\s*\)/g;

const arestas = [];
const entrada = new Map();
for (const f of conjunto) entrada.set(f, { prod: 0, teste: 0 });
for (const f of conjunto) {
  const txt = readFileSync(join(RAIZ, f), "utf8");
  for (const m of txt.matchAll(RE)) {
    const alvo = resolver(f, m[1] ?? m[2] ?? m[3]);
    if (!alvo || alvo === f) continue;
    arestas.push([f, alvo]);
    entrada.get(alvo)[ehTeste(f) ? "teste" : "prod"]++;
  }
}

const dominio = (f) => {
  const p = f.split("/");
  if (p[1] === "routes") return p[2]?.startsWith("_authenticated") ? "routes/desk" : p[2] === "portal" ? "routes/portal" : "routes/outras";
  if (p[1] === "components") return p.length > 3 ? `components/${p[2]}` : "components/(raiz)";
  return `${p[1]}`;
};
const nos = [...conjunto].map((f) => ({ id: f, dominio: dominio(f), teste: ehTeste(f), importadoresProd: entrada.get(f).prod, importadoresTeste: entrada.get(f).teste }));

const DOM = new Map();
for (const [a, b] of arestas) {
  if (ehTeste(a)) continue;
  const k = `${dominio(a)}|${dominio(b)}`;
  if (dominio(a) !== dominio(b)) DOM.set(k, (DOM.get(k) ?? 0) + 1);
}
const ARQ = (f) => /(^src\/routes\/|routeTree\.gen|router\.tsx|server\.ts|start\.ts|\.functions\.ts$|^src\/integrations\/)/.test(f);
const orfaos = nos.filter((n) => !n.teste && n.importadoresProd === 0 && !ARQ(n.id) && !n.id.startsWith("src/components/ui/")).map((n) => n.id).sort();

const id = (d) => d.replace(/[^a-z0-9]/gi, "_");
const mmd = ["graph LR", ...[...DOM].filter(([, c]) => c >= 3).map(([k, c]) => { const [a, b] = k.split("|"); return `  ${id(a)}["${a}"] -->|${c}| ${id(b)}["${b}"]`; })];

mkdirSync(SAIDA, { recursive: true });
writeFileSync(join(SAIDA, "grafo-codigo.json"), JSON.stringify({ gerado_em: new Date().toISOString(), arquivos: nos.length, arestas: arestas.length, nos, arestas }, null, 0));
writeFileSync(join(SAIDA, "grafo-dominios.mmd"), mmd.join("\n") + "\n");
writeFileSync(join(SAIDA, "orfaos-sem-importador.txt"), orfaos.join("\n") + "\n");
console.log(JSON.stringify({ arquivos: nos.length, arestas: arestas.length, dominios: new Set(nos.map((n) => n.dominio)).size, orfaos_sem_importador_prod: orfaos.length }));
