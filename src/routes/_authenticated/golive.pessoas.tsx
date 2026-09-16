import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /nucleos. */
export const Route = createFileRoute("/_authenticated/golive/pessoas")({
  beforeLoad: () => {
    throw redirect({ to: "/nucleos" });
  },
  component: () => null,
});
