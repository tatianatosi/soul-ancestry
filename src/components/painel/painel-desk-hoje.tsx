import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { painelHojeDesk } from "@/lib/crm-desk.functions";
import { AREAS_RESPONSAVEIS, EIXO_COMERCIAL, classificarPrazo, listaPrioritaria, rotulo } from "@/lib/crm-desk";

/**
 * Painel Hoje do Desk comercial: filas ordenadas por criticidade e leitura
 * operacional. Somente leitura — nenhuma ação é disparada daqui.
 */
export function PainelDeskHoje() {
  const carregar = useServerFn(painelHojeDesk);
  const q = useQuery({ queryKey: ["painel-desk-hoje"], queryFn: () => carregar(), retry: false });
  const [area, setArea] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [etapa, setEtapa] = useState("");

  if (q.isLoading) return <p className="mt-6 text-sm text-navy/50">Carregando filas do Desk…</p>;
  if (q.isError || !q.data) return null;

  const { filas, metricas } = q.data;
  const responsaveis = Array.from(
    new Set(filas.flatMap((f) => f.itens.map((i) => i.responsavel)).filter(Boolean) as string[]),
  ).sort();
  const priorizada = listaPrioritaria(filas, { area, responsavel, etapa });
  const hoje = new Date().toISOString().slice(0, 10);
  const contagem = priorizada.reduce(
    (acc, i) => {
      acc[classificarPrazo(i.data, hoje).chave] += 1;
      return acc;
    },
    { atrasado: 0, hoje: 0, futuro: 0, sem_data: 0 } as Record<"atrasado" | "hoje" | "futuro" | "sem_data", number>,
  );

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-xl text-navy">Hoje no Desk comercial</h2>
        <Link to="/leads" className="text-xs text-navy/60 underline">
          Abrir CRM de leads
        </Link>
      </div>

      <div className="mb-3 grid gap-2 rounded-xl border border-navy/10 bg-white p-3 sm:grid-cols-3">
        <label className="text-xs text-navy/60">
          Área responsável
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="mt-1 w-full rounded border border-navy/15 bg-white px-2 py-1 text-sm text-navy"
          >
            <option value="">Todas</option>
            {AREAS_RESPONSAVEIS.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-navy/60">
          Responsável nominal
          <select
            value={responsavel}
            onChange={(e) => setResponsavel(e.target.value)}
            className="mt-1 w-full rounded border border-navy/15 bg-white px-2 py-1 text-sm text-navy"
          >
            <option value="">Todos</option>
            {responsaveis.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-navy/60">
          Etapa (eixo comercial)
          <select
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
            className="mt-1 w-full rounded border border-navy/15 bg-white px-2 py-1 text-sm text-navy"
          >
            <option value="">Todas</option>
            {EIXO_COMERCIAL.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link to="/nucleos" className="rounded-md border border-navy/15 px-3 py-1.5 text-navy/70 hover:bg-navy/5">
          Núcleos familiares e dossiê-mãe
        </Link>
      </div>


      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filas.map((f) => (
          <div key={f.chave} className="rounded-xl border border-navy/10 bg-white p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs uppercase tracking-wide text-navy/50">{f.rotulo}</p>
              <span className="font-serif text-2xl text-navy">{f.itens.length}</span>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-navy/60">
              {f.itens.slice(0, 4).map((i) => (
                <li key={`${f.chave}-${i.id}`}>
                  {i.tipo === "caso" ? (
                    <Link to="/casos/$caseId" params={{ caseId: i.id }} className="underline">
                      {i.rotulo}
                    </Link>
                  ) : (
                    <Link to="/leads" className="underline">
                      {i.rotulo}
                    </Link>
                  )}{" "}
                  — {i.detalhe}
                  {i.data ? ` · ${String(i.data).slice(0, 10)}` : ""}
                </li>
              ))}
              {!f.itens.length ? <li>Fila vazia.</li> : null}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-navy/10 bg-white p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-navy/50">
            Lista priorizada por prazo da próxima ação ({priorizada.length})
          </p>
          <p className="text-[11px] text-navy/45">
            {contagem.atrasado} em atraso · {contagem.hoje} para hoje · {contagem.futuro} futuras · {contagem.sem_data} sem prazo
          </p>
        </div>
        <ul className="mt-2 divide-y divide-navy/5 text-xs text-navy/70">
          {priorizada.slice(0, 25).map((i, idx) => {
            const d = i.data ? String(i.data).slice(0, 10) : null;
            const p = classificarPrazo(d, hoje);
            const cor =
              p.chave === "atrasado"
                ? "text-terracotta"
                : p.chave === "hoje"
                  ? "text-navy"
                  : "text-navy/60";
            return (
              <li
                key={`${i.fila}-${i.id}-${idx}`}
                className={`flex flex-wrap items-baseline gap-x-2 py-1.5 ${p.chave === "atrasado" ? "bg-terracotta/5" : ""}`}
              >
                <span className={`font-medium ${cor}`}>{d ?? "sem prazo"}</span>
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                    p.chave === "atrasado" ? "border-terracotta/40 text-terracotta" : "border-navy/15 text-navy/55"
                  }`}
                >
                  {p.rotulo}
                </span>
                <span className="text-navy">{i.rotulo}</span>
                <span className="text-navy/50">· motivo: {i.fila}</span>
                <span className="text-navy/45">· {i.detalhe}</span>
                <span className="text-navy/45">
                  · {i.responsavel ?? "sem responsável"} / {i.area ? rotulo("area_responsavel", i.area) : "sem área"}
                  {i.etapa ? ` / ${rotulo("eixo_comercial", i.etapa)}` : ""}
                </span>
              </li>
            );
          })}
          {!priorizada.length ? <li className="py-1.5">Nada priorizado nos filtros atuais.</li> : null}
        </ul>
      </div>



      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Funil comercial</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {metricas.funil.map((e) => (
              <li key={e.etapa}>
                {e.etapa}: {e.para}/{e.de} {e.taxa === null ? "" : `(${e.taxa}%)`}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Discovery</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            <li>Agendadas: {metricas.calls.agendadas}</li>
            <li>Realizadas: {metricas.calls.realizadas}</li>
            <li>No-show: {metricas.calls.noShow}</li>
            <li>Conversão agendada → realizada: {metricas.calls.conversao === null ? "—" : `${metricas.calls.conversao}%`}</li>
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Higiene operacional</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            <li>Leads sem próxima ação: {metricas.semProximaAcao}</li>
            <li>Follow-ups vencidos: {metricas.followupsVencidos}</li>
            {metricas.pendenciasDocumentais.slice(0, 3).map((p) => (
              <li key={p.chave}>
                Pendência documental — {p.chave}: {p.total}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Leads por origem</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {metricas.porOrigem.slice(0, 6).map((o) => (
              <li key={o.origem}>
                {o.origem}: {o.total}
              </li>
            ))}
            {!metricas.porOrigem.length ? <li>Sem origens registradas.</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Casos por nacionalidade e via</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {metricas.casosPorNacionalidadeVia.slice(0, 6).map((c) => (
              <li key={c.chave}>
                {c.chave}: {c.total}
              </li>
            ))}
            {!metricas.casosPorNacionalidadeVia.length ? <li>Sem casos ativos classificados.</li> : null}
          </ul>
        </div>

        <div className="rounded-xl border border-navy/10 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-navy/50">Entrada de leads</p>
          <ul className="mt-2 space-y-1 text-xs text-navy/60">
            {metricas.entradaMensal.slice(-4).map((m) => (
              <li key={m.periodo}>
                {m.periodo}: {m.total}
              </li>
            ))}
            {metricas.entradaSemanal.slice(-2).map((m) => (
              <li key={m.periodo}>
                Semana {m.periodo}: {m.total}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
