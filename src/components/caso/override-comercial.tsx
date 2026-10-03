/**
 * Corte ÓRFÃOS onda 5 (03/10/2026) — override comercial da Proprietária.
 *
 * Os três escritores (`registrarOverrideComercial`, `revogarOverrideComercial`,
 * `listarOverridesComerciais`) existiam, com validação e CHECK corrigido em
 * 05/09, e **zero chamador de UI**: a exceção da Proprietária só podia ser
 * registrada por SQL — exatamente o contrário do que a política de autoridade
 * operacional pede ("override da proprietária permanece com motivo e
 * owner_override_events").
 *
 * A exceção nunca efetiva nada sobre dado real: `owner_override_events` é
 * append-only e a ativação continua decidida pelo gate do banco. O registro é
 * o que autoriza as telas internas a mostrarem "liberado por exceção" naquele
 * escopo — e só nele.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { EstadoDados } from "@/components/saas/estado-dados";
import {
  ESCOPOS_LIBERAVEIS,
  ROTULO_ESTADO_OVERRIDE,
  TIPOS_OVERRIDE,
  type TipoOverride,
} from "@/lib/override-proprietaria-comercial";
import {
  listarOverridesComerciais,
  registrarOverrideComercial,
  revogarOverrideComercial,
} from "@/lib/override-proprietaria-comercial.functions";

export function OverrideComercial({ caseId }: { caseId: string }) {
  const carregar = useServerFn(listarOverridesComerciais);
  const registrar = useServerFn(registrarOverrideComercial);
  const revogar = useServerFn(revogarOverrideComercial);
  const qc = useQueryClient();
  const chave = ["overrides-comerciais", caseId];
  const q = useQuery({ queryKey: chave, queryFn: () => carregar({ data: { casoId: caseId } }), retry: false });

  const [tipo, setTipo] = useState<TipoOverride>("iniciar_antes_pagamento");
  const [objeto, setObjeto] = useState("");
  const [condicao, setCondicao] = useState("");
  const [gate, setGate] = useState("");
  const [gateMotivo, setGateMotivo] = useState("");
  const [escopos, setEscopos] = useState<string[]>([]);
  const [justificativa, setJustificativa] = useState("");
  const [dataRevisao, setDataRevisao] = useState("");
  const [motivoRevogacao, setMotivoRevogacao] = useState("");

  const disponiveis = ESCOPOS_LIBERAVEIS[tipo] ?? [];

  const faltando =
    !objeto.trim()
      ? "Informe o objeto afetado."
      : !condicao.trim()
        ? "Declare a condição original que a exceção supera."
        : !gate.trim()
          ? "Declare ao menos um gate pendente."
          : escopos.length === 0
            ? "Escolha o escopo liberado."
            : justificativa.trim().length < 10
              ? "Justificativa obrigatória."
              : !dataRevisao
                ? "Informe a data de revisão da exceção."
                : null;

  const mRegistrar = useMutation({
    mutationFn: () =>
      registrar({
        data: {
          tipo,
          casoId: caseId,
          objetoAfetado: objeto.trim(),
          condicaoOriginal: condicao.trim(),
          gatesPendentes: [{ chave: gate.trim(), motivo: gateMotivo.trim() || gate.trim() }],
          escopoLiberado: escopos,
          justificativa: justificativa.trim(),
          dataRevisao,
        },
      }),
    onSuccess: () => {
      toast.success("Override registrado e auditado.");
      setObjeto("");
      setCondicao("");
      setGate("");
      setGateMotivo("");
      setEscopos([]);
      setJustificativa("");
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mRevogar = useMutation({
    mutationFn: (eventoOriginalId: string) =>
      revogar({ data: { eventoOriginalId, casoId: caseId, motivo: motivoRevogacao.trim() } }),
    onSuccess: () => {
      toast.success("Override revogado, com motivo registrado.");
      setMotivoRevogacao("");
      void qc.invalidateQueries({ queryKey: chave });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-4" data-override-comercial>
      <h3 className="font-serif text-base text-navy">Exceção da Proprietária (override auditável)</h3>
      <p className="mt-1 text-[11px] text-navy/50">
        A exceção não liga nada no dado real: ela fica registrada, append-only, com a regra que supera, o gate pendente,
        o escopo liberado e a data de revisão. A ativação do caso continua decidida pelo gate do banco. Enviar, assinar,
        cobrar e publicar nunca são liberados por exceção.
      </p>

      <EstadoDados
        carregando={q.isLoading}
        erro={q.error}
        dados={q.data ? [q.data] : undefined}
        aoTentarNovamente={() => void q.refetch()}
        recurso="os overrides deste caso"
      >
        {([lista]) => {
          const overrides = (Array.isArray(lista) ? lista : (lista as any)?.overrides ?? []) as any[];
          return (
            <div className="mt-3 space-y-3">
              {overrides.length > 0 ? (
                <ul className="space-y-1">
                  {overrides.map((o) => (
                    <li key={o.id} className="rounded border border-navy/10 bg-white/60 p-2 text-[11px] text-navy/70">
                      <span className="text-navy">{o.tipo}</span> · {o.objetoAfetado ?? "—"} ·{" "}
                      {ROTULO_ESTADO_OVERRIDE[o.estado as keyof typeof ROTULO_ESTADO_OVERRIDE] ?? o.estado}
                      <br />
                      <span className="text-navy/45">{o.justificativa}</span>
                      {!o.revogadoEm ? (
                        <button
                          type="button"
                          className="ml-1 underline decoration-gold text-[10px] text-navy/50"
                          onClick={() => {
                            if (motivoRevogacao.trim().length < 5) {
                              toast.error("Escreva o motivo da revogação no campo abaixo antes de revogar.");
                              return;
                            }
                            mRevogar.mutate(String(o.id));
                          }}
                        >
                          revogar
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-navy/55">Nenhuma exceção registrada para este caso.</p>
              )}

              <Texto label="Motivo da revogação (usado ao revogar acima)" valor={motivoRevogacao} onChange={setMotivoRevogacao} />

              <div className="grid gap-2 sm:grid-cols-2">
                <Selecao
                  label="Tipo de exceção"
                  valor={tipo}
                  opcoes={TIPOS_OVERRIDE.map((t) => ({ valor: t, rotulo: t.replace(/_/g, " ") }))}
                  onChange={(v) => {
                    setTipo(v as TipoOverride);
                    setEscopos([]);
                  }}
                />
                <Texto label="Objeto afetado" valor={objeto} onChange={setObjeto} />
                <Texto label="Condição original superada" valor={condicao} onChange={setCondicao} />
                <Texto label="Gate pendente (chave)" valor={gate} onChange={setGate} />
                <Texto label="Motivo do gate" valor={gateMotivo} onChange={setGateMotivo} />
                <Texto label="Data de revisão" tipo="date" valor={dataRevisao} onChange={setDataRevisao} />
              </div>

              <fieldset className="rounded border border-navy/10 bg-white/60 p-2">
                <legend className="px-1 text-[10px] uppercase tracking-wide text-navy/40">Escopo liberado</legend>
                {disponiveis.map((e) => (
                  <label key={e} className="mr-3 inline-flex items-center gap-1 text-[11px] text-navy/70">
                    <input
                      type="checkbox"
                      checked={escopos.includes(e)}
                      onChange={(ev) =>
                        setEscopos((atual) => (ev.target.checked ? [...atual, e] : atual.filter((x) => x !== e)))
                      }
                    />
                    {e.replace(/_/g, " ")}
                  </label>
                ))}
              </fieldset>

              <Texto label="Justificativa" valor={justificativa} onChange={setJustificativa} />

              <AcaoOperacional
                rotulo="Registrar exceção"
                capacidade="ver_todos_estados_da_organizacao"
                validacaoFormulario={faltando}
                efeito="Grava um evento append-only em owner_override_events com a regra superada, o gate pendente, o escopo e a data de revisão. Não altera ativação, pagamento, contrato nem qualquer coluna financeira."
                onConfirmar={() => mRegistrar.mutate()}
              />
            </div>
          );
        }}
      </EstadoDados>
    </section>
  );
}
