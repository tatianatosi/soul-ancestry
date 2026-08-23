import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { FaixaHistorica } from "@/components/painel/faixa-historica";
import { PainelHoje } from "@/components/painel/painel-hoje";

export const Route = createFileRoute("/_authenticated/historico/painel-hoje")({
  head: () => ({
    meta: [
      { title: "Visão histórica — Painel Hoje (legado) — Clube Ancestral" },
      {
        name: "description",
        content: "Painel Hoje legado preservado como visão histórica. A execução diária acontece no Painel Hoje canônico.",
      },
      { property: "og:title", content: "Visão histórica — Painel Hoje (legado)" },
      { property: "og:description", content: "Painel preservado apenas para consulta interna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoricoPainelHoje,
});

function HistoricoPainelHoje() {
  return (
    <SaasShell titulo="Visão histórica — Painel Hoje (legado)" descricao="Preservado para consulta interna. Sem uso diário.">
      <FaixaHistorica />
      <PainelHoje />
    </SaasShell>
  );
}
