import { createFileRoute, Link } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { FluxoComercialCanonico } from "@/components/crm/fluxo-canonico";
import { PainelCanonicoCrm } from "@/components/crm/painel-canonico";

export const Route = createFileRoute("/_authenticated/historico/fluxo-comercial-canonico")({
  head: () => ({
    meta: [
      { title: "Visão histórica — Fluxo comercial canônico — Clube Ancestral" },
      {
        name: "description",
        content: "Modelo de contatos/oportunidades preservado como visão histórica. O CRM em uso é /leads.",
      },
      { property: "og:title", content: "Visão histórica — Fluxo comercial canônico" },
      { property: "og:description", content: "Painel preservado apenas para consulta interna." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoricoFluxoComercialCanonico,
});

/**
 * 27/08/2026 — "o CRM que vamos usar é o que foi derivado do Painel de
 * Calls e roteiro de discovery, dump de WhatsApp... CRM mestre e legado
 * nunca usei" (Proprietária). Este modelo (contacts/opportunities) roda em
 * paralelo ao de verdade (leads, em /leads) desde 21/08 e nunca teve uma
 * linha sequer gravada — confirmado direto no banco (0 registros nas duas
 * tabelas). Ficava embutido dentro de /leads, competindo visualmente com o
 * CRM que ela realmente usa. Sai de lá, fica preservado aqui — nada foi
 * apagado, só deixou de disputar a mesma tela do CRM canônico.
 */
function HistoricoFluxoComercialCanonico() {
  return (
    <SaasShell
      titulo="Visão histórica — Fluxo comercial canônico"
      descricao="Preservado para consulta interna. Nunca teve dado real gravado — o CRM em uso é /leads."
    >
      <div data-faixa="historica" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/15 bg-cream px-3 py-2 text-xs text-navy/70">
        <span>Visão histórica — use /leads para o CRM em uso.</span>
        <Link to="/leads" className="underline">
          Abrir Leads
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-xl text-navy">Fluxo comercial canônico</h2>
        <p className="text-xs text-navy/55">
          Contatos, oportunidades, Discovery, aceite verbal e confirmação formal. Nenhum registro aqui cria contrato,
          cobrança, assinatura, onboarding, pesquisa externa ou App Cliente.
        </p>
        <FluxoComercialCanonico />
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="font-serif text-xl text-navy">Contatos, conversas e eventos de funil</h2>
        <p className="text-xs text-navy/55">
          Núcleo operacional deste modelo paralelo. Conversas são imutáveis e eventos sensíveis exigem confirmação
          humana e evidência interna. Nada aqui envia mensagem nem gera ato externo.
        </p>
        <PainelCanonicoCrm />
      </div>
    </SaasShell>
  );
}
