import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ler = (p: string) => readFileSync(p, "utf8");

/**
 * Varredura completa: toda rota GET autenticada (createServerFn com
 * requireSupabaseAuth) precisa invalidar cache. 28/08/2026 — a Proprietária
 * pediu pra verificar os ~70 arquivos de uma vez, não um a um. Esta trava
 * cobre todo `src/lib/*.functions.ts` daqui pra frente: um handler GET novo
 * sem `semCache()` quebra o teste antes de virar o mesmo bug de novo.
 */
function handlersGetSemCache(caminho: string): string[] {
  const src = ler(caminho);
  const semCacheImportado = src.includes('from "@/lib/no-store"');
  const handlerRe = /\.handler\(async \([^)]*\)\s*=>\s*\{/g;
  const faltando: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = handlerRe.exec(src))) {
    const antes = src.slice(Math.max(0, m.index - 600), m.index);
    const criaMatches = [...antes.matchAll(/createServerFn\(\{\s*method:\s*["'](GET|POST)["']\s*\}\)/g)];
    const ultimaCriacao = criaMatches[criaMatches.length - 1];
    if (!ultimaCriacao || ultimaCriacao[1] !== "GET") continue;
    if (!src.slice(m.index, m.index + 300).includes("semCache()")) faltando.push(caminho);
  }
  if (faltando.length && !semCacheImportado) faltando.push(caminho);
  return faltando;
}

/**
 * 28/08/2026 — a Proprietária reportou "Usuário sem organização ativa" em
 * duas telas diferentes (Ficha Operacional, Caso-piloto Ana) mesmo com dado
 * consistente no banco (organization_members e staff_access conferidos,
 * batendo). Achado: essas rotas GET nunca chamavam `semCache()` — resposta
 * autenticada podia ficar em cache de CDN/navegador e ser reexibida pra
 * sessão errada. `semCache()` existe desde antes, só nunca foi aplicado
 * aqui — mesmo padrão de "implantado uma vez, não replicado" que ela vem
 * apontando a sessão inteira. Trava as duas rotas confirmadas; a varredura
 * mostrou o mesmo gap em ~70 outros arquivos, registrado como pendência
 * maior, não corrigido às cegas aqui.
 */
describe("Cache de rotas autenticadas — GET nunca serve resposta antiga pra sessão nova", () => {
  it("caso-ficha.functions.ts: carregarFichaCaso e listarCasosFicha chamam semCache()", () => {
    const src = ler("src/lib/caso-ficha.functions.ts");
    expect(src).toContain('from "@/lib/no-store"');

    const carregar = src.slice(src.indexOf("export const carregarFichaCaso"), src.indexOf("export const listarCasosFicha"));
    expect(carregar).toContain("semCache();");

    const listar = src.slice(src.indexOf("export const listarCasosFicha"));
    expect(listar).toContain("semCache();");
  });

  it("piloto-ana.functions.ts: carregarPilotoAna chama semCache()", () => {
    const src = ler("src/lib/piloto-ana.functions.ts");
    expect(src).toContain('from "@/lib/no-store"');

    const carregar = src.slice(src.indexOf("export const carregarPilotoAna"), src.indexOf("export const materializarPilotoAna"));
    expect(carregar).toContain("semCache();");
  });

  it("modo-proprietaria.functions.ts: estadoModoProprietaria (o que decide sua autoridade máxima) chama semCache()", () => {
    const src = ler("src/lib/modo-proprietaria.functions.ts");
    expect(src).toContain('from "@/lib/no-store"');

    const estado = src.slice(
      src.indexOf("export const estadoModoProprietaria"),
      src.indexOf("export const registrarDecisaoProprietaria"),
    );
    expect(estado).toContain("semCache();");
  });

  it("varredura: nenhum handler GET em src/lib/*.functions.ts fica sem semCache()", () => {
    const arquivos = readdirSync("src/lib").filter((f) => f.endsWith(".functions.ts") || f.endsWith(".server.ts"));
    const comFalta = arquivos.flatMap((f) => handlersGetSemCache(`src/lib/${f}`));
    expect(comFalta).toEqual([]);
  });
});
