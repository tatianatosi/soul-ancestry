import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /pesquisa-modulo. */
export const Route = createFileRoute("/_authenticated/golive/pesquisa")({
  beforeLoad: () => {
    throw redirect({ to: "/pesquisa-modulo" });
  },
  component: () => null,
});
