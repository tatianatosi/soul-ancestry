import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ler = (p: string) => readFileSync(p, "utf8");

/**
 * 28/08/2026 — a Ana Luiza estava travada em produção com "Usuário sem
 * organização ativa" mesmo já sem o gap de cache corrigido mais cedo hoje.
 * Causa raiz: um resolvedor de organização (`organizacaoDo`/`orgDoUsuario`/
 * `resolverOrg`/`exigirGestor`/`contextoInterno` e variantes) consultava
 * `organization_members` só com `.is("archived_at", null)`, sem
 * `.eq("user_id", ...)` — em qualquer organização com mais de um membro
 * ativo (qualquer organização real), `.maybeSingle()` não acha exatamente
 * uma linha e o usuário aparece "sem organização", mesmo sendo dono dela.
 * Achado em 10 arquivos, ~50 pontos de chamada. Corrigido na fonte; esta
 * varredura trava para nunca faltar de novo o filtro por usuário.
 */
function consultasOrgMembersSemFiltroDeUsuario(caminho: string): string[] {
  const src = ler(caminho);
  const achados: string[] = [];
  const fromRe = /\.from\(\s*["']organization_members["']\s*\)/g;
  let m: RegExpExecArray | null;
  while ((m = fromRe.exec(src))) {
    // Só nos importam consultas de resolução (select seguido de maybeSingle/single),
    // não insert/update/upsert de vínculo, nem select amplo por organization_id (listagem de equipe).
    const trecho = src.slice(m.index, m.index + 400);
    const ehResolucaoDeOrg = /\.select\(\s*["']organization_id["']\s*\)/.test(trecho);
    if (!ehResolucaoDeOrg) continue;
    const fimRe = /\.(maybeSingle|single)\(\)/;
    const fimMatch = fimRe.exec(trecho);
    const bloco = fimMatch ? trecho.slice(0, fimMatch.index) : trecho;
    if (!bloco.includes('eq("user_id"') && !bloco.includes("eq('user_id'")) {
      achados.push(`${caminho}:${src.slice(0, m.index).split("\n").length}`);
    }
  }
  return achados;
}

describe("Resolução de organização do usuário — sempre filtrada por user_id", () => {
  it("varredura: nenhuma consulta a organization_members resolve org sem filtrar pelo usuário", () => {
    const arquivos = readdirSync("src/lib").filter((f) => f.endsWith(".functions.ts") || f.endsWith(".server.ts"));
    const semFiltro = arquivos.flatMap((f) => consultasOrgMembersSemFiltroDeUsuario(`src/lib/${f}`));
    expect(semFiltro).toEqual([]);
  });

  it("caso-canonico.server.ts: organizacaoDo exige userId e filtra por ele", () => {
    const src = ler("src/lib/caso-canonico.server.ts");
    expect(src).toContain("export async function organizacaoDo(supabase: any, userId: string)");
    const corpo = src.slice(src.indexOf("export async function organizacaoDo"));
    expect(corpo.slice(0, 300)).toContain('eq("user_id", userId)');
  });

  it("caso-canonico.server.ts: todo chamador de organizacaoDo passa o userId da sessão", () => {
    const consumidores = [
      "clientes.functions.ts",
      "onboarding-plano.functions.ts",
      "conversao.functions.ts",
      "piloto-ana.functions.ts",
      "ficha-piloto-genealogica.functions.ts",
      "caso-canonico.functions.ts",
    ];
    for (const arquivo of consumidores) {
      const src = ler(`src/lib/${arquivo}`);
      const chamadas = [...src.matchAll(/organizacaoDo\(supabase(?:,\s*[^)]+)?\)/g)];
      expect(chamadas.length).toBeGreaterThan(0);
      for (const c of chamadas) expect(c[0]).toContain("context.userId");
    }
  });
});
