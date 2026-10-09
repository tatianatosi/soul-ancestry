import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Estrutura de pagamento da Ana — confirmada pela Proprietária em 09/10/2026:
 * "estrutura correta: a condição v2 aprovada no banco diz 3 assinaturas de
 * R$ 320 por responsável, durante 10 meses, com Ana, Adair e Alice como
 * responsáveis financeiros."
 *
 * Material recuperado em `docs/evolucao/recuperados/` descreve a mesma cifra
 * como "10 x R$ 960,00" — um pagador só. Isso é LEGADO: o total coincide, a
 * estrutura e o número de pagadores não. Este teste existe para que nenhum
 * agente releia aquele material e reintroduza a estrutura errada no código.
 *
 * A estrutura vive em `case_commercial_condition` (versionada, aprovada), não
 * em constante de código — por isso o teste trava a AUSÊNCIA de valor fixo.
 */

const raiz = process.cwd();

function arquivosDe(dir: string, ext: string[], acc: string[] = []): string[] {
  for (const nome of readdirSync(join(raiz, dir))) {
    const rel = `${dir}/${nome}`;
    const st = statSync(join(raiz, rel));
    if (st.isDirectory()) arquivosDe(rel, ext, acc);
    else if (ext.some((e) => nome.endsWith(e))) acc.push(rel);
  }
  return acc;
}

describe("a estrutura de pagamento da Ana não é cravada em código", () => {
  const fontes = arquivosDe("src", [".ts", ".tsx"]).filter((f) => !f.includes("__tests__"));

  it("nenhum módulo apresenta '10 x R$ 960' como a estrutura aprovada", () => {
    /*
     * Dois módulos faziam exatamente isso (achado de 09/10/2026):
     *  - fila-follow-up-proprietaria.ts dizia "Proposta familiar aprovada
     *    (R$ 9.600,00 em 10x R$ 960,00)";
     *  - corte-vertical.ts chamava 10 × R$ 960 de "modelagem indicada" e as
     *    três assinaturas de R$ 320 de algo apenas "pensado operacionalmente"
     *    — invertendo a estrutura real.
     * Os dois foram corrigidos para a estrutura aprovada. Citar a leitura
     * legada é permitido; apresentá-la como a aprovada, não.
     */
    const suspeitos: string[] = [];
    for (const f of fontes) {
      const txt = readFileSync(join(raiz, f), "utf8");
      for (const l of txt.split("\n")) {
        if (!/10\s*[x×]\s*(de\s*)?(R\$\s*)?960/i.test(l)) continue;
        // só é defeito quando a frase apresenta isso como aprovado/indicado
        if (/(aprovad|indicad|vigente|contratad)/i.test(l)) suspeitos.push(`${f}: ${l.trim().slice(0, 110)}`);
      }
    }
    expect(suspeitos).toEqual([]);
  });

  it("a estrutura aprovada (três assinaturas de R$ 320) é a que os módulos do caso afirmam", () => {
    for (const f of ["src/lib/fila-follow-up-proprietaria.ts", "src/lib/corte-vertical.ts"]) {
      const txt = readFileSync(join(raiz, f), "utf8");
      expect(txt).toMatch(/R\$ 320/);
      expect(txt).toMatch(/respons[áa]vel/i);
    }
  });

  it("o total de R$ 9.600 segue sendo do CASO, nunca preço de catálogo", () => {
    /*
     * 9600 como total de referência do caso é correto (piloto-ana.ts). O que
     * não pode é virar preço de catálogo — isso é garantido no banco, onde a
     * linha está como CONDICAO_PARTICULAR_DE_CASO, e no orçamento, que separa
     * condição do caso de preço vigente.
     */
    const orcamento = readFileSync(join(raiz, "src/lib/orcamento-produtos-pai.ts"), "utf8");
    expect(orcamento).toMatch(/condi[çc][ãa]o particular|case_only|CONDICAO_PARTICULAR/i);
  });

  it("quem lê a condição comercial lê a versão aprovada da tabela versionada", () => {
    const alvo = readFileSync(join(raiz, "src/lib/contrato-preparar.functions.ts"), "utf8");
    expect(alvo).toContain('from("case_commercial_condition")');
    expect(alvo).toContain("approval_status");
    expect(alvo).toContain("responsaveis_financeiros");
  });
});
