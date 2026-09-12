import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { listarRegistros } from "@/lib/saas.functions";
import { papelDoRegistro } from "@/lib/caso-ficha";
import { KitCard, RadarChart, DeskMatrix, KpiCard, type RadarAxis } from "@/components/clube-ancestral-kit";

/**
 * Radar Interno — leitura da carteira real (crm_casos), sem inventar ponto.
 *
 * Reaproveita a MESMA consulta da matriz de prioridades (mesma queryKey), para
 * radar e matriz nunca discordarem. Quando não há caso real, nada é desenhado:
 * a tela declara ausência de dado em vez de mostrar um polígono vazio.
 */
export function RadarCarteiraConectado() {
  const carregar = useServerFn(listarRegistros);
  const q = useQuery({
    queryKey: ["saas", "crm_casos", false],
    queryFn: () => carregar({ data: { entidade: "crm_casos", incluirArquivados: false } }),
    retry: false,
  });

  const leitura = useMemo(() => {
    const linhas = ((q.data ?? []) as Record<string, unknown>[]).filter(
      (l) => papelDoRegistro(l).valor !== "demo",
    );
    const total = linhas.length;
    if (!total) return null;

    const hoje = Date.now();
    const pct = (n: number) => Math.round((n / total) * 100);

    const comProximaAcao = linhas.filter((l) => String(l["proxima_acao"] ?? "").trim().length > 0).length;
    const noPrazo = linhas.filter((l) => {
      const prazo = l["prazo_proxima_acao"];
      if (!prazo) return false;
      const t = new Date(String(prazo)).getTime();
      return Number.isFinite(t) && t >= hoje;
    }).length;
    const comResponsavel = linhas.filter(
      (l) => String(l["proxima_acao_responsavel"] ?? "").trim().length > 0,
    ).length;
    const comLeitura = linhas.filter(
      (l) => String(l["hipotese_elegibilidade"] ?? "").trim().length > 0,
    ).length;

    const eixos: RadarAxis[] = [
      { label: "Próxima ação", value: pct(comProximaAcao) },
      { label: "Prazo vigente", value: pct(noPrazo) },
      { label: "Responsável", value: pct(comResponsavel) },
      { label: "Leitura de origem", value: pct(comLeitura) },
    ];

    const semAcao = total - comProximaAcao;
    const prazoVencido = total - noPrazo;
    const semResponsavel = total - comResponsavel;
    const esperaExterna = linhas.filter((l) => Boolean(l["aguardando_instituicao_externa"])).length;

    return { total, eixos, semAcao, prazoVencido, semResponsavel, esperaExterna, comLeitura };
  }, [q.data]);

  if (q.isLoading) return <p className="text-sm text-navy/50">Lendo a carteira para o radar…</p>;
  if (q.isError) {
    return (
      <p className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta">
        O radar da carteira não pôde ser lido agora. Nenhum eixo é desenhado, para não parecer
        cobertura completa.
      </p>
    );
  }
  if (!leitura) {
    return (
      <p className="rounded-xl border border-navy/15 bg-cream/50 p-4 text-sm text-navy/60">
        Nenhum caso real ativo na carteira. Sem dados suficientes para o radar interno.
      </p>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <KitCard>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-navy/50">
          Radar da carteira · {leitura.total} casos reais
        </p>
        <RadarChart axes={leitura.eixos} label="Cobertura operacional da carteira em quatro eixos" />
        <p className="mt-2 text-xs text-navy/55">
          Percentual de casos ativos com o campo preenchido. Leitura de cobertura operacional, não
          de mérito do caso.
        </p>
      </KitCard>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <KpiCard label="Sem próxima ação" value={leitura.semAcao} detail="Precisam de decisão" tone={leitura.semAcao ? "critical" : "success"} />
          <KpiCard label="Prazo vencido ou ausente" value={leitura.prazoVencido} detail="Revisar cadência" tone={leitura.prazoVencido ? "attention" : "success"} />
          <KpiCard label="Sem responsável" value={leitura.semResponsavel} detail="Atribuir dono" tone={leitura.semResponsavel ? "attention" : "success"} />
          <KpiCard label="Em espera externa" value={leitura.esperaExterna} detail="Aguardando instituição" tone="neutral" />
        </div>
        <KitCard>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-navy/50">
            Matriz interna resumida
          </p>
          <div className="mt-3">
            <DeskMatrix
              rows={[
                {
                  label: "Ação",
                  values: [
                    { value: leitura.semAcao, tone: leitura.semAcao ? "critical" : "success" },
                    { value: leitura.semResponsavel, tone: leitura.semResponsavel ? "attention" : "success" },
                    { value: leitura.prazoVencido, tone: leitura.prazoVencido ? "attention" : "success" },
                  ],
                },
                {
                  label: "Leitura",
                  values: [
                    { value: leitura.comLeitura, tone: "gold" },
                    { value: leitura.esperaExterna, tone: "neutral" },
                    { value: leitura.total, tone: "neutral" },
                  ],
                },
              ]}
            />
          </div>
          <p className="mt-3 text-xs text-navy/55">
            Colunas: sem próxima ação · sem responsável · prazo vencido. Segunda linha: com leitura
            de origem · em espera externa · total da carteira.
          </p>
        </KitCard>
      </div>
    </div>
  );
}
