import {
  FONTES_APENAS_APOIO,
  GATES_BLOQUEANTES,
  MATRIZ_ACEITE_VERSAO,
  ORDEM_FONTES,
  type BlocoRenderizado,
} from "@/lib/matriz-aceite";

function situacaoTexto(situacao: BlocoRenderizado["situacao"]): string {
  return situacao === "renderizado"
    ? "Renderizado"
    : situacao === "nao_aplicavel"
      ? "Não aplicável"
      : "Renderizado com pendência";
}

/**
 * Matriz de renderização por bloco (CONTRATO-ANA-LEITURA-EM-UMA-HORA,
 * 19/09/2026): mesmo conteúdo/colunas de antes, extraído da rota de
 * preparação de contrato para corrigir o único ponto comprovado de quebra
 * em 375px — a tabela usava `min-w-[900px]` dentro de `overflow-x-auto`,
 * forçando rolagem horizontal e cortando a leitura no mobile.
 *
 * Acima de 640px continua tabela real. Abaixo, os mesmos dados viram lista
 * vertical de rótulo/valor — nenhuma coluna é omitida, nenhum dado novo é
 * inventado.
 */
export function MatrizAceiteTabela({ blocos }: { blocos: BlocoRenderizado[] }) {
  return (
    <div className="rounded-lg border border-navy/10 bg-cream/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy/60">Matriz de renderização por bloco</p>
        <p className="text-[11px] text-navy/50">{MATRIZ_ACEITE_VERSAO}</p>
      </div>

      <div className="mt-2 hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-[11px]">
          <thead className="text-[10px] uppercase tracking-wide text-navy/45">
            <tr>
              <th className="py-1 pr-2">Bloco</th>
              <th className="py-1 pr-2">Fonte exigida</th>
              <th className="py-1 pr-2">Renderiza</th>
              <th className="py-1 pr-2">Gate</th>
              <th className="py-1">Situação</th>
            </tr>
          </thead>
          <tbody className="text-navy/75">
            {blocos.map((b) => (
              <tr key={b.bloco} className="border-t border-navy/10 align-top">
                <td className="py-1.5 pr-2 font-medium text-navy">{b.bloco}</td>
                <td className="py-1.5 pr-2">{b.fonteExigida}</td>
                <td className="py-1.5 pr-2">{b.renderiza === "sempre" ? "Sim" : "Quando aplicável"}</td>
                <td className="py-1.5 pr-2">{b.gate}</td>
                <td className={`py-1.5 ${b.situacao === "renderizado" ? "text-navy/70" : "text-terracotta"}`}>
                  {situacaoTexto(b.situacao)}
                  <span className="block text-[10px] text-navy/50">{b.motivo}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Abaixo de 640px: mesma informação, sem rolagem horizontal nem coluna cortada. */}
      <ul className="mt-2 space-y-2 sm:hidden">
        {blocos.map((b) => (
          <li key={b.bloco} className="rounded-md border border-navy/10 bg-cream/60 p-2">
            <p className="text-[11px] font-semibold text-navy">{b.bloco}</p>
            <dl className="mt-1 space-y-1 text-[11px] text-navy/75">
              <div className="flex justify-between gap-2">
                <dt className="text-navy/50">Fonte exigida</dt>
                <dd className="text-right">{b.fonteExigida}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-navy/50">Renderiza</dt>
                <dd className="text-right">{b.renderiza === "sempre" ? "Sim" : "Quando aplicável"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-navy/50">Gate</dt>
                <dd className="text-right">{b.gate}</dd>
              </div>
              <div>
                <dt className="text-navy/50">Situação</dt>
                <dd className={b.situacao === "renderizado" ? "text-navy/70" : "text-terracotta"}>
                  {situacaoTexto(b.situacao)}
                  <span className="block text-[10px] text-navy/50">{b.motivo}</span>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-navy/10 bg-cream/40 p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-navy/60">Ordem de fontes</p>
          <ol className="mt-1 space-y-0.5 text-[11px] text-navy/70">
            {ORDEM_FONTES.map((f) => (
              <li key={f.ordem}>
                {f.ordem}. {f.fonte}
              </li>
            ))}
          </ol>
          <p className="mt-1 text-[10px] text-terracotta">{FONTES_APENAS_APOIO}</p>
        </div>
        <div className="rounded border border-navy/10 bg-cream/40 p-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-navy/60">Gates bloqueantes</p>
          <ul className="mt-1 space-y-0.5 text-[11px] text-navy/70">
            {GATES_BLOQUEANTES.map((g) => (
              <li key={g}>• {g}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
