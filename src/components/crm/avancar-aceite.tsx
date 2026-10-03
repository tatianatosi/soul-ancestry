/**
 * Corte ÓRFÃOS onda 4 (03/10/2026) — entrada comercial religada.
 *
 * Medição: `/conversao` mostrava o funil por eventos e **nenhuma ação**. Os
 * três escritores da entrada comercial existiam, testados, sem um único
 * chamador de UI:
 *
 * - `avancarEstadoAceite` — a máquina de aceite (10 estados, com a regra de
 *   que confirmação formal registrada é obrigatória antes de contrato; aceite
 *   verbal não basta);
 * - `registrarEventoConversao` — o evento imutável do funil;
 * - `garantirTemplateOnboarding` — o template padrão de onboarding, que a
 *   ativação precisa existir.
 *
 * Tudo isso só rodava por SQL manual. Aqui eles ganham tela, com a recusa do
 * servidor aparecendo como motivo — nunca botão desabilitado sem explicação.
 */
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Selecao, Texto } from "@/components/caso/campos";
import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { ESTADOS_ACEITE, EVENTOS_CONVERSAO, type EstadoAceite } from "@/lib/conversao";
import {
  avancarEstadoAceite,
  garantirTemplateOnboarding,
  registrarEventoConversao,
} from "@/lib/conversao.functions";

export function AvancarAceite({ casos }: { casos: readonly { id: string; rotulo: string }[] }) {
  const avancar = useServerFn(avancarEstadoAceite);
  const registrar = useServerFn(registrarEventoConversao);
  const garantir = useServerFn(garantirTemplateOnboarding);

  const [caseId, setCaseId] = useState("");
  const [destino, setDestino] = useState<string>("proposta_enviada");
  const [evidencia, setEvidencia] = useState("");
  const [observacao, setObservacao] = useState("");
  const [eventoTipo, setEventoTipo] = useState("lead_qualificado");

  const estado = ESTADOS_ACEITE.find((e) => e.codigo === destino);

  const mAvancar = useMutation({
    mutationFn: () =>
      avancar({ data: { caseId, destino: destino as EstadoAceite, evidencia: evidencia || undefined, observacao: observacao || undefined } }),
    onSuccess: () => {
      toast.success("Estado de aceite registrado.");
      setEvidencia("");
      setObservacao("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mEvento = useMutation({
    mutationFn: () => registrar({ data: { event_type: eventoTipo, case_id: caseId || null } }),
    onSuccess: () => toast.success("Evento de conversão registrado."),
    onError: (e: Error) => toast.error(e.message),
  });

  const mTemplate = useMutation({
    mutationFn: () => garantir({} as never),
    onSuccess: () => toast.success("Template padrão de onboarding garantido."),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-xl border border-navy/10 bg-cream/40 p-5" data-avancar-aceite>
      <h2 className="font-serif text-base text-navy">Mover o aceite e registrar evento</h2>
      <p className="mt-1 text-[11px] text-navy/50">
        O estado de aceite é regra, não texto: confirmação formal registrada é obrigatória antes de preparar ou enviar
        contrato — aceite verbal não basta. A recusa do servidor aparece aqui com o motivo. Nada aqui envia, assina ou
        cobra.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Selecao
          label="Caso"
          valor={caseId}
          opcoes={[{ valor: "", rotulo: "Escolher caso" }, ...casos.map((c) => ({ valor: c.id, rotulo: c.rotulo }))]}
          onChange={setCaseId}
        />
        <Selecao
          label="Novo estado de aceite"
          valor={destino}
          opcoes={ESTADOS_ACEITE.map((e) => ({ valor: e.codigo, rotulo: e.rotulo }))}
          onChange={setDestino}
        />
        <Texto label="Evidência (referência interna)" valor={evidencia} onChange={setEvidencia} />
        <Texto label="Observação" valor={observacao} onChange={setObservacao} />
      </div>
      {estado ? <p className="mt-1 text-[11px] text-navy/55">Libera: {estado.libera}</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <AcaoOperacional
          rotulo="Registrar estado de aceite"
          capacidade="avancar_caso_planejador_tarefa"
          validacaoFormulario={caseId ? null : "Escolha o caso."}
          efeito="Grava o eixo comercial ou de formalização do caso, com releitura, e registra o evento correspondente do funil. Não envia, não assina, não cobra."
          onConfirmar={() => mAvancar.mutate()}
        />
      </div>

      <div className="mt-4 border-t border-navy/10 pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/50">Evento solto do funil</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Selecao
            label="Tipo de evento"
            valor={eventoTipo}
            opcoes={EVENTOS_CONVERSAO.map((e) => ({ valor: e.codigo, rotulo: `${e.rotulo} · ${e.etapa}` }))}
            onChange={setEventoTipo}
          />
        </div>
        <div className="mt-2">
          <AcaoOperacional
            rotulo="Registrar evento"
            capacidade="editar_fila_responsavel_prazo"
            efeito="Insere um evento imutável no funil de conversão. Evento registrado não se apaga — só se corrige com outro evento."
            onConfirmar={() => mEvento.mutate()}
          />
        </div>
      </div>

      <div className="mt-4 border-t border-navy/10 pt-3">
        <p className="text-[11px] text-navy/55">
          O template padrão de onboarding (seis fases, checklist obrigatório, regra de valor percebido em D7 e 14 dias)
          precisa existir na organização antes da ativação de caso.
        </p>
        <button
          type="button"
          onClick={() => mTemplate.mutate()}
          disabled={mTemplate.isPending}
          className="mt-2 rounded-lg border border-navy/20 px-3 py-2 text-[11px] text-navy hover:bg-navy/5 disabled:opacity-40"
        >
          Garantir template padrão de onboarding
        </button>
      </div>
    </section>
  );
}
