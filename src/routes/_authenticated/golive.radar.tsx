import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /qualidade. */
export const Route = createFileRoute("/_authenticated/golive/radar")({
  beforeLoad: () => {
    throw redirect({ to: "/qualidade" });
  },
  component: () => null,
});
