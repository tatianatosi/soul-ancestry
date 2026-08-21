import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { SaasShell, EstadoVazio } from "@/components/saas/shell";
import { carregarConversao, garantirTemplateOnboarding } from "@/lib/conversao.functions";
import {
  ESTADOS_ACEITE,
  EVENTOS_CONVERSAO,
  calcularMetricas,
  calcularQuadroMetricas,
  calcularSaudeComercial,
  MOMENTOS_ACEITE,
  situacaoAceite,
  moeda,
  percentual,
} from "@/lib/conversao";
import { FASES_CICLO_PILOTO, NOTA_CICLO } from "@/lib/ciclo-piloto-ana";
import { FORA_DO_PRIMEIRO_RELEASE, NOTA_FORA_DO_RELEASE, NOTA_PLACEGO } from "@/lib/corte-vertical";
import { CHECKLIST_ONBOARDING, FASES_ONBOARDING, REGRA_VALOR_PERCEBIDO } from "@/lib/onboarding-padrao";

export const Route = createFileRoute("/_authenticated/conversao")({
  head: () => ({
    meta: [
      { title: "Conversão e marketing — Clube Ancestral" },
      { name: "description", content: "Investimento, leads, custo por lead, CAC, conversão por etapa e regra de aceite padrão." },
      { property: "og:title", content: "Conversão e marketing — Clube Ancestral" },
      { property: "og:description", content: "Métricas internas de conversão e onboarding padrão do Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Conversao,
});

const Bloco = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-navy/10 bg-white p-5">
    <h2 className="font-serif text-lg text-navy">{titulo}</h2>
    <div className="mt-3 text-sm text-navy/70">{children}</div>
  </section>
);

function Conversao() {
  const carregar = useServerFn(carregarConversao);
  const q = useQuery({ queryKey: ["conversao"], queryFn: () => carregar(), retry: false });
  const criarTemplate = useServerFn(garantirTemplateOnboarding);
  const mTemplate = useMutation({ mutationFn: () => criarTemplate() });

  const metricas = useMemo(() => {
    if (!q.data) return null;
    const nomes = new Map((q.data.campanhas ?? []).map((c: Record<string, unknown>) => [String(c.id), String(c.nome)]));
    return calcularMetricas(
      (q.data.eventos ?? []) as never,
      (q.data.investimentos ?? []) as never,
      (id) => (id ? (nomes.get(String(id)) ?? "campanha não vinculada") : "sem campanha"),
    );
  }, [q.data]);

  const aceitePorLead = useMemo(() => {
    const eventos = (q.data?.eventos ?? []) as { event_type: string; lead_id?: string | null }[];
    const leads = (q.data?.leadsTodos ?? []) as Record<string, unknown>[];
    return leads
      .map((l) => ({
        id: String(l.id),
        nome: String(l.nome ?? "Sem nome"),
        codigo: String(l.codigo ?? "—"),
        situacao: situacaoAceite(eventos.filter((e) => e.lead_id === l.id)),
      }))
      .filter((l) => l.situacao.momentoAtual !== null)
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [q.data]);

  const quadro = useMemo(() => (metricas ? calcularQuadroMetricas(metricas) : []), [metricas]);
  const saude = useMemo(
    () => calcularSaudeComercial(((q.data?.leads ?? []) as never), ((q.data?.casos ?? []) as never)),
    [q.data],
  );

  return (
    <SaasShell
      titulo="Conversão, marketing e aceite padrão"
      descricao="Leitura interna de funil e investimento. Nenhuma cobrança, mensagem ou automação é disparada aqui."
    >
      {q.isLoading ? (
        <EstadoVazio mensagem="Carregando métricas…" />
      ) : q.isError ? (
        <EstadoVazio mensagem={q.error instanceof Error ? q.error.message : "Falha ao carregar."} />
      ) : (
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { r: "Investimento registrado", v: moeda(metricas?.investimentoTotal ?? 0) },
              { r: "CAC", v: moeda(metricas?.cac ?? null) },
              {
                r: "Tempo entrada → pagamento",
                v: metricas?.tempoMedioEntradaPagamentoDias == null ? "—" : `${metricas.tempoMedioEntradaPagamentoDias.toFixed(1)} dias`,
              },
              { r: "Eventos registrados", v: String((q.data?.eventos ?? []).length) },
            ].map((c) => (
              <div key={c.r} className="rounded-xl border border-navy/10 bg-white p-5">
                <p className="text-xs uppercase tracking-wide text-navy/50">{c.r}</p>
                <p className="mt-2 font-serif text-2xl text-navy">{c.v}</p>
              </div>
            ))}
          </div>

          <Bloco titulo="Padrão de aceite — quatro momentos">
            <div className="grid gap-2 lg:grid-cols-4">
              {MOMENTOS_ACEITE.map((m) => (
                <div key={m.codigo} className="rounded-lg border border-navy/10 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-navy/50">Momento {m.ordem}</p>
                  <p className="font-serif text-base text-navy">{m.rotulo}</p>
                  <p className="mt-1 text-[11px] text-navy/60">{m.evidencia}</p>
                  <p className="mt-1 text-[11px] text-navy/70">Libera: {m.libera}</p>
                  <p className="mt-1 text-[11px] text-terracotta">{m.naoLibera}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {aceitePorLead.length === 0 ? (
                <EstadoVazio mensagem="Nenhum lead com evento de aceite registrado." />
              ) : (
                aceitePorLead.map((l) => (
                  <div key={l.id} className="rounded-lg border border-navy/10 p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-serif text-base text-navy">{l.nome}</p>
                      <span className="text-[10px] uppercase tracking-wide text-navy/40">{l.codigo}</span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-navy">{l.situacao.rotuloEstado}</p>
                    <p className="text-[11px] text-navy/60">Próxima ação: {l.situacao.proximaAcao}</p>
                    <ul className="mt-1 flex flex-wrap gap-1">
                      {MOMENTOS_ACEITE.map((m) => (
                        <li
                          key={m.codigo}
                          className={`rounded px-1.5 py-0.5 text-[10px] ${
                            l.situacao.alcancados[m.codigo] ? "bg-gold/20 text-navy" : "bg-navy/5 text-navy/40"
                          }`}
                        >
                          {m.ordem}. {m.rotulo}
                        </li>
                      ))}
                    </ul>
                    {l.situacao.bloqueios.length > 0 && (
                      <ul className="mt-2 space-y-0.5 text-[11px] text-terracotta">
                        {l.situacao.bloqueios.map((b) => (
                          <li key={b}>• {b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-navy/60">
              Aceite verbal e confirmação formal são momentos distintos: o Desk registra o estado e mantém contrato,
              cobrança e onboarding bloqueados até a evidência exigida.
            </p>
          </Bloco>

          <Bloco titulo="Quadro de métricas comerciais">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-navy/50">
                <tr>
                  <th className="py-1 pr-3">Métrica</th>
                  <th className="py-1 pr-3">Fórmula operacional</th>
                  <th className="py-1">Valor</th>
                </tr>
              </thead>
              <tbody>
                {quadro.map((l) => (
                  <tr key={l.metrica} className="border-t border-navy/5 align-top">
                    <td className="py-1.5 pr-3 text-navy">{l.metrica}</td>
                    <td className="py-1.5 pr-3 text-navy/60">
                      {l.formula}
                      {l.detalhe && <span className="block text-[10px] text-navy/40">{l.detalhe}</span>}
                    </td>
                    <td className="py-1.5 font-medium text-navy">{l.valor}</td>
                  </tr>
                ))}
                <tr className="border-t border-navy/5 align-top">
                  <td className="py-1.5 pr-3 text-navy">Saúde comercial</td>
                  <td className="py-1.5 pr-3 text-navy/60">
                    Leads ativos sem próxima ação, follow-ups vencidos e propostas sem resposta
                  </td>
                  <td className="py-1.5 font-medium text-navy">
                    {saude.leadsSemProximaAcao.length + saude.followupsVencidos.length + saude.propostasSemResposta.length}
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-navy/60">
              A conversão é medida como sequência de eventos, não como um único status: o intervalo entre aceite verbal e
              confirmação formal fica explícito.
            </p>
          </Bloco>

          <Bloco titulo="Saúde comercial">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { r: "Leads ativos sem próxima ação", l: saude.leadsSemProximaAcao },
                { r: "Follow-ups vencidos", l: saude.followupsVencidos },
                { r: "Propostas sem resposta", l: saude.propostasSemResposta },
                { r: "Aceite verbal sem confirmação formal", l: saude.aceiteVerbalSemFormalizacao },
              ].map((g) => (
                <div key={g.r} className="rounded-lg border border-navy/10 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-navy/50">{g.r}</p>
                  <p className="font-serif text-2xl text-navy">{g.l.length}</p>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-navy/60">
                    {g.l.slice(0, 4).map((i) => (
                      <li key={i.id}>• {i.rotulo}</li>
                    ))}
                    {g.l.length > 4 && <li className="text-navy/40">+ {g.l.length - 4} outro(s)</li>}
                    {g.l.length === 0 && <li className="text-navy/40">Sem pendência.</li>}
                  </ul>
                </div>
              ))}
            </div>
          </Bloco>

          <Bloco titulo="Funil por evento">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {EVENTOS_CONVERSAO.map((e) => (
                <div key={e.codigo} className="flex items-center justify-between rounded-lg border border-navy/10 px-3 py-2">
                  <span className="text-xs text-navy/70">
                    {e.rotulo}
                    <span className="block text-[10px] uppercase tracking-wide text-navy/40">{e.etapa}</span>
                  </span>
                  <span className="font-serif text-lg text-navy">{metricas?.contagem[e.codigo] ?? 0}</span>
                </div>
              ))}
            </div>
          </Bloco>

          <Bloco titulo="Fora do primeiro release">
            <ul className="grid gap-1 sm:grid-cols-2">
              {FORA_DO_PRIMEIRO_RELEASE.map((i) => (
                <li key={i} className="text-xs text-terracotta">
                  • {i}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-navy/60">{NOTA_FORA_DO_RELEASE}</p>
            <p className="mt-1 text-xs text-navy/60">{NOTA_PLACEGO}</p>
          </Bloco>


          <Bloco titulo="Taxa de conversão por etapa">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(metricas?.conversaoEtapa ?? []).map((e) => (
                <div key={`${e.de}-${e.para}`} className="rounded-lg border border-navy/10 px-3 py-2 text-xs">
                  <span className="text-navy/60">
                    {e.de} → {e.para}
                  </span>
                  <span className="ml-2 font-medium text-navy">{percentual(e.taxa)}</span>
                </div>
              ))}
            </div>
          </Bloco>

          <Bloco titulo="Regra de aceite padrão">
            <ol className="space-y-2">
              {ESTADOS_ACEITE.map((e, i) => (
                <li key={e.codigo} className="rounded-lg border border-navy/10 px-3 py-2">
                  <span className="text-[11px] uppercase tracking-wide text-navy/40">Estado {i + 1}</span>
                  <p className="text-sm text-navy">{e.rotulo}</p>
                  <p className="text-xs text-navy/60">{e.libera}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-navy/60">
              Aceite verbal não cria cliente ativo. Confirmação formal libera preparação de contrato, sem cobrança. Contrato assinado e pagamento inicial
              confirmado liberam onboarding. Toda mudança gera evento de conversão imutável.
            </p>
          </Bloco>

          <Bloco titulo="Onboarding padrão para todos">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {FASES_ONBOARDING.map((f) => (
                <div key={f.codigo} className="rounded-lg border border-navy/10 px-3 py-2">
                  <p className="text-sm text-navy">
                    Fase {f.numero} — {f.nome}
                  </p>
                  <p className="text-xs text-navy/60">{f.objetivo}</p>
                </div>
              ))}
            </div>
            <ul className="mt-3 grid gap-1 text-xs text-navy/70 sm:grid-cols-2">
              {CHECKLIST_ONBOARDING.map((i) => (
                <li key={i.item}>
                  • {i.item} {i.prazo_dias ? <span className="text-navy/40">(D{i.prazo_dias})</span> : null}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                className="rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
                disabled={mTemplate.isPending}
                onClick={() => mTemplate.mutate()}
              >
                {mTemplate.isPending ? "Registrando…" : "Registrar template padrão no Desk"}
              </button>
              {mTemplate.data && (
                <span className="text-xs text-navy/60">Template disponível — {mTemplate.data.itensCriados} item(ns) adicionado(s).</span>
              )}
              {mTemplate.isError && <span className="text-xs text-terracotta">{(mTemplate.error as Error).message}</span>}
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-navy/60">
              {REGRA_VALOR_PERCEBIDO.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Bloco>
        </div>
      )}
    </SaasShell>
  );
}
