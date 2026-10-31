import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Achado da auditoria de espectro completo (27/10/2026, Frente B): dois
 * mecanismos de visibilidade do App Cliente coexistem.
 *
 * Veredicto (padrão de `classificar-orfao`): CASCA_DUPLICADA.
 * `src/lib/app-cliente-gate.ts` (`telasVisiveis`, `estadoDaTela`,
 * `podeLerConteudo`, `textoEstado`) tem 0 chamadores reais — a decisão de
 * visibilidade de hoje é inteira de `portal-visibilidade.tsx`
 * (`useVisibilidade`/`BlocoVisibilidade`), em 8 rotas. Trocar qual
 * mecanismo decide o que a família vê é risco sem benefício às vésperas de
 * lançamento (exporia conteúdo não aprovado se a troca errar) — não
 * religar. Nada apagado: o módulo continua existindo, documentado aqui.
 *
 * Este teste trava o veredicto: falha se `app-cliente-gate.ts` ganhar
 * chamador fora de teste sem essa decisão ser revisitada, e falha se
 * `portal-visibilidade.tsx` perder os chamadores que hoje o tornam o
 * mecanismo vivo.
 */
function temChamador(nomes: string[], dirs: string[]): boolean {
  const pilha = [...dirs.filter(existsSync)];
  const re = new RegExp(`\\b(${nomes.join("|")})\\b`);
  while (pilha.length) {
    const d = pilha.pop()!;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        pilha.push(p);
        continue;
      }
      if (!/\.tsx?$/.test(e.name) || p.includes("__tests__") || p === "src/lib/app-cliente-gate.ts")
        continue;
      if (re.test(readFileSync(p, "utf8"))) return true;
    }
  }
  return false;
}

describe("app-cliente-gate.ts (CASCA_DUPLICADA de portal-visibilidade.tsx)", () => {
  it("telasVisiveis/estadoDaTela/podeLerConteudo/textoEstado não têm chamador fora de teste", () => {
    const semChamador = !temChamador(
      ["telasVisiveis", "estadoDaTela", "podeLerConteudo", "textoEstado"],
      ["src/routes", "src/components"],
    );
    expect(
      semChamador,
      "app-cliente-gate ganhou chamador — revisite a classificação CASCA_DUPLICADA antes de religar",
    ).toBe(true);
  });

  it("portal-visibilidade.tsx continua sendo o mecanismo vivo (useVisibilidade/BlocoVisibilidade em uso real)", () => {
    expect(temChamador(["useVisibilidade", "BlocoVisibilidade"], ["src/routes"])).toBe(true);
  });
});
