/**
 * Blocos compartilhados das superfícies do Desk.
 *
 * A navegação paralela das prévias foi retirada: cada superfície agora vive
 * dentro da tela dona, com o shell aprovado do Desk (seis grupos).
 */
import type { ReactNode } from "react";

import { SaasShell } from "@/components/saas/shell";
import { SuperficieGoLive } from "@/components/golive/superficie";
import { cn } from "@/lib/utils";

/**
 * Compatibilidade para as prévias que ainda não têm tela dona: usa o shell
 * do Desk, nunca um menu próprio.
 */
export function GoLiveShell({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  return (
    <SaasShell titulo={titulo} descricao={descricao} visualKit="pantone">
      <SuperficieGoLive titulo={titulo} descricao={descricao}>
        {children}
      </SuperficieGoLive>
    </SaasShell>
  );
}


export function Vazio({ cta }: { cta: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-navy/20 bg-white/60 p-6 text-center">
      <p className="text-sm text-navy/70">Sem itens nesta etapa</p>
      <div className="mt-3 flex justify-center">{cta}</div>
    </div>
  );
}

export function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-navy/10 bg-white/70 p-4">
      <h2 className="mb-3 font-serif text-base text-navy">{titulo}</h2>
      <div className="min-w-0 space-y-2">{children}</div>
    </section>
  );
}

export function GradeDesk({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>;
}

export function FaixaKpis({
  itens,
}: {
  itens: Array<{
    rotulo: string;
    valor: string | number;
    tom?: TomSelo;
    fonte?: string;
    formula?: string;
    periodo?: string;
    estado?: string;
  }>;
}) {
  return (
    <section aria-label="Resumo" className="grid min-w-0 grid-cols-2 gap-2 lg:grid-cols-4">
      {itens.slice(0, 4).map((item) => (
        <div key={item.rotulo} className="min-w-0 border-l-2 border-gold bg-white px-3 py-2 shadow-sm">
          <p className="break-words text-[11px] uppercase text-navy/55">{item.rotulo}</p>
          <p className="mt-1 break-words font-serif text-2xl leading-none text-navy">{item.valor}</p>
          {item.tom ? <Selo tom={item.tom}>{rotuloTom(item.tom)}</Selo> : null}
          <details className="mt-2 border-t border-navy/10 pt-1.5 text-left">
            <summary className="cursor-pointer text-[10px] font-medium text-navy/55">Fonte e cálculo</summary>
            <dl className="mt-1.5 space-y-1 text-[10px] leading-snug text-navy/65">
              <div><dt className="inline font-semibold text-navy">Fonte: </dt><dd className="inline">{item.fonte ?? "Registros reais desta superfície"}</dd></div>
              <div><dt className="inline font-semibold text-navy">Fórmula: </dt><dd className="inline">{item.formula ?? `Contagem dos registros classificados como “${item.rotulo}”`}</dd></div>
              <div><dt className="inline font-semibold text-navy">Período: </dt><dd className="inline">{item.periodo ?? "Estado atual"}</dd></div>
              <div><dt className="inline font-semibold text-navy">Estado: </dt><dd className="inline">{item.estado ?? (item.tom === "cinza" ? "Sem registros" : rotuloTom(item.tom ?? "azul"))}</dd></div>
            </dl>
          </details>
        </div>
      ))}
    </section>
  );
}

export type TomSelo = "azul" | "dourado" | "verde" | "terracota" | "cinza";

function rotuloTom(tom: TomSelo) {
  return {
    azul: "Em andamento",
    dourado: "Aguardando decisão",
    verde: "Concluído",
    terracota: "Atenção",
    cinza: "Sem registros",
  }[tom];
}

export function Selo({ tom, children }: { tom: TomSelo; children: ReactNode }) {
  return (
    <span
      className={cn(
        "mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase",
        tom === "azul" && "border-navy/20 bg-navy/10 text-navy",
        tom === "dourado" && "border-gold/40 bg-gold/20 text-atencao",
        tom === "verde" && "border-sucesso/25 bg-sucesso-suave text-sucesso",
        tom === "terracota" && "border-terracotta/25 bg-critico-suave text-terracotta",
        tom === "cinza" && "border-border bg-muted text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}
