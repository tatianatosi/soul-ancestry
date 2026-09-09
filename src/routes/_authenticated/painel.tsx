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
        08/09/2026 — correção de um erro meu de 07/09. Ao encontrar
        /historico/painel-hoje e /historico/painel-desk-hoje sem nenhum link
        de entrada, eu "resolvi as órfãs" criando links para elas aqui. Era
        o conserto errado: as duas se declaravam legado ("preservado apenas
        para consulta interna", "sem uso diário") e mostravam o mesmo dia de
        trabalho que o PainelDia acima. Em vez de remover tela morta, eu a
        tornei alcançável e somei mais um lugar para olhar. As duas rotas
        foram arquivadas no git; os componentes seguem no histórico.
      */}
    </SaasShell>
  );
}
