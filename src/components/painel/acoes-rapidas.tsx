/**
 * Ações rápidas da Proprietária Administradora no Painel Hoje.
 *
 * Grava responsável, prazo e próxima ação na entidade canônica, com motivo e
 * fonte obrigatórios e auditoria append-only. Não cria registro novo, não
 * duplica item de fila e não executa nenhuma ação externa.
 */
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { corrigirFilaCanonica, registrarOverrideProprietaria } from "@/lib/modo-proprietaria.functions";

type Tipo = "lead" | "oportunidade" | "caso" | "tarefa";

const ENTIDADE: Record<Tipo, string> = {
  lead: "leads",
  oportunidade: "opportunities",
  caso: "crm_casos",
  tarefa: "tarefas",
};

export function AcoesRapidasProprietaria({
  tipo,
  id,
  aoSalvar,
}: {
  tipo: Tipo;
  id: string;
  aoSalvar?: () => void;
}) {
  const corrigir = useServerFn(corrigirFilaCanonica);
  const assumir = useServerFn(registrarOverrideProprietaria);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ responsavel: "", prazo: "", proxima: "", motivo: "", fonte: "" });
  const [erros, setErros] = useState<string[]>([]);
  const [ok, setOk] = useState(false);

  const m = useMutation({
    mutationFn: () =>
      corrigir({
        data: {
          tipo,
          id,
          ...(form.responsavel ? { responsavel_user_id: form.responsavel } : {}),
          ...(form.prazo ? { prazo: form.prazo } : {}),
          ...(form.proxima ? { proxima_acao: form.proxima } : {}),
          motivo: form.motivo,
          fonte: form.fonte,
        },
      }),
    onSuccess: (r: any) => {
      setErros(r?.erros ?? []);
      setOk(!!r?.ok);
      if (r?.ok) aoSalvar?.();
    },
    onError: (e: any) => setErros([String(e?.message ?? "Não foi possível salvar a correção.")]),
  });

  // Assume a pendência por decisão humana registrada. Não executa nada externo.
  const mAssumir = useMutation({
    mutationFn: () =>
      assumir({
        data: {
          entidade: ENTIDADE[tipo],
          entidade_id: id,
          gate: "pendencia_painel_hoje",
          valor_anterior: "pendente_bloqueante",
          valor_novo: "superado_por_decisao_proprietaria",
          motivo: form.motivo,
          fonte: form.fonte,
          avanco_interno: "avancar_interno",
          modulo: "painel_hoje",
        },
      }),
    onSuccess: (r: any) => {
      setErros(r?.erros ?? []);
      setOk(!!r?.ok);
      if (r?.ok) aoSalvar?.();
    },
    onError: (e: any) => setErros([String(e?.message ?? "Não foi possível registrar a decisão.")]),
  });


  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="mt-1 rounded-md border border-gold/50 bg-gold/10 px-2 py-0.5 text-[11px] text-navy hover:bg-gold/20"
      >
        Ações rápidas da proprietária
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-gold/40 bg-cream/40 p-2 text-[11px]">
      <p className="mb-1 text-navy/70">
        Correção interna auditada. Nenhuma cobrança, assinatura, comunicação, publicação ou integração é executada aqui.
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <label className="flex flex-col gap-0.5 text-navy/60">
          Responsável (identificador interno)
          <input
            value={form.responsavel}
            onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
            className="rounded border border-navy/15 px-1.5 py-1 text-navy"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-navy/60">
          Prazo
          <input
            type="date"
            value={form.prazo}
            onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
            className="rounded border border-navy/15 px-1.5 py-1 text-navy"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-navy/60 sm:col-span-2">
          Próxima ação
          <input
            value={form.proxima}
            onChange={(e) => setForm((f) => ({ ...f, proxima: e.target.value }))}
            className="rounded border border-navy/15 px-1.5 py-1 text-navy"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-navy/60">
          Motivo (mínimo 10 caracteres)
          <input
            value={form.motivo}
            onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
            className="rounded border border-navy/15 px-1.5 py-1 text-navy"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-navy/60">
          Fonte ou justificativa
          <input
            value={form.fonte}
            onChange={(e) => setForm((f) => ({ ...f, fonte: e.target.value }))}
            className="rounded border border-navy/15 px-1.5 py-1 text-navy"
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setOk(false);
            setErros([]);
            m.mutate();
          }}
          disabled={m.isPending || form.motivo.trim().length < 10 || !form.fonte.trim()}
          className="rounded-md bg-navy px-2.5 py-1 text-cream disabled:opacity-50"
        >
          {m.isPending ? "Salvando…" : "Salvar correção auditada"}
        </button>
        <button
          onClick={() => {
            setOk(false);
            setErros([]);
            mAssumir.mutate();
          }}
          disabled={mAssumir.isPending || form.motivo.trim().length < 10 || !form.fonte.trim()}
          className="rounded-md border border-gold/60 bg-gold/15 px-2.5 py-1 text-navy disabled:opacity-50"
        >
          {mAssumir.isPending ? "Registrando…" : "Assumir pendência e avançar"}
        </button>
        <button onClick={() => setAberto(false)} className="rounded-md border border-navy/20 px-2.5 py-1 text-navy/70">
          Fechar
        </button>
        {ok ? <span className="text-navy/70">Correção salva na entidade canônica, com auditoria.</span> : null}
      </div>
      {erros.length > 0 ? (
        <ul className="mt-1 space-y-0.5 text-terracotta">
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
