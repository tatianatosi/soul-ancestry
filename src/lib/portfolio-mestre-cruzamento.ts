import type { ProdutoMestre } from "@/data/propostas";
import type { ItemCatalogoImportado } from "@/lib/catalogo-importacao";

/**
 * Portfólio mestre (planilha) × catálogo do banco — camada pura (31/10/2026).
 *
 * `src/data/propostas.ts` guarda o recorte da Planilha Mestre de Produtos usado
 * nas propostas por slide. O preço VIGENTE nunca vem dessa lista: vem do banco
 * (`product_catalog` / `price_catalog_rescued`). O cruzamento só mostra onde a
 * planilha e o banco divergem, sem decidir qual vale. Quem decide é a
 * homologação.
 */
export type EstadoCruzamento =
  "conferido" | "preco_divergente" | "sem_preco_no_banco" | "so_na_planilha";

export type LinhaCruzamento = {
  sku: string;
  nome: string;
  papel: ProdutoMestre["papel"];
  precoPlanilha: number;
  precoBanco: number | null;
  /** precoBanco − precoPlanilha, quando os dois existem. */
  diferenca: number | null;
  estado: EstadoCruzamento;
};

export type ResumoCruzamento = {
  total: number;
  conferidos: number;
  divergentes: number;
  semPrecoNoBanco: number;
  soNaPlanilha: number;
  /** Itens do banco que a lista do portfólio não traz (informativo). */
  soNoBanco: number;
};

const TOLERANCIA = 0.005;

export const ROTULO_ESTADO_CRUZAMENTO: Record<EstadoCruzamento, string> = {
  conferido: "Conferido",
  preco_divergente: "Preço diverge",
  sem_preco_no_banco: "Sem preço no banco",
  so_na_planilha: "Não aparece nesta leitura do banco",
};

export function cruzarPortfolioComCatalogo(
  portfolio: readonly ProdutoMestre[],
  itens: readonly Pick<ItemCatalogoImportado, "sku" | "preco_atual_fonte">[],
): { linhas: LinhaCruzamento[]; resumo: ResumoCruzamento } {
  const porSku = new Map(itens.map((i) => [i.sku, i]));
  const linhas = portfolio.map((p): LinhaCruzamento => {
    const item = porSku.get(p.sku);
    const base = { sku: p.sku, nome: p.nome, papel: p.papel, precoPlanilha: p.precoAtual };
    if (!item) return { ...base, precoBanco: null, diferenca: null, estado: "so_na_planilha" };
    if (item.preco_atual_fonte === null || item.preco_atual_fonte === undefined) {
      return { ...base, precoBanco: null, diferenca: null, estado: "sem_preco_no_banco" };
    }
    const diferenca = item.preco_atual_fonte - p.precoAtual;
    return {
      ...base,
      precoBanco: item.preco_atual_fonte,
      diferenca,
      estado: Math.abs(diferenca) <= TOLERANCIA ? "conferido" : "preco_divergente",
    };
  });
  const skusPlanilha = new Set(portfolio.map((p) => p.sku));
  return {
    linhas,
    resumo: {
      total: linhas.length,
      conferidos: linhas.filter((l) => l.estado === "conferido").length,
      divergentes: linhas.filter((l) => l.estado === "preco_divergente").length,
      semPrecoNoBanco: linhas.filter((l) => l.estado === "sem_preco_no_banco").length,
      soNaPlanilha: linhas.filter((l) => l.estado === "so_na_planilha").length,
      soNoBanco: itens.filter((i) => !skusPlanilha.has(i.sku)).length,
    },
  };
}
