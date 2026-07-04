import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppSwitcher } from "@/components/brand";
import { ClienteApp } from "@/components/cliente-app";
import { DeskApp } from "@/components/desk-app";

export const Route = createFileRoute("/")({
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
