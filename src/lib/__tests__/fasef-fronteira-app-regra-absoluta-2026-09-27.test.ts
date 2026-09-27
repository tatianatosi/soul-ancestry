import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Fase F (27/09/2026) — "REGRA ABSOLUTA" do diretório A-F: o App nunca lê
 * Lead, contrato/snapshot, condição comercial, proposta interna, Canva,
 * hipótese, evidência interna, auditoria nem os motores do Desk. Complementa
 * `app-fronteira-pessoa-unificada-2026-09-24.test.ts` (pessoa/núcleo/perfil)
 * com o restante da regra, pelo mesmo percurso transitivo de imports a
 * partir de `src/routes/portal/**`.
 */

function arquivosDe(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivosDe(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}
function resolver(e: string): string | null {
  if (!e.startsWith("@/")) return null;
  const base = join("src", e.slice(2));
  for (const c of [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) if (existsSync(c)) return c;
  return null;
}
const importsDe = (a: string) =>
  [...readFileSync(a, "utf8").matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g)].map((m) => m[1]!);

const ROTAS_APP = arquivosDe("src/routes/portal");
const alcancados = new Map<string, string[]>();
{
  const fila = [...ROTAS_APP];
  while (fila.length) {
    const a = fila.shift()!;
    if (alcancados.has(a) || a.includes("src/integrations/supabase/types")) continue;
    const imps = importsDe(a);
    alcancados.set(a, imps);
    for (const i of imps) {
      const r = resolver(i);
      if (r && !alcancados.has(r)) fila.push(r);
    }
  }
}

const TABELAS_PROIBIDAS = [
  "leads",
  "contract_parties",
  "contracts",
  "contract_case_parameters",
  "contract_parameter_values",
  "contract_review_events",
  "case_services",
  "commercial_conditions",
  "product_catalog",
  "proposals",
  "proposal_canva_pages",
  "research_case_hypotheses",
  "research_hypotheses",
  "research_evidence_items",
  "owner_override_events",
];

const MODULOS_PROIBIDOS = [
  "@/lib/handoff-discovery",
  "@/lib/handoff-discovery.functions",
  "@/lib/contratos.functions",
  "@/lib/contratos.server",
  "@/lib/contrato-preparar.functions",
  "@/lib/contrato-parametros.functions",
  "@/lib/contrato-parametros.server",
  "@/lib/resgate-contrato-planejador",
  "@/lib/conciliacao-catalogo",
  "@/lib/conciliacao-catalogo.server",
  "@/lib/crm-desk.functions",
  "@/lib/pesquisa-modulo.functions",
  "@/lib/varredura-whatsapp",
];

/*
 * `portal.functions.ts` reúne, no mesmo módulo, os leitores do App e as
 * funções internas de gestão de acesso (seção "ÁREA INTERNA", guardadas por
 * `organizacaoDo` — só membro de organização passa; cliente do portal não).
 * Única exceção permitida: fontes internas só depois do marcador, e o App
 * nunca importa nenhuma função dessa seção.
 */
const MODULO_MISTO = "src/lib/portal.functions.ts";
const MARCADOR_INTERNO = "ÁREA INTERNA: CLIENTES > ACESSOS AO PORTAL";

describe("Fase F — App nunca lê as fontes internas da REGRA ABSOLUTA", () => {
  it("o percurso parte das rotas reais do portal", () => {
    expect(ROTAS_APP.length).toBeGreaterThanOrEqual(7);
    expect(alcancados.has(MODULO_MISTO)).toBe(true);
  });

  it("nenhum módulo alcançado lê Lead, contrato, comercial, proposta, Canva, hipótese ou evidência interna", () => {
    const achados: string[] = [];
    for (const arquivo of alcancados.keys()) {
      let src = readFileSync(arquivo, "utf8");
      if (arquivo === MODULO_MISTO) src = src.slice(0, src.indexOf(MARCADOR_INTERNO));
      for (const t of TABELAS_PROIBIDAS) if (src.includes(`.from("${t}")`)) achados.push(`${arquivo} → ${t}`);
    }
    expect(achados).toEqual([]);
  });

  it("nenhum módulo alcançado importa os motores de Lead, contrato, catálogo ou pesquisa do Desk", () => {
    const achados: string[] = [];
    for (const [arquivo, imps] of alcancados) for (const i of imps) if (MODULOS_PROIBIDOS.includes(i)) achados.push(`${arquivo} → ${i}`);
    expect(achados).toEqual([]);
  });

  it("as funções internas de portal.functions.ts exigem organização e nenhuma tela do App as importa", () => {
    const src = readFileSync(MODULO_MISTO, "utf8");
    const interno = src.slice(src.indexOf(MARCADOR_INTERNO));
    const nomes = [...interno.matchAll(/export const (\w+) = createServerFn/g)].map((m) => m[1]!);
    expect(nomes).toContain("listarAcessosPortal");
    expect(interno).toContain("organizacaoDo(");
    const telas = [...ROTAS_APP, ...arquivosDe("src/components/portal")];
    const achados: string[] = [];
    for (const t of telas) {
      const s = readFileSync(t, "utf8");
      for (const n of nomes) if (new RegExp(`\\b${n}\\b`).test(s)) achados.push(`${t} → ${n}`);
    }
    expect(achados).toEqual([]);
  });

  it("auditoria no caminho do App é só escrita (insert), nunca leitura exibida", () => {
    for (const arquivo of alcancados.keys()) {
      const src = readFileSync(arquivo, "utf8");
      for (const m of src.matchAll(/\.from\("audit_logs"\)\s*\.(\w+)/g)) expect(`${arquivo}:${m[1]}`).toBe(`${arquivo}:insert`);
    }
  });
});

describe("Fase F — telas do App não citam termos internos da REGRA ABSOLUTA", () => {
  const telas = [...ROTAS_APP, ...arquivosDe("src/components/portal").filter((f) => !f.endsWith("atendimento-interno.tsx"))];
  it.each([/\bSKU\b/, /product_catalog/, /contract_parties/, /\bspin_/, /score_triagem|triagem_score/, /hipotese_interna|internal_hypothesis/])(
    "nenhuma tela do portal referencia %s",
    (padrao) => {
      expect(telas.filter((f) => padrao.test(readFileSync(f, "utf8")))).toEqual([]);
    },
  );
});

/*
 * App de boas-vindas (segunda metade do Resgate Ana, 27/09/2026): caso sem
 * publicação mostra, em cada uma das 7 abas canônicas, um estado vazio
 * próprio e acolhedor — nunca ID, nunca promessa de data.
 */
import { COPY_TELAS } from "@/lib/portal-copy";

describe("App de boas-vindas — estado vazio próprio nas 7 abas", () => {
  const ABAS = ["home", "jornada", "radar", "arvore", "documentos", "legado", "conta"] as const;

  it("cada aba canônica tem texto vazio próprio e distinto", () => {
    const textos = ABAS.map((a) => (COPY_TELAS as Record<string, { vazio: string }>)[a]?.vazio ?? "");
    for (const t of textos) expect(t.trim().length).toBeGreaterThan(20);
    expect(new Set(textos).size).toBe(ABAS.length);
  });

  it("nenhum texto vazio expõe identificador técnico nem promete data", () => {
    for (const a of ABAS) {
      const t = (COPY_TELAS as Record<string, { vazio: string }>)[a]!.vazio;
      expect(t).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}|CA-[A-Z]{3}-|\bid\b|\d{1,2}\/\d{1,2}/i);
    }
  });

  it("a Home de um caso novo abre com 'Uma história em construção'", () => {
    expect(readFileSync("src/routes/portal/index.tsx", "utf8")).toContain("Uma história em construção");
  });
});
