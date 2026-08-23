import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { Painel, Selo, inputCls } from "@/components/comercial/base";
import { origemEscopoContratual } from "@/lib/escopo-origem.functions";
import {
  EIXOS,
  ROTULO_ESTADO,
  baixarCsvOrigemEscopo,
  type EstadoVinculo,
  type LinhaOrigem,
  type Vinculo,
} from "@/lib/escopo-origem";

export const Route = createFileRoute("/_authenticated/escopo-origem")({
  head: () => ({
    meta: [
      { title: "Origem do escopo contratual — Clube Ancestral" },
      {
        name: "description",
        content:
          "Auditoria da cadeia Proposta vN → SKU → Condição comercial → Ordem de serviço para cada item de escopo contratual.",
      },
      { property: "og:title", content: "Origem do escopo contratual — Clube Ancestral" },
      { property: "og:description", content: "Cadeia de origem item a item, com lacunas evidenciadas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrigemEscopoPage,
});

const TOM: Record<EstadoVinculo, "ok" | "neutro" | "alerta" | "erro"> = {
  vinculado: "ok",
  herdado: "neutro",
  declarado: "alerta",
  ausente: "erro",
};

function Celula({ v }: { v: Vinculo }) {
  return (
    <div className="min-w-[9rem]">
      <div className="text-navy">{v.rotulo}</div>
      <div className="mt-1">
        <Selo texto={ROTULO_ESTADO[v.estado]} tom={TOM[v.estado]} title={v.detalhe ?? undefined} />
      </div>
    </div>
  );
}

function OrigemEscopoPage() {
  const carregar = useServerFn(origemEscopoContratual);
  const q = useQuery({ queryKey: ["origem-escopo"], queryFn: () => carregar({}) });

  const [somenteLacunas, setSomenteLacunas] = useState(false);
  const [mostrarFixture, setMostrarFixture] = useState(false);
  const [busca, setBusca] = useState("");

  const todas: LinhaOrigem[] = useMemo(() => q.data?.linhas ?? [], [q.data]);
  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return todas.filter(
      (l) =>
        (mostrarFixture || !l.fixture) &&
        (!somenteLacunas || !l.cadeia_completa) &&
        (!termo ||
          [l.titulo, l.contrato, l.caso, l.proposta.rotulo, l.sku.rotulo, l.condicao.rotulo, l.ordem.rotulo]
            .join(" ")
            .toLowerCase()
            .includes(termo)),
    );
  }, [todas, somenteLacunas, mostrarFixture, busca]);

  const resumo = q.data?.resumo;

  return (
    <SaasShell
      titulo="Origem do escopo contratual"
      descricao="Cadeia Proposta vN → SKU → Condição comercial → OS de cada item. Leitura auditável: nada é vinculado, corrigido ou enviado aqui."
      acoes={
        <button
          onClick={() => baixarCsvOrigemEscopo(linhas)}
          disabled={!linhas.length}
          className="rounded-md border border-gold/60 px-3 py-1.5 text-sm text-navy hover:bg-gold/10 disabled:opacity-40"
        >
          Exportar CSV
        </button>
      }
    >
      <div className="space-y-4">
        {resumo ? (
          <Painel titulo="Síntese da cadeia (sem DEMO/TESTE)">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-navy/10 p-3">
                <div className="text-2xl font-serif text-navy">{resumo.total}</div>
                <div className="text-xs text-navy/60">itens de escopo</div>
              </div>
              <div className="rounded-lg border border-navy/10 p-3">
                <div className="text-2xl font-serif text-navy">{resumo.cadeias_completas}</div>
                <div className="text-xs text-navy/60">com os 4 vínculos persistidos</div>
              </div>
              <div className="rounded-lg border border-navy/10 p-3">
                <div className="text-2xl font-serif text-terracotta">{resumo.com_lacuna}</div>
                <div className="text-xs text-navy/60">com alguma lacuna de origem</div>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-navy/50">
                  <tr>
                    <th className="py-2 pr-4">Eixo</th>
                    {(Object.keys(ROTULO_ESTADO) as EstadoVinculo[]).map((e) => (
                      <th key={e} className="py-2 pr-4">
                        {ROTULO_ESTADO[e]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EIXOS.map((eixo) => (
                    <tr key={eixo.chave} className="border-t border-navy/10">
                      <td className="py-2 pr-4 text-navy">{eixo.rotulo}</td>
                      {(Object.keys(ROTULO_ESTADO) as EstadoVinculo[]).map((e) => (
                        <td key={e} className="py-2 pr-4 text-navy/70">
                          {resumo.por_eixo[eixo.chave][e]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Painel>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-navy/10 bg-white p-3 text-sm">
          <input
            value={busca}
            onChange={(ev) => setBusca(ev.target.value)}
            placeholder="Buscar por item, contrato, caso, SKU, condição ou OS"
            className={`${inputCls} max-w-sm flex-1`}
          />
          <label className="flex items-center gap-2 text-navy/70">
            <input type="checkbox" checked={somenteLacunas} onChange={(ev) => setSomenteLacunas(ev.target.checked)} />
            Somente itens com lacuna
          </label>
          <label className="flex items-center gap-2 text-navy/70">
            <input type="checkbox" checked={mostrarFixture} onChange={(ev) => setMostrarFixture(ev.target.checked)} />
            Mostrar DEMO/TESTE
          </label>
          <span className="ml-auto text-xs text-navy/50">{linhas.length} item(ns) exibido(s)</span>
        </div>

        {q.isLoading ? (
          <EstadoVazio mensagem="Carregando a cadeia de origem…" />
        ) : q.error ? (
          <EstadoVazio mensagem={(q.error as Error).message} />
        ) : !linhas.length ? (
          <EstadoVazio mensagem="Nenhum item de escopo para os filtros escolhidos." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-cream/60 text-xs uppercase tracking-wide text-navy/60">
                <tr>
                  <th className="px-3 py-2">Item de escopo</th>
                  <th className="px-3 py-2">Proposta vN</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Condição</th>
                  <th className="px-3 py-2">OS</th>
                  <th className="px-3 py-2">Cadeia</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.id} className="border-t border-navy/10 align-top">
                    <td className="px-3 py-3">
                      <div className="font-medium text-navy">{l.titulo}</div>
                      <div className="mt-0.5 text-xs text-navy/60">
                        {l.categoria} · {l.status} · escopo v{l.versao_escopo ?? "?"} · origem {l.tipo_origem}
                      </div>
                      <div className="text-xs text-navy/50">
                        {l.contrato} · caso {l.caso}
                        {l.fixture ? " · DEMO/TESTE" : ""}
                      </div>
                      {l.referencia_origem ? (
                        <div className="mt-1 text-xs italic text-navy/45">{l.referencia_origem}</div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <Celula v={l.proposta} />
                    </td>
                    <td className="px-3 py-3">
                      <Celula v={l.sku} />
                    </td>
                    <td className="px-3 py-3">
                      <Celula v={l.condicao} />
                    </td>
                    <td className="px-3 py-3">
                      <Celula v={l.ordem} />
                    </td>
                    <td className="px-3 py-3">
                      {l.cadeia_completa ? (
                        <Selo texto="Completa" tom="ok" />
                      ) : (
                        <div className="space-y-1">
                          <Selo texto="Com lacuna" tom="alerta" />
                          <ul className="text-xs text-navy/60">
                            {l.lacunas.map((x) => (
                              <li key={x}>{x}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SaasShell>
  );
}
