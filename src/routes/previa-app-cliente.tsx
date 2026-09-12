import { createFileRoute } from "@tanstack/react-router";

import {
  PranchaAppCliente,
  TELAS_PRANCHA_APP,
  type FormatoPranchaApp,
  type TelaPranchaApp,
} from "@/components/portal/prancha-app-cliente";

/**
 * Prévia pública go-live — App Cliente full-bleed (mockup).
 *
 * Sem card/pills do Desk. Só PortalShell + fixture rotulada.
 * Prova visual: Home/Jornada desktop + Home mobile (bottom nav).
 */

export const Route = createFileRoute("/previa-app-cliente")({
  validateSearch: (search: Record<string, unknown>) => ({
    formato: search.formato === "mobile" ? "mobile" : "desktop" as FormatoPranchaApp,
    tela:
      typeof search.tela === "string" && TELAS_PRANCHA_APP.includes(search.tela as TelaPranchaApp)
        ? (search.tela as TelaPranchaApp)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Prancha App Cliente — Clube Ancestral" },
      {
        name: "description",
        content: "Prancha visual para aceite das sete telas canônicas do App Cliente.",
      },
      { property: "og:title", content: "Prancha App Cliente — Clube Ancestral" },
      { property: "og:description", content: "Prancha visual das sete telas canônicas do App Cliente." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaAppCliente,
});

function PreviaAppCliente() {
  const { formato, tela } = Route.useSearch();
  return <PranchaAppCliente formato={formato} tela={tela} />;
}
