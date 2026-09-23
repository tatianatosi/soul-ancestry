/**
 * Posicionamento de cada caso na matriz Elegibilidade × Urgência.
 *
 * 26/08/2026 — a Proprietária perguntou se o radar interno com a matriz de
 * prioridades tinha sido resgatado. Resposta: **o motor sim, a matriz não**.
 * `prioridade-matriz.ts` existe desde o P1.2, com regras nomeadas e campo
 * canônico por fator — mas era consumido só como etiqueta numa coluna de
 * tabela e como sinal no caso em destaque. Nenhuma tela desenhava a matriz.
 *
 * Este módulo dá coordenada ao que o motor já decide. Ele NÃO recalcula nada:
 * chama `calcularPrioridade` e traduz o resultado em posição. Sem eixo novo,
 * sem score paralelo, sem número inventado.
 */

import {
  calcularPrioridade,
  type EixoElegibilidade,
  type EntradaPrioridade,
  type ResultadoPrioridade,
  type SinalPrioridade,
} from "@/lib/prioridade-matriz";

/**
 * Colunas da matriz, da hipótese mais forte para a mais fraca.
 *
 * A ordem é de leitura, não de peso: o motor não soma nada, e esta lista só
 * decide onde cada coluna fica na tela.
 */
export const ELEGIBILIDADE_ORDEM: readonly EixoElegibilidade[] = [
  "forte",
  "provavel",
  "possivel_com_pesquisa",
  "baixa",
  "inconclusiva",
  "nao_avaliada",
] as const;

/** Rótulo humano por hipótese de elegibilidade — fonte única, reaproveitada pela grade e pela lista de situação. */
export const ROTULO_ELEGIBILIDADE: Record<EixoElegibilidade, string> = {
  forte: "Forte",
  provavel: "Provável",
  possivel_com_pesquisa: "Possível com pesquisa",
  baixa: "Baixa",
  inconclusiva: "Inconclusiva",
  nao_avaliada: "Não avaliada",
};

/** As quatro faixas de urgência, da mais fria para a mais quente. */
export const FAIXAS_URGENCIA = [
  { id: "sem_base", rotulo: "Sem base" },
  { id: "em_dia", rotulo: "Em dia" },
  { id: "aproximando", rotulo: "Aproximando" },
  { id: "vencida", rotulo: "Vencida" },
] as const;
export type FaixaUrgencia = (typeof FAIXAS_URGENCIA)[number]["id"];

/** Rótulo humano por faixa de urgência — fonte única, reaproveitada pela grade e pela lista de situação. */
export const ROTULO_URGENCIA: Record<FaixaUrgencia, string> = Object.fromEntries(
  FAIXAS_URGENCIA.map((f) => [f.id, f.rotulo]),
) as Record<FaixaUrgencia, string>;

export type CasoPosicionado = {
  id: string;
  rotulo: string;
  /** Coluna: força da hipótese de elegibilidade. */
  elegibilidade: EixoElegibilidade;
  /** Linha: quão quente está o prazo/cadência. */
  urgencia: FaixaUrgencia;
  sinal: SinalPrioridade;
  regra: string;
  porque: string;
  /** Fatores sem fonte — a razão de o caso não ter posição confiável. */
  pendencias: string[];
};

/**
 * Traduz o resultado do motor em faixa de urgência.
 *
 * A faixa vem da regra que o motor aplicou, não de um cálculo paralelo: se
 * ele decidiu por urgência vencida, a faixa é vencida. Caso sem base de
 * cadência nem prazo cai em "sem base" — e aparece na matriz assim mesmo,
 * porque sumir seria pior que aparecer sem posição.
 */
function faixaDaUrgencia(r: ResultadoPrioridade): FaixaUrgencia {
  const regra = r.regra ?? "";
  if (regra.includes("urgencia_vencida")) return "vencida";
  const prazo = r.fatores.find((f) => f.codigo === "prazo");
  const cadencia = r.fatores.find((f) => f.codigo === "urgencia");
  if (!prazo?.disponivel && !cadencia?.disponivel) return "sem_base";
  if (r.sinal === "atencao") return "aproximando";
  return "em_dia";
}

export function posicionar(
  caso: { id: string; rotulo: string } & EntradaPrioridade,
  hoje?: string,
): CasoPosicionado {
  const r = hoje ? calcularPrioridade(caso, hoje) : calcularPrioridade(caso);
  const elegibilidadeFator = r.fatores.find((f) => f.codigo === "elegibilidade");

  return {
    id: caso.id,
    rotulo: caso.rotulo,
    elegibilidade: (elegibilidadeFator?.disponivel
      ? (elegibilidadeFator.valor as EixoElegibilidade)
      : "nao_avaliada") as EixoElegibilidade,
    urgencia: faixaDaUrgencia(r),
    sinal: r.sinal,
    regra: r.regra ?? "—",
    porque: r.explicacao,
    pendencias: r.fatores.filter((f) => f.pendencia).map((f) => f.pendencia as string),
  };
}

export type CelulaMatriz = {
  elegibilidade: EixoElegibilidade;
  urgencia: FaixaUrgencia;
  casos: CasoPosicionado[];
};

/**
 * Monta a grade completa. Célula vazia continua existindo: o vazio de um
 * quadrante é leitura — diz que não há ninguém naquela combinação.
 */
export function montarMatriz(casos: readonly CasoPosicionado[]): CelulaMatriz[][] {
  return [...FAIXAS_URGENCIA].reverse().map((u) =>
    ELEGIBILIDADE_ORDEM.map((e) => ({
      elegibilidade: e,
      urgencia: u.id,
      casos: casos.filter((c) => c.elegibilidade === e && c.urgencia === u.id),
    })),
  );
}

/** Casos que a matriz não consegue posicionar com confiança. */
export function semPosicaoConfiavel(casos: readonly CasoPosicionado[]): CasoPosicionado[] {
  return casos.filter((c) => c.sinal === "sem_dados" || c.urgencia === "sem_base");
}
