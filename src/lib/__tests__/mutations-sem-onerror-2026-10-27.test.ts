import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Laudo #189, primeiro corte (27/10/2026): "as 19 mutations sem onError —
 * pequeno, mecânico, elimina o silêncio total." Esta sessão fechou os
 * últimos gaps reais: `triagem-ancestralscan.tsx` (2),
 * `conteudo-editorial-conectado.tsx` (3), `reconciliar-contato-partes.tsx`
 * (2), `reconciliar-dados-civis-membros-caso.tsx` (1),
 * `governanca.migracao-onboarding-gate.tsx` (2),
 * `governanca.modelo-familiar-casal.tsx` (1),
 * `governanca.modelo-individual.tsx` (1).
 *
 * `evidencias.tsx`, `homologacao-skus.tsx` e `importacoes.tsx` (3
 * mutations, task #11 desta auditoria) são falsos positivos: tratam erro
 * via `try/catch` em `mutateAsync` ou via `m.isError`/`m.error` lido
 * reativamente no JSX — padrões igualmente válidos ao `onError` callback,
 * só não detectáveis pelo mesmo grep mecânico.
 *
 * Este teste varre TODO `src/**\/*.tsx` (sem amostragem) e falha se um
 * `useMutation({...})` não tiver `onError:` no mesmo bloco NEM
 * `isError`/`mutateAsync` em algum lugar do arquivo (falso-positivo
 * conhecido) — trava contra reincidência (Peça C do mesmo laudo).
 */
function listarArquivosTsx(dir: string, out: string[]): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "__tests__" || e.name === "node_modules") continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) listarArquivosTsx(p, out);
    else if (/\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

function blocosSemOnErrorNemFallback(caminho: string): number {
  const src = readFileSync(caminho, "utf8");
  const temFallbackDeArquivo = /isError|mutateAsync/.test(src);
  if (temFallbackDeArquivo) return 0;
  const re = /useMutation\s*\(\s*\{/g;
  let m: RegExpExecArray | null;
  let semOnError = 0;
  while ((m = re.exec(src))) {
    let depth = 0;
    let i = m.index + m[0].length - 1;
    const start = i;
    for (; i < src.length; i++) {
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const bloco = src.slice(start, i + 1);
    if (!/onError\s*:/.test(bloco)) semOnError++;
  }
  return semOnError;
}

describe("Mutations sem tratamento de erro (laudo #189, Peça C — trava contra reincidência)", () => {
  it("nenhum arquivo .tsx tem useMutation sem onError E sem isError/mutateAsync no mesmo arquivo", () => {
    const arquivos = listarArquivosTsx("src", []);
    const comFalha: string[] = [];
    for (const f of arquivos) {
      const n = blocosSemOnErrorNemFallback(f);
      if (n > 0) comFalha.push(`${f} (${n})`);
    }
    expect(
      comFalha,
      `Mutations sem onError nem isError/mutateAsync como fallback:\n${comFalha.join("\n")}`,
    ).toEqual([]);
  });
});
