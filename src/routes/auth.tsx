import { createFileRoute, redirect } from "@tanstack/react-router";

/** Rota legada: o login interno vive em /equipe/entrar. */
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/equipe/entrar", replace: true });
  },
  component: () => null,
});
