import { createFileRoute, Link } from "@tanstack/react-router";

import { HojeConectado } from "@/components/desk/superficies-kit-conectadas";
import { useGoLive } from "@/components/golive/dados";
import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { Button } from "@/components/ui/button";
import { CaCard } from "@/components/ui/ca-card";
import { totaisFinanceiros } from "@/lib/golive-analitico";
import { saudeDosLeads, type LeadComercial } from "@/lib/golive-comercial";
import { riscosEPrazos } from "@/lib/golive-juridico";
import { faixaDePrazo, kpisHoje, kpisPrazo, type AcaoOperacional } from "@/lib/golive-operacao";
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

type Indicador = { rotulo: string; valor: string | number };
type Secao = { titulo: string; escopo: string; to: string; indicadores: Indicador[] };

function PainelConsolidado() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  if (isPending) return <p className="mt-8 text-sm text-navy/60">Carregando indicadores consolidados…</p>;
  if (error) return <p className="mt-8 text-sm text-terracotta">Não foi possível carregar os indicadores consolidados.</p>;
  if (!caso) return <EstadoVazio mensagem="Sem registros para consolidar — nenhuma organização com dados suficientes foi encontrada." />;

  const hoje = kpisHoje(caso.carteira, caso.tarefas);
  const leads = caso.leadsComerciais as LeadComercial[];
  const saude = saudeDosLeads(leads);
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
