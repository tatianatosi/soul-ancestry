import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /matriz-juridica. */
export const Route = createFileRoute("/_authenticated/golive/juridico")({
  beforeLoad: () => {
    throw redirect({ to: "/matriz-juridica" });
  },
  component: () => null,
});
