import { createFileRoute } from "@tanstack/react-router";

import { SessaoDemoAppCliente } from "@/components/portal/sessao-demo-app-cliente";

/**
 * Sessão demo do App Cliente — superfície interna do Desk.
 *
 * Existe para a Proprietária mostrar a experiência do cliente a um futuro
 * cliente, compartilhando tela (decisão de 25/08/2026), e para conferir como
 * as telas estão de fato, sem depender de conta de cliente.
 *
 * Renderiza os componentes reais do portal via `SessaoDemoAppCliente`.
 */

export const Route = createFileRoute("/_authenticated/app-cliente-demo")({
  /** Mesmo motivo de `previa-app-cliente.tsx`: `aba` via Router evita mismatch de hidratação. */
  validateSearch: (search: Record<string, unknown>): { aba?: string } => ({
    aba: typeof search.aba === "string" ? search.aba : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sessão demo do App Cliente — Clube Ancestral" },
      {
        name: "description",
        content:
          "Demonstração interna da experiência do App Cliente, com caso fictício. Superfície do Desk.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AppClienteDemo,
});

function AppClienteDemo() {
  const { aba } = Route.useSearch();
  return <SessaoDemoAppCliente abaInicial={aba} />;
}
