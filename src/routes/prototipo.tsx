import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppSwitcher } from "@/components/brand";
import { ClienteApp } from "@/components/cliente-app";
import { DeskApp } from "@/components/desk-app";
import { SuperficieInternaProvider, useSessaoInterna } from "@/lib/superficie-interna";

export const Route = createFileRoute("/prototipo")({
  validateSearch: (search: Record<string, unknown>): { caso?: string } => ({
    caso: typeof search["caso"] === "string" ? search["caso"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Protótipo visual — Clube Ancestral" },
      { name: "description", content: "Protótipo navegável do App Cliente e do Desk Intelligence do Clube Ancestral." },
      { property: "og:title", content: "Protótipo visual — Clube Ancestral" },
      { property: "og:description", content: "Protótipo navegável das telas do Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Prototipo,
});

function Prototipo() {
  const [app, setApp] = useState<"cliente" | "desk">("cliente");
  const interna = useSessaoInterna();

  return (
    <SuperficieInternaProvider valor={interna}>
      <div className="min-h-screen bg-cream">
        <div className="bg-terracotta px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-cream">
          Protótipo / dados não operacionais
        </div>
        {interna && <AppSwitcher current={app} onChange={setApp} />}
        {interna && app === "desk" ? <DeskApp /> : <ClienteApp />}
      </div>
    </SuperficieInternaProvider>
  );
}
