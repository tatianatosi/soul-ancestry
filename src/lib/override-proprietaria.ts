/**
 * PROMPT 02 — Política canônica de `override_proprietaria`.
 *
 * Permite que a Proprietária autenticada valide e supere gates operacionais e
 * comerciais de forma explícita, limitada em escopo, justificada, com prazo de
 * revisão e auditoria append-only.
 *
 * O override NÃO apaga o gate, não reescreve a condição original e não
 * transforma pendência em cumprida. Nenhuma função deste módulo executa ação
 * externa, escreve em banco, envia mensagem ou cria cobrança: tudo aqui é regra
 * pura, derivação e validação.
 */

import { ehPapelProprietaria } from "@/lib/gates-override";
import { MOTIVO_MINIMO } from "@/lib/modo-proprietaria";

/** Estados canônicos de um objeto sujeito a override. */
export const ESTADOS_OVERRIDE = [
  "BLOQUEADO",
  "LIBERADO_POR_OVERRIDE_PROPRIETARIA",
  "EXPIRADO_AGUARDA_REVISAO",
  "REVOGADO",
] as const;
export type EstadoOverride = (typeof ESTADOS_OVERRIDE)[number];

export const ROTULO_ESTADO_OVERRIDE: Record<EstadoOverride, string> = {
  BLOQUEADO: "Bloqueado pela regra original",
  LIBERADO_POR_OVERRIDE_PROPRIETARIA: "Liberado por exceção da Proprietária",
  EXPIRADO_AGUARDA_REVISAO: "Exceção expirada — aguarda revisão",
  REVOGADO: "Exceção revogada",
};

/** Escopos internos que a exceção pode liberar. */
export const ESCOPOS_OVERRIDE = [
  "inicio_interno_antes_do_pagamento",
  "materializacao_rascunho_contrato_os_anexos",
  "preparacao_onboarding_interno",
  "progressao_interna_do_caso",
  "aprovacao_excepcional_tarefa_etapa_microentrega",
] as const;
export type EscopoOverride = (typeof ESCOPOS_OVERRIDE)[number];

export const ROTULO_ESCOPO: Record<EscopoOverride, string> = {
  inicio_interno_antes_do_pagamento: "Início interno antes do pagamento confirmado",
  materializacao_rascunho_contrato_os_anexos:
    "Materialização de contrato, Ordem de Serviço e Anexos I–V como rascunho interno",
  preparacao_onboarding_interno: "Preparação de onboarding interno",
  progressao_interna_do_caso: "Progressão do caso até o limite autorizado",
  aprovacao_excepcional_tarefa_etapa_microentrega:
    "Aprovação excepcional de tarefa, etapa ou microentrega interna",
};

/** Limites permanentes: nunca liberados, mesmo com override. */
export const LIMITES_PERMANENTES = [
  "marcar_pagamento_como_recebido",
  "alterar_preco",
  "alterar_escopo",
  "alterar_assinatura",
  "apagar_gate",
  "converter_pendencia_em_cumprida",
  "burlar_rls_ou_autenticacao",
  "acessar_dados_de_terceiro",
  "publicar_conteudo_ao_cliente",
  "enviar_comunicacao",
  "criar_cobranca",
  "assinar_documento",
  "executar_pesquisa_externa",
] as const;
export type LimitePermanente = (typeof LIMITES_PERMANENTES)[number];

export const ROTULO_LIMITE: Record<LimitePermanente, string> = {
  marcar_pagamento_como_recebido: "Marcar pagamento como recebido",
  alterar_preco: "Alterar preço",
  alterar_escopo: "Alterar escopo",
  alterar_assinatura: "Alterar ou dispensar assinatura",
  apagar_gate: "Apagar gate",
  converter_pendencia_em_cumprida: "Converter pendência em cumprida",
  burlar_rls_ou_autenticacao: "Burlar RLS ou autenticação",
  acessar_dados_de_terceiro: "Acessar dados de terceiro",
  publicar_conteudo_ao_cliente: "Publicar conteúdo ao cliente",
  enviar_comunicacao: "Enviar comunicação externa",
  criar_cobranca: "Criar cobrança",
  assinar_documento: "Assinar documento",
  executar_pesquisa_externa: "Executar pesquisa externa",
};

export function ehLimitePermanente(alvo: string): alvo is LimitePermanente {
  return (LIMITES_PERMANENTES as readonly string[]).includes(alvo);
}

export function ehEscopoOverride(escopo: string): escopo is EscopoOverride {
  return (ESCOPOS_OVERRIDE as readonly string[]).includes(escopo);
}

/** Registro completo exigido para qualquer exceção. */
export type RegistroOverride = {
  case_id: string;
  objeto_afetado: string;
  condicao_original: string;
  gates_pendentes: readonly string[];
  escopo_liberado: readonly string[];
  justificativa: string;
  autora: string;
  papel: string | null | undefined;
  em: string;
  revisar_em: string;
  estado_anterior: string;
  estado_posterior: string;
  revogado_em?: string | null;
  revogado_por?: string | null;
};

export type ResultadoValidacaoOverride = { valida: boolean; erros: readonly string[] };

const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Valida a exceção antes de qualquer registro. Recusa papéis não proprietários. */
export function validarOverrideProprietaria(r: RegistroOverride): ResultadoValidacaoOverride {
  const erros: string[] = [];

  if (!ehPapelProprietaria(r.papel)) {
    erros.push("Somente a Proprietária autenticada pode registrar uma exceção.");
  }
  if (!r.case_id?.trim()) erros.push("case_id obrigatório.");
  if (!r.objeto_afetado?.trim()) erros.push("Objeto afetado obrigatório.");
  if (!r.condicao_original?.trim()) erros.push("Condição original obrigatória e preservada.");
  if ((r.justificativa ?? "").trim().length < MOTIVO_MINIMO) {
    erros.push(`Justificativa obrigatória com pelo menos ${MOTIVO_MINIMO} caracteres.`);
  }
  if (!r.autora?.trim()) erros.push("Identidade da Proprietária obrigatória.");
  if (!DATA_ISO.test(r.em ?? "")) erros.push("Data e hora da decisão obrigatórias (AAAA-MM-DD).");
  if (!DATA_ISO.test(r.revisar_em ?? "")) erros.push("Data de revisão/expiração obrigatória (AAAA-MM-DD).");
  else if (DATA_ISO.test(r.em ?? "") && r.revisar_em <= r.em) {
    erros.push("A data de revisão precisa ser posterior à data da decisão.");
  }
  if (!r.estado_anterior?.trim()) erros.push("Estado anterior obrigatório.");
  if (!r.estado_posterior?.trim()) erros.push("Estado posterior obrigatório.");

  if (r.escopo_liberado.length === 0) erros.push("Informe ao menos um escopo interno liberado.");
  for (const escopo of r.escopo_liberado) {
    if (ehLimitePermanente(escopo)) {
      erros.push(`Limite permanente não pode ser liberado por exceção: ${ROTULO_LIMITE[escopo]}.`);
    } else if (!ehEscopoOverride(escopo)) {
      erros.push(`Escopo fora da política canônica: ${escopo}.`);
    }
  }

  return { valida: erros.length === 0, erros };
}

/**
 * Deriva o estado do objeto. O gate original permanece pendente em todos os
 * casos: o estado apenas informa se existe exceção vigente.
 */
export function derivarEstadoOverride(input: {
  hoje: string;
  gatesPendentes: readonly string[];
  override?: RegistroOverride | null;
}): { estado: EstadoOverride; rotulo: string; gatesPreservados: readonly string[]; motivo: string } {
  const gatesPreservados = [...input.gatesPendentes];
  const o = input.override;

  if (!o) {
    return {
      estado: "BLOQUEADO",
      rotulo: ROTULO_ESTADO_OVERRIDE.BLOQUEADO,
      gatesPreservados,
      motivo: "Sem exceção registrada: vale a regra original.",
    };
  }
  if (o.revogado_em) {
    return {
      estado: "REVOGADO",
      rotulo: ROTULO_ESTADO_OVERRIDE.REVOGADO,
      gatesPreservados,
      motivo: `Exceção revogada em ${o.revogado_em}${o.revogado_por ? ` por ${o.revogado_por}` : ""}.`,
    };
  }
  if (input.hoje > o.revisar_em) {
    return {
      estado: "EXPIRADO_AGUARDA_REVISAO",
      rotulo: ROTULO_ESTADO_OVERRIDE.EXPIRADO_AGUARDA_REVISAO,
      gatesPreservados,
      motivo: `Exceção venceu em ${o.revisar_em} e aguarda revisão da Proprietária.`,
    };
  }
  return {
    estado: "LIBERADO_POR_OVERRIDE_PROPRIETARIA",
    rotulo: ROTULO_ESTADO_OVERRIDE.LIBERADO_POR_OVERRIDE_PROPRIETARIA,
    gatesPreservados,
    motivo: `Exceção vigente até ${o.revisar_em}. Gates originais preservados como pendentes.`,
  };
}

/** Alcance legível da exceção e o que continua bloqueado. */
export function alcanceDaExcecao(r: RegistroOverride): {
  liberado: readonly string[];
  bloqueado: readonly string[];
} {
  const liberado = r.escopo_liberado
    .filter(ehEscopoOverride)
    .map((e) => ROTULO_ESCOPO[e]);
  return { liberado, bloqueado: LIMITES_PERMANENTES.map((l) => ROTULO_LIMITE[l]) };
}

export type EventoAuditoriaOverride = {
  tipo: "override_proprietaria";
  case_id: string;
  objeto_afetado: string;
  condicao_original: string;
  gates_pendentes: readonly string[];
  escopo_liberado: readonly string[];
  justificativa: string;
  autora: string;
  papel: string;
  em: string;
  revisar_em: string;
  estado_anterior: string;
  estado_posterior: EstadoOverride;
  append_only: true;
};

/** Monta o evento append-only. Não grava nada: apenas devolve o registro. */
export function montarEventoAuditoria(
  r: RegistroOverride,
  estadoPosterior: EstadoOverride,
): EventoAuditoriaOverride {
  return {
    tipo: "override_proprietaria",
    case_id: r.case_id,
    objeto_afetado: r.objeto_afetado,
    condicao_original: r.condicao_original,
    gates_pendentes: [...r.gates_pendentes],
    escopo_liberado: [...r.escopo_liberado],
    justificativa: r.justificativa,
    autora: r.autora,
    papel: String(r.papel ?? ""),
    em: r.em,
    revisar_em: r.revisar_em,
    estado_anterior: r.estado_anterior,
    estado_posterior: estadoPosterior,
    append_only: true,
  };
}

/** Revogação: devolve uma cópia revogada, sem apagar o registro original. */
export function revogarOverride(
  r: RegistroOverride,
  input: { em: string; por: string; papel: string | null | undefined },
): { ok: boolean; erro?: string; registro: RegistroOverride } {
  if (!ehPapelProprietaria(input.papel)) {
    return { ok: false, erro: "Somente a Proprietária pode revogar uma exceção.", registro: r };
  }
  return { ok: true, registro: { ...r, revogado_em: input.em, revogado_por: input.por } };
}
