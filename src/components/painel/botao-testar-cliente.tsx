/**
 * Botão para a equipe ver o App Cliente de UM caso.
 *
 * Reescrito por caso em 01/11/2026: recebe o `casoId` e abre o mecanismo oficial
 * (`/app-cliente-como-pessoa?casoId=`), sem virar cliente, sem link mágico e sem id fixo.
 * Sem `casoId` o botão fica desabilitado e diz por quê (nunca cai em um caso padrão).
 */

import { useNavigate } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BotaoTestarComoCiente({ casoId }: { casoId?: string | null }) {
  const navigate = useNavigate();
  const semCaso = !casoId;

  function verComoCliente() {
    if (!casoId) return;
    navigate({ to: "/app-cliente-como-pessoa", search: { casoId } });
  }

  return (
    <Button
      onClick={verComoCliente}
      disabled={semCaso}
      variant="outline"
      size="sm"
      className="gap-2"
      title={semCaso ? "Escolha um caso para ver o App Cliente dele" : "Ver o App Cliente deste caso (somente equipe)"}
    >
      <Eye className="h-4 w-4" />
      Ver App Cliente
    </Button>
  );
}
