/**
 * Cadeia de suprimento normativa:
 * Biblioteca Mestre (Bases Genealógicas + Dicionários + Trilhas)
 *   → Pesquisa Genealógica e Evidências
 *   → Fontes, documentos, validação e achados
 *   → Ficha Genealógica, árvore e timeline internas
 *   → Relatórios F1/F2 e entregas sanitizadas
 *   → App Cliente apenas quando aprovado e publicado
 *
 * Nada aqui executa pesquisa externa, OCR, IA, mensagem, cobrança ou publicação.
 * É a matriz de origem que a área de pesquisa consome como insumo controlado.
 */

import type { SubareaBiblioteca } from "./biblioteca-mestre";

export type EloSuprimento = "insumos" | "pesquisa" | "fontes" | "ficha" | "relatorios" | "app";

export interface EloSuprimentoMeta {
  chave: EloSuprimento;
  rotulo: string;
  papel: string;
  /** Subáreas da Biblioteca Mestre que alimentam este elo. */
  origensBiblioteca: readonly SubareaBiblioteca[];
  /** Condição obrigatória para o elo avançar. */
  condicao: string;
  /** Visível ao cliente? Somente o último elo, e apenas quando publicado. */
  exposicaoCliente: boolean;
}

export const CADEIA_SUPRIMENTO: readonly EloSuprimentoMeta[] = [
  {
    chave: "insumos",
    rotulo: "Bases Genealógicas + Dicionários + Trilhas",
    papel:
      "Insumo interno: acervos e repositórios catalogados, termos canônicos e vias preliminares por país.",
    origensBiblioteca: ["bases", "dicionarios", "trilhas"],
    condicao: "Item da Biblioteca precisa estar aprovado e versionado para ser consumido pela pesquisa.",
    exposicaoCliente: false,
  },
  {
    chave: "pesquisa",
    rotulo: "Pesquisa Genealógica e Evidências",
    papel: "Consome os insumos como objetivo, trilha, taxonomia de estados e catálogo de acervos elegíveis.",
    origensBiblioteca: ["bases", "dicionarios", "trilhas", "juridico"],
    condicao: "Consulta externa só com autorização humana registrada no caso.",
    exposicaoCliente: false,
  },
  {
    chave: "fontes",
    rotulo: "Fontes, documentos, validação e achados",
    papel: "Material bruto vira evidência interpretada, passa por validação humana e só então vira achado interno.",
    origensBiblioteca: ["bases", "dicionarios"],
    condicao: "Achado exige evidência validada; validação não conclui direito.",
    exposicaoCliente: false,
  },
  {
    chave: "ficha",
    rotulo: "Ficha Genealógica, árvore e timeline internas",
    papel: "Pessoas, variantes, relações, eventos, ramos e lacunas consolidados com lastro de evidência.",
    origensBiblioteca: ["dicionarios", "trilhas"],
    condicao: "Upload não cria pessoa nem relação; hipótese interna fica marcada como hipótese.",
    exposicaoCliente: false,
  },
  {
    chave: "relatorios",
    rotulo: "Relatórios F1/F2 e entregas sanitizadas",
    papel: "Rascunho interno, revisão e versão aprovada com base em modelo homologado.",
    origensBiblioteca: ["modelos", "juridico", "governanca"],
    condicao: "Relatório publicado aponta para versão aprovada de modelo e passa por sanitização.",
    exposicaoCliente: false,
  },
  {
    chave: "app",
    rotulo: "App Cliente",
    papel: "Projeção autorizada: apenas nomes, datas e entregas explicitamente aprovadas e publicadas.",
    origensBiblioteca: [],
    condicao: "Sem aprovação e publicação humana, o App exibe estado de preparação — nunca conteúdo interno.",
    exposicaoCliente: true,
  },
] as const;

export function eloSuprimento(chave: string): EloSuprimentoMeta | null {
  return CADEIA_SUPRIMENTO.find((e) => e.chave === chave) ?? null;
}

/** Subáreas de origem obrigatórias do primeiro elo. */
export const INSUMOS_OBRIGATORIOS: readonly SubareaBiblioteca[] = ["bases", "dicionarios", "trilhas"];

/** A Biblioteca Mestre nunca é projetada ao cliente; só o último elo pode ser, se publicado. */
export function podeProjetarNoApp(elo: EloSuprimento, publicado: boolean): boolean {
  return elo === "app" && publicado === true;
}
