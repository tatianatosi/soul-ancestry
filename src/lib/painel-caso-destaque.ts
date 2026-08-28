/**
 * Caso em destaque do Painel Hoje.
 *
 * Vem do mockup "Fase 01" e do prompt de UX
 * `PROMPT_LOVABLE_caso360_unificado_e_painel_hoje_visual.md`, que pede um
 * bloco de caso em destaque "usando o mesmo cálculo de prioridade" — e proíbe
 * explicitamente criar um segundo cálculo paralelo.
 *
 * Esta camada é pura e só ESCOLHE: recebe itens do dia já consolidados, roda
 * `calcularPrioridade` (a mesma função da fila e de Casos 360) e devolve o
 * caso de maior urgência. Não lê banco, não escreve, não pontua por conta.
 */

import {
  calcularPrioridade,
  type ResultadoPrioridade,
  type SinalPrioridade,
} from "@/lib/prioridade-matriz";
import type { ItemDia } from "@/lib/painel-dia";

/** Ordem de gravidade dos sinais da matriz. Maior número, mais urgente. */
const PESO_SINAL: Record<SinalPrioridade, number> = {
  critica: 3,
  atencao: 2,
  acompanhada: 1,
  sem_dados: 0,
};

export type CasoDestaque = {
  item: ItemDia;
  prioridade: ResultadoPrioridade;
  /** Quantos outros registros disputavam a mesma faixa de urgência. */
  outrosNaMesmaFaixa: number;
};

/**
 * Escolhe o caso em destaque do dia.
 *
 * Critério, em ordem: maior gravidade pela matriz → prazo mais antigo →
 * identificador, para que a escolha seja estável entre renderizações com os
 * mesmos dados. Registro sem prazo nunca ganha de registro com prazo vencido.
 *
 * Devolve `null` quando não há candidato — a tela então não inventa destaque.
 */
export function escolherCasoDestaque(
  itens: readonly ItemDia[],
  opcoes?: { incluirDemo?: boolean },
): CasoDestaque | null {
  const candidatos = itens
    .filter((i) => (opcoes?.incluirDemo ? true : !i.demo))
    .map((item) => ({
      item,
      prioridade: calcularPrioridade({
        tipo: item.tipo,
        id: item.id,
        prazo: item.data,
        bloqueios: item.bloqueios,
        responsavel: item.responsavel,
        origem: item.demo ? "demo" : null,
      }),
    }))
    .filter((c) => PESO_SINAL[c.prioridade.sinal] > 0);

  if (candidatos.length === 0) return null;

  const ordenados = [...candidatos].sort((a, b) => {
    const peso = PESO_SINAL[b.prioridade.sinal] - PESO_SINAL[a.prioridade.sinal];
    if (peso !== 0) return peso;
    // Sem prazo vai para o fim: ausência de data não compete com data vencida.
    if (a.item.data !== b.item.data) {
      if (!a.item.data) return 1;
      if (!b.item.data) return -1;
      return a.item.data.localeCompare(b.item.data);
    }
    return a.item.id.localeCompare(b.item.id);
  });

  const escolhido = ordenados[0]!;
  const faixa = escolhido.prioridade.sinal;
  return {
    ...escolhido,
    outrosNaMesmaFaixa: ordenados.filter((c) => c.prioridade.sinal === faixa).length - 1,
  };
}
