/**
 * Aprovação jurídica do MODELO × conferência operacional da INSTÂNCIA.
 *
 * Instrução da Proprietária (09/10/2026): os modelos e a matriz do Contrato de
 * Estudo Genealógico v2 já passaram por revisão jurídica. A estrutura de
 * cartões é só operacional. Logo:
 *
 *  - aprovação jurídica do modelo/versão é uma coisa (feita, vigente);
 *  - conferência operacional do contrato do caso é outra (dados, partes,
 *    representação, assinatura);
 *  - revisão jurídica só volta a ser exigida para alteração material FORA do
 *    conteúdo aprovado, e então com motivo e trecho identificados.
 *
 * Este módulo é puro. Não aprova nada, não grava nada e não reabre revisão: só
 * decide se o instrumento do caso está dentro do que já foi aprovado.
 */

import { CONTRATO_BASE_DATA, CONTRATO_BASE_STATUS, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";

export type ModeloAprovado = {
  codigo: string;
  versao: string;
  /** Data de vigência do modelo (não a da conferência do caso). */
  data: string;
  /**
   * Referência verificável da aprovação. Nulo quando a evidência histórica
   * ainda não foi vinculada — e então a tela diz isso, em vez de fingir que a
   * aprovação não existe ou de inventar uma referência.
   */
  referenciaAprovacao: string | null;
};

/**
 * Códigos de template que o Desk grava hoje e que correspondem ao conteúdo
 * aprovado do Contrato de Estudo Genealógico v2.
 */
export const MODELOS_APROVADOS: readonly ModeloAprovado[] = [
  { codigo: "BASE-GEN-V2", versao: CONTRATO_BASE_VERSAO, data: CONTRATO_BASE_DATA, referenciaAprovacao: null },
  { codigo: "MODELO-ESTUDO", versao: CONTRATO_BASE_VERSAO, data: CONTRATO_BASE_DATA, referenciaAprovacao: null },
] as const;

export const TEXTO_REFERENCIA_A_VINCULAR = "referência de aprovação a vincular";

export function modeloAprovadoDoTemplate(templateCode: string | null | undefined): ModeloAprovado | null {
  if (!templateCode) return null;
  if (CONTRATO_BASE_STATUS !== "vigente") return null;
  return MODELOS_APROVADOS.find((m) => m.codigo === templateCode) ?? null;
}

export type AlteracaoMaterial = {
  clausula: string;
  motivo: string;
  trecho: string;
};

export type ClausulaAlterada = {
  clause_code: string;
  clause_title?: string | null;
  action?: string | null;
  change_reason?: string | null;
  clause_text?: string | null;
  archived_at?: string | null;
};

/**
 * Alteração material = cláusula do contrato do caso que diverge do conteúdo
 * aprovado (override registrado). Sem override, o conteúdo é o do modelo.
 */
export function alteracoesMateriais(clausulas: readonly ClausulaAlterada[]): AlteracaoMaterial[] {
  return clausulas
    .filter((c) => !c.archived_at)
    .map((c) => ({
      clausula: c.clause_title ? `${c.clause_code} — ${c.clause_title}` : c.clause_code,
      motivo: c.change_reason?.trim() || "alteração registrada sem motivo",
      trecho: (c.clause_text ?? "").trim().slice(0, 280),
    }));
}

export type CoberturaDoModelo = {
  /** O instrumento está dentro do conteúdo já aprovado? */
  dentroDoAprovado: boolean;
  modelo: ModeloAprovado | null;
  /** Rótulo humano da aprovação do modelo (inclui "a vincular", quando for o caso). */
  rotuloAprovacao: string;
  /** Preenchido só quando há alteração material: é o motivo da escalada excepcional. */
  escalonamento: AlteracaoMaterial[];
  /** Por que o modelo não cobre (template desconhecido, etc.). */
  motivoNaoCobre: string | null;
};

export function coberturaDoModelo(entrada: {
  templateCode: string | null | undefined;
  clausulasAlteradas: readonly ClausulaAlterada[];
}): CoberturaDoModelo {
  const modelo = modeloAprovadoDoTemplate(entrada.templateCode);
  const escalonamento = alteracoesMateriais(entrada.clausulasAlteradas);

  if (!modelo) {
    return {
      dentroDoAprovado: false,
      modelo: null,
      rotuloAprovacao: "Modelo sem aprovação vigente registrada",
      escalonamento,
      motivoNaoCobre: entrada.templateCode
        ? `O modelo "${entrada.templateCode}" não está entre os aprovados vigentes.`
        : "Instrumento sem modelo identificado.",
    };
  }

  const rotulo = `Modelo ${modelo.codigo} ${modelo.versao} (vigente desde ${modelo.data}) · ${
    modelo.referenciaAprovacao ?? TEXTO_REFERENCIA_A_VINCULAR
  }`;

  if (escalonamento.length > 0) {
    return {
      dentroDoAprovado: false,
      modelo,
      rotuloAprovacao: rotulo,
      escalonamento,
      motivoNaoCobre: `${escalonamento.length} alteração(ões) material(is) fora do conteúdo aprovado.`,
    };
  }

  return { dentroDoAprovado: true, modelo, rotuloAprovacao: rotulo, escalonamento: [], motivoNaoCobre: null };
}
