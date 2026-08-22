import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { statusEnvioRecuperacao } from "@/lib/equipe.functions";

const ACAO_LABEL: Record<string, string> = {
  equipe_recuperacao_solicitada: "Recuperação de senha solicitada",
  equipe_convite_enviado: "Convite enviado",
  equipe_convite_reenviado: "Convite reenviado",
};

const EVENTO_LABEL: Record<string, string> = {
  sent: "Disparado",
  rejected: "Recusado pelo provedor",
  bounced: "Devolvido",
  complained: "Marcado como spam",
  unsubscribed: "Descadastrado",
  suppressed: "Bloqueado por supressão",
  rate_limited: "Adiado por limite de envio",
};

const EVENTO_COR: Record<string, string> = {
  sent: "bg-green-100 text-green-800",
  rejected: "bg-terracotta/15 text-terracotta",
  bounced: "bg-terracotta/15 text-terracotta",
  complained: "bg-terracotta/15 text-terracotta",
  unsubscribed: "bg-navy/10 text-navy/70",
  suppressed: "bg-terracotta/15 text-terracotta",
  rate_limited: "bg-gold/20 text-navy",
};

function dataHora(valor: string) {
  return new Date(valor).toLocaleString("pt-BR");
}

/** Indicador interno de status do envio de recuperação/convite. Não expõe tokens nem URLs. */
export function StatusEnvioRecuperacao() {
  const consultar = useServerFn(statusEnvioRecuperacao);
  const [emailFiltro, setEmailFiltro] = useState("");
  const [emailAplicado, setEmailAplicado] = useState<string>("");

  const [autoAtualizar, setAutoAtualizar] = useState(true);

  const q = useQuery({
    queryKey: ["status-envio-recuperacao", emailAplicado],
    queryFn: () => consultar({ data: emailAplicado ? { email: emailAplicado } : {} }),
    refetchInterval: autoAtualizar ? 20_000 : false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const dados = q.data;
  const ultimaSolicitacao = dados?.solicitacoes?.[0];
  const ultimaEntrega = dados?.entregas?.[0];

  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">Status do envio de recuperação</h2>
          <p className="mt-1 text-sm text-navy/60">
            Confirmação de que o e-mail de recuperação/convite foi disparado. Somente leitura — nenhum token, senha
            ou link é exibido aqui.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-navy/70">
            <input
              type="checkbox"
              checked={autoAtualizar}
              onChange={(e) => setAutoAtualizar(e.target.checked)}
            />
            Atualizar automaticamente (20s)
          </label>
          <button
            onClick={() => q.refetch()}
            disabled={q.isFetching}
            className="rounded-lg border border-navy/20 px-3 py-1.5 text-xs disabled:opacity-50"
          >
            {q.isFetching ? "Atualizando…" : "Atualizar"}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-navy/50">
        {q.dataUpdatedAt ? `Última leitura: ${dataHora(new Date(q.dataUpdatedAt).toISOString())}` : "Sem leitura ainda."}
        {dados?.historicoDesde ? ` · Histórico visível desde ${dataHora(dados.historicoDesde)}` : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="text-sm">
          Filtrar por e-mail
          <input
            type="email"
            value={emailFiltro}
            onChange={(e) => setEmailFiltro(e.target.value)}
            placeholder="pessoa@clubeancestral.com"
            className="mt-1 w-72 max-w-full rounded-lg border border-navy/20 px-3 py-2"
          />
        </label>
        <button
          onClick={() => setEmailAplicado(emailFiltro.trim().toLowerCase())}
          className="rounded-lg bg-navy px-3 py-2 text-xs font-medium text-cream"
        >
          Consultar
        </button>
        {emailAplicado ? (
          <button
            onClick={() => {
              setEmailFiltro("");
              setEmailAplicado("");
            }}
            className="rounded-lg border border-navy/20 px-3 py-2 text-xs"
          >
            Limpar
          </button>
        ) : null}
      </div>


      {q.isLoading ? (
        <p className="mt-4 text-sm text-navy/60">Carregando…</p>
      ) : q.error ? (
        <p className="mt-4 text-sm text-terracotta">{(q.error as Error).message}</p>
      ) : (
        <div className="mt-5 space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-navy/10 bg-cream/40 p-4">
              <p className="text-xs uppercase tracking-wide text-navy/50">Última solicitação registrada</p>
              {ultimaSolicitacao ? (
                <>
                  <p className="mt-1 font-medium">
                    {ACAO_LABEL[ultimaSolicitacao.acao] ?? ultimaSolicitacao.acao}
                  </p>
                  <p className="text-sm text-navy/60">{dataHora(ultimaSolicitacao.criadoEm)}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-navy/60">Nenhuma solicitação registrada.</p>
              )}
            </div>
            <div className="rounded-lg border border-navy/10 bg-cream/40 p-4">
              <p className="text-xs uppercase tracking-wide text-navy/50">Último evento de entrega</p>
              {dados?.canal !== "disponivel" ? (
                <p className="mt-1 text-sm text-navy/60">
                  {dados?.detalheCanal ?? "Eventos de entrega indisponíveis no momento."}
                </p>
              ) : ultimaEntrega ? (
                <>
                  <p className="mt-1 font-medium">
                    {EVENTO_LABEL[ultimaEntrega.event_type] ?? ultimaEntrega.event_type}
                  </p>
                  <p className="text-sm text-navy/60">
                    {ultimaEntrega.recipient} · {dataHora(ultimaEntrega.timestamp)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-navy/60">Nenhum evento de entrega no período visível.</p>
              )}
            </div>
          </div>

          {dados?.entregas?.length ? (
            <div>
              <h3 className="text-sm font-medium">Eventos de entrega recentes</h3>
              <ul className="mt-2 space-y-2">
                {dados.entregas.map((e, i) => (
                  <li
                    key={`${e.timestamp}-${i}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 px-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">{e.recipient}</span>
                    <span className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          EVENTO_COR[e.event_type] ?? "bg-navy/10 text-navy/70"
                        }`}
                      >
                        {EVENTO_LABEL[e.event_type] ?? e.event_type}
                        {e.status ? ` · ${e.status}` : ""}
                      </span>
                      <span className="text-xs text-navy/50">{dataHora(e.timestamp)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {dados?.solicitacoes?.length ? (
            <div>
              <h3 className="text-sm font-medium">Solicitações registradas em auditoria</h3>
              <ul className="mt-2 space-y-2">
                {dados.solicitacoes.map((s: { id: string; acao: string; criadoEm: string }) => (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy/10 px-3 py-2 text-sm"
                  >
                    <span>{ACAO_LABEL[s.acao] ?? s.acao}</span>
                    <span className="text-xs text-navy/50">{dataHora(s.criadoEm)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
