/**
 * Apresentação visual G1–G5 da aba Árvore (mockup 17).
 *
 * Não inventa pessoas, vínculos nem elegibilidade. A estrutura de gerações é
 * chrome de interface; o conteúdo vem só de `arvoreSanitizada` (publicações
 * autorizadas). Sem projeção tipada por geração, os nós permanecem anônimos.
 */

import type { PublicacaoCliente } from "@/lib/projecoes-cliente";

export type GeracaoArvoreId = "G1" | "G2" | "G3" | "G4" | "G5";

export type GeracaoArvore = {
  id: GeracaoArvoreId;
  rotulo: string;
  /** Quantidade de slots visuais no mockup (não é censo genealógico). */
  slots: number;
};

/** Escala canônica do mockup — G1 (você) … G5 (ancestrais). */
export const GERACOES_ARVORE: readonly GeracaoArvore[] = [
  { id: "G1", rotulo: "G1 · Você", slots: 1 },
  { id: "G2", rotulo: "G2 · Avós", slots: 2 },
  { id: "G3", rotulo: "G3 · Bisavós", slots: 4 },
  { id: "G4", rotulo: "G4 · Bisavós de bisavós", slots: 4 },
  { id: "G5", rotulo: "G5 · Ancestrais", slots: 3 },
] as const;

/**
 * Corte 2b (29/09/2026) — o mockup (p. 6/17) desenha a árvore de cima para
 * baixo: ancestrais no topo, você embaixo. A ordem dos dados continua G1→G5.
 */
export const GERACOES_ARVORE_EXIBICAO: readonly GeracaoArvore[] = [...GERACOES_ARVORE].reverse();

/**
 * "de um universo de 31 possíveis nas 5 gerações" (mockup): 1+2+4+8+16 — o
 * total teórico de ascendentes diretos em cinco gerações, não uma meta.
 */
export const PESSOAS_POSSIVEIS_CINCO_GERACOES = 31;

/**
 * Estado honesto de um slot sem nome liberado (correção 2026-09-12, pedido
 * da Proprietária): "em pesquisa" quando a equipe já publicou algo sobre a
 * árvore (sinal real de trabalho em andamento), "a publicar" quando ainda
 * não há nenhuma publicação. É um estado agregado do caso — nunca um status
 * inventado por pessoa/slot, que exigiria dado que não existe no portal.
 */
export type EstadoSlotArvore = "voce" | "em_pesquisa" | "a_publicar";

export type PainelArvoreGeracoes = {
  geracoes: readonly GeracaoArvore[];
  /** Publicações já sanitizadas; nunca sintetizadas aqui. */
  notasPublicadas: PublicacaoCliente[];
  /** Há material de árvore liberado — chrome pode destacar a estrutura. */
  temPublicacao: boolean;
  /** Estado a mostrar em qualquer slot sem nome liberado (fora G1). */
  estadoSlotAnonimo: "em_pesquisa" | "a_publicar";
};

export function painelArvoreGeracoes(
  publicacoes: PublicacaoCliente[],
): PainelArvoreGeracoes {
  const notasPublicadas = publicacoes.filter((p) => p.tipo === "arvore");
  const temPublicacao = notasPublicadas.length > 0;
  return {
    geracoes: GERACOES_ARVORE,
    notasPublicadas,
    temPublicacao,
    estadoSlotAnonimo: temPublicacao ? "em_pesquisa" : "a_publicar",
  };
}
