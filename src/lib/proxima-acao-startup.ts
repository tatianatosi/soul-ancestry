/**
 * Completude da próxima ação com defaults de startup.
 *
 * A lista completa de campos (público, canal, aprovação…) serve a operação
 * com equipe. Para a proprietária solo, preenchemos o mínimo interno e
 * seguimos — pendência informa, não impede.
 */

import {
  validarProximaAcao,
  mensagemProximaAcao,
  type EstadoProximaAcao,
  type ErroProximaAcao,
} from "@/lib/proxima-acao-regras";
import { nomeResponsavelPadrao } from "@/lib/responsavel-padrao";

export const PADRAO_PUBLICO_INTERNO = "interno_tatiana";
export const PADRAO_VISIBILIDADE_INTERNA = "internal_only";
export const PADRAO_CANAL_DESK = "desk_only";

function texto(v: unknown) {
  return v === null || v === undefined ? "" : String(v).trim();
}

function hojeMaisDias(dias: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Preenche responsável Tatiana + campos internos quando vazios. */
export function aplicarPadroesProximaAcaoStartup(
  estado: EstadoProximaAcao,
  responsavelPreferido?: string | null,
): EstadoProximaAcao {
  return {
    ...estado,
    responsavel_principal: texto(estado.responsavel_principal) || nomeResponsavelPadrao(responsavelPreferido),
    prazo_proxima_acao: texto(estado.prazo_proxima_acao) || hojeMaisDias(7),
    target_audience: texto(estado.target_audience) || PADRAO_PUBLICO_INTERNO,
    visibility: texto(estado.visibility) || PADRAO_VISIBILIDADE_INTERNA,
    suggested_channel: texto(estado.suggested_channel) || PADRAO_CANAL_DESK,
  };
}

/**
 * Para a proprietária: aplica defaults e só exige a ação em si.
 * Para demais papéis: validação completa (comportamento anterior).
 */
export function exigirProximaAcaoOperavel(
  estado: EstadoProximaAcao,
  opcoes: { livreProprietaria: boolean; responsavelPreferido?: string | null },
): { estado: EstadoProximaAcao; pendenciasAssumidas: string[] } {
  if (!opcoes.livreProprietaria) {
    const erros = validarProximaAcao(estado);
    if (erros.length > 0) throw new Error(mensagemProximaAcao(erros));
    return { estado, pendenciasAssumidas: [] };
  }

  const completo = aplicarPadroesProximaAcaoStartup(estado, opcoes.responsavelPreferido);
  const antes = validarProximaAcao(estado);
  const depois = validarProximaAcao(completo);
  if (depois.length > 0) {
    // Ainda falta a ação em si — isso é conteúdo, não gate de processo.
    throw new Error(mensagemProximaAcao(depois));
  }
  const pendenciasAssumidas = antes
    .filter((e: ErroProximaAcao) => e.codigo !== "ACAO_NAO_DEFINIDA")
    .map((e) => `${e.codigo}: ${e.mensagem}`);
  return { estado: completo, pendenciasAssumidas };
}
