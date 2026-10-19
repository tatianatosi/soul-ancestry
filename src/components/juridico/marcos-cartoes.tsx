import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { listarTrilhasJuridicas } from "@/lib/trilhas-juridicas.functions";

/**
 * Marcos jurídicos em cartões (rodada 4, 18/10/2026). Só leitura: trilha ›
 * marco, com fonte, estado e data de verificação. Contexto interno da
 * Validação Jurídica e do Discovery — nunca entra no contrato nem no App.
 */
export function MarcosJuridicosCartoes() {
  const fn = useServerFn(listarTrilhasJuridicas);
  const q = useQuery({ queryKey: ["trilhas-juridicas"], queryFn: () => fn(), retry: false });
  if (q.isPending) return <p className="mb-4 text-xs text-navy/50">Carregando marcos jurídicos…</p>;
  if (q.isError) return <p className="mb-4 text-xs text-terracotta">Não foi possível carregar os marcos jurídicos.</p>;
  const { trilhas, marcos } = q.data;
  const comMarcos = trilhas
    .map((t) => ({ t, ms: marcos.filter((m) => m.track_id === t.id) }))
    .filter((x) => x.ms.length > 0);
  const aRevisar = marcos.filter((m) => m.status !== "vigente").length;
  return (
    <section className="mb-6" data-marcos-juridicos-cartoes aria-label="Marcos jurídicos por trilha">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-xl text-navy">Marcos jurídicos por trilha</h2>
        <p className="text-xs text-navy/60">
          {trilhas.length} trilha(s) · {marcos.length} marco(s) · {aRevisar} a revisar. Uso interno; alimenta o Discovery, não o contrato.
        </p>
      </div>
      {comMarcos.length === 0 ? (
        <p className="ca-cartao-natureza text-sm text-navy/70" data-natureza="neutro">Não registrado</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {comMarcos.map(({ t, ms }) => (
            <details key={t.id} className="ca-cartao-natureza" data-natureza="pesquisa">
              <summary className="cursor-pointer list-none">
                <p className="text-[11px] uppercase tracking-wide text-navy/50">{t.pais ?? "País não registrado"}</p>
                <p className="font-serif text-base text-navy">{t.track_name ?? "Trilha sem nome registrado"}</p>
                <p className="mt-1 text-xs text-navy/60">{t.legal_reference_label ?? "Referência não registrada"}</p>
                <span className="ca-selo-natureza mt-2" data-natureza={ms.some((m) => m.status !== "vigente") ? "financeiro" : "pessoas"}>
                  {ms.some((m) => m.status !== "vigente") ? "Revisão pendente" : "Vigente"} · {ms.length} marco(s)
                </span>
              </summary>
              <ul className="mt-3 space-y-2 border-t border-navy/10 pt-2">
                {ms.map((m) => (
                  <li key={m.id} className="text-xs text-navy/80">
                    <span className="ca-selo-natureza mr-1" data-natureza={m.status === "vigente" ? "pessoas" : "atencao"}>
                      {m.status === "vigente" ? "Vigente" : "Atenção · revisar"}
                    </span>
                    {m.label}
                    <span className="block text-[11px] text-navy/50">
                      Verificado em {m.verified_at ? String(m.verified_at).slice(0, 10) : "Não registrado"}
                      {m.review_required === "obrigatoria" ? " · revisão humana obrigatória" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              {t.official_source_name ? <p className="mt-2 text-[11px] text-navy/50">Fonte: {t.official_source_name}</p> : null}
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
