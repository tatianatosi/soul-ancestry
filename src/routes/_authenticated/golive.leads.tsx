/**
 * Leads do go-live: uma leitura por lead, com o gráfico de etapas do fluxo
 * já mapeado (Lead -> Discovery -> Call -> Proposta -> Handoff).
 *
 * Discovery e Call gravam de verdade, nos escritores que já existem.
 * Proposta navega para a ação dona; Handoff é etapa informativa até o motor
 * de vínculo estar ligado. Nenhuma tabela nova, nenhum lead de exemplo.
 */
import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Bloco, FaixaKpis, GoLiveShell, Vazio } from "@/components/golive/shell";
import { Escada } from "@/components/golive/graficos";
import { Acao, Acoes } from "@/components/golive/acoes";
import { useGoLive } from "@/components/golive/dados";
import { dataHumana, humano } from "@/lib/rotulos-golive";
import { AcaoAgenda, AcaoAtendimento } from "@/components/golive/atendimento";
import {
  COLUNAS_FUNIL,
  agendaDoLead,
  colunaDoLead,
  progressoRoteiro,
  roteiroDiscovery,
  type LeadComercial,
} from "@/lib/golive-comercial";
import {
  arquivarLeadGoLive,
  registrarAtendimentoGoLive,
  registrarLeadGoLive,
} from "@/lib/golive-escritores.functions";


import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/golive/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Go-live Clube Ancestral" },
      {
        name: "description",
        content: "Leads por etapa do fluxo, com registro de Discovery e de call sobre os dados reais.",
      },
      { property: "og:title", content: "Leads — Go-live Clube Ancestral" },
      { property: "og:description", content: "Etapas do lead até o handoff, com ações que gravam de verdade." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeadsGoLive,
});

/** Listas fechadas: origem e etapa nunca entram como texto livre. */
const ORIGENS = ["indicacao", "site", "instagram", "evento", "parceria", "outro"] as const;
const AREAS = ["comercial", "operacoes", "pesquisa"] as const;
const ETAPAS = ["novo", "em_contato", "qualificado", "proposta", "encerrado"] as const;

function LeadsGoLive() {
  const { data, isPending, error } = useGoLive();
  const novoLead = useServerFn(registrarLeadGoLive);
  const atendimento = useServerFn(registrarAtendimentoGoLive);
  const arquivarLead = useServerFn(arquivarLeadGoLive);

  const [escolhido, setEscolhido] = useState<string | null>(null);

  const leads = useMemo<LeadComercial[]>(() => (data?.leadsComerciais ?? []) as LeadComercial[], [data]);
  const emFoco = leads.find((l) => l.id === escolhido) ?? leads[0] ?? null;
  const etapaAtual = emFoco ? colunaDoLead(emFoco) : null;
  const progresso = useMemo(() => progressoRoteiro(emFoco), [emFoco]);
  const agenda = useMemo(() => agendaDoLead(emFoco), [emFoco]);
  const semProximoPasso = leads.filter((lead) => !lead.proximoPasso).length;
  const semResponsavel = leads.filter((lead) => !lead.responsavel).length;
  const callsVencidas = leads.filter((lead) => agendaDoLead(lead)?.vencida).length;

  const ctaCadastro = (
    <Link to="/golive/comercial">
      <Button size="sm" variant="outline">
        Ver painel comercial
      </Button>
    </Link>
  );

  return (
    <GoLiveShell titulo="Leads" descricao="Do primeiro contato ao handoff, com as ações que já gravam.">
      <FaixaKpis itens={[
        { rotulo: "Leads registrados", valor: leads.length, tom: leads.length ? "azul" : "cinza", fonte: "Leads ativos da organização", formula: "Contagem dos leads retornados", periodo: "Carteira atual" },
        { rotulo: "Sem próximo passo", valor: semProximoPasso, tom: semProximoPasso ? "terracota" : "cinza", fonte: "Próximo passo do lead", formula: "Leads sem próximo passo registrado", periodo: "Carteira atual" },
        { rotulo: "Calls vencidas", valor: callsVencidas, tom: callsVencidas ? "terracota" : "cinza", fonte: "Agenda do lead", formula: "Calls cujo horário registrado já passou", periodo: "Até agora" },
        { rotulo: "Sem responsável", valor: semResponsavel, tom: semResponsavel ? "dourado" : "cinza", fonte: "Responsável do lead", formula: "Leads sem responsável registrado", periodo: "Carteira atual" },
      ]} />
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
            {
              nome: "area",
              rotulo: "Área responsável",
              tipo: "escolha",
              obrigatorio: true,
              opcoes: AREAS.map((a) => ({ valor: a, rotulo: humano(a) })),
            },
            { nome: "responsavel", rotulo: "Responsável", obrigatorio: true },
            { nome: "proximoPasso", rotulo: "Próximo passo", obrigatorio: true },
            { nome: "proximoPassoEm", rotulo: "Próximo passo em", tipo: "data", obrigatorio: true },
            { nome: "email", rotulo: "E-mail", tipo: "email" },
            { nome: "telefone", rotulo: "Telefone", tipo: "telefone" },
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
                area: v["area"] ?? "",
                responsavel: v["responsavel"] ?? "",
                proximoPasso: v["proximoPasso"] ?? "",
                proximoPassoEm: v["proximoPassoEm"] ?? "",
              },
            })
          }
          confirmacao="Lead cadastrado. Ele já aparece aqui, no funil e no kanban do Comercial."
        />
      </Acoes>

      {isPending ? <p className="text-sm text-navy/60">Carregando…</p> : null}
      {error ? <p className="text-sm text-[var(--terracota,#9A3A2F)]">Não foi possível carregar agora.</p> : null}

      <Bloco titulo="Leads registrados">
        {leads.length ? (
          <ul className="space-y-2">
            {leads.map((lead) => {
              const ativo = lead.id === emFoco?.id;
              return (
                <li key={lead.id}>
                  <button
                    type="button"
                    onClick={() => setEscolhido(lead.id)}
                    className={`w-full rounded-lg p-3 text-left text-sm text-navy ${
                      ativo ? "bg-gold/20" : "bg-creme/60 hover:bg-navy/5"
                    }`}
                  >
                    <span className="block font-medium">{lead.nome}</span>
                    <span className="block text-xs text-navy/65">
                      Etapa: {colunaDoLead(lead)} · Origem: {humano(lead.origem, "não registrada")}
                    </span>
                    <span className="block text-xs text-navy/65">
                      Responsável: {humano(lead.responsavel, "sem responsável")} · Próximo passo:{" "}
                      {humano(lead.proximoPasso, "não registrado")}
                    </span>
                    <span className="block text-xs text-navy/55">
                      Último toque: {dataHumana(lead.ultimoToque ?? lead.callRealizada, "sem registro")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <>
            <Vazio cta={ctaCadastro} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>

      <Bloco titulo={emFoco ? `Etapas de ${emFoco.nome}` : "Etapas do lead"}>
        {emFoco ? (
          <>
            <Escada
              etapas={COLUNAS_FUNIL.map((coluna, i) => ({
                rotulo: coluna,
                feito: i <= COLUNAS_FUNIL.indexOf(etapaAtual ?? "Lead"),
              }))}
            />
            <div className="flex flex-wrap gap-2">
              <AcaoAtendimento
                leadId={emFoco.id}
                aoConfirmar={(v) => atendimento({ data: v as Parameters<typeof atendimento>[0]["data"] })}
              />
              <AcaoAgenda
                leadId={emFoco.id}
                aoConfirmar={(v) => atendimento({ data: v as Parameters<typeof atendimento>[0]["data"] })}
              />
              <Acao
                rotulo="Arquivar lead"
                titulo={`Arquivar ${emFoco.nome}`}
                campos={[{ nome: "motivo", rotulo: "Motivo do arquivamento", tipo: "area", obrigatorio: true }]}
                aoConfirmar={(v) => arquivarLead({ data: { leadId: emFoco.id, motivo: v["motivo"] ?? "" } })}
                confirmacao="Lead arquivado. Sai das listas de trabalho e continua no histórico."
              />
            </div>

            {agenda ? (
              <div className="rounded-lg bg-creme/60 p-3 text-xs text-navy/70">
                <span className="block font-medium text-navy">Agenda</span>
                <span className="block">
                  Call: {agenda.rotulo} · {dataHumana(agenda.quando, "sem data registrada")}
                  {agenda.vencida ? " · horário já passou" : ""}
                </span>
                <span className="block">
                  Próxima ação: {humano(agenda.proximaAcao, "não registrada")} ·{" "}
                  {dataHumana(agenda.proximaAcaoEm, "sem prazo")}
                </span>
              </div>
            ) : null}

            <div className="space-y-1 pt-1 text-xs text-navy/65">
              <p className="font-medium text-navy">
                Roteiro do Discovery: {progresso.respondidas} de {progresso.total} respondidas (
                {progresso.percentual}%)
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/10">
                <div className="h-full rounded-full bg-gold" style={{ width: `${progresso.percentual}%` }} />
              </div>
              <p>
                {progresso.proxima
                  ? `Próxima pergunta: ${progresso.proxima.pergunta}`
                  : "Roteiro completo com o que está gravado no lead."}
              </p>
              <ul className="space-y-1">
                {roteiroDiscovery(emFoco).map((passo) => (
                  <li
                    key={passo.pergunta}
                    className={passo.pergunta === progresso.proxima?.pergunta ? "font-medium text-navy" : ""}
                  >
                    {passo.estado === "respondida" ? "✓" : "•"} {passo.pergunta}{" "}
                    <span className="text-navy/50">
                      — {passo.resposta ? humano(passo.resposta) : "pendente"} · fonte: {passo.fonte}
                    </span>
                  </li>
                ))}
              </ul>
            </div>


            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/golive/formalizacao">
                <Button size="sm" variant="outline">
                  Proposta
                </Button>
              </Link>
              <Button size="sm" variant="outline" disabled className="h-auto whitespace-normal py-1.5 text-left">
                Handoff para o caso — aguardando vínculo da equipe
              </Button>
            </div>
            <p className="text-xs text-navy/55">
              O handoff só vira ação quando o vínculo com o caso for liberado. Até lá, ele aparece como etapa.
            </p>
          </>
        ) : (
          <>
            <Vazio cta={ctaCadastro} />
            <p className="text-xs text-navy/55">Nenhum lead nesta etapa.</p>
          </>
        )}
      </Bloco>
    </GoLiveShell>
  );
}
