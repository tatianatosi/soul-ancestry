import { createFileRoute } from "@tanstack/react-router";
import { StudioDevolutivas } from "@/components/studio-devolutivas";

export const Route = createFileRoute("/studio-devolutivas")({
  head: () => ({
    meta: [
      { title: "Studio de Devolutivas — Clube Ancestral" },
      {
        name: "description",
        content:
          "Área interna para diagramar a one-page de leitura inicial de pesquisa genealógica. Preview interno com dados demonstrativos.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Studio de Devolutivas — Clube Ancestral" },
      {
        property: "og:description",
        content: "One-page de leitura inicial — preview interno com dados demonstrativos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudioDevolutivas,
});
