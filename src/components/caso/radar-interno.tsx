import { ESTADO_EIXO_LABEL, ESTADO_EIXO_TOM, type EixoRadar } from "@/lib/radar-eixos";

/**
 * Radar Individual (micro) do caso — ver src/lib/radar-interno-caso.ts para
 * a taxonomia (mesmos 4 eixos do Radar do cliente) e a fonte de cada campo.
 */
export function RadarInternoCaso({ eixos }: { eixos: EixoRadar[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {eixos.map((eixo) => (
        <article key={eixo.id} className="rounded-lg border border-navy/10 bg-cream/50 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-sm text-navy">{eixo.titulo}</h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${ESTADO_EIXO_TOM[eixo.estado]}`}
            >
              {ESTADO_EIXO_LABEL[eixo.estado]}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-navy/55">{eixo.resumo}</p>
          {eixo.itens.length > 0 ? (
            <dl className="mt-2 space-y-1">
              {eixo.itens.map((i) => (
                <div key={i.rotulo} className="flex justify-between gap-2 text-xs text-navy/70">
                  <dt className="text-navy/50">{i.rotulo}</dt>
                  <dd className="text-right font-medium text-navy">{i.valor}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-2 text-xs text-navy/50">{eixo.mensagemVazio}</p>
          )}
        </article>
      ))}
    </div>
  );
}
