import type { ReactNode } from "react";

import { KitBadge } from "@/components/clube-ancestral-kit/base";

/**
 * Cabeçalho de saúde do Caso 360 (Pranchas Desk v4): situação, próxima ação,
 * responsável, prazo, motivo e impacto num só bloco, acima da dobra.
 * Paleta oficial da prancha: #13294B / #1B365D sobre fundo #F0EEE9.
 *
 * A "saúde" é derivada só do que já está lido do caso (bloqueios reais,
 * próxima ação, responsável, prazo) e vem sempre escrita — nunca só por cor.
 */
export type SaudeCaso = "bloqueado" | "atencao" | "em_dia";

export function saudeDoCaso(p: {
  bloqueios: number;
  temProximaAcao: boolean;
  temResponsavel: boolean;
  temPrazo: boolean;
}): SaudeCaso {
  if (p.bloqueios > 0) return "bloqueado";
  if (!p.temProximaAcao || !p.temResponsavel || !p.temPrazo) return "atencao";
  return "em_dia";
}

const ROTULO_SAUDE: Record<SaudeCaso, string> = {
  bloqueado: "Bloqueado",
  atencao: "Atenção — falta próxima ação, responsável ou prazo",
  em_dia: "Em dia",
};

function Item({ rotulo, children, ...rest }: { rotulo: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <div {...rest}>
      <p className="text-[11px] uppercase tracking-wide text-card/60">{rotulo}</p>
      <div className="mt-0.5 break-words text-sm text-card">{children}</div>
    </div>
  );
}

export function CaseHealthHero({
  saude,
  situacao,
  proximaAcao,
  seloProximaAcao,
  responsavel,
  prazo,
  motivo,
  impacto,
  resolverBloqueio,
  children,
}: {
  saude: SaudeCaso;
  situacao: string;
  proximaAcao: string;
  seloProximaAcao?: string | null;
  responsavel: string;
  prazo: string;
  motivo: string;
  impacto: string;
  resolverBloqueio?: { href: string } | null;
  /** Ações do caso (Concluir, Reprogramar…) — renderizadas sob o cabeçalho. */
  children?: ReactNode;
}) {
  return (
    <div
      className="mb-4 min-w-0 overflow-hidden rounded-lg border border-navy/20 bg-cream"
      data-case-health-hero
      data-saude={saude}
    >
      <div className="bg-navy px-4 py-2 text-xs font-medium text-card" data-saude-rotulo>
        Saúde do caso: {ROTULO_SAUDE[saude]}
      </div>
      <div className="bg-navy-800 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Item rotulo="Situação hoje">
            <span className="font-medium">{situacao}</span>
          </Item>
          <Item rotulo="Próxima ação">
            <span className="font-medium">{proximaAcao}</span>
            {seloProximaAcao ? (
              <div className="mt-1 w-fit rounded-full bg-cream"><KitBadge tone="gold">{seloProximaAcao}</KitBadge></div>
            ) : null}
          </Item>
          <Item rotulo="Responsável">
            <span className="font-medium">{responsavel}</span>
          </Item>
          <Item rotulo="Prazo">
            <span className="font-medium">{prazo}</span>
          </Item>
          <Item rotulo="Motivo">{motivo}</Item>
          <Item rotulo="Impacto" data-caso360-impacto>
            {impacto}
            {resolverBloqueio ? (
              <a
                href={resolverBloqueio.href}
                className="mt-1 flex min-h-11 w-fit items-center text-xs font-medium text-gold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                Resolver bloqueio
              </a>
            ) : null}
          </Item>
        </div>
      </div>
      {children ? <div className="flex min-w-0 flex-wrap gap-2 bg-cream p-4">{children}</div> : null}
    </div>
  );
}
