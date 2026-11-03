import { createFileRoute } from "@tanstack/react-router";
import { StudioDevolutivas } from "@/components/studio-devolutivas";

// Corte D (09/09/2026, limpeza pré-Perfil 360) — esta rota vivia fora de
// _authenticated: qualquer visitante, sem login, alcançava o preview pela
// URL. Movida para dentro de _authenticated (herda o guard de autenticação
// de route.tsx); o componente em si não mudou.
export const Route = createFileRoute("/_authenticated/studio-devolutivas")({
  staticData: { sitemap: false },
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
