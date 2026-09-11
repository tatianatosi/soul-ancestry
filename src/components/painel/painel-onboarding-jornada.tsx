/**
 * Painel interno — Onboarding e jornada (CA-LOVABLE-ONBOARDING-JORNADA-v1.1).
 * Somente leitura. Alertas de cadência são internos e nunca disparam mensagem.
 *
 * Fonte canônica de contagem D10/D14 e casos no eixo operação em /ops.
 * Não montar MetricasJornada nem PainelCadencia na mesma rota (dedup CA-UX-03).
 */

import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { obterPainelJornada } from "@/lib/onboarding-jornada.functions";
import { Link } from "@tanstack/react-router";
import { ESTADO_DERIVADO, rotulo } from "@/lib/onboarding-jornada";
import { tipoAlertaDeTexto } from "@/lib/fiacao-cadencia-catalogo";

const CONTADORES: { chave: string; rotulo: string; alerta?: boolean }[] = [
  { chave: "casos_em_onboarding", rotulo: "Casos em onboarding" },
  { chave: "casos_ativos", rotulo: "Casos ativos" },
  { chave: "casos_bloqueados", rotulo: "Casos bloqueados", alerta: true },
  { chave: "sem_proxima_acao", rotulo: "Sem próxima ação", alerta: true },
  { chave: "sem_microentrega_planejada", rotulo: "Sem microentrega planejada", alerta: true },
  { chave: "sem_touchpoint_10d", rotulo: "10+ dias sem touchpoint", alerta: true },
  { chave: "sem_atualizacao_14d", rotulo: "14+ dias sem atualização", alerta: true },
  { chave: "entregas_aguardando_aprovacao", rotulo: "Entregas aguardando aprovação" },
  { chave: "entregas_publicadas", rotulo: "Entregas publicadas" },
];

export function PainelOnboardingJornada() {
  const carregar = useServerFn(obterPainelJornada);
  const { data, isLoading, error } = useQuery({
    queryKey: ["onboarding-jornada", "painel"],
    queryFn: () => carregar(),
  });

  return (
    <section className="mt-6 rounded-xl border border-navy/10 bg-white p-5">
      <h2 className="font-serif text-xl text-navy">Onboarding e jornada</h2>
      <p className="mt-1 text-xs text-navy/60">
        Diagnóstico interno de gates, cadência e entregas. Nenhuma comunicação é enviada
        automaticamente.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-terracotta">Não foi possível carregar o diagnóstico.</p>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {CONTADORES.map((c) => {
          const valor = (data?.contadores as Record<string, number> | undefined)?.[c.chave] ?? 0;
          return (
            <div
              key={c.chave}
              className={`rounded-lg border p-3 ${
                c.alerta && valor > 0
                  ? "border-terracotta/40 bg-terracotta/5"
                  : "border-navy/10 bg-cream/40"
              }`}
            >
              <p className="text-[11px] uppercase tracking-wide text-navy/50">{c.rotulo}</p>
              <p className="mt-1 font-serif text-2xl text-navy">{isLoading ? "…" : valor}</p>
            </div>
          );
        })}
      </div>

      {data?.casos?.length ? (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-navy/50">
              <tr>
                <th className="py-2 pr-3">Caso</th>
                <th className="py-2 pr-3">Estado derivado</th>
                <th className="py-2 pr-3">Diagnóstico</th>
                <th className="py-2 pr-3">Próxima ação</th>
                <th className="py-2 pr-3">Prazo</th>
                <th className="py-2">Alertas internos</th>
              </tr>
            </thead>
            <tbody>
              {data.casos.slice(0, 25).map((c) => (
                <tr key={c.case_id} className="border-t border-navy/5 align-top">
                  <td className="py-2 pr-3 font-medium text-navy">
                    {c.codigo ?? c.case_id.slice(0, 8)}
                  </td>
                  <td className="py-2 pr-3 text-navy/70">{rotulo(ESTADO_DERIVADO, c.estado)}</td>
                  <td className="py-2 pr-3 text-navy/70">{c.diagnostico.replace(/_/g, " ")}</td>
                  <td className="py-2 pr-3 text-navy/70">{c.proxima_acao ?? "—"}</td>
                  <td className="py-2 pr-3 text-navy/70">{c.prazo ?? "—"}</td>
                  <td className="py-2 text-navy/70">
                    {c.alertas.length ? (
                      <ul className="space-y-1">
                        {c.alertas.map((a) => {
                          const tipo = tipoAlertaDeTexto(a);
                          return (
                            <li key={a}>
                              <span>{a}</span>
                              {tipo ? (
                                <>
                                  {" · "}
                                  <Link
                                    to="/biblioteca-mensagens"
                                    search={{
                                      alerta: tipo,
                                      caso: c.case_id,
                                      codigo: c.codigo ?? undefined,
                                    }}
                                    className="underline underline-offset-2"
                                  >
                                    Abrir modelo sugerido
                                  </Link>
                                </>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
