import { Link } from "@tanstack/react-router";

import { ROTULO_SINAL } from "@/lib/prioridade-matriz";
import { textoPrazo } from "@/lib/painel-dia";
import type { CasoDestaque as CasoDestaqueDados } from "@/lib/painel-caso-destaque";

/**
 * Caso em destaque — o que a Proprietária deve olhar primeiro.
 *
 * Mostra por que este caso está no topo, com a regra que o colocou lá e o que
 * falta para uma leitura completa. Só exibe e leva ao registro canônico:
 * nenhuma ação parte daqui.
 */

const TOM_SINAL: Record<string, string> = {
  critica: "border-terracotta/50 bg-terracotta/5 text-terracotta",
  atencao: "border-gold/50 bg-gold/10 text-navy",
  acompanhada: "border-navy/20 text-navy/60",
  sem_dados: "border-navy/15 text-navy/45",
};

export function CasoEmDestaque({ dados }: { dados: CasoDestaqueDados | null }) {
  if (!dados) {
    return (
      <section
        data-painel-bloco="destaque"
        className="rounded-xl border border-navy/10 bg-white p-5"
      >
        <h2 className="font-serif text-lg text-navy">Caso em destaque</h2>
        <p className="mt-2 text-sm text-navy/55">
          Nenhum registro em faixa de urgência hoje. Nada aqui é estimativa: sem sinal da matriz,
          não há destaque.
        </p>
      </section>
    );
  }

  const { item, prioridade, outrosNaMesmaFaixa } = dados;

  return (
    <section
      data-painel-bloco="destaque"
      className="rounded-xl border border-navy/15 bg-white p-5 shadow-[0_1px_2px_rgba(16,16,16,0.04)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg text-navy">Caso em destaque</h2>
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
            TOM_SINAL[prioridade.sinal] ?? TOM_SINAL["sem_dados"]
          }`}
        >
          {ROTULO_SINAL[prioridade.sinal]}
        </span>
      </div>

      <p className="mt-3 font-serif text-2xl leading-tight text-navy">
        <Link
          to={item.tipo === "caso" ? "/casos/$caseId" : "/leads"}
          params={item.tipo === "caso" ? { caseId: item.id } : undefined}
          className="underline decoration-navy/20 underline-offset-4 hover:decoration-navy/50"
        >
          {item.rotulo}
        </Link>
      </p>

      <p className="mt-2 text-sm text-navy/75">{item.acao}</p>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
        <div>
          <dt className="uppercase tracking-wide text-navy/45">Responsável</dt>
          <dd className="mt-0.5 text-navy">{item.responsavel ?? "Sem responsável definido"}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-navy/45">Prazo</dt>
          <dd className="mt-0.5 text-navy">{textoPrazo(item.data)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide text-navy/45">Por que está no topo</dt>
          <dd className="mt-0.5 break-words text-navy">{prioridade.regra}</dd>
        </div>
      </dl>

      <p className="mt-3 break-words text-xs text-navy/60">{prioridade.explicacao}</p>

      {prioridade.faltantes.length > 0 ? (
        <p className="mt-2 break-words text-xs text-navy/55">
          <span className="font-medium text-navy/70">Falta para leitura completa: </span>
          {prioridade.faltantes.join(" · ")}
        </p>
      ) : null}

      {item.bloqueios.length > 0 ? (
        <p className="mt-2 break-words text-xs text-navy/55">
          <span className="font-medium text-navy/70">Outros bloqueios do mesmo registro: </span>
          {item.bloqueios.join(" · ")}
        </p>
      ) : null}

      {outrosNaMesmaFaixa > 0 ? (
        <p className="mt-3 text-[11px] text-navy/45">
          Outros {outrosNaMesmaFaixa} registro(s) na mesma faixa de urgência estão na fila
          priorizada abaixo.
        </p>
      ) : null}
    </section>
  );
}
