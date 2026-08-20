import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import {
  CRITERIOS_ACEITE,
  ESTADO_CRITERIO_LABEL,
  contarPorEstado,
  type EstadoCriterio,
} from "@/lib/criterios-aceite";

export const Route = createFileRoute("/_authenticated/governanca/criterios-aceite")({
  head: () => ({
    meta: [
      { title: "Critérios de aceite operacionais — Clube Ancestral" },
      {
        name: "description",
        content:
          "Registro somente leitura dos critérios de aceite do Desk Intelligence e do App Cliente, com evidência, rota e regra vigente.",
      },
      { property: "og:title", content: "Critérios de aceite operacionais" },
      {
        property: "og:description",
        content: "Critério → domínio → estado → evidência → rota, sem disparar automação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

const CLASSE_ESTADO: Record<EstadoCriterio, string> = {
  atendido: "bg-navy/5 text-navy border-navy/20",
  parcial: "bg-gold/15 text-navy border-gold/40",
  pendente: "bg-terracotta/10 text-terracotta border-terracotta/30",
};

function Pagina() {
  const contagem = contarPorEstado();

  return (
    <SaasShell
      titulo="Critérios de aceite"
      descricao="Somente leitura. Cada critério aponta domínio, evidência de implementação, rota de conferência e a regra que o sustenta."
    >
      <div className="space-y-8">
        <section className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(ESTADO_CRITERIO_LABEL) as EstadoCriterio[]).map((estado) => (
            <div key={estado} className="rounded-xl border border-navy/10 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-navy/60">{ESTADO_CRITERIO_LABEL[estado]}</p>
              <p className="text-2xl font-semibold text-navy">{contagem[estado]}</p>
            </div>
          ))}
        </section>

        <section className="space-y-3">
          {CRITERIOS_ACEITE.map((c) => (
            <article key={c.id} className="rounded-xl border border-navy/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-navy/50">
                    {c.id} · {c.dominio}
                  </p>
                  <h2 className="text-base font-semibold text-navy">{c.criterio}</h2>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${CLASSE_ESTADO[c.estado]}`}>
                  {ESTADO_CRITERIO_LABEL[c.estado]}
                </span>
              </div>
              <p className="mt-3 text-sm text-navy/80">{c.evidencia}</p>
              <p className="mt-2 text-sm text-navy/60">
                <span className="font-medium text-navy/70">Regra:</span> {c.regra}
              </p>
              <p className="mt-1 text-xs text-navy/50">Conferência em {c.rota}</p>
            </article>
          ))}
        </section>
      </div>
    </SaasShell>
  );
}
