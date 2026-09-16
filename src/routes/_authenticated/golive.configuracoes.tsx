import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /configuracoes. */
export const Route = createFileRoute("/_authenticated/golive/configuracoes")({
  beforeLoad: () => {
    throw redirect({ to: "/configuracoes" });
  },
  component: () => null,
});
