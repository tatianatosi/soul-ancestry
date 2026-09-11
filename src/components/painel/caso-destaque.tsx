import { Link } from "@tanstack/react-router";

import { ROTULO_SINAL } from "@/lib/prioridade-matriz";
import { textoPrazo } from "@/lib/painel-dia";
import type { CasoDestaque as CasoDestaqueDados } from "@/lib/painel-caso-destaque";
import { AcoesRapidasProprietaria } from "@/components/painel/acoes-rapidas";
import { AncoraApp } from "@/components/painel/ancora-app";

/**
 * Caso de alta prioridade no topo do Hoje, como a Ana no mockup.
 * Os botões abrem a ficha canônica ou a correção auditada da proprietária.
 * Nenhuma cobrança, envio ou integração parte daqui.
 */

const TOM_SINAL: Record<string, string> = {
  critica: "border-terracotta/40 text-terracotta",
  atencao: "border-navy/20 text-navy",
  acompanhada: "border-navy/20 text-navy/60",
  sem_dados: "border-navy/15 text-navy/45",
};

export function CasoEmDestaque({
  dados,
  proprietaria,
  aoSalvar,
}: {
  dados: CasoDestaqueDados | null;
  proprietaria?: boolean;
  aoSalvar?: () => void;
}) {
  if (!dados) {
    return (
      <section data-painel-bloco="destaque" className="rounded-2xl border border-navy/10 bg-card p-4 shadow-sm sm:p-5">
        <h2 className="font-serif text-lg text-navy">Prioridade agora</h2>
        <p className="mt-2 text-sm text-navy/55">
          Nenhum registro em faixa de urgência hoje. Nada aqui é estimativa: sem sinal da matriz,
          não há destaque.
        </p>
      </section>
    );
  }

  const { item, prioridade, outrosNaMesmaFaixa } = dados;
  const caso = item.tipo === "caso";

  return (
    <section data-painel-bloco="destaque" className="rounded-2xl border border-navy/10 bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-navy/50">
          Prioridade agora
        </p>
        <AncoraApp bloco="destaque" />
        <span
          className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
            TOM_SINAL[prioridade.sinal] ?? TOM_SINAL["sem_dados"]
          }`}
        >
          {ROTULO_SINAL[prioridade.sinal]}
        </span>
      </div>

      <h2 className="mt-2 font-serif text-xl leading-tight text-navy">{item.rotulo}</h2>
      <p className="mt-2 text-sm text-navy/80">{item.acao}</p>

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

      {prioridade.faltantes.length > 0 ? (
        <p className="mt-2 break-words text-xs text-navy/55">
          <span className="font-medium text-navy/70">Falta para leitura completa: </span>
          {prioridade.faltantes.join(" · ")}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {caso ? (
          <Link
            to="/casos/$caseId"
            params={{ caseId: item.id }}
            className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-cream"
          >
            Abrir ficha e agir
          </Link>
        ) : (
          <Link to="/calls" className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-cream">
            Abrir Mesa de Discovery
          </Link>
        )}
        {caso ? (
          <Link
            to="/atendimento"
            className="rounded-full border border-navy/20 px-4 py-2 text-sm text-navy"
          >
            Registrar interação
          </Link>
        ) : null}
        <Link to="/calls" className="rounded-full border border-navy/20 px-4 py-2 text-sm text-navy">
          Mesa de Discovery
        </Link>
      </div>

      {proprietaria ? (
        <AcoesRapidasProprietaria
          tipo={caso ? "caso" : "lead"}
          id={item.id}
          aoSalvar={aoSalvar}
        />
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
