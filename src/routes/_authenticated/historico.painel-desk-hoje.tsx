import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { FaixaVisaoHistorica } from "@/components/painel/faixa-historica";
import { PainelDeskHoje } from "@/components/painel/painel-desk-hoje";

export const Route = createFileRoute("/_authenticated/historico/painel-desk-hoje")({
  head: () => ({
    meta: [
      { title: "Visão histórica — Painel Desk Hoje | Clube Ancestral" },
      { name: "description", content: "Leitura histórica do painel comercial do Desk, preservada para consulta interna." },
      { property: "og:title", content: "Visão histórica — Painel Desk Hoje" },
      { property: "og:description", content: "Painel aposentado visualmente; execução diária ocorre no Painel Hoje." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoricoPainelDeskHoje,
});

function HistoricoPainelDeskHoje() {
  return (
    <SaasShell titulo="Visão histórica" descricao="Painel preservado para consulta interna. Não é fila de execução diária.">
      <FaixaVisaoHistorica />
      <PainelDeskHoje />
    </SaasShell>
  );
}
