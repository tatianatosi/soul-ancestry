import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Rotulo, Secao, Texto, inputCls } from "@/components/caso/campos";
import {
  EVENTOS_FUNIL,
  ROTULO_EVENTO,
  eventoSensivel,
  proximaAcaoPadrao,
  type ErroCanonico,
  type EventoFunil,
} from "@/lib/desk-canonico";
import { registrarEventoFunil } from "@/lib/desk-canonico.functions";

type Vinculo = { contactId?: string | null; opportunityId?: string | null; caseId?: string | null };

/**
 * Botão controlado de evento de funil. Tipo manual, responsável autenticado,
 * data/hora, referência à conversa/evidência e confirmação humana para
 * eventos sensíveis. Não dispara nenhuma ação externa.
 */
export function RegistrarEventoFunil({ vinculo, podeEscrever }: { vinculo: Vinculo; podeEscrever: boolean }) {
  const qc = useQueryClient();
  const registrar = useServerFn(registrarEventoFunil);

  const [tipo, setTipo] = useState<EventoFunil>("lead_qualificado");
  const [ocorreuEm, setOcorreuEm] = useState(() => new Date().toISOString().slice(0, 16));
  const [evidencia, setEvidencia] = useState("");
  const [observacao, setObservacao] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [erros, setErros] = useState<ErroCanonico[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const sensivel = eventoSensivel(tipo);
  const temVinculo = Boolean(vinculo.contactId || vinculo.opportunityId || vinculo.caseId);

  const mut = useMutation({
    mutationFn: () =>
      registrar({
        data: {
          tipo_evento: tipo,
          ocorreu_em: new Date(ocorreuEm).toISOString(),
          evidencia_referencia_interna: evidencia,
          observacao_interna: observacao || null,
          confirmado: sensivel ? confirmado : true,
          contact_id: vinculo.contactId ?? null,
          opportunity_id: vinculo.opportunityId ?? null,
          case_id: vinculo.caseId ?? null,
        },
      }),
    onSuccess: (r) => {
      if (!r.ok) {
        setErros(r.erros as ErroCanonico[]);
        setMsg("Evento recusado: corrija as pendências.");
        return;
      }
      setErros([]);
      setMsg(`Evento registrado. Próxima ação sugerida: ${r.proximaAcao}. Nenhum ato externo foi criado.`);
      setEvidencia("");
      setObservacao("");
      setConfirmado(false);
      void qc.invalidateQueries({ queryKey: ["eventos-funil"] });
      void qc.invalidateQueries({ queryKey: ["oportunidades-canonicas"] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  return (
    <Secao
      titulo="Registrar evento de funil"
      descricao="Somente por ação humana, a partir de conversa ou evidência interna. Aceite verbal e confirmação formal são eventos distintos e não criam contrato, cobrança nem onboarding."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <Rotulo>Evento</Rotulo>
          <select
            className={inputCls}
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as EventoFunil);
              setConfirmado(false);
            }}
          >
            {EVENTOS_FUNIL.map((t) => (
              <option key={t} value={t}>
                {ROTULO_EVENTO[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <Rotulo>Ocorreu em</Rotulo>
          <input
            type="datetime-local"
            className={inputCls}
            value={ocorreuEm}
            onChange={(e) => setOcorreuEm(e.target.value)}
          />
        </label>

        <div className="md:col-span-2">
          <Texto
            label="Referência à conversa ou evidência interna"
            valor={evidencia}
            onChange={setEvidencia}
            ajuda="Obrigatória. Use a referência interna do registro (conversa, print, documento interno)."
          />
        </div>

        <div className="md:col-span-2">
          <Texto label="Observação interna (opcional)" valor={observacao} onChange={setObservacao} area />
        </div>
      </div>

      <p className="mt-3 rounded-lg border border-navy/10 bg-cream/40 px-3 py-2 text-xs text-navy/70">
        Próxima ação derivada: <strong>{proximaAcaoPadrao(tipo)}</strong>. Nenhuma mensagem, cobrança, assinatura ou pesquisa externa é
        disparada.
      </p>

      {sensivel ? (
        <label className="mt-3 flex items-start gap-2 rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
          <input type="checkbox" checked={confirmado} onChange={(e) => setConfirmado(e.target.checked)} />
          <span>
            Confirmo, como responsável, que “{ROTULO_EVENTO[tipo]}” ocorreu e está suportado pela referência interna informada.
          </span>
        </label>
      ) : null}

      {erros.length ? (
        <ul className="mt-3 space-y-1 text-xs text-terracotta">
          {erros.map((e) => (
            <li key={e.campo}>
              <strong>{e.campo}</strong>: {e.mensagem}
            </li>
          ))}
        </ul>
      ) : null}

      {msg ? <p className="mt-3 rounded-lg border border-navy/10 bg-cream/50 px-3 py-2 text-sm text-navy">{msg}</p> : null}

      <button
        type="button"
        className="mt-4 rounded-lg bg-navy px-3 py-2 text-sm text-cream disabled:opacity-40"
        disabled={!temVinculo || mut.isPending || (sensivel && !confirmado)}
        onClick={() => mut.mutate()}
      >
        {mut.isPending ? "Registrando…" : "Registrar evento"}
      </button>
    </Secao>
  );
}
