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
  colunaDoLead,
  funil,
  kanbanPorEtapa,
  noPeriodo,
  porOrigem,
  saudeDosLeads,
  type LeadComercial,
} from "@/lib/golive-comercial";
import { registrarCallGoLive, registrarDiscoveryGoLive, registrarLeadGoLive } from "@/lib/golive-escritores.functions";
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
  const discovery = useServerFn(registrarDiscoveryGoLive);
  const call = useServerFn(registrarCallGoLive);
  const leadDoCaso = caso?.lead?.id ?? null;

  const [periodo, setPeriodo] = useState<number | null>(90);
  const todos = useMemo<LeadComercial[]>(() => (data?.leadsComerciais ?? []) as LeadComercial[], [data]);
  const leads = useMemo(() => noPeriodo(todos, periodo), [todos, periodo]);
  const saude = useMemo(() => saudeDosLeads(leads), [leads]);
  const colunas = useMemo(() => kanbanPorEtapa(leads), [leads]);

  const ctaNovoLead = (
    <Link to="/leads">
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
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Indicador rotulo="Sem próxima ação" valor={saude.semProximaAcao.length} />
            <Indicador rotulo="Sem responsável" valor={saude.semResponsavel.length} />
            <Indicador rotulo="Call vencida" valor={saude.callVencida.length} />
            <Indicador rotulo="Proposta sem follow-up" valor={saude.propostaSemFollowUp.length} />
          </div>
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
        lead={leads.find((l) => l.id === leadDoCaso) ?? leads[0] ?? null}
        acao={
          leadDoCaso ? (
            <Acoes>
              <Acao
                rotulo="Registrar Discovery"
                titulo="Resultado da Mesa de Discovery"
                variante="outline"
                campos={[
                  {
                    nome: "resultado",
                    rotulo: "Resultado",
                    tipo: "escolha",
                    obrigatorio: true,
                    opcoes: [
                      { valor: "segue_para_proposta", rotulo: "Segue para proposta" },
                      { valor: "em_avaliacao", rotulo: "Em avaliação" },
                      { valor: "nao_elegivel", rotulo: "Não elegível" },
                    ],
                  },
                  { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
                ]}
                aoConfirmar={(v) =>
                  discovery({
                    data: { leadId: leadDoCaso, resultado: v["resultado"] ?? "", resumo: v["resumo"] ?? "" },
                  })
                }
                confirmacao="Discovery registrado."
              />
            </Acoes>
          ) : (
            <Pendente destino="/leads" rotulo="Abrir entrada de leads" />
          )
        }
      />

      <Bloco titulo="Calls">
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
                  <p className="text-xs text-navy/65">
                    Resultado: {humano(l.statusCall ?? l.discoveryResultado, "Sem resultado registrado")}
                  </p>
                  <p className="text-xs text-navy/65">
                    Próximo passo: {humano(l.proximoPasso, "Sem próximo passo registrado")}
                  </p>
                </li>
              ))}
          </ul>
        ) : (
          <>
            <Vazio cta={ctaNovoLead} />
            <p className="text-xs text-navy/55">Nenhuma call nesta etapa.</p>
          </>
        )}
        {leadDoCaso ? (
          <Acoes>
            <Acao
              rotulo="Registrar call"
              titulo="Call com a pessoa"
              variante="outline"
              campos={[
                { nome: "ocorridoEm", rotulo: "Data", tipo: "data" },
                { nome: "resumo", rotulo: "Resumo interno", tipo: "area", obrigatorio: true },
              ]}
              aoConfirmar={(v) =>
                call({ data: { leadId: leadDoCaso, resumo: v["resumo"] ?? "", ocorridoEm: v["ocorridoEm"] ?? "" } })
              }
              confirmacao="Call registrada."
            />
          </Acoes>
        ) : (
          <Pendente destino="/leads" rotulo="Abrir entrada de leads" />
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

/** Mesa de Discovery: uma pergunta por vez, com origem, destino, contexto e consentimento. */
function MesaDeDiscovery({ lead, acao }: { lead: LeadComercial | null; acao: React.ReactNode }) {
  const [indice, setIndice] = useState(0);

  const perguntas = [
    {
      pergunta: "Qual é o objetivo da família?",
      resposta: lead?.objetivo ?? null,
      origem: "Entrada do lead",
      destino: "Objetivo do caso",
      contexto: "Define o que a pesquisa precisa provar.",
    },
    {
      pergunta: "Por onde essa pessoa chegou?",
      resposta: lead?.origem ?? null,
      origem: "Origem registrada no lead",
      destino: "Leitura de canais e origens",
      contexto: "Sustenta a leitura de aquisição, sem estimativa.",
    },
    {
      pergunta: "A call já aconteceu?",
      resposta: lead?.callRealizada ? dataHumana(lead.callRealizada) : null,
      origem: "Registro de call",
      destino: "Etapa do funil",
      contexto: "A call é o que move o lead de Discovery para Proposta.",
    },
    {
      pergunta: "Qual foi o resultado do Discovery?",
      resposta: lead?.discoveryResultado ? humano(lead.discoveryResultado) : null,
      origem: "Mesa de Discovery",
      destino: "Decisão de proposta",
      contexto: "Resultado é registro humano, nunca inferência.",
    },
    {
      pergunta: "Em que etapa o lead está agora?",
      resposta: lead ? colunaDoLead(lead) : null,
      origem: "Marcos já gravados do lead",
      destino: "Funil e kanban",
      contexto: "Derivado dos marcos, não digitado à parte.",
    },
  ];

  const atual = perguntas[Math.min(indice, perguntas.length - 1)]!;

  return (
    <Bloco titulo="Mesa de Discovery">
      {lead ? (
        <>
          <p className="text-xs uppercase tracking-wide text-navy/50">
            Pergunta {indice + 1} de {perguntas.length} · {lead.nome}
          </p>
          <p className="text-base font-medium text-navy">{atual.pergunta}</p>
          <p className="text-sm text-navy/80">{atual.resposta ?? "Sem resposta registrada"}</p>
          <dl className="grid grid-cols-1 gap-2 text-xs text-navy/60 sm:grid-cols-3">
            <div>Origem: {atual.origem}</div>
            <div>Destino: {atual.destino}</div>
            <div>Contexto: {atual.contexto}</div>
          </dl>
          <p className="text-xs text-navy/60">
            Consentimento: {humano(lead.consentimento, "Não solicitado")}
            {lead.consentimentoCanal ? ` · ${humano(lead.consentimentoCanal)}` : ""}
            {lead.consentimentoEm ? ` · ${dataHumana(lead.consentimentoEm)}` : ""}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={indice === 0} onClick={() => setIndice((i) => i - 1)}>
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={indice >= perguntas.length - 1}
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
              <Link to="/leads">
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
