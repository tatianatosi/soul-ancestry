import { createFileRoute } from "@tanstack/react-router";

import { SessaoDemoAppCliente } from "@/components/portal/sessao-demo-app-cliente";

/**
 * Prévia pública go-live — App Cliente full-bleed (mockup).
 *
 * Sem card/pills do Desk. Só PortalShell + fixture rotulada.
 * Prova visual: Home/Jornada desktop + Home mobile (bottom nav).
 */

export const Route = createFileRoute("/previa-app-cliente")({
  head: () => ({
    meta: [
      { title: "Prévia App Cliente — Clube Ancestral" },
      {
        name: "description",
        content:
          "Prévia full-bleed do App Cliente (mockup): sete abas, mobile e web. Dados demonstrativos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaAppCliente,
});

function PreviaAppCliente() {
  return <SessaoDemoAppCliente modo="cliente" />;
}
