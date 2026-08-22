/**
 * Seção institucional "Qualificação profissional e natureza da atuação".
 *
 * Texto institucional versionado, editável somente em governança, sujeito a
 * revisão jurídica antes de tornar-se vigente no contrato-base. Não declara
 * advocacia, registro, certificação, garantia de resultado ou exclusividade.
 */

import type { EstadoVigenciaContratoBase } from "@/lib/contrato-base-consolidado";

export const QUALIFICACAO_INSTITUCIONAL_ID = "PERFIL-INST-QUALIFICACAO";
export const QUALIFICACAO_INSTITUCIONAL_VERSAO = "v1.0";
export const QUALIFICACAO_INSTITUCIONAL_STATUS: EstadoVigenciaContratoBase = "under_legal_review";
export const QUALIFICACAO_INSTITUCIONAL_TITULO = "Qualificação profissional e natureza da atuação";

export const QUALIFICACAO_INSTITUCIONAL_PARAGRAFOS: string[] = [
  "O Clube Ancestral atua em pesquisa genealógica profissional, reconstrução de história familiar, organização de evidências documentais e orientação estratégica de jornadas de ancestralidade europeia. Sua atuação combina pesquisa em fontes brasileiras e europeias, organização documental e acompanhamento humano especializado.",
  "Integram a atuação institucional profissionais dedicados à pesquisa genealógica e à investigação documental, sob coordenação da fundadora e pesquisadora responsável, conforme a composição e a competência aplicáveis a cada caso.",
];

/** Afirmações que nunca podem ser declaradas automaticamente nesta seção. */
export const QUALIFICACAO_DECLARACOES_PROIBIDAS = [
  "advocacia, parecer jurídico ou representação jurídica",
  "registro profissional inexistente",
  "certificação não documentada",
  "reconhecimento oficial de profissão",
  "garantia de cidadania, protocolo, resultado ou prazo",
  "exclusividade em qualquer país",
] as const;

const TERMOS_VEDADOS = [
  "advocacia",
  "advogad",
  "parecer jurídico",
  "representação jurídica",
  "oab",
  "certificad",
  "registro profissional",
  "profissão regulamentada",
  "garantimos",
  "garantia de cidadania",
  "exclusivo",
  "exclusividade",
];

export function violacoesQualificacao(texto: string): string[] {
  const alvo = texto.toLowerCase();
  return TERMOS_VEDADOS.filter((t) => alvo.includes(t)).map(
    (t) => `Declaração vedada na qualificação institucional: "${t}".`,
  );
}

export type QualificacaoRenderizada = {
  id: string;
  titulo: string;
  versao: string;
  status: EstadoVigenciaContratoBase;
  vigente: boolean;
  paragrafos: string[];
  violacoes: string[];
  pendencias: string[];
};

export function qualificacaoInstitucionalRenderizada(
  status: EstadoVigenciaContratoBase = QUALIFICACAO_INSTITUCIONAL_STATUS,
): QualificacaoRenderizada {
  const violacoes = QUALIFICACAO_INSTITUCIONAL_PARAGRAFOS.flatMap(violacoesQualificacao);
  const pendencias: string[] = [];
  if (status !== "vigente") {
    pendencias.push(
      "Revisão jurídica pendente: a qualificação profissional não é vigente no contrato-base até aprovação humana registrada.",
    );
  }
  return {
    id: QUALIFICACAO_INSTITUCIONAL_ID,
    titulo: QUALIFICACAO_INSTITUCIONAL_TITULO,
    versao: QUALIFICACAO_INSTITUCIONAL_VERSAO,
    status,
    vigente: status === "vigente",
    paragrafos: [...QUALIFICACAO_INSTITUCIONAL_PARAGRAFOS],
    violacoes,
    pendencias,
  };
}
