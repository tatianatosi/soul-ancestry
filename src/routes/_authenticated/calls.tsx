import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";

import { PainelCalls } from "@/components/crm/painel-calls";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";
import { SaasShell } from "@/components/saas/shell";
import { listarLeadsDesk } from "@/lib/crm-desk.functions";
import { rotulo, type LeadDesk } from "@/lib/crm-desk";
import { estadoCall, ROTULO_ESTADO_CALL, type EstadoCall } from "@/lib/painel-calls";
import { ETAPAS_SPIN, progressoSpin } from "@/lib/discovery-roteiro";
import { Etiqueta, BarrasHorizontais, Pessoa, type Tom } from "@/components/prancha-v4/kit";
import { CaCard } from "@/components/ui/ca-card";

export const Route = createFileRoute("/_authenticated/calls")({
  validateSearch: (s: Record<string, unknown>): { lead?: string } => ({
    lead: typeof s.lead === "string" && s.lead.length > 0 ? s.lead : undefined,
  }),
  errorComponent: ({ error, reset }) => (
    <ErroSuperficieDesk error={error as Error} reset={reset} titulo="Mesa de Discovery" />
  ),
  head: () => ({
    meta: [
      { title: "CRM Vivo & Discovery Calls — Clube Ancestral" },
      {
        name: "description",
        content:
          "Entrada comercial: calls agendadas e realizadas, roteiro SPIN, consentimento e handoff para pessoa/caso. KPIs de atraso ficam no Hoje.",
      },
      { property: "og:title", content: "CRM Vivo & Discovery Calls — Clube Ancestral" },
      {
        property: "og:description",
        content: "A Mesa de Discovery faz a entrada comercial funcionar — Calls, SPIN e handoff no Desk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CallsPage,
});

const TOM_ESTADO_CALL: Record<EstadoCall, Tom> = {
  sem_agenda: "neutro",
  agendada: "neutro",
  confirmada: "atencao",
  realizada: "sucesso",
  remarcada: "atencao",
  no_show: "critico",
  cancelada: "critico",
};

const TOM_CONSENTIMENTO: Record<string, Tom> = {
  nao_solicitado: "neutro",
  pendente: "atencao",
  concedido: "sucesso",
  recusado: "critico",
};

function horarioCall(v: string | null | undefined): string {
  if (!v) return "—";
  return String(v).slice(0, 16).replace("T", " ");
}

function CallsPage() {
  const { lead } = Route.useSearch();

  const carregarLeads = useServerFn(listarLeadsDesk);
  const qLeads = useQuery({
    // Mesma chave do PainelCalls (`crm/painel-calls.tsx`): esta tela e o
    // registro detalhado da call vivem na mesma rota e compartilham o cache.
    queryKey: ["leads-desk"],
    queryFn: () => carregarLeads(),
    retry: false,
  });

  const leadsReais = useMemo(
    () => ((qLeads.data ?? []) as LeadDesk[]).filter((l) => l.dados_teste !== true && !l.archived_at),
    [qLeads.data],
  );

  const agendadas = useMemo(() => leadsReais.filter((l) => l.call_agendada_em), [leadsReais]);
  const realizadas = useMemo(() => leadsReais.filter((l) => l.call_realizada_em), [leadsReais]);
  const noShow = useMemo(() => leadsReais.filter((l) => l.discovery_resultado === "no_show"), [leadsReais]);
  const qualificados = useMemo(
    () => leadsReais.filter((l) => ["aderente", "aderente_com_ressalva"].includes(String(l.discovery_resultado))),
    [leadsReais],
  );
  const taxaQualificacao = realizadas.length > 0 ? Math.round((qualificados.length / realizadas.length) * 100) : null;

  const grade = useMemo(
    () =>
      [...agendadas]
        .sort((a, b) => String(b.call_agendada_em).localeCompare(String(a.call_agendada_em)))
        .slice(0, 10),
    [agendadas],
  );

  const selecionado = useMemo(
    () => (lead ? leadsReais.find((l) => l.id === lead) : undefined) ?? grade[0] ?? leadsReais[0],
    [lead, leadsReais, grade],
  );

  const spinItens = selecionado
    ? progressoSpin(selecionado).map((p) => ({
        rotulo: p.rotulo,
        valor: p.total > 0 ? Math.round((p.preenchidas / p.total) * 100) : 0,
        apoio: `${p.preenchidas}/${p.total}`,
      }))
    : [];

  return (
    <SaasShell
      titulo="CRM Vivo & Discovery Calls"
      descricao="Calls agendadas e realizadas, roteiro SPIN e consentimento. O handoff do Discovery vira oportunidade abaixo, na Mesa."
    >
      {qLeads.isError ? (
        <p role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
          A leitura dos leads falhou. Isto é erro de leitura, não pipeline vazio.
        </p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Calls Agendadas</p>
          <p className="mt-1 font-serif text-3xl text-navy">{agendadas.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Realizadas</p>
          <p className="mt-1 font-serif text-3xl text-navy">{realizadas.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">No-Show</p>
          <p className="mt-1 font-serif text-3xl text-navy">{noShow.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Taxa de Qualificação</p>
          <p className="mt-1 font-serif text-3xl text-navy">{taxaQualificacao === null ? "—" : `${taxaQualificacao}%`}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="font-serif text-lg text-navy">Mesa de Discovery</h2>
        <div className="flex gap-2">
          <a
            href="#calls-spin"
            className="rounded-full border border-navy/20 px-4 py-1.5 text-sm text-navy hover:bg-navy/5"
          >
            Roteiro SPIN
          </a>
          <a
            href="#calls-handoff"
            className="rounded-full bg-navy px-4 py-1.5 text-sm text-cream hover:bg-navy/90"
          >
            Handoff
          </a>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <CaCard titulo="Grade de reuniões" eyebrow="Mesa de Discovery · Horário, lead, canal e status" className="lg:col-span-2">
          {grade.length === 0 ? (
            <p className="text-sm text-navy/55">Nenhuma call agendada no pipeline real no momento.</p>
          ) : (
            <ul className="space-y-2">
              {grade.map((l) => {
                const estado = estadoCall(l);
                const ativo = selecionado?.id === l.id;
                return (
                  <li key={l.id}>
                    <Link
                      to="/calls"
                      search={{ lead: l.id }}
                      className={`flex flex-wrap items-center gap-3 rounded-lg border p-2.5 text-sm transition-colors ${
                        ativo ? "border-navy/40 bg-navy/5" : "border-border bg-card hover:bg-navy/5"
                      }`}
                    >
                      <span className="w-[120px] shrink-0 tabular-nums text-xs text-navy/70">
                        {horarioCall(l.call_agendada_em)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <Pessoa nome={l.nome} papel={l.responsavel_nome || "sem responsável"} />
                      </span>
                      <Etiqueta texto={l.origem ? rotulo("origem", l.origem) : "Origem não informada"} tom="neutro" />
                      <Etiqueta texto={ROTULO_ESTADO_CALL[estado]} tom={TOM_ESTADO_CALL[estado]} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CaCard>

        <CaCard titulo="Consentimento" eyebrow="Mesa de Discovery · Lead selecionado na grade">
          {!selecionado ? (
            <p className="text-sm text-navy/55">Selecione um lead na grade de reuniões.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <Pessoa nome={selecionado.nome} papel={selecionado.responsavel_nome || "sem responsável"} />
              </div>
              <Etiqueta
                texto={rotulo("consentimento_status", selecionado.consentimento_status ?? "nao_solicitado")}
                tom={TOM_CONSENTIMENTO[selecionado.consentimento_status ?? "nao_solicitado"] ?? "neutro"}
              />
              <p className="text-xs text-navy/65">
                Canal:{" "}
                {selecionado.consentimento_canal ? rotulo("consentimento_canal", selecionado.consentimento_canal) : "não registrado"}
                {" · "}
                Registrado em: {selecionado.consentimento_em ? horarioCall(selecionado.consentimento_em) : "não registrado"}
              </p>
            </div>
          )}
        </CaCard>
      </div>

      <div id="calls-spin" className="scroll-mt-24">
        <CaCard titulo="Roteiro SPIN" eyebrow="Situação · Problema · Implicação · Necessidade" className="mb-6">
          {!selecionado ? (
            <p className="text-sm text-navy/55">Selecione um lead na grade de reuniões para ver o roteiro.</p>
          ) : (
            <div className="space-y-4">
              <BarrasHorizontais itens={spinItens} tituloAcessivel="progresso do roteiro SPIN" />
              <p className="text-xs text-navy/55">
                {ETAPAS_SPIN.map((e) => e.paraQue).join(" ")}
              </p>
            </div>
          )}
        </CaCard>
      </div>

      <PainelCalls leadIdInicial={selecionado?.id ?? lead} />
    </SaasShell>
  );
}
