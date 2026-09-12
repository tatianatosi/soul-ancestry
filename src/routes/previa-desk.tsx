import { createFileRoute } from "@tanstack/react-router";

import { PreviaDeskTelas } from "@/components/desk/previa-desk-telas";

/**
 * Prévia visual do Desk — as 12 telas do mockup aprovado convertidas em
 * superfícies do Desk com marca, logo e tipografia oficiais.
 *
 * Rota pública de leitura (como /previa-app-cliente): não lê dado real,
 * não escreve, não expõe caso de cliente. Serve para a proprietária ver
 * o layout sem depender de sessão.
 */
export const Route = createFileRoute("/previa-desk")({
  head: () => ({
    meta: [
      { title: "Prévia do Desk — Clube Ancestral" },
      {
        name: "description",
        content:
          "Prévia visual do Desk Intelligence do Clube Ancestral: doze telas com marca, logo e tipografia oficiais. Dados demonstrativos.",
      },
      { property: "og:title", content: "Prévia do Desk — Clube Ancestral" },
      {
        property: "og:description",
        content: "Doze telas do Desk com a identidade oficial do Clube Ancestral.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaDesk,
});

function PreviaDesk() {
  return <PreviaDeskTelas />;
}
