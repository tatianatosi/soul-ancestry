import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { KitBadge, KitCard, KitEmptyState, type KitTone } from "./base";
import { RadarChart, type RadarAxis } from "./visualizacao";

export type PontoMatrizPrioridade = {
  id: string;
  nome: string;
  prioridade: number;
  /** 0 = menor evidência de elegibilidade; 100 = maior evidência registrada. */
  elegibilidade: number;
  /** 0 = menor urgência; 100 = maior urgência registrada. */
  urgencia: number;
  sinal: "critica" | "atencao" | "acompanhada" | "sem_dados";
  demonstrativo?: boolean;
};

const TOM_PONTO: Record<PontoMatrizPrioridade["sinal"], string> = {
  critica: "fill-critico",
  atencao: "fill-atencao",
  acompanhada: "fill-sucesso",
  sem_dados: "fill-navy/35",
};

const TOM_BADGE: Record<PontoMatrizPrioridade["sinal"], KitTone> = {
  critica: "critical",
  atencao: "attention",
  acompanhada: "success",
  sem_dados: "neutral",
};

const ROTULO_SINAL: Record<PontoMatrizPrioridade["sinal"], string> = {
  critica: "Crítica",
  atencao: "Atenção",
  acompanhada: "Acompanhada",
  sem_dados: "Dados insuficientes",
};

/**
 * Matriz visual nominal para a carteira do Desk.
 * Não calcula prioridade: recebe posições já decididas pela fonte canônica.
 */
export function MatrizPrioridadeNominal({
  casos,
  casoSelecionado,
  onSelecionarCaso,
}: {
  casos: readonly PontoMatrizPrioridade[];
  casoSelecionado?: string | null;
  onSelecionarCaso?: (caseId: string) => void;
}) {
  if (!casos.length) {
    return (
      <KitEmptyState
        title="Dados insuficientes"
        description="A matriz não inventa coordenadas quando faltam dados de urgência ou elegibilidade."
      />
    );
  }

  const ordenados = [...casos].sort((a, b) => a.prioridade - b.prioridade);

  return (
    <figure>
      <svg
        viewBox="0 0 620 430"
        role="img"
        aria-label="Matriz nominal da carteira por urgência e elegibilidade"
        className="block w-full"
      >
        <rect x="58" y="34" width="252" height="170" className="fill-terracotta/5" />
        <rect x="310" y="34" width="252" height="170" className="fill-gold/10" />
        <rect x="58" y="204" width="252" height="170" className="fill-terracotta/[0.025]" />
        <rect x="310" y="204" width="252" height="170" className="fill-sucesso/5" />
        <line x1="58" y1="374" x2="562" y2="374" className="stroke-navy" strokeWidth="1.5" />
        <line x1="58" y1="34" x2="58" y2="374" className="stroke-navy" strokeWidth="1.5" />
        <line x1="310" y1="34" x2="310" y2="374" className="stroke-navy/10" />
        <line x1="58" y1="204" x2="562" y2="204" className="stroke-navy/10" />

        <text x="184" y="54" textAnchor="middle" className="fill-terracotta text-[11px] font-semibold uppercase">Avaliar</text>
        <text x="436" y="54" textAnchor="middle" className="fill-navy text-[11px] font-semibold uppercase">Agir agora</text>
        <text x="184" y="360" textAnchor="middle" className="fill-terracotta text-[11px] font-semibold uppercase">Monitorar</text>
        <text x="436" y="360" textAnchor="middle" className="fill-sucesso text-[11px] font-semibold uppercase">Cultivar</text>

        {ordenados.map((caso) => {
          const x = 58 + (Math.max(0, Math.min(100, caso.elegibilidade)) / 100) * 504;
          const y = 374 - (Math.max(0, Math.min(100, caso.urgencia)) / 100) * 340;
          const ancora = caso.elegibilidade > 84 ? "end" : "start";
          const deslocamento = caso.elegibilidade > 84 ? -10 : 10;
          const selecionado = caso.id === casoSelecionado;
          return (
            <g
              key={caso.id}
              role={onSelecionarCaso ? "button" : undefined}
              tabIndex={onSelecionarCaso ? 0 : undefined}
              aria-label={`${caso.prioridade}. ${caso.nome} — ${ROTULO_SINAL[caso.sinal]}`}
              onClick={() => onSelecionarCaso?.(caso.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") onSelecionarCaso?.(caso.id);
              }}
              className={onSelecionarCaso ? "cursor-pointer outline-none" : undefined}
            >
              {selecionado ? <circle cx={x} cy={y} r="11" className="fill-none stroke-gold" strokeWidth="2" /> : null}
              <circle cx={x} cy={y} r="7" className={cn(TOM_PONTO[caso.sinal], "stroke-card")} strokeWidth="2" />
              <text x={x} y={y + 3} textAnchor="middle" className="fill-card text-[7px] font-bold">{caso.prioridade}</text>
              <text x={x + deslocamento} y={y + 4} textAnchor={ancora} className="fill-navy text-[10px] font-medium">
                {caso.nome}{caso.demonstrativo ? " · demonstração" : ""}
              </text>
            </g>
          );
        })}

        <text x="310" y="414" textAnchor="middle" className="fill-navy/60 text-[11px]">Elegibilidade →</text>
        <text x="17" y="204" textAnchor="middle" transform="rotate(-90 17 204)" className="fill-navy/60 text-[11px]">Urgência →</text>
      </svg>
      <figcaption className="mt-3 grid gap-3 border-t border-navy/10 pt-3 sm:grid-cols-[1fr_auto] sm:items-start">
        <div>
          <p className="text-[10px] font-semibold uppercase text-navy/55">Ordem de atendimento</p>
          <p className="mt-1 text-[11px] text-navy">
            {ordenados.slice(0, 3).map((caso) => `${caso.prioridade}. ${caso.nome}`).join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["critica", "atencao", "acompanhada", "sem_dados"] as const).map((sinal) => (
            <KitBadge key={sinal} tone={TOM_BADGE[sinal]}>{ROTULO_SINAL[sinal]}</KitBadge>
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

export type ContextoRadarIndividual = {
  status: string;
  prioridade: string;
  urgencia: string;
  elegibilidade: string;
  responsavel: string;
  prazo: string;
  proximaAcao: string;
  bloqueios: string;
};

/** Radar interno de quatro eixos. Não usar no App Cliente, que mantém seis dimensões públicas. */
export function RadarIndividualOperacional({
  titulo,
  eixos,
  contexto,
  actions,
}: {
  titulo: string;
  eixos: RadarAxis[];
  contexto: ContextoRadarIndividual;
  actions?: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <KitCard title={titulo} action={<KitBadge tone="gold">{contexto.prioridade}</KitBadge>}>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-navy/50">Status do caso</dt><dd className="font-medium text-navy">{contexto.status}</dd></div>
          <div><dt className="text-navy/50">Urgência</dt><dd className="font-medium text-navy">{contexto.urgencia}</dd></div>
          <div><dt className="text-navy/50">Hipótese de elegibilidade</dt><dd className="font-medium text-navy">{contexto.elegibilidade}</dd></div>
          <div><dt className="text-navy/50">Responsável</dt><dd className="font-medium text-navy">{contexto.responsavel}</dd></div>
          <div><dt className="text-navy/50">Prazo</dt><dd className="font-medium text-navy">{contexto.prazo}</dd></div>
          <div className="sm:col-span-2"><dt className="text-navy/50">Próxima ação</dt><dd className="font-medium text-navy">{contexto.proximaAcao}</dd></div>
          <div className="sm:col-span-2 lg:col-span-4"><dt className="text-navy/50">Bloqueios reais</dt><dd className="font-medium text-navy">{contexto.bloqueios}</dd></div>
        </dl>
        {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
      </KitCard>
      <KitCard title="Leitura comparativa dos 4 eixos">
        {eixos.length ? (
          <RadarChart axes={eixos} label="Radar Individual com História, Documentos, Estratégia e Próximos" />
        ) : (
          <KitEmptyState title="Radar sem leitura" description="Nenhum eixo disponível para este caso." />
        )}
        <p className="mt-2 text-center text-[11px] text-navy/55">
          Leitura operacional baseada nos registros do caso; não é parecer jurídico.
        </p>
      </KitCard>
    </section>
  );
}

export function RadarInternoTemplate({
  casos,
  casoSelecionado,
  onSelecionarCaso,
  individual,
}: {
  casos: readonly PontoMatrizPrioridade[];
  casoSelecionado?: string | null;
  onSelecionarCaso?: (caseId: string) => void;
  individual?: Parameters<typeof RadarIndividualOperacional>[0];
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <KitCard title="Matriz de prioridade" eyebrow="Carteira">
        <MatrizPrioridadeNominal casos={casos} casoSelecionado={casoSelecionado} onSelecionarCaso={onSelecionarCaso} />
      </KitCard>
      {individual ? (
        <RadarIndividualOperacional {...individual} />
      ) : (
        <KitEmptyState title="Selecione um caso" description="Escolha um nome na matriz para abrir o Radar Individual." />
      )}
    </section>
  );
}