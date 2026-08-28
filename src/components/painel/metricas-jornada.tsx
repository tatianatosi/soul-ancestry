/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { metricasJornada } from "@/lib/fechamento-caso.functions";
import { rotuloFase } from "@/lib/fase-rotulo";

function Kpi({ rotulo, valor, nota }: { rotulo: string; valor: string | number; nota?: string }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-4">
      <p className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo}</p>
      <p className="mt-1 font-serif text-2xl text-navy">{valor}</p>
      {nota ? <p className="mt-1 text-[11px] text-navy/50">{nota}</p> : null}
    </div>
  );
}

/** Métricas diárias da jornada do cliente — visão interna, nunca projetada ao App. */
export function MetricasJornada() {
  const carregar = useServerFn(metricasJornada);
  const q = useQuery({ queryKey: ["metricas-jornada"], queryFn: () => carregar() });
  const m = q.data as any;

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="font-serif text-lg text-navy">Métricas da jornada</h2>
      <p className="mt-1 text-xs text-navy/55">
        Ativação, tempo até valor percebido, cadência e pendências. Uso diário da equipe.
      </p>

      {q.isLoading || !m ? (
        <p className="mt-4 text-sm text-navy/55">Carregando…</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi rotulo="Casos acompanhados" valor={m.casos} />
            <Kpi
              rotulo="Clientes ativados no App"
              valor={m.ativadosNoApp}
              nota="Acesso liberado e confirmado"
            />
            <Kpi
              rotulo="Ativação → 1ª entrega vista"
              valor={m.mediaDiasAtivacaoAteEntregaVisualizada ?? "—"}
              nota="Média em dias"
            />
            <Kpi
              rotulo="Dias sem touchpoint"
              valor={m.mediaDiasSemTouchpoint ?? "—"}
              nota="Média por caso"
            />
            <Kpi rotulo="Acima de 14 dias sem atualização" valor={m.casosAcimaDe14Dias} />
            <Kpi
              rotulo="Entregas"
              valor={`${m.entregas.aprovadas}/${m.entregas.publicadas}/${m.entregas.visualizadas}`}
              nota="Aprovadas / publicadas / visualizadas"
            />
            <Kpi rotulo="Documentos aguardados do cliente" valor={m.documentosAguardandoCliente} />
            <Kpi
              rotulo="Bloqueios"
              valor={`${m.bloqueiosInternos} / ${m.bloqueiosExternos}`}
              nota="Internos / externos (instituição)"
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">
                Casos por fase do CRM
              </p>
              <p className="mt-0.5 text-[11px] text-navy/45">
                Conta a fase registrada no caso (<code>crm_casos.fase</code>). O planejador em
                Contratos conta a fase do plano operacional — são campos diferentes e podem
                divergir.
              </p>
              <ul className="mt-2 space-y-1 text-sm text-navy/70">
                {Object.entries(m.casosPorFase as Record<string, number>).map(([fase, total]) => (
                  <li key={fase} className="flex justify-between gap-3 border-b border-navy/5 py-1">
                    <span>{rotuloFase(fase)}</span>
                    <span className="text-navy">{total}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy/60">
                Pendências por responsável
              </p>
              <ul className="mt-2 space-y-1 text-sm text-navy/70">
                {Object.entries(m.pendenciasPorResponsavel as Record<string, number>)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([resp, total]) => (
                    <li
                      key={resp}
                      className="flex justify-between gap-3 border-b border-navy/5 py-1"
                    >
                      <span className="truncate">
                        {resp === "sem_responsavel" ? "Sem responsável" : resp}
                      </span>
                      <span className="text-navy">{total}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-[11px] text-navy/45">
            NPS (D30, fim de etapa e conclusão), indicações e renovação dependem de coleta
            registrada — ainda não há fonte homologada, por isso não são exibidos como número
            estimado.
          </p>
        </>
      )}
    </section>
  );
}
