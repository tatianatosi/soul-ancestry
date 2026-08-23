import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { FaixaHistorica } from "@/components/painel/faixa-historica";
import { PainelDeskHoje } from "@/components/painel/painel-desk-hoje";

export const Route = createFileRoute("/_authenticated/historico/painel-desk-hoje")({
  head: () => ({
    meta: [
      { title: "Visão histórica — Painel Desk Hoje — Clube Ancestral" },
      {
        name: "description",
        content: "Painel Desk Hoje preservado como visão histórica. A execução diária acontece no Painel Hoje.",
      },
      { property: "og:title", content: "Visão histórica — Painel Desk Hoje" },
      { property: "og:description", content: "Painel preservado apenas para consulta interna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoricoPainelDeskHoje,
});

function HistoricoPainelDeskHoje() {
  return (
    <SaasShell titulo="Visão histórica — Painel Desk Hoje" descricao="Preservado para consulta interna. Sem uso diário.">
      <FaixaHistorica />
      <PainelDeskHoje />
    </SaasShell>
  );
}
