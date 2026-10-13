import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useGoLive } from "@/components/golive/dados";
import { CardsAlertasCentrais } from "@/components/painel/cards-alertas-centrais";
import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { Button } from "@/components/ui/button";
import { CaCard } from "@/components/ui/ca-card";
import { filaDeAprovacoes, resumoAprovacoes, type ItemAprovacao } from "@/lib/golive-aprovacoes";
import { kanbanPorEtapa, type LeadComercial } from "@/lib/golive-comercial";
import { rotulo as rotuloCrm } from "@/lib/crm-desk";
import { concluida } from "@/lib/golive-microentregas";
import {
  casosPorPaisVia,
  faixaDePrazo,
  kpisHoje,
  kpisPrazo,
  origemDoSinal,
  prioridadeDaCarteira,
  propostasAguardandoResposta,
  ritmoSemanal,
  temRitmo,
  type AcaoOperacional,
} from "@/lib/golive-operacao";
import { radarMarcosJuridicosDoPainel } from "@/lib/radar-marcos-juridicos.functions";

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
      titulo="Hoje"
      descricao="O que está parado, vencido ou pede decisão — com ação e link para a aba dona."
      visualKit="pantone"
    >
      <PainelConsolidado />
    </SaasShell>
  );
}

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

function PainelConsolidado() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;
  // P25 (26/09/2026) — "Radar de marcos jurídicos e casos impactados",
  // pedido explícito da Proprietária. Consulta própria (dado que
  // useGoLive não carrega marcos jurídicos): junção trilha × marco × caso
  // ligado, feita no servidor, sem tabela nova.
  const carregarRadarJuridico = useServerFn(radarMarcosJuridicosDoPainel);
  const qRadarJuridico = useQuery({
    queryKey: ["painel-radar-marcos-juridicos"],
    queryFn: () => carregarRadarJuridico(),
    retry: false,
  });

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
  // P25 (26/09/2026) — "Casos ativos por fase, país, responsável e saúde",
  // pedido explícito da Proprietária. Mesma carteira ativa já usada acima
  // (país/via reais de crm_casos, sem query nova).
  const porPaisVia = casosPorPaisVia(caso.carteira);
  // P27 (26/09/2026) — "Propostas aguardando resposta"/"Contratos aguardando
  // assinatura"/"Pagamentos pendentes/vencidos" (Pacote de Instruções, bloco
  // Painel Hoje). Mesma carteira ativa (eixo_comercial) + contratos/faturas
  // já carregados pela mesma função de go-live — nenhuma consulta nova aqui.
  const propostasSemResposta = propostasAguardandoResposta(caso.carteira);
  const leads = caso.leadsComerciais as LeadComercial[];
  // §11 linha 8 — funil por etapa comercial gravada. Sem período definido no
  // dado: a prancha pede "30 dias quando houver período definido", e não há.
  const funilLeads = kanbanPorEtapa(leads)
    .map((g) => ({ etapa: g.etapa, total: g.leads.length }))
    .sort((a, b) => b.total - a.total);
  /*
    §11 linhas 5, 6, 7 e 9 — as quatro contas que faltavam. Todas vêm de
    função canônica já usada por outra tela — o Hoje passa a chamar a mesma,
    para os números não divergirem. Onde a fonte não sustenta um recorte que
    a prancha nomeia (ex.: "encerrado no mês"), o card mostra o que existe e
    declara o corte, em vez de inventar data.
  */
  // §11 linha 5 — cadência dos casos: KPIs de prazo já calculados sobre o
  // MESMO array de tarefas visíveis (`kpisPrazo`).
  const cadencia = kpisPrazo(caso.tarefas);
  // §11 linha 6 — casos sem próxima ação, com quebra por natureza.
  const semAcao = {
    parados: caso.carteira.filter((c) => !c.temProximaAcao && (c.status ?? "").toLowerCase() !== "encerrado").length,
    encerrados: caso.carteira.filter((c) => (c.status ?? "").toLowerCase() === "encerrado").length,
  };
  // §11 linha 7 — microentregas prontas para revisão (já calculado acima).
  // Reusa `microentregasAguardandoRevisao` — sem duplicar critério.
  // §11 linha 9 — alertas centralizados por origem, do mesmo `origemDoSinal`
  // que /golive já usa. `caso.eventos` pode vir vazio; nesse caso o card
  // exibe estado vazio explícito.
  const alertasPorOrigem = origemDoSinal(caso.eventos ?? []);
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
  const itensRevisao = caso.microentregas.filter((m) => !concluida(m));
  const tetoFunil = Math.max(...funilLeads.map((f) => f.total), 1);
  const tetoRitmo = ritmo.length ? Math.max(...ritmo.map((r) => r.valor), 1) : 1;
  const totalPrioridades = prioridades.reduce((s, p) => s + p.valor, 0);
  const pontosRitmo = ritmo
    .map((r, i) => {
      const x = 18 + (i * 264) / Math.max(ritmo.length - 1, 1);
      const y = 102 - (r.valor / tetoRitmo) * 84;
      return { r, x, y };
    });

  /*
    Atalhos do Desk — composição da prancha V4 (01-hoje.tsx): uma linha de
    pílulas que abre cada módulo na mesma janela, sem menu paralelo. Cada
    destino é uma rota que já existe; nada aqui cria segunda rota.
  */
  const ATALHOS_DESK = [
    { rotulo: "Comercial / CRM Vivo", to: "/golive/comercial" },
    { rotulo: "Checklist / Kanban operacional", to: "/golive/kanban" },
    { rotulo: "Caso 360", to: "/casos" },
    { rotulo: "Pessoa 360", to: "/golive/pessoa" },
    { rotulo: "Radar & Matrizes", to: "/golive/radar" },
    { rotulo: "Pesquisa", to: "/golive/pesquisa" },
    { rotulo: "Biblioteca Mestre", to: "/biblioteca" },
    { rotulo: "Financeiro", to: "/golive/financeiro" },
    { rotulo: "Jurídico & Contrato", to: "/golive/juridico" },
    { rotulo: "Pessoas & Famílias", to: "/golive/pessoas" },
    { rotulo: "Portal do cliente (visão interna)", to: "/golive/portal" },
    { rotulo: "Configuração & Acesso", to: "/golive/configuracoes" },
  ] as const;

  const TOM_PILULA: Record<string, string> = {
    critico: "border-critico/40 bg-critico-suave text-navy",
    atencao: "border-atencao/50 bg-atencao-suave text-navy",
    sucesso: "border-sucesso/40 bg-sucesso-suave text-navy",
    neutro: "border-navy/15 bg-cream text-navy/65",
  };
  const TOM_FAIXA: Record<string, string> = {
    "Concluída": TOM_PILULA.sucesso,
    "Vencida": TOM_PILULA.critico,
    "Hoje": TOM_PILULA.atencao,
  };
  const CORES_DONUT = [
    "var(--navy)",
    "var(--gold)",
    "var(--sage)",
    "var(--terracotta)",
    "var(--plum)",
  ];

  return (
    <section aria-labelledby="painel-consolidado-titulo">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">Desk Intelligence</p>
          <h2 id="painel-consolidado-titulo" className="mt-1 font-serif text-3xl text-navy">Hoje</h2>
          <p className="mt-1 text-sm text-navy/60">Decisões, prazos e sinais que pedem atenção agora.</p>
        </div>
        <span className="rounded-full border border-navy/15 bg-card px-3 py-1 text-[11px] font-medium text-navy/65">Dados conectados</span>
      </div>

      <nav aria-label="Atalhos do Desk" className="mb-6" data-hoje-atalhos>
        <ul className="flex flex-wrap gap-1.5">
          <li aria-current="page">
            <span className="rounded-full bg-navy px-3.5 py-1.5 text-[11px] font-medium text-cream">Hoje</span>
          </li>
          {ATALHOS_DESK.map((atalho) => (
            <li key={atalho.to}>
              <Link
                to={atalho.to}
                className="rounded-full border border-navy/15 bg-card px-3.5 py-1.5 text-[11px] font-medium text-navy/75 transition-colors hover:border-gold/70 hover:text-navy"
              >
                {atalho.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/*
        P5 (11/10/2026) — fila de prioridades ligada à RPC canônica
        `proxima_acao_prioritaria_lote`. Componente já existia
        (cards-alertas-centrais.tsx) mas não estava montado em nenhuma rota.
      */}
      <CardsAlertasCentrais />

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
      <dl className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-hoje-indicadores>
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
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/55">{k.rotulo}</dt>
              <dd className="mt-1 font-serif text-2xl text-navy">{k.valor}</dd>
              <p className="mt-1 text-[11px] text-navy/50">{k.apoio}</p>
            </>
          );
          const classe = "block min-h-24 rounded-xl border border-navy/10 bg-card px-5 py-4 text-left shadow-sm transition-colors";
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
        Grade de duas colunas na ordem da prancha V4 (01-hoje.tsx):
        decisões × tarefas, cadência × casos parados, revisão × funil,
        alertas × ritmo, prioridades. Os blocos extras pedidos depois
        (P25, P27, radar jurídico) entram no fim, na mesma linguagem.
      */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/*
          §11 linha 3 — "Decisões prioritárias". Cada linha precisa abrir
          contexto e ação possível, então mostra o que está pendente, por quê, e
          leva à tela onde a decisão é tomada. A lista é o mesmo array que gera
          o número de "Decisões do dia" acima: nenhum dos dois pode divergir do
          outro sem divergir de si mesmo.
        */}
        <CaCard titulo="Decisões prioritárias" eyebrow="Fila de aprovações">
          {decisoesPendentes.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma decisão pendente de achado, proposta ou contrato neste caso." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {decisoesPendentes.slice(0, 6).map((item: ItemAprovacao) => (
                <li key={`${item.grupo}-${item.id}`} className="py-1.5">
                  <Link
                    to="/golive/aprovacoes"
                    className="flex items-start justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-cream/50"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy">
                        {ROTULO_DECISAO[item.acao]} — {item.titulo}
                      </p>
                      <p className="text-[11px] text-navy/55">
                        {item.grupo} · {item.motivo}
                      </p>
                    </div>
                    <span className={`shrink-0 ${TOM_PILULA.critico} rounded-full border px-2.5 py-1 text-[10px] font-medium`}>
                      Decidir
                    </span>
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
          {/*
            Decisão da Proprietária (22/09/2026): as duas decisões de §11 que
            esta fila não enxerga ficam FORA do KPI e explícitas na tela, em
            vez de renomeadas para fingir cobertura. Só entrariam na contagem
            com uma união canônica por tipo/origem/ação — que não existe.
          */}
          <p className="mt-3 border-t border-navy/10 pt-2 text-[11px] text-navy/55">
            Fora desta contagem, por não passarem pela fila de aprovações:{" "}
            <Link to="/pesquisa-modulo" className="underline decoration-gold underline-offset-2">
              liberar pesquisa
            </Link>{" "}
            e{" "}
            <Link to="/casos" className="underline decoration-gold underline-offset-2">
              confirmar documento mínimo
            </Link>
            . São decisões reais, com escritor próprio — não estão escondidas nem
            somadas aqui.
          </p>
        </CaCard>

        <CaCard
          titulo="Tarefas e microentregas"
          eyebrow="Prazos e responsáveis registrados"
          acao={
            <Button asChild size="sm" variant="outline">
              <Link to="/tarefas">Abrir</Link>
            </Button>
          }
        >
          {itensKanban.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma tarefa ou microentrega registrada para esta leitura." />
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {itensKanban.slice(0, 6).map((item) => {
                const faixa = faixaDePrazo(item);
                return (
                  <li key={item.id} className="flex min-w-0 items-start justify-between gap-3 rounded-lg border border-navy/10 bg-cream/35 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">{item.titulo}</p>
                      <p className="mt-0.5 truncate text-[11px] text-navy/55">{item.responsavel || "Responsável não registrado"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium ${TOM_FAIXA[faixa] ?? TOM_PILULA.neutro}`}>
                      {faixa}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CaCard>

        {/* §11 linha 5 — cadência dos casos: KPIs de prazo já calculados sobre o
            MESMO array de tarefas visíveis (`kpisPrazo`). */}
        <CaCard titulo="Cadência dos casos" eyebrow="Faixa de prazo das tarefas">
          <dl className="divide-y divide-navy/10">
            {[
              ["Em dia", cadencia.hoje + cadencia.proximos7, "hoje ou próximos 7 dias", TOM_PILULA.sucesso],
              ["Atrasadas", cadencia.vencida, "prazo já vencido", TOM_PILULA.critico],
              ["Aguardando externo", cadencia.externo, "instituição terceira", TOM_PILULA.neutro],
            ].map(([rotulo, valor, apoio, tom]) => (
              <div key={String(rotulo)} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <dt className="text-sm text-navy/80">{rotulo}</dt>
                  <p className="text-[10px] text-navy/45">{apoio}</p>
                </div>
                <dd className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tom as string}`}>{valor}</dd>
              </div>
            ))}
          </dl>
        </CaCard>

        {/* §11 linha 6 — casos sem próxima ação, com quebra por natureza. */}
        <CaCard titulo="Casos sem próxima ação" eyebrow="Por natureza">
          {/*
            §11 linha 6: "Não tratar encerrado como falha". A prancha mostra
            "Encerrado no mês 5" — a fonte não tem data de encerramento, então
            declaro só o total encerrado, sem inventar recorte de janela.
          */}
          <dl className="divide-y divide-navy/10">
            <div className="flex items-center justify-between gap-3 py-2.5">
              <dt className="text-sm text-navy/80">Parados</dt>
              <dd className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${TOM_PILULA.critico}`}>{semAcao.parados}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <dt className="text-sm text-navy/80">Encerrados</dt>
                <p className="text-[10px] text-navy/45">estado normal, não falha</p>
              </div>
              <dd className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${TOM_PILULA.neutro}`}>{semAcao.encerrados}</dd>
            </div>
          </dl>
        </CaCard>

        {/* §11 linha 7 — microentregas prontas para revisão. A lista usa o
            MESMO critério (`concluida`) que gera o número do KPI acima —
            reconciliados por construção, não por coincidência. */}
        <CaCard titulo="Microentregas prontas para revisão" eyebrow="Aguardando revisão humana">
          {itensRevisao.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma microentrega aguardando revisão." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {itensRevisao.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-start justify-between gap-3 py-1.5">
                  <Link to="/golive/microentregas" className="min-w-0 rounded-lg px-2 py-1 hover:bg-cream/50">
                    <p className="truncate text-sm font-medium text-navy">{m.titulo}</p>
                    <p className="text-[11px] text-navy/55">{m.responsavel || "Responsável não registrado"}</p>
                  </Link>
                  <span className={`shrink-0 ${TOM_PILULA.atencao} rounded-full border px-2.5 py-1 text-[10px] font-medium`}>Revisar</span>
                </li>
              ))}
            </ul>
          )}
          {itensRevisao.length > 6 ? (
            <p className="mt-2 text-[11px] text-navy/50">e mais {itensRevisao.length - 6} na fila de revisão.</p>
          ) : null}
          <Link
            to="/golive/microentregas"
            className="mt-2 inline-block text-xs text-navy underline decoration-gold underline-offset-2"
          >
            Abrir fila de revisão
          </Link>
        </CaCard>

        {/* §11 linha 8 — funil por etapa comercial gravada. Sem período
            definido no dado: a prancha pede "30 dias quando houver período
            definido", e não há. */}
        <CaCard titulo="Funil de leads · Visão Geral" eyebrow="Fonte: etapa comercial gravada">
          {funilLeads.length === 0 ? (
            <EstadoVazio mensagem="Nenhum lead com etapa registrada." />
          ) : (
            <div data-hoje-funil>
              <div className="space-y-1.5">
                {funilLeads.map((f, i) => (
                  <div key={f.etapa} className="flex items-center justify-between gap-2">
                    <div
                      className={`flex h-7 min-w-0 items-center overflow-hidden rounded-md border px-2.5 ${
                        f.etapa === "cliente" ? "border-gold/60 bg-gold/25" : "border-navy/10 bg-areia/70"
                      }`}
                      style={{ marginLeft: `${i * 6}%`, maxWidth: `${Math.max(30, Math.round((f.total / tetoFunil) * 100))}%` }}
                    >
                      <span className="truncate text-[11px] font-medium text-navy/80">{ROTULO_ETAPA[f.etapa] ?? f.etapa}</span>
                    </div>
                    <span className="font-serif text-sm text-navy">{f.total}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-navy/45">
                Sem recorte de período: nenhum está definido na fonte.
              </p>
            </div>
          )}
        </CaCard>

        {/* §11 linha 9 — alertas centralizados por origem, do mesmo
            `origemDoSinal` que /golive já usa. `caso.eventos` pode vir vazio;
            nesse caso o card exibe estado vazio explícito. A contagem é por
            origem; a prancha pinta gravidade, e a fonte não a registra — o
            selo fica neutro para não inventar severidade. */}
        <CaCard titulo="Alertas centralizados · com origem" eyebrow="Onde o sinal começou">
          {alertasPorOrigem.length === 0 ? (
            <EstadoVazio mensagem="Nenhum evento classificável na janela atual." />
          ) : (
            <dl className="divide-y divide-navy/10">
              {alertasPorOrigem
                .filter((a) => a.valor > 0)
                .map((a) => (
                  <div key={a.rotulo} className="flex items-center justify-between gap-3 py-2.5">
                    <dt className="text-sm text-navy/80">{a.rotulo}</dt>
                    <dd className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${TOM_PILULA.neutro}`}>{a.valor}</dd>
                  </div>
                ))}
            </dl>
          )}
        </CaCard>

        {/* §11 linha 10 — ritmo em 6 semanas, gráfico de linha como a prancha
            pede. Só aparece quando há microentrega concluída com data — sem
            isso a linha seria uma régua de zeros fingindo série histórica. */}
        <CaCard titulo="Ritmo operacional · 6 semanas" eyebrow="Microentregas concluídas por semana">
          {ritmo.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma microentrega concluída com data — sem série para mostrar." />
          ) : (
            <>
              <svg
                viewBox="0 0 300 120"
                className="h-28 w-full"
                role="img"
                aria-label="Microentregas concluídas por semana nos últimos 6 períodos semanais"
              >
                <polyline
                  points={pontosRitmo.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="none"
                  stroke="var(--navy)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {pontosRitmo.map((p) => (
                  <circle key={p.r.rotulo} cx={p.x} cy={p.y} r="4" fill="var(--card)" stroke="var(--navy)" strokeWidth="2" />
                ))}
              </svg>
              <div className="mt-1 flex justify-between text-[10px] text-navy/50">
                {ritmo.map((semana) => (
                  <span key={semana.rotulo}>{semana.rotulo}</span>
                ))}
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
              <div className="flex items-center gap-4">
                <svg viewBox="0 0 100 100" className="h-32 w-32 shrink-0" role="img" aria-label="Distribuição das prioridades entre casos ativos">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="var(--cream)" strokeWidth="14" />
                  {(() => {
                    const circ = 2 * Math.PI * 38;
                    let acumulado = 0;
                    return prioridades.slice(0, 5).map((p, i) => {
                      const fatia = totalPrioridades > 0 ? (p.valor / totalPrioridades) * circ : 0;
                      const dash = `${fatia} ${circ - fatia}`;
                      const offset = -acumulado;
                      acumulado += fatia;
                      return (
                        <circle
                          key={p.rotulo}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke={CORES_DONUT[i % CORES_DONUT.length]}
                          strokeWidth="14"
                          strokeDasharray={dash}
                          strokeDashoffset={offset}
                          transform="rotate(-90 50 50)"
                        />
                      );
                    });
                  })()}
                </svg>
                <dl className="min-w-0 flex-1 space-y-1.5">
                  {prioridades.map((p, i) => (
                    <div key={p.rotulo} className="flex items-baseline justify-between gap-3">
                      <dt className="flex min-w-0 items-center gap-2 text-xs text-navy/70">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: CORES_DONUT[i % CORES_DONUT.length] }} />
                        <span className="truncate">{p.rotulo}</span>
                      </dt>
                      <dd className="font-serif text-sm text-navy">{p.valor}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              {/* Caso encerrado não entra, mesmo com prioridade alta gravada. */}
              <p className="mt-2 text-[11px] text-navy/45">
                Só casos ativos; encerrado não conta como prioridade aberta.
              </p>
            </>
          )}
        </CaCard>

        {/*
          CRM Vivo (27/09/2026): uma só próxima ação por lead, o mesmo
          `leads.id` das outras telas, com link para a origem (Mesa Discovery).
        */}
        <CaCard titulo="Próximas ações comerciais" eyebrow="Mesmo registro do lead — /calls, /leads e /proximas-acoes">
          {(() => {
            const comAcao = leads
              .filter((l) => l.proximoPasso)
              .sort((a, b) => String(a.proximoPassoEm ?? "9999").localeCompare(String(b.proximoPassoEm ?? "9999")))
              .slice(0, 8);
            if (!comAcao.length) return <EstadoVazio mensagem="Nenhum lead do pipeline com próxima ação registrada." />;
            return (
              <ul className="divide-y divide-navy/10" data-proximas-acoes-hoje>
                {comAcao.map((l) => (
                  <li key={l.id} className="py-2">
                    <Link
                      to="/calls"
                      search={{ lead: l.id }}
                      data-link-origem-lead={l.id}
                      className="flex items-baseline justify-between gap-2 text-xs"
                    >
                      <span className="text-navy underline decoration-gold/60 underline-offset-2">{l.nome}</span>
                      <span className="text-navy/70">
                        {rotuloCrm("proxima_acao", l.proximoPasso)}
                        {l.proximoPassoEm ? ` · ${String(l.proximoPassoEm).slice(0, 10)}` : ""}
                        {l.responsavel ? ` · ${l.responsavel}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            );
          })()}
        </CaCard>

        {/*
          P25 (26/09/2026) — "Casos ativos por fase, país, responsável e
          saúde" (Painel Hoje/CRM Vivo), pedido explícito da Proprietária.
          Mesma carteira ativa dos KPIs acima; fase/responsável já aparecem
          por caso em /casos — aqui é a agregação por país/via que faltava.
        */}
        <CaCard titulo="Casos por país e via" eyebrow="Mesma carteira ativa — trilha jurídica de referência">
          {porPaisVia.length === 0 ? (
            <EstadoVazio mensagem="Nenhum caso ativo com país registrado." />
          ) : (
            <dl className="grid gap-1.5">
              {porPaisVia.map((p) => (
                <div key={p.rotulo} className="flex items-baseline justify-between gap-3 rounded-lg border border-navy/10 bg-cream/35 px-3 py-2">
                  <dt className="truncate text-xs text-navy/70">{p.rotulo}</dt>
                  <dd className="font-serif text-lg text-navy">{p.valor}</dd>
                </div>
              ))}
            </dl>
          )}
        </CaCard>

        {/*
          P27 (26/09/2026) — "Propostas aguardando resposta", "Contratos
          aguardando assinatura" e "Pagamentos pendentes/vencidos" (Pacote de
          Instruções, blocos obrigatórios do Painel Hoje). Ação direta abre o
          caso em /casos/$caseId — nunca uma lista desconectada.
        */}
        <CaCard titulo="Propostas aguardando resposta" eyebrow="Eixo comercial: proposta enviada">
          {propostasSemResposta.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma proposta aguardando resposta." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {propostasSemResposta.slice(0, 8).map((p) => (
                <li key={p.id} className="py-1.5">
                  <Link to="/casos/$caseId" params={{ caseId: p.id }} className="text-sm text-navy underline underline-offset-4">
                    {p.rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CaCard>
        <CaCard titulo="Contratos aguardando assinatura" eyebrow="contracts.status = sent">
          {caso.contratosAguardandoAssinatura.length === 0 ? (
            <EstadoVazio mensagem="Nenhum contrato aguardando assinatura." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {caso.contratosAguardandoAssinatura.slice(0, 8).map((c) => (
                <li key={c.id} className="py-1.5">
                  <Link to="/casos/$caseId" params={{ caseId: c.caseId }} className="text-sm text-navy underline underline-offset-4">
                    {c.numero || `Contrato ${c.id.slice(0, 8)}`}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CaCard>
        <CaCard titulo="Pagamentos pendentes/vencidos" eyebrow="invoices.status: aberta ou vencida">
          {caso.pagamentosPendentes.length === 0 ? (
            <EstadoVazio mensagem="Nenhum pagamento pendente ou vencido." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {caso.pagamentosPendentes.slice(0, 8).map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-2 py-1.5 text-sm">
                  {f.caseId ? (
                    <Link to="/casos/$caseId" params={{ caseId: f.caseId }} className="text-navy underline underline-offset-4">
                      {f.numero || `Fatura ${f.id.slice(0, 8)}`}
                    </Link>
                  ) : (
                    <span className="text-navy/70">{f.numero || `Fatura ${f.id.slice(0, 8)}`}</span>
                  )}
                  <span className="text-navy/55">
                    {f.moeda} {f.valor.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CaCard>

        {/*
          P25 (26/09/2026) — "Radar de marcos jurídicos e casos impactados",
          pedido explícito da Proprietária. Cada marco jurídico real
          (legal_reference_milestones) com a contagem de casos ativos
          realmente ligados àquela trilha (crm_casos.citizenship_track_id) —
          nunca inventa impacto: sem caso ligado, mostra 0.
        */}
        <div className="lg:col-span-2">
          <CaCard
            titulo="Radar de marcos jurídicos"
            eyebrow="Marcos jurídicos por trilha × casos realmente ligados"
            acao={
              <Button asChild size="sm" variant="outline">
                <Link to="/matriz-juridica">Validação jurídica</Link>
              </Button>
            }
          >
            {qRadarJuridico.isLoading ? (
              <p className="text-xs text-navy/50">Carregando…</p>
            ) : qRadarJuridico.isError ? (
              <p className="text-xs text-terracotta">Não foi possível carregar o radar de marcos jurídicos.</p>
            ) : !qRadarJuridico.data?.length ? (
              <EstadoVazio mensagem="Nenhum marco jurídico registrado ainda." />
            ) : (
              <ul className="divide-y divide-navy/10">
                {qRadarJuridico.data.slice(0, 8).map((r) => (
                  <li key={r.marcoId} className="flex items-center justify-between gap-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy">
                        {r.pais} — {r.marco}
                      </p>
                      <p className="text-[11px] text-navy/55">
                        {r.trilhaCode} · status: {r.statusMarco}
                        {r.revisaoObrigatoria ? " · revisão obrigatória" : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        r.casosAfetados > 0
                          ? "border-gold/60 bg-gold/10 text-navy"
                          : "border-navy/15 bg-cream text-navy/50"
                      }`}
                    >
                      {r.casosAfetados} caso(s) afetado(s)
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CaCard>
        </div>
      </div>
    </section>
  );
}

