#!/usr/bin/env node
// Reconcilia o VOCABULÁRIO e os CAMPOS OBRIGATÓRIOS que o código grava com o que o banco aceita.
// Complementa scripts/reconciliar-codigo-banco.mjs (que só confere existência de tabela/coluna).
// Somente leitura. Fontes: supabase/migrations/*.sql (CHECK ... IN/ANY) e src/integrations/supabase/types.ts (Insert).
// Uso:  node scripts/reconciliar-vocabulario-banco.mjs [raiz] [--informativo] [--json]
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, dirname } from "node:path";

const args = process.argv.slice(2);
const RAIZ = args.find((a) => !a.startsWith("--")) ?? ".";
const INFORMATIVO = args.includes("--informativo");
const SRC = join(RAIZ, "src");

function listar(dir, ext, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (n !== "node_modules" && n !== "__tests__") listar(p, ext, acc); }
    else if (ext.test(n)) acc.push(p);
  }
  return acc;
}

// ---------- 1) CHECKs de vocabulário a partir das migrations ----------
const vocab = new Map(); // "tabela.coluna" -> { valores:Set, origem }
const sqls = [...listar(join(RAIZ, "supabase/migrations"), /\.sql$/), ...listar(join(RAIZ, "drizzle/migrations"), /\.sql$/)].sort();
const reTabela = /(?:create\s+table\s+(?:if\s+not\s+exists\s+)?|alter\s+table\s+(?:only\s+)?(?:if\s+exists\s+)?)(?:public\.)?"?([a-z_0-9]+)"?/i;
const reCheckInline = /([a-z_0-9]+)\s*(?:::\s*text\s*)?(?:=\s*any\s*\(\s*\(?\s*array\s*\[([^\]]+)\]|in\s*\(([^)]+)\))/gi;
for (const arq of sqls) {
  const txt = readFileSync(arq, "utf8").replace(/--[^\n]*/g, "");
  for (const stmt of txt.split(/;\s*\n/)) {
    const t = reTabela.exec(stmt)?.[1];
    if (!t || !/check/i.test(stmt)) continue;
    for (const c of stmt.matchAll(/check\s*\(/gi)) {
      let d = 1, j = c.index + c[0].length;
      for (; j < stmt.length && d > 0; j++) { if (stmt[j] === "(") d++; else if (stmt[j] === ")") d--; }
      const corpo = stmt.slice(c.index + c[0].length, j - 1);
      for (const m of corpo.matchAll(reCheckInline)) {
        const col = m[1].toLowerCase();
        if (["array", "any", "and", "or", "not", "null"].includes(col)) continue;
        const valores = new Set([...(m[2] ?? m[3] ?? "").matchAll(/'([^']*)'/g)].map((x) => x[1]));
        if (valores.size) vocab.set(`${t}.${col}`, { valores, origem: relative(RAIZ, arq).split("\\").join("/") });
      }
    }
  }
}

// ---------- 2) Colunas obrigatórias (Insert sem "?") a partir de types.ts ----------
const obrigatorias = new Map(); // tabela -> Set(colunas)
const tiposArq = join(SRC, "integrations/supabase/types.ts");
if (existsSync(tiposArq)) {
  const ts = readFileSync(tiposArq, "utf8");
  const reIns = /\n {6}([a-z_0-9]+): \{\n {8}Row: \{[\s\S]*?\n {8}Insert: \{([\s\S]*?)\n {8}\}/g;
  for (const m of ts.matchAll(reIns)) {
    const req = new Set([...m[2].matchAll(/\n {10}([a-z_0-9]+): /g)].map((x) => x[1]));
    obrigatorias.set(m[1], req);
  }
}

// ---------- 3) Escritores no código ----------
const achados = [];
const linhaDe = (s, pos) => s.slice(0, pos).split("\n").length;
function topoDoObjeto(corpo) {
  let prof = 0, tok = "", itens = [];
  let aspas = null;
  for (let i = 0; i < corpo.length; i++) {
    const ch = corpo[i];
    if (aspas) { tok += ch; if (ch === aspas && corpo[i - 1] !== "\\") aspas = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { aspas = ch; tok += ch; continue; }
    if ("{[(".includes(ch)) prof++;
    if ("}])".includes(ch)) prof--;
    if (ch === "," && prof === 0) { itens.push(tok); tok = ""; } else tok += ch;
  }
  itens.push(tok);
  return itens.map((x) => x.trim()).filter(Boolean);
}
for (const arq of listar(SRC, /\.(ts|tsx)$/)) {
  if (/\.(test|d)\.tsx?$/.test(arq) || arq.endsWith("types.ts")) continue;
  const s = readFileSync(arq, "utf8");
  const rel = relative(RAIZ, arq).split("\\").join("/");
  for (const m of s.matchAll(/\.from\(\s*["']([a-z_0-9]+)["']\s*\)/g)) {
    const t = m[1];
    if (/storage\s*$/.test(s.slice(Math.max(0, m.index - 24), m.index))) continue;
    let fim = s.indexOf(";", m.index);
    if (fim < 0 || fim - m.index > 2500) fim = m.index + 2500;
    const prox = s.indexOf(".from(", m.index + m[0].length);
    if (prox > 0 && prox < fim) fim = prox;
    const cadeia = s.slice(m.index, fim);
    for (const w of cadeia.matchAll(/\.(update|insert|upsert)\(\s*\{/g)) {
      const ini = w.index + w[0].length;
      let d = 1, j = ini;
      for (; j < cadeia.length && d > 0; j++) { if ("{[(".includes(cadeia[j])) d++; else if ("}])".includes(cadeia[j])) d--; }
      const itens = topoDoObjeto(cadeia.slice(ini, j - 1));
      const chaves = new Set();
      let temSpread = false;
      const linha = linhaDe(s, m.index + w.index);
      for (const it of itens) {
        if (it.startsWith("...")) { temSpread = true; continue; }
        const mm = /^([a-z_][a-z_0-9]*)\s*(?::\s*([\s\S]*))?$/.exec(it);
        if (!mm) continue;
        const col = mm[1];
        chaves.add(col);
        const lit = /^(["'])([^"'\\]*)\1$/.exec((mm[2] ?? "").trim());
        const v = vocab.get(`${t}.${col}`);
        if (lit && v && !v.valores.has(lit[2])) {
          achados.push({ tipo: "valor_fora_do_CHECK", arq: rel, linha, detalhe: `${t}.${col} = "${lit[2]}"`, aceitos: [...v.valores].join(" | "), origem: v.origem });
        }
      }
      if (w[1] === "insert" && !temSpread && obrigatorias.has(t)) {
        const faltam = [...obrigatorias.get(t)].filter((c) => !chaves.has(c));
        if (faltam.length) achados.push({ tipo: "insert_sem_coluna_obrigatoria", arq: rel, linha, detalhe: `${t}: falta ${faltam.join(", ")}`, aceitos: "", origem: "types.ts Insert" });
      }
    }
  }
}

const saida = { checks_lidos: vocab.size, tabelas_com_insert_tipado: obrigatorias.size, achados };
if (args.includes("--json")) console.log(JSON.stringify(saida, null, 1));
else {
  console.log(`CHECKs lidos: ${vocab.size} · tabelas com Insert tipado: ${obrigatorias.size} · achados: ${achados.length}`);
  for (const a of achados) console.log(`${a.tipo.padEnd(30)} ${a.arq}:${a.linha}  ${a.detalhe}${a.aceitos ? `  [aceitos: ${a.aceitos}]` : ""}`);
}
const dest = join(RAIZ, "docs/grafo/reconciliacao-vocabulario-banco.json");
mkdirSync(dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(saida, null, 1));
process.exit(achados.length && !INFORMATIVO ? 1 : 0);
