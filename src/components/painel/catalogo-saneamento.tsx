/**
 * Painel Hoje — seção interna "Catálogo e homologação de SKUs".
 *
 * Somente leitura. Não substitui os cinco blocos existentes do Painel Hoje.
 * Nenhum SKU, preço, link, proposta ou cobrança é criado ou alterado aqui, e
 * nenhuma integração externa é executada.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { lerSaneamentoCatalogo } from "@/lib/catalogo-canonico.functions";
import {
  ROTULO_ESTADO_CATALOGO,
  ROTULO_FILA_CATALOGO,
  ROTULO_PRIORIDADE,
  catalogoPorFaseJornada,
  type FilaCatalogo,
  type ItemFilaCatalogo,
} from "@/lib/catalogo-canonico";
import { traduzirFase } from "@/lib/jornada-de-para";

const ORDEM_FILAS: FilaCatalogo[] = [
  "bloqueia_proposta",
  "revisar_link",
  "pronto_homologacao",
  "portfolio_racionalizar",
];

function Linha({ i }: { i: ItemFilaCatalogo }) {
  return (
    <li className="rounded border border-navy/10 px-2 py-1.5">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="font-mono text-[11px] text-navy/80">{i.sku_codigo}</span>
        <span className="text-navy">{i.produto}</span>
        <span className="rounded-full border border-navy/15 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
          {ROTULO_PRIORIDADE[i.prioridade]}
        </span>
        <span className="text-[10px] uppercase tracking-wide text-navy/50">
          {ROTULO_ESTADO_CATALOGO[i.estado]}
        </span>
        {i.dados_teste ? (
          <span className="rounded-full border border-gold/50 bg-gold/10 px-1.5 py-0.5 text-[10px] text-navy">
            TESTE
          </span>
        ) : null}
      </div>
      <p className="mt-0.5 text-[11px] text-navy/70">Pendência: {i.pendencia_principal}</p>
      <p className="mt-0.5 text-[11px] text-navy/55">
        Responsável: {i.responsavel ?? "sem responsável definido"} · {i.impacto} · atualizado em{" "}
        {i.atualizado_em ? String(i.atualizado_em).slice(0, 10) : "—"}
      </p>
      <p className="mt-0.5 text-[11px] text-navy/70">Ação humana: {i.acao_humana}</p>
    </li>
  );
}

export function CatalogoSaneamento() {
  const [incluirTeste, setIncluirTeste] = useState(false);
  const carregar = useServerFn(lerSaneamentoCatalogo);
  const q = useQuery({
    queryKey: ["catalogo-saneamento", incluirTeste],
    queryFn: () => carregar({ data: { incluirTeste } }),
    retry: false,
  });

  const filas = q.data?.filas;
  const ind = q.data?.indicadores;

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-serif text-lg text-navy">Catálogo e homologação de SKUs</h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-navy/60">
            <input
              type="checkbox"
              checked={incluirTeste}
              onChange={(e) => setIncluirTeste(e.target.checked)}
            />
            Incluir demonstrações
          </label>
          <Link
            to="/catalogo"
            className="text-[11px] text-navy/50 underline underline-offset-2 hover:text-navy/70"
          >
            catálogo canônico
          </Link>
        </div>
      </div>
      <p className="mt-1 text-xs text-navy/50">
        Fila de saneamento somente leitura. Um SKU aparece uma única vez por fila. Nenhum link é
        criado, nenhuma cobrança é enviada e nenhuma oferta é publicada no App Cliente.
      </p>

      {q.isLoading ? (
        <p className="mt-3 text-xs text-navy/50">Carregando saneamento de catálogo…</p>
      ) : null}
      {q.isError ? (
        <p className="mt-3 flex flex-wrap items-center gap-3 text-xs text-terracotta">
          Não foi possível carregar o saneamento de catálogo.
          <button
            type="button"
            onClick={() => void q.refetch()}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-[11px] font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}

      {ind ? (
        <div className="mt-3 grid gap-2 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
          {[
            { r: "Top 10", v: ind.top_10 },
            { r: "Top 30", v: ind.top_30 },
            { r: "Homologados ativos", v: ind.por_estado.homologado_ativo },
            { r: "Em revisão", v: ind.por_estado.em_revisao },
            { r: "Bloqueiam proposta", v: ind.bloqueiam_proposta },
            { r: "Prontos p/ homologar", v: ind.prontos_para_homologacao },
          ].map((c) => (
            <div key={c.r} className="rounded-lg border border-navy/10 p-2">
              <p className="uppercase tracking-wide text-navy/45">{c.r}</p>
              <p className="font-serif text-lg text-navy">{c.v}</p>
            </div>
          ))}
        </div>
      ) : null}

      {q.data?.skus?.length ? (
        <div className="mt-4 rounded-lg border border-navy/10 p-3">
          <p className="text-sm font-medium text-navy">Catálogo por fase da jornada</p>
          <p className="mt-0.5 text-[11px] text-navy/50">
            Fase traduzida do <code>jornada_fase</code> da fonte pelo de-para canônico; "aprox." indica
            correspondência aproximada, não fase inventada.
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {catalogoPorFaseJornada(q.data.skus, traduzirFase, { incluirTeste }).map((g) => (
              <div key={g.fase ?? g.rotulo} className="rounded-lg border border-navy/10 bg-cream/40 p-2">
                <p className="text-[11px] uppercase tracking-wide text-navy/55">
                  {g.rotulo}
                  {g.temAproximacao ? " (aprox.)" : ""}
                </p>
                <p className="mt-1 font-serif text-lg text-navy">{g.total} SKU(s)</p>
                <p className="text-[11px] text-navy/60">
                  {g.homologados} homologado(s) · {g.bloqueados} bloqueado(s)
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {filas ? (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {ORDEM_FILAS.map((f) => (
            <div key={f} className="rounded-lg border border-navy/10 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-navy">{ROTULO_FILA_CATALOGO[f]}</span>
                <span className="text-[10px] text-navy/40">{filas[f].length} SKU(s)</span>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs">
                {filas[f].map((i) => (
                  <Linha key={`${f}-${i.sku_codigo}`} i={i} />
                ))}
                {filas[f].length === 0 ? (
                  <li className="text-[11px] text-navy/50">Nada pendente nesta fila.</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      {ind ? (
        <div className="mt-3 grid gap-3 text-[11px] lg:grid-cols-2">
          <div className="rounded-lg border border-navy/10 p-3">
            <p className="uppercase tracking-wide text-navy/45">Pendências por responsável</p>
            <ul className="mt-1 space-y-0.5 text-navy/70">
              {ind.pendencias_por_responsavel.map((p) => (
                <li key={p.responsavel}>
                  {p.responsavel}: {p.total}
                </li>
              ))}
              {!ind.pendencias_por_responsavel.length ? (
                <li className="text-navy/50">Sem pendências.</li>
              ) : null}
            </ul>
          </div>
          <div className="rounded-lg border border-navy/10 p-3">
            <p className="uppercase tracking-wide text-navy/45">
              Links de cobrança por estado (referência)
            </p>
            <ul className="mt-1 space-y-0.5 text-navy/70">
              {Object.entries(ind.links_por_estado).map(([k, v]) => (
                <li key={k}>
                  {k}: {v}
                </li>
              ))}
              {!Object.keys(ind.links_por_estado).length ? (
                <li className="text-navy/50">Nenhuma referência de link registrada.</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
