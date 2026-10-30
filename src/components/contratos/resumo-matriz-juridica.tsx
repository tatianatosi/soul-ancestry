/**
 * Resumo da matriz jurídica real em /contratos (Frente 4, 19/10/2026).
 *
 * `legal_clause_matrix` existe de fato no banco, mas guarda TEMAS normativos
 * decididos pela revisão jurídica — nunca o texto corrido de cláusula (ver
 * `src/lib/matriz-juridica.ts`). A contagem abaixo é lida da própria tabela
 * (via `listarMatrizJuridica`, já usado em /matriz-juridica), não escrita de
 * cabeça: hoje são os mesmos temas de `TEMAS_JURIDICOS`. Somente leitura.
 */
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { CaCard } from "@/components/ui/ca-card";
import { listarMatrizJuridica } from "@/lib/crm-desk.functions";
import { temasBloqueantesPendentes, type LinhaMatriz } from "@/lib/matriz-juridica";

export function ResumoMatrizJuridica() {
  const carregar = useServerFn(listarMatrizJuridica);
  const q = useQuery({ queryKey: ["matriz-juridica-resumo"], queryFn: () => carregar(), retry: false });

  if (q.isLoading) {
    return (
      <CaCard variante="compacto" titulo="Matriz jurídica (legal_clause_matrix)">
        <p className="text-xs text-navy/60">Carregando temas…</p>
      </CaCard>
    );
  }
  if (q.error || !q.data) {
    return (
      <CaCard variante="compacto" titulo="Matriz jurídica (legal_clause_matrix)">
        <p role="alert" className="text-xs text-terracotta">
          Não foi possível ler a matriz jurídica agora. Vazia por falha de leitura, não por ausência de temas.
        </p>
      </CaCard>
    );
  }

  const linhas = q.data as LinhaMatriz[];
  const pendentes = temasBloqueantesPendentes(linhas);

  return (
    <CaCard variante="compacto" titulo="Matriz jurídica (legal_clause_matrix)" data-resumo-matriz-juridica>
      <p className="text-xs text-navy/70">
        <span className="font-semibold text-navy" data-total-temas-matriz-juridica>
          {linhas.length}
        </span>{" "}
        tema(s) normativo(s) lidos de <code className="font-mono text-[11px]">legal_clause_matrix</code>
        {pendentes.length ? (
          <>
            {" "}·{" "}
            <span className="font-medium text-terracotta">{pendentes.length} bloqueante(s) sem decisão</span>
          </>
        ) : (
          " · nenhum bloqueante sem decisão"
        )}
        .
      </p>
      <p className="mt-1 text-[11px] text-navy/50">
        Registra decisão por tema, não texto de cláusula (ver{" "}
        <Link to="/matriz-juridica" className="text-terracotta underline">
          Validação jurídica completa
        </Link>
        ).
      </p>
    </CaCard>
  );
}
