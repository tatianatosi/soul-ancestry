import { montarCorpoContratual, PREENCHIMENTO_FICHA, temasSemTextoVersionado } from "@/lib/corpo-contratual";

/**
 * Corpo do contrato: texto fixo versionado, 14 temas.
 * A ficha contratual só preenche partes, serviço/escopo, entrega, comercial,
 * anexos, prazo e referências.
 */
export function CorpoContratualVersionado() {
  const corpo = montarCorpoContratual();
  const faltantes = temasSemTextoVersionado();

  return (
    <section className="rounded-xl border border-navy/12 bg-white/70 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-navy">Corpo do contrato — texto fixo versionado</p>
        <span className="text-[11px] uppercase tracking-wide text-navy/50">
          {corpo.versao} · {corpo.modelo} · {corpo.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-navy/60">
        Os 14 temas abaixo são texto institucional versionado. Nenhum deles é campo editável por caso.
      </p>

      <div className="mt-3 rounded-lg border border-gold/30 bg-gold/5 p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">A ficha contratual preenche apenas</p>
        <ul className="mt-1 space-y-0.5 text-xs text-navy/75">
          {PREENCHIMENTO_FICHA.map((p) => (
            <li key={p.grupo}>
              <span className="font-medium text-navy">{p.grupo}</span> — {p.descricao}
            </li>
          ))}
        </ul>
      </div>

      {faltantes.length > 0 && (
        <p className="mt-3 rounded-lg border border-terracotta/40 bg-terracotta/5 p-2 text-xs text-terracotta">
          Temas sem texto versionado correspondente: {faltantes.join("; ")}
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-navy/70">{corpo.preambulo}</p>

      <ol className="mt-3 space-y-3">
        {corpo.blocos.map((b) => (
          <li key={b.tema.id} className="rounded-lg border border-navy/10 bg-cream/30 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-navy/45">{b.tema.id}</span>
              <span className="text-xs font-semibold text-navy">{b.tema.tema}</span>
              <span className="rounded-full border border-navy/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/55">
                Texto fixo · não editável por caso
              </span>
              <span className="text-[10px] uppercase tracking-wide text-navy/40">
                Cláusulas {b.tema.clausulas.join(", ")} · matriz {b.tema.matriz.join(", ")}
              </span>
            </div>
            {b.tema.preenchidoPelaFicha.length > 0 && (
              <p className="mt-1 text-[11px] text-navy/55">
                Preenchido pela ficha: {b.tema.preenchidoPelaFicha.join(", ")} (apenas parâmetros).
              </p>
            )}
            <div className="mt-2 space-y-2">
              {b.clausulas.map((c) => (
                <div key={c.numero}>
                  <p className="text-[11px] font-medium text-navy/70">
                    {c.numero}. {c.titulo}
                  </p>
                  <ul className="mt-1 space-y-0.5 text-xs leading-relaxed text-navy/70">
                    {c.itens.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
