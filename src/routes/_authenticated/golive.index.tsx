import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /painel. */
export const Route = createFileRoute("/_authenticated/golive/")({
  beforeLoad: () => {
    throw redirect({ to: "/painel" });
  },
  component: () => null,
});
