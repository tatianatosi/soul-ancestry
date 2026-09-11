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
  chave: "integridade" | "formalizacao" | "operacao" | "financeiro" | "cliente";
  titulo: string;
  resumo: string;
  rota: "/qualidade" | "/conversao" | "/casos" | "/financeiro" | "/atendimento";
  acao: string;
};

/** Cada grupo mora na aba dona — não é um segundo dashboard no Hoje. */
export const GRUPOS_INDICADOR: readonly GrupoIndicador[] = [
  {
    chave: "integridade",
    titulo: "Integridade",
    resumo: "Sem responsável, sem próxima ação, conflito de fonte e pendência de auditoria.",
    rota: "/qualidade",
    acao: "Abrir auditoria e integridade",
  },
  {
    chave: "formalizacao",
    titulo: "Formalização e comercial",
    resumo: "Proposta incompleta, condição comercial bloqueada, revisão pendente e contrato sem avanço.",
    rota: "/conversao",
    acao: "Abrir conversão e funil",
  },
  {
    chave: "operacao",
    titulo: "Casos e operação",
    resumo: "Documentos aguardados, prazo crítico, ausência de touchpoint e rechecagem vencida.",
    rota: "/casos",
    acao: "Abrir casos 360",
  },
  {
    chave: "financeiro",
    titulo: "Financeiro",
    resumo: "Cobrança vencida, pagamento aguardado, pagamento sem onboarding e previsão sem condição comercial.",
    rota: "/financeiro",
    acao: "Abrir financeiro",
  },
  {
    chave: "cliente",
    titulo: "Cliente",
    resumo: "Projeção aguardando aprovação, acesso pendente e comunicação humana sugerida.",
    rota: "/atendimento",
    acao: "Abrir fila humana em Atendimento",
  },
];

export function ChamadaDaAba({ chave }: { chave: GrupoIndicador["chave"] }) {
  const g = GRUPOS_INDICADOR.find((x) => x.chave === chave);
  if (!g) return null;
  return (
    <aside
      data-kpi-aba={g.chave}
      className="mb-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-sm"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-terracotta">
        KPI desta aba
      </p>
      <h2 className="mt-1 font-serif text-lg text-navy">{g.titulo}</h2>
      <p className="mt-1 text-sm text-navy/70">{g.resumo}</p>
    </aside>
  );
}

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
