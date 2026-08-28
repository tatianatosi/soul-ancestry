import { Link } from "@tanstack/react-router";

import { EXCECAO_CONDICAO_COMERCIAL } from "@/lib/catalogo-referencia";
import type { LinhaIndicadorDia } from "@/lib/painel-dia";

/**
 * Sinais de atenção por grupo, fundidos em "Encontrar no Desk".
 *
 * Decisão da Proprietária (25/08): deixaram de ser bloco próprio. Cada grupo já
 * era só contagem, gravidade e um link para a página canônica — ou seja, a
 * mesma coisa que o bloco de descoberta faz, com a camada de severidade por
 * cima. Fundidos, o Painel Hoje volta aos cinco blocos do CA-UX-02 §6 sem
 * perder nenhuma informação.
 *
 * Continua valendo a regra do CA-UX-03: aqui só se conta e se linka. Nenhum
 * item vira linha de trabalho, tarefa, prazo ou comunicação.
 */

export type GrupoIndicador = {
  chave: string;
  titulo: string;
  resumo: string;
  rota: string;
  acao: string;
};

const CLASSE_GRAVIDADE: Record<string, string> = {
  P0: "border-terracotta/50 bg-terracotta/5 text-terracotta",
  P1: "border-gold/50 bg-gold/10 text-navy",
  P2: "border-navy/20 text-navy/60",
};

export function SinaisPorGrupo({
  grupos,
  agrupado,
  maiorGravidade,
  bloqueadosCatalogo,
}: {
  grupos: readonly GrupoIndicador[];
  agrupado: Record<string, LinhaIndicadorDia[]>;
  maiorGravidade: (ls: LinhaIndicadorDia[]) => LinhaIndicadorDia["severidade"] | null;
  bloqueadosCatalogo: readonly unknown[];
}) {
  return (
    <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {grupos.map((g) => {
        const linhas = agrupado[g.chave] ?? [];
        const grave = maiorGravidade(linhas);
        return (
          <div key={g.chave} className="min-w-0 rounded-lg border border-navy/10 px-3 py-2">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2">
              <span className="min-w-0 break-words text-sm font-medium text-navy">{g.titulo}</span>
              <span className="flex shrink-0 items-center gap-1.5">
                <span className="font-serif text-lg tabular-nums text-navy">{linhas.length}</span>
                {grave ? (
                  <span
                    className={`rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${
                      CLASSE_GRAVIDADE[grave] ?? CLASSE_GRAVIDADE["P2"]
                    }`}
                  >
                    {grave}
                  </span>
                ) : null}
              </span>
            </div>
            <p className="mt-0.5 break-words text-[11px] text-navy/55">
              {linhas[0]?.motivo ?? g.resumo}
            </p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Link to={g.rota} className="text-[11px] text-navy underline underline-offset-2">
                {g.acao}
              </Link>
              {g.chave === "formalizacao" && bloqueadosCatalogo.length > 0 ? (
                <Link to="/catalogo" className="text-[11px] text-navy underline underline-offset-2">
                  Governança de Catálogo ({bloqueadosCatalogo.length}) —{" "}
                  {EXCECAO_CONDICAO_COMERCIAL}
                </Link>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
