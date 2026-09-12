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
  type ItemCatalogoImportado,
  type TipoDivergencia,
} from "@/lib/catalogo-importacao";

export const Route = createFileRoute("/_authenticated/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo homologado — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Catálogo homologado: produto-pai, contexto e status de condição, com divergências reais de reconciliação. Origem (Planilha Mestre) é rastreabilidade, não decisão.",
      },
      { property: "og:title", content: "Catálogo homologado — Clube Ancestral Desk" },
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

  // Leitura sem defaults silenciosos: a ausência de dados vira estado explícito na tela.
  const itens = q.data?.itens;
  const divergencias = q.data?.divergencias;

  // CA09-CATALOGO-PRODUTOS-PAI (09/09/2026): produto-pai é a taxonomia de
  // oferta — agrupa a mesma leitura que já existe, nunca lista SKU cru como
  // decisão. Snapshot da Planilha Mestre (Top Pareto) saiu da face.
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
      titulo="Catálogo homologado"
      descricao="Produto-pai, contexto e status de condição do catálogo já saneado. Origem (Planilha Mestre) é rastreabilidade, não decisão. Nada é recriado, reprecificado ou homologado novamente aqui, e nenhum link Asaas é criado, chamado ou alterado."
    >

      <div className="mb-6">
        <PrecoSugeridoOperacional />
      </div>

      <ReferenciaCatalogo />
      <div className="mt-6">
        <CatalogoSaneamento />
      </div>

      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { r: "Itens no catálogo homologado", v: itens ? itens.length : "—" },
          { r: "Divergências abertas", v: divergencias ? divergencias.length : "—" },
        ].map((c) => (
          <div key={c.r} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
            <p className="text-xs uppercase tracking-wide text-navy/50">{c.r}</p>
            <p className="mt-1 font-serif text-2xl text-navy">{c.v}</p>
          </div>
        ))}
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
              <div key={produtoPai} className="overflow-x-auto rounded-xl border border-navy/10 bg-cream/40">
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
                <li key={`${d.sku}-${d.tipo}`} className="rounded-xl border border-navy/10 bg-cream/40 p-3 text-xs">
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
