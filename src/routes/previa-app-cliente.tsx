import { createFileRoute } from "@tanstack/react-router";

import { SessaoDemoAppCliente } from "@/components/portal/sessao-demo-app-cliente";

/**
 * Prévia pública go-live — App Cliente full-bleed (mockup).
 *
 * Sem card/pills do Desk. Só PortalShell + fixture rotulada.
 * Prova visual: Home/Jornada desktop + Home mobile (bottom nav).
 */

export const Route = createFileRoute("/previa-app-cliente")({
  /**
   * `aba` decide a aba inicial da prévia. Validado aqui (Router) em vez de
   * lido de `window.location.search` no componente: o Router resolve o
   * mesmo valor no servidor e no cliente a partir da mesma URL, o que evita
   * o mismatch de hidratação que existia antes (servidor sempre caía em
   * "Home" porque `window` não existe lá).
   */
  validateSearch: (search: Record<string, unknown>): { aba?: string } => ({
    aba: typeof search.aba === "string" ? search.aba : undefined,
  }),
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
  const { aba } = Route.useSearch();
  return <SessaoDemoAppCliente modo="cliente" abaInicial={aba} />;
}
