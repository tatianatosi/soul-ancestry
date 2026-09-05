import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import {
  ACESSOS,
  agruparCatalogo,
  AVISO_CATALOGO,
  CRITERIOS_MATRIZ,
  ESTAGIOS,
  MODOS_USO,
  NIVEIS_FONTE,
  pendenciasGovernanca,
  permiteConsultaAutomatica,
  PRIORIDADES,
  rotuloDe,
  SCRAPING_STATUS,
  STATUS_BACKLOG,
  STATUS_DOCUMENTACAO,
  STATUS_INTEGRACAO,
  type Fonte,
} from "@/lib/fontes-genealogicas";
import { painelFontes, salvarFonte } from "@/lib/fontes-genealogicas.functions";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const Route = createFileRoute("/_authenticated/fontes-genealogicas")({
  head: () => ({
    meta: [
      { title: "Fontes e Integrações Genealógicas — Clube Ancestral" },
      {
        name: "description",
        content: "Catálogo interno de bases genealógicas, matriz de avaliação e backlog de ativação, sem qualquer consulta externa.",
      },
      { property: "og:title", content: "Fontes e Integrações Genealógicas — Clube Ancestral" },
      { property: "og:description", content: "Governança documental de fontes: maturidade, termos, risco e próximos passos internos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => <p className="p-6 text-sm text-terracotta">Não foi possível abrir o catálogo: {error.message}</p>,
  notFoundComponent: () => <p className="p-6 text-sm text-navy/70">Catálogo não encontrado.</p>,
  component: FontesGenealogicas,
});

function Campo({ r, v }: { r: string; v: React.ReactNode }) {
  return (
    <p className="text-[11px] text-navy/60">
      <span className="uppercase tracking-wide text-navy/40">{r}: </span>
      {v ?? "—"}
    </p>
  );
}

function Secao({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-navy/10 bg-cream/40 p-4">
      <h2 className="font-serif text-base text-navy">{titulo}</h2>
      {subtitulo && <p className="mb-3 text-[11px] text-navy/50">{subtitulo}</p>}
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}

function EditarFonte({ fonte, onSalvo }: { fonte: Fonte; onSalvo: () => void }) {
  const [form, setForm] = useState({
    status_documentacao: fonte.status_documentacao ?? "",
    status_integracao: fonte.status_integracao ?? "",
    scraping_status: fonte.scraping_status ?? "",
    ultima_verificacao: fonte.ultima_verificacao ?? "",
    responsavel_revisao: fonte.responsavel_revisao ?? "",
    proxima_acao: fonte.proxima_acao ?? "",
    observacao_risco: fonte.observacao_risco ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const salvarFn = useServerFn(salvarFonte);
  const m = useMutation({
    mutationFn: () => salvarFn({ data: { id: fonte.id, valores: form } }),
    onSuccess: () => {
      setErro(null);
      onSalvo();
    },
    onError: (e: Error) => setErro(e.message),
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const cls = "w-full rounded border border-navy/15 px-2 py-1 text-[11px]";

  return (
    <div className="sm:col-span-2 space-y-2 rounded border border-gold/40 bg-gold/5 p-3">
      {erro ? <p className="text-[11px] text-terracotta">{erro}</p> : null}
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Documentação
          <select className={cls} value={form.status_documentacao} onChange={(e) => set("status_documentacao", e.target.value)}>
            <option value="">—</option>
            {Object.entries(STATUS_DOCUMENTACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Integração
          <select className={cls} value={form.status_integracao} onChange={(e) => set("status_integracao", e.target.value)}>
            <option value="">—</option>
            {Object.entries(STATUS_INTEGRACAO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Scraping
          <select className={cls} value={form.scraping_status} onChange={(e) => set("scraping_status", e.target.value)}>
            <option value="">—</option>
            {Object.entries(SCRAPING_STATUS).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>{rotulo}</option>
            ))}
          </select>
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Última verificação
          <input type="date" className={cls} value={form.ultima_verificacao} onChange={(e) => set("ultima_verificacao", e.target.value)} />
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Responsável pela revisão
          <input className={cls} value={form.responsavel_revisao} onChange={(e) => set("responsavel_revisao", e.target.value)} />
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50">
          Próxima ação
          <input className={cls} value={form.proxima_acao} onChange={(e) => set("proxima_acao", e.target.value)} />
        </label>
        <label className="text-[10px] uppercase tracking-wide text-navy/50 sm:col-span-2">
          Observação de risco
          <textarea className={cls} rows={2} value={form.observacao_risco} onChange={(e) => set("observacao_risco", e.target.value)} />
        </label>
      </div>
      <button
        type="button"
        disabled={m.isPending}
        onClick={() => m.mutate()}
        className="rounded bg-navy px-3 py-1.5 text-[11px] text-cream disabled:opacity-50"
      >
        {m.isPending ? "Salvando…" : "Salvar"}
      </button>
    </div>
  );
}

function CartaoFonte({ fonte, matriz, backlog, onSalvo }: { fonte: Fonte; matriz: any[]; backlog: any[]; onSalvo: () => void }) {
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const consulta = permiteConsultaAutomatica(fonte);
  const pendencias = pendenciasGovernanca(fonte);

  return (
    <article className="rounded-md border border-navy/10 bg-background p-3">
      <button type="button" onClick={() => setAberto((v) => !v)} className="flex w-full items-start justify-between gap-3 text-left">
        <span>
          <span className="block text-sm font-medium text-navy">{fonte.nome}</span>
          <span className="block text-[11px] text-navy/50">
            {fonte.pais_eixo} · {rotuloDe(NIVEIS_FONTE as any, fonte.nivel_de_fonte)} · {rotuloDe(ESTAGIOS as any, fonte.estagio_maturidade)}
          </span>
        </span>
        <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
          {rotuloDe(PRIORIDADES as any, fonte.prioridade)}
        </span>
      </button>

      {aberto && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Campo r="Tipo de acervo" v={fonte.tipo_de_acervo} />
            <Campo r="Cobertura temporal" v={fonte.cobertura_temporal} />
            <Campo r="Cobertura geográfica" v={fonte.cobertura_geografica} />
            <Campo r="Acesso" v={rotuloDe(ACESSOS as any, fonte.acesso)} />
            <Campo r="Custo" v={fonte.custo} />
            <Campo r="Autenticação necessária" v={fonte.autenticacao_necessaria ? "Sim" : "Não"} />
            <Campo r="Trata dados pessoais" v={fonte.trata_dados_pessoais ? "Sim" : "Não"} />
            <Campo r="Licença / termos" v={fonte.licenca_termos} />
            <Campo r="Referência interna" v={fonte.url_referencia_interna} />
          </div>
          <div className="space-y-1">
            <Campo r="Modo de uso permitido" v={rotuloDe(MODOS_USO as any, fonte.modo_de_uso_permitido)} />
            <Campo r="Scraping" v={rotuloDe(SCRAPING_STATUS as any, fonte.scraping_status)} />
            <Campo r="Documentação" v={rotuloDe(STATUS_DOCUMENTACAO as any, fonte.status_documentacao)} />
            <Campo r="Integração" v={rotuloDe(STATUS_INTEGRACAO as any, fonte.status_integracao)} />
            <Campo r="Risco" v={fonte.risco} />
            <Campo r="Observação de risco" v={fonte.observacao_risco} />
            <Campo r="Uso recomendado" v={fonte.uso_recomendado} />
            <Campo r="Última verificação" v={fonte.ultima_verificacao} />
            <Campo r="Responsável pela revisão" v={fonte.responsavel_revisao} />
            <Campo r="Próxima ação" v={fonte.proxima_acao} />
          </div>

          <div className="sm:col-span-2 rounded border border-terracotta/30 bg-terracotta/5 p-2 text-[11px] text-navy/70">
            Consulta automática: indisponível. {consulta.motivo}
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setEditando((v) => !v)}
              className="rounded border border-navy/20 px-2 py-1 text-[11px] text-navy hover:border-gold"
            >
              {editando ? "Fechar edição" : "Editar"}
            </button>
          </div>
          {editando ? (
            <EditarFonte
              fonte={fonte}
              onSalvo={() => {
                setEditando(false);
                onSalvo();
              }}
            />
          ) : null}

          {pendencias.length > 0 && (
            <div className="sm:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-navy/40">Pendências de governança</p>
              <ul className="mt-1 list-disc pl-4 text-[11px] text-navy/70">
                {pendencias.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-navy/40">Matriz de avaliação</p>
            {matriz.length === 0 ? (
              <p className="text-[11px] text-navy/50">Sem avaliação registrada.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-[11px] text-navy/70">
                {matriz.map((m) => (
                  <li key={m.id}>
                    <strong>{rotuloDe(CRITERIOS_MATRIZ as any, m.criterio)}</strong> · nota {m.nota ?? "—"}
                    {m.bloqueante ? " · bloqueante" : ""} — {m.parecer_interno ?? "sem parecer"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="sm:col-span-2">
            <p className="text-[11px] uppercase tracking-wide text-navy/40">Backlog de ativação</p>
            {backlog.length === 0 ? (
              <p className="text-[11px] text-navy/50">Sem ações internas planejadas.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-[11px] text-navy/70">
                {backlog.map((b) => (
                  <li key={b.id}>
                    {b.acao_interna} · {rotuloDe(STATUS_BACKLOG as any, b.status)} · prazo {b.prazo ?? "—"} · requer aprovação humana
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function FontesGenealogicas() {
  const carregar = useServerFn(painelFontes);
  const qc = useQueryClient();
  const { data, isPending, error, refetch } = useQuery({ queryKey: ["g08-fontes"], queryFn: () => carregar({} as never) });
  const onSalvo = () => void qc.invalidateQueries({ queryKey: ["g08-fontes"] });

  const grupos = useMemo(() => agruparCatalogo(data?.fontes ?? []), [data]);
  const matrizPor = (id: string) => (data?.matriz ?? []).filter((m: any) => m.source_id === id);
  const backlogPor = (id: string) => (data?.backlog ?? []).filter((b: any) => b.source_id === id);

  if (isPending) return <p className="p-6 text-sm text-navy/60">Carregando catálogo interno…</p>;
  if (error)
    return (
      <p className="flex flex-wrap items-center gap-3 p-6 text-sm text-terracotta">
        {(error as Error).message}
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-md border border-terracotta/50 px-2 py-1 text-xs font-medium text-terracotta hover:bg-terracotta/10"
        >
          Tentar novamente
        </button>
      </p>
    );

  const render = (lista: Fonte[]) =>
    lista.length === 0 ? (
      <p className="text-[11px] text-navy/50">Nenhuma fonte nesta lista.</p>
    ) : (
      lista.map((f) => <CartaoFonte key={f.id} fonte={f} matriz={matrizPor(f.id)} backlog={backlogPor(f.id)} onSalvo={onSalvo} />)
    );

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 className="font-serif text-xl text-navy">Fontes e Integrações Genealógicas</h1>
        <p className="rounded border border-gold/40 bg-gold/10 p-2 text-[11px] text-navy/70">{AVISO_CATALOGO}</p>
        <p className="text-[11px] text-navy/50">
          {grupos.total} fontes catalogadas · {grupos.recomendaveis.length} recomendáveis · {grupos.termosAConfirmar.length} com termos a
          confirmar · {grupos.bloqueadas.length} restritas ou descontinuadas
        </p>
      </header>

      <Secao titulo="Recomendáveis para uso operacional" subtitulo="Documentadas, sem termos pendentes e nunca restritas ou descontinuadas.">
        {render(grupos.recomendaveis)}
      </Secao>

      <Secao titulo="Termos a confirmar" subtitulo="Não avançam para piloto nem homologação até parecer jurídico registrado.">
        {render(grupos.termosAConfirmar)}
      </Secao>

      <Secao titulo="Risco alto ou crítico" subtitulo="Exigem observação de risco e revisão antes de qualquer uso.">
        {render(grupos.riscoAlto)}
      </Secao>

      <Secao titulo="Restritas e descontinuadas" subtitulo="Nunca aparecem como recomendação operacional nem em sugestão de pesquisa.">
        {render(grupos.bloqueadas)}
      </Secao>

      <Secao titulo="Sem verificação registrada" subtitulo="Fonte sem data de última verificação não sustenta decisão operacional.">
        {render(grupos.semVerificacao)}
      </Secao>

      <Secao titulo="Catálogo por estágio de maturidade">
        {grupos.porEstagio
          .filter((g) => g.fontes.length > 0)
          .map((g) => (
            <div key={g.estagio} className="space-y-2">
              <p className="text-[11px] uppercase tracking-wide text-navy/40">
                {g.rotulo} ({g.fontes.length})
              </p>
              {render(g.fontes)}
            </div>
          ))}
      </Secao>

      <footer className="rounded border border-navy/10 bg-cream/40 p-3 text-[11px] text-navy/60">
        Registro de acesso a fontes existe apenas como estrutura futura: nenhum log é gerado neste corte e tokens, credenciais ou payloads
        brutos são recusados pelo banco. Fonte crua nunca aparece no App Cliente.
      </footer>
    </div>
  );
}
