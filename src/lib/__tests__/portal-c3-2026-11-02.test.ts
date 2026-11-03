import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * C3 (02/11/2026) — erro de leitura nunca vira "vazio / sem permissão".
 * Teste de código-fonte: as rotas de portal são code-split e as funções de
 * servidor dependem de middleware; o contrato é "o erro é lido e lançado".
 */
const ler = (p: string) => readFileSync(p, "utf8");
function corpo(fonte: string, marcador: string, tamanho = 9000): string {
  const i = fonte.indexOf(marcador);
  expect(i, `marcador ausente: ${marcador}`).toBeGreaterThan(-1);
  return fonte.slice(i, i + tamanho);
}

describe("C3 — funções de servidor lançam em vez de engolir .error", () => {
  it("dadosVivosDoPortal lança nos casos (após os fallbacks de coluna) e nas cinco leituras", () => {
    const f = corpo(ler("src/lib/portal-dados-vivos.functions.ts"), "export const dadosVivosDoPortal");
    expect(f).toMatch(/if \(casos\.error\) throw/);
    expect(f.indexOf("COL_ENTREGA).test")).toBeLessThan(f.indexOf("if (casos.error) throw"));
    expect(f).toMatch(/for \(const r of \[proj, docs, pendencias, faturas, timeline\]\)[\s\S]{0,80}r\.error\) throw/);
  });
  it("minhasEntregas lança quando documents ou portal_casos falham", () => {
    const f = corpo(ler("src/lib/portal-cliente.functions.ts"), "export const minhasEntregas", 2500);
    expect(f).toMatch(/docs\.error \|\| casos\.error\) throw/);
  });
  it("portalContexto lança em acesso, cadastro e casos", () => {
    const f = corpo(ler("src/lib/portal.functions.ts"), "export const portalContexto", 2500);
    expect(f).toMatch(/acesso\.error\) throw/);
    expect(f).toMatch(/cliente\.error \|\| casos\.error\) throw/);
  });
  it("escopoDoPortal lança em acesso, documentos e casos", () => {
    const f = ler("src/lib/portal-jornada.functions.ts");
    expect(f).toMatch(/acesso\.error\) throw/);
    expect(f).toMatch(/docs\.error \|\| casos\.error\) throw/);
  });
  it("encontros de linhagem lançam em vez de devolver lista vazia", () => {
    const f = ler("src/lib/legado-app.functions.ts");
    expect(f).toMatch(/if \(error\) \{[\s\S]{0,300}throw new Error/);
  });
});

describe("C3 — telas mostram aviso honesto com 'Tentar novamente'", () => {
  for (const tela of ["entregas", "fase-01", "fase-02"]) {
    it(`${tela} trata isError com AvisoFalhaConexao e refetch`, () => {
      const f = ler(`src/routes/portal/${tela}.tsx`);
      expect(f).toMatch(/isError, refetch \} = usePortalVivo\(\)/);
      expect(f).toMatch(/isError \? \(\s*(\/\/[^\n]*\n\s*)?<AvisoFalhaConexao/);
      expect(f).toContain("Não conseguimos carregar agora. Tente de novo.");
    });
  }
  it("Home não ignora vivo.error na visão do cliente", () => {
    const f = ler("src/routes/portal/index.tsx");
    expect(f).toMatch(/erro=\{error \?\? \(vivo\.isError/);
  });
  it("Legado trata falha da lista de encontros", () => {
    const f = ler("src/routes/portal/legado.tsx");
    expect(f).toMatch(/isError: falhaEncontros/);
    expect(f).toMatch(/falhaEncontros \? \(/);
  });
});
