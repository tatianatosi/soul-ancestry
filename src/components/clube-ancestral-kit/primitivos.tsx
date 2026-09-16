/**
 * CORTE 2 DO DESIGN SYSTEM — primitivas canônicas do Clube Ancestral.
 *
 * Fonte de valores: `src/styles/tokens-clube-ancestral.css` (Corte 1, aprovado).
 * Nenhum hex literal aqui; toda cor vem de classe semântica ligada a token.
 *
 * Escopo do Corte 2 — exatamente quatro primitivas:
 *   1. CartaoCA        — moldura única (sem nova hierarquia de borda/sombra).
 *   2. SeloCA          — selo de estado, sempre com texto visível.
 *   3. IndicadorCA     — KPI com rótulo, valor e fonte/período (+ FaixaIndicadoresCA, máx. 4).
 *   4. VazioCA         — estado vazio com frase específica e no máximo uma ação.
 *
 * Proibido nesta rodada: tabela, gráfico, timeline, jornada, formulário e navegação.
 * Componentes antigos continuam existindo; a migração acontece por wrappers.
 */
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Estados canônicos (regras-de-uso.md)
 *   azul = em andamento · dourado = aguardando · verde = concluído
 *   terracota = vencido/atenção · cinza = ausente/não aplicável
 * ------------------------------------------------------------------ */
export type EstadoCA =
  | "em_andamento"
  | "aguardando"
  | "concluido"
  | "atencao"
  | "ausente";

/** Classe de superfície do selo, por estado. */
const ESTADO_SELO: Record<EstadoCA, string> = {
  em_andamento: "border-navy/25 bg-navy/10 text-navy",
  aguardando: "border-atencao/30 bg-atencao-suave text-atencao",
  concluido: "border-sucesso/30 bg-sucesso-suave text-sucesso",
  atencao: "border-critico/30 bg-critico-suave text-critico",
  ausente: "border-navy/15 bg-cream/70 text-navy/75",
};

/** Classe de texto/valor, por estado (usada pelo indicador). */
const ESTADO_TEXTO: Record<EstadoCA, string> = {
  em_andamento: "text-navy",
  aguardando: "text-atencao",
  concluido: "text-sucesso",
  atencao: "text-critico",
  ausente: "text-navy",
};

/* ------------------------------------------------------------------ *
 * 1. Cartão
 * ------------------------------------------------------------------ */

/**
 * Moldura única de conteúdo. Reproduz o recorte já em uso (raio, borda 1px,
 * fundo creme, sombra mínima) — não introduz nova hierarquia visual.
 * `interativo` apenas acrescenta foco/hover para cartões clicáveis.
 */
export function CartaoCA({
  children,
  className,
  interativo = false,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  interativo?: boolean;
  as?: "div" | "section" | "article" | "li";
} & Record<string, unknown>) {
  return (
    <Tag
      className={cn(
        "min-w-0 w-full max-w-full rounded-xl border border-navy/10 bg-cream/50 p-4 shadow-[0_1px_2px_rgba(16,16,16,0.04)]",
        interativo &&
          "transition-colors hover:border-navy/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ *
 * 2. Selo / etiqueta de estado
 * ------------------------------------------------------------------ */

/** Selo de estado. O texto é obrigatório: cor nunca é o único sinal. */
export function SeloCA({
  texto,
  estado = "ausente",
  className,
}: {
  texto: string;
  estado?: EstadoCA;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        ESTADO_SELO[estado],
        className,
      )}
    >
      {texto}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * 3. Indicador (KPI)
 * ------------------------------------------------------------------ */

export type IndicadorProps = {
  /** Rótulo humano — nunca nome técnico de tabela ou coluna. */
  rotulo: string;
  valor: string | number | null | undefined;
  /** Fonte e/ou período do número. Ausente ⇒ "Sem dados suficientes". */
  fonte?: string;
  estado?: EstadoCA;
  className?: string;
};

/**
 * Cartão de indicador. Sem valor, exibe "Sem dados suficientes" —
 * nunca estimativa, nunca zero inventado.
 */
export function IndicadorCA({
  rotulo,
  valor,
  fonte,
  estado = "ausente",
  className,
}: IndicadorProps) {
  const temValor = valor !== null && valor !== undefined && valor !== "";
  return (
    <CartaoCA className={className}>
      <p className="text-[11px] font-medium uppercase tracking-widest text-navy/55">{rotulo}</p>
      <p
        className={cn(
          "mt-1 font-serif text-3xl leading-none tabular-nums",
          temValor ? ESTADO_TEXTO[estado] : "text-navy/40",
        )}
      >
        {temValor ? valor : "—"}
      </p>
      <p className="mt-1 text-xs text-navy/55">
        {temValor ? (fonte ?? "") : "Sem dados suficientes"}
      </p>
    </CartaoCA>
  );
}

/** Limite canônico de indicadores por superfície. */
export const MAX_INDICADORES_POR_SUPERFICIE = 4;

/**
 * Faixa de indicadores. Aplica o teto de quatro por superfície:
 * o excedente não é renderizado (e é avisado em desenvolvimento).
 */
export function FaixaIndicadoresCA({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const itens = Array.isArray(children) ? children.flat() : [children];
  const visiveis = itens.filter(Boolean).slice(0, MAX_INDICADORES_POR_SUPERFICIE);
  if (import.meta.env.DEV && itens.filter(Boolean).length > MAX_INDICADORES_POR_SUPERFICIE) {
    console.warn(
      `[design-system] Máximo de ${MAX_INDICADORES_POR_SUPERFICIE} indicadores por superfície; excedente ignorado.`,
    );
  }
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>{visiveis}</div>
  );
}

/* ------------------------------------------------------------------ *
 * 4. Estado vazio
 * ------------------------------------------------------------------ */

/**
 * Estado vazio honesto. `titulo` e `descricao` devem ser específicos da
 * superfície. No máximo uma ação — e ação desativada não é aceita:
 * quando não houver ação válida, mostra só a explicação.
 */
export function VazioCA({
  titulo,
  descricao,
  acao,
  className,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-navy/20 bg-cream/40 p-8 text-center",
        className,
      )}
    >
      <p className="font-serif text-lg text-navy">{titulo}</p>
      {descricao ? <p className="mx-auto mt-1 max-w-md text-sm text-navy/60">{descricao}</p> : null}
      {acao ? <div className="mt-3 flex justify-center">{acao}</div> : null}
    </div>
  );
}
