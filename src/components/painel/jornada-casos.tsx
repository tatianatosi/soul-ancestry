import { Link } from "@tanstack/react-router";

import { etapaQuePedeAtencao, lerJornada, type CasoNaJornada } from "@/lib/painel-jornada";

/**
 * Jornada dos casos — as oito fases como percurso, com a saúde de contato
 * dentro de cada uma.
 *
 * Não é uma lista de casos: é onde a carteira está. Cada etapa leva para os
 * casos daquela fase, então a jornada funciona como navegação, e o que está
 * parado aparece na própria etapa em que parou.
 */
export function JornadaCasos({ casos }: { casos: readonly CasoNaJornada[] }) {
  const leitura = lerJornada(casos);
  const atencao = etapaQuePedeAtencao(leitura);

  if (!leitura.total) return null;

  return (
    <section id="jornada-dos-casos" className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg text-navy">Jornada dos casos</h2>
        <p className="text-xs text-navy/55">
          {leitura.total} caso(s) · a etapa mostra onde cada um está e há quanto tempo está sem
          toque
        </p>
      </div>

      {atencao ? (
        <p className="mt-2 text-xs text-terracotta">
          Onde olhar primeiro: <span className="font-medium">{atencao.rotulo}</span> —{" "}
          {atencao.semToque} caso(s) sem toque
          {atencao.piorEspera !== null ? `, o mais parado há ${atencao.piorEspera} dias` : ""}.
        </p>
      ) : (
        <p className="mt-2 text-xs text-navy/55">
          Nenhuma etapa com caso parado por falta de toque.
        </p>
      )}

      {/* O percurso. Etapa vazia continua visível: o vazio diz onde a carteira
          não tem ninguém, e isso é leitura, não ruído. */}
      <ol className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {leitura.etapas.map((e) => {
          const parado = e.semToque > 0;
          const vazia = e.total === 0;
          return (
            <li key={e.id}>
              <Link
                to="/casos"
                search={{ fase: e.id } as never}
                className={`block h-full rounded-lg border p-3 transition-colors ${
                  vazia
                    ? "border-navy/10 bg-cream/30 hover:bg-cream/50"
                    : parado
                      ? "border-terracotta/40 bg-terracotta/5 hover:bg-terracotta/10"
                      : "border-navy/15 bg-white hover:bg-navy/5"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-navy/45">
                    Etapa {e.ordem}
                  </span>
                  <span className={`font-serif text-2xl ${vazia ? "text-navy/30" : "text-navy"}`}>
                    {e.total}
                  </span>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-navy/85">{e.rotulo}</p>
                {/* O que o cliente lê da mesma etapa, no App. */}
                <p className="mt-0.5 text-[11px] italic text-navy/45">“{e.rotuloCliente}”</p>

                {parado ? (
                  <p className="mt-2 text-[11px] text-terracotta">
                    {e.semToque} sem toque
                    {e.piorEspera !== null ? ` · há ${e.piorEspera} dias` : ""}
                  </p>
                ) : vazia ? (
                  <p className="mt-2 text-[11px] text-navy/40">Nenhum caso aqui</p>
                ) : (
                  <p className="mt-2 text-[11px] text-navy/50">Cadência em dia</p>
                )}

                {e.exemplo && parado ? (
                  <p className="mt-1 truncate text-[11px] text-navy/55">Ex.: {e.exemplo.rotulo}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Nada some em silêncio: o que não coube no catálogo aparece nomeado. */}
      {leitura.foraDoCatalogo.length || leitura.semFase ? (
        <p className="mt-3 text-[11px] text-navy/45">
          {leitura.semFase ? `${leitura.semFase} caso(s) sem fase registrada. ` : ""}
          {leitura.foraDoCatalogo.length
            ? `Fora do catálogo de fases: ${leitura.foraDoCatalogo
                .map((f) => `${f.fase} (${f.total})`)
                .join(", ")}.`
            : ""}
        </p>
      ) : null}
    </section>
  );
}
