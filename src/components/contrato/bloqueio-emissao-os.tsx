/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { conciliarCatalogoProposta } from "@/lib/conciliacao-catalogo.functions";
import { resumoBloqueio, type GrupoBloqueio, type ResultadoConciliacao } from "@/lib/conciliacao-catalogo";

/**
 * Resumo legível do motivo do bloqueio de emissão de OS / Anexo I.
 * Somente leitura: reflete a conciliação contra o catálogo homologado e
 * indica quais campos precisam ser corrigidos e onde.
 */
export function BloqueioEmissaoOS({ proposalId, ativo = true }: { proposalId: string | null; ativo?: boolean }) {
  const conciliar = useServerFn(conciliarCatalogoProposta);
  const q = useQuery({
    queryKey: ["conciliacao-emissao-os", proposalId],
    queryFn: () => conciliar({ data: { proposalId: proposalId as string } }),
    enabled: !!proposalId && ativo,
    retry: false,
  });

  if (!proposalId || !ativo) return null;

  if (q.isLoading) {
    return (
      <p className="mt-3 rounded-md border border-navy/10 bg-cream/40 p-3 text-xs text-navy/60">
        Conferindo SKU, preço, vigência e escopo contra o catálogo homologado…
      </p>
    );
  }

  if (q.isError) {
    return (
      <p className="mt-3 rounded-md border border-terracotta/30 bg-terracotta/5 p-3 text-xs text-terracotta">
        Não foi possível conferir a conciliação de catálogo: {(q.error as Error).message}
      </p>
    );
  }

  const r = q.data as unknown as ResultadoConciliacao;
  if (!r) return null;

  const grupos = resumoBloqueio(r);
  const atencao = resumoBloqueio(r, { incluirAtencao: true }).flatMap((g) =>
    g.itens.filter((i) => i.severidade === "atencao"),
  );

  if (!grupos.length) {
    return (
      <div className="mt-3 rounded-md border border-navy/10 bg-cream/40 p-3">
        <p className="text-xs font-medium text-navy">Conciliação de catálogo sem bloqueio.</p>
        <p className="mt-1 text-xs text-navy/60">
          SKU {r.sku ?? "—"} homologado, preço e condição conferidos e escopo suficiente para emitir a OS / Anexo I.
        </p>
        {atencao.length > 0 && (
          <ul className="mt-2 list-disc pl-4 text-xs text-navy/60">
            {atencao.map((i) => (
              <li key={i.codigo}>Atenção: {i.descricao}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-terracotta/30 bg-terracotta/5 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
        Emissão de OS / Anexo I bloqueada — {grupos.length} motivo(s)
      </p>
      <p className="mt-1 text-xs text-navy/70">
        A OS e o Anexo I só podem ser emitidos a partir de SKU, preço, condição e escopo homologados. Corrija os campos
        abaixo e repita a emissão.
      </p>

      <ol className="mt-2 space-y-2">
        {grupos.map((g: GrupoBloqueio) => (
          <li key={g.motivo} className="rounded-md border border-navy/10 bg-cream/60 p-3">
            <p className="text-sm font-medium text-navy">{g.titulo}</p>
            <p className="mt-1 text-xs text-navy/70">{g.explicacao}</p>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">
              O que precisa ser corrigido
            </p>
            <ul className="mt-1 list-disc pl-4 text-xs text-navy">
              {g.campos.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-navy/50">Detalhe apurado</p>
            <ul className="mt-1 space-y-1 text-xs text-navy/70">
              {g.itens.map((i) => (
                <li key={i.codigo}>
                  {i.descricao}
                  {i.valor_catalogo !== null && i.valor_catalogo !== undefined && (
                    <span className="text-navy/50"> · homologado: {String(i.valor_catalogo)}</span>
                  )}
                  {i.valor_observado !== null && i.valor_observado !== undefined && (
                    <span className="text-navy/50"> · praticado: {String(i.valor_observado)}</span>
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-2 text-xs text-navy/60">Onde corrigir: {g.onde_corrigir}</p>
          </li>
        ))}
      </ol>

      {atencao.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-xs text-navy/60">
          {atencao.map((i) => (
            <li key={i.codigo}>Atenção (não bloqueia): {i.descricao}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
