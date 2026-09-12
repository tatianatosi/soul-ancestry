import type { DocumentoAnexo, SecaoDocumento } from "@/lib/anexos-documento";

function Secao({ s }: { s: SecaoDocumento }) {
  const titulo = "titulo" in s && s.titulo ? <p className="text-[11px] font-semibold uppercase tracking-wide text-navy/55">{s.titulo}</p> : null;

  if (s.tipo === "campos") {
    return (
      <div className="space-y-1">
        {titulo}
        <dl className="divide-y divide-navy/5 rounded border border-navy/10 bg-cream/40">
          {s.linhas.map((l) => (
            <div key={l.rotulo + (l.valor ?? "")} className="grid gap-0.5 p-2 sm:grid-cols-[240px_1fr]">
              <dt className="text-[11px] text-navy/50">{l.rotulo}</dt>
              <dd className="text-xs text-navy/80">{l.valor ?? <span className="text-terracotta">{l.pendente}</span>}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  if (s.tipo === "texto") {
    return (
      <div className="space-y-1">
        {titulo}
        <p className="rounded border border-navy/10 bg-cream/30 p-2 text-xs leading-relaxed text-navy/75">{s.texto}</p>
      </div>
    );
  }
  if (s.tipo === "lista") {
    return (
      <div className="space-y-1">
        {titulo}
        {s.itens.length ? (
          <ul className="space-y-0.5 text-xs text-navy/75">
            {s.itens.map((i) => (
              <li key={i}>— {i}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-terracotta">{s.vazio ?? "Sem fonte rastreável."}</p>
        )}
      </div>
    );
  }
  if (s.tipo === "opcoes") {
    return (
      <div className="space-y-1">
        {titulo}
        <ul className="space-y-0.5 text-xs text-navy/75">
          {s.opcoes.map((o) => (
            <li key={o.rotulo}>
              <span className="font-mono text-navy/60">[{o.marcada ? "x" : " "}]</span> {o.rotulo}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {titulo}
      {s.linhas.length ? (
        <div className="overflow-x-auto">
          <table className="min-w-[620px] text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-navy/45">
              <tr>
                {s.colunas.map((c) => (
                  <th key={c} className="py-1 pr-3">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-navy/75">
              {s.linhas.map((linha, i) => (
                <tr key={i} className="border-t border-navy/10 align-top">
                  {linha.map((celula, j) => (
                    <td key={j} className="py-1.5 pr-3">
                      {celula ?? <span className="text-terracotta">pendente</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-navy/55">{s.vazio ?? "Sem registros."}</p>
      )}
    </div>
  );
}

/** Instância documental somente-leitura do anexo. Não dispara efeito externo. */
export function AnexoDocumento({ documento }: { documento: DocumentoAnexo }) {
  return (
    <details className="mt-2 rounded-lg border border-navy/12 bg-cream/20">
      <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-navy">Visualizar documento derivado da ficha (antes de salvar)</summary>
      <div className="space-y-3 border-t border-navy/10 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-navy">{documento.titulo}</p>
          <span className="rounded-full border border-terracotta/40 bg-terracotta/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-terracotta">
            {documento.marca}
          </span>
        </div>
        {!documento.aplicavel && (
          <p className="text-[11px] text-navy/55">Anexo não aplicável no momento: renderizado apenas como referência interna.</p>
        )}
        {documento.secoes.map((s, i) => (
          <Secao key={i} s={s} />
        ))}
      </div>
    </details>
  );
}
