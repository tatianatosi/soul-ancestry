import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { PainelCalls } from "@/components/crm/painel-calls";
import { ErroSuperficieDesk } from "@/components/saas/erro-superficie";
import { SaasShell } from "@/components/saas/shell";
import { FonteAlimento } from "@/components/desk/fonte-alimento";
import { ComercialV4Topo } from "@/components/crm/comercial-v4-topo";
import { listarLeadsDesk, salvarLeadDesk } from "@/lib/crm-desk.functions";
import { registrarInteracao } from "@/lib/crm-fluxo.functions";
import { CATALOGOS, rotulo, type LeadDesk } from "@/lib/crm-desk";
import { AVISO_PRIVACIDADE } from "@/lib/decisoes-da-proprietaria";
import { estadoCall, ROTULO_ESTADO_CALL, type EstadoCall } from "@/lib/painel-calls";
import {
  ETAPAS_SPIN,
  META_CAMPO_ROTEIRO,
  perguntasDaEtapa,
  progressoSpin,
  ROTULO_CAMPO_ROTEIRO,
  type EtapaSpin,
} from "@/lib/discovery-roteiro";
import { podeExecutarHandoffDiscovery } from "@/lib/handoff-discovery";
import { Etiqueta, Pessoa, type Tom } from "@/components/prancha-v4/kit";
import { CaCard } from "@/components/ui/ca-card";
// Frente 2 (19/10/2026) — produtos_recomendados aqui é só leitura (edição
// completa fica na Mesa de Propostas, /leads); este componente dá ao
// atendente, durante a call, a visão real do catálogo PP-01–09
// (planner_catalog_feed) ao decidir o que recomendar. Reaproveitado de
// /catalogo e /leads — não é segunda implementação.
import { PlanejadorProdutosPai } from "@/components/catalogo/planejador-produtos-pai";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/calls")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): { lead?: string } => ({
    lead: typeof s.lead === "string" && s.lead.length > 0 ? s.lead : undefined,
  }),
  errorComponent: ({ error, reset }) => (
    <ErroSuperficieDesk error={error as Error} reset={reset} titulo="Mesa de Discovery" />
  ),
  head: () => ({
    meta: [
      { title: "Mesa de Discovery — Clube Ancestral" },
      {
        name: "description",
        content:
          "Entrada comercial: calls agendadas e realizadas, roteiro SPIN, consentimento e handoff para pessoa/caso. KPIs de atraso ficam no Hoje.",
      },
      { property: "og:title", content: "Mesa de Discovery — Clube Ancestral" },
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

function mesmoDia(v: string | null | undefined, hojeStr: string): boolean {
  return !!v && String(v).slice(0, 10) === hojeStr;
}

/** Todos os campos reais do roteiro SPIN desta etapa (preenchidos ou não). */
function camposDaEtapa(etapa: EtapaSpin): string[] {
  return [...new Set(perguntasDaEtapa(etapa).flatMap((p) => p.campos))];
}

/**
 * Qualificação ao vivo, campo a campo — mesma mutação real (salvarLeadDesk)
 * que PainelCalls já usa. Campos de tipo select/texto/numero/data (a maioria
 * do roteiro) ficam editáveis aqui mesmo; multi/trilha/marco (que dependem de
 * listas externas — países, trilhas e marcos jurídicos) continuam só leitura
 * aqui, com link para o roteiro vivo completo dentro de PainelCalls.
 */
function ControleCampoSpin({
  lead,
  campo,
  onSalvar,
  pendente,
  erro,
}: {
  lead: LeadDesk;
  campo: string;
  onSalvar: (campo: string, valor: string | null) => void;
  pendente: boolean;
  erro?: string;
}) {
  const meta = META_CAMPO_ROTEIRO[campo];
  const valorAtual = (lead as unknown as Record<string, unknown>)[campo];
  const rotuloCampo = ROTULO_CAMPO_ROTEIRO[campo] ?? campo;
  const somenteLeitura = !meta || meta.tipo === "multi" || meta.tipo === "trilha" || meta.tipo === "marco";

  if (somenteLeitura) {
    const valorTexto = Array.isArray(valorAtual)
      ? valorAtual.length
        ? valorAtual.map((x) => rotulo(campo, String(x))).join(", ")
        : "não registrado"
      : valorAtual
        ? rotulo(campo, String(valorAtual))
        : "não registrado";
    return (
      <div className="text-xs">
        <dt className="text-navy/50">{rotuloCampo}</dt>
        <dd className="text-navy">{valorTexto}</dd>
        <a href="#calls-roteiro-vivo" className="text-[11px] font-medium text-navy underline">
          Editar no roteiro vivo →
        </a>
      </div>
    );
  }

  const comum = "mt-0.5 w-full rounded-lg border border-navy/15 bg-card px-2 py-1 text-xs text-navy";
  return (
    <div className="text-xs">
      <label className="block text-navy/50">
        {rotuloCampo}
        {meta.tipo === "select" ? (
          <select
            className={comum}
            value={typeof valorAtual === "string" ? valorAtual : ""}
            disabled={pendente}
            onChange={(e) => onSalvar(campo, e.target.value || null)}
          >
            <option value="">Não registrado</option>
            {(CATALOGOS[campo] ?? []).map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        ) : meta.tipo === "numero" ? (
          <input
            type="number"
            className={comum}
            defaultValue={typeof valorAtual === "number" ? valorAtual : ""}
            disabled={pendente}
            onBlur={(e) => onSalvar(campo, e.target.value === "" ? null : e.target.value)}
          />
        ) : meta.tipo === "data" ? (
          <input
            type="date"
            className={comum}
            defaultValue={typeof valorAtual === "string" ? valorAtual.slice(0, 10) : ""}
            disabled={pendente}
            onBlur={(e) => onSalvar(campo, e.target.value || null)}
          />
        ) : (
          <input
            type="text"
            className={comum}
            defaultValue={typeof valorAtual === "string" ? valorAtual : ""}
            disabled={pendente}
            onBlur={(e) => onSalvar(campo, e.target.value.trim() || null)}
          />
        )}
      </label>
      {erro ? <p className="mt-0.5 text-[11px] text-terracotta">{erro}</p> : null}
    </div>
  );
}

function CallsPage() {
  const { lead } = Route.useSearch();
  const qc = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);

  const carregarLeads = useServerFn(listarLeadsDesk);
  const qLeads = useQuery({
    // Mesma chave do PainelCalls (`crm/painel-calls.tsx`): esta tela e o
    // registro detalhado da call vivem na mesma rota e compartilham o cache.
    queryKey: ["leads-desk"],
    queryFn: () => carregarLeads(),
    retry: false,
  });

  // Confirmação rápida de consentimento: mesma função real (salvarLeadDesk)
  // já usada pelo card "Consentimento" dentro de PainelCalls — não é uma
  // segunda implementação, é a mesma mutação, acionada por um botão.
  const salvarLead = useServerFn(salvarLeadDesk);

  // "+ Agendar Call": mesma mutação real (salvarLeadDesk), aplicada a um lead
  // já existente no pipeline — define call_agendada_em e status_call
  // ("agendada", valor real de STATUS_CALL em crm-desk.ts). Não cria lead
  // novo (isso já existe em NovoLeadDialog, em /leads) nem campo novo.
  const [agendarAberto, setAgendarAberto] = useState(false);
  const [agendarLeadId, setAgendarLeadId] = useState("");
  const [agendarQuando, setAgendarQuando] = useState("");
  const [agendarErro, setAgendarErro] = useState<string | null>(null);
  const mutarAgendamento = useMutation({
    mutationFn: () =>
      salvarLead({
        data: {
          id: agendarLeadId,
          valores: { call_agendada_em: agendarQuando, status_call: "agendada" },
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setAgendarErro(res.erros?.[0]?.motivo ?? "Não foi possível agendar a call.");
        return;
      }
      setAgendarErro(null);
      setAgendarAberto(false);
      setAgendarLeadId("");
      setAgendarQuando("");
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: () => setAgendarErro("Falha ao agendar a call."),
  });
  const mutarConsentimento = useMutation({
    mutationFn: (leadId: string) =>
      salvarLead({
        data: {
          id: leadId,
          valores: {
            consentimento_status: "concedido",
            consentimento_canal: "verbal_em_call",
            consentimento_em: new Date().toISOString(),
            // 26/10/2026: sem a versão do aviso o servidor recusava sempre.
            consentimento_versao_aviso: AVISO_PRIVACIDADE.versao,
          },
        },
      }),
    onSuccess: (res) => {
      if (!res.ok) {
        setAviso(res.erros?.[0]?.motivo ?? "Não foi possível registrar o consentimento.");
        return;
      }
      setAviso(null);
      void qc.invalidateQueries({ queryKey: ["leads-desk"] });
    },
    onError: () => setAviso("Falha ao registrar o consentimento."),
  });

  // Qualificação ao vivo do roteiro SPIN — mesma mutação real (salvarLeadDesk)
  // por campo, com controle de pendente/erro por campo para não travar a
  // tela inteira numa única gravação.
  const registrarInteracaoCaso = useServerFn(registrarInteracao);
  const [campoPendente, setCampoPendente] = useState<string | null>(null);
  const [errosCampo, setErrosCampo] = useState<Record<string, string>>({});
  const [momento, setMomento] = useState<"antes" | "durante" | "revisao">("antes");
  async function gravarCampoSpin(leadId: string, campo: string, valor: string | boolean | null) {
    setCampoPendente(campo);
    try {
      const res = await salvarLead({ data: { id: leadId, valores: { [campo]: valor } } });
      if (!res.ok) {
        setErrosCampo((e) => ({ ...e, [campo]: res.erros?.[0]?.motivo ?? "Não foi possível salvar." }));
      } else {
        setErrosCampo((e) => {
          const { [campo]: _descartado, ...resto } = e;
          return resto;
        });
        void qc.invalidateQueries({ queryKey: ["leads-desk"] });
        /*
         * Gravação dupla em crm_interactions (ordem de 19/10/2026): a coluna
         * crm_interactions.case_id é NOT NULL (types.ts + migration
         * 20260820195845) — um lead em Discovery normalmente ainda não tem
         * case_id (só é gravado no Handoff Discovery, handoff-discovery.
         * functions.ts, quando o lead passa a eixo_comercial "ganho"). Para
         * esse lead comum, a interação do roteiro SPIN continua só em
         * `leads`, como já funcionava.
         * Regra exata aplicada aqui: só quando ESTE lead específico já tem
         * `case_id` preenchido (reaproveito de caso já existente no Handoff,
         * ou edição tardia de um lead que já tornou-se caso) é que a mesma
         * resposta do roteiro também gera uma interação real em
         * crm_interactions, usando o mesmo `registrarInteracao` que o painel
         * de Fluxo Comercial já usa — nenhuma lógica nova, nenhuma coluna
         * nova.
         */
        const leadAtual = ((qLeads.data ?? []) as LeadDesk[]).find((l) => l.id === leadId);
        if (leadAtual?.case_id) {
          const rotuloCampo = ROTULO_CAMPO_ROTEIRO[campo] ?? campo;
          const valorTexto = Array.isArray(valor) ? valor.join(", ") : String(valor ?? "não registrado");
          try {
            await registrarInteracaoCaso({
              data: {
                case_id: leadAtual.case_id,
                tipo: "call",
                canal: "desk_only",
                direcao: "interno",
                resumo_interno: `Mesa de Discovery · roteiro SPIN · ${rotuloCampo}: ${valorTexto}`,
              },
            });
          } catch {
            // A gravação em crm_interactions é um espelho adicional: se falhar,
            // o campo já está salvo no lead (gravação principal) e não trava a Mesa.
          }
        }
      }
    } catch {
      setErrosCampo((e) => ({ ...e, [campo]: "Falha ao salvar." }));
    } finally {
      setCampoPendente(null);
    }
  }

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

  const hojeStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const agendaDoDia = useMemo(
    () =>
      [...agendadas]
        .filter((l) => mesmoDia(l.call_agendada_em, hojeStr))
        .sort((a, b) => String(a.call_agendada_em).localeCompare(String(b.call_agendada_em))),
    [agendadas, hojeStr],
  );

  const selecionado = useMemo(
    () => (lead ? leadsReais.find((l) => l.id === lead) : undefined) ?? agendaDoDia[0] ?? leadsReais[0],
    [lead, leadsReais, agendaDoDia],
  );

  // Gate real do handoff (lib/handoff-discovery.ts) — a mesma função que
  // PainelCalls usa para liberar/bloquear o botão de handoff lá dentro.
  // Aqui ela só decide se o atalho fica habilitado e qual motivo mostrar;
  // quem executa o handoff de verdade (com a conferência de pessoa/caso)
  // continua sendo exclusivamente PainelCalls, em #calls-handoff.
  const gateHandoff = selecionado ? podeExecutarHandoffDiscovery(selecionado) : { ok: false, motivo: "Selecione um lead" };

  return (
    <SaasShell
      titulo="Mesa de Discovery"
      descricao="Calls agendadas e realizadas, roteiro SPIN e consentimento. O handoff do Discovery vira oportunidade abaixo, na Mesa."
    >
      <FonteAlimento
        fonte="Leads do CRM Vivo e o roteiro SPIN homologado"
        consumidor="O handoff para proposta e o Caso 360 — nunca cria cadastro sozinho"
        detalheTecnico="podeExecutarHandoffDiscovery · PainelCalls"
      />
      {qLeads.isError ? (
        <p role="alert" className="rounded-xl border border-terracotta/40 bg-terracotta/5 p-4 text-sm text-terracotta">
          A leitura dos leads falhou. Isto é erro de leitura, não pipeline vazio.
        </p>
      ) : null}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Calls Agendadas</p>
          <p className="mt-1 font-serif text-2xl text-navy sm:text-3xl">{agendadas.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Realizadas</p>
          <p className="mt-1 font-serif text-2xl text-navy sm:text-3xl">{realizadas.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">No-Show</p>
          <p className="mt-1 font-serif text-2xl text-navy sm:text-3xl">{noShow.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">Taxa de Qualificação</p>
          <p className="mt-1 font-serif text-2xl text-navy sm:text-3xl">{taxaQualificacao === null ? "—" : `${taxaQualificacao}%`}</p>
        </div>
      </div>

      {/*
        21/10/2026 — nova decisão da Proprietária (prancha V4): funil vivo,
        aquisição por canal, conversão, origem e qualidade e leads por etapa
        voltam ao topo de /calls, acima da Mesa — só leitura, mesmos leads.
        Revoga a regra de 14/10/2026 (PR #157) apenas para esta tela.
      */}
      <ComercialV4Topo leads={leadsReais} />
      <nav aria-label="Momentos da call" className="mb-4 grid grid-cols-3 gap-2">
        {([ ["antes", "Antes"], ["durante", "Durante"], ["revisao", "Revisão"] ] as const).map(([valor, titulo]) => (
          <Button key={valor} variant={momento === valor ? "default" : "outline"} className="min-h-11" aria-pressed={momento === valor} onClick={() => setMomento(valor)}>{titulo}</Button>
        ))}
      </nav>
      {selecionado ? <div className="mb-4 border-b border-border pb-4 text-sm text-navy">
        <Pessoa nome={selecionado.nome} papel={selecionado.codigo || "Código não registrado"} />
        <div className="mt-2 flex flex-wrap gap-3 text-xs">
          {selecionado.case_id ? <Link to="/casos/$caseId" params={{ caseId: selecionado.case_id }}>Abrir Caso 360</Link> : <span>Sem caso vinculado</span>}
          <Link to="/leads">Voltar ao CRM Vivo</Link>
        </div>
      </div> : null}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-lg text-navy">Mesa de Discovery</h2>
        <div className="flex gap-2">
          <a
            href="#calls-spin"
            onClick={() => setMomento("durante")}
            className="rounded-full border border-navy/20 px-4 py-1.5 text-sm text-navy hover:bg-navy/5"
          >
            Roteiro SPIN
          </a>
          <a
            href="#calls-handoff"
            onClick={() => setMomento("revisao")}
            className="rounded-full bg-navy px-4 py-1.5 text-sm text-cream hover:bg-navy/90"
          >
            Handoff
          </a>
        </div>
      </div>

      {/*
        19/10/2026 — corte L04 (Prancha V4): a Mesa se organiza em três
        momentos visíveis. Nada se duplica: cada cartão aponta para a seção
        real que já existe abaixo (agenda/consentimento, roteiro SPIN ao
        lado das respostas, revisão e handoff no PainelCalls).
      */}
      {/*
        22/10/2026 — acabamento visual: no celular (375 px) estes três cartões
        descritivos empilhavam logo abaixo da própria navegação de momentos,
        repetindo o mesmo rótulo e empurrando o trabalho real para fora da
        primeira tela. Nada foi removido: os três continuam no documento e
        aparecem juntos a partir de sm:. No celular fica visível o cartão do
        momento ativo, que é o único que descreve o que a pessoa está fazendo
        agora. A composição homologada em 14/10 (2 colunas, topo sem Kanban)
        não muda.
      */}
      <ol className="mb-6 grid gap-3 sm:grid-cols-3" data-l04-momentos>
        <li
          className={`rounded-xl border border-navy/10 bg-cream/40 p-4 sm:block ${momento === "antes" ? "" : "hidden"}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta">1 · Antes da call</p>
          <p className="mt-1 text-sm font-medium text-navy">Agenda do dia e consentimento</p>
          <p className="mt-1 text-[11px] text-navy/55">
            Horário, canal, responsável e permissão de gravação — confirmados antes de começar.
          </p>
        </li>
        <li
          className={`rounded-xl border border-navy/10 bg-cream/40 p-4 sm:block ${momento === "durante" ? "" : "hidden"}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta">2 · Durante</p>
          <p className="mt-1 text-sm font-medium text-navy">Roteiro SPIN ao lado das respostas</p>
          <p className="mt-1 text-[11px] text-navy/55">
            Situação, Problema, Implicação e Necessidade — pergunta e resposta na mesma tela.
          </p>
        </li>
        <li
          className={`rounded-xl border border-navy/10 bg-cream/40 p-4 sm:block ${momento === "revisao" ? "" : "hidden"}`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-terracotta">3 · Revisão</p>
          <p className="mt-1 text-sm font-medium text-navy">Resumo validado e handoff</p>
          <p className="mt-1 text-[11px] text-navy/55">
            Resumo da call revisado pela pessoa responsável antes de virar proposta — nunca automático.
          </p>
        </li>
      </ol>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Coluna da esquerda: Agenda & Consentimento */}
        <div hidden={momento !== "antes"} className="space-y-6">
          <CaCard
            titulo="Agenda de Discovery do Dia"
            eyebrow="Mesa de Discovery · Horário, lead, canal e status"
            className="rounded-2xl p-6"
            acao={
              <button
                type="button"
                onClick={() => {
                  setAgendarErro(null);
                  setAgendarQuando(`${hojeStr}T09:00`);
                  setAgendarAberto((a) => !a);
                }}
                className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream hover:bg-navy/90"
              >
                + Agendar Call
              </button>
            }
          >
            {agendarAberto ? (
              <div className="mb-4 space-y-3 rounded-xl border border-navy/15 bg-cream/40 p-4">
                <label className="block text-xs text-navy/50">
                  Lead
                  <select
                    className="mt-0.5 w-full rounded-lg border border-navy/15 bg-card px-2 py-1 text-xs text-navy"
                    value={agendarLeadId}
                    onChange={(e) => setAgendarLeadId(e.target.value)}
                  >
                    <option value="">Selecione um lead do pipeline</option>
                    {leadsReais.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs text-navy/50">
                  Data e horário da call
                  <input
                    type="datetime-local"
                    className="mt-0.5 w-full rounded-lg border border-navy/15 bg-card px-2 py-1 text-xs text-navy"
                    value={agendarQuando}
                    onChange={(e) => setAgendarQuando(e.target.value)}
                  />
                </label>
                {agendarErro ? <p className="text-[11px] text-terracotta">{agendarErro}</p> : null}
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!agendarLeadId || !agendarQuando || mutarAgendamento.isPending}
                    onClick={() => mutarAgendamento.mutate()}
                    className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-50"
                  >
                    {mutarAgendamento.isPending ? "Agendando…" : "Agendar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendarAberto(false)}
                    className="rounded-full border border-navy/20 px-4 py-1.5 text-xs text-navy hover:bg-navy/5"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}
            {agendaDoDia.length === 0 ? (
              <p className="text-sm text-navy/55">Nenhuma call agendada para hoje no pipeline real.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {agendaDoDia.map((l) => {
                  const estado = estadoCall(l);
                  const ativo = selecionado?.id === l.id;
                  return (
                    <Link
                      key={l.id}
                      to="/calls"
                      search={{ lead: l.id }}
                      className={`flex flex-col gap-2 rounded-xl border p-4 text-sm transition-colors ${
                        ativo ? "border-navy/40 bg-navy/5" : "border-border bg-card hover:bg-navy/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="tabular-nums text-xs text-navy/70">{horarioCall(l.call_agendada_em)}</span>
                        <Etiqueta texto={ROTULO_ESTADO_CALL[estado]} tom={TOM_ESTADO_CALL[estado]} />
                      </div>
                      <Pessoa nome={l.nome} papel={l.responsavel_nome || "sem responsável"} />
                      <div className="flex flex-wrap items-center gap-2">
                        <Etiqueta texto={l.origem ? rotulo("origem", l.origem) : "Origem não informada"} tom="neutro" />
                      </div>
                      <p className="text-[11px] text-navy/55">
                        {l.via_juridica_preliminar
                          ? `Via preliminar: ${rotulo("via_juridica_preliminar", l.via_juridica_preliminar)}`
                          : "Via preliminar: não registrada"}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </CaCard>

          <CaCard
            titulo="Consentimento & Gravação"
            eyebrow="Mesa de Discovery · Lead selecionado na agenda"
            className="rounded-2xl p-6"
          >
            {!selecionado ? (
              <p className="text-sm text-navy/55">Selecione um lead na agenda do dia.</p>
            ) : (
              <div className="space-y-3">
                <Pessoa nome={selecionado.nome} papel={selecionado.responsavel_nome || "sem responsável"} />
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
                <p className="text-xs text-navy/65">Gravação: {selecionado.gravacao_link_interno || "não registrada"}</p>
                <label className="flex items-center gap-2 text-xs text-navy/65">
                  <input
                    type="checkbox"
                    checked={selecionado.consentimento_gravacao === true}
                    disabled={campoPendente === "consentimento_gravacao"}
                    onChange={(e) => void gravarCampoSpin(selecionado.id!, "consentimento_gravacao", e.target.checked)}
                  />
                  Permissão para gravação em áudio/vídeo (consentimento_gravacao)
                </label>
                {selecionado.consentimento_status !== "concedido" ? (
                  <button
                    type="button"
                    onClick={() => mutarConsentimento.mutate(selecionado.id!)}
                    disabled={mutarConsentimento.isPending}
                    className="rounded-full bg-navy px-4 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-50"
                  >
                    {mutarConsentimento.isPending ? "Registrando…" : "Confirmar consentimento (verbal, nesta call)"}
                  </button>
                ) : null}
                {aviso ? <p className="text-xs text-terracotta">{aviso}</p> : null}
              </div>
            )}
          </CaCard>
        </div>

        {/* Coluna da direita: Mesa Discovery & Roteiro SPIN ativo */}
        <div hidden={momento !== "durante"} id="calls-spin" className="scroll-mt-24 space-y-6">
          <CaCard
            titulo="Roteiro SPIN & Diagnóstico"
            eyebrow="Situação · Problema · Implicação · Necessidade"
            className="rounded-2xl p-6"
          >
            {!selecionado ? (
              <p className="text-sm text-navy/55">Selecione um lead na agenda do dia para ver o roteiro.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {ETAPAS_SPIN.map((e) => {
                  const progresso = progressoSpin(selecionado).find((p) => p.chave === e.chave)!;
                  const campos = camposDaEtapa(e.chave);
                  return (
                    <div key={e.chave} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-serif text-sm text-navy">{e.rotulo}</h4>
                        <Etiqueta
                          texto={`${progresso.preenchidas}/${progresso.total}`}
                          tom={progresso.completo ? "sucesso" : progresso.preenchidas > 0 ? "atencao" : "neutro"}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-navy/55">{e.paraQue}</p>
                      <dl className="mt-3 space-y-2.5">
                        {campos.map((campo) => (
                          <ControleCampoSpin
                            key={`${selecionado.id}-${campo}`}
                            lead={selecionado}
                            campo={campo}
                            onSalvar={(c, v) => void gravarCampoSpin(selecionado.id!, c, v)}
                            pendente={campoPendente === campo}
                            erro={errosCampo[campo]}
                          />
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            )}
            {selecionado ? (
              <div className="mt-4 border-t border-navy/10 pt-4">
                <label className="block text-xs text-navy/50">
                  Anotações da call (resumo_call — detalhe narrativo além dos 29 campos estruturados)
                  <textarea
                    key={`resumo-${selecionado.id}`}
                    className="mt-1 w-full rounded-lg border border-navy/15 bg-card px-2 py-1.5 text-xs text-navy"
                    rows={4}
                    defaultValue={selecionado.resumo_call ?? ""}
                    disabled={campoPendente === "resumo_call"}
                    onBlur={(e) => void gravarCampoSpin(selecionado.id!, "resumo_call", e.target.value.trim() || null)}
                  />
                </label>
                {errosCampo.resumo_call ? <p className="mt-0.5 text-[11px] text-terracotta">{errosCampo.resumo_call}</p> : null}
              </div>
            ) : null}
            {selecionado ? (
              <div data-calls-produto-pai-real className="mt-4 border-t border-navy/10 pt-4">
                <p className="mb-1 text-xs font-medium text-navy/60">
                  Catálogo real ao vivo — para decidir "produtos/serviços recomendados" (edição completa em /leads)
                </p>
                <PlanejadorProdutosPai />
              </div>
            ) : null}
          </CaCard>

          {/*
            26/10/2026 (auditoria): isto é só navegação até #calls-handoff —
            a ação real de handoff, lá dentro de PainelCalls, já passa
            `gateHandoff.motivo` como `pendenciaGate` para AcaoOperacional
            (que libera a proprietária com aviso, nunca bloqueia). Travar o
            link com `pointer-events-none` trancava a própria proprietária
            fora da tela onde ela poderia assumir a pendência.
          */}
          <a
            href="#calls-handoff"
            onClick={() => setMomento("revisao")}
            className={`block rounded-2xl px-5 py-4 text-center text-sm font-semibold transition-colors ${
              gateHandoff.ok ? "bg-navy text-cream hover:bg-navy/90" : "bg-navy/10 text-navy hover:bg-navy/20"
            }`}
          >
            Concluir Discovery e Gerar Proposta
          </a>
          {!gateHandoff.ok ? <p className="text-center text-xs text-navy/55">{gateHandoff.motivo}</p> : null}
        </div>
      </div>

      {momento === "revisao" && selecionado ? <section className="mb-4 border-b border-border pb-4 text-sm text-navy">
        <h2 className="font-serif text-xl">Revisão da conversa</h2>
        <p className="mt-2">Resultado: {rotulo("discovery_resultado", selecionado.discovery_resultado)}</p>
        <p>Resumo: {selecionado.resumo_call || "Não registrado"}</p>
        <p>Próxima ação: {selecionado.proxima_acao ? rotulo("proxima_acao", selecionado.proxima_acao) : "Não registrado"}</p>
        <p>Prazo: {selecionado.proxima_acao_em?.slice(0, 10) || "Não registrado"}</p>
      </section> : null}
      <PainelCalls leadIdInicial={selecionado?.id ?? lead} momento={momento} />
    </SaasShell>
  );
}
