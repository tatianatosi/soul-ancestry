import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { CentroIntegracoes } from "@/components/integracoes/centro";

export const Route = createFileRoute("/_authenticated/integracoes")({
  head: () => ({
    meta: [
      { title: "Centro de Integrações — Clube Ancestral" },
      {
        name: "description",
        content: "Conectores de CRM, formulário, calls, WhatsApp, financeiro e documentos em modo simulado e controlado.",
      },
      { property: "og:title", content: "Centro de Integrações — Clube Ancestral" },
      { property: "og:description", content: "Integrações desligadas por padrão, com teste em dados DEMO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IntegracoesPage,
});

function IntegracoesPage() {
  return (
    <SaasShell
      titulo="Centro de Integrações"
      descricao="Cada conector tem responsável, mapeamento de campos, política de tentativas e logs mascarados."
    >
      <CentroIntegracoes />
    </SaasShell>
  );
}
