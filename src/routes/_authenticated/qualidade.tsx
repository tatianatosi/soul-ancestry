import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PainelQualidade } from "@/components/qualidade/painel";
import { EIXOS_RADAR_CANONICOS, garantirEixosCanonicos } from "@/lib/radar-eixos";
import { MatrizPrioridadesConectada } from "@/components/desk/matriz-prioridades-conectada";

export const Route = createFileRoute("/_authenticated/qualidade")({
  head: () => ({
    meta: [
      { title: "Qualidade e inconsistências — Clube Ancestral" },
      {
        name: "description",
        content:
          "Checklists por fase, inconsistências por severidade, relatório operacional semanal e exportação CSV auditada.",
      },
      { property: "og:title", content: "Qualidade e inconsistências — Clube Ancestral" },
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
      descricao="Antes chamado Qualidade e fechamento. Checklists, inconsistências por severidade, relatório semanal e exportação CSV registrada em auditoria."
    >
      <EixosCanonicosInternos />
      {/*
        A matriz Elegibilidade × Urgência. O motor existia desde o P1.2 e era
        consumido só como etiqueta numa coluna; esta é a primeira tela que o
        desenha como matriz — o posicionamento de cada caso na carteira.
      */}
      <MatrizPrioridadesConectada />
      <PainelQualidade />
    </SaasShell>
  );
}

/**
 * Mesma restrição do Radar do cliente: o Radar Interno lê a jornada pelos
 * quatro eixos canônicos, sem eixo extra, para Cliente e Ops nunca divergirem.
 */
function EixosCanonicosInternos() {
  const eixos = garantirEixosCanonicos(EIXOS_RADAR_CANONICOS);

  return (
    <section className="mb-4 rounded-lg border border-navy/10 bg-cream/50 p-4">
      <h2 className="font-serif text-base text-navy">Eixos canônicos da leitura</h2>
      <p className="mt-1 text-xs text-navy/60">
        Leitura compartilhada com o Radar do cliente. Somente estes quatro eixos existem: nenhum
        eixo pode ser criado, renomeado ou reordenado em telas internas.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {eixos.map((eixo) => (
          <article key={eixo.id} className="rounded-md border border-navy/10 bg-background p-3">
            <h3 className="text-sm font-medium text-navy">{eixo.titulo}</h3>
            <p className="mt-1 text-xs text-navy/60">{eixo.resumo}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
