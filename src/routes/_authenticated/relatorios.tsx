import { createFileRoute } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { EstadoDados } from "@/components/saas/estado-dados";
import { CaCard } from "@/components/ui/ca-card";
import { Indicador, Linha } from "@/components/prancha-v4/kit";
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
    { titulo: "Casos por status", eyebrow: "Casos · status", fonte: 0, chave: "status" },
    { titulo: "Casos por via", eyebrow: "Casos · via", fonte: 0, chave: "via" },
    { titulo: "Evidências por status", eyebrow: "Evidências · status", fonte: 1, chave: "status" },
    { titulo: "Tarefas por prioridade", eyebrow: "Tarefas · prioridade", fonte: 2, chave: "prioridade" },
  ];

  // V4-04: faixa de KPIs só com contagem real das leituras já carregadas.
  // Origem sem leitura concluída (carregando ou falha) mostra "—", nunca zero.
  const totalDe = (i: number) => {
    const linhas = linhasDe(i);
    return consultas[i]?.isSuccess && Array.isArray(linhas) ? String(linhas.length) : "—";
  };
  const kpis = [
    { rotulo: "Casos", fonte: 0, apoio: "Registros não arquivados" },
    { rotulo: "Evidências", fonte: 1, apoio: "Registros não arquivados" },
    { rotulo: "Tarefas", fonte: 2, apoio: "Registros não arquivados" },
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
      <div className="mb-4 grid gap-3 sm:grid-cols-3" data-relatorios-kpis>
        {kpis.map((k) => (
          <Indicador key={k.rotulo} rotulo={k.rotulo} valor={totalDe(k.fonte)} apoio={k.apoio} />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {blocos.map((b) => (
          <CaCard key={b.titulo} titulo={b.titulo} eyebrow={b.eyebrow}>
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
                  <EstadoVazio mensagem="Sem dados suficientes ainda." />
                ) : (
                  <ul className="mt-1">
                    {dados.map(([rotulo, total]) => (
                      <li key={rotulo}>
                        <Linha rotulo={rotulo} valor={String(total)} />
                      </li>
                    ))}
                  </ul>
                );
              }}
            </EstadoDados>
          </CaCard>
        ))}
      </div>
    </SaasShell>
  );
}
