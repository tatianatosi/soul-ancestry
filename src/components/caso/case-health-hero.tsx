import type { ReactNode } from "react";

/**
 * Cabeçalho de saúde do Caso 360 (Pranchas Desk v4): situação, próxima ação,
 * responsável, prazo, motivo e impacto num só bloco, acima da dobra.
 * Paleta oficial da prancha pelos tokens: navy / navy-800 sobre fundo cream
 * (22/10/2026 — decisão da Proprietária: nada de hex fixo fora dos tokens).
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
      <p className="text-[11px] uppercase tracking-wide text-white/60">{rotulo}</p>
      <div className="mt-0.5 text-sm text-white">{children}</div>
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
      className="mb-4 overflow-hidden rounded-xl border border-navy/20 bg-cream"
      data-case-health-hero
      data-saude={saude}
    >
      <div className="bg-navy px-4 py-2 text-xs font-medium text-white" data-saude-rotulo>
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
              <span className="mt-0.5 block w-fit rounded-full border border-white/30 px-2 py-0.5 text-[10px] text-white/80">
                {seloProximaAcao}
              </span>
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
                className="mt-1 block text-xs font-medium text-gold underline underline-offset-2"
              >
                Resolver bloqueio
              </a>
            ) : null}
          </Item>
        </div>
      </div>
      {children ? <div className="flex flex-wrap gap-2 bg-cream p-4">{children}</div> : null}
    </div>
  );
}
