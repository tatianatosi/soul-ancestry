/**
 * Botão para staff testar como cliente.
 *
 * Aparece no painel do staff. Clica e vai direto pro app cliente
 * com dados reais de Ana Luiza (ou outro cliente).
 */

import { useNavigate } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotaoTestarComoCiente() {
  const navigate = useNavigate();

  function testarComoCliente() {
    // Por enquanto, redireciona direto para o portal
    // TODO: Integrar com gerarLinkAcessoClienteDebug quando houver integração SSO
    navigate({
      to: "/portal/casos/$id",
      params: { id: "ana-luiza" },
    });
  }

  return (
    <Button
      onClick={testarComoCliente}
      variant="outline"
      size="sm"
      className="gap-2"
      title="Visualizar app cliente com dados reais (staff only)"
    >
      <Eye className="h-4 w-4" />
      Testar como cliente
    </Button>
  );
}
