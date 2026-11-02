#!/usr/bin/env node
// Reconcilia o código com o esquema do banco (somente leitura).
// Fonte do esquema: src/integrations/supabase/types.ts (gerado a partir do banco).
// Procura, em src/, toda consulta `.from("tabela")` e confere: tabela existe, colunas de select/filtro/escrita existem,
// e `.rpc("funcao")` existe. É o tipo de erro que a auditoria de 25/10 achou à mão ("a consulta falhava em silêncio").
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.argv[2] ?? ".";
const SRC = join(RAIZ, "src");
const tipos = readFileSync(join(SRC, "integrations/supabase/types.ts"), "utf8");

// --- esquema: Tables, Views, Functions ---
function bloco(texto, abre) {
  const i = texto.indexOf(abre);
  if (i < 0) return "";
  let d = 0, j = texto.indexOf("{", i);
  const ini = j;
  for (; j < texto.length; j++) {
    if (texto[j] === "{") d++;
    else if (texto[j] === "}") { d--; if (d === 0) break; }
  }
  return texto.slice(ini + 1, j);
}
function tabelasDe(secao) {
  const out = new Map();
  let i = 0;
  while (i < secao.length) {
    const m = /\n {6}([a-z_0-9]+): \{\n {8}Row: \{/.exec(secao.slice(i));
    if (!m) break;
    const nome = m[1];
    const inicio = i + m.index + m[0].length;
    let d = 1, j = inicio;
    for (; j < secao.length && d > 0; j++) {
      if (secao[j] === "{") d++;
      else if (secao[j] === "}") d--;
    }
    const row = secao.slice(inicio, j - 1);
    const cols = new Set([...row.matchAll(/\n {10}([a-z_0-9]+)\??:/g)].map((x) => x[1]));
    out.set(nome, cols);
    i = j;
  }
  return out;
}
const publico = bloco(tipos, "public: {");
const tabelas = tabelasDe(bloco(publico, "Tables: {"));
const views = tabelasDe(bloco(publico, "Views: {"));
const todas = new Map([...tabelas, ...views]);
const funcoes = new Set([...bloco(publico, "Functions: {").matchAll(/\n {6}([a-z_0-9]+): \{/g)].map((x) => x[1]));

function varrer(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (n !== "__tests__" && n !== "node_modules") varrer(p, acc); }
    else if (/\.(ts|tsx)$/.test(n) && !n.endsWith(".d.ts") && !n.endsWith(".test.ts") && !n.endsWith(".test.tsx") && n !== "types.ts") acc.push(p);
  }
  return acc;
}

const achados = [];
const linhaDe = (s, pos) => s.slice(0, pos).split("\n").length;
const ident = /^[a-z_][a-z_0-9]*$/;

for (const arq of varrer(SRC)) {
  const s = readFileSync(arq, "utf8");
  const rel = relative(RAIZ, arq).split("\\").join("/");
  for (const m of s.matchAll(/\.rpc\(\s*["']([a-z_0-9]+)["']/g)) {
    if (!funcoes.has(m[1])) achados.push({ tipo: "rpc_inexistente", arq: rel, linha: linhaDe(s, m.index), detalhe: m[1] });
  }
  for (const m of s.matchAll(/\.from\(\s*["']([a-z_0-9]+)["']\s*\)/g)) {
    const t = m[1];
    const linha = linhaDe(s, m.index);
    // `supabase.storage.from("bucket")` é arquivo, não tabela
    if (/storage\s*$/.test(s.slice(Math.max(0, m.index - 24), m.index))) continue;
    if (!todas.has(t)) {
      if (!/^(storage|objects|buckets)$/.test(t)) achados.push({ tipo: "tabela_inexistente", arq: rel, linha, detalhe: t });
      continue;
    }
    const cols = todas.get(t);
    // trecho da cadeia: até o fim da instrução
    let fim = s.indexOf(";", m.index);
    if (fim < 0 || fim - m.index > 1800) fim = m.index + 1800;
    // pára na próxima consulta (outro `.from(`): evita atribuir à tabela errada as colunas da seguinte
    const proxima = s.indexOf(".from(", m.index + m[0].length);
    if (proxima > 0 && proxima < fim) fim = proxima;
    const cadeia = s.slice(m.index, fim);
    const checa = (col, onde) => {
      if (!col || col === "*" || !ident.test(col)) return;
      if (!cols.has(col)) achados.push({ tipo: "coluna_inexistente", arq: rel, linha, detalhe: `${t}.${col} (${onde})` });
    };
    // select("a, b, c") só com identificadores simples no nível 0
    for (const sel of cadeia.matchAll(/\.select\(\s*(["'`])([^"'`]*)\1/g)) {
      let prof = 0, atual = "", partes = [];
      for (const ch of sel[2]) {
        if (ch === "(") prof++;
        if (ch === ")") prof--;
        if (ch === "," && prof === 0) { partes.push(atual); atual = ""; } else atual += ch;
      }
      partes.push(atual);
      for (const p of partes) {
        const c = p.trim();
        if (!c || c.includes("(") || c.includes(":") || c.includes("!") || c.includes("->") || c.includes(" ")) continue;
        checa(c, "select");
      }
    }
    for (const f of cadeia.matchAll(/\.(eq|neq|gt|gte|lt|lte|is|in|like|ilike|contains|not)\(\s*["']([a-z_0-9]+)["']/g)) checa(f[2], `filtro ${f[1]}`);
    for (const o of cadeia.matchAll(/\.order\(\s*["']([a-z_0-9]+)["']/g)) checa(o[1], "order");
    // escrita: objeto literal logo após update/insert/upsert
    for (const w of cadeia.matchAll(/\.(update|insert|upsert)\(\s*\{/g)) {
      const ini = w.index + w[0].length;
      let d = 1, j = ini;
      for (; j < cadeia.length && d > 0; j++) {
        if (cadeia[j] === "{" || cadeia[j] === "[" || cadeia[j] === "(") d++;
        else if (cadeia[j] === "}" || cadeia[j] === "]" || cadeia[j] === ")") d--;
      }
      const corpo = cadeia.slice(ini, j - 1);
      // chaves de nível 0
      let prof = 0, tok = "", linhaTok = [];
      const topo = [];
      for (const ch of corpo) {
        if ("{[(".includes(ch)) prof++;
        if ("}])".includes(ch)) prof--;
        if (ch === "," && prof === 0) { topo.push(tok); tok = ""; } else tok += ch;
      }
      topo.push(tok);
      for (const item of topo) {
        const it = item.trim();
        if (!it || it.startsWith("...")) continue;
        const k = /^([a-z_][a-z_0-9]*)\s*(:|$)/.exec(it)?.[1];
        if (k) checa(k, w[1]);
      }
    }
  }
}

// Falsos positivos conhecidos e conferidos à mão: o filtro pertence à consulta seguinte, feita pelo auxiliar
// `org("tabela")` (que não começa com `.from(`), e não à tabela da consulta atual. Chave: arquivo|tabela.coluna.
const FALSOS_POSITIVOS = new Set([
  "src/lib/pessoas-linhagens.functions.ts|name_variants.case_id (filtro eq)",
  "src/lib/pessoas-linhagens.functions.ts|name_variants.start_date (order)",
  "src/lib/achados-genealogicos.functions.ts|research_sources.case_id (filtro eq)",
  "src/lib/pessoas-linhagens.functions.ts|research_sources.case_id (filtro eq)",
]);
for (let i = achados.length - 1; i >= 0; i--) {
  if (FALSOS_POSITIVOS.has(`${achados[i].arq}|${achados[i].detalhe}`)) achados.splice(i, 1);
}

// agrupa
const grupos = new Map();
for (const a of achados) {
  const k = `${a.tipo}|${a.detalhe}`;
  if (!grupos.has(k)) grupos.set(k, { ...a, ocorrencias: [] });
  grupos.get(k).ocorrencias.push(`${a.arq}:${a.linha}`);
}
const lista = [...grupos.values()].sort((a, b) => a.tipo.localeCompare(b.tipo) || a.detalhe.localeCompare(b.detalhe));
if (!process.argv.includes("--sem-gravar")) {
  writeFileSync(join(RAIZ, "docs/grafo/reconciliacao-codigo-banco.json"), JSON.stringify({ tabelas: tabelas.size, views: views.size, funcoes: funcoes.size, achados: lista }, null, 1));
}
console.log(JSON.stringify({ tabelas: tabelas.size, views: views.size, funcoes: funcoes.size, achados_unicos: lista.length, total_ocorrencias: achados.length }));
for (const g of lista) console.log(`${g.tipo.padEnd(19)} ${g.detalhe.padEnd(58)} x${g.ocorrencias.length}  ${g.ocorrencias.slice(0, 2).join(", ")}`);
