import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { Etiqueta, type Tom } from "@/components/prancha-v4/kit";
import { papelDoRegistro } from "@/lib/caso-ficha";
import { posicionar, ROTULO_URGENCIA } from "@/lib/matriz-posicionamento";
import { ROTULO_SINAL, type SinalPrioridade } from "@/lib/prioridade-matriz";
import { listarInconsistencias } from "@/lib/qualidade.functions";
import { listarRegistros } from "@/lib/saas.functions";

/*
 * 14/10/2026 — KPIs de Prontidão e Qualidade Documental + Recomendações, no
 * topo/base de /qualidade (Radar & Matrizes). Reusa as MESMAS queries já em
 * uso por PainelQualidade (AbaInconsistencias) e MatrizPrioridadesConectada
 * — mesma queryKey, sem round-trip novo — e o mesmo motor `posicionar`.
 * Nenhum cálculo de prioridade/elegibilidade/urgência é refeito aqui; só
 * agregação de contagem sobre o que o motor já decidiu.
 *
 * "Qualidade documental" não tem um domínio próprio em quality_issues (seis
 * domínios reais: crm/privacidade/contrato/pagamento/evidencia/entrega) —
 * usa-se "evidencia" (o mais próximo de documental no vocabulário real),
 * nunca um rótulo novo.
 *
 * Demonstrações seguem a mesma regra do resto do Desk: nunca entram em
 * indicadores por padrão (BUG-MATRIZ-DEMO-VAZA, matriz-prioridades-conectada.tsx).
 */

const TOM_SINAL: Record<SinalPrioridade, Tom> = {
  critica: "critico",
  atencao: "atencao",
  acompanhada: "sucesso",
  sem_dados: "neutro",
};

function KpiCard({ rotulo, valor, apoio, tom }: { rotulo: string; valor: number; apoio: string; tom?: Tom }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-card p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-navy/55">{rotulo}</p>
      <p className="mt-1 font-serif text-3xl leading-none tabular-nums text-navy">{valor}</p>
      <div className="mt-2 flex items-center gap-2">
        {tom ? <Etiqueta texto={apoio} tom={tom} /> : <span className="text-[11px] text-navy/55">{apoio}</span>}
      </div>
    </div>
  );
}

export function KpisQualidadeV4() {
  const fnIssues = useServerFn(listarInconsistencias);
  const fnCasos = useServerFn(listarRegistros);

  const issuesQuery = useQuery({
    queryKey: ["qualidade", "issues", "", "", ""],
    queryFn: () => fnIssues({ data: { severidade: "", status: "", dominio: "" } }),
  });
  const casosQuery = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => fnCasos({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    retry: false,
  });

  const issues = (issuesQuery.data?.inconsistencias ?? []) as Record<string, unknown>[];
  const abertasOuReconhecidas = useMemo(
    () => issues.filter((i) => ["aberta", "reconhecida"].includes(String(i["status"]))),
    [issues],
  );
  const criticasAbertas = abertasOuReconhecidas.filter((i) => i["severidade"] === "critica").length;
  const evidenciasPendentes = abertasOuReconhecidas.filter((i) => i["dominio"] === "evidencia").length;

  const linhasReais = useMemo(
    () => ((casosQuery.data ?? []) as Record<string, unknown>[]).filter((l) => papelDoRegistro(l).valor !== "demo"),
    [casosQuery.data],
  );
  const casosPosicionados = useMemo(
    () =>
      linhasReais.map((l) =>
        posicionar({
          tipo: "caso",
          id: String(l["id"]),
          rotulo: String(l["codigo"] ?? l["titulo"] ?? l["id"]),
          elegibilidade: (l["hipotese_elegibilidade"] as string) ?? null,
          prazo: (l["prazo_proxima_acao"] as string) ?? null,
          diasSemTouchpoint: (l["dias_sem_touchpoint"] as number) ?? null,
          esperaExternaAtiva: Boolean(l["aguardando_instituicao_externa"]),
          responsavel: (l["proxima_acao_responsavel"] as string) ?? null,
          origem: "real",
        }),
      ),
    [linhasReais],
  );
  const casosCriticos = casosPosicionados.filter((c) => c.sinal === "critica").length;

  const carregando = issuesQuery.isLoading || casosQuery.isLoading;
  const comErro = issuesQuery.isError || casosQuery.isError;

  if (carregando) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-qualidade-kpis-carregando>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl border border-navy/10 bg-cream/40" />
        ))}
      </div>
    );
  }
  if (comErro) {
    return (
      <p className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta" data-qualidade-kpis-erro>
        Os indicadores de prontidão não puderam ser lidos agora.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-qualidade-kpis>
      <KpiCard
        rotulo="Inconsistências críticas"
        valor={criticasAbertas}
        apoio={criticasAbertas > 0 ? "Bloqueiam ativação do caso" : "Nenhuma em aberto"}
        tom={criticasAbertas > 0 ? "critico" : "sucesso"}
      />
      <KpiCard
        rotulo="Inconsistências em aberto"
        valor={abertasOuReconhecidas.length}
        apoio="Abertas ou reconhecidas, todos os domínios"
        tom={abertasOuReconhecidas.length > 0 ? "atencao" : "sucesso"}
      />
      <KpiCard
        rotulo="Evidências pendentes"
        valor={evidenciasPendentes}
        apoio="Domínio evidência, em aberto"
        tom={evidenciasPendentes > 0 ? "atencao" : "sucesso"}
      />
      <KpiCard
        rotulo="Casos em sinal crítico"
        valor={casosCriticos}
        apoio={`de ${casosPosicionados.length} caso(s) real(is) posicionado(s)`}
        tom={casosCriticos > 0 ? "critico" : "sucesso"}
      />
    </div>
  );
}

export function RecomendacoesQualidadeV4() {
  const fnCasos = useServerFn(listarRegistros);
  const casosQuery = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => fnCasos({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    retry: false,
  });

  const linhasReais = useMemo(
    () => ((casosQuery.data ?? []) as Record<string, unknown>[]).filter((l) => papelDoRegistro(l).valor !== "demo"),
    [casosQuery.data],
  );
  const PESO_SINAL: Record<SinalPrioridade, number> = { critica: 0, atencao: 1, acompanhada: 2, sem_dados: 3 };
  const recomendados = useMemo(() => {
    return linhasReais
      .map((l) => ({
        linha: l,
        posicao: posicionar({
          tipo: "caso",
          id: String(l["id"]),
          rotulo: String(l["codigo"] ?? l["titulo"] ?? l["id"]),
          elegibilidade: (l["hipotese_elegibilidade"] as string) ?? null,
          prazo: (l["prazo_proxima_acao"] as string) ?? null,
          diasSemTouchpoint: (l["dias_sem_touchpoint"] as number) ?? null,
          esperaExternaAtiva: Boolean(l["aguardando_instituicao_externa"]),
          responsavel: (l["proxima_acao_responsavel"] as string) ?? null,
          origem: "real",
        }),
      }))
      .filter((c) => c.posicao.sinal === "critica" || c.posicao.sinal === "atencao")
      .sort((a, b) => PESO_SINAL[a.posicao.sinal] - PESO_SINAL[b.posicao.sinal])
      .slice(0, 6);
  }, [linhasReais]);

  if (casosQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-2xl border border-navy/10 bg-cream/40" data-qualidade-recomendacoes-carregando />;
  }
  if (casosQuery.isError) {
    return (
      <p className="rounded-2xl border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta" data-qualidade-recomendacoes-erro>
        As recomendações não puderam ser lidas agora.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-navy/10 bg-card p-6 shadow-sm" data-qualidade-recomendacoes>
      <h3 className="mb-1 font-serif text-lg text-navy">Recomendações e próximas ações por caso</h3>
      <p className="mb-4 text-xs text-navy/55">
        Casos em sinal crítico ou de atenção, ordenados por prioridade (prioridade-matriz.ts). Próxima ação vem do
        planejador — o mesmo campo já usado em Caso 360.
      </p>
      {recomendados.length === 0 ? (
        <p className="text-sm text-navy/60">Nenhum caso real em sinal crítico ou de atenção agora.</p>
      ) : (
        <ul className="space-y-2">
          {recomendados.map(({ linha, posicao }) => {
            const id = String(linha["id"]);
            const proximaAcao = String(linha["proxima_acao"] ?? linha["proxima_acao_codigo"] ?? "").trim();
            return (
              <li key={id} className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/5 py-2 last:border-0">
                <div className="min-w-0">
                  <Link to="/casos/$caseId" params={{ caseId: id }} className="truncate font-medium text-navy hover:underline">
                    {String(linha["codigo"] ?? linha["titulo"] ?? id)}
                  </Link>
                  <p className="truncate text-xs text-navy/60">
                    {proximaAcao || "Próxima ação não registrada"} · {ROTULO_URGENCIA[posicao.urgencia]}
                  </p>
                </div>
                <Etiqueta texto={ROTULO_SINAL[posicao.sinal]} tom={TOM_SINAL[posicao.sinal]} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
