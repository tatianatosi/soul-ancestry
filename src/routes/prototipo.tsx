import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppSwitcher } from "@/components/brand";
import { ClienteApp } from "@/components/cliente-app";
import { DeskApp } from "@/components/desk-app";

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
  return (
    <div className="min-h-screen bg-cream">
      <AppSwitcher current={app} onChange={setApp} />
      {app === "cliente" ? <ClienteApp /> : <DeskApp />}
    </div>
  );
}
