import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /financeiro. */
export const Route = createFileRoute("/_authenticated/golive/financeiro")({
  beforeLoad: () => {
    throw redirect({ to: "/financeiro" });
  },
  component: () => null,
});
