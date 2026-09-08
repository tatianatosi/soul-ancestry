import { createFileRoute, Link } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PainelDia } from "@/components/painel/painel-dia";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel Hoje — Clube Ancestral" },
      { name: "description", content: "Fila priorizada do dia, exceções sem dono, comercial e casos com prazo." },
      { property: "og:title", content: "Painel Hoje — Clube Ancestral" },
      { property: "og:description", content: "O que precisa de ação hoje, por quem e até quando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  return (
    <SaasShell titulo="Painel Hoje" descricao="O que precisa de ação hoje, por quem e até quando.">
      <PainelDia />
      {/*
        07/09/2026 — auditoria de rotas fora do catálogo do Desk encontrou
        estas duas visões históricas (Painel Hoje e Painel Desk Hoje em
        versões anteriores, substituídas por PainelDia acima) sem nenhum
        link de entrada em lugar nenhum do sistema — mesmo já registradas
        como "históricas" em fontes-canonicas-indicadores.ts e cobertas por
        teste dedicado (ca-ux-03-fase-b.test.ts). Nada foi apagado; só
        faltava o link, no mesmo padrão já usado em /leads para
        /historico/fluxo-comercial-canonico.
      */}
      <p className="mt-6 rounded-lg border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70">
        Versões anteriores deste painel viraram visão histórica, sem gravação nova.{" "}
        <Link to="/historico/painel-hoje" className="underline">
          Abrir Painel Hoje (histórico)
        </Link>{" "}
        ·{" "}
        <Link to="/historico/painel-desk-hoje" className="underline">
          Abrir Painel Desk Hoje (histórico)
        </Link>
      </p>
    </SaasShell>
  );
}
