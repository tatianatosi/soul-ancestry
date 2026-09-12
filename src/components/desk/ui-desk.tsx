/**
 * CA-LOVABLE-P2 — Componentes compartilhados de identidade do Desk Intelligence.
 *
 * Regras:
 * - Somente apresentação. Nenhum componente aqui lê, escreve ou deriva dado.
 * - Cores sempre por token semântico (`bg-navy`, `text-critico`, …); nunca hex.
 * - Títulos e navegação em Cormorant (`font-serif`); tabelas e dados densos
 *   em Montserrat (`font-sans`), com tabular-nums para números.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TomEstado = "neutro" | "critico" | "atencao" | "sucesso" | "bloqueio";

const TOM_TEXTO: Record<TomEstado, string> = {
  neutro: "text-navy",
  critico: "text-critico",
  atencao: "text-atencao",
  sucesso: "text-sucesso",
  bloqueio: "text-bloqueio",
};

const TOM_CLASSE: Record<TomEstado, string> = {
  neutro: "border-navy/15 bg-card text-navy/75",
  critico: "border-critico/30 bg-critico-suave text-critico",
  atencao: "border-atencao/30 bg-atencao-suave text-atencao",
  sucesso: "border-sucesso/30 bg-sucesso-suave text-sucesso",
  bloqueio: "border-bloqueio/25 bg-bloqueio-suave text-bloqueio",
};

/** Cabeçalho de página: título editorial + subtítulo + ações. */
export function PageHeader({
  titulo,
  subtitulo,
  acoes,
  className,
}: {
  titulo: string;
  subtitulo?: string;
  acoes?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="font-serif text-2xl leading-tight text-navy">{titulo}</h2>
        {subtitulo ? <p className="mt-1 max-w-2xl text-sm text-navy/65">{subtitulo}</p> : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </div>
  );
}

/** Cabeçalho de seção dentro de uma página. */
export function SectionHeader({
  titulo,
  descricao,
  acoes,
  etiqueta,
}: {
  titulo: string;
  descricao?: string;
  acoes?: ReactNode;
  etiqueta?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        {etiqueta ? (
          <p className="text-[11px] font-medium uppercase tracking-widest text-navy/55">
            {etiqueta}
          </p>
        ) : null}
        <h3 className="font-serif text-lg leading-snug text-navy">{titulo}</h3>
        {descricao ? <p className="text-xs text-navy/60">{descricao}</p> : null}
      </div>
      {acoes ? <div className="flex flex-wrap items-center gap-2">{acoes}</div> : null}
    </div>
  );
}

/** Cartão de indicador. Sem dado, exibe "Sem dados suficientes" — nunca estimativa. */
export function CardIndicador({
  rotulo,
  valor,
  apoio,
  tom = "neutro",
}: {
  rotulo: string;
  valor: string | number | null | undefined;
  apoio?: string;
  tom?: TomEstado;
}) {
  const temValor = valor !== null && valor !== undefined && valor !== "";
  return (
    <div className="rounded-xl border border-navy/10 bg-card p-4 shadow-[0_1px_2px_rgba(16,16,16,0.04)]">
      <p className="text-[11px] font-medium uppercase tracking-widest text-navy/55">{rotulo}</p>
      <p
        className={cn(
          "mt-1 font-serif text-3xl leading-none tabular-nums",
          temValor ? TOM_TEXTO[tom] : "text-navy/40",
        )}
      >
        {temValor ? valor : "—"}
      </p>
      <p className="mt-1 text-xs text-navy/55">
        {temValor ? (apoio ?? "") : "Sem dados suficientes"}
      </p>
    </div>
  );
}

/** Alerta de estado. Informa; nunca dispara ação externa. */
export function AlertaDesk({
  tom = "atencao",
  titulo,
  children,
}: {
  tom?: TomEstado;
  titulo: string;
  children?: ReactNode;
}) {
  return (
    <div role="status" className={cn("rounded-xl border p-3 text-sm", TOM_CLASSE[tom])}>
      <p className="font-medium">{titulo}</p>
      {children ? <div className="mt-1 text-navy/70">{children}</div> : null}
    </div>
  );
}

/** Etiqueta curta de estado. */
export function BadgeDesk({ texto, tom = "neutro" }: { texto: string; tom?: TomEstado }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        TOM_CLASSE[tom],
      )}
    >
      {texto}
    </span>
  );
}

/** Barra de filtros: agrupa controles com respiro consistente. */
export function BarraFiltros({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-navy/10 bg-card p-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Moldura de tabela densa: Montserrat, números tabulares e rolagem horizontal segura. */
export function TabelaDesk({
  cabecalho,
  children,
  legenda,
}: {
  cabecalho: readonly string[];
  children: ReactNode;
  legenda?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-navy/10 bg-card">
      <table className="w-full min-w-[36rem] font-sans text-sm tabular-nums">
        {legenda ? <caption className="sr-only">{legenda}</caption> : null}
        <thead>
          <tr className="border-b border-navy/10 bg-card text-left">
            {cabecalho.map((c) => (
              <th
                key={c}
                scope="col"
                className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-navy/60"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/5 text-navy/85">{children}</tbody>
      </table>
    </div>
  );
}

/** Estado vazio padrão do Desk. */
export function VazioDesk({
  titulo,
  descricao,
  acao,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-card p-8 text-center">
      <p className="font-serif text-lg text-navy">{titulo}</p>
      {descricao ? <p className="mx-auto mt-1 max-w-md text-sm text-navy/60">{descricao}</p> : null}
      {acao ? <div className="mt-3 flex justify-center">{acao}</div> : null}
    </div>
  );
}

/** Estado de carregamento com skeleton — sem texto que sugira dado existente. */
export function CarregandoDesk({
  linhas = 3,
  rotulo = "Carregando",
}: {
  linhas?: number;
  rotulo?: string;
}) {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{rotulo}</span>
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-xl border border-navy/10 bg-card" />
      ))}
    </div>
  );
}
