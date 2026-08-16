import { createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import { listarRegistros, type Entidade } from "@/lib/saas.functions";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — Clube Ancestral" },
      { name: "description", content: "Indicadores de casos, evidências e tarefas da sua organização." },
      { property: "og:title", content: "Relatórios — Clube Ancestral" },
      { property: "og:description", content: "Indicadores operacionais no Clube Ancestral." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RelatoriosPage,
});

const FONTES: Entidade[] = ["crm_casos", "evidencias", "tarefas"];

function agrupar(linhas: Record<string, unknown>[], chave: string) {
  const mapa = new Map<string, number>();
  for (const l of linhas) {
    const v = (l[chave] as string) || "não informado";
    mapa.set(v, (mapa.get(v) ?? 0) + 1);
  }
  return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
}

function RelatoriosPage() {
  const carregar = useServerFn(listarRegistros);
  const consultas = useQueries({
    queries: FONTES.map((entidade) => ({
      queryKey: ["saas", entidade, false],
      queryFn: () => carregar({ data: { entidade, incluirArquivados: false } }),
    })),
  });

  const blocos = [
    { titulo: "Casos por status", dados: agrupar((consultas[0]?.data as Record<string, unknown>[]) ?? [], "status") },
    { titulo: "Casos por via", dados: agrupar((consultas[0]?.data as Record<string, unknown>[]) ?? [], "via") },
    {
      titulo: "Evidências por status",
      dados: agrupar((consultas[1]?.data as Record<string, unknown>[]) ?? [], "status"),
    },
    {
      titulo: "Tarefas por prioridade",
      dados: agrupar((consultas[2]?.data as Record<string, unknown>[]) ?? [], "prioridade"),
    },
  ];

  return (
    <SaasShell
      titulo="Relatórios"
      descricao="Leituras agregadas da operação. Não substituem análise documental caso a caso."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {blocos.map((b) => (
          <div key={b.titulo} className="rounded-xl border border-navy/10 bg-white p-5">
            <h2 className="font-serif text-lg text-navy">{b.titulo}</h2>
            {b.dados.length === 0 ? (
              <p className="mt-3 text-sm text-navy/50">Sem dados suficientes ainda.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {b.dados.map(([rotulo, total]) => (
                  <li key={rotulo} className="flex items-center justify-between gap-3">
                    <span className="text-navy/70">{rotulo}</span>
                    <span className="font-medium text-navy">{total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </SaasShell>
  );
}
