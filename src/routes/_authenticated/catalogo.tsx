import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { SaasShell } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
import { ReferenciaCatalogo } from "@/components/catalogo/referencia-catalogo";
import { CatalogoSaneamento } from "@/components/painel/catalogo-saneamento";
import { PrecoSugeridoOperacional } from "@/components/catalogo/preco-sugerido-operacional";
import { PlanejadorProdutosPai } from "@/components/catalogo/planejador-produtos-pai";
import { lerCatalogoImportado } from "@/lib/catalogo-importacao.functions";
import {
  ROTULO_DIVERGENCIA,
  ROTULO_LINK_FONTE,
  elegivelParaPropostaReal,
  mapaFonteMestre,
  previaImportacao,
  type ItemCatalogoImportado,
  type TipoDivergencia,
} from "@/lib/catalogo-importacao";

export const Route = createFileRoute("/_authenticated/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo comercial — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Área proprietária de catálogo: produto-pai, contexto e status de condição do Top 30 Pareto, com origem e divergências de reconciliação. Planilha Mestre é só origem histórica, nunca fonte operacional.",
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
  // Leitura sem defaults silenciosos: a ausência de dados vira estado explícito na tela.
  const itens = q.data?.itens;
  const divergencias = q.data?.divergencias;
  const previa = previaImportacao((itens ?? []).map((i) => ({ sku: i.sku, fonte_versao: i.fonte_versao })));

  // CA09-CATALOGO-PRODUTOS-PAI (09/09/2026): produto-pai é a taxonomia de
  // oferta — agrupa a mesma leitura que já existe, nunca lista SKU cru como
  // decisão. Planilha Mestre (mapa/previa acima) fica só como origem
  // histórica de auditoria, nunca fonte operacional de preço/status.
  const grupos = useMemo(() => {
    const porProdutoPai = new Map<string, ItemCatalogoImportado[]>();
    for (const item of itens ?? []) {
      const chave = item.produto_pai ?? "Sem produto-pai (pede reconciliação)";
      if (!porProdutoPai.has(chave)) porProdutoPai.set(chave, []);
      porProdutoPai.get(chave)!.push(item);
    }
    return [...porProdutoPai.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [itens]);

  return (
    <SaasShell
      titulo="Catálogo comercial"
      descricao="Produto-pai, contexto e status de condição do catálogo já saneado. Origem (Planilha Mestre) é rastreabilidade, não decisão. Nada é recriado, reprecificado ou homologado novamente aqui, e nenhum link Asaas é criado, chamado ou alterado."
    >

      <div className="mb-6">
        <PrecoSugeridoOperacional />
      </div>

      <ReferenciaCatalogo />
      <div className="mt-6">
        <CatalogoSaneamento />
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { r: "SKUs na fonte", v: mapa.totais.totalSkus },
          { r: "Top Pareto", v: mapa.totais.topPareto },
          { r: "Top Pareto ativos importados", v: itens ? itens.length : "—" },
          { r: "Divergências abertas", v: divergencias ? divergencias.length : "—" },
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

      <section className="mt-6 space-y-4">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={itens}
          aoTentarNovamente={() => void q.refetch()}
          recurso="o catálogo importado"
          vazio="Nenhum item no catálogo. A leitura foi concluída com sucesso."
        >
          {() =>
            grupos.map(([produtoPai, lista]) => (
              <div key={produtoPai} className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
                <p className="border-b border-navy/10 bg-navy/5 p-3 text-sm font-medium text-navy">
                  {produtoPai}
                </p>
                <table className="w-full text-left text-xs">
                  <thead className="text-navy/60">
                    <tr>
                      <th className="p-3">Produto</th>
                      <th className="p-3">Contexto</th>
                      <th className="p-3">Status de condição</th>
                      <th className="p-3">Origem</th>
                      <th className="p-3">Asaas (reconciliação)</th>
                      <th className="p-3">SKU (técnico)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((i) => {
                      const sel = elegivelParaPropostaReal(i);
                      return (
                        <tr key={i.sku} className="border-t border-navy/5 align-top">
                          <td className="p-3 text-navy/85">
                            {i.produto}
                            <p className="mt-1 text-[11px] text-navy/50">{moedaBR(i.preco_sugerido, i.moeda)}</p>
                          </td>
                          <td className="p-3 text-navy/60">{i.tipo_oferta}</td>
                          <td className="p-3">
                            {sel.permitido ? (
                              <span className="text-gold">Elegível para proposta</span>
                            ) : (
                              <span className="text-terracotta">{sel.motivo}</span>
                            )}
                          </td>
                          <td className="p-3 text-navy/50">
                            Planilha Mestre {i.fonte_versao ?? "—"} · linha {i.fonte_linha ?? "—"}
                          </td>
                          <td className="p-3 text-navy/60">
                            {ROTULO_LINK_FONTE[i.status_link_asaas_fonte ?? ""] ?? i.status_link_asaas_fonte ?? "—"}
                          </td>
                          <td className="p-3 font-mono text-navy/45">{i.sku}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))
          }
        </EstadoDados>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-xl text-navy">Divergências de reconciliação</h2>
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={divergencias}
          aoTentarNovamente={() => void q.refetch()}
          recurso="as divergências de reconciliação"
          vazio="Nenhuma divergência aberta."
        >
          {(lista) => (
            <ul className="mt-3 space-y-2">
              {lista.map((d) => (
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
            </ul>
          )}
        </EstadoDados>
      </section>

      <PlanejadorProdutosPai />
    </SaasShell>
  );
}
