import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Entrada antiga por token no endereço, aposentada em 16/09/2026.
 *
 * Era uma segunda porta de cliente, sem login e sem as regras de acesso do
 * App: quem tivesse o endereço via o acompanhamento. O acesso da família passa
 * a ser único — link enviado ao e-mail autorizado, em /acesso. Nada foi
 * apagado no banco: só esta porta deixou de existir.
 */
export const Route = createFileRoute("/canvas/$token")({
  beforeLoad: () => {
    throw redirect({ to: "/acesso", replace: true });
  },
  component: () => null,
});
