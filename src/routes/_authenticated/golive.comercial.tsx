import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /calls. */
export const Route = createFileRoute("/_authenticated/golive/comercial")({
  beforeLoad: () => {
    throw redirect({ to: "/calls" });
  },
  component: () => null,
});
