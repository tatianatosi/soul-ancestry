import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /leads. */
export const Route = createFileRoute("/_authenticated/golive/leads")({
  beforeLoad: () => {
    throw redirect({ to: "/leads" });
  },
  component: () => null,
});
