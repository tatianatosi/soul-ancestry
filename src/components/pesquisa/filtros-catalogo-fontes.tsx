import { FILTROS_VAZIOS, filtrosAtivos, opcoesDosFiltros, type FiltrosFontes } from "@/lib/filtros-fontes";
import type { Fonte } from "@/lib/fontes-genealogicas";

/**
 * D01 (05/11/2026) — filtros do catálogo de fontes. Só leitura: opções e contagens vêm das fontes
 * gravadas; período sem registro aparece como ausência, não como opção inventada.
 */
export function FiltrosCatalogoFontes({
  fontes,
  filtros,
  aoMudar,
  totalFiltrado,
}: {
  fontes: Fonte[];
  filtros: FiltrosFontes;
  aoMudar: (f: FiltrosFontes) => void;
  totalFiltrado: number;
}) {
  const op = opcoesDosFiltros(fontes);
  const ativos = filtrosAtivos(filtros);
  const campo = (
    chave: keyof FiltrosFontes,
    rotulo: string,
    opcoes: { valor: string; rotulo: string; total: number }[],
    vazio?: string,
  ) => (
    <label className="min-w-0 text-[11px] uppercase tracking-wide text-navy/60">
      {rotulo}
      <select
        className="mt-1 block min-h-11 w-full rounded-lg border border-navy/20 bg-cream/40 px-2 text-sm normal-case tracking-normal text-navy"
        value={filtros[chave]}
        disabled={opcoes.length === 0}
        onChange={(e) => aoMudar({ ...filtros, [chave]: e.target.value })}
      >
        <option value="">{opcoes.length === 0 ? (vazio ?? "Não registrado") : "Todos"}</option>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo} ({o.total})
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <section aria-label="Filtros do catálogo" className="space-y-2" data-filtros-fontes>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {campo("pais", "País", op.pais)}
        {campo("seculo", "Período", op.seculo, "Período não registrado nas fontes")}
        {campo("tipo", "Tipo de acervo", op.tipo)}
        {campo("acesso", "Acesso", op.acesso)}
        {campo("automacao", "Grau de automação", op.automacao)}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-navy/70">
        <span>
          {ativos > 0 ? `${totalFiltrado} de ${fontes.length} fontes com ${ativos} filtro(s)` : `${fontes.length} fontes no catálogo`}
        </span>
        {op.semPeriodo > 0 ? <span>· {op.semPeriodo} sem cobertura temporal registrada</span> : null}
        {ativos > 0 ? (
          <button
            type="button"
            onClick={() => aoMudar(FILTROS_VAZIOS)}
            className="min-h-11 rounded-lg border border-navy/20 px-3 text-xs text-navy hover:bg-navy/5"
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
    </section>
  );
}
