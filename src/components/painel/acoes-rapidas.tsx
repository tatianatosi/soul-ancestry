/**
 * Ações rápidas da Proprietária Administradora no Painel Hoje.
 *
 * Grava responsável, prazo e próxima ação direto na entidade canônica, com
 * auditoria append-only automática (nunca pré-requisito de salvar). Não cria
 * registro novo, não duplica item de fila e não executa nenhuma ação externa.
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import {
  corrigirFilaCanonica,
  registrarOverrideProprietaria,
} from "@/lib/painel-hoje-acoes.functions";
import { listarEquipe } from "@/lib/equipe.functions";

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
  bloqueioComercial,
}: {
  tipo: Tipo;
  id: string;
  aoSalvar?: () => void;
  /** Só então a Governança de Catálogo é oferecida como rota de correção. */
  bloqueioComercial?: boolean;
}) {
  const corrigir = useServerFn(corrigirFilaCanonica);
  const assumir = useServerFn(registrarOverrideProprietaria);
  const carregarEquipe = useServerFn(listarEquipe);
  const [aberto, setAberto] = useState(false);
  const equipe = useQuery({
    queryKey: ["equipe-acoes-rapidas"],
    queryFn: () => carregarEquipe(),
    enabled: aberto,
  });
  const opcoesResponsavel = (equipe.data?.membros ?? []) as { auth_user_id: string | null; full_name: string | null; email: string | null }[];
  const [form, setForm] = useState({
    responsavel: "",
    prazo: "",
    proxima: "",
    observacao: "",
  });
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
          ...(form.observacao ? { motivo: form.observacao, fonte: form.observacao } : {}),
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
          ...(form.observacao ? { motivo: form.observacao, fonte: form.observacao } : {}),
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
        className="mt-1 rounded-md border border-navy/20 px-2 py-0.5 text-[11px] text-navy hover:bg-navy/5"
      >
        Ações rápidas da proprietária
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-navy/15 bg-white p-2 text-[11px]">
      <p className="mb-1 text-navy/70">
        Correção interna auditada. Nenhuma cobrança, assinatura, comunicação, publicação ou
        integração é executada aqui.
      </p>
      <div className="grid gap-1.5 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-0.5 text-navy/60">
          Responsável
          <select
            value={form.responsavel}
            onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
            className="w-full min-w-0 rounded border border-navy/15 px-1.5 py-1 text-navy"
          >
            <option value="">Não definido</option>
            {opcoesResponsavel
              .filter((m) => m.auth_user_id)
              .map((m) => (
                <option key={m.auth_user_id} value={m.auth_user_id as string}>
                  {m.full_name || m.email}
                </option>
              ))}
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-0.5 text-navy/60">
          Prazo
          <input
            type="date"
            value={form.prazo}
            onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
            className="w-full min-w-0 rounded border border-navy/15 px-1.5 py-1 text-navy"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-0.5 text-navy/60 sm:col-span-2">
          Próxima ação
          <input
            value={form.proxima}
            onChange={(e) => setForm((f) => ({ ...f, proxima: e.target.value }))}
            className="w-full min-w-0 rounded border border-navy/15 px-1.5 py-1 text-navy"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-0.5 text-navy/60 sm:col-span-2">
          Observação (opcional)
          <input
            value={form.observacao}
            onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
            className="w-full min-w-0 rounded border border-navy/15 px-1.5 py-1 text-navy"
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
          disabled={m.isPending}
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
          disabled={mAssumir.isPending}
          className="rounded-md border border-gold/60 bg-gold/15 px-2.5 py-1 text-navy disabled:opacity-50"
        >
          {mAssumir.isPending ? "Registrando…" : "Assumir pendência e avançar"}
        </button>
        <button
          onClick={() => setAberto(false)}
          className="rounded-md border border-navy/20 px-2.5 py-1 text-navy/70"
        >
          Fechar
        </button>
        {ok ? (
          <span className="text-navy/70">Correção salva na entidade canônica, com auditoria.</span>
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 border-t border-gold/30 pt-2 text-[11px]">
        <span className="text-navy/50">Abrir origem:</span>
        {tipo === "caso" ? (
          <Link
            to="/casos/$caseId"
            params={{ caseId: id }}
            className="text-navy underline underline-offset-2"
          >
            Caso
          </Link>
        ) : (
          <Link to="/leads" className="text-navy underline underline-offset-2">
            Lead
          </Link>
        )}
        <Link to="/propostas" className="text-navy underline underline-offset-2">
          Proposta
        </Link>
        <Link to="/contratos" className="text-navy underline underline-offset-2">
          Contrato
        </Link>
        {bloqueioComercial ? (
          <Link to="/catalogo" className="text-navy underline underline-offset-2">
            Governança de Catálogo
          </Link>
        ) : null}
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
