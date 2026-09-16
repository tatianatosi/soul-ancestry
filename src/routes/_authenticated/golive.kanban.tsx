import { createFileRoute, redirect } from "@tanstack/react-router";

/** Prévia histórica. A tela dona desta superfície é /tarefas. */
export const Route = createFileRoute("/_authenticated/golive/kanban")({
  beforeLoad: () => {
    throw redirect({ to: "/tarefas" });
  },
  component: () => null,
});
