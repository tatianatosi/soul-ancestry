#!/usr/bin/env node
// Classifica cada arquivo de src/ (real × fictício × gerado × teste …) e cruza os órfãos
// com src/lib/orfaos-modulos-classificados.ts. Somente leitura. Saída em docs/grafo/.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const RAIZ = process.argv[2] ?? ".";
const g = JSON.parse(readFileSync(join(RAIZ, "docs/grafo/grafo-codigo.json"), "utf8"));
const REAL = /Ana Luiza|Adair|Alice Pinto|Friedmann|Reimer|CA-CID-AT-FAM-2026-001|Felipe/;
const FICT = /Giovanna|Sophia|Maria da Silva|João da Silva|lorem ipsum/i;
const DATA_FICT = new Set(["case-registry","case-directory","caseDataGiovanna","casos","client-one-page","relatorio-visual","relatorio-fase02","activeCase","caseDataSophia","caso-sophia","entrega-consultiva","studio-devolutivas","caseTemplate","propostas","catalogo-fonte-mestre","saneamento"]);
const lerReg = (f) => { try { return readFileSync(join(RAIZ, f), "utf8"); } catch { return ""; } };
const classe = (id, txt) => {
  if (/routeTree\.gen|integrations\/supabase\/types/.test(id)) return "gerado";
  if (g.nos.find((n) => n.id === id).teste) return "teste";
  if (id.startsWith("src/components/ui/")) return "biblioteca_ui";
  const base = id.split("/").pop().replace(/\.tsx?$/, "");
  if (id.startsWith("src/data/") && DATA_FICT.has(base)) return "ficticio_demo_modelo_seed";
  const r = REAL.test(txt), f = FICT.test(txt);
  if (r) return "producao_com_dado_real_fixo";
  if (f) return "producao_com_dado_ficticio_fixo";
  if (/createServerFn|supabase|\.from\(|useQuery|\.functions"/.test(txt)) return "producao_viva_banco";
  return "producao_logica_ou_ui";
};
const cont = {}, porDom = {}, linhas = [["arquivo","dominio","classe","importadores_prod","importadores_teste"]];
for (const n of g.nos) {
  const txt = readFileSync(join(RAIZ, n.id), "utf8");
  const c = classe(n.id, txt);
  cont[c] = (cont[c] ?? 0) + 1;
  (porDom[n.dominio] ??= {})[c] = (porDom[n.dominio][c] ?? 0) + 1;
  linhas.push([n.id, n.dominio, c, n.importadoresProd, n.importadoresTeste]);
}
writeFileSync(join(RAIZ, "docs/grafo/classificacao-arquivos.csv"), linhas.map((l) => l.join(",")).join("\n") + "\n");
// Órfãos × registro
const reg = lerReg("src/lib/orfaos-modulos-classificados.ts") + lerReg("src/lib/orfaos-classificados.ts");
const orf = readFileSync(join(RAIZ, "docs/grafo/orfaos-sem-importador.txt"), "utf8").trim().split("\n");
const blocos = [...lerReg("src/lib/orfaos-modulos-classificados.ts").matchAll(/modulo:\s*"([^"]+)",\s*veredicto:\s*"([^"]+)"[\s\S]*?(?=\n  \{|\n\];)/g)];
const info = new Map(blocos.map((m) => [m[1], { v: m[2], risco: /riscoVazamento:\s*true/.test(m[0]), dec: /Decisão:/.test(m[0]) }]));
const saida = orf.map((f) => {
  const k = f.replace(/^src\//, ""); const i = info.get(k);
  const n = g.nos.find((x) => x.id === f);
  return { arquivo: f, dominio: n.dominio, veredicto: i?.v ?? "SEM_VEREDITO", risco_vazamento: !!i?.risco, aguarda_decisao: !!i?.dec, linhas: readFileSync(join(RAIZ, f), "utf8").split("\n").length, importadores_teste: n.importadoresTeste, classe: linhas.find((l) => l[0] === f)[2] };
});
writeFileSync(join(RAIZ, "docs/grafo/orfaos-priorizados.json"), JSON.stringify(saida, null, 1));
console.log(JSON.stringify({ cont, dominios: Object.keys(porDom).length }, null, 1));
console.table(Object.entries(porDom).map(([d, o]) => ({ d, total: Object.values(o).reduce((a, b) => a + b, 0), ...o })).sort((a, b) => b.total - a.total).slice(0, 45));
const vc = {}; for (const s of saida) vc[`${s.veredicto}${s.risco_vazamento ? "+RISCO" : ""}`] = (vc[`${s.veredicto}${s.risco_vazamento ? "+RISCO" : ""}`] ?? 0) + 1;
console.log(vc);
