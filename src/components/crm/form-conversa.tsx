import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { Rotulo, Secao, Texto, inputCls } from "@/components/caso/campos";
import { DIRECOES_CONVERSA, ROTULO_CONVERSA, TIPOS_CONVERSA, type ErroCanonico } from "@/lib/desk-canonico";
import { registrarConversa } from "@/lib/desk-canonico.functions";

type Vinculo = { contactId?: string | null; opportunityId?: string | null; caseId?: string | null };

/**
 * Registro interno de conversa. Não envia mensagem, não cria aceite,
 * contrato, cobrança ou onboarding. Conversa gravada é imutável.
 */
export function FormConversa({ vinculo, podeEscrever }: { vinculo: Vinculo; podeEscrever: boolean }) {
  const qc = useQueryClient();
  const registrar = useServerFn(registrarConversa);

  const [tipo, setTipo] = useState<string>("whatsapp_registrado");
  const [direcao, setDirecao] = useState<string>("inbound");
  const [ocorreuEm, setOcorreuEm] = useState(() => new Date().toISOString().slice(0, 16));
  const [resumo, setResumo] = useState("");
  const [referencia, setReferencia] = useState("");
  const [proximaAcao, setProximaAcao] = useState("");
  const [prazo, setPrazo] = useState("");
  const [erros, setErros] = useState<ErroCanonico[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const temVinculo = Boolean(vinculo.contactId || vinculo.opportunityId || vinculo.caseId);

  const mut = useMutation({
    mutationFn: () =>
      registrar({
        data: {
          tipo,
          direcao,
          ocorreu_em: new Date(ocorreuEm).toISOString(),
          resumo_validado: resumo,
          referencia_interna: referencia || null,
          proxima_acao: proximaAcao,
          prazo_proxima_acao: prazo,
          contact_id: vinculo.contactId ?? null,
          opportunity_id: vinculo.opportunityId ?? null,
          case_id: vinculo.caseId ?? null,
        },
      }),
    onSuccess: (r) => {
      if (!r.ok) {
        setErros(r.erros as ErroCanonico[]);
        setMsg("Registro recusado: corrija as pendências.");
        return;
      }
      setErros([]);
      setMsg("Conversa registrada. Nenhuma mensagem externa foi enviada.");
      setResumo("");
      setReferencia("");
      setProximaAcao("");
      setPrazo("");
      void qc.invalidateQueries({ queryKey: ["conversas-canonicas"] });
    },
    onError: (e: Error) => setMsg(e.message),
  });

  return (
    <Secao
      titulo="Registrar conversa"
      descricao="WhatsApp, call, reunião, e-mail, transcrição resumida ou nota interna. Registro interno e imutável, sem envio externo."
    >
      {!temVinculo ? (
        <p className="mb-3 rounded-lg border border-terracotta/40 bg-terracotta/5 px-3 py-2 text-xs text-terracotta">
          Selecione um contato, oportunidade ou caso antes de registrar a conversa.
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <Rotulo>Tipo</Rotulo>
          <select className={inputCls} value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={!podeEscrever}>
            {TIPOS_CONVERSA.map((t) => (
              <option key={t} value={t}>
                {ROTULO_CONVERSA[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <Rotulo>Direção</Rotulo>
          <select className={inputCls} value={direcao} onChange={(e) => setDirecao(e.target.value)} disabled={!podeEscrever}>
            {DIRECOES_CONVERSA.map((d) => (
              <option key={d} value={d}>
                {d}
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
            disabled={!podeEscrever}
          />
        </label>

        <Texto label="Referência interna (opcional)" valor={referencia} onChange={setReferencia} desabilitado={!podeEscrever} />

        <div className="md:col-span-2">
          <Texto
            label="Resumo validado"
            valor={resumo}
            onChange={setResumo}
            area
            desabilitado={!podeEscrever}
            ajuda="Não registre transcrição bruta, documento, CPF ou conteúdo sensível."
          />
        </div>

        <Texto label="Próxima ação" valor={proximaAcao} onChange={setProximaAcao} desabilitado={!podeEscrever} />
        <Texto label="Prazo da próxima ação" valor={prazo} onChange={setPrazo} tipo="date" desabilitado={!podeEscrever} />
      </div>

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
        disabled={!podeEscrever || !temVinculo || mut.isPending}
        onClick={() => mut.mutate()}
      >
        {mut.isPending ? "Registrando…" : "Registrar conversa"}
      </button>
    </Secao>
  );
}
