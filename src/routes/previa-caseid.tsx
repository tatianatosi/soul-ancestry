import { createFileRoute, Link } from "@tanstack/react-router";

import { BrandLogo } from "@/components/brand";
import { ChipIdentidadeCaso } from "@/components/caso/chip-identidade-caso";
import { mesmoCaso } from "@/lib/caso-compartilhado";
import { IDENTIDADE_DEMO_SOPHIA, SELO_DEMO_PORTAL } from "@/lib/portal-demo-sophia";

/**
 * Ordem 2 — prévia pública App↔Desk com o mesmo caseId (UUID).
 * Prova visual lado a lado: identidade canônica compartilhada.
 */

export const Route = createFileRoute("/previa-caseid")({
  head: () => ({
    meta: [
      { title: "Prévia caseId App↔Desk — Clube Ancestral" },
      {
        name: "description",
        content:
          "Mesmo caseId (crm_casos.id) no App Cliente e no Desk. Dados demonstrativos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviaCaseId,
});

function PreviaCaseId() {
  const app = IDENTIDADE_DEMO_SOPHIA;
  const desk = { ...IDENTIDADE_DEMO_SOPHIA, fonte: "crm_casos" as const };
  const alinhado = mesmoCaso(app, desk);

  return (
    <div className="min-h-screen bg-cream text-navy" data-previa-caseid>
      <header className="border-b border-navy/10 bg-navy px-4 py-4 text-cream">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size={36} variant="client-dark" showText={false} />
            <div>
              <p className="font-serif text-lg text-gold">Clube Ancestral</p>
              <p className="text-[11px] uppercase tracking-widest text-cream/70">
                Ordem 2 · caseId compartilhado
              </p>
            </div>
          </div>
          <Link
            to="/previa-app-cliente"
            className="rounded-lg border border-cream/30 px-3 py-1.5 text-xs text-cream hover:bg-cream/10"
          >
            Ver App Cliente
          </Link>
        </div>
      </header>

      <p
        role="status"
        className="border-b border-gold/40 bg-gold/15 px-4 py-2 text-center text-[11px] font-medium uppercase tracking-widest text-navy"
      >
        {SELO_DEMO_PORTAL}
      </p>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <div>
          <h1 className="font-serif text-2xl text-navy">Mesmo caso · App e Desk</h1>
          <p className="mt-1 text-sm text-navy/70">
            O único identificador de produto é{" "}
            <span className="font-mono text-xs">crm_casos.id</span> (UUID). O código humano é
            rótulo — nunca substitui o caseId.
          </p>
        </div>

        <p
          data-alinhamento={alinhado ? "ok" : "divergente"}
          className={`rounded-lg border px-3 py-2 text-sm ${
            alinhado
              ? "border-navy/20 bg-white text-navy"
              : "border-terracotta/40 bg-terracotta/10 text-terracotta"
          }`}
        >
          {alinhado
            ? "Alinhado: App Cliente e Desk leem o mesmo caseId."
            : "Divergente: caseId diferente entre superfícies."}
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ChipIdentidadeCaso identidade={app} superficie="App Cliente" />
          <ChipIdentidadeCaso identidade={desk} superficie="Desk" />
        </div>

        <p className="text-xs text-navy/55">
          Prévia de contrato de identidade (Ordem 2). Fixture rotulada — sem dado real de cliente.
        </p>
      </main>
    </div>
  );
}
