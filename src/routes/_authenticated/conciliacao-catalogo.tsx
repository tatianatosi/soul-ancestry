import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { Painel, Selo, inputCls } from "@/components/comercial/base";
import { varreduraConciliacaoCatalogo } from "@/lib/conciliacao-catalogo.functions";

export const Route = createFileRoute("/_authenticated/conciliacao-catalogo")({
  head: () => ({
    meta: [
      { title: "Conciliação de catálogo e bloqueios — Clube Ancestral" },
      {
        name: "description",
        content:
          "Conciliação de SKU, preço e escopo contra o catálogo homologado, com as divergências que impedem gerar OS e contrato.",
      },
      { property: "og:title", content: "Conciliação de catálogo e bloqueios — Clube Ancestral" },
      {
        property: "og:description",
        content: "Divergências classificadas e bloqueios de emissão de OS e contrato por proposta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ConciliacaoCatalogoPage,
});

const moeda = (v: number | null) =>
  v === null || v === undefined
    ? "—"
    : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ConciliacaoCatalogoPage() {
  const carregar = useServerFn(varreduraConciliacaoCatalogo);
  const q = useQuery({ queryKey: ["conciliacao-catalogo"], queryFn: () => carregar({}) });

  const [somenteBloqueadas, setSomenteBloqueadas] = useState(false);
  const [busca, setBusca] = useState("");

  const todas = useMemo(() => q.data?.linhas ?? [], [q.data]);
  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return todas.filter(
      (l) =>
        (!somenteBloqueadas || !l.pode_gerar_os) &&
        (!termo || [l.caso, l.sku ?? "", l.status ?? ""].join(" ").toLowerCase().includes(termo)),
    );
  }, [todas, somenteBloqueadas, busca]);

  const resumo = q.data?.resumo;

  return (
    <SaasShell
      titulo="Conciliação de catálogo e bloqueios"
      descricao="Somente SKU, preço e condição homologados no catálogo valem. Divergência bloqueante impede gerar OS e contrato. Leitura auditável: nada é aprovado, corrigido ou enviado aqui."
    >
      <div className="space-y-4">
        {resumo ? (
          <Painel titulo="Síntese da conciliação (sem DEMO/TESTE)">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-navy/10 p-3">
                <div className="text-2xl font-serif text-navy">{resumo.total}</div>
                <div className="text-xs text-navy/60">propostas conciliadas</div>
              </div>
              <div className="rounded-lg border border-navy/10 p-3">
                <div className="text-2xl font-serif text-navy">{resumo.liberadas}</div>
                <div className="text-xs text-navy/60">liberadas para OS e contrato</div>
              </div>
              <div className="rounded-lg border border-navy/10 p-3">
                <div className="text-2xl font-serif text-terracotta">{resumo.bloqueadas}</div>
                <div className="text-xs text-navy/60">bloqueadas por divergência</div>
              </div>
              <div className="rounded-lg border border-navy/10 p-3">
                <div className="text-2xl font-serif text-gold">{resumo.atencao}</div>
                <div className="text-xs text-navy/60">liberadas com pontos de atenção</div>
              </div>
            </div>
          </Painel>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <input
            className={`${inputCls} max-w-xs`}
            placeholder="Buscar por caso, SKU ou status"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-navy/70">
            <input
              type="checkbox"
              checked={somenteBloqueadas}
              onChange={(e) => setSomenteBloqueadas(e.target.checked)}
            />
            Somente bloqueadas
          </label>
        </div>

        {q.isLoading ? (
          <Painel titulo="Carregando">
            <p className="text-sm text-navy/60">Conciliando propostas contra o catálogo homologado…</p>
          </Painel>
        ) : !linhas.length ? (
          <EstadoVazio mensagem="Não há proposta viva que atenda ao filtro atual." />
        ) : (
          <div className="space-y-3">
            {linhas.map((l) => (
              <Painel key={l.proposalId} titulo={`${l.caso} — proposta v${l.versao ?? "—"}`}>
                <div className="flex flex-wrap items-center gap-2 text-sm text-navy/70">
                  <Selo texto={`SKU ${l.sku ?? "não declarado"}`} tom={l.sku ? "neutro" : "erro"} />
                  <Selo texto={`Preço homologado ${moeda(l.preco_homologado)}`} tom="neutro" />
                  <Selo texto={`Status ${l.status ?? "—"}`} tom="neutro" />
                  <Selo
                    texto={l.pode_gerar_os ? "OS e contrato liberados" : "OS e contrato bloqueados"}
                    tom={l.pode_gerar_os ? "ok" : "erro"}
                  />
                </div>

                {l.divergencias.length ? (
                  <ul className="mt-3 space-y-2">
                    {l.divergencias.map((d, i) => (
                      <li
                        key={`${l.proposalId}-${d.codigo}-${i}`}
                        className="rounded-lg border border-navy/10 p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Selo
                            texto={d.severidade === "bloqueante" ? "Bloqueante" : "Atenção"}
                            tom={d.severidade === "bloqueante" ? "erro" : "alerta"}
                          />
                          <span className="font-mono text-xs text-navy/50">{d.codigo}</span>
                        </div>
                        <p className="mt-1 text-navy">{d.descricao}</p>
                        {d.valor_catalogo !== undefined || d.valor_observado !== undefined ? (
                          <p className="mt-1 text-xs text-navy/60">
                            Catálogo: {String(d.valor_catalogo ?? "—")} · Observado:{" "}
                            {String(d.valor_observado ?? "—")}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-navy/60">
                    Sem divergência: SKU, preço, condição e escopo batem com o catálogo homologado.
                  </p>
                )}
              </Painel>
            ))}
          </div>
        )}
      </div>
    </SaasShell>
  );
}
