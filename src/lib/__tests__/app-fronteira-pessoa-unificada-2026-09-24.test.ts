import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Fronteira do App Cliente para os vínculos novos (24/09/2026): CPF do
 * membro × cadastro canônico, núcleo e dossiê-mãe, inventário documental
 * da pessoa, perfil genealógico vinculado, micro-entrega interna (D7) e
 * alertas internos. Parte de cada rota de `src/routes/portal/` e segue,
 * transitivamente, todo módulo `@/…` que ela importa: nada nesse caminho
 * pode ler essas fontes nem importar os módulos do Desk que as expõem.
 */

function arquivosDe(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivosDe(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}

function resolver(especificador: string): string | null {
  if (!especificador.startsWith("@/")) return null;
  const base = join("src", especificador.slice(2));
  for (const c of [`${base}.ts`, `${base}.tsx`, join(base, "index.ts"), join(base, "index.tsx")]) {
    if (existsSync(c)) return c;
  }
  return null;
}

function importsDe(arquivo: string): string[] {
  const src = readFileSync(arquivo, "utf8");
  const saida: string[] = [];
  for (const m of src.matchAll(/(?:from\s+|import\s*\(\s*)["']([^"']+)["']/g)) saida.push(m[1]!);
  return saida;
}

const ROTAS_APP = arquivosDe("src/routes/portal");

/** Fecho transitivo dos módulos alcançados pelas rotas do App. */
const alcancados = new Map<string, string[]>(); // arquivo -> especificadores importados
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
  "case_members",
  "nucleos_familiares",
  "nucleo_membros",
  "genealogical_person_profiles",
  "genealogical_findings",
  "case_source_documents",
  "ops_microentregas",
  "onboarding_planos",
  "onboarding_checklist",
  "case_plans",
  "research_people",
  "evidences",
];

const MODULOS_DESK_PROIBIDOS = [
  "@/lib/pessoa.functions",
  "@/lib/pessoa-vinculo",
  "@/lib/pessoa-identidade",
  "@/lib/nucleos-desk.functions",
  "@/lib/nucleo-completude",
  "@/lib/caso-canonico.functions",
  "@/lib/pessoas-linhagens.functions",
  "@/lib/onboarding-plano",
  "@/lib/onboarding-plano.functions",
  "@/lib/onboarding-jornada.functions",
  "@/lib/gate-onboarding-case-plans",
  "@/lib/achados-genealogicos.functions",
  "@/lib/ops.functions",
];

/*
 * Módulos PUROS que o App alcança e que são permitidos: não leem banco.
 * - onboarding-jornada.ts: o App usa contemConteudoInterno (sanitizador),
 *   diasEntre e saudeDoPlano; o diagnóstico de gates também mora ali, mas
 *   só calcula sobre o que recebe — o App nunca o chama com dado interno.
 * - motores-tabelas.ts: metadado estático, re-exportado por motor-caso.ts
 *   (de onde o App usa projetarProximaAcaoCliente, já sanitizada).
 * Se algum deles passar a ler banco, este teste quebra.
 */
const MODULOS_PUROS_PERMITIDOS = ["src/lib/onboarding-jornada.ts", "src/lib/motores-tabelas.ts"];

describe("App Cliente — caminho alcançado pelas rotas do portal", () => {
  it("módulos puros permitidos continuam sem acesso a banco", () => {
    for (const m of MODULOS_PUROS_PERMITIDOS) {
      const src = readFileSync(m, "utf8");
      expect(src, m).not.toMatch(/\.from\(|\.rpc\(|supabase/i);
    }
  });

  it("parte das rotas reais do portal e alcança os módulos de dados do App", () => {
    expect(ROTAS_APP.length).toBeGreaterThanOrEqual(7);
    expect([...alcancados.keys()].some((a) => a.startsWith("src/lib/portal"))).toBe(true);
  });

  it("nenhum módulo alcançado lê as fontes internas dos vínculos novos", () => {
    const achados: string[] = [];
    for (const arquivo of alcancados.keys()) {
      const src = readFileSync(arquivo, "utf8");
      for (const t of TABELAS_PROIBIDAS) {
        if (src.includes(`.from("${t}")`)) achados.push(`${arquivo} → ${t}`);
      }
    }
    expect(achados).toEqual([]);
  });

  it("nenhum módulo alcançado importa os módulos do Desk que expõem esses vínculos", () => {
    const achados: string[] = [];
    for (const [arquivo, imps] of alcancados) {
      for (const i of imps) if (MODULOS_DESK_PROIBIDOS.includes(i)) achados.push(`${arquivo} → ${i}`);
    }
    expect(achados).toEqual([]);
  });

  it("case_alerts no caminho do App só é escrito para a equipe (alertaInternoTicket), nunca exibido", () => {
    for (const arquivo of alcancados.keys()) {
      const src = readFileSync(arquivo, "utf8");
      const usos = src.split('.from("case_alerts")').length - 1;
      if (!usos) continue;
      expect(arquivo).toBe("src/lib/portal-cliente.server.ts");
      const corpo = src.slice(src.indexOf("export async function alertaInternoTicket"));
      expect(corpo.split('.from("case_alerts")').length - 1).toBe(usos);
      expect(corpo).toContain('.select("id")');
    }
  });
});

describe("App Cliente — telas não citam os campos internos", () => {
  const telas = [...ROTAS_APP, ...arquivosDe("src/components/portal").filter((f) => !f.endsWith("atendimento-interno.tsx"))];
  it.each([/\bcpf\b/i, /dossie_mae/, /inventarioDocumental/, /sinalCpf/, /primeiraMicroentregaReal/, /perfisGenealogicos/])(
    "nenhuma tela do portal referencia %s",
    (padrao) => {
      const achados = telas.filter((f) => padrao.test(readFileSync(f, "utf8")));
      expect(achados).toEqual([]);
    },
  );
});

describe("dívida declarada — leitores órfãos de evidencias no portal", () => {
  it("portalCaso e portalDocumentos não são usados por nenhuma tela do App", () => {
    for (const [arquivo, imps] of alcancados) {
      if (!imps.includes("@/lib/portal.functions")) continue;
      expect(readFileSync(arquivo, "utf8"), arquivo).not.toMatch(/\bportal(Caso|Documentos)\b/);
    }
  });
});
