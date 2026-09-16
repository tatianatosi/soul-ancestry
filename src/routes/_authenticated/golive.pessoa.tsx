import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /clientes. */
export const Route = createFileRoute("/_authenticated/golive/pessoa")({
  beforeLoad: () => {
    throw redirect({ to: "/clientes" });
  },
  component: () => null,
});
