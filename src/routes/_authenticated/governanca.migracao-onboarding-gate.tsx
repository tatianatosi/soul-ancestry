import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { SaasShell } from "@/components/saas/shell";
import { CaCard } from "@/components/ui/ca-card";
import { backfillGateOnboardingEmCasePlans } from "@/lib/onboarding-gate-backfill.functions";
import { pontearFontesDePesquisa, type ItemPonte } from "@/lib/pontes-pesquisa.functions";

export const Route = createFileRoute("/_authenticated/governanca/migracao-onboarding-gate")({
  head: () => ({
    meta: [
      { title: "Migração — gate de onboarding em case_plans — Clube Ancestral" },
      {
        name: "description",
        content:
          "Backfill único de motivos_bloqueio de onboarding_planos para case_plans, com prévia antes de gravar.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MigracaoOnboardingGatePage,
});

type ItemPlano = { caseId: string; acao: "sem_alvo" | "ja_sincronizado" | "sincronizar" };

const ROTULO_ACAO: Record<ItemPlano["acao"], string> = {
  sem_alvo: "Sem case_plans (fase onboarding) — não cria automaticamente",
  ja_sincronizado: "Já sincronizado",
  sincronizar: "Vai sincronizar",
};

function MigracaoOnboardingGatePage() {
  const backfill = useServerFn(backfillGateOnboardingEmCasePlans);
  const [plano, setPlano] = useState<ItemPlano[] | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [falhas, setFalhas] = useState<{ caseId: string; motivo: string }[]>([]);

  const m = useMutation({
    mutationFn: (confirmar: boolean) => backfill({ data: { confirmar } }),
    onSuccess: (r: any) => {
      setPlano(r.plano ?? []);
      // Migration pendente no banco conectado: dito aqui, nada é gravado.
      setAviso(r.schemaPendente ? (r.aviso ?? null) : null);
      setFalhas(r.falhas ?? []);
    },
    // Laudo #189, primeiro corte (27/10/2026): sem onError, uma recusa do
    // banco ficava indistinguível de "nada salva".
    onError: (e: Error) => toast.error(e.message),
  });

  const pendentes = plano ? plano.filter((p) => p.acao === "sincronizar").length : 0;
  const semAlvo = plano ? plano.filter((p) => p.acao === "sem_alvo").length : 0;

  return (
    <SaasShell
      titulo="Migração — gate de onboarding em case_plans"
      descricao="Decisão da Proprietária, 2026-09-24: espelha motivos_bloqueio de onboarding_planos para a linha de case_plans (fase_jornada=onboarding) do mesmo caso. Só grava com confirmação; nunca cria linha de case_plans nova."
    >
      <CaCard titulo="Prévia e confirmação">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={m.isPending}
            onClick={() => m.mutate(false)}
            className="rounded-lg border border-navy/25 px-3 py-1.5 text-xs font-medium text-navy hover:bg-cream/50 disabled:opacity-50"
          >
            Ver o que será feito
          </button>
          <button
            type="button"
            disabled={m.isPending || !pendentes}
            onClick={() => m.mutate(true)}
            className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-40"
          >
            Sincronizar agora
          </button>
        </div>

        {aviso ? (
          <p
            className="mt-3 rounded border border-terracotta/30 bg-terracotta/5 p-2 text-xs text-terracotta"
            data-migracao-schema-pendente
          >
            {aviso}
          </p>
        ) : null}

        {falhas.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-terracotta">
            {falhas.map((f) => (
              <li key={f.caseId}>
                <span className="font-mono">{f.caseId}</span> — não sincronizado: {f.motivo}
              </li>
            ))}
          </ul>
        ) : null}

        {plano && !aviso && (
          <p className="mt-3 text-xs text-navy/70">
            {plano.length} caso(s) com onboarding_planos · {pendentes} a sincronizar · {semAlvo} sem
            case_plans(onboarding).
          </p>
        )}

        {plano && plano.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {plano.map((p) => (
              <li key={p.caseId} className="rounded border border-navy/10 p-2 text-xs text-navy/75">
                <span className="font-mono">{p.caseId}</span> — {ROTULO_ACAO[p.acao]}
              </li>
            ))}
          </ul>
        )}
      </CaCard>

      <PontesDaPesquisa />
    </SaasShell>
  );
}

const ROTULO_PONTE: Record<ItemPonte["acao"], string> = {
  copiar: "Vai copiar para a ficha genealógica",
  ja_copiado: "Já copiado",
  sem_caso: "Pesquisa sem caso vinculado — não copia",
  sem_pessoa: "Evento sem pessoa — não copia (a ficha genealógica exige pessoa)",
};

/*
  24/09/2026 — ponte das fontes legadas da pesquisa (research_relationships,
  research_case_events) para a camada genealógica canônica. Copia, nunca
  apaga nem altera a origem; cada cópia leva a marca de origem (idempotente).
*/
function PontesDaPesquisa() {
  const pontear = useServerFn(pontearFontesDePesquisa);
  const [plano, setPlano] = useState<ItemPonte[] | null>(null);
  const [resultado, setResultado] = useState<{
    copiados: number;
    falhas: { origemId: string; motivo: string }[];
  } | null>(null);

  const m = useMutation({
    mutationFn: (confirmar: boolean) => pontear({ data: { confirmar } }),
    onSuccess: (r: any) => {
      setPlano(r.plano ?? []);
      setResultado(r.simulado ? null : { copiados: r.copiados ?? 0, falhas: r.falhas ?? [] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const aCopiar = plano ? plano.filter((p) => p.acao === "copiar").length : 0;

  return (
    <CaCard titulo="Pontes das fontes da pesquisa" className="mt-4">
      <p className="text-xs text-navy/70">
        Copia relações e eventos do módulo de pesquisa antigo para a ficha genealógica
        (/pessoas-linhagens), que é a casa canônica. A origem não é alterada nem apagada; sem
        evidência vinculada, nada é copiado como confirmado.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={m.isPending}
          onClick={() => m.mutate(false)}
          className="rounded-lg border border-navy/25 px-3 py-1.5 text-xs font-medium text-navy hover:bg-cream/50 disabled:opacity-50"
        >
          Ver o que será copiado
        </button>
        <button
          type="button"
          disabled={m.isPending || !aCopiar}
          onClick={() => m.mutate(true)}
          className="rounded bg-navy px-3 py-1.5 text-xs font-medium text-cream hover:bg-navy/90 disabled:opacity-40"
        >
          Copiar agora
        </button>
      </div>

      {m.error ? (
        <p className="mt-3 text-xs text-terracotta">{(m.error as Error).message}</p>
      ) : null}

      {resultado ? (
        <p className="mt-3 text-xs text-navy/80" data-ponte-resultado>
          {resultado.copiados} registro(s) copiado(s)
          {resultado.falhas.length ? ` · ${resultado.falhas.length} falha(s)` : ""}.
        </p>
      ) : null}
      {resultado?.falhas.length ? (
        <ul className="mt-2 space-y-1 text-xs text-terracotta">
          {resultado.falhas.map((f) => (
            <li key={f.origemId}>
              <span className="font-mono">{f.origemId}</span> — {f.motivo}
            </li>
          ))}
        </ul>
      ) : null}

      {plano && plano.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {plano.map((p) => (
            <li
              key={`${p.origem}-${p.origemId}`}
              className="rounded border border-navy/10 p-2 text-xs text-navy/75"
            >
              {p.origem === "research_relationships" ? "Relação" : "Evento"}{" "}
              <span className="font-mono">{p.origemId}</span> — {ROTULO_PONTE[p.acao]}
            </li>
          ))}
        </ul>
      ) : plano ? (
        <p className="mt-3 text-xs text-navy/70">Nada a copiar.</p>
      ) : null}
    </CaCard>
  );
}
