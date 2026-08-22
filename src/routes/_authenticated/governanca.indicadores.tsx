import { createFileRoute } from "@tanstack/react-router";

import { BACKLOG_POS_MIGRACAO, GATILHOS } from "@/lib/fila-comunicacao";
import {
  DETALHE_INDICADOR,
  INDICADORES,
  REGRAS_INDICADORES,
  ROTULO_STATUS_INDICADOR,
} from "@/lib/indicadores-governanca";

export const Route = createFileRoute("/_authenticated/governanca/indicadores")({
  head: () => ({
    meta: [
      { title: "Indicadores e métricas — Clube Ancestral" },
      {
        name: "description",
        content: "Registro interno de indicadores do Desk: matriz de origem, definição, fonte canônica e telas onde são consumidos.",
      },
      { property: "og:title", content: "Indicadores e métricas — Clube Ancestral" },
      { property: "og:description", content: "Definição e origem de cada indicador operacional do Desk Intelligence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IndicadoresPage,
});

function IndicadoresPage() {
  return (
    <div className="space-y-5 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 className="font-serif text-xl text-navy">Indicadores e métricas</h1>
        <p className="rounded border border-gold/40 bg-gold/10 p-2 text-[11px] text-navy/70">
          Registro de leitura. Não substitui a Biblioteca Mestre nem as Bases Genealógicas: aqui ficam apenas definição, origem e
          destino de uso de cada indicador. Conteúdo interno ao Desk.
        </p>
      </header>

      <section className="overflow-auto rounded-lg border border-navy/10 bg-white">
        <table className="w-full min-w-[1180px] text-left text-xs">
          <thead className="bg-cream/60 text-navy/70">
            <tr>
              <th className="px-3 py-2 font-medium">Código</th>
              <th className="px-3 py-2 font-medium">Indicador</th>
              <th className="px-3 py-2 font-medium">Fórmula</th>
              <th className="px-3 py-2 font-medium">Período</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Fonte canônica</th>
              <th className="px-3 py-2 font-medium">Definição e origem</th>
              <th className="px-3 py-2 font-medium">Consumido em</th>
              <th className="px-3 py-2 font-medium">Tipo de uso</th>
              <th className="px-3 py-2 font-medium">Tela de consumo</th>
              <th className="px-3 py-2 font-medium">Componente</th>
              <th className="px-3 py-2 font-medium">Gatilho de sinal</th>
              <th className="px-3 py-2 font-medium">Ação/rota</th>
            </tr>
          </thead>
          <tbody>
            {INDICADORES.map((i) => {
              const d = DETALHE_INDICADOR[i.codigo];
              const tom =
                d?.status === "apurado"
                  ? "border-navy/20 text-navy"
                  : d?.status === "parcial"
                    ? "border-gold/50 bg-gold/10 text-navy"
                    : "border-terracotta/40 bg-terracotta/5 text-terracotta";
              return (
                <tr key={i.codigo} className="border-t border-navy/10 align-top">
                  <td className="px-3 py-2 font-mono text-[11px] text-navy">{i.codigo}</td>
                  <td className="px-3 py-2 font-medium text-navy">{i.nome}</td>
                  <td className="px-3 py-2 text-navy/70">{d?.formula ?? "—"}</td>
                  <td className="px-3 py-2 text-navy/70">{d?.periodo ?? "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${tom}`}>
                      {d ? ROTULO_STATUS_INDICADOR[d.status] : "—"}
                    </span>
                    {d ? <span className="mt-1 block text-[10px] text-navy/50">{d.condicao_sem_dados}</span> : null}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-navy/70">{i.fonte_canonica}</td>
                  <td className="px-3 py-2 text-navy/70">
                    {i.definicao}
                    <span className="mt-1 block text-[10px] text-navy/45">{i.matriz_origem}</span>
                  </td>
                  <td className="px-3 py-2 text-navy/70">{i.consumido_em.join(" · ")}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {(m?.tipos ?? []).map((t) => (
                        <span
                          key={t}
                          className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${
                            t === "bloqueio"
                              ? "border-terracotta/40 bg-terracotta/5 text-terracotta"
                              : t === "sinal_diario"
                                ? "border-gold/50 bg-gold/10 text-navy"
                                : "border-navy/20 text-navy/70"
                          }`}
                        >
                          {ROTULO_TIPO_USO[t]}
                        </span>
                      ))}
                      {!m ? "—" : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-navy/70">{m?.telas.join(" · ") ?? "—"}</td>
                  <td className="px-3 py-2 text-navy/70">{m?.componente ?? "—"}</td>
                  <td className="px-3 py-2 text-navy/70">{m?.gatilho ?? "—"}</td>
                  <td className="px-3 py-2">
                    {m ? (
                      <Link to={m.rota} className="text-navy underline underline-offset-2">
                        {m.acao}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="rounded-lg border border-navy/10 bg-white p-4">
        <h2 className="font-serif text-base text-navy">Fila humana de comunicação</h2>
        <p className="mt-1 text-[11px] text-navy/60">
          Envio automático desabilitado neste corte: o Desk apenas sugere contato em rascunho, com motivo e prioridade. Aprovação e
          envio são sempre humanos.
        </p>
        <p className="mt-2 rounded border border-terracotta/40 bg-terracotta/5 px-2 py-1 text-[11px] text-terracotta">
          Nenhum botão desta tela envia mensagem. Toda linha nasce como sugestão em rascunho e só sai do Desk por ação manual de
          uma pessoa responsável, registrada em auditoria.
        </p>
        <div className="mt-2 overflow-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-cream/60 text-navy/70">
              <tr>
                <th className="px-3 py-2 font-medium">Gatilho</th>
                <th className="px-3 py-2 font-medium">Motivo declarado</th>
                <th className="px-3 py-2 font-medium">Prioridade</th>
                <th className="px-3 py-2 font-medium">Status da sugestão</th>
                <th className="px-3 py-2 font-medium">Template</th>
                <th className="px-3 py-2 font-medium">Destinatário</th>
                <th className="px-3 py-2 font-medium">Aprovação</th>
                <th className="px-3 py-2 font-medium">Ação manual</th>
              </tr>
            </thead>
            <tbody>
              {GATILHOS.map((g) => (
                <tr key={g.chave} className="border-t border-navy/10 align-top">
                  <td className="px-3 py-2 font-medium text-navy">{g.rotulo}</td>
                  <td className="px-3 py-2 text-navy/70">{g.motivo}</td>
                  <td className="px-3 py-2 text-navy/70">{g.prioridade}</td>
                  <td className="px-3 py-2">
                    <span className="inline-block rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[10px] text-navy">
                      Rascunho — não enviado
                    </span>
                  </td>
                  <td className="px-3 py-2 text-navy/70">Template homologado da Biblioteca de Mensagens</td>
                  <td className="px-3 py-2 text-navy/70">Contato do caso com consentimento válido no canal</td>
                  <td className="px-3 py-2 text-navy/70">Pendente de aprovação humana (admin ou operações)</td>
                  <td className="px-3 py-2 text-navy/70">Copiar texto aprovado e enviar pelo canal, registrando a interação</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wide text-navy/45">Backlog pós-migração (fora deste corte)</p>
        <ul className="mt-1 space-y-1 text-xs text-navy/60">
          {BACKLOG_POS_MIGRACAO.map((b) => (
            <li key={b}>• {b}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-navy/10 bg-cream/40 p-4">
        <h2 className="font-serif text-base text-navy">Regras de uso</h2>
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          {REGRAS_INDICADORES.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

