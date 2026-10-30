import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { DE_PARA_ANEXOS_DUPLICADOS } from "@/lib/anexos-de-para-duplicidade";

/**
 * Rateio igualitário do caso da Ana Luiza (23/10/2026).
 *
 * Correção determinada pela Proprietária, reafirmando decisão já aprovada
 * várias vezes: o valor total de R$ 9.600,00 é rateado **igualitariamente**
 * entre os três adultos — R$ 3.200,00 cada, em 10 parcelas mensais de
 * R$ 320,00 por pessoa. Felipe, menor representado, entra sem acréscimo.
 *
 * Os valores desiguais que apareciam antes (Ana R$ 4.800, pai R$ 2.400, irmã
 * R$ 2.400) eram dimensionamento técnico interno de horas. Não são a
 * obrigação de cada contratante e não devem ser apresentados como tal em
 * nenhuma superfície.
 */
const dePara = readFileSync("src/lib/anexos-de-para-duplicidade.ts", "utf8");

describe("o rateio exibido é igualitário entre os três adultos", () => {
  const individual = DE_PARA_ANEXOS_DUPLICADOS.find((l) => l.codigo === "ANX-INDIVIDUAL")!;

  it("a citação da proposta declara os três em R$ 3.200,00, não valores desiguais", () => {
    expect(individual.fonteNaProposta).toContain("rateado igualitariamente");
    expect(individual.fonteNaProposta).toContain("R$ 320,00 por pessoa");
    for (const pessoa of ["Ana Luiza", "Adair", "Alice"]) {
      expect(individual.fonteNaProposta, pessoa).toContain(`R$ 3.200,00 para ${pessoa}`);
    }
  });

  it("o menor representado aparece sem acréscimo", () => {
    expect(individual.fonteNaProposta).toContain("Felipe menor representado sem acréscimo");
  });

  it("o total continua R$ 9.600,00 — o rateio mudou, a soma não", () => {
    expect(individual.fonteNaProposta).toContain("R$ 9.600,00");
    // 3 × R$ 3.200,00 = R$ 9.600,00; 3 × R$ 320,00 × 10 meses = R$ 9.600,00.
    expect(3 * 3200).toBe(9600);
    expect(3 * 320 * 10).toBe(9600);
  });

  it("os valores desiguais não voltam ao de-para dos anexos", () => {
    for (const linha of DE_PARA_ANEXOS_DUPLICADOS) {
      expect(linha.fonteNaProposta ?? "", linha.codigo).not.toContain("R$ 4.800");
      expect(linha.fonteNaProposta ?? "", linha.codigo).not.toContain("R$ 2.400");
    }
  });

  it("a decisão de 23/10 fica registrada no arquivo, não só no histórico do git", () => {
    expect(dePara).toContain("23/10/2026");
    expect(dePara).toContain("rateio do caso é IGUALITÁRIO");
  });
});

describe("o App do cliente já declarava a regra igualitária — segue declarando", () => {
  /*
   * A família nunca viu os valores desiguais: as superfícies do App sempre
   * disseram 3 assinaturas de R$ 320/mês. Este teste tranca isso, para que uma
   * rodada futura não reintroduza rateio desigual na vista do cliente.
   */
  it("as três superfícies canônicas do App falam em R$ 320 por pessoa e nunca em 4.800/2.400", () => {
    for (const caminho of [
      "src/lib/portal-fallback-canonico.ts",
      "src/lib/portal-experiencia-integral.ts",
      "src/lib/saneamento-desk-app-v4.ts",
    ]) {
      const arquivo = readFileSync(caminho, "utf8");
      expect(arquivo, caminho).toContain("R$ 9.600,00");
      expect(arquivo, caminho).toMatch(/R\$ ?320/);
      expect(arquivo, caminho).not.toContain("4.800");
      expect(arquivo, caminho).not.toContain("2.400");
    }
  });
});
