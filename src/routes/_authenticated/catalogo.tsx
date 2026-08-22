import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { lerCatalogoImportado } from "@/lib/catalogo-importacao.functions";
import {
  ROTULO_DIVERGENCIA,
  ROTULO_LINK_FONTE,
  mapaFonteMestre,
  previaImportacao,
  selecionavelEmProposta,
  type TipoDivergencia,
} from "@/lib/catalogo-importacao";

export const Route = createFileRoute("/_authenticated/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo comercial — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Área proprietária de catálogo: SKUs Top 30 Pareto importados da planilha mestre, com preço sugerido oficial, referência de fonte e divergências de reconciliação.",
      },
      { property: "og:title", content: "Catálogo comercial — Clube Ancestral Desk" },
      {
        property: "og:description",
        content: "Leitura do catálogo canônico importado, divergências e estado de reconciliação Asaas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CatalogoPage,
});

const moedaBR = (v: number | null, moeda: string) =>
  v === null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL" }).format(v);

function CatalogoPage() {
  const carregar = useServerFn(lerCatalogoImportado);
  const q = useQuery({ queryKey: ["catalogo-importado"], queryFn: () => carregar(), retry: false });

  const mapa = mapaFonteMestre();
  const itens = q.data?.itens ?? [];
  const divergencias = q.data?.divergencias ?? [];
  const previa = previaImportacao(itens.map((i) => ({ sku: i.sku, fonte_versao: i.fonte_versao })));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <header>
        <p className="text-xs uppercase tracking-wide text-navy/50">Área proprietária · Catálogo e comercial</p>
        <h1 className="mt-1 font-serif text-3xl text-navy">Catálogo importado da fonte canônica</h1>
        <p className="mt-2 max-w-3xl text-sm text-navy/65">
          Leitura do catálogo já saneado. Preço, status, categoria e Pareto vêm da planilha mestre. Nada é recriado,
          reprecificado ou homologado novamente aqui, e nenhum link Asaas é criado, chamado ou alterado.
        </p>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { r: "SKUs na fonte", v: mapa.totais.totalSkus },
          { r: "Top Pareto", v: mapa.totais.topPareto },
          { r: "Top Pareto ativos importados", v: itens.length },
          { r: "Divergências abertas", v: divergencias.length },
        ].map((c) => (
          <div key={c.r} className="rounded-xl border border-navy/10 bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-navy/50">{c.r}</p>
            <p className="mt-1 font-serif text-2xl text-navy">{c.v}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 rounded-xl border border-navy/10 bg-cream/50 p-4 text-xs text-navy/70">
        <p>
          <span className="font-medium text-navy/85">Fonte:</span> {mapa.arquivo} · aba “{mapa.aba}” · versão{" "}
          {mapa.versao}
        </p>
        <p className="mt-1">
          <span className="font-medium text-navy/85">Prévia idempotente:</span> {previa.resumo.criar} a criar ·{" "}
          {previa.resumo.atualizar} a atualizar · {previa.resumo.inalterado} inalterados (mesma versão da fonte não
          duplica SKU).
        </p>
        <p className="mt-1">
          <span className="font-medium text-navy/85">Colunas ausentes na fonte:</span> {mapa.colunasAusentes.join(", ")}{" "}
          — registradas como exceção, nunca preenchidas por inferência.
        </p>
      </section>

      {q.isLoading ? <p className="mt-6 text-sm text-navy/50">Carregando catálogo importado…</p> : null}
      {q.isError ? <p className="mt-6 text-sm text-terracotta">Não foi possível ler o catálogo importado.</p> : null}

      <section className="mt-6 overflow-x-auto rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-navy/5 text-navy/60">
            <tr>
              <th className="p-3">SKU</th>
              <th className="p-3">Produto</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Pareto</th>
              <th className="p-3">Preço sugerido (fonte)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Asaas (reconciliação)</th>
              <th className="p-3">Referência da fonte</th>
              <th className="p-3">Proposta</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => {
              const sel = selecionavelEmProposta(i);
              return (
                <tr key={i.sku} className="border-t border-navy/5 align-top">
                  <td className="p-3 font-medium text-navy/85">{i.sku}</td>
                  <td className="p-3 text-navy/70">{i.produto}</td>
                  <td className="p-3 text-navy/60">{i.categoria ?? "—"}</td>
                  <td className="p-3 text-navy/60">{i.faixa ?? i.pareto ?? "—"}</td>
                  <td className="p-3 text-navy/85">{moedaBR(i.preco_sugerido, i.moeda)}</td>
                  <td className="p-3 text-navy/60">{i.status_fonte ?? i.status_produto}</td>
                  <td className="p-3 text-navy/60">
                    {ROTULO_LINK_FONTE[i.status_link_asaas_fonte ?? ""] ?? i.status_link_asaas_fonte ?? "—"}
                  </td>
                  <td className="p-3 text-navy/50">
                    {i.fonte_versao ?? "—"} · linha {i.fonte_linha ?? "—"}
                  </td>
                  <td className="p-3">
                    {sel.permitido ? (
                      <span className="text-gold">Selecionável</span>
                    ) : (
                      <span className="text-terracotta">{sel.motivo}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {!itens.length && !q.isLoading ? (
              <tr>
                <td className="p-3 text-navy/50" colSpan={9}>
                  Nenhum SKU importado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-xl text-navy">Divergências de reconciliação</h2>
        <ul className="mt-3 space-y-2">
          {divergencias.map((d) => (
            <li key={`${d.sku}-${d.tipo}`} className="rounded-xl border border-navy/10 bg-white p-3 text-xs">
              <p className="font-medium text-navy/85">
                {d.sku} — {ROTULO_DIVERGENCIA[d.tipo as TipoDivergencia] ?? d.tipo}
              </p>
              <p className="mt-1 text-navy/65">{d.detalhe}</p>
              <p className="mt-1 text-navy/45">
                {d.fonte_referencia} · linha {d.fonte_linha ?? "—"}
              </p>
            </li>
          ))}
          {!divergencias.length && !q.isLoading ? (
            <li className="text-xs text-navy/50">Nenhuma divergência aberta.</li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
