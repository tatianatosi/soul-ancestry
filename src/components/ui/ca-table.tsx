import type { ReactNode } from "react";

/** Tabela simples do Clube Ancestral — cabeçalho discreto, linhas com respiro. */
export function CaTable({ colunas, linhas }: { colunas: string[]; linhas: ReactNode[][] }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.14em] text-navy/50">
            {colunas.map((c) => (
              <th key={c} className="px-2 pb-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/10">
          {linhas.map((linha, i) => (
            <tr key={i} className="align-middle">
              {linha.map((celula, j) => (
                <td key={j} className="px-2 py-2.5 text-navy/85">
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
