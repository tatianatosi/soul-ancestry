import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useGoLive } from "@/components/golive/dados";
import { listarExcecoes } from "@/lib/ops.functions";
import { EstadoVazio, SaasShell } from "@/components/saas/shell";
import { FonteAlimento } from "@/components/desk/fonte-alimento";
import { Button } from "@/components/ui/button";
import { DonutEstados, Etiqueta, GraficoLinha, Linha, type Tom } from "@/components/prancha-v4/kit";
import { FunilDegraus } from "@/components/prancha-v4/funil-degraus";
import { CaCard } from "@/components/ui/ca-card";
import "@/components/desk/mockup4-superficies.css";
import { filaDeAprovacoes, resumoAprovacoes, type ItemAprovacao } from "@/lib/golive-aprovacoes";
import { kanbanPorEtapa, type LeadComercial } from "@/lib/golive-comercial";
import { concluida } from "@/lib/golive-microentregas";
import {
  faixaDePrazo,
  kpisHoje,
  kpisPrazo,
  origemDoSinal,
  prioridadeDaCarteira,
  ritmoSemanal,
  temRitmo,
  ROTULOS_ORIGEM,
  type AcaoOperacional,
} from "@/lib/golive-operacao";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Clube Ancestral" },
      { name: "description", content: "Painel Hoje: decisões, cadência, microentregas, funil e ritmo operacional." },
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
      <FonteAlimento
        fonte="Exceções, sinais e descobertas derivados das fichas reais"
        consumidor="A decisão do dia da equipe — nada aqui é digitado, tudo é derivado"
        detalheTecnico="painel-caso-destaque · pendencias-humanas-caso"
      />
      <div data-desk-mockup4="hoje"><PainelConsolidado /></div>
    </SaasShell>
  );
}

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

/*
  19/10/2026 — conferência bloco a bloco com a prancha V4 (desk-01-hoje): os
  cartões de lista da prancha são linhas com etiqueta de contagem/estado à
  direita (Cadência, Sem próxima ação, Alertas) — não barras. A contagem é
  sempre mostrada, inclusive "0"; zero não é erro.
*/
const TOM_DECISAO: Record<ItemAprovacao["acao"], { texto: string; tom: Tom }> = {
  aprovar_achado: { texto: "Decidir", tom: "critico" },
  aprovar_escopo: { texto: "Decidir", tom: "critico" },
  enviar_revisao: { texto: "Decidir", tom: "critico" },
  registrar_assinatura: { texto: "Decidir", tom: "critico" },
  publicar: { texto: "Decidir", tom: "critico" },
  // Sem ação possível até completar o dado: atenção, não decisão.
  nenhuma: { texto: "Atenção", tom: "atencao" },
};

function tomDaFaixa(faixa: string): Tom {
  if (faixa === "Vencida") return "critico";
  if (faixa === "Hoje" || faixa === "Aguardando externo") return "atencao";
  if (faixa === "Concluída") return "sucesso";
  return "neutro";
}

function LinhaContagem({ rotulo, valor, tom }: { rotulo: string; valor: number; tom: Tom }) {
  return <Linha rotulo={rotulo} valor={String(valor)} tom={valor > 0 ? tom : "neutro"} />;
}

function SemDados({ ativo, marca }: { ativo: boolean; marca: string }) {
  return ativo ? (
    <p className="mt-2 text-xs font-medium text-navy/70" {...{ [marca]: "" }}>
      Sem dados suficientes
    </p>
  ) : null;
}

function PainelConsolidado() {
  const { data, isPending, error } = useGoLive();
  const caso = data?.encontrado ? data : null;

  if (isPending) return <p className="mt-8 text-sm text-navy/60">Carregando indicadores consolidados…</p>;
  if (error) return <p className="mt-8 text-sm text-terracotta">Não foi possível carregar os indicadores consolidados.</p>;
  if (!caso) return <EstadoVazio mensagem="Sem registros para consolidar — nenhuma organização com dados suficientes foi encontrada." />;

  const hoje = kpisHoje(caso.carteira, caso.tarefas);
  const microentregasAbertas = caso.microentregas.filter((m) => !concluida(m));
  const microentregasAguardandoRevisao = microentregasAbertas.length;

  const filaDecisoes = filaDeAprovacoes({
    achados: caso.achados,
    propostas: caso.propostas,
    contratos: caso.contratos,
    projecoes: caso.projecoesEstados,
  });
  const decisoesPendentes = filaDecisoes.filter((i) => i.situacao === "pendente");
  const decisoesDoDia = resumoAprovacoes(filaDecisoes).pendentes;

  const comRitmo = temRitmo(caso.microentregas);
  const ritmo = ritmoSemanal(caso.microentregas, 6);
  const prioridades = prioridadeDaCarteira(caso.carteira);
  const fatiasPrioridade = (
    [
      ["critica", "Crítica", "terracotta"],
      ["alta", "Alta", "gold"],
      ["media", "Média", "navy"],
      ["baixa", "Baixa", "sucesso"],
    ] as const
  ).map(([chave, rotulo, tom]) => ({
    rotulo,
    tom,
    valor: prioridades.find((p) => p.rotulo === chave)?.valor ?? 0,
  }));
  const comPrioridade = prioridades.length > 0;

  const leads = caso.leadsComerciais as LeadComercial[];
  const funilLeads = kanbanPorEtapa(leads)
    .map((g) => ({ etapa: g.etapa, total: g.leads.length }))
    .sort((a, b) => b.total - a.total);
  const ETAPAS_FUNIL = ["novo", "discovery", "diagnostico", "proposta", "cliente"];
  const totalEtapa = (e: string) =>
    funilLeads.filter((f) => f.etapa === e || (e === "novo" && f.etapa === "novo_lead")).reduce((s, f) => s + f.total, 0);
  const funilDegraus = ETAPAS_FUNIL.map((e) => ({ rotulo: ROTULO_ETAPA[e]!, total: totalEtapa(e) }));
  // Etapa gravada fora das cinco do funil não some: aparece em linha à parte.
  const foraDoFunil = funilLeads
    .filter((f) => !ETAPAS_FUNIL.includes(f.etapa) && f.etapa !== "novo_lead")
    .map((f) => ({ rotulo: ROTULO_ETAPA[f.etapa] ?? f.etapa, total: f.total }));

  const cadencia = kpisPrazo(caso.tarefas);
  const semAcao = {
    parados: caso.carteira.filter((c) => !c.temProximaAcao && (c.status ?? "").toLowerCase() !== "encerrado").length,
    // "Caso pausado" da prancha: só o status gravado com "paus" conta — sem inferir pausa de inatividade.
    pausados: caso.carteira.filter((c) => /paus/i.test(c.status ?? "")).length,
    encerrados: caso.carteira.filter((c) => (c.status ?? "").toLowerCase() === "encerrado").length,
  };
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

  return (
    <section aria-labelledby="painel-consolidado-titulo" data-painel-hoje-v4>
      <h2 id="painel-consolidado-titulo" className="sr-only">Hoje</h2>

      {/* Topo — 4 KPIs (grade V4, desk-01-hoje). */}
      <dl className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" data-hoje-indicadores>
        {[
          { rotulo: "Decisões do dia", valor: decisoesDoDia, apoio: "aguardando você", to: "/golive/aprovacoes" },
          { rotulo: "Cadências vencidas", valor: hoje.vencidas, apoio: "pedem retomada", to: "/golive" },
          { rotulo: "Casos sem próxima ação", valor: hoje.semProxima, apoio: "precisa de decisão", to: "/golive" },
          {
            rotulo: "Microentregas para revisão",
            valor: microentregasAguardandoRevisao,
            apoio: "prontas para conferir",
            to: "/golive/microentregas",
          },
        ].map((k) => (
          <Link
            key={k.rotulo}
            to={k.to}
            className="block min-h-28 rounded-lg border border-border bg-card px-5 py-4 text-left shadow-sm transition-colors hover:border-gold"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-widest text-navy/55">{k.rotulo}</dt>
            <dd className="mt-1 font-serif text-3xl leading-none text-navy">{k.valor}</dd>
            <p className="mt-1 text-[11px] text-navy/45">{k.apoio}</p>
          </Link>
        ))}
      </dl>

      {/* Grid central, 2 colunas, 3 linhas — mesma ordem da prancha V4. */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
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
                <li key={`${item.grupo}-${item.id}`} className="py-1.5">
                  <Link to="/golive/aprovacoes" className="flex items-center justify-between gap-3 rounded-lg px-1 py-1 hover:bg-cream/50">
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-navy/80">
                        {ROTULO_DECISAO[item.acao]} — {item.titulo}
                      </span>
                      <span className="block truncate text-[10px] text-navy/50">
                        {item.grupo} · {item.motivo}
                      </span>
                    </span>
                    <Etiqueta texto={TOM_DECISAO[item.acao].texto} tom={TOM_DECISAO[item.acao].tom} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {decisoesPendentes.length > 6 ? (
            <p className="mt-2 text-[11px] text-navy/50">e mais {decisoesPendentes.length - 6} na fila completa.</p>
          ) : null}
          <p className="mt-3 border-t border-navy/10 pt-2 text-[11px] text-navy/55">
            Fora desta contagem, por não passarem pela fila de aprovações:{" "}
            <Link to="/pesquisa-modulo" className="underline decoration-gold underline-offset-2">
              liberar pesquisa
            </Link>{" "}
            e{" "}
            <Link to="/casos" className="underline decoration-gold underline-offset-2">
              confirmar documento mínimo
            </Link>
            .
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
            <ul className="divide-y divide-navy/5">
              {itensKanban.slice(0, 6).map((item) => {
                const faixa = faixaDePrazo(item);
                return (
                  <li key={item.id} className="flex min-w-0 items-center justify-between gap-3 py-1.5">
                    <span className="min-w-0">
                      <span className="block truncate text-xs text-navy/80">{item.titulo}</span>
                      <span className="block truncate text-[10px] text-navy/50">{item.responsavel || "Responsável não registrado"}</span>
                    </span>
                    <Etiqueta texto={faixa} tom={tomDaFaixa(faixa)} />
                  </li>
                );
              })}
            </ul>
          )}
        </CaCard>

        <CaCard titulo="Cadência dos casos" eyebrow="Faixa de prazo das tarefas">
          <div data-hoje-cadencia-linhas>
            <LinhaContagem rotulo="Cadência em dia" valor={cadencia.hoje + cadencia.proximos7} tom="sucesso" />
            <LinhaContagem rotulo="Cadência atrasada" valor={cadencia.vencida} tom="critico" />
            <LinhaContagem rotulo="Aguardando cliente/externo" valor={cadencia.externo} tom="atencao" />
          </div>
          <SemDados ativo={caso.tarefas.length === 0} marca="data-hoje-cadencia-vazio" />
        </CaCard>

        <CaCard titulo="Casos sem próxima ação" eyebrow="Por natureza">
          <div data-hoje-sem-acao-linhas>
            <LinhaContagem rotulo="Caso sem responsável/parado" valor={semAcao.parados} tom="critico" />
            <LinhaContagem rotulo="Caso pausado" valor={semAcao.pausados} tom="neutro" />
            <LinhaContagem rotulo="Encerrado (estado normal, não falha)" valor={semAcao.encerrados} tom="sucesso" />
          </div>
          <SemDados ativo={caso.carteira.length === 0} marca="data-hoje-sem-acao-vazio" />
        </CaCard>

        <CaCard
          titulo="Microentregas prontas para revisão"
          eyebrow="concluída === false"
          acao={
            <Button asChild size="sm" variant="outline">
              <Link to="/golive/microentregas">Abrir</Link>
            </Button>
          }
        >
          {microentregasAbertas.length === 0 ? (
            <EstadoVazio mensagem="Nenhuma microentrega aguardando revisão." />
          ) : (
            <ul className="divide-y divide-navy/10">
              {microentregasAbertas.slice(0, 6).map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 py-1.5">
                  <p className="truncate text-xs text-navy/80">{m.titulo}</p>
                  <Etiqueta texto="Revisar" tom="atencao" />
                </li>
              ))}
            </ul>
          )}
        </CaCard>

        <CaCard titulo="Funil de leads · Visão Geral" eyebrow="Fonte: etapa comercial gravada">
          <div data-hoje-funil-degraus>
            <FunilDegraus
              etapas={funilDegraus}
              tituloAcessivel={`Leads por etapa: ${[...funilDegraus, ...foraDoFunil].map((f) => `${f.rotulo} ${f.total}`).join(", ")}`}
            />
          </div>
          {foraDoFunil.length ? (
            <div className="mt-2 border-t border-navy/10 pt-1" data-hoje-funil-fora>
              {foraDoFunil.map((f) => (
                <LinhaContagem key={f.rotulo} rotulo={`Fora do funil · ${f.rotulo}`} valor={f.total} tom="atencao" />
              ))}
            </div>
          ) : null}
          <SemDados ativo={leads.length === 0} marca="data-hoje-funil-vazio" />
          <p className="mt-2 text-[11px] text-navy/45">
            Sem recorte de período: nenhum está definido na fonte.
          </p>
        </CaCard>
      </div>

      <AlertaExcecoesAbertas />

      {/* Base — Alertas + Ritmo lado a lado, Distribuição das prioridades abaixo. */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <CaCard titulo="Alertas centralizados · com origem" eyebrow="Alertas por origem · onde o sinal começou">
          <div data-hoje-alertas-linhas>
            {ROTULOS_ORIGEM.map((r) => (
              <LinhaContagem
                key={r}
                rotulo={`Alertas · ${r}`}
                valor={alertasPorOrigem.find((a) => a.rotulo === r)?.valor ?? 0}
                tom="critico"
              />
            ))}
          </div>
          <SemDados ativo={alertasPorOrigem.length === 0} marca="data-hoje-alertas-vazio" />
        </CaCard>

        <CaCard titulo="Ritmo operacional · 6 semanas" eyebrow="Microentregas concluídas por semana">
          <div data-hoje-ritmo-linha>
            <GraficoLinha
              pontos={ritmo}
              tituloAcessivel={`Microentregas concluídas por semana, últimas 6 semanas: ${ritmo.map((s) => s.valor).join(", ")}`}
            />
          </div>
          {comRitmo ? null : (
            <p className="mt-2 text-xs font-medium text-navy/70" data-hoje-ritmo-vazio>
              Sem dados suficientes
            </p>
          )}
        </CaCard>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <CaCard titulo="Distribuição das prioridades" eyebrow="Mesma carteira ativa dos KPIs">
          <div data-hoje-prioridades-rosca>
            <DonutEstados
              segmentos={fatiasPrioridade}
              tituloAcessivel={`Casos ativos por prioridade: ${fatiasPrioridade.map((f) => `${f.rotulo} ${f.valor}`).join(", ")}`}
            />
          </div>
          {comPrioridade ? null : (
            <p className="mt-2 text-xs font-medium text-navy/70" data-hoje-prioridades-vazio>
              Sem dados suficientes
            </p>
          )}
          <p className="mt-2 text-[11px] text-navy/45">
            Só casos ativos; encerrado não conta como prioridade aberta.
          </p>
        </CaCard>

        {/* Âncora canônica para a busca global do Shell: Encontrar no Desk */}
        <div id="encontrar-no-desk" className="scroll-mt-24">
          <CaCard titulo="Encontrar no Desk" eyebrow="Busca rápida contextual de casos e pessoas">
            <p className="text-xs text-navy/60">
              Digite na barra de pesquisa superior ou navegue pelos atalhos diretos das abas para localizar qualquer caso, contrato ou evidência.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/casos">Ir para Casos 360</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/clientes">Ir para Pessoas 360</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/contratos">Ir para Contratos</Link>
              </Button>
            </div>
          </CaCard>
        </div>
      </div>
    </section>
  );
}

/**
 * 18/10/2026 — Exceções operacionais saíram do menu e aparecem aqui como
 * alerta. Aberta = não consumida e dentro da validade. Leitura apenas; a
 * tela de registro continua no endereço próprio.
 */
function AlertaExcecoesAbertas() {
  const fn = useServerFn(listarExcecoes);
  const q = useQuery({ queryKey: ["ops", "excecoes"], queryFn: () => fn(), retry: false });
  if (q.isPending || q.isError) return null;
  const agora = Date.now();
  const abertas = (q.data?.excecoes ?? []).filter(
    (e) => !e.consumida_em && (!e.valido_ate || new Date(e.valido_ate).getTime() >= agora),
  );
  if (abertas.length === 0) return null;
  return (
    <div className="ca-cartao-natureza mb-6" data-natureza="atencao" data-hoje-excecoes>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="ca-selo-natureza" data-natureza="atencao">Atenção</span>
          <p className="mt-1 font-serif text-lg text-navy">
            {abertas.length === 1 ? "1 exceção operacional em aberto" : `${abertas.length} exceções operacionais em aberto`}
          </p>
          <p className="text-xs text-navy/60">Autorizadas pela administração e ainda não consumidas.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/ops-excecoes">Ver exceções</Link>
        </Button>
      </div>
    </div>
  );
}
