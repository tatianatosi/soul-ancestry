/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Ordem de Serviço (Anexo I) operável DENTRO do fluxo do contrato.
 *
 * Diretriz da Proprietária, 03/10/2026 ("Contrato de Uma Hora", item 3): a OS
 * precisa ser criada/editada como rascunho no próprio fluxo — responsável,
 * datas, condição de início e escopo —, sem emitir nada automaticamente.
 *
 * Medição que motivou o painel: `service_orders` já tinha
 * `responsible_user_id`/`start_date`/`end_date`/`start_condition_*` e o
 * escritor `atualizarObservacaoOrdem` já existia, mas só a tela separada
 * `/ordens-servico` os expunha. Quem preparava o contrato precisava sair do
 * fluxo. Nenhum escritor novo é criado aqui: este painel chama o mesmo.
 */

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AcaoOperacional } from "@/components/saas/acao-operacional";
import { atualizarObservacaoOrdem, listarVinculos } from "@/lib/comercial.functions";

export type OrdemServicoDoCaso = {
  id: string;
  service_order_number?: string | null;
  status?: string | null;
  scope_summary?: string | null;
  deliverable_summary?: string | null;
  responsible_user_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_condition_status?: string | null;
  start_condition_notes?: string | null;
  internal_notes?: string | null;
  versao?: number | null;
};

const inputCls = "w-full rounded border border-navy/20 bg-cream/40 px-2 py-1 text-xs text-navy";

function dataBr(v: string | null | undefined) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

const ROTULO_CONDICAO_INICIO: Record<string, string> = {
  pending: "Condição de início pendente",
  met: "Condição de início cumprida",
  waived: "Condição de início dispensada",
  blocked: "Condição de início bloqueada",
};

export function OrdemServicoDoCaso({
  ordem,
  podeEscrever,
  onGravou,
}: {
  ordem: OrdemServicoDoCaso | null | undefined;
  podeEscrever: boolean;
  onGravou?: () => void;
}) {
  const qc = useQueryClient();
  const vinculos = useServerFn(listarVinculos);
  const atualizar = useServerFn(atualizarObservacaoOrdem);
  const qv = useQuery({ queryKey: ["comercial-vinculos"], queryFn: () => vinculos({}), retry: false });
  const equipe = ((qv.data as any)?.equipe ?? []) as { authUserId: string; nome: string }[];

  const [escopo, setEscopo] = useState("");
  const [notas, setNotas] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [inicio, setInicio] = useState("");
  const [prazo, setPrazo] = useState("");

  // Remonta o rascunho quando a OS lida muda (nunca carrega o rascunho de
  // outra OS — mesmo cuidado do Corte 1 de salvar/dessalvar).
  useEffect(() => {
    setEscopo(String(ordem?.scope_summary ?? ""));
    setNotas(String(ordem?.internal_notes ?? ""));
    setResponsavel(String(ordem?.responsible_user_id ?? ""));
    setInicio(String(ordem?.start_date ?? "").slice(0, 10));
    setPrazo(String(ordem?.end_date ?? "").slice(0, 10));
  }, [ordem?.id, ordem?.versao, ordem?.scope_summary, ordem?.internal_notes, ordem?.responsible_user_id, ordem?.start_date, ordem?.end_date]);

  const m = useMutation({
    mutationFn: () =>
      atualizar({
        data: {
          id: String(ordem?.id),
          scope_summary: escopo,
          internal_notes: notas,
          responsible_user_id: responsavel || null,
          start_date: inicio || null,
          end_date: prazo || null,
        },
      }),
    onSuccess: () => {
      toast.success("Planejamento da ordem de serviço gravado.");
      void qc.invalidateQueries({ queryKey: ["comercial-vinculos"] });
      onGravou?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!ordem?.id) {
    return (
      <div className="mt-3 rounded border border-terracotta/30 bg-terracotta/5 p-2" data-os-do-caso="ausente">
        <p className="text-xs font-medium text-navy">Ordem de Serviço deste caso</p>
        <p className="mt-0.5 text-[11px] text-navy/70">
          Ainda não existe ordem de serviço para este caso. Derive o Anexo I da proposta aprovada acima — a OS nasce
          dessa derivação, nunca de emissão automática.
        </p>
      </div>
    );
  }

  const nomeResponsavelSalvo =
    equipe.find((p) => p.authUserId === ordem.responsible_user_id)?.nome ?? (ordem.responsible_user_id ? "—" : null);

  return (
    <div className="mt-3 rounded border border-navy/15 bg-cream/40 p-2" data-os-do-caso={ordem.id}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-navy">
          Ordem de Serviço {ordem.service_order_number ?? "—"}
          {ordem.versao ? ` · versão ${ordem.versao}` : ""}
        </p>
        <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/60">
          {ordem.status ?? "sem status"}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-navy/60">
        {ROTULO_CONDICAO_INICIO[String(ordem.start_condition_status)] ??
          `Condição de início: ${ordem.start_condition_status ?? "—"}`}
        {ordem.start_condition_notes ? ` — ${ordem.start_condition_notes}` : ""}
      </p>
      <p className="mt-0.5 text-[11px] text-navy/60">
        Responsável salvo: {nomeResponsavelSalvo ?? "não definido"} · início {dataBr(ordem.start_date)} · prazo{" "}
        {dataBr(ordem.end_date)}
      </p>
      {ordem.deliverable_summary ? (
        <p className="mt-1 text-[11px] text-navy/70">Entregas: {ordem.deliverable_summary}</p>
      ) : null}

      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <label className="text-[11px] text-navy/60">
          Responsável
          <select className={inputCls} value={responsavel} onChange={(e) => setResponsavel(e.target.value)}>
            <option value="">Sem responsável definido</option>
            {equipe.map((p) => (
              <option key={p.authUserId} value={p.authUserId}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] text-navy/60">
          Início previsto
          <input className={inputCls} type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </label>
        <label className="text-[11px] text-navy/60">
          Prazo
          <input className={inputCls} type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
        </label>
      </div>
      <label className="mt-2 block text-[11px] text-navy/60">
        Escopo da OS
        <textarea className={inputCls} rows={2} maxLength={2000} value={escopo} onChange={(e) => setEscopo(e.target.value)} />
      </label>
      <label className="mt-2 block text-[11px] text-navy/60">
        Dependências e cadência (nota interna)
        <textarea className={inputCls} rows={2} maxLength={2000} value={notas} onChange={(e) => setNotas(e.target.value)} />
      </label>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <AcaoOperacional
          rotulo={m.isPending ? "Gravando…" : "Salvar planejamento da OS"}
          acaoExterna="editar_planejamento_ordem_servico"
          capacidade="corrigir_os_anexos_previa"
          validacaoFormulario={
            inicio && prazo && prazo < inicio ? "O prazo não pode ser anterior ao início previsto." : null
          }
          pendenciaGate={
            podeEscrever
              ? null
              : "Seu vínculo de equipe está marcado como somente leitura — a gravação é revalidada no servidor."
          }
          efeito="Grava responsável, início, prazo, escopo e nota de dependências/cadência desta ordem de serviço. Não muda o status, não emite a OS, não assina, não cobra e não envia nada."
          className="rounded bg-navy px-3 py-1.5 text-xs font-semibold text-cream disabled:opacity-50"
          onConfirmar={() => {
            if (m.isPending) return;
            m.mutate();
          }}
        />
        <span className="text-[11px] text-navy/55">
          Mudança de status da OS continua em Ordens de serviço — aqui só o planejamento.
        </span>
      </div>
    </div>
  );
}
