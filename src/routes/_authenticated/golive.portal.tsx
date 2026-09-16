import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /acessos-portal. */
export const Route = createFileRoute("/_authenticated/golive/portal")({
  beforeLoad: () => {
    throw redirect({ to: "/acessos-portal" });
  },
  component: () => null,
});
