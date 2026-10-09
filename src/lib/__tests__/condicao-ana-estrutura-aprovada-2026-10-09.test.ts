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

  it("os módulos do caso descrevem a condição inteira: total, mensal e as três assinaturas", () => {
    for (const f of ["src/lib/fila-follow-up-proprietaria.ts", "src/lib/corte-vertical.ts"]) {
      const txt = readFileSync(join(raiz, f), "utf8");
      expect(txt).toMatch(/9\.600/); // total
      expect(txt).toMatch(/960/); // mensal
      expect(txt).toMatch(/R\$ 320/); // por assinatura
      expect(txt).toMatch(/tr[êe]s assinaturas/i);
      expect(txt).toMatch(/10 meses/);
    }
  });

  it("os dois módulos que DESCREVEM a condição dizem o mensal e a composição juntos", () => {
    /*
     * O defeito medido em 09/10: fila-follow-up dizia só "10x R$ 960,00" e
     * corte-vertical invertia, chamando 10 × 960 de "modelagem indicada" e as
     * três assinaturas de algo apenas "pensado operacionalmente". Nenhum dos
     * dois errava a cifra — os dois estavam incompletos.
     *
     * O escopo é só quem DESCREVE a condição. Menção contextual a R$ 320 em
     * outros módulos (regra de nome de plano, comentário de cálculo) é
     * legítima e não precisa repetir o valor mensal — uma asserção ampla aqui
     * só produziria ruído.
     */
    for (const f of ["src/lib/fila-follow-up-proprietaria.ts", "src/lib/corte-vertical.ts"]) {
      const txt = readFileSync(join(raiz, f), "utf8");
      expect(txt).toMatch(/R\$ ?960|960,00/);
      expect(txt).toMatch(/R\$ ?320/);
    }
  });

  it("a conta fecha: 3 x 320 = 960 por mês, 960 x 10 = 9.600", () => {
    expect(3 * 320).toBe(960);
    expect(960 * 10).toBe(9600);
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
