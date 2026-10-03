import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { EstadoDados } from "@/components/saas/estado-dados";
import { SaasShell } from "@/components/saas/shell";

import {
  agruparPlanoAcao,
  APROVACOES_CLIENTE,
  AVISO_ESTIMATIVA,
  CANAIS,
  calcularEstimativa,
  estadoComunicacaoUI,
  moedaBR,
  ORIGENS_ESTIMATIVA,
  PAGADORES,
  pendenciasCriticasPesquisa,
  PRIORIDADES,
  rotuloDe,
  STATUS_ACAO,
  TIPOS_ACAO,
  TIPOS_DESPESA,
  type ItemPainel,
} from "@/lib/plano-acao-pesquisa";
import { EditarPlanoAcao } from "@/components/pesquisa/editar-plano-acao";
import { painelPlanoAcao } from "@/lib/plano-acao-pesquisa.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const Route = createFileRoute("/_authenticated/plano-acao/$caseId")({
  validateSearch: (s: Record<string, unknown>) => ({ foco: s.foco === "criticas" ? "criticas" : undefined }),
  head: () => ({
    meta: [
      { title: "Plano de ação de pesquisa — Clube Ancestral" },
      {
        name: "description",
        content: "Fila interna de ações de pesquisa, instituições de referência e previsões de terceiros do caso.",
      },
      { property: "og:title", content: "Plano de ação de pesquisa — Clube Ancestral" },
      { property: "og:description", content: "Ações, prazos, rechecagens e previsões internas de pesquisa genealógica." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PlanoAcao,
  errorComponent: ({ error }) => (
    <SaasShell titulo="Plano de ação de pesquisa" descricao="Falha ao carregar o plano.">
      <p role="alert" className="text-sm text-terracotta">{(error as Error).message}</p>
    </SaasShell>
  ),
  notFoundComponent: () => (
    <SaasShell titulo="Plano de ação de pesquisa" descricao="Caso não encontrado.">
      <p className="text-sm text-navy/70">Caso não encontrado.</p>
    </SaasShell>
  ),
});

function Campo({ r, v }: { r: string; v: React.ReactNode }) {
  return (
    <p className="text-[11px] text-navy/60">
      <span className="uppercase tracking-wide text-navy/40">{r}: </span>
      {v || "—"}
    </p>
  );
}

function CartaoItem({
  item,
  instituicao,
  estimativas,
}: {
  item: ItemPainel & Record<string, any>;
  instituicao?: string;
  estimativas: Record<string, any>[];
}) {
  const com = estadoComunicacaoUI(item);
  const previsao = estimativas.filter((e) => e.research_action_plan_item_id === item.id);
  const vinculo =
    item.document_request_id
      ? `Solicitação ${String(item.document_request_id).slice(0, 8)}`
      : item.evidence_id
        ? `Evidência ${String(item.evidence_id).slice(0, 8)}`
        : item.finding_id
          ? `Achado ${String(item.finding_id).slice(0, 8)}`
          : item.research_item_id
            ? `Item de pesquisa ${String(item.research_item_id).slice(0, 8)}`
            : "—";

  return (
    <li className="rounded-xl border border-navy/10 bg-cream/40 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-navy">{item.titulo || rotuloDe(TIPOS_ACAO, item.action_type)}</p>
        <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[11px] text-navy">
          {rotuloDe(PRIORIDADES, item.priority)}
        </span>
      </div>
      <div className="mt-2 grid gap-1 sm:grid-cols-2">
        <Campo r="Ação" v={rotuloDe(TIPOS_ACAO, item.action_type)} />
        <Campo r="Status" v={rotuloDe(STATUS_ACAO, item.status)} />
        <Campo r="Motivo" v={item.reason} />
        <Campo r="Instituição" v={instituicao ?? "Sem instituição vinculada"} />
        <Campo r="Documento / evidência / achado" v={vinculo} />
        <Campo r="Prazo" v={item.due_date} />
        <Campo r="Responsável" v={item.responsible_user_id ? String(item.responsible_user_id).slice(0, 8) : "não atribuído"} />
        <Campo r="Próxima ação" v={item.next_action} />
        <Campo r="Próxima rechecagem" v={item.next_check_at} />
        <Campo r="Canal sugerido" v={rotuloDe(CANAIS, item.suggested_channel)} />
      </div>

      <div className="mt-3 rounded-lg border border-navy/10 bg-cream/60 p-3">
        <p className="text-[11px] font-medium text-navy">
          Comunicação: {com.externo ? "draft_created" : "sem comunicação externa"}
        </p>
        <p className="mt-1 text-[11px] text-navy/60">{com.rotulo}</p>
        {com.externo && item.communication_draft ? (
          <details className="mt-2">
            <summary className="cursor-pointer text-[11px] text-navy underline">Ver rascunho interno</summary>
            <pre className="mt-1 whitespace-pre-wrap text-[11px] text-navy/70">{item.communication_draft}</pre>
          </details>
        ) : null}
      </div>

      {previsao.length ? (
        <div className="mt-3 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3">
          <p className="text-[11px] font-medium text-navy">Previsão externa (estimativa interna)</p>
          {previsao.map((e) => {
            const calc = calcularEstimativa(e);
            return (
              <p key={e.id} className="mt-1 text-[11px] text-navy/70">
                {rotuloDe(TIPOS_DESPESA, e.expense_type)} — faixa {moedaBR(calc.estimated_total_min, e.currency ?? "BRL")} a{" "}
                {moedaBR(calc.estimated_total_max, e.currency ?? "BRL")} · fonte {rotuloDe(ORIGENS_ESTIMATIVA, e.estimate_source)} ·
                pagador {rotuloDe(PAGADORES, e.payer)} · {rotuloDe(APROVACOES_CLIENTE, e.client_approval_status)}
              </p>
            );
          })}
          <p className="mt-1 text-[11px] text-navy/50">
            Não é cobrança, receita, custo próprio, reembolso ou despesa executada pelo Clube Ancestral.
          </p>
        </div>
      ) : null}
    </li>
  );
}

function Secao({
  titulo,
  descricao,
  itens,
  nomeInstituicao,
  estimativas,
}: {
  titulo: string;
  descricao?: string;
  itens: (ItemPainel & Record<string, any>)[];
  nomeInstituicao: (id?: string | null) => string | undefined;
  estimativas: Record<string, any>[];
}) {
  return (
    <section className="mb-6">
      <h2 className="font-serif text-lg text-navy">
        {titulo} <span className="text-sm text-navy/50">({itens.length})</span>
      </h2>
      {descricao ? <p className="mb-2 text-xs text-navy/55">{descricao}</p> : null}
      {itens.length ? (
        <ul className="mt-2 grid gap-3 lg:grid-cols-2">
          {itens.map((i) => (
            <CartaoItem key={i.id} item={i} instituicao={nomeInstituicao(i.institution_id)} estimativas={estimativas} />
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-navy/50">Nenhuma ação nesta lista.</p>
      )}
    </section>
  );
}

function PlanoAcao() {
  const { caseId } = Route.useParams();
  const { foco } = Route.useSearch();
  const carregar = useServerFn(painelPlanoAcao);
  const q = useQuery({ queryKey: ["g07b", caseId], queryFn: () => carregar({ data: { caseId } }) });

  const dados = q.data;
  const itens = useMemo(() => (dados?.itens ?? []) as (ItemPainel & Record<string, any>)[], [dados]);
  const grupos = useMemo(() => agruparPlanoAcao(itens), [itens]);
  const criticas = useMemo(() => pendenciasCriticasPesquisa(itens), [itens]);
  const instituicoes = (dados?.instituicoes ?? []) as Record<string, any>[];
  const estimativas = (dados?.estimativas ?? []) as Record<string, any>[];
  const nomeInstituicao = (id?: string | null) => instituicoes.find((x) => x.id === id)?.name as string | undefined;

  // Sem dado lido não existe plano vazio: carregando, erro e falha de carga
  // ficam explícitos, com ação de tentar novamente.
  if (!dados)
    return (
      <SaasShell titulo="Plano de ação de pesquisa" descricao="Fila interna de ações de pesquisa.">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={undefined}
          aoTentarNovamente={() => void q.refetch()}
          recurso="o plano de ação deste caso"
        >
          {() => null}
        </EstadoDados>
      </SaasShell>
    );

  const aguardandoAprovacao = estimativas.filter((e) => e.client_approval_status === "aguardando_aprovacao");

  return (
    <SaasShell
      titulo="Plano de ação de pesquisa"
      descricao="Fila interna de ações, instituições de referência e previsões de terceiros."
    >
    <div>
      <p className="text-xs text-navy/50">
        <Link to="/casos/$caseId" params={{ caseId }} className="underline">
          Casos 360
        </Link>{" "}
        →{" "}
        <Link to="/pesquisa-evidencias/$caseId" params={{ caseId }} className="underline">
          Pesquisa Genealógica e Evidências
        </Link>{" "}
        → Plano de Ação de Pesquisa
      </p>

      <h1 className="mt-1 font-serif text-2xl text-navy">Plano de ação de pesquisa</h1>
      <p className="mb-4 text-sm text-navy/60">
        {(dados?.caso as any)?.codigo ?? caseId} — fila interna de trabalho. Nenhum contato, envio, pedido externo, despesa ou
        cobrança é executado por esta tela.
      </p>

      {/*
        Corte ÓRFÃOS (03/10/2026): esta rota importava SÓ o leitor. Os quatro
        escritores do plano existiam, com autorização por papel e releitura,
        e tinham zero chamadores — a equipe via a fila e não conseguia criar,
        editar nem arquivar nada pela tela.
      */}
      <EditarPlanoAcao
        caseId={caseId}
        podeEditar={Boolean((dados as any)?.podeEditar)}
        instituicoes={instituicoes}
        itens={itens}
        aoSalvar={() => void q.refetch()}
      />

      {foco === "criticas" ? (
        <Secao
          titulo="Pendências críticas de pesquisa (filtro do Painel Hoje)"
          descricao="Prioridade crítica, prazo hoje ou vencido, em aberto."
          itens={criticas}
          nomeInstituicao={nomeInstituicao}
          estimativas={estimativas}
        />
      ) : null}

      <Secao titulo="Urgente hoje" descricao="Prazo hoje ou vencido." itens={grupos.urgenteHoje} nomeInstituicao={nomeInstituicao} estimativas={estimativas} />
      <Secao titulo="Esta semana" itens={grupos.estaSemana} nomeInstituicao={nomeInstituicao} estimativas={estimativas} />
      <Secao
        titulo="Aguardando resposta"
        descricao="Exige data de próxima rechecagem registrada."
        itens={grupos.aguardandoResposta}
        nomeInstituicao={nomeInstituicao}
        estimativas={estimativas}
      />
      <Secao titulo="Rechecagens vencidas" itens={grupos.rechecagensVencidas} nomeInstituicao={nomeInstituicao} estimativas={estimativas} />

      <section className="mb-6">
        <h2 className="font-serif text-lg text-navy">Ações por instituição</h2>
        <div className="mt-2 grid gap-3 lg:grid-cols-2">
          {grupos.porInstituicao.map((g) => (
            <div key={g.chave} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <p className="text-sm font-medium text-navy">{nomeInstituicao(g.chave) ?? "Sem instituição vinculada"}</p>
              <ul className="mt-1 space-y-1 text-[11px] text-navy/60">
                {g.itens.map((i) => (
                  <li key={i.id}>
                    {i.titulo} — {rotuloDe(STATUS_ACAO, i.status)} · prazo {i.due_date ?? "—"}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {grupos.porInstituicao.length === 0 && <p className="text-xs text-navy/50">Nenhuma ação em aberto.</p>}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-serif text-lg text-navy">Pendências por pessoa / geração</h2>
        <p className="mb-2 text-xs text-navy/55">Agrupadas pelo registro de pesquisa, achado, evidência ou solicitação vinculada.</p>
        <div className="grid gap-3 lg:grid-cols-2">
          {grupos.porPessoaGeracao.map((g) => (
            <div key={g.chave} className="rounded-xl border border-navy/10 bg-cream/40 p-4">
              <p className="text-sm font-medium text-navy">
                {g.chave === "sem_vinculo" ? "Sem pessoa/geração vinculada" : `Vínculo ${g.chave.slice(0, 8)}`}
              </p>
              <ul className="mt-1 space-y-1 text-[11px] text-navy/60">
                {g.itens.map((i) => (
                  <li key={i.id}>
                    {i.titulo} — {rotuloDe(PRIORIDADES, i.priority)} · {rotuloDe(STATUS_ACAO, i.status)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {grupos.porPessoaGeracao.length === 0 && <p className="text-xs text-navy/50">Nenhuma pendência em aberto.</p>}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-serif text-lg text-navy">
          Estimativas de terceiros aguardando aprovação <span className="text-sm text-navy/50">({aguardandoAprovacao.length})</span>
        </h2>
        <p className="mb-2 text-xs text-navy/55">{AVISO_ESTIMATIVA}</p>
        <div className="grid gap-3 lg:grid-cols-2">
          {aguardandoAprovacao.map((e) => {
            const calc = calcularEstimativa(e);
            return (
              <div key={e.id} className="rounded-xl border border-terracotta/30 bg-terracotta/5 p-4">
                <p className="text-sm font-medium text-navy">{rotuloDe(TIPOS_DESPESA, e.expense_type)}</p>
                <Campo r="Tipo de valor" v="Estimativa interna (não executada)" />
                <Campo
                  r="Faixa de valor"
                  v={`${moedaBR(calc.estimated_total_min, e.currency ?? "BRL")} a ${moedaBR(calc.estimated_total_max, e.currency ?? "BRL")}`}
                />
                <Campo r="Moeda" v={e.currency ?? "BRL"} />
                <Campo r="Fonte da estimativa" v={rotuloDe(ORIGENS_ESTIMATIVA, e.estimate_source)} />
                <Campo r="Pagador" v={rotuloDe(PAGADORES, e.payer)} />
                <Campo r="Status de aprovação" v={rotuloDe(APROVACOES_CLIENTE, e.client_approval_status)} />
                <p className="mt-2 text-[11px] text-navy/50">
                  Não é cobrança, receita, custo próprio, reembolso ou despesa executada pelo Clube Ancestral.
                </p>
              </div>
            );
          })}
          {aguardandoAprovacao.length === 0 && <p className="text-xs text-navy/50">Nenhuma estimativa aguardando aprovação.</p>}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="font-serif text-lg text-navy">
          Histórico de ações concluídas <span className="text-sm text-navy/50">({grupos.concluidas.length})</span>
        </h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/60">
          {grupos.concluidas.map((i) => (
            <li key={i.id}>
              {i.due_date ?? "—"} · {i.titulo} — {rotuloDe(STATUS_ACAO, i.status)} · resultado interno:{" "}
              {i.contact_result_internal ?? "—"}
            </li>
          ))}
          {grupos.concluidas.length === 0 && <li>Nenhuma ação concluída registrada.</li>}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-lg text-navy">Registro imutável de interações</h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/60">
          {((dados?.interacoes ?? []) as Record<string, any>[]).slice(0, 20).map((it) => (
            <li key={it.id}>
              {String(it.ocorrido_em ?? "").slice(0, 10)} · {it.canal ?? "—"} — {it.resumo ?? it.conteudo_interno ?? "—"}
            </li>
          ))}
          {((dados?.interacoes ?? []) as unknown[]).length === 0 && <li>Nenhuma interação registrada.</li>}
        </ul>
      </section>
    </div>
    </SaasShell>
  );
}
