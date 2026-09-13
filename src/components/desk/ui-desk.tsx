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
import { AlertTriangle, CheckCircle2, CircleGauge, Minus } from "lucide-react";

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
  neutro: "border-navy/15 bg-cream/70 text-navy/75",
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
    <div className="rounded-lg border border-navy/10 bg-card p-4 shadow-sm">
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

export function FaixaDecisao({
  contexto,
  titulo,
  descricao,
  fonte,
  atualizado,
  children,
}: {
  contexto: string;
  titulo: string;
  descricao: string;
  fonte: string;
  atualizado?: string;
  children?: ReactNode;
}) {
  return (
    <section className="mb-6 border-b border-navy/15 pb-6" aria-labelledby="faixa-decisao-titulo">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-navy/55">{contexto}</p>
          <h2 id="faixa-decisao-titulo" className="mt-1 font-serif text-3xl leading-tight text-navy">{titulo}</h2>
          <p className="mt-1 text-sm leading-relaxed text-navy/65">{descricao}</p>
        </div>
        <div className="text-right text-[11px] leading-relaxed text-navy/55">
          <p>Fonte: {fonte}</p>
          <p>{atualizado ?? "Atualizado nesta leitura"}</p>
        </div>
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

export function IndicadorExecutivo({
  rotulo,
  valor,
  apoio,
  tom = "neutro",
}: {
  rotulo: string;
  valor: string | number | null | undefined;
  apoio: string;
  tom?: TomEstado;
}) {
  const temValor = valor !== null && valor !== undefined;
  const Icone = tom === "critico" ? AlertTriangle : tom === "sucesso" ? CheckCircle2 : tom === "atencao" ? CircleGauge : Minus;
  return (
    <article className="min-w-0 rounded-lg border border-navy/10 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-navy/60">{rotulo}</p>
        <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", TOM_CLASSE[tom])} aria-hidden="true">
          <Icone className="h-4 w-4" />
        </span>
      </div>
      <p className={cn("mt-3 font-serif text-3xl leading-none tabular-nums", temValor ? TOM_TEXTO[tom] : "text-navy/40")}>
        {temValor ? valor : "—"}
      </p>
      <p className="mt-2 min-h-8 text-xs leading-relaxed text-navy/55">{temValor ? apoio : "Fonte indisponível nesta leitura"}</p>
    </article>
  );
}

export type DadoGrafico = { rotulo: string; valor: number };

export function BarrasCompactas({ dados, vazio = "Sem dados suficientes." }: { dados: DadoGrafico[]; vazio?: string }) {
  if (dados.length === 0) return <p className="py-6 text-center text-sm text-navy/50">{vazio}</p>;
  const maior = Math.max(...dados.map((item) => item.valor), 1);
  return (
    <div className="space-y-3" role="img" aria-label={dados.map((item) => `${item.rotulo}: ${item.valor}`).join(", ")}>
      {dados.map((item) => (
        <div key={item.rotulo} className="grid grid-cols-[minmax(7rem,0.8fr)_minmax(6rem,1fr)_2.5rem] items-center gap-3">
          <span className="truncate text-xs text-navy/65" title={item.rotulo}>{item.rotulo}</span>
          <span className="h-2 overflow-hidden rounded-full bg-cream" aria-hidden="true">
            <span className="block h-full rounded-full bg-navy" style={{ width: `${Math.max(4, (item.valor / maior) * 100)}%` }} />
          </span>
          <strong className="text-right text-xs tabular-nums text-navy">{item.valor}</strong>
        </div>
      ))}
    </div>
  );
}

export function EstadoFonte({ erro, nome }: { erro: unknown; nome: string }) {
  if (!erro) return null;
  return (
    <div role="status" className="mb-3 rounded-md border border-critico/25 bg-critico-suave px-3 py-2 text-xs text-critico">
      {nome}: fonte indisponível nesta leitura. Nenhum valor foi presumido.
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
    <div role="status" className={cn("rounded-lg border p-3 text-sm", TOM_CLASSE[tom])}>
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
        "mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-navy/10 bg-card p-2",
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
    <div className="overflow-x-auto rounded-lg border border-navy/10 bg-card">
      <table className="w-full min-w-[36rem] font-sans text-sm tabular-nums">
        {legenda ? <caption className="sr-only">{legenda}</caption> : null}
        <thead>
          <tr className="border-b border-navy/10 bg-cream/50 text-left">
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
    <div className="rounded-lg border border-dashed border-navy/20 bg-card/60 p-8 text-center">
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
        <div key={i} className="h-12 animate-pulse rounded-lg border border-navy/10 bg-card" />
      ))}
    </div>
  );
}
