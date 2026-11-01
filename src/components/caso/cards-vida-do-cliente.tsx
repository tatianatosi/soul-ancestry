/**
 * Caso 360 — cards-resumo da vida do cliente (G2, 23/10/2026).
 *
 * Decisão da Proprietária (23/10/2026): o Caso 360 é a visão MACRO — cards
 * que resumem TODA a vida do cliente, do lead ao App. O detalhe (a vida
 * COMPLETA) mora no GoLive do mesmo caso (Casos → GoLive · Vida do cliente).
 *
 * Fonte única: `useGoLive(casoId)` (carregarGoLive do caso aberto) — os
 * números do resumo são os MESMOS que o GoLive mostra. Nada é inventado:
 * sem registro, o card mostra 0 / "Sem registro ainda" (premissa P8).
 */
import { Link } from "@tanstack/react-router";

import { useGoLive } from "@/components/golive/dados";
import type { TELAS_GOLIVE } from "@/components/golive/shell";
import { CaCard } from "@/components/ui/ca-card";
import type { DadosGoLive } from "@/lib/golive.functions";

type Encontrado = Extract<DadosGoLive, { encontrado: true }>;

export type SecaoFicha = "visao" | "comercial" | "tecnico" | "pessoas" | "jornada" | "documentos" | "financeiro";

type Linha = { rotulo: string; valor: string | number };

export type CardVida = {
  id: string;
  titulo: string;
  linhas: Linha[];
  golive: (typeof TELAS_GOLIVE)[number]["to"];
  rotuloGoLive: string;
  secao?: SecaoFicha;
  atencao?: string | null;
};

const norm = (v: unknown) => String(v ?? "").toLowerCase();
const ASSINADO = ["signed", "assinado", "assinada", "ativo", "vigente"];
const ABERTA = ["aberta", "vencida", "open", "overdue", "emitida", "pendente"];
const PAGA = ["paga", "paid", "quitada"];
const CONCLUIDA = ["concluida", "concluída", "done", "aprovada", "entregue", "fechada", "cancelada"];

function semRegistro(n: number) {
  return n === 0 ? "0 · sem registro ainda" : n;
}

function dinheiro(valor: number, moeda?: string | null) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda || "BRL" }).format(valor);
  } catch {
    return valor.toFixed(2);
  }
}

/** Pura (testável): monta os 8 cards a partir dos dados do GoLive do caso. */
export function montarCardsVida(d: Encontrado): CardVida[] {
  const lead = d.lead as Record<string, unknown> | null | undefined;
  const contratos = d.contratos ?? [];
  const assinados = contratos.filter((c) => c.assinadoEm || ASSINADO.includes(norm(c.status))).length;
  const faturas = d.faturas ?? [];
  const abertas = faturas.filter((f) => ABERTA.includes(norm(f.status)));
  const pagas = faturas.filter((f) => PAGA.includes(norm(f.status)));
  const emAberto = abertas.reduce((s, f) => s + (Number(f.valor) || 0) - (Number(f.valorPago) || 0), 0);
  const achados = d.achados ?? [];
  const validados = achados.filter((a) => a.validadoEm || norm(a.validacao).startsWith("valid")).length;
  const micro = d.microentregas ?? [];
  const microAbertas = micro.filter((m) => !m.concluidaEm && !CONCLUIDA.includes(norm(m.status))).length;
  const tarefas = d.tarefas ?? [];
  const tarefasAbertas = tarefas.filter((t) => !CONCLUIDA.includes(norm(t.status))).length;
  const bloqueadas = tarefas.filter((t) => t.bloqueio).length;
  const projecoes = d.projecoesEstados ?? [];
  const pendentesApp = projecoes.filter((p) => ["rascunho", "pendente", "em_revisao", "aguardando"].includes(norm(p.estado))).length;
  const propostas = d.propostas ?? [];
  const aprovadas = propostas.filter((p) => p.aprovadaEm || norm(p.status).startsWith("aprov")).length;
  const documentos = d.documentos ?? [];

  return [
    {
      id: "lead",
      titulo: "Lead & Discovery",
      linhas: [
        { rotulo: "Etapa", valor: (lead?.["estagio"] as string) || "Sem lead vinculado" },
        { rotulo: "Origem", valor: (lead?.["origem"] as string) || "Não registrada" },
        { rotulo: "Call", valor: lead?.["callRealizada"] ? "Realizada" : lead?.["callAgendada"] ? "Agendada" : "Sem call registrada" },
      ],
      golive: "/golive/comercial",
      rotuloGoLive: "Comercial no GoLive",
    },
    {
      id: "pessoas",
      titulo: "Pessoa & Família",
      linhas: [
        { rotulo: "Pessoas no caso", valor: semRegistro((d.pessoas ?? []).length) },
        { rotulo: "Dependentes", valor: semRegistro((d.dependentes ?? []).length) },
        { rotulo: "Consentimentos", valor: semRegistro((d.consentimentos ?? []).length) },
      ],
      golive: "/golive/pessoas",
      rotuloGoLive: "Pessoas & Famílias no GoLive",
      secao: "pessoas",
    },
    {
      id: "pesquisa",
      titulo: "Pesquisa & Evidências",
      linhas: [
        { rotulo: "Hipóteses", valor: semRegistro((d.hipoteses ?? []).length) },
        { rotulo: "Evidências", valor: semRegistro((d.evidencias ?? []).length) },
        { rotulo: "Achados validados", valor: `${validados} de ${achados.length}` },
      ],
      golive: "/golive/pesquisa",
      rotuloGoLive: "Pesquisa no GoLive",
      secao: "tecnico",
    },
    {
      id: "contrato",
      titulo: "Proposta & Contrato",
      linhas: [
        { rotulo: "Propostas", valor: propostas.length ? `${propostas.length} · ${aprovadas} aprovada(s)` : semRegistro(0) },
        { rotulo: "Contratos", valor: contratos.length ? `${contratos.length} · ${assinados} assinado(s)` : semRegistro(0) },
        { rotulo: "Ordens de serviço", valor: semRegistro((d.ordensServico ?? []).length) },
      ],
      golive: "/golive/formalizacao",
      rotuloGoLive: "Formalização no GoLive",
      secao: "comercial",
      atencao: contratos.length > 0 && assinados === 0 ? "Contrato ainda sem assinatura" : null,
    },
    {
      id: "financeiro",
      titulo: "Financeiro",
      linhas: [
        { rotulo: "Faturas", valor: semRegistro(faturas.length) },
        { rotulo: "Pagas", valor: pagas.length },
        { rotulo: "Em aberto", valor: abertas.length ? `${abertas.length} · ${dinheiro(emAberto)}` : 0 },
      ],
      golive: "/golive/financeiro",
      rotuloGoLive: "Financeiro no GoLive",
      secao: "financeiro",
      atencao: abertas.some((f) => norm(f.status) === "vencida") ? "Há fatura vencida" : null,
    },
    {
      id: "entregas",
      titulo: "Entregas & Documentos",
      linhas: [
        { rotulo: "Microentregas abertas", valor: `${microAbertas} de ${micro.length}` },
        { rotulo: "Documentos", valor: semRegistro(documentos.length) },
        { rotulo: "Liberados ao cliente", valor: documentos.filter((x) => x.liberadoCliente).length },
      ],
      golive: "/golive/microentregas",
      rotuloGoLive: "Microentregas no GoLive",
      secao: "documentos",
    },
    {
      id: "app",
      titulo: "App Cliente",
      linhas: [
        { rotulo: "Publicado no App", valor: semRegistro((d.publicados ?? []).length) },
        { rotulo: "Aguardando revisão", valor: pendentesApp },
      ],
      golive: "/golive/app",
      rotuloGoLive: "App Cliente no GoLive",
    },
    {
      id: "proxima",
      titulo: "Próxima ação & Operação",
      linhas: [
        { rotulo: "Próxima ação", valor: d.caso.proximaAcao || "Sem próxima ação definida" },
        { rotulo: "Tarefas abertas", valor: tarefasAbertas },
        { rotulo: "Bloqueadas", valor: bloqueadas },
      ],
      golive: "/golive/kanban",
      rotuloGoLive: "Kanban no GoLive",
      secao: "jornada",
      atencao: !d.caso.proximaAcao ? "Caso sem próxima ação" : bloqueadas ? "Há tarefa bloqueada" : null,
    },
  ];
}

export function CardsVidaDoCliente({
  casoId,
  aoAbrirFicha,
}: {
  casoId: string;
  aoAbrirFicha: (secao: SecaoFicha | null) => void;
}) {
  const { data, isPending, error } = useGoLive(casoId);

  if (isPending) return <p className="text-sm text-navy/60">Carregando o resumo da vida do cliente…</p>;
  if (error || !data || !data.encontrado) {
    return (
      <p className="rounded-lg border border-dashed border-navy/20 bg-card p-4 text-sm text-navy/70">
        Não foi possível montar o resumo deste caso agora.{" "}
        <button type="button" className="underline" onClick={() => aoAbrirFicha(null)}>
          Abrir a ficha operacional completa
        </button>
      </p>
    );
  }

  const cards = montarCardsVida(data);
  return (
    <section aria-label="Resumo da vida do cliente" data-caso360-cards-vida className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-terracotta">Caso 360 · visão macro</p>
          <h2 className="font-serif text-xl text-navy">Resumo da vida do cliente</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/golive"
            search={{ casoId }}
            className="rounded-lg bg-navy px-3 py-2 text-sm text-cream hover:bg-navy/90"
          >
            Vida completa no GoLive
          </Link>
          <button
            type="button"
            onClick={() => aoAbrirFicha(null)}
            className="rounded-lg border border-navy/20 px-3 py-2 text-sm text-navy hover:bg-navy/5"
          >
            Ficha operacional completa
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <CaCard key={c.id} className="flex h-full flex-col" eyebrow="Vida do cliente" titulo={c.titulo}>
            <dl className="space-y-1.5 text-sm" data-card-vida={c.id}>
              {c.linhas.map((l) => (
                <div key={l.rotulo} className="flex items-baseline justify-between gap-3">
                  <dt className="text-navy/60">{l.rotulo}</dt>
                  <dd className="text-right font-medium text-navy">{l.valor}</dd>
                </div>
              ))}
            </dl>
            {c.atencao ? (
              <p className="mt-3 rounded-md bg-critico-suave px-2 py-1 text-xs text-terracotta">{c.atencao}</p>
            ) : null}
            <div className="mt-auto flex flex-wrap gap-3 pt-4 text-xs">
              <Link
                to={c.golive}
                search={{ casoId }}
                className="font-medium text-navy underline decoration-gold underline-offset-4"
              >
                {c.rotuloGoLive}
              </Link>
              {c.secao ? (
                <button
                  type="button"
                  onClick={() => aoAbrirFicha(c.secao ?? null)}
                  className="text-navy/60 underline decoration-navy/20 underline-offset-4 hover:text-navy"
                >
                  Detalhe na ficha
                </button>
              ) : null}
            </div>
          </CaCard>
        ))}
      </div>
    </section>
  );
}
