import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /contratos. */
export const Route = createFileRoute("/_authenticated/golive/formalizacao")({
  beforeLoad: () => {
    throw redirect({ to: "/contratos" });
  },
  component: () => null,
});
