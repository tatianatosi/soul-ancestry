import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, GoLiveShell, Vazio } from "@/components/golive/shell";
import { FaixaFluxo } from "@/components/golive/identidade";
import { Barras, Rosca } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import {
  estadoDaCall,
  funil,
  kanbanPorEtapa,
  kanbanPorPrazo,
  noPeriodo,
  porOrigem,
  porResultadoDiscovery,
  porSituacaoDaCall,
  roteiroDiscovery,
  rotuloDaCall,
  RESULTADOS_DISCOVERY,
  SITUACOES_CALL,
  saudeDosLeads,
  semDataDeEntrada,
  type LeadComercial,
} from "@/lib/golive-comercial";
import { registrarAtendimentoGoLive, registrarLeadGoLive } from "@/lib/golive-escritores.functions";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/comercial")({
  head: () => ({
    meta: [
      { title: "Comercial — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "CRM vivo, Mesa de Discovery e calls do Clube Ancestral em uma leitura só.",
      },
      { property: "og:title", content: "Comercial — Go-live Clube Ancestral" },
      { property: "og:description", content: "Funil, origens, saúde do lead e kanban comercial com dados reais." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComercialGoLive,
});

const PERIODOS: { rotulo: string; dias: number | null }[] = [
  { rotulo: "30 dias", dias: 30 },
  { rotulo: "90 dias", dias: 90 },
  { rotulo: "Tudo", dias: null },
];

/** Listas fechadas do cadastro: sem texto livre em origem e etapa. */
const ORIGENS = ["indicacao", "site", "instagram", "evento", "parceria", "outro"] as const;
const ETAPAS = ["novo", "em_contato", "qualificado", "proposta", "encerrado"] as const;

function ComercialGoLive() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  const novoLead = useServerFn(registrarLeadGoLive);
  const atendimento = useServerFn(registrarAtendimentoGoLive);

  const [periodo, setPeriodo] = useState<number | null>(90);
  const [escolhido, setEscolhido] = useState<string | null>(null);
  const todos = useMemo<LeadComercial[]>(() => (data?.leadsComerciais ?? []) as LeadComercial[], [data]);
  const leads = useMemo(() => noPeriodo(todos, periodo), [todos, periodo]);
  const saude = useMemo(() => saudeDosLeads(leads), [leads]);
  const colunas = useMemo(() => kanbanPorEtapa(leads), [leads]);
  const semData = useMemo(() => semDataDeEntrada(leads), [leads]);
  const total = (data as { leadsComerciaisTotal?: number } | undefined)?.leadsComerciaisTotal ?? todos.length;
  const limite = (data as { leadsComerciaisLimite?: number } | undefined)?.leadsComerciaisLimite ?? 200;

  /* Lead em foco na Mesa e nas calls: o escolhido na lista, senão o do caso,
     senão o mais recente. Nunca inventa lead. */
  const leadEmFoco =
    leads.find((l) => l.id === escolhido) ??
    leads.find((l) => l.id === (caso?.lead?.id ?? "")) ??
    leads[0] ??
    null;
  const leadDoCaso = leadEmFoco?.id ?? null;

  const ctaNovoLead = (
    <Link to="/golive/leads">
      <Button size="sm">Abrir entrada de leads</Button>
    </Link>
  );

  return (
    <GoLiveShell titulo="Comercial" descricao="CRM vivo, Mesa de Discovery e calls.">
      <FaixaFluxo atual="Lead" />

      <Acoes>
        <Acao
          rotulo="Novo lead"
          titulo="Cadastrar lead"
          campos={[
            { nome: "nome", rotulo: "Nome", obrigatorio: true },
            {
              nome: "origem",
              rotulo: "Origem",
              tipo: "escolha",
              obrigatorio: true,
              opcoes: ORIGENS.map((o) => ({ valor: o, rotulo: humano(o) })),
            },
            {
              nome: "etapa",
              rotulo: "Etapa",
              tipo: "escolha",
              obrigatorio: true,
              padrao: "novo",
              opcoes: ETAPAS.map((e) => ({ valor: e, rotulo: humano(e) })),
            },
            { nome: "responsavel", rotulo: "Responsável", obrigatorio: true },
            { nome: "proximoPasso", rotulo: "Próximo passo", obrigatorio: true },
            { nome: "proximoPassoEm", rotulo: "Próximo passo em", tipo: "data" },
            { nome: "email", rotulo: "E-mail" },
            { nome: "telefone", rotulo: "Telefone" },
            { nome: "objetivo", rotulo: "Objetivo", tipo: "area" },
          ]}
          aoConfirmar={(v) =>
            novoLead({
              data: {
                nome: v["nome"] ?? "",
                email: v["email"] ?? "",
                telefone: v["telefone"] ?? "",
                origem: v["origem"] ?? "",
                objetivo: v["objetivo"] ?? "",
                etapa: v["etapa"] ?? "",
                responsavel: v["responsavel"] ?? "",
                proximoPasso: v["proximoPasso"] ?? "",
                proximoPassoEm: v["proximoPassoEm"] ?? "",
              },
            })
          }
          confirmacao="Lead cadastrado. Ele já aparece no funil, no kanban e na Mesa de Discovery."
        />
      </Acoes>

      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-navy/50">Período de entrada</span>
        {PERIODOS.map((p) => (
          <Button
            key={p.rotulo}
            size="sm"
            variant={periodo === p.dias ? "default" : "outline"}
            onClick={() => setPeriodo(p.dias)}
          >
            {p.rotulo}
          </Button>
        ))}
      </div>

      <Bloco titulo="Funil comercial">
        {leads.length ? (
          <Barras titulo="Leads por etapa do funil" dados={funil(leads)} />
        ) : (
          <>
            <Vazio cta={ctaNovoLead} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Canais e origens">
        {leads.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Barras titulo="Por origem" dados={porOrigem(leads, "origem")} />
            <Rosca titulo="Por canal de entrada" dados={porOrigem(leads, "canal")} />
          </div>
        ) : (
          <>
            <Vazio cta={ctaNovoLead} />
            <p className="text-xs text-navy/55">Sem origem registrada no período escolhido.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Saúde do lead">
        {leads.length ? (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Indicador rotulo="Sem próxima ação" valor={saude.semProximaAcao.length} />
              <Indicador rotulo="Sem responsável" valor={saude.semResponsavel.length} />
              <Indicador rotulo="Call vencida" valor={saude.callVencida.length} />
              <Indicador rotulo="Proposta sem follow-up" valor={saude.propostaSemFollowUp.length} />
            </div>
            {saude.propostaSemData.length ? (
              <p className="text-xs text-navy/55">
                {saude.propostaSemData.length} proposta(s) sem data registrada: o follow-up não pode ser medido.
              </p>
            ) : null}
            {semData.length ? (
              <p className="text-xs text-navy/55">
                {semData.length} lead(s) sem data de entrada continuam na lista, fora do recorte por período.
              </p>
            ) : null}
            {total > limite ? (
              <p className="text-xs text-navy/55">
                A organização tem {total} leads ativos; esta leitura traz os {limite} mais recentes.
              </p>
            ) : null}
          </>
        ) : (
          <>
            <Vazio cta={ctaNovoLead} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo="Kanban comercial">
        {colunas.length ? (
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {colunas.map((coluna) => (
              <div key={coluna.etapa} className="w-[280px] shrink-0 snap-start rounded-lg bg-creme/60 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy/60">
                  {humano(coluna.etapa, "Sem etapa")} · {coluna.leads.length}
                </p>
                <div className="space-y-2">
                  {coluna.leads.map((lead) => (
                    <Cartao key={lead.id} lead={lead} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Vazio cta={ctaNovoLead} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>

      <MesaDeDiscovery
        lead={leadEmFoco}
        leads={leads}
        aoEscolher={setEscolhido}
        acao={
          leadDoCaso ? (
            <AcaoAtendimento
              leadId={leadDoCaso}
              aoConfirmar={(v) => atendimento({ data: v as Parameters<typeof atendimento>[0]["data"] })}
            />
          ) : (
            <Pendente destino="/golive/leads" rotulo="Abrir entrada de leads" />
          )
        }
      />

      <Bloco titulo="Calls e Discovery">
        {leads.length ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Barras titulo="Situação das calls" dados={porSituacaoDaCall(leads)} />
            <Rosca titulo="Resultado do Discovery" dados={porResultadoDiscovery(leads)} />
          </div>
        ) : (
          <>
            <Vazio cta={ctaNovoLead} />
            <p className="text-xs text-navy/55">Nenhuma call nesta etapa.</p>
          </>
        )}
        {leads.some((l) => l.callAgendada || l.callRealizada) ? (
          <ul className="space-y-2">
            {leads
              .filter((l) => l.callAgendada || l.callRealizada)
              .map((l) => (
                <li key={l.id} className="rounded-lg bg-creme/60 p-3 text-sm text-navy">
                  <p className="font-medium">{l.nome}</p>
                  <p className="text-xs text-navy/65">
                    Data: {dataHumana(l.callRealizada ?? l.callAgendada, "Sem data registrada")}
                  </p>
                  <p className="text-xs text-navy/65">Situação: {rotuloDaCall(estadoDaCall(l))}</p>
                  <p className="text-xs text-navy/65">
                    Próximo passo: {humano(l.proximoPasso, "Sem próximo passo registrado")}
                  </p>
                </li>
              ))}
          </ul>
        ) : null}
      </Bloco>

      <Bloco titulo="Próximas ações por prazo">
        {leads.length ? (
          <div className="flex snap-x gap-3 overflow-x-auto pb-2">
            {kanbanPorPrazo(leads).map((coluna) => (
              <div key={coluna.chave} className="w-[280px] shrink-0 snap-start rounded-lg bg-creme/60 p-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy/60">
                  {coluna.rotulo} · {coluna.leads.length}
                </p>
                <div className="space-y-2">
                  {coluna.leads.length ? (
                    coluna.leads.map((lead) => <Cartao key={lead.id} lead={lead} />)
                  ) : (
                    <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Vazio cta={ctaNovoLead} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>

    </GoLiveShell>
  );
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="rounded-lg bg-creme/60 p-3">
      <p className="text-2xl font-semibold text-navy">{valor}</p>
      <p className="text-xs text-navy/60">{rotulo}</p>
    </div>
  );
}

function Cartao({ lead }: { lead: LeadComercial }) {
  return (
    <article className="rounded-lg border border-navy/10 bg-white p-3">
      <p className="truncate text-sm font-medium text-navy">{lead.nome}</p>
      <dl className="mt-1 space-y-0.5 text-xs text-navy/65">
        <div>Origem: {humano(lead.origem, "Sem origem registrada")}</div>
        <div>Etapa: {humano(lead.etapa, "Sem etapa")}</div>
        <div>Responsável: {lead.responsavel ?? "Sem responsável"}</div>
        <div>Último toque: {dataHumana(lead.ultimoToque, "Sem toque registrado")}</div>
        <div>Próximo passo: {humano(lead.proximoPasso, "Sem próximo passo")}</div>
      </dl>
    </article>
  );
}

/** Mesa de Discovery: uma pergunta por vez, com fonte e estado de cada resposta. */
function MesaDeDiscovery({
  lead,
  leads,
  aoEscolher,
  acao,
}: {
  lead: LeadComercial | null;
  leads: LeadComercial[];
  aoEscolher: (id: string) => void;
  acao: React.ReactNode;
}) {
  const [indice, setIndice] = useState(0);
  const passos = roteiroDiscovery(lead);
  const atual = passos[Math.min(indice, passos.length - 1)]!;
  const respondidas = passos.filter((p) => p.estado === "respondida").length;

  return (
    <Bloco titulo="Mesa de Discovery">
      {lead ? (
        <>
          <label className="block text-xs text-navy/60">
            Lead em atendimento
            <select
              className="mt-1 w-full max-w-full rounded-md border border-border bg-background px-2 py-1 text-sm text-navy"
              value={lead.id}
              onChange={(e) => aoEscolher(e.target.value)}
            >
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs uppercase tracking-wide text-navy/50">
            Pergunta {indice + 1} de {passos.length} · {respondidas} respondida(s) · {lead.nome}
          </p>
          <p className="text-base font-medium text-navy">{atual.pergunta}</p>
          <p className="text-sm text-navy/80">
            {atual.resposta ? humano(atual.resposta) : "Sem resposta registrada"}
          </p>
          <dl className="grid grid-cols-1 gap-2 text-xs text-navy/60 sm:grid-cols-2">
            <div>Fonte: {atual.fonte}</div>
            <div>Estado: {atual.estado === "respondida" ? "Respondida" : "Pendente"}</div>
          </dl>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={indice === 0} onClick={() => setIndice((i) => i - 1)}>
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={indice >= passos.length - 1}
              onClick={() => setIndice((i) => i + 1)}
            >
              Próxima
            </Button>
          </div>
          {acao}
        </>
      ) : (
        <>
          <Vazio
            cta={
              <Link to="/golive/leads">
                <Button size="sm">Abrir entrada de leads</Button>
              </Link>
            }
          />
          <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
        </>
      )}
    </Bloco>
  );
}

/** Formulário único de atendimento: Discovery e call gravados de uma vez só. */
export function AcaoAtendimento({
  leadId,
  aoConfirmar,
}: {
  leadId: string;
  aoConfirmar: (v: Record<string, string>) => Promise<unknown>;
}) {
  return (
    <Acoes>
      <Acao
        rotulo="Registrar atendimento"
        titulo="Discovery e call do lead"
        variante="outline"
        campos={[
          {
            nome: "situacaoCall",
            rotulo: "Situação da call",
            tipo: "escolha",
            obrigatorio: true,
            opcoes: SITUACOES_CALL.map((s) => ({ valor: s.valor, rotulo: s.rotulo })),
          },
          { nome: "callEm", rotulo: "Data da call", tipo: "data" },
          {
            nome: "resultado",
            rotulo: "Resultado do Discovery",
            tipo: "escolha",
            opcoes: RESULTADOS_DISCOVERY.map((r) => ({ valor: r.valor, rotulo: r.rotulo })),
            ajuda: "Sem resultado escolhido, a etapa do lead não muda.",
          },
          { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
          { nome: "proximoPasso", rotulo: "Próxima ação", obrigatorio: true },
          { nome: "proximoPassoEm", rotulo: "Próxima ação em", tipo: "data" },
          { nome: "responsavel", rotulo: "Responsável" },
        ]}
        aoConfirmar={(v) =>
          aoConfirmar({
            leadId,
            situacaoCall: v["situacaoCall"] ?? "",
            callEm: v["callEm"] ?? "",
            resultado: v["resultado"] ?? "",
            resumo: v["resumo"] ?? "",
            proximoPasso: v["proximoPasso"] ?? "",
            proximoPassoEm: v["proximoPassoEm"] ?? "",
            responsavel: v["responsavel"] ?? "",
          })
        }
        confirmacao="Atendimento registrado. O lead já aparece atualizado no funil e no kanban."
      />
    </Acoes>
  );
}


/** CTA sem escritor ligado: navega para a ação existente e diz que a conexão está pendente. */
function Pendente({ destino, rotulo }: { destino: string; rotulo: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link to={destino}>
        <Button size="sm" variant="outline">
          {rotulo}
        </Button>
      </Link>
      <span className="text-xs text-navy/55">Registro direto por aqui ainda não está conectado.</span>
    </div>
  );
}
