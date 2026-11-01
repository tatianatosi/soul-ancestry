import { describe, expect, it } from "vitest";

import { PORTFOLIO_MESTRE } from "@/data/propostas";
import { cruzarPortfolioComCatalogo } from "@/lib/portfolio-mestre-cruzamento";

describe("cruzarPortfolioComCatalogo", () => {
  const [a, b, c] = PORTFOLIO_MESTRE;

  it("classifica conferido, divergente, sem preço e fora do banco sem decidir qual vale", () => {
    const { linhas, resumo } = cruzarPortfolioComCatalogo(
      [a, b, c],
      [
        { sku: a.sku, preco_atual_fonte: a.precoAtual },
        { sku: b.sku, preco_atual_fonte: b.precoAtual + 100 },
        { sku: "SKU-SO-NO-BANCO", preco_atual_fonte: 10 },
      ],
    );
    expect(linhas.map((l) => l.estado)).toEqual([
      "conferido",
      "preco_divergente",
      "so_na_planilha",
    ]);
    expect(linhas[1].diferenca).toBe(100);
    expect(resumo).toMatchObject({
      total: 3,
      conferidos: 1,
      divergentes: 1,
      soNaPlanilha: 1,
      soNoBanco: 1,
    });
  });

  it("preço nulo no banco vira 'sem preço', nunca zero", () => {
    const { linhas } = cruzarPortfolioComCatalogo([a], [{ sku: a.sku, preco_atual_fonte: null }]);
    expect(linhas[0].estado).toBe("sem_preco_no_banco");
    expect(linhas[0].precoBanco).toBeNull();
  });
});
