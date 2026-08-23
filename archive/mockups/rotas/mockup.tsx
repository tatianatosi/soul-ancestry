import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppSwitcher } from "@/components/brand";
import { ClienteMockup } from "@/components/mockup/cliente-mockup";
import { DeskMockup } from "@/components/mockup/desk-mockup";

export const Route = createFileRoute("/mockup")({
  head: () => ({
    meta: [
      { title: "Mockup v2 — App Cliente e Desk Intelligence | Clube Ancestral" },
      {
        name: "description",
        content:
          "Mockup visual consolidado do Clube Ancestral: App Cliente com 6 abas e Desk Intelligence com 7 abas principais.",
      },
      { property: "og:title", content: "Mockup v2 — Clube Ancestral" },
      { property: "og:description", content: "App Cliente e Desk Intelligence em estrutura consolidada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MockupPage,
});

function MockupPage() {
  const [app, setApp] = useState<"cliente" | "desk">("desk");
  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-terracotta px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-cream">
        Mockup v2 · visual, sem dados operacionais
      </div>
      <AppSwitcher current={app} onChange={setApp} />
      {app === "cliente" ? <ClienteMockup /> : <DeskMockup />}
    </div>
  );
}
