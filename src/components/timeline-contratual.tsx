import type { CaseData, EtapaContratual } from "@/types/case";
import { cn } from "@/lib/utils";
import { preenchido } from "@/lib/evidence";
import {
  STATUS_ETAPA_LABEL,
  STATUS_ETAPA_TOM,
  statusClienteAmigavel,
  timelineCliente,
  timelineInterna,
} from "@/lib/visibilidade";

/**
 * Timeline contratual.
 * - Desk: etapas completas, com responsável, próxima ação e visibilidade.
 * - Minha Conta: resumo apenas das etapas marcadas como cliente/ambas.
 * Datas só aparecem quando realmente preenchidas — nunca datas fictícias.
 */

const VISIBILIDADE_LABEL = {
  cliente: "Cliente",
  interna: "Interna",
  ambas: "Cliente + equipe",
} as const;

function Ponto({ status }: { status: EtapaContratual["status"] }) {
  return (
    <span
      className={cn(
        "mt-1 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border-2",
        status === "concluido" && "border-sage bg-sage",
        status === "em_andamento" && "border-gold bg-gold",
        status === "aguardando" && "border-terracotta bg-white",
        status === "bloqueado" && "border-plum bg-white",
        status === "nao_iniciado" && "border-navy/25 bg-white",
      )}
    />
  );
}

export function TimelineContratualDesk({ caso }: { caso: CaseData }) {
  const etapas = timelineInterna(caso);
  if (etapas.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-serif text-xl text-navy">Timeline contratual do caso</h3>
          <p className="mt-1 text-[12px] text-navy/70">
            Estados operacionais reais. Datas aparecem somente quando registradas.
          </p>
        </div>
        <span className="rounded-full border border-plum/30 bg-plum/10 px-3 py-1 text-[11px] font-semibold text-plum">
          Visão interna
        </span>
      </div>

      <ol className="mt-5 space-y-0">
        {etapas.map((e, i) => (
          <li key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
            {i < etapas.length - 1 && (
              <span className="absolute left-[6px] top-5 h-full w-px bg-border" aria-hidden />
            )}
            <Ponto status={e.status} />
            <div className="min-w-0 flex-1 rounded-xl border border-border bg-cream/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-navy">{e.titulo}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      STATUS_ETAPA_TOM[e.status],
                    )}
                  >
                    {STATUS_ETAPA_LABEL[e.status]}
                  </span>
                  <span className="rounded-full border border-navy/15 bg-white px-2.5 py-0.5 text-[11px] text-navy/70">
                    {VISIBILIDADE_LABEL[e.visibilidade]}
                  </span>
                </div>
              </div>
              {preenchido(e.descricao) && (
                <p className="mt-1.5 text-[12px] leading-relaxed text-navy/75">{e.descricao}</p>
              )}
              {preenchido(e.motivo_bloqueio) && (
                <p className="mt-1.5 text-[12px] italic text-plum">{e.motivo_bloqueio}</p>
              )}
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-navy/70">
                {preenchido(e.data) && (
                  <div>
                    <dt className="inline text-navy/50">Data: </dt>
                    <dd className="inline font-medium text-navy">{e.data}</dd>
                  </div>
                )}
                {preenchido(e.responsavel) && (
                  <div>
                    <dt className="inline text-navy/50">Responsável: </dt>
                    <dd className="inline font-medium text-navy">{e.responsavel}</dd>
                  </div>
                )}
              </dl>
              {preenchido(e.proxima_acao) && (
                <p className="mt-2 text-[11px] italic text-navy/70">
                  Próxima ação: {e.proxima_acao}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TimelineContratualCliente({ caso }: { caso: CaseData }) {
  const etapas = timelineCliente(caso);
  if (etapas.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div className="text-[11px] uppercase tracking-widest text-terracotta">
        Andamento da formalização
      </div>
      <ol className="mt-4 space-y-0">
        {etapas.map((e, i) => (
          <li key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < etapas.length - 1 && (
              <span className="absolute left-[6px] top-5 h-full w-px bg-border" aria-hidden />
            )}
            <Ponto status={e.status} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[13px] font-semibold text-navy">{e.titulo}</div>
                <span className="text-[11px] font-medium text-navy/60">
                  {statusClienteAmigavel(e.status)}
                </span>
              </div>
              {preenchido(e.descricao) && (
                <p className="mt-1 text-[12px] leading-relaxed text-navy/75">{e.descricao}</p>
              )}
              {preenchido(e.data) && (
                <div className="mt-1 text-[11px] text-navy/55">{e.data}</div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 rounded-xl border border-gold/40 bg-cream p-3 text-[12px] leading-relaxed text-navy">
        As etapas avançam conforme a confirmação dos registros. Você será avisada a cada liberação.
      </p>
    </section>
  );
}
