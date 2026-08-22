/**
 * Texto-base institucional — somente leitura.
 * Nenhuma cláusula fixa é editável por caso.
 */

import {
  CLAUSULAS_FIXAS,
  CONTRATO_BASE_AVISO,
  CONTRATO_BASE_ID,
  CONTRATO_BASE_MODELO,
  CONTRATO_BASE_STATUS,
  CONTRATO_BASE_VERSAO,
  PERFIL_INSTITUCIONAL,
  PERFIL_INSTITUCIONAL_VERSAO,
  PREAMBULO_CONTRATO_BASE,
} from "@/lib/contrato-base-consolidado";

export function ContratoBaseTexto({ compacto = false }: { compacto?: boolean }) {
  return (
    <section className="rounded-xl border border-navy/10 bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg text-navy">Contrato-base consolidado — texto fixo</h2>
        <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-navy/70">
          {CONTRATO_BASE_STATUS} · {CONTRATO_BASE_VERSAO}
        </span>
      </div>
      <p className="mt-1 font-mono text-[10px] text-navy/40">
        {CONTRATO_BASE_ID} · {CONTRATO_BASE_MODELO}
      </p>
      <p className="mt-2 rounded-lg border border-terracotta/30 bg-terracotta/5 p-3 text-xs text-navy/75">{CONTRATO_BASE_AVISO}</p>

      <div className="mt-4 rounded-lg border border-navy/10 bg-cream/40 p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">
          Perfil institucional da contratada · {PERFIL_INSTITUCIONAL_VERSAO} (não editável na ficha de caso)
        </p>
        <dl className="mt-2 grid gap-1 sm:grid-cols-2">
          {PERFIL_INSTITUCIONAL.map((c) => (
            <div key={c.campo} className="text-xs">
              <dt className="text-navy/45">{c.rotulo}</dt>
              <dd className="text-navy">{c.valor}</dd>
            </div>
          ))}
        </dl>
      </div>

      {!compacto && <p className="mt-4 text-xs leading-relaxed text-navy/75">{PREAMBULO_CONTRATO_BASE}</p>}

      <ol className="mt-4 space-y-3">
        {CLAUSULAS_FIXAS.map((cl) => (
          <li key={cl.numero} className="rounded-lg border border-navy/10 p-3">
            <p className="text-sm font-medium text-navy">
              Cláusula {cl.numero} — {cl.titulo}
            </p>
            <ul className="mt-1 space-y-1">
              {cl.itens.map((i) => (
                <li key={i} className="text-xs leading-relaxed text-navy/70">
                  {i}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
