import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { VarreduraAdministracao } from "@/components/governanca/varredura-administracao";

export const Route = createFileRoute("/_authenticated/governanca/varredura-administracao")({
  head: () => ({
    meta: [
      { title: "Varredura de administração e contingência — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Bloqueios remanescentes da proprietária administradora, mapa de administradoras de contingência e pacote único de aprovações pendentes.",
      },
      { property: "og:title", content: "Varredura de administração e contingência — Clube Ancestral Desk" },
      {
        property: "og:description",
        content: "Autonomia interna auditada separada das confirmações externas obrigatórias.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <SaasShell
      titulo="Varredura de administração, contingência e poder da proprietária"
      descricao="Auditoria e preparação. Nenhum papel, convite, e-mail, segredo, migration, integração ou dado é alterado nesta tela."
    >
      <VarreduraAdministracao />
    </SaasShell>
  );
}
