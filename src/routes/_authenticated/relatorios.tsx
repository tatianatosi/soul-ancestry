import { createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { SaasShell } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
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

  const carregando = consultas.some((c) => c.isLoading);
  const falhas = consultas
    .map((c, i) => (c.isError ? FONTES[i] : null))
    .filter(Boolean) as string[];

  // Cada bloco carrega a origem da leitura: sem dado lido, o bloco declara falha
  // de carga em vez de exibir agregado vazio.
  const linhasDe = (i: number) => consultas[i]?.data as Record<string, unknown>[] | undefined;

  const blocos = [
    { titulo: "Casos por status", fonte: 0, chave: "status" },
    { titulo: "Casos por via", fonte: 0, chave: "via" },
    { titulo: "Evidências por status", fonte: 1, chave: "status" },
    { titulo: "Tarefas por prioridade", fonte: 2, chave: "prioridade" },
  ];

  return (
    <SaasShell
      titulo="Relatórios"
      descricao="Leituras agregadas da operação. Não substituem análise documental caso a caso."
    >
      {carregando ? <p className="mb-4 text-sm text-navy/60">Carregando registros…</p> : null}
      {falhas.length ? (
        <div role="alert" className="mb-4 space-y-2 rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-xs text-terracotta">
          <p>
            Falha de consulta em: {falhas.join(", ")}. Os agregados abaixo estão incompletos por erro de leitura, não
            por ausência de registro.
          </p>
          <button
            type="button"
            onClick={() => consultas.forEach((c) => c.isError && void c.refetch())}
            className="rounded-md border border-terracotta/50 px-2 py-1 text-[11px] font-medium text-terracotta hover:bg-terracotta/10"
          >
            Tentar novamente
          </button>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {blocos.map((b) => (
          <div key={b.titulo} className="rounded-xl border border-navy/10 bg-white p-5">
            <h2 className="font-serif text-lg text-navy">{b.titulo}</h2>
            <EstadoDados
              carregando={consultas[b.fonte]?.isLoading ?? false}
              erro={consultas[b.fonte]?.error}
              dados={linhasDe(b.fonte)}
              aoTentarNovamente={() => void consultas[b.fonte]?.refetch()}
              recurso={`os registros de ${FONTES[b.fonte]}`}
              vazio="Nenhum registro nesta origem ainda."
            >
              {(linhas) => {
                const dados = agrupar(linhas as Record<string, unknown>[], b.chave);
                return dados.length === 0 ? (
                  <p className="mt-3 text-sm text-navy/50">Sem dados suficientes ainda.</p>
                ) : (
                  <ul className="mt-3 space-y-2 text-sm">
                    {dados.map(([rotulo, total]) => (
                      <li key={rotulo} className="flex items-center justify-between gap-3">
                        <span className="text-navy/70">{rotulo}</span>
                        <span className="font-medium text-navy">{total}</span>
                      </li>
                    ))}
                  </ul>
                );
              }}
            </EstadoDados>
          </div>
        ))}
      </div>
    </SaasShell>
  );
}
