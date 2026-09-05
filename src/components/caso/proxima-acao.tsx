import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao, Selecao, Texto, Rotulo, inputCls } from "@/components/caso/campos";
import { aprovarRascunho, atualizarAlerta, registrarProximaAcao } from "@/lib/caso-canonico.functions";
import {
  ALERT_STATUS,
  COMMUNICATION_STATUS,
  PROXIMAS_ACOES,
  SUGGESTED_CHANNEL,
  TARGET_AUDIENCE,
  VISIBILITY,
  mapaDaAcao,
  rotulo,
} from "@/lib/caso-ficha";

type Linha = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const APP_ESTADO: Record<string, string> = {
  bloqueado: "App do cliente permanece bloqueado nesta ação.",
  sanitizado_com_onboarding: "App do cliente mostra conteúdo sanitizado com onboarding.",
  publicado: "App do cliente recebe publicação sanitizada.",
};

/** Próxima ação, destino normativo, alertas internos e rascunhos de comunicação. */
export function AbaProximaAcao({
  caseId,
  caso,
  alertas,
  comunicacoes,
  bloqueado,
  onMudou,
  v,
  set,
}: {
  caseId: string;
  caso: Linha;
  alertas: Linha[];
  comunicacoes: Linha[];
  bloqueado: boolean;
  onMudou: () => void;
  v: (k: string) => string;
  set: (k: string, valor: unknown) => void;
}) {
  const registrar = useServerFn(registrarProximaAcao);
  const mudarAlerta = useServerFn(atualizarAlerta);
  const aprovar = useServerFn(aprovarRascunho);
  const [erro, setErro] = useState<string | null>(null);

  const mapa = mapaDaAcao(v("proxima_acao_codigo"));

  const mRegistrar = useMutation({
    mutationFn: () => registrar({ data: { caseId } }),
    onSuccess: () => {
      setErro(null);
      onMudou();
    },
    onError: (e: unknown) => setErro(e instanceof Error ? e.message : "Falha ao registrar a próxima ação."),
  });

  const mAlerta = useMutation({
    mutationFn: (p: { id: string; status: string }) => mudarAlerta({ data: p }),
    onSuccess: () => onMudou(),
  });

  return (
    <div className="space-y-5">
      {erro ? <p className="rounded-lg border border-terracotta/40 bg-terracotta/10 px-3 py-2 text-sm text-navy">{erro}</p> : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <Secao titulo="Próxima ação" descricao="Toda ação tem responsável, prazo e público. Nada é enviado automaticamente.">
          <div className="grid gap-4">
            <Selecao label="Ação" valor={v("proxima_acao_codigo")} opcoes={PROXIMAS_ACOES} onChange={(x) => {
              set("proxima_acao_codigo", x);
              const m = mapaDaAcao(x);
              set("target_audience", m.audience);
              set("visibility", m.visibility);
              set("suggested_channel", m.channel);
            }} desabilitado={bloqueado} />
            <Texto label="Prazo da próxima ação" tipo="date" valor={v("prazo_proxima_acao")} onChange={(x) => set("prazo_proxima_acao", x)} desabilitado={bloqueado} />
            <Texto label="Responsável principal" valor={v("responsavel_principal")} onChange={(x) => set("responsavel_principal", x)} desabilitado={bloqueado} />
            <Selecao label="Público-alvo" valor={v("target_audience")} opcoes={TARGET_AUDIENCE} onChange={(x) => set("target_audience", x)} desabilitado={bloqueado} />
            <Selecao label="Visibilidade" valor={v("visibility")} opcoes={VISIBILITY} onChange={(x) => set("visibility", x)} desabilitado={bloqueado} />
            <Selecao label="Canal sugerido" valor={v("suggested_channel")} opcoes={SUGGESTED_CHANNEL} onChange={(x) => set("suggested_channel", x)} desabilitado={bloqueado} />
            <Texto
              label="Justificativa / detalhe"
              valor={v("proxima_acao_justificativa")}
              onChange={(x) => set("proxima_acao_justificativa", x)}
              desabilitado={bloqueado}
              area
              ajuda={v("proxima_acao_codigo") === "outro_justificar" ? "Obrigatório quando a ação é 'Outro'." : undefined}
            />
          </div>
        </Secao>

        <Secao titulo="Destino normativo da ação" descricao="Regra fixa por ação — evita improviso de canal e de conteúdo.">
          <ul className="space-y-2 text-sm text-navy/80">
            <li>Desk: sempre registra a ação e o alerta interno.</li>
            <li>{APP_ESTADO[mapa.app]}</li>
            <li>{mapa.rascunhoWhatsapp ? "Gera rascunho de mensagem para aprovação humana." : "Não gera rascunho de mensagem externa."}</li>
            <li>Público normativo: {rotulo(TARGET_AUDIENCE, mapa.audience)}</li>
            <li>Visibilidade normativa: {rotulo(VISIBILITY, mapa.visibility)}</li>
            <li>Canal normativo: {rotulo(SUGGESTED_CHANNEL, mapa.channel)}</li>
          </ul>
          <div className="mt-4 rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-navy">
            Salve as alterações do caso antes de registrar. O registro cria alerta interno e, quando previsto, rascunho de comunicação —
            nunca um envio externo.
          </div>
          <button
            onClick={() => mRegistrar.mutate()}
            disabled={bloqueado || mRegistrar.isPending}
            className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm text-cream disabled:opacity-40"
          >
            Registrar próxima ação e alerta
          </button>
          <p className="mt-3 text-xs text-navy/55">
            Alerta atual: {rotulo(ALERT_STATUS, caso["alert_status"])} · Comunicação: {rotulo(COMMUNICATION_STATUS, caso["communication_status"])}
          </p>
        </Secao>
      </div>

      <Secao titulo="Alertas internos" descricao="Alertas são internos e nunca aparecem para o cliente.">
        {alertas.length === 0 ? (
          <p className="text-sm text-navy/55">Nenhum alerta registrado.</p>
        ) : (
          <ul className="space-y-3">
            {alertas.map((a) => (
              <li key={a.id} className="rounded-lg border border-navy/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-navy">{a.titulo}</p>
                  <span className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo(ALERT_STATUS, a.status)}</span>
                </div>
                <p className="mt-1 text-xs text-navy/60">{a.detalhe}</p>
                <p className="mt-1 text-xs text-navy/45">
                  Prazo: {a.due_at ? new Date(a.due_at).toLocaleDateString("pt-BR") : "—"} · Criado em{" "}
                  {new Date(a.triggered_at).toLocaleString("pt-BR")}
                </p>
                {!bloqueado && a.status !== "completed" ? (
                  <div className="mt-2 flex gap-2 text-xs">
                    <button className="rounded-md border border-navy/15 px-2 py-1" onClick={() => mAlerta.mutate({ id: a.id, status: "acknowledged" })}>
                      Marcar ciente
                    </button>
                    <button className="rounded-md border border-navy/15 px-2 py-1" onClick={() => mAlerta.mutate({ id: a.id, status: "completed" })}>
                      Concluir
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Secao>

      <Secao titulo="Rascunhos de comunicação" descricao="Rascunho é interno. Aprovação registra a decisão; esta entrega não envia mensagens.">
        {comunicacoes.length === 0 ? (
          <p className="text-sm text-navy/55">Nenhum rascunho criado.</p>
        ) : (
          comunicacoes.map((c) => <Rascunho key={c.id} item={c} bloqueado={bloqueado} aprovar={aprovar} onMudou={onMudou} />)
        )}
      </Secao>
    </div>
  );
}

function Rascunho({
  item,
  bloqueado,
  aprovar,
  onMudou,
}: {
  item: Linha;
  bloqueado: boolean;
  aprovar: (a: { data: { id: string; corpo?: string } }) => Promise<unknown>;
  onMudou: () => void;
}) {
  const [corpo, setCorpo] = useState(String(item.corpo_rascunho ?? ""));
  const m = useMutation({
    mutationFn: () => aprovar({ data: { id: String(item.id), corpo } }),
    onSuccess: () => onMudou(),
  });
  const aprovado = item.status === "approved" || item.status === "sent";

  return (
    <div className="mb-4 rounded-lg border border-navy/10 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-navy">{item.assunto ?? "Rascunho"}</p>
        <span className="text-[11px] uppercase tracking-wide text-navy/50">{rotulo(COMMUNICATION_STATUS, item.status)}</span>
      </div>
      <p className="mt-1 text-xs text-navy/50">
        Público: {rotulo(TARGET_AUDIENCE, item.target_audience)} · Canal: {rotulo(SUGGESTED_CHANNEL, item.suggested_channel)}
      </p>
      <div className="mt-2">
        <Rotulo>Texto do rascunho</Rotulo>
        <textarea className={inputCls} rows={4} value={corpo} disabled={bloqueado}
          title={aprovado ? "Rascunho já aprovado — nova edição registra alteração." : undefined} onChange={(e) => setCorpo(e.target.value)} />
      </div>
      {!aprovado ? (
        <button
          onClick={() => m.mutate()}
          disabled={bloqueado || m.isPending}
          className="mt-2 rounded-lg border border-gold/50 px-3 py-1.5 text-xs text-navy disabled:opacity-40"
        >
          Aprovar rascunho (sem envio)
        </button>
      ) : (
        <p className="mt-2 text-xs text-navy/55">Aprovado em {item.approved_at ? new Date(item.approved_at).toLocaleString("pt-BR") : "—"}. Envio externo fora do escopo desta entrega.</p>
      )}
    </div>
  );
}
