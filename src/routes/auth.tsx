import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Endereço legado. Não é uma entrada própria: a única porta interna é
 * /equipe/entrar (e-mail e senha da equipe). Mantido apenas para não quebrar
 * links antigos guardados no navegador.
 */
export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/equipe/entrar", replace: true });
  },
  component: () => null,
});
