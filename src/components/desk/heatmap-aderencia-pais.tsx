import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { carregarHeatmapAderencia } from "@/lib/heatmap-aderencia.functions";
import { faixaDeCalor, ROTULO_FAIXA, type FaixaCalor } from "@/lib/heatmap-aderencia";

/** Intensidade por faixa; o valor e o rótulo textual sempre acompanham a cor. */
const FUNDO: Record<FaixaCalor, string> = {
  nao_calculada: "bg-cream text-navy/60 border-dashed",
  baixa: "bg-[#D6DEE9] text-navy",
  media: "bg-[#7C93B3] text-white",
  alta: "bg-navy text-white",
};

/**
 * Heatmap de aderência por país — Radar Interno (Desk). Não aparece no App
 * Cliente: o Radar do cliente tem 6 dimensões públicas, sem esta leitura.
 */
export function HeatmapAderenciaPais({ caseId }: { caseId: string }) {
  const carregar = useServerFn(carregarHeatmapAderencia);
  const q = useQuery({
    queryKey: ["heatmap-aderencia", caseId],
    queryFn: () => carregar({ data: { caseId } }),
    enabled: Boolean(caseId),
    retry: false,
  });

  return (
    <section
      className="mb-24 rounded-xl border border-navy/15 bg-cream p-4 md:mr-20"
      data-heatmap-aderencia-pais
      aria-label="Heatmap de aderência por país"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-base text-navy">Aderência por país (heatmap)</h3>
        <span className="text-[11px] uppercase tracking-wide text-navy/55">Interno · não vai ao App Cliente</span>
      </div>
      <p className="mt-1 text-xs text-navy/65">
        Aderência operacional/documental de cada ramo, sobre as evidências registradas no caso. Não é parecer jurídico,
        direito reconhecido nem elegibilidade definitiva.
      </p>

      {q.isLoading ? <p className="mt-3 text-sm text-navy/60">Carregando o heatmap…</p> : null}
      {q.isError ? (
        <p role="alert" className="mt-3 text-sm text-terracotta">
          O heatmap não pôde ser lido agora. Nenhum percentual foi inferido.
        </p>
      ) : null}
      {q.data && q.data.paises.length === 0 ? (
        <p className="mt-3 text-sm text-navy/60">
          Sem dados suficientes: este caso não tem ramo de cidadania registrado. Cadastre o ramo na Ficha Genealógica.
        </p>
      ) : null}

      {q.data && q.data.paises.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] border-separate border-spacing-1 text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-navy/55">
                <th scope="col" className="px-2 py-1 font-medium">País</th>
                <th scope="col" className="px-2 py-1 font-medium">Aderência</th>
                <th scope="col" className="px-2 py-1 font-medium">Ramos</th>
                <th scope="col" className="px-2 py-1 font-medium">Evidências-chave</th>
              </tr>
            </thead>
            <tbody>
              {q.data.paises.map((p) => {
                const faixa = faixaDeCalor(p.pct);
                return (
                  <tr key={p.pais} data-pais={p.pais}>
                    <th scope="row" className="px-2 py-2 font-medium text-navy">{p.pais}</th>
                    <td className={`rounded border border-navy/15 px-2 py-2 font-semibold ${FUNDO[faixa]}`} data-faixa={faixa}>
                      {p.pct === null ? "Aderência não calculada" : `${p.pct}% · ${ROTULO_FAIXA[faixa]}`}
                    </td>
                    <td className="px-2 py-2 text-navy/80">
                      {p.ramos.map((r) => `${r.nome}${r.pct === null ? "" : ` (${r.pct}%)`}`).join(" · ")}
                    </td>
                    <td className="px-2 py-2 text-navy/80">
                      {p.evidencias > 0 ? p.evidencias : "pendente de validação"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
