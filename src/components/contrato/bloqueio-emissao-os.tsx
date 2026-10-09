/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  conciliarCatalogoProposta,
  executarConciliacaoCatalogo,
  historicoConciliacaoCatalogo,
  reprocessarConciliacaoCatalogo,
} from "@/lib/conciliacao-catalogo.functions";
import { resumoBloqueio, type GrupoBloqueio, type ResultadoConciliacao } from "@/lib/conciliacao-catalogo";
import { useAvisoEdicaoNaoSalva } from "@/lib/aviso-edicao-nao-salva";

const dataHora = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

/** Reprocessamento auditado + histórico versionado das decisões de conciliação. */
/*
 * Onda 5 dos órfãos (03/10/2026): `executarConciliacaoCatalogo` — o registro
 * da PRIMEIRA conciliação — não tinha chamador nenhum. A tela sabia conferir
 * (leitura) e reprocessar (já existindo versão anterior), mas a primeira
 * gravação da decisão só acontecia por SQL. Sem ela, o histórico versionado
 * nascia vazio e o reprocessamento não tinha de onde preservar versão.
 */
function RegistrarConciliacao({ proposalId }: { proposalId: string }) {
  const qc = useQueryClient();
  const executar = useServerFn(executarConciliacaoCatalogo);
  const m = useMutation({
    mutationFn: () => executar({ data: { proposalId } }),
    onSuccess: () => {
      toast.success("Conciliação registrada. O histórico passa a ter versão inicial.");
      void qc.invalidateQueries({ queryKey: ["conciliacao-emissao-os", proposalId] });
      void qc.invalidateQueries({ queryKey: ["conciliacao-historico", proposalId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Button type="button" variant="outline" size="sm" disabled={m.isPending} onClick={() => m.mutate()}>
      Registrar conciliação desta proposta
    </Button>
  );
}

function ReprocessarConciliacao({ proposalId }: { proposalId: string }) {
  const qc = useQueryClient();
  const reprocessar = useServerFn(reprocessarConciliacaoCatalogo);
  const historico = useServerFn(historicoConciliacaoCatalogo);
  const [motivo, setMotivo] = useState("");
  const [verHistorico, setVerHistorico] = useState(false);
  /* F5 / sair da linha (09/10/2026): trava a saída com edição pendente. */
  useAvisoEdicaoNaoSalva(motivo.trim() !== "");

  const qHist = useQuery({
    queryKey: ["conciliacao-historico", proposalId],
    queryFn: () => historico({ data: { proposalId } }),
    enabled: verHistorico,
    retry: false,
  });

  const m = useMutation({
    mutationFn: () => reprocessar({ data: { proposalId, motivo: motivo.trim() || null } }),
    onSuccess: (r: any) => {
      toast.success(
        `Conciliação reprocessada (versão ${r?.versao ?? "—"}). ${r?.decisoes_preservadas ?? 0} decisão(ões) anterior(es) preservada(s).`,
      );
      setMotivo("");
      qc.invalidateQueries({ queryKey: ["conciliacao-emissao-os", proposalId] });
      qc.invalidateQueries({ queryKey: ["conciliacao-historico", proposalId] });
      qc.invalidateQueries({ queryKey: ["divergencias-catalogo"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Não foi possível reprocessar a conciliação."),
  });

  const linhas = (qHist.data ?? []) as any[];

  return (
    <div className="mt-3 rounded-md border border-navy/10 bg-cream/40 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
        Após corrigir o escopo ou o catálogo
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Input
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Motivo do reprocessamento (opcional)"
          className="h-8 max-w-xs text-xs"
        />
        <Button size="sm" onClick={() => m.mutate()} disabled={m.isPending}>
          {m.isPending ? "Reprocessando…" : "Reprocessar conciliação"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setVerHistorico((v) => !v)}>
          {verHistorico ? "Ocultar histórico" : "Ver histórico"}
        </Button>
      </div>
      <p className="mt-1 text-[11px] text-navy/50">
        Cada reprocessamento gera uma nova versão. As versões anteriores das decisões de conciliação ficam preservadas e
        não podem ser alteradas.
      </p>

      {verHistorico && (
        <div className="mt-2 space-y-2">
          {qHist.isLoading && <p className="text-xs text-navy/60">Carregando histórico…</p>}
          {qHist.error ? (
            <p role="alert" className="flex flex-wrap items-center gap-2 text-xs text-terracotta">
              Não foi possível carregar o histórico de reprocessamentos.
              <button
                type="button"
                onClick={() => void qHist.refetch()}
                className="rounded-md border border-terracotta/50 px-2 py-0.5 font-medium"
              >
                Tentar novamente
              </button>
            </p>
          ) : null}
          {!qHist.isLoading && !qHist.error && linhas.length === 0 && (
            <p className="text-xs text-navy/60">Nenhum reprocessamento registrado para esta proposta.</p>
          )}
          {linhas.map((l) => (
            <div key={l.id} className="rounded-md border border-navy/10 bg-cream/40 p-2 text-xs text-navy/70">
              <p className="font-medium text-navy">
                Versão {l.versao} · {dataHora(l.created_at)} ·{" "}
                {l.pode_gerar_os ? "sem bloqueio" : `${(l.bloqueios ?? []).length} bloqueio(s)`}
              </p>
              <p className="mt-0.5">
                SKU {l.sku ?? "—"} · divergências apuradas: {(l.divergencias ?? []).length} · decisões preservadas:{" "}
                {(l.decisoes_anteriores ?? []).length}
              </p>
              {l.motivo && <p className="mt-0.5">Motivo: {l.motivo}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Resumo legível do motivo do bloqueio de emissão de OS / Anexo I.
 * Somente leitura: reflete a conciliação contra o catálogo homologado e
 * indica quais campos precisam ser corrigidos e onde.
 */
export function BloqueioEmissaoOS({ proposalId, ativo = true }: { proposalId: string | null; ativo?: boolean }) {
  const conciliar = useServerFn(conciliarCatalogoProposta);
  const q = useQuery({
    queryKey: ["conciliacao-emissao-os", proposalId],
    queryFn: () => conciliar({ data: { proposalId: proposalId as string } }),
    enabled: !!proposalId && ativo,
    retry: false,
  });

  if (!proposalId || !ativo) return null;

  if (q.isLoading) {
    return (
      <p className="mt-3 rounded-md border border-navy/10 bg-cream/40 p-3 text-xs text-navy/60">
        Conferindo SKU, preço, vigência e escopo contra o catálogo homologado…
      </p>
    );
  }

  if (q.isError) {
    return (
      <p className="mt-3 rounded-md border border-terracotta/30 bg-terracotta/5 p-3 text-xs text-terracotta">
        Não foi possível conferir a conciliação de catálogo: {(q.error as Error).message}
      </p>
    );
  }

  const r = q.data as unknown as ResultadoConciliacao;
  if (!r) return null;

  const grupos = resumoBloqueio(r);
  const atencao = resumoBloqueio(r, { incluirAtencao: true }).flatMap((g) =>
    g.itens.filter((i) => i.severidade === "atencao"),
  );

  if (!grupos.length) {
    return (
      <div className="mt-3 rounded-md border border-navy/10 bg-cream/40 p-3">
        <p className="text-xs font-medium text-navy">Conciliação de catálogo sem bloqueio.</p>
        <p className="mt-1 text-xs text-navy/60">
          SKU {r.sku ?? "—"} homologado, preço e condição conferidos e escopo suficiente para emitir a OS / Anexo I.
        </p>
        {atencao.length > 0 && (
          <ul className="mt-2 list-disc pl-4 text-xs text-navy/60">
            {atencao.map((i) => (
              <li key={i.codigo}>Atenção: {i.descricao}</li>
            ))}
          </ul>
        )}
        <RegistrarConciliacao proposalId={proposalId} />
        <RegistrarConciliacao proposalId={proposalId} />
      <ReprocessarConciliacao proposalId={proposalId} />
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-terracotta/30 bg-terracotta/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
        Emissão de OS / Anexo I bloqueada — {grupos.length} motivo(s)
      </p>
      <p className="mt-1 text-xs text-navy/70">
        A OS e o Anexo I só podem ser emitidos a partir de SKU, preço, condição e escopo homologados. Corrija os campos
        abaixo e repita a emissão.
      </p>

      <ol className="mt-2 space-y-2">
        {grupos.map((g: GrupoBloqueio) => (
          <li key={g.motivo} className="rounded-md border border-navy/10 bg-cream/60 p-3">
            <p className="text-sm font-medium text-navy">{g.titulo}</p>
            <p className="mt-1 text-xs text-navy/70">{g.explicacao}</p>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">
              O que precisa ser corrigido
            </p>
            <ul className="mt-1 list-disc pl-4 text-xs text-navy">
              {g.campos.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">Detalhe apurado</p>
            <ul className="mt-1 space-y-1 text-xs text-navy/70">
              {g.itens.map((i) => (
                <li key={i.codigo}>
                  {i.descricao}
                  {i.valor_catalogo !== null && i.valor_catalogo !== undefined && (
                    <span className="text-navy/50"> · homologado: {String(i.valor_catalogo)}</span>
                  )}
                  {i.valor_observado !== null && i.valor_observado !== undefined && (
                    <span className="text-navy/50"> · praticado: {String(i.valor_observado)}</span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-2 text-xs text-navy/60">Onde corrigir: {g.onde_corrigir}</p>
          </li>
        ))}
      </ol>

      {atencao.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-xs text-navy/60">
          {atencao.map((i) => (
            <li key={i.codigo}>Atenção (não bloqueia): {i.descricao}</li>
          ))}
        </ul>
      )}

      <ReprocessarConciliacao proposalId={proposalId} />
    </div>
  );
}
