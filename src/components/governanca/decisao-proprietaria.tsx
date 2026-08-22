/**
 * Barra de decisão da Proprietária Administradora.
 *
 * Presente em toda tela que exibe bloqueio interno. Oferece, na própria tela:
 * "Salvar alteração", "Definir responsável", "Definir prazo",
 * "Registrar próxima ação" e "Assumir decisão e avançar".
 *
 * Tudo grava em entidade canônica com motivo, fonte, autora e auditoria
 * append-only. A pendência continua visível depois da decisão. Nenhuma ação
 * externa (envio, assinatura, cobrança, mensagem, pesquisa externa,
 * publicação, exclusão) é executada aqui.
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { corrigirFilaCanonica, registrarOverrideProprietaria } from "@/lib/modo-proprietaria.functions";
import { MOTIVO_MINIMO } from "@/lib/modo-proprietaria";

export type TipoFila = "lead" | "oportunidade" | "caso" | "tarefa";

const ENTIDADE: Record<TipoFila, string> = {
  lead: "leads",
  oportunidade: "opportunities",
  caso: "crm_casos",
  tarefa: "tarefas",
};

export type PendenciaVisivel = { chave: string; rotulo: string };

const btn =
  "rounded-md border border-navy/20 bg-white px-2.5 py-1 text-[12px] font-medium text-navy hover:bg-navy/5 disabled:opacity-50";
const btnPrimario =
  "rounded-md bg-navy px-2.5 py-1 text-[12px] font-semibold text-cream hover:bg-navy/90 disabled:opacity-50";
const btnDecisao =
  "rounded-md border border-gold/60 bg-gold/20 px-2.5 py-1 text-[12px] font-semibold text-navy hover:bg-gold/30 disabled:opacity-50";

export function BarraDecisaoProprietaria({
  tipo,
  id,
  /** Ação interna gateada que será liberada pela decisão (ex.: gerar_versao_final). */
  gate = "avanco_interno",
  modulo,
  pendencias = [],
  aoSalvar,
}: {
  tipo: TipoFila;
  id: string;
  gate?: string;
  modulo?: string;
  pendencias?: PendenciaVisivel[];
  aoSalvar?: () => void;
}) {
  const corrigir = useServerFn(corrigirFilaCanonica);
  const assumir = useServerFn(registrarOverrideProprietaria);
  const cliente = useQueryClient();

  const [form, setForm] = useState({ responsavel: "", prazo: "", proxima: "", motivo: "", fonte: "" });
  const [erros, setErros] = useState<string[]>([]);
  const [aviso, setAviso] = useState("");

  const justificado = form.motivo.trim().length >= MOTIVO_MINIMO && form.fonte.trim().length > 0;

  const salvar = useMutation({
    mutationFn: (campos: { responsavel?: boolean; prazo?: boolean; proxima?: boolean }) =>
      corrigir({
        data: {
          tipo,
          id,
          ...(campos.responsavel && form.responsavel ? { responsavel_user_id: form.responsavel } : {}),
          ...(campos.prazo && form.prazo ? { prazo: form.prazo } : {}),
          ...(campos.proxima && form.proxima ? { proxima_acao: form.proxima } : {}),
          motivo: form.motivo,
          fonte: form.fonte,
        },
      }),
    onSuccess: (r: any) => {
      setErros(r?.erros ?? []);
      setAviso(r?.ok ? "Alteração gravada na entidade canônica, com auditoria." : "");
      if (r?.ok) {
        void cliente.invalidateQueries();
        aoSalvar?.();
      }
    },
    onError: (e: any) => setErros([String(e?.message ?? "Não foi possível salvar.")]),
  });

  const decidir = useMutation({
    mutationFn: () =>
      assumir({
        data: {
          entidade: ENTIDADE[tipo],
          entidade_id: id,
          gate,
          valor_anterior: "pendente_bloqueante",
          valor_novo: "superado_por_decisao_proprietaria",
          motivo: form.motivo,
          fonte: form.fonte,
          avanco_interno: "avanco_fase_caso",
          modulo: modulo ?? null,
          ...(pendencias[0]
            ? { pendencia: { chave: pendencias[0].chave, rotulo: pendencias[0].rotulo, motivo: pendencias[0].rotulo } }
            : {}),
        },
      }),
    onSuccess: (r: any) => {
      setErros(r?.erros ?? []);
      setAviso(
        r?.ok
          ? "Decisão registrada. O avanço interno está liberado e a pendência permanece visível."
          : "",
      );
      if (r?.ok) {
        void cliente.invalidateQueries();
        aoSalvar?.();
      }
    },
    onError: (e: any) => setErros([String(e?.message ?? "Não foi possível registrar a decisão.")]),
  });

  const ocupado = salvar.isPending || decidir.isPending;

  return (
    <section className="mt-3 rounded-lg border border-gold/50 bg-cream/50 p-3 text-[12px]">
      <p className="text-[12px] font-semibold text-navy">Decisão da Proprietária Administradora</p>
      <p className="mt-0.5 text-[11px] text-navy/70">
        A pendência continua registrada e visível. Ela não impede o avanço interno. Nenhuma assinatura, cobrança,
        mensagem, pesquisa externa, publicação ou exclusão é executada aqui.
      </p>
      {pendencias.length > 0 && (
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[11px] text-navy/70">
          {pendencias.map((p) => (
            <li key={p.chave}>Pendência mantida: {p.rotulo}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
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
          Motivo (mínimo {MOTIVO_MINIMO} caracteres)
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
          type="button"
          className={btnPrimario}
          disabled={ocupado || !justificado}
          onClick={() => salvar.mutate({ responsavel: true, prazo: true, proxima: true })}
        >
          Salvar alteração
        </button>
        <button
          type="button"
          className={btn}
          disabled={ocupado || !justificado || !form.responsavel.trim()}
          onClick={() => salvar.mutate({ responsavel: true })}
        >
          Definir responsável
        </button>
        <button
          type="button"
          className={btn}
          disabled={ocupado || !justificado || !form.prazo}
          onClick={() => salvar.mutate({ prazo: true })}
        >
          Definir prazo
        </button>
        <button
          type="button"
          className={btn}
          disabled={ocupado || !justificado || !form.proxima.trim()}
          onClick={() => salvar.mutate({ proxima: true })}
        >
          Registrar próxima ação
        </button>
        <button type="button" className={btnDecisao} disabled={ocupado || !justificado} onClick={() => decidir.mutate()}>
          Assumir decisão e avançar
        </button>
      </div>

      {!justificado && (
        <p className="mt-1 text-[11px] text-navy/50">
          Informe motivo e fonte para habilitar a gravação — é o que registra a decisão na auditoria.
        </p>
      )}
      {aviso && <p className="mt-1 text-[11px] font-medium text-navy">{aviso}</p>}
      {erros.length > 0 && (
        <ul className="mt-1 space-y-0.5 text-[11px] text-terracotta">
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
