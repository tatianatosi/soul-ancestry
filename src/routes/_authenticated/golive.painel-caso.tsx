import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /casos. */
export const Route = createFileRoute("/_authenticated/golive/painel-caso")({
  beforeLoad: () => {
    throw redirect({ to: "/casos" });
  },
  component: () => null,
});
