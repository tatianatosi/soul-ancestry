import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { ReconfirmarPropriedade } from "@/components/governanca/reconfirmar-propriedade";

export const Route = createFileRoute("/_authenticated/reconfirmar-propriedade")({
  head: () => ({
    meta: [
      { title: "Reconfirmar propriedade — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Verificação do estado real do acesso e reconfirmação de propriedade da proprietária administradora, com restauração interna auditada.",
      },
      { property: "og:title", content: "Reconfirmar propriedade — Clube Ancestral Desk" },
      {
        property: "og:description",
        content:
          "Checklist de integridade do acesso e recuperação do papel admin sem bloqueios, com motivo obrigatório e auditoria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReconfirmarPropriedadePage,
});

function ReconfirmarPropriedadePage() {
  return (
    <SaasShell
      titulo="Reconfirmar propriedade"
      descricao="Confirme que você é a proprietária do aplicativo e restaure o acesso administrativo integral. A verificação lê o estado real do banco; a restauração é interna e auditada."
    >
      <ReconfirmarPropriedade />
    </SaasShell>
  );
}
