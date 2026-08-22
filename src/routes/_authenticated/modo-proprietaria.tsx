import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { PainelModoProprietaria } from "@/components/governanca/modo-proprietaria";
import { VarreduraAutorizacoes } from "@/components/governanca/varredura-autorizacoes";

export const Route = createFileRoute("/_authenticated/modo-proprietaria")({
  head: () => ({
    meta: [
      { title: "Modo Proprietária Administradora — Clube Ancestral Desk" },
      {
        name: "description",
        content:
          "Operação interna total da proprietária administradora com versionamento, auditoria append-only e confirmação final explícita para ações externas.",
      },
      { property: "og:title", content: "Modo Proprietária Administradora — Clube Ancestral Desk" },
      {
        property: "og:description",
        content:
          "Decisões humanas auditadas, pendências assumidas sem serem apagadas e janela de confirmação para ações irreversíveis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ModoProprietariaPage,
});

function ModoProprietariaPage() {
  return (
    <SaasShell
      titulo="Modo Proprietária Administradora"
      descricao="Operação interna total: editar, versionar, homologar, aprovar e avançar qualquer elo da cadeia mediante decisão humana auditada. RLS, auditoria, histórico e triggers de integridade permanecem ativos. Ações externas e irreversíveis exigem confirmação final explícita e nunca são disparadas automaticamente."
    >
      <div className="space-y-8">
        <PainelModoProprietaria />
        <VarreduraAutorizacoes />
      </div>
    </SaasShell>
  );
}
