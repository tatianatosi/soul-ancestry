import { PortalVazio } from "@/components/portal/portal-shell";

/**
 * Alias do estado vazio já usado no App Cliente (`PortalVazio`, em
 * portal-shell.tsx) — não duplica a implementação, só dá o nome do padrão
 * de componentes (`CaEmptyState`) ao que já existe e já está em produção.
 */
export function CaEmptyState({ texto }: { texto: string }) {
  return <PortalVazio mensagem={texto} />;
}
