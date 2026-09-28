/**
 * Corte U3 (28/09/2026) — decisões que só a equipe toma, vistas no dado real
 * do caso. Só leitura: a tela diz o que foi visto e onde decidir; nada é
 * alterado daqui.
 */
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { EstadoDados } from "@/components/saas/estado-dados";
import { lerPendenciasHumanasCaso } from "@/lib/pendencias-humanas-caso.functions";

export function PendenciasHumanasCaso({ caseId, titulo }: { caseId: string; titulo?: string }) {
  const ler = useServerFn(lerPendenciasHumanasCaso);
  const q = useQuery({
    queryKey: ["pendencias-humanas-caso", caseId],
    queryFn: () => ler({ data: { caseId } }),
    retry: false,
  });
  return (
    <section className="rounded-lg border border-terracotta/30 bg-cream/40 p-3" data-pendencias-humanas-caso>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-navy">{titulo ?? "Decisões pendentes da equipe"}</h3>
        <span className="text-[11px] text-navy/55">Só leitura · nada é alterado sozinho</span>
      </div>
      <div className="mt-2">
        <EstadoDados
          carregando={q.isLoading}
          erro={q.error}
          dados={q.data}
          aoTentarNovamente={() => void q.refetch()}
          recurso="as decisões pendentes do caso"
          vazio="Nenhuma decisão pendente encontrada no dado deste caso."
        >
          {(lista) => (
            <ul className="space-y-1.5">
              {lista.map((p, i) => (
                <li key={`${p.tipo}-${i}`} className="rounded border border-terracotta/30 bg-white/60 p-2 text-xs text-navy/80">
                  <p className="font-medium text-navy">{p.titulo}</p>
                  <p className="mt-0.5">{p.detalhe}</p>
                  <p className="mt-0.5 font-medium text-navy">→ Onde decidir: {p.ondeDecidir}</p>
                </li>
              ))}
            </ul>
          )}
        </EstadoDados>
      </div>
    </section>
  );
}
