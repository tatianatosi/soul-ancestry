import { createFileRoute, Outlet } from "@tanstack/react-router";

/**
 * Área pública de acesso do cliente. É apenas o contêiner das telas
 * /acesso, /acesso/confirmar e /acesso/sem-permissao — sem conteúdo próprio,
 * para que as telas filhas realmente apareçam.
 */
export const Route = createFileRoute("/acesso")({
  component: () => <Outlet />,
});
