import { AlertTriangle, Building2, CalendarDays, CheckCircle2, Clock3, FileClock, Landmark, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const ACOES = [
  {
    id: "DEV-PA-001",
    titulo: "Confirmar referência do registro civil de Pistoia",
    instituicao: "Comune di Pistoia — Stato Civile",
    pessoa: "Ascendente · 4ª geração",
    status: "Aguardando resposta",
    prazo: "Hoje",
    prioridade: "Crítica",
    proxima: "Rechecagem interna em 22/08/2026",
  },
  {
    id: "DEV-PA-002",
    titulo: "Conferir índice do acervo diocesano",
    instituicao: "Archivio Diocesano di Pistoia",
    pessoa: "Linha paterna · 5ª geração",
    status: "Planejada",
    prazo: "24/08/2026",
    prioridade: "Alta",
    proxima: "Preparar consulta, sem envio",
  },
  {
    id: "DEV-PA-003",
    titulo: "Revisar grafias e datas correlatas",
    instituicao: "Acervo interno",
    pessoa: "Núcleo Melani",
    status: "Em revisão",
    prazo: "26/08/2026",
    prioridade: "Média",
    proxima: "Validação humana das referências",
  },
] as const;

const VISAO = [
  ["Urgente hoje", "1", AlertTriangle],
  ["Esta semana", "3", CalendarDays],
  ["Aguardando resposta", "1", Clock3],
  ["Rechecagens vencidas", "1", FileClock],
  ["Ações por instituição", "2", Building2],
  ["Pendências por pessoa / geração", "2", Users],
  ["Estimativas de terceiros", "2", Landmark],
  ["Histórico", "1", CheckCircle2],
] as const;

export function PlanoAcaoDemo() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-gold">Pesquisa genealógica e evidências</p>
          <h1 className="font-serif text-3xl italic text-navy">Plano de ação de pesquisa</h1>
          <p className="mt-1 text-[13px] text-navy/70">Caso Melani · fila interna de desenvolvimento</p>
        </div>
        <span className="rounded-full border border-terracotta/40 bg-terracotta/10 px-3 py-1 text-[11px] font-semibold uppercase text-terracotta">
          Fixture de desenvolvimento
        </span>
      </header>

      <p className="border-l-4 border-gold bg-gold/10 px-4 py-3 text-xs text-navy/75">
        Nenhum contato, pedido externo, despesa, cobrança ou mensagem é executado nesta visão. Comunicações permanecem em rascunho e exigem aprovação humana.
      </p>

      <section aria-labelledby="visoes-plano">
        <h2 id="visoes-plano" className="mb-3 font-serif text-xl text-navy">Visões operacionais</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {VISAO.map(([rotulo, total, Icon], index) => (
            <div key={rotulo} className="flex min-h-20 items-center gap-3 rounded-lg border border-border bg-white p-3">
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-md", index === 0 ? "bg-terracotta text-cream" : "bg-navy text-cream")}>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-navy">{total}</p>
                <p className="text-xs leading-tight text-navy/65">{rotulo}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="fila-plano">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="fila-plano" className="font-serif text-xl text-navy">Urgente hoje e esta semana</h2>
            <p className="text-xs text-navy/55">Responsável: Tatiana Melani Tosi</p>
          </div>
          <span className="text-[11px] uppercase text-navy/45">3 ações abertas</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {ACOES.map((acao) => (
            <article key={acao.id} className="rounded-lg border border-navy/10 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] text-navy/45">{acao.id}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", acao.prioridade === "Crítica" ? "bg-terracotta/15 text-terracotta" : "bg-gold/15 text-navy")}>
                  {acao.prioridade}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-navy">{acao.titulo}</h3>
              <dl className="mt-3 space-y-2 text-xs text-navy/65">
                <div><dt className="inline font-semibold text-navy">Instituição: </dt><dd className="inline">{acao.instituicao}</dd></div>
                <div><dt className="inline font-semibold text-navy">Pessoa / geração: </dt><dd className="inline">{acao.pessoa}</dd></div>
                <div><dt className="inline font-semibold text-navy">Estado: </dt><dd className="inline">{acao.status}</dd></div>
                <div><dt className="inline font-semibold text-navy">Prazo: </dt><dd className="inline">{acao.prazo}</dd></div>
              </dl>
              <p className="mt-3 border-t border-border pt-3 text-xs text-navy/75"><strong>Próxima ação:</strong> {acao.proxima}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-white p-4">
          <h2 className="font-serif text-lg text-navy">Estimativas de terceiros aguardando aprovação</h2>
          <ul className="mt-3 divide-y divide-border text-xs text-navy/70">
            <li className="py-2"><strong>Busca documental em Pistoia</strong><br />EUR 35–70 · informação institucional · pagador a definir</li>
            <li className="py-2"><strong>Cópia integral de registro</strong><br />EUR 18–32 · tabela publicada · cliente</li>
          </ul>
          <p className="mt-2 text-[11px] text-navy/50">Previsões internas; não são cobrança, receita, reembolso ou despesa executada.</p>
        </section>
        <section className="rounded-lg border border-border bg-white p-4">
          <h2 className="font-serif text-lg text-navy">Histórico</h2>
          <div className="mt-3 flex gap-3 text-xs text-navy/70">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" />
            <p><strong>Referências iniciais organizadas</strong><br />Concluída em 21/08/2026 · registro interno imutável</p>
          </div>
        </section>
      </div>
    </div>
  );
}