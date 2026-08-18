/* eslint-disable @typescript-eslint/no-explicit-any */
import { Painel, Selo } from "@/components/comercial/base";
import { bloqueiosResolutivos } from "@/lib/bloqueios-dicionario";

function irPara(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("ring-2", "ring-terracotta");
  window.setTimeout(() => el.classList.remove("ring-2", "ring-terracotta"), 2200);
}

/** Painel resolutivo: cada bloqueio explica o impacto e leva ao campo afetado. */
export function PainelBloqueios({
  bloqueios,
  valores,
  pendencias,
}: {
  bloqueios: { chave: string; motivo: string }[];
  valores: any[];
  pendencias: any[];
}) {
  const lista = bloqueiosResolutivos(bloqueios, valores as any);
  const impeditivos = lista.filter((b) => b.impeditivo).length;

  return (
    <Painel titulo={`Bloqueios acionáveis (${lista.length} · ${impeditivos} impeditivo(s))`}>
      {lista.length === 0 ? (
        <p className="text-sm text-navy/70">Sem bloqueios: geração final e solicitação de assinatura liberadas.</p>
      ) : (
        <ul className="space-y-2">
          {lista.map((b, i) => (
            <li key={`${b.chave}-${i}`} className="rounded-lg border border-navy/15 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-navy">{b.titulo}</p>
                <Selo texto={b.impeditivo ? "Impeditivo" : "Não impeditivo"} tom={b.impeditivo ? "erro" : "alerta"} />
              </div>
              <p className="mt-1 text-xs text-navy/70">{b.motivo}</p>
              <p className="mt-1 text-xs text-navy/60">
                <strong>Bloqueia:</strong> {b.oQueBloqueia}
              </p>
              <p className="text-xs text-navy/60">
                <strong>Como resolver:</strong> {b.comoResolver}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {b.camposAfetados.slice(0, 12).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => irPara(`campo-${c.id}`)}
                    className="rounded-full border border-navy/20 px-2 py-0.5 text-[11px] text-navy/80 hover:bg-navy/5"
                  >
                    Ir para: {c.label}
                  </button>
                ))}
                {b.camposAfetados.length === 0 && (
                  <button
                    onClick={() => irPara(b.ancora)}
                    className="rounded-full border border-navy/20 px-2 py-0.5 text-[11px] text-navy/80 hover:bg-navy/5"
                  >
                    Ir para a seção responsável
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {pendencias.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-navy/70">
          {pendencias.map((p: any) => (
            <li key={p.campo}>
              {p.label} <span className="text-navy/50">({p.grupo})</span> — {p.motivo}
            </li>
          ))}
        </ul>
      )}
    </Painel>
  );
}
