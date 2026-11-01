import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { radarMarcosJuridicosDoPainel } from "@/lib/radar-marcos-juridicos.functions";

/**
 * Radar de marcos jurídicos × casos afetados (P25, religado em 31/10/2026).
 * Só leitura, uso interno: para cada marco real da trilha, quantos casos
 * ativos dependem dela. Sem caso ligado a contagem é 0 — nunca "sem dado".
 */
export function RadarMarcosCasos() {
  const ler = useServerFn(radarMarcosJuridicosDoPainel);
  const q = useQuery({ queryKey: ["radar-marcos-juridicos"], queryFn: () => ler(), retry: false });
  if (q.isPending)
    return <p className="mt-4 text-xs text-navy/50">Carregando casos afetados por marco…</p>;
  if (q.isError) {
    return (
      <p className="mt-4 text-xs text-terracotta">
        Não foi possível carregar os casos afetados por marco.
      </p>
    );
  }
  const linhas = q.data;
  return (
    <div className="mt-4" data-radar-marcos-casos>
      <h3 className="font-serif text-base text-navy">Casos afetados por marco</h3>
      {linhas.length === 0 ? (
        <p className="mt-1 text-xs text-navy/60">Nenhum marco registrado.</p>
      ) : (
        <ul className="mt-2 divide-y divide-navy/10 rounded border border-navy/10 bg-white text-xs text-navy">
          {linhas.map((l) => (
            <li
              key={l.marcoId}
              className="flex flex-wrap items-baseline justify-between gap-2 px-3 py-1.5"
            >
              <span>
                <strong>{l.pais}</strong> · {l.trilhaCode} — {l.marco}
                {l.revisaoObrigatoria ? (
                  <span className="text-terracotta"> · revisão obrigatória</span>
                ) : null}
              </span>
              <span className="text-navy/70">
                {l.casosAfetados} caso(s) afetado(s) · {l.statusMarco}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
