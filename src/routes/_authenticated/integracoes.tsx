import { createFileRoute } from "@tanstack/react-router";

import { SaasShell } from "@/components/saas/shell";
import { CentroIntegracoes } from "@/components/integracoes/centro";
import { MatrizProntidaoIntegracoes } from "@/components/integracoes/prontidao";
import { Indicador } from "@/components/prancha-v4/kit";
import { PRONTIDAO_INTEGRACOES, type EstadoIntegracao } from "@/lib/prontidao-integracoes";

// V4-05: KPIs contam a própria matriz de prontidão que esta tela já renderiza.
const contarEstado = (estado: EstadoIntegracao) => PRONTIDAO_INTEGRACOES.filter((i) => i.estado === estado).length;

export const Route = createFileRoute("/_authenticated/integracoes")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Centro de Integrações — Clube Ancestral" },
      {
        name: "description",
        content: "Conectores de CRM, formulário, calls, WhatsApp, financeiro e documentos em modo simulado e controlado.",
      },
      { property: "og:title", content: "Centro de Integrações — Clube Ancestral" },
      { property: "og:description", content: "Integrações desligadas por padrão, com teste em dados DEMO." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IntegracoesPage,
});

function IntegracoesPage() {
  return (
    <SaasShell
      titulo="Centro de Integrações"
      descricao="Estado real de cada conector, pré-requisitos e o que ainda não pode ser executado. Nenhuma ação externa parte desta tela."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-integracoes-kpis-v4>
          <Indicador rotulo="Integrações mapeadas" valor={String(PRONTIDAO_INTEGRACOES.length)} apoio="matriz de prontidão" />
          <Indicador rotulo="Validadas em QA" valor={String(contarEstado("VALIDADA_EM_QA"))} />
          <Indicador rotulo="Bloqueadas por dado" valor={String(contarEstado("BLOQUEADA_POR_DADO"))} />
          <Indicador rotulo="Aguardam a Proprietária" valor={String(contarEstado("AGUARDA_CONFIRMACAO_DA_PROPRIETARIA"))} />
        </div>
        <MatrizProntidaoIntegracoes />
        <CentroIntegracoes />
      </div>
    </SaasShell>
  );
}
