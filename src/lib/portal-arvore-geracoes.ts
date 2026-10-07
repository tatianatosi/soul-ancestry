/**
 * Apresentação visual G1–G10 da aba Árvore.
 *
 * G1–G5 são o mockup aprovado de 17 páginas (contrato visual normativo,
 * intocado). G6–G10 são ampliação explícita da Proprietária em 05/10/2026
 * ("expandir a árvore até a 10a geração"), depois de medir ascendentes
 * documentados em geração 6 e 7 que o modelo de 5 gerações não comportava.
 * Sem página de mockup para G6–G10, o rótulo fica neutro (geração numerada,
 * sem termo de parentesco inventado em PT como "tetravós"/"pentavós" —
 * nenhum desses nomes está aprovado em documento algum) e o slot visual é 1
 * (não finge censo genealógico: só evita placeholder vazio quando já existe
 * gente publicada).
 *
 * Não inventa pessoas, vínculos nem elegibilidade. A estrutura de gerações é
 * chrome de interface; o conteúdo vem só de `arvoreSanitizada` (publicações
 * autorizadas). Sem projeção tipada por geração, os nós permanecem anônimos.
 */

import type { PublicacaoCliente } from "@/lib/projecoes-cliente";

export type GeracaoArvoreId = `G${number}`;

export type GeracaoArvore = {
  id: GeracaoArvoreId;
  rotulo: string;
  /** Quantidade de slots visuais (não é censo genealógico). */
  slots: number;
};

/** Escala canônica — G1 (você) … G10 (ascendentes mais distantes). */
export const GERACOES_ARVORE: readonly GeracaoArvore[] = [
  { id: "G1", rotulo: "G1 · Você", slots: 1 },
  { id: "G2", rotulo: "G2 · Avós", slots: 2 },
  { id: "G3", rotulo: "G3 · Bisavós", slots: 4 },
  { id: "G4", rotulo: "G4 · Bisavós de bisavós", slots: 4 },
  { id: "G5", rotulo: "G5 · Ancestrais", slots: 3 },
  { id: "G6", rotulo: "G6 · 6ª geração", slots: 1 },
  { id: "G7", rotulo: "G7 · 7ª geração", slots: 1 },
  { id: "G8", rotulo: "G8 · 8ª geração", slots: 1 },
  { id: "G9", rotulo: "G9 · 9ª geração", slots: 1 },
  { id: "G10", rotulo: "G10 · 10ª geração", slots: 1 },
] as const;

/**
 * Corte 2b (29/09/2026) — o mockup (p. 6/17) desenha a árvore de cima para
 * baixo: ancestrais no topo, você embaixo. A ordem dos dados continua G1→G5.
 */
export const GERACOES_ARVORE_EXIBICAO: readonly GeracaoArvore[] = [...GERACOES_ARVORE].reverse();

/**
 * "de um universo de 31 possíveis nas 5 gerações" (mockup): 1+2+4+8+16 — o
 * total teórico de ascendentes diretos em cinco gerações, não uma meta.
 * Mantida com o nome e o valor originais do mockup aprovado — não é a conta
 * usada na tela hoje (o rodapé real mostra contagem publicada, nunca o
 * teto), e renomear ou recalcular este valor histórico não muda nenhum
 * comportamento. Constante nova para o alcance ampliado, caso algum dia
 * precise de referência: 1+2+4+8+16+32+64+128+256+512.
 */
export const PESSOAS_POSSIVEIS_CINCO_GERACOES = 31;
export const PESSOAS_POSSIVEIS_DEZ_GERACOES = 1023;

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

/** Rótulo de uma geração: G1–G10 da escala canônica; acima disso, neutro. */
export function geracaoArvore(n: number): GeracaoArvore {
  return GERACOES_ARVORE.find((g) => g.id === `G${n}`) ?? { id: `G${n}`, rotulo: `G${n} · ${n}ª geração`, slots: 1 };
}

/**
 * Gerações a exibir montadas a partir do que foi publicado: G1 (você) e cada
 * geração com pessoa publicada, sem teto. Sem publicação, a escala canônica.
 * Ordem de exibição: ancestrais no topo, você embaixo.
 */
export function geracoesParaExibir(publicadas: readonly (number | null)[]): GeracaoArvore[] {
  const numeros = [...new Set(publicadas.filter((n): n is number => Number.isInteger(n) && (n as number) >= 1))];
  if (numeros.length === 0) return [...GERACOES_ARVORE_EXIBICAO];
  return [...new Set([1, ...numeros])].sort((a, b) => b - a).map(geracaoArvore);
}

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
