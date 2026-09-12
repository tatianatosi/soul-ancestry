import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PainelQualidade } from "@/components/qualidade/painel";
import { MatrizPrioridadesConectada } from "@/components/desk/matriz-prioridades-conectada";
import { RadarCarteiraConectado } from "@/components/desk/radar-carteira-conectado";
import { EIXOS_RADAR_CANONICOS, garantirEixosCanonicos } from "@/lib/radar-eixos";

export const Route = createFileRoute("/_authenticated/qualidade")({
  head: () => ({
    meta: [
      { title: "Radar Interno — Clube Ancestral" },
      {
        name: "description",
        content:
          "Checklists por fase, inconsistências por severidade, relatório operacional semanal e exportação CSV auditada.",
      },
      { property: "og:title", content: "Radar Interno — Clube Ancestral" },
      {
        property: "og:description",
        content: "Controles de qualidade e relatórios internos por organização.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QualidadePage,
});

function QualidadePage() {
  return (
    <SaasShell
      titulo="Radar Interno"
      descricao="Radar da carteira, matriz de prioridade e leitura de qualidade por caso."
      visualKit="pantone"
    >
      <div className="mb-6">
        <RadarCarteiraConectado />
      </div>
      <p className="mb-4 text-sm text-navy/70">
        Cada ponto é um caso ativo. O quadrante superior direito pede ação agora — alta urgência e
        leitura de elegibilidade mais forte. Sem campo preenchido, o ponto não é inventado: a
        legenda declara dados insuficientes.
      </p>
      <div className="mb-6">
        <MatrizPrioridadesConectada />
      </div>
      <details className="mb-6 rounded-xl border border-navy/10 bg-cream/40 p-4">
        <summary className="cursor-pointer font-serif text-base text-navy">
          Qualidade, checklists e exportação
        </summary>
        <div className="mt-4">
          <EixosCanonicosInternos />
          <PainelQualidade />
        </div>
      </details>
    </SaasShell>
  );
}

/**
 * Radar Interno (Desk) usa os quatro eixos da jornada (radar-eixos.ts).
 * Distinto das seis dimensões do App Cliente (radar-seis-eixos.ts). Sem eixo extra aqui.
 */
function EixosCanonicosInternos() {
  const eixos = garantirEixosCanonicos(EIXOS_RADAR_CANONICOS);

  return (
    <section className="mb-4 rounded-lg border border-navy/10 bg-cream/50 p-4">
      <h2 className="font-serif text-base text-navy">Eixos canônicos da leitura</h2>
      <p className="mt-1 text-xs text-navy/60">
        Radar Interno do Desk — quatro eixos da jornada (radar-eixos.ts), compartilhados com a leitura de progresso do cliente. Distinto das 6 dimensões do App (radar-seis-eixos.ts). Nenhum eixo extra aqui.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {eixos.map((eixo) => (
          <article key={eixo.id} className="rounded-md border border-navy/10 bg-cream/60 p-3">
            <h3 className="text-sm font-medium text-navy">{eixo.titulo}</h3>
            <p className="mt-1 text-xs text-navy/60">{eixo.resumo}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
