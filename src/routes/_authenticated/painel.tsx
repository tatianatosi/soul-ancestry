import { createFileRoute, Link } from "@tanstack/react-router";

import { HojeConectado } from "@/components/desk/superficies-kit-conectadas";
import { useGoLive } from "@/components/golive/dados";
import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { Button } from "@/components/ui/button";
import { CaCard } from "@/components/ui/ca-card";
import { totaisFinanceiros } from "@/lib/golive-analitico";
import { filaDeAprovacoes, resumoAprovacoes, type ItemAprovacao } from "@/lib/golive-aprovacoes";
import { kanbanPorEtapa, saudeDosLeads, type LeadComercial } from "@/lib/golive-comercial";
import { riscosEPrazos } from "@/lib/golive-juridico";
import { concluida } from "@/lib/golive-microentregas";
import {
  faixaDePrazo,
  kpisHoje,
  kpisPrazo,
  prioridadeDaCarteira,
  ritmoSemanal,
  temRitmo,
  type AcaoOperacional,
} from "@/lib/golive-operacao";
import { acessoAoPortal, publicacaoPorEstado } from "@/lib/golive-portal";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Clube Ancestral" },
      { name: "description", content: "Fila priorizada do dia (Painel Hoje), exceções sem dono, comercial e casos com prazo." },
      { property: "og:title", content: "Visão Geral — Clube Ancestral" },
      { property: "og:description", content: "O que precisa de ação hoje, por quem e até quando." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  return (
    <SaasShell
      titulo="Visão Geral"
      descricao="O que está parado, vencido ou pede decisão — com ação e link para a aba dona."
      visualKit="pantone"
    >
      <HojeConectado />
      <PainelConsolidado />
    </SaasShell>
  );
}

const MOEDA = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/**
 * O que cada linha pede da equipe — nome do que a ação faz de fato, não do
 * exemplo do De-Para que ela lembra.
 *
 * §11 linha 3 exemplifica quatro decisões. Duas têm correspondência exata na
 * fila: "Aprovar escopo" é `aprovar_escopo`; "Rever proposta" é a proposta
 * ainda não aprovada, que aparece aqui como escopo pendente. As outras duas
 * NÃO estão nesta fila, e não vou renomear ação alheia para fingir que estão:
 *
 *  - "Liberar pesquisa" é liberação externa (`registrarLiberacaoExterna`, em
 *    `pesquisa/modulo.tsx`), não a aprovação interna do achado. Aprovar um
 *    achado é decisão de pesquisa; liberar é decisão de publicação.
 *  - "Confirmar documento mínimo" é `confirmarDocumentosMinimos`
 *    (`crm_casos.documentos_minimos_ok`, o gate que o portal consulta), e a
 *    fila de aprovações não a enxerga.
 *
 * Dívida declarada: as duas ficam de fora da contagem até entrarem na fila
 * pela função pura, e não por um número somado à mão na tela.
 */
/**
 * Etapas comerciais gravadas em `leads.etapa`, com o nome que a prancha usa
 * (§11 linha 8: "Novos leads, Discovery, Diagnóstico, Cliente"). Etapa fora
 * desta tabela aparece com o valor cru — esconder seria perder o dado.
 */
const ROTULO_ETAPA: Record<string, string> = {
  novo: "Novos leads",
  novo_lead: "Novos leads",
  discovery: "Discovery",
  diagnostico: "Diagnóstico",
  proposta: "Proposta",
  cliente: "Cliente",
  sem_etapa: "Sem etapa registrada",
};

const ROTULO_DECISAO: Record<ItemAprovacao["acao"], string> = {
  aprovar_achado: "Aprovar achado",
  aprovar_escopo: "Aprovar escopo",
  enviar_revisao: "Enviar contrato para revisão",
  registrar_assinatura: "Registrar assinatura",
  publicar: "Publicar no App",
  nenhuma: "Completar dado antes de decidir",
};

type Indicador = { rotulo: string; valor: string | number };
type Secao = { titulo: string; escopo: string; to: string; indicadores: Indicador[] };

function PainelConsolidado() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  if (isPending) return <p className="mt-8 text-sm text-navy/60">Carregando indicadores consolidados…</p>;
  if (error) return <p className="mt-8 text-sm text-terracotta">Não foi possível carregar os indicadores consolidados.</p>;
  if (!caso) return <EstadoVazio mensagem="Sem registros para consolidar — nenhuma organização com dados suficientes foi encontrada." />;

  const hoje = kpisHoje(caso.carteira, caso.tarefas);
  /*
    Mesma conta que /golive/microentregas publica como "Aguardando revisão",
    com fonte e fórmula declaradas lá ("Itens ainda não concluídos"). Reusa
    `concluida` do módulo canônico em vez de reimplementar o critério — se a
    regra mudar, os dois números mudam juntos.
  */
  const microentregasAguardandoRevisao = caso.microentregas.filter((m) => !concluida(m)).length;
  /*
    "Decisões do dia" (§11 linha 2) tem fonte: é a mesma fila que
    /golive/aprovacoes publica, pela mesma função pura e sobre os mesmos
    campos do caso. §11 exige contagem "reconciliada com as listas abaixo" —
    e o card "Decisões prioritárias" (§11 linha 3) logo abaixo lista
    exatamente os itens que compõem este número. Reconciliado por construção,
    não por coincidência: se um deles mudar, os dois mudam.
  */
  const filaDecisoes = filaDeAprovacoes({
    achados: caso.achados,
    propostas: caso.propostas,
    contratos: caso.contratos,
    projecoes: caso.projecoesEstados,
  });
  const decisoesPendentes = filaDecisoes.filter((i) => i.situacao === "pendente");
  const decisoesDoDia = resumoAprovacoes(filaDecisoes).pendentes;
  /*
    §11 linhas 8, 10 e 11. As três contas já existiam como função pura em
    `golive-operacao`/`golive-comercial`, consumidas pelas telas de /golive —
    o que faltava era o Hoje chamar as mesmas, em vez de somar por conta
    própria. §11 linha 11 exige que os valores "batam com a fonte de
    tarefas/casos": `prioridadeDaCarteira` usa exatamente a carteira ativa
    dos KPIs acima, e caso encerrado não entra.

    O ritmo vem em 6 semanas, como a prancha pede (a função aceita 7 por
    padrão), e só aparece quando há microentrega concluída com data — sem
    isso a linha seria uma régua de zeros fingindo série histórica.
  */
  const ritmo = temRitmo(caso.microentregas) ? ritmoSemanal(caso.microentregas, 6) : [];
  const prioridades = prioridadeDaCarteira(caso.carteira);
  const leads = caso.leadsComerciais as LeadComercial[];
  const saude = saudeDosLeads(leads);
  // §11 linha 8 — funil por etapa comercial gravada. Sem período definido no
  // dado: a prancha pede "30 dias quando houver período definido", e não há.
  const funilLeads = kanbanPorEtapa(leads)
    .map((g) => ({ etapa: g.etapa, total: g.leads.length }))
    .sort((a, b) => b.total - a.total);
  const itensKanban: AcaoOperacional[] = [
    ...caso.tarefas,
    ...caso.microentregas.map((m) => ({
      id: m.id,
      titulo: m.titulo,
      status: m.status,
      prazo: m.prazo,
      bloqueio: false,
      concluidaEm: m.concluidaEm,
      responsavel: m.responsavel,
    })),
  ];
  const kanban = kpisPrazo(itensKanban);
  const perguntas = [caso.pesquisa?.objetivo, ...caso.hipoteses.map((h) => h.titulo)].filter(Boolean).length;
  const evidenciasRevisao = caso.evidencias.filter((e) => /revis/i.test(e.status ?? "")).length;
  const achadosAprovados = caso.achados.filter((a) => /validado|aprovad/i.test(a.validacao ?? "")).length;
  const financeiro = totaisFinanceiros(caso.faturas, caso.pagamentos);
  const instrumentos = {
    propostas: caso.propostas,
    escopo: caso.escopo,
    contratos: caso.contratos,
    anexos: caso.anexos,
    ordens: caso.ordensServico,
  };
  const riscos = riscosEPrazos(instrumentos);
  const emRevisao = caso.contratos.filter((c) => /review|revis|pending/i.test(c.status ?? "")).length;
  const assinados = caso.contratos.filter((c) => Boolean(c.assinadoEm) || /signed|assinad/i.test(c.status ?? "")).length;
  const publicacao = publicacaoPorEstado(caso.projecoesEstados);
  const acesso = acessoAoPortal(caso.portal.acessos, caso.portal.emailsAutorizados);
  const valorPublicacao = (rotulo: string) => publicacao.find((i) => i.rotulo === rotulo)?.valor ?? 0;

  const secoes: Secao[] = [
    { titulo: "Hoje", escopo: "Organização e caso em foco", to: "/golive", indicadores: [
      { rotulo: "Ativos", valor: hoje.ativos }, { rotulo: "Vencidas", valor: hoje.vencidas },
      { rotulo: "Sem próxima ação", valor: hoje.semProxima }, { rotulo: "Aguardando externo", valor: hoje.externo },
    ] },
    { titulo: "Comercial", escopo: "Organização", to: "/golive/comercial", indicadores: [
      { rotulo: "Leads ativos", valor: leads.length }, { rotulo: "Sem próxima ação", valor: saude.semProximaAcao.length },
      { rotulo: "Calls vencidas", valor: saude.callVencida.length }, { rotulo: "Propostas sem follow-up", valor: saude.propostaSemFollowUp.length },
    ] },
    { titulo: "Kanban", escopo: "Caso em foco", to: "/golive/kanban", indicadores: [
      { rotulo: "Vencidas", valor: kanban.vencida }, { rotulo: "Hoje", valor: kanban.hoje },
      { rotulo: "Próximos sete dias", valor: kanban.proximos7 }, { rotulo: "Aguardando externo", valor: kanban.externo },
    ] },
    { titulo: "Pesquisa", escopo: "Caso em foco", to: "/golive/pesquisa", indicadores: [
      { rotulo: "Perguntas abertas", valor: perguntas }, { rotulo: "Fontes", valor: caso.fontes.length },
      { rotulo: "Evidências em revisão", valor: evidenciasRevisao }, { rotulo: "Achados aprovados", valor: achadosAprovados },
    ] },
    { titulo: "Financeiro", escopo: "Caso em foco", to: "/golive/financeiro", indicadores: [
      { rotulo: "Contratado", valor: MOEDA.format(financeiro.contratado) }, { rotulo: "Recebido confirmado", valor: MOEDA.format(financeiro.pago) },
      { rotulo: "Em aberto", valor: MOEDA.format(financeiro.emAberto) }, { rotulo: "Vencido", valor: MOEDA.format(financeiro.vencido) },
    ] },
    { titulo: "Jurídico", escopo: "Caso em foco", to: "/golive/juridico", indicadores: [
      { rotulo: "Em revisão", valor: emRevisao }, { rotulo: "Pendências formais", valor: riscos.find((r) => r.rotulo === "Revisão pendente")?.valor ?? 0 },
      { rotulo: "Assinados", valor: assinados }, { rotulo: "Anexos pendentes", valor: riscos.find((r) => r.rotulo === "Anexo pendente")?.valor ?? 0 },
    ] },
    { titulo: "Portal", escopo: "Caso em foco", to: "/golive/portal", indicadores: [
      { rotulo: "Rascunhos", valor: valorPublicacao("Rascunho") }, { rotulo: "Em revisão", valor: valorPublicacao("Em revisão") },
      { rotulo: "Publicados", valor: valorPublicacao("Publicada") }, { rotulo: "Acessos ativos", valor: acesso.ativos },
    ] },
  ];

  return (
    <section className="mt-10 border-t border-navy/15 pt-7" aria-labelledby="painel-consolidado-titulo">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">Painel consolidado</p>
        <h2 id="painel-consolidado-titulo" className="mt-1 font-serif text-2xl text-navy">Indicadores por frente</h2>
      </div>

      {/*
        Faixa de 4 indicadores do Hoje (§11 do De-Para).

        §11 e §26 exigem contagem CLICÁVEL, que abra a lista de origem e
        reconcilie com ela. Cada número aqui abre a tela onde a mesma conta
        é feita, da mesma fonte — não uma lista parecida.

        21/09/2026: "Decisões do dia" deixou de ser "Não registrado". A regra
        existe e já estava no repositório — `filaDeAprovacoes` classifica
        achado, proposta e contrato em pendente/pronto, e "Aprovar escopo",
        um dos quatro exemplos da linha 3 do De-Para, é literalmente uma das
        suas ações. O que faltava era a Visão Geral usar a mesma função da
        tela que já a usava, em vez de um número próprio.
      */}
      <dl className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-hoje-indicadores>
        {[
          {
            rotulo: "Decisões do dia",
            valor: decisoesDoDia,
            apoio: "aguardam decisão da equipe",
            to: "/golive/aprovacoes",
          },
          { rotulo: "Cadências vencidas", valor: hoje.vencidas, apoio: "pedem retomada", to: "/golive" },
          { rotulo: "Casos sem próxima ação", valor: hoje.semProxima, apoio: "precisam de decisão", to: "/golive" },
          {
            rotulo: "Microentregas para revisão",
            valor: microentregasAguardandoRevisao,
            apoio: "aguardando revisão humana",
            to: "/golive/microentregas",
          },
        ].map((k) => {
          const conteudo = (
            <>
              {/* Os quatro têm número agora; o ramo de ausência saiu junto
                  com o último "Não registrado". */}
              <dd className="font-serif text-2xl text-navy">{k.valor}</dd>
              <dt className="mt-0.5 text-xs text-navy/70">{k.rotulo}</dt>
              <p className="text-[11px] text-navy/45">{k.apoio}</p>
            </>
          );
          const classe = "block rounded-xl border border-navy/15 bg-cream/40 px-4 py-3 text-left";
          return k.to ? (
            <Link key={k.rotulo} to={k.to} className={`${classe} hover:border-gold`}>
              {conteudo}
            </Link>
          ) : (
            <div key={k.rotulo} className={classe}>
              {conteudo}
            </div>
          );
        })}
      </dl>

      {/*
        §11 linha 3 — "Decisões prioritárias". Cada linha precisa abrir
        contexto e ação possível, então mostra o que está pendente, por quê, e
        leva à tela onde a decisão é tomada. A lista é o mesmo array que gera
        o número de "Decisões do dia" acima: nenhum dos dois pode divergir do
        outro sem divergir de si mesmo.
      */}
      <div className="mb-6">
        <CaCard
          titulo="Decisões prioritárias"
          eyebrow={`Fonte: fila de aprovações · ${decisoesDoDia} pendente(s)`}
          acao={
            <Button asChild size="sm" variant="outline">
              <Link to="/golive/aprovacoes">Abrir</Link>
            </Button>
          }
        >
          {decisoesPendentes.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma decisão pendente de achado, proposta ou contrato neste caso." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {decisoesPendentes.slice(0, 6).map((item: ItemAprovacao) => (
                <li key={`${item.grupo}-${item.id}`} className="py-2">
                  <Link
                    to="/golive/aprovacoes"
                    className="block rounded-lg px-2 py-1 hover:bg-cream/50"
                  >
                    <p className="text-sm font-medium text-navy">
                      {ROTULO_DECISAO[item.acao]} — {item.titulo}
                    </p>
                    <p className="text-[11px] text-navy/55">
                      {item.grupo} · {item.motivo}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {decisoesPendentes.length > 6 ? (
            <p className="mt-2 text-[11px] text-navy/50">
              e mais {decisoesPendentes.length - 6} na fila completa.
            </p>
          ) : null}
        </CaCard>
      </div>

      {/* §11 linhas 8, 10 e 11 — funil, ritmo e prioridades, cada um sobre a
          função canônica que a tela de /golive já usa. */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <CaCard titulo="Funil de leads" eyebrow="Fonte: etapa comercial gravada">
          {funilLeads.length === 0 ? (
            <EstadoVazio mensagem="Nenhum lead com etapa registrada." />
          ) : (
            <>
              <dl className="space-y-1.5">
                {funilLeads.map((f) => (
                  <div key={f.etapa} className="flex items-baseline justify-between gap-3">
                    <dt className="truncate text-xs text-navy/70">{ROTULO_ETAPA[f.etapa] ?? f.etapa}</dt>
                    <dd className="font-serif text-lg text-navy">{f.total}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-[11px] text-navy/45">
                Sem recorte de período: nenhum está definido na fonte.
              </p>
            </>
          )}
        </CaCard>

        <CaCard titulo="Ritmo operacional" eyebrow="6 semanas">
          {ritmo.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma microentrega concluída com data — sem série para mostrar." />
          ) : (
            <>
              <div className="flex items-end gap-1.5" aria-hidden="true">
                {ritmo.map((semana) => {
                  const teto = Math.max(...ritmo.map((r) => r.valor), 1);
                  return (
                    <div key={semana.rotulo} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-gold/70"
                        style={{ height: `${8 + (semana.valor / teto) * 44}px` }}
                      />
                      <span className="text-[9px] text-navy/50">{semana.rotulo}</span>
                    </div>
                  );
                })}
              </div>
              <dl className="sr-only">
                {ritmo.map((semana) => (
                  <div key={semana.rotulo}>
                    <dt>Semana de {semana.rotulo}</dt>
                    <dd>{semana.valor} microentrega(s) concluída(s)</dd>
                  </div>
                ))}
              </dl>
              {/* §11 linha 10: métrica e unidade explicitadas em produção. */}
              <p className="mt-2 text-[11px] text-navy/45">
                Microentregas concluídas por semana, da segunda ao domingo.
              </p>
            </>
          )}
        </CaCard>

        <CaCard titulo="Distribuição das prioridades" eyebrow="Mesma carteira ativa dos KPIs">
          {prioridades.length === 0 ? (
            <EstadoVazio mensagem="Nenhum caso ativo com prioridade registrada." />
          ) : (
            <>
              <dl className="space-y-1.5">
                {prioridades.map((p) => (
                  <div key={p.rotulo} className="flex items-baseline justify-between gap-3">
                    <dt className="truncate text-xs text-navy/70">{p.rotulo}</dt>
                    <dd className="font-serif text-lg text-navy">{p.valor}</dd>
                  </div>
                ))}
              </dl>
              {/* Caso encerrado não entra, mesmo com prioridade alta gravada. */}
              <p className="mt-2 text-[11px] text-navy/45">
                Só casos ativos; encerrado não conta como prioridade aberta.
              </p>
            </>
          )}
        </CaCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {secoes.map((secao) => (
          <CaCard
            key={secao.titulo}
            titulo={secao.titulo}
            eyebrow={`Escopo: ${secao.escopo}`}
            acao={
              <Button asChild size="sm" variant="outline">
                <Link to={secao.to}>Abrir</Link>
              </Button>
            }
          >
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              {secao.indicadores.map((item) => (
                <div key={item.rotulo} className="min-w-0 border-l border-navy/15 pl-3">
                  <dd className="break-words text-lg font-semibold text-navy">{item.valor}</dd>
                  <dt className="text-[11px] leading-tight text-navy/60">{item.rotulo}</dt>
                </div>
              ))}
            </dl>
          </CaCard>
        ))}
      </div>
    </section>
  );
}
