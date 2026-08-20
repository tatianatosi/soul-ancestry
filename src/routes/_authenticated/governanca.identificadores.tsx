import { createFileRoute } from "@tanstack/react-router";

import {
  EXEMPLOS,
  FORMATO_CASO,
  FORMATO_LEAD,
  MODELOS,
  PREFIXO_FIXTURE,
  REGRAS_LEITURA,
  ROTULO_FIXTURE,
} from "@/lib/identificadores-norma";

export const Route = createFileRoute("/_authenticated/governanca/identificadores")({
  head: () => ({
    meta: [
      { title: "Identificadores canônicos — Clube Ancestral" },
      {
        name: "description",
        content: "Referência de leitura dos identificadores de lead, caso e fixture usados no Desk Intelligence.",
      },
      { property: "og:title", content: "Identificadores canônicos — Clube Ancestral" },
      { property: "og:description", content: "Formatos, modelos e exemplos normativos de identificação de leads e casos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Identificadores,
});

function Identificadores() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 className="font-serif text-xl text-navy">Identificadores canônicos</h1>
        <p className="rounded border border-gold/40 bg-gold/10 p-2 text-[11px] text-navy/70">
          Referência de leitura. Esta tela não gera, não valida e não renomeia identificadores: códigos já em uso permanecem como estão,
          com seus aliases históricos preservados.
        </p>
      </header>

      <section className="rounded-lg border border-navy/10 bg-cream/40 p-4">
        <h2 className="font-serif text-base text-navy">Formatos</h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          <li>
            Caso: <code className="font-mono text-navy">{FORMATO_CASO}</code>
          </li>
          <li>
            Lead: <code className="font-mono text-navy">{FORMATO_LEAD}</code>
          </li>
          <li>
            Fixture: prefixo <code className="font-mono text-navy">{PREFIXO_FIXTURE}</code> — apenas sinalizado nas telas.
          </li>
        </ul>
      </section>

      <section className="rounded-lg border border-navy/10 bg-cream/40 p-4">
        <h2 className="font-serif text-base text-navy">Modelos</h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          {MODELOS.map((m) => (
            <li key={m.codigo}>
              <strong className="font-mono text-navy">{m.codigo}</strong> — {m.nome}: {m.descricao}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-navy/10 bg-cream/40 p-4">
        <h2 className="font-serif text-base text-navy">Exemplos de referência</h2>
        <div className="mt-2 space-y-2">
          {EXEMPLOS.map((e) => (
            <article key={e.codigo} className="rounded-md border border-navy/10 bg-background p-3">
              <p className="flex flex-wrap items-center gap-2">
                <code className="font-mono text-sm text-navy">{e.codigo}</code>
                {e.fixture && (
                  <span className="rounded-full border border-terracotta/40 bg-terracotta/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-terracotta">
                    {ROTULO_FIXTURE}
                  </span>
                )}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-navy/40">{e.contexto}</p>
              <p className="mt-1 text-xs text-navy/70">{e.leitura}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-navy/10 bg-cream/40 p-4">
        <h2 className="font-serif text-base text-navy">Regras de leitura</h2>
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-navy/70">
          {REGRAS_LEITURA.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
