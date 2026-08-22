/**
 * Persistência versionada do Perfil Institucional (PERFIL-INST-v1.0).
 *
 * Regras desta camada (puras, testáveis):
 *  - a versão institucional é fonte versionada por organização;
 *  - nenhum dado pessoal é persistido ou renderizado;
 *  - o caso nunca edita o perfil;
 *  - WhatsApp não configurado gera pendência de configuração, mas não bloqueia
 *    a criação de rascunho interno;
 *  - o snapshot institucional só é criado em evento de governança aplicável e
 *    nunca sobrescreve snapshots anteriores.
 */

import {
  PERFIL_INSTITUCIONAL,
  PERFIL_INSTITUCIONAL_VERSAO,
  violacoesIdentificacao,
  type CampoInstitucional,
} from "@/lib/contrato-base-consolidado";
import { CAMPOS_INSTITUCIONAIS_OBRIGATORIOS, PERFIL_INSTITUCIONAL_STATUS } from "@/lib/perfil-institucional";

export type PayloadPerfilInstitucional = {
  versao: string;
  status: string;
  campos: CampoInstitucional[];
  whatsapp_configurado: boolean;
};

/** Eventos de governança que autorizam a criação de snapshot institucional. */
export const EVENTOS_SNAPSHOT_INSTITUCIONAL = [
  "versao_contratual_criada",
  "versao_contratual_congelada",
  "perfil_institucional_publicado",
  "revisao_juridica_registrada",
] as const;

export type EventoSnapshotInstitucional = (typeof EVENTOS_SNAPSHOT_INSTITUCIONAL)[number];

export function deveCriarSnapshotInstitucional(
  evento: string,
  jaExisteSnapshot: boolean,
): { criar: boolean; motivo: string } {
  if (jaExisteSnapshot) return { criar: false, motivo: "Snapshot institucional já registrado: versões anteriores são preservadas." };
  if (!EVENTOS_SNAPSHOT_INSTITUCIONAL.includes(evento as EventoSnapshotInstitucional)) {
    return { criar: false, motivo: "Evento de governança não aplicável ao snapshot institucional." };
  }
  return { criar: true, motivo: "Evento de governança aplicável." };
}

/** Monta o payload persistível: só campos institucionais, sem dado pessoal. */
export function montarPayloadInstitucional(whatsappConfigurado = false): PayloadPerfilInstitucional {
  return {
    versao: PERFIL_INSTITUCIONAL_VERSAO,
    status: PERFIL_INSTITUCIONAL_STATUS,
    campos: PERFIL_INSTITUCIONAL.map((c) => ({ ...c })),
    whatsapp_configurado: whatsappConfigurado,
  };
}

export function violacoesDoPayload(payload: PayloadPerfilInstitucional): string[] {
  const violacoes = payload.campos.flatMap((c) => violacoesIdentificacao(`${c.rotulo} ${c.valor}`));
  for (const campo of CAMPOS_INSTITUCIONAIS_OBRIGATORIOS) {
    const achado = payload.campos.find((c) => c.campo === campo);
    if (!achado || !achado.valor.trim()) violacoes.push(`Campo institucional obrigatório ausente: ${campo}.`);
  }
  return violacoes;
}

export type PendenciaConfiguracao = { chave: string; texto: string; bloqueiaRascunho: boolean };

/** Pendência de configuração do WhatsApp institucional — nunca bloqueia rascunho interno. */
export function pendenciasConfiguracao(payload: PayloadPerfilInstitucional): PendenciaConfiguracao[] {
  if (payload.whatsapp_configurado) return [];
  return [
    {
      chave: "whatsapp_institucional",
      texto: "WhatsApp institucional não configurado: canal oficial fica pendente de configuração.",
      bloqueiaRascunho: false,
    },
  ];
}

export function rascunhoInternoPermitido(payload: PayloadPerfilInstitucional): { permitido: boolean; motivo: string } {
  const violacoes = violacoesDoPayload(payload);
  if (violacoes.length) return { permitido: false, motivo: violacoes[0] };
  return { permitido: true, motivo: "Rascunho interno permitido; pendências de configuração não bloqueiam." };
}

/** O perfil nunca é editável a partir de um caso. */
export function edicaoPeloCasoPermitida(): { permitido: false; motivo: string } {
  return { permitido: false, motivo: "Perfil institucional é fonte versionada: não editável por caso." };
}

/** Status persistido permanece em revisão jurídica: nunca habilita assinatura. */
export function perfilHabilitaAssinatura(payload: PayloadPerfilInstitucional): boolean {
  return payload.status === "vigente";
}
