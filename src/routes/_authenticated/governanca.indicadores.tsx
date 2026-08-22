import { createFileRoute } from "@tanstack/react-router";

import { BACKLOG_POS_MIGRACAO, GATILHOS } from "@/lib/fila-comunicacao";
import { INDICADORES, REGRAS_INDICADORES } from "@/lib/indicadores-governanca";

export const Route = createFileRoute("/_authenticated/governanca/indicadores")({
  head: () => ({
    meta: [
      { title: "Indicadores e métricas — Clube Ancestral" },
      {
        name: "description",
        content: "Registro interno de indicadores do Desk: matriz de origem, definição, fonte canônica e telas onde são consumidos.",
      },
      { property: "og:title", content: "Indicadores e métricas — Clube Ancestral" },
      { property: "og:description", content: "Definição e origem de cada indicador operacional do Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IndicadoresPage,
});

function IndicadoresPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 className="font-serif text-xl text-navy">Indicadores e métricas</h1>
        <p className="rounded border border-gold/40 bg-gold/10 p-2 text-[11px] text-navy/70">
          Registro de leitura. Não substitui a Biblioteca Mestre nem as Bases Genealógicas: aqui ficam apenas definição, origem e
          destino de uso de cada indicador. Conteúdo interno ao Desk.
        </p>
      </header>

      <section className="overflow-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[860px] text-left text-xs">
          <thead className="bg-cream/60 text-navy/70">
            <tr>
              <th className="px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Indicador</th>
              <th className="px-3 py-2 font-medium">Matriz de origem</th>
              <th className="px-3 py-2 font-medium">Definição</th>
              <th className="px-3 py-2 font-medium">Fonte canônica</th>
              <th className="px-3 py-2 font-medium">Consumido em</th>
            </tr>
          </thead>
          <tbody>
            {INDICADORES.map((i) => (
              <tr key={i.codigo} className="border-t border-navy/10 align-top">
                <td className="px-3 py-2 font-mono text-[11px] text-navy">{i.codigo}</td>
                <td className="px-3 py-2 font-medium text-navy">{i.nome}</td>
                <td className="px-3 py-2 text-navy/70">{i.matriz_origem}</td>
                <td className="px-3 py-2 text-navy/70">{i.definicao}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-navy/70">{i.fonte_canonica}</td>
                <td className="px-3 py-2 text-navy/70">{i.consumido_em.join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-navy/10 bg-white p-4">
        <h2 className="font-serif text-base text-navy">Fila humana de comunicação</h2>
        <p className="mt-1 text-[11px] text-navy/60">
          Envio automático desabilitado neste corte: o Desk apenas sugere contato em rascunho, com motivo e prioridade. Aprovação e
          envio são sempre humanos.
        </p>
        <ul className="mt-2 grid gap-1 text-xs text-navy/70 sm:grid-cols-2">
          {GATILHOS.map((g) => (
            <li key={g.chave}>
              • <strong>{g.rotulo}</strong> (prioridade {g.prioridade}) — {g.motivo}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] uppercase tracking-wide text-navy/45">Backlog pós-migração (fora deste corte)</p>
        <ul className="mt-1 space-y-1 text-xs text-navy/60">
          {BACKLOG_POS_MIGRACAO.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-navy/10 bg-cream/40 p-4">
        <h2 className="font-serif text-base text-navy">Regras de uso</h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          {REGRAS_INDICADORES.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

