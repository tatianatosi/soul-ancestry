import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

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
        Mockup aprovado · referência visual, sem dados operacionais
      </div>
      <div className="flex items-center justify-center gap-2 border-b border-black/10 bg-cream px-4 py-3">
        <button
          type="button"
          onClick={() => setApp("desk")}
          className={
            app === "desk"
              ? "rounded-full bg-terracotta px-4 py-1.5 text-sm font-medium text-cream"
              : "rounded-full px-4 py-1.5 text-sm font-medium text-ink/60 hover:text-ink"
          }
        >
          Desk Intelligence
        </button>
        <button
          type="button"
          onClick={() => setApp("cliente")}
          className={
            app === "cliente"
              ? "rounded-full bg-terracotta px-4 py-1.5 text-sm font-medium text-cream"
              : "rounded-full px-4 py-1.5 text-sm font-medium text-ink/60 hover:text-ink"
          }
        >
          App Cliente
        </button>
      </div>
      {app === "cliente" ? <ClienteMockup /> : <DeskMockup />}
    </div>
  );
}
