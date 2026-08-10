import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppSwitcher } from "@/components/brand";
import { ClienteApp } from "@/components/cliente-app";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { caso?: string } => ({
    caso: typeof search["caso"] === "string" ? search["caso"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Ancestral Canvas — Painel do cliente e Desk Intelligence" },
      {
        name: "description",
        content:
          "Painel do Clube Ancestral: jornada do cliente, diagnóstico de ancestralidade e visão interna do caso.",
      },
      { property: "og:title", content: "Ancestral Canvas — Clube Ancestral" },
      {
        property: "og:description",
        content: "Jornada do cliente e inteligência interna de casos de cidadania europeia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});


function Index() {
  const [app, setApp] = useState<"cliente" | "desk">("cliente");
  return (
    <div className="min-h-screen bg-cream">
      <AppSwitcher current={app} onChange={setApp} />
      {app === "cliente" ? <ClienteApp /> : <DeskApp />}
    </div>
  );
}
