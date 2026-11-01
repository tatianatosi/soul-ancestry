import { createFileRoute } from "@tanstack/react-router";

import { ProximasAcoes } from "@/components/crm/proximas-acoes";
import { SaasShell } from "@/components/saas/shell";

export const Route = createFileRoute("/_authenticated/proximas-acoes")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Próximas ações dos leads — Clube Ancestral" },
      {
        name: "description",
        content: "Fila única de próximas ações por lead, com correção rápida gravada na ficha canônica do CRM.",
      },
      { property: "og:title", content: "Próximas ações dos leads — Clube Ancestral" },
      { property: "og:description", content: "Tarefas e próximos passos comerciais vinculados aos leads do Desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProximasAcoesPage,
});

function ProximasAcoesPage() {
  return (
    <SaasShell
      titulo="Próximas ações"
      descricao="Tarefas comerciais derivadas dos leads: uma linha por lead, correção rápida sem duplicar registros."
    >
      <ProximasAcoes />
    </SaasShell>
  );
}
