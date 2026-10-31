import { useMemo } from "react";

import { CaCard } from "@/components/ui/ca-card";
import { ORIGEM_PROPOSTAS, PORTFOLIO_MESTRE } from "@/data/propostas";
import type { ItemCatalogoImportado } from "@/lib/catalogo-importacao";
import {
  ROTULO_ESTADO_CRUZAMENTO,
  cruzarPortfolioComCatalogo,
  type LinhaCruzamento,
} from "@/lib/portfolio-mestre-cruzamento";

const moeda = (v: number | null) =>
  v === null ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Portfólio mestre (Planilha Mestre de Produtos) × catálogo do banco. Somente
 * leitura: mostra onde a planilha e o banco divergem, sem decidir qual vale. O
 * preço vigente continua vindo do banco (product_catalog / price_catalog_rescued).
 */
export function PortfolioMestreCruzamento({
  itens,
  carregando,
}: {
  itens: readonly ItemCatalogoImportado[] | undefined;
  carregando: boolean;
}) {
  const cruzamento = useMemo(
    () => (itens ? cruzarPortfolioComCatalogo(PORTFOLIO_MESTRE, itens) : null),
    [itens],
  );
  const pendentes = cruzamento?.linhas.filter((l) => l.estado !== "conferido") ?? [];

  return (
    <CaCard
      titulo="Portfólio mestre (planilha) × catálogo do banco"
      eyebrow="Catálogo · conferência"
      className="mt-6"
    >
      <div data-portfolio-mestre-cruzamento>
        <p className="text-[11px] text-navy/60">
          Origem da lista: {ORIGEM_PROPOSTAS}. O preço vigente vem do banco; esta lista só aponta
          onde a planilha e o banco divergem, sem decidir qual vale.
        </p>
        {carregando ? (
          <p className="mt-3 text-xs text-navy/60" role="status">
            Carregando a leitura do catálogo…
          </p>
        ) : !cruzamento ? (
          <p className="mt-3 text-xs text-terracotta">
            Não foi possível ler o catálogo do banco; o cruzamento não foi calculado.
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-navy" data-portfolio-resumo>
              {cruzamento.resumo.conferidos} de {cruzamento.resumo.total} SKUs conferidos ·{" "}
              {cruzamento.resumo.divergentes} com preço divergente ·{" "}
              {cruzamento.resumo.semPrecoNoBanco} sem preço no banco ·{" "}
              {cruzamento.resumo.soNaPlanilha} fora desta leitura do banco ·{" "}
              {cruzamento.resumo.soNoBanco} itens do banco não estão na lista da planilha.
            </p>
            {pendentes.length === 0 ? (
              <p className="mt-2 text-xs text-navy/60">
                Nenhuma divergência entre a planilha e o banco.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5" data-portfolio-pendentes>
                {pendentes.map((l) => (
                  <LinhaPendente key={l.sku} linha={l} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </CaCard>
  );
}

function LinhaPendente({ linha }: { linha: LinhaCruzamento }) {
  return (
    <li
      className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs"
      data-portfolio-estado={linha.estado}
    >
      <span className="text-navy">
        <span className="font-medium">{linha.sku}</span> · {linha.nome}
      </span>
      <span className="text-navy/60">
        {ROTULO_ESTADO_CRUZAMENTO[linha.estado]}
        {linha.estado === "preco_divergente"
          ? ` · planilha ${moeda(linha.precoPlanilha)} × banco ${moeda(linha.precoBanco)}`
          : ` · planilha ${moeda(linha.precoPlanilha)}`}
      </span>
    </li>
  );
}
