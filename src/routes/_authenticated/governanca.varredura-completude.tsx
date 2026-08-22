import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { VarreduraCompletude } from "@/components/governanca/varredura-completude";

export const Route = createFileRoute("/_authenticated/governanca/varredura-completude")({
  head: () => ({
    meta: [
      { title: "Varredura de completude contratual e operacional — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Consolidação dos Anexos I–V, matriz única de pendências, caso Ana Luiza, ações da proprietária e cobertura de testes.",
      },
      { property: "og:title", content: "Varredura de completude contratual e operacional" },
      {
        property: "og:description",
        content: "Itens pendentes, parciais e não localizados consolidados em leitura, sem alterar nenhum dado.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <SaasShell
      titulo="Varredura final de completude contratual, operacional e técnica"
      descricao="Somente leitura. Nenhum modelo, documento, dado, pagamento, assinatura, comunicação, integração ou publicação é criado ou alterado nesta tela."
    >
      <VarreduraCompletude />
    </SaasShell>
  );
}
