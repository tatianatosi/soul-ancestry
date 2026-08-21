import { createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell, useSaas } from "@/components/saas/shell";
import { PainelHoje } from "@/components/painel/painel-hoje";
import { PendenciasCriticasPesquisa } from "@/components/painel/pendencias-criticas-pesquisa";
import { PainelDeskHoje } from "@/components/painel/painel-desk-hoje";
import { PainelCadencia } from "@/components/painel/painel-cadencia";
import { PainelFormalizacao } from "@/components/painel/painel-formalizacao";
import { PainelCatalogo } from "@/components/painel/painel-catalogo";
import { MetricasJornada } from "@/components/painel/metricas-jornada";
import { PainelOnboardingJornada } from "@/components/painel/painel-onboarding-jornada";
import { listarRegistros, type Entidade } from "@/lib/saas.functions";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Visão geral — Clube Ancestral" },
      { name: "description", content: "Panorama de leads, clientes, casos, evidências e tarefas da organização." },
      { property: "og:title", content: "Visão geral — Clube Ancestral" },
      { property: "og:description", content: "Panorama operacional da organização no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

const BLOCOS: { entidade: Entidade; rotulo: string }[] = [
  { entidade: "leads", rotulo: "Leads" },
  { entidade: "clientes", rotulo: "Clientes" },
  { entidade: "crm_casos", rotulo: "Casos" },
  { entidade: "evidencias", rotulo: "Evidências" },
  { entidade: "tarefas", rotulo: "Tarefas" },
];

function Painel() {
  const { podeFinanceiro } = useSaas();
  const carregar = useServerFn(listarRegistros);

  const consultas = useQueries({
    queries: BLOCOS.map((b) => ({
      queryKey: ["saas", b.entidade, false],
      queryFn: () => carregar({ data: { entidade: b.entidade, incluirArquivados: false } }),
    })),
  });

  return (
    <SaasShell titulo="Visão geral" descricao="Panorama da sua organização. Informações operacionais, não conclusões.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {BLOCOS.map((b, i) => (
          <div key={b.entidade} className="rounded-xl border border-navy/10 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-navy/50">{b.rotulo}</p>
            <p className="mt-2 font-serif text-3xl">
              {consultas[i]?.isLoading ? "…" : ((consultas[i]?.data as unknown[]) ?? []).length}
            </p>
            <p className="mt-1 text-xs text-navy/50">registros ativos</p>
          </div>
        ))}
      </div>

      <PainelHoje />
      <PendenciasCriticasPesquisa />
      <PainelDeskHoje />
      <PainelFormalizacao />
      <PainelCadencia />
      <MetricasJornada />
      <PainelOnboardingJornada />



      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-navy/10 bg-white p-5 text-sm text-navy/70">
          <h2 className="font-serif text-lg text-navy">Como ler estas informações</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Dados jurídicos, migratórios, financeiros e genealógicos aparecem como hipótese, evidência ou pendência.</li>
            <li>Nada é conclusão automática: cada item depende de confirmação documental.</li>
            <li>Registros não são excluídos; são arquivados com motivo e responsável.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-navy/10 bg-white p-5 text-sm text-navy/70">
          <h2 className="font-serif text-lg text-navy">Financeiro</h2>
          <p className="mt-3">
            {podeFinanceiro
              ? "Você tem acesso aos eventos financeiros da organização."
              : "Seu papel não inclui acesso financeiro. Solicite a um admin caso precise."}
          </p>
        </div>
      </div>
    </SaasShell>
  );
}
