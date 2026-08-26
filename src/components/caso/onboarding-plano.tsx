import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Secao } from "@/components/caso/campos";
import {
  carregarPlanoOnboarding,
  recalcularPlanoOnboarding,
} from "@/lib/onboarding-plano.functions";
import { CadenciaOnboarding } from "@/components/caso/cadencia-onboarding";
import { ESTADO_PLANO, STATUS_DOSSIE, STATUS_GRUPO_FAMILIAR } from "@/lib/onboarding-plano";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

/**
 * Plano de onboarding preparado — nunca ativa o cliente.
 * Sem boas-vindas enviadas, magic link, publicação de App, pasta ou grupo externo.
 */
export function PainelPlanoOnboarding({ caseId }: { caseId: string }) {
  const carregar = useServerFn(carregarPlanoOnboarding);
  const recalcular = useServerFn(recalcularPlanoOnboarding);

  const q = useQuery({
    queryKey: ["plano-onboarding", caseId],
    queryFn: () => carregar({ data: { caseId } }),
  });

  const m = useMutation({
    mutationFn: () => recalcular({ data: { caseId } }),
    onSuccess: () => q.refetch(),
  });

  if (q.isLoading) return <p className="text-sm text-navy/55">Carregando plano de onboarding…</p>;
  const plano = q.data?.plano ?? null;
  if (!plano) {
    return (
      <Secao titulo="Plano de onboarding" descricao="Preparação interna, sem ativação de cliente.">
        <p className="text-sm text-navy/55">Nenhum plano de onboarding preparado para este caso.</p>
      </Secao>
    );
  }

  const motivos: string[] = (q.data?.motivos ?? []) as string[];
  const checklist: Linha[] = Array.isArray(plano.checklist_inicial) ? plano.checklist_inicial : [];
  const acoes: Linha[] = Array.isArray(plano.plano_acao) ? plano.plano_acao : [];
  const touchpoints: Linha[] = Array.isArray(plano.touchpoints) ? plano.touchpoints : [];
  const rascunhos: Linha[] = (q.data?.rascunhos ?? []) as Linha[];

  return (
    <div className="space-y-5">
      <Secao
        titulo="Plano de onboarding"
        descricao="Preparação apenas: nenhuma boas-vindas enviada, magic link, publicação de App, pasta ou grupo externo."
      >
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide ${
              plano.estado === "bloqueado"
                ? "bg-terracotta/10 text-terracotta"
                : "bg-gold/15 text-navy"
            }`}
          >
            {ESTADO_PLANO[String(plano.estado)] ?? plano.estado}
          </span>
          <button
            onClick={() => m.mutate()}
            disabled={m.isPending}
            className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs text-navy disabled:opacity-40"
          >
            Recalcular estado pelos gates
          </button>
        </div>

        {motivos.length > 0 ? (
          <ul className="mt-3 space-y-1 text-xs text-terracotta">
            {motivos.map((mo) => (
              <li key={mo}>○ {mo}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-navy/55">
            Gates atendidos: plano elegível para preparação. A ativação do cliente continua sendo
            decisão humana.
          </p>
        )}

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Campo rotulo="Responsável principal" valor={plano.responsavel_principal} />
          <Campo
            rotulo="Dossiê-mãe"
            valor={`${STATUS_DOSSIE[String(plano.dossie_mae_status)] ?? plano.dossie_mae_status}${plano.dossie_mae_referencia ? ` · ${plano.dossie_mae_referencia}` : ""}`}
          />
          <Campo rotulo="Ambiente autorizado" valor={plano.ambiente_autorizado} />
          <Campo rotulo="Nível de acesso" valor={plano.nivel_acesso} />
          <Campo
            rotulo="Grupo familiar"
            valor={
              STATUS_GRUPO_FAMILIAR[String(plano.grupo_familiar_status)] ??
              plano.grupo_familiar_status
            }
          />
          <Campo
            rotulo="Primeira micro-entrega"
            valor={`Até D${plano.primeira_microentrega_prazo_dias} após o início`}
          />
        </dl>
        {plano.primeira_microentrega_descricao ? (
          <p className="mt-3 text-xs text-navy/60">{plano.primeira_microentrega_descricao}</p>
        ) : null}
      </Secao>

      <Secao
        titulo="Checklist inicial"
        descricao="Itens organizados internamente, sem solicitação externa enviada."
      >
        <ul className="space-y-1 text-sm text-navy/80">
          {checklist.map((c, i) => (
            <li key={i}>
              • {c.item} —{" "}
              <span className="text-xs text-navy/55">
                {c.responsavel} · {c.status}
              </span>
            </li>
          ))}
        </ul>
      </Secao>

      {/*
        26/08/2026 — "Plano de ação" e "Touchpoints previstos" eram dois blocos
        do mesmo assunto: uma lista numerada e uma grade de cartões. Nenhum dos
        dois dizia QUANDO — o prazo estava escrito à mão ("D3 após início") e
        parava ali, sem virar data e sem virar atraso.

        Agora são um trilho só, na ordem do calendário.
      */}
      <CadenciaOnboarding plano={plano} />

      <Secao
        titulo="Filas de comunicação em rascunho"
        descricao="Nenhum envio: todo rascunho depende de aprovação humana."
      >
        {rascunhos.length === 0 ? (
          <p className="text-sm text-navy/55">Nenhum rascunho pendente.</p>
        ) : (
          <ul className="space-y-2">
            {rascunhos.map((r) => (
              <li key={r.id} className="rounded-lg border border-navy/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-navy">{r.assunto}</p>
                  <span className="text-[11px] uppercase tracking-wide text-navy/50">
                    rascunho · não enviado
                  </span>
                </div>
                <p className="mt-1 text-xs text-navy/60">{r.corpo_rascunho}</p>
              </li>
            ))}
          </ul>
        )}
      </Secao>
    </div>
  );
}

function Campo({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wide text-navy/50">{rotulo}</dt>
      <dd className="text-navy/80">{valor || "—"}</dd>
    </div>
  );
}
