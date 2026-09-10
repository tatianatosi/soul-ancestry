/**
 * Planejador Universal — Produtos-pai e catálogo multipaís.
 *
 * 07/09/2026 — conecta `planner_catalog_feed` (construída em 04/09, nunca
 * lida por nenhuma tela até hoje) a uma superfície real. Taxonomia PP-01–09
 * confirmada pela proprietária nesta mesma data. É leitura da lista-alimento
 * aditiva — fonte canônica que substitui a Planilha Mestre para orquestração
 * de jornada; não é o catálogo comercial ativo (`product_catalog`/`/catalogo`
 * acima na mesma tela) e não homologa preço.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { listarPlanejadorProdutosPai, type ItemPlannerCatalogFeed } from "@/lib/planejador-produtos-pai.functions";
import { agruparPorProdutoPai, rotuloPais } from "@/lib/planejador-produtos-pai";

const ROTULO_PRICE_STATUS: Record<string, string> = {
  PENDENTE_DE_VALIDACAO_COMERCIAL: "preço pendente de validação comercial",
  PENDENTE_DE_VALIDACAO_HUMANA: "pendente de validação humana",
};

export function PlanejadorProdutosPai() {
  const carregar = useServerFn(listarPlanejadorProdutosPai);
  const q = useQuery({
    queryKey: ["planejador-produtos-pai"],
    queryFn: () => carregar(),
    retry: false,
  });

  return (
    <section className="mt-8 rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-lg text-navy">Planejador Universal · Produtos-pai e multipaís</h3>
      </div>
      <p className="mt-1 text-[11px] text-navy/50">
        Fonte canônica de orquestração de jornada — substitui a Planilha Mestre. Não homologa preço nem
        cria SKU: isso continua em <code>/catalogo</code> e <code>product_catalog</code>.
      </p>

      <div className="mt-4">
        <EstadoDados<ItemPlannerCatalogFeed>
          carregando={q.isLoading}
          erro={q.isError ? q.error : undefined}
          dados={q.data?.itens}
          aoTentarNovamente={() => void q.refetch()}
          vazio="Nenhum item na lista-alimento do Planejador Universal ainda."
          recurso="o Planejador Universal"
        >
          {(itens) => {
            const grupos = agruparPorProdutoPai(itens);
            const todosPaises = new Set<string>();
            for (const g of grupos) for (const p of g.paisesCobertos) todosPaises.add(p);

            return (
              <>
                <p className="mb-3 text-xs text-navy/55">
                  {itens.length} item(ns) · {todosPaises.size} país(es)/via(s) cobertos
                </p>
                <div className="space-y-4">
                  {grupos.map((g) => (
                    <div
                      key={g.produtoPai?.id ?? "sem-produto-pai"}
                      className={`rounded-lg border p-3 ${
                        g.produtoPai ? "border-navy/12 bg-cream/25" : "border-terracotta/35 bg-terracotta/5"
                      }`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="text-sm font-medium text-navy">
                          {g.produtoPai ? (
                            <>
                              <span className="rounded bg-navy/8 px-1.5 py-0.5 font-mono text-[11px] text-navy/70">
                                {g.produtoPai.id}
                              </span>{" "}
                              {g.produtoPai.nome}
                            </>
                          ) : (
                            "Sem produto-pai definido"
                          )}
                        </p>
                        {g.produtoPai ? (
                          <span className="text-[11px] text-navy/50">{g.produtoPai.faseDaVida}</span>
                        ) : null}
                      </div>

                      {g.paisesCobertos.length ? (
                        <p className="mt-1.5 flex flex-wrap gap-1">
                          {g.paisesCobertos.map((p) => (
                            <span key={p} className="rounded bg-navy/6 px-1.5 py-0.5 text-[11px] text-navy/70">
                              {rotuloPais(p)}
                            </span>
                          ))}
                        </p>
                      ) : null}

                      {g.itens.length ? (
                        <ul className="mt-2 space-y-1">
                          {g.itens.map((item) => (
                            <li key={item.item_id} className="text-xs text-navy/65">
                              <span className="font-mono text-navy/50">{item.item_id}</span> · {item.name}
                              {item.price_status && ROTULO_PRICE_STATUS[item.price_status] ? (
                                <span className="text-terracotta"> · {ROTULO_PRICE_STATUS[item.price_status]}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-xs text-navy/45">
                          Nenhum item da lista-alimento neste produto-pai ainda.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            );
          }}
        </EstadoDados>
      </div>
    </section>
  );
}
