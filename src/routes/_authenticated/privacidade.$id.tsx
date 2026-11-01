import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PrivacidadeCaso } from "@/components/privacidade/painel";

export const Route = createFileRoute("/_authenticated/privacidade/$id")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Privacidade e acesso — Clube Ancestral" },
      { name: "description", content: "Documentos, consentimentos, matriz de permissões e eventos recentes do caso." },
      { property: "og:title", content: "Privacidade e acesso — Clube Ancestral" },
      { property: "og:description", content: "Documentos, consentimentos e permissões do caso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  const { id } = Route.useParams();
  return (
    <SaasShell titulo="Privacidade e acesso" descricao="Documentos, consentimentos e permissões deste caso.">
      <PrivacidadeCaso casoId={id} />
    </SaasShell>
  );
}
