/**
 * Primitivas visuais do mockup (VISUAL-ONLY).
 * Sem dados reais, sem backend, sem efeito externo.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  titulo,
  eyebrow,
  acao,
  children,
  className,
}: {
  titulo?: string;
  eyebrow?: string;
  acao?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-navy/10 bg-card p-4 shadow-sm sm:p-5", className)}>
      {(titulo || acao) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">{eyebrow}</p>
            )}
            {titulo && <h3 className="font-serif text-lg text-navy">{titulo}</h3>}
          </div>
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}

export function Kpi({ rotulo, valor, nota }: { rotulo: string; valor: string; nota?: string }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-card p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/50">{rotulo}</p>
      <p className="mt-1 font-serif text-2xl text-navy">{valor}</p>
      {nota && <p className="mt-1 text-xs text-navy/60">{nota}</p>}
    </div>
  );
}

const TONS = {
  ok: "bg-emerald-100 text-emerald-900 border-emerald-200",
  atencao: "bg-amber-100 text-amber-900 border-amber-200",
  critico: "bg-red-100 text-red-900 border-red-200",
  neutro: "bg-navy/5 text-navy border-navy/15",
  gold: "bg-gold/20 text-navy border-gold/40",
} as const;

export type Tom = keyof typeof TONS;

export function Badge({ children, tom = "neutro" }: { children: ReactNode; tom?: Tom }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", TONS[tom])}>
      {children}
    </span>
  );
}

export function Dot({ tom = "neutro" }: { tom?: Tom }) {
  const cor = tom === "ok" ? "bg-emerald-500" : tom === "atencao" ? "bg-amber-500" : tom === "critico" ? "bg-red-500" : "bg-navy/30";
  return <span className={cn("inline-block size-2.5 rounded-full", cor)} />;
}

export function Tabela({ colunas, linhas }: { colunas: string[]; linhas: ReactNode[][] }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.14em] text-navy/50">
            {colunas.map((c) => (
              <th key={c} className="px-2 pb-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/8">
          {linhas.map((l, i) => (
            <tr key={i} className="align-middle">
              {l.map((cel, j) => (
                <td key={j} className="px-2 py-2.5 text-navy/85">
                  {cel}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubAbas({
  itens,
  atual,
  onChange,
}: {
  itens: { id: string; nome: string }[];
  atual: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {itens.map((i) => (
        <button
          key={i.id}
          onClick={() => onChange(i.id)}
          className={cn(
            "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition",
            atual === i.id ? "bg-navy text-cream" : "bg-navy/5 text-navy/70 hover:bg-navy/10",
          )}
        >
          {i.nome}
        </button>
      ))}
    </div>
  );
}

export function Vazio({ texto }: { texto: string }) {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-navy/[0.02] p-6 text-center text-sm text-navy/55">
      {texto}
    </div>
  );
}

export function Barra({ valor, rotulo }: { valor: number; rotulo?: string }) {
  return (
    <div>
      {rotulo && (
        <div className="mb-1 flex justify-between text-xs text-navy/60">
          <span>{rotulo}</span>
          <span>{valor}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-navy/10">
        <div className="h-full rounded-full bg-gold" style={{ width: `${valor}%` }} />
      </div>
    </div>
  );
}

export function Lista({ itens }: { itens: { titulo: string; nota?: string; tom?: Tom; badge?: string }[] }) {
  return (
    <ul className="space-y-2">
      {itens.map((i) => (
        <li
          key={i.titulo}
          className="flex items-start justify-between gap-3 rounded-xl border border-navy/10 bg-cream/60 px-3 py-2.5"
        >
          <div>
            <p className="text-sm font-medium text-navy">{i.titulo}</p>
            {i.nota && <p className="text-xs text-navy/60">{i.nota}</p>}
          </div>
          {i.badge && <Badge tom={i.tom ?? "neutro"}>{i.badge}</Badge>}
        </li>
      ))}
    </ul>
  );
}
