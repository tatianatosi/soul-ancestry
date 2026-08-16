import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { ManifestoResgate } from "@/components/governanca/manifesto";

export const Route = createFileRoute("/_authenticated/biblioteca")({
  head: () => ({
    meta: [
      { title: "Manifesto de Resgate — Clube Ancestral" },
      {
        name: "description",
        content: "Governança e biblioteca: artefatos, decisões, versões e lacunas em acompanhamento contínuo.",
      },
      { property: "og:title", content: "Manifesto de Resgate — Clube Ancestral" },
      { property: "og:description", content: "Registro de artefatos, decisões e histórico de versões da operação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BibliotecaPage,
});

function BibliotecaPage() {
  return (
    <SaasShell
      titulo="Governança e Biblioteca"
      descricao="Nada é apagado: artefatos, decisões e documentos são versionados, arquivados com motivo e mantidos visíveis até a resolução."
    >
      <ManifestoResgate />
    </SaasShell>
  );
}
