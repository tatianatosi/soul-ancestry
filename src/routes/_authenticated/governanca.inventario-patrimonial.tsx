import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { InventarioPatrimonial } from "@/components/governanca/inventario-patrimonial";

export const Route = createFileRoute("/_authenticated/governanca/inventario-patrimonial")({
  head: () => ({
    meta: [
      { title: "Inventário patrimonial 2025–2026 — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Fonte única de verdade sobre documentos, modelos, regras e estruturas reconstruídas, com cinco camadas de estado por item.",
      },
      { property: "og:title", content: "Inventário patrimonial do Clube Ancestral" },
      {
        property: "og:description",
        content: "Legado, fonte documental, conteúdo homologado, estrutura no app, instância de caso e validação autenticada.",
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
      titulo="Inventário patrimonial — documentos, modelos, regras e estruturas"
      descricao="Somente leitura e documentação. Nenhum item é criado, alterado, homologado, aprovado, arquivado, enviado, assinado, publicado, cobrado, migrado, integrado, movido ou excluído."
    >
      <InventarioPatrimonial />
    </SaasShell>
  );
}
