import { CADEIA_SUPRIMENTO } from "@/lib/biblioteca-cadeia-pesquisa";
import { subareaBiblioteca } from "@/lib/biblioteca-mestre";

/**
 * Trilho normativo de origem: Biblioteca Mestre → Pesquisa → Fontes/validação/achados
 * → Ficha, árvore e timeline internas → Relatórios F1/F2 → App Cliente (só publicado).
 */
export function CadeiaSuprimentoPesquisa({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className="space-y-3">
      <ol className={`grid gap-2 ${compacto ? "md:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {CADEIA_SUPRIMENTO.map((e, i) => (
          <li
            key={e.chave}
            className={`rounded-lg border p-3 ${
              e.exposicaoCliente ? "border-gold/50 bg-gold/5" : "border-navy/10 bg-cream/30"
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-navy/50">
              Elo {i + 1} · {e.exposicaoCliente ? "cliente (se publicado)" : "interno"}
            </p>
            <p className="mt-0.5 text-sm font-medium text-navy">{e.rotulo}</p>
            <p className="mt-1 text-xs text-navy/60">{e.papel}</p>
            {e.origensBiblioteca.length > 0 && (
              <p className="mt-2 flex flex-wrap gap-1">
                {e.origensBiblioteca.map((o) => (
                  <span
                    key={o}
                    className="rounded border border-navy/15 bg-cream/40/60 px-1.5 py-0.5 text-[11px] text-navy/70"
                  >
                    {subareaBiblioteca(o)?.label ?? o}
                  </span>
                ))}
              </p>
            )}
            <p className="mt-2 text-[11px] text-navy/50">{e.condicao}</p>
          </li>
        ))}
      </ol>
      <p className="text-xs text-navy/60">
        Bases Genealógicas, Dicionários e Trilhas são insumos internos aprovados e versionados. Nada da Biblioteca
        Mestre é projetado ao App Cliente: o cliente só vê o que foi sanitizado, aprovado e publicado.
      </p>
    </div>
  );
}
