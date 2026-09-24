/**
 * Fluxo do contrato em seis passos — Preparar → Revisar → Aprovar → Enviar →
 * Registrar assinatura → Liberar.
 *
 * Camada pura sobre os gates canônicos de `gates-formalizacao.ts` (mesma
 * avaliação que o servidor roda antes de cada transição). Não grava, não
 * emite, não envia e não cobra: só diz, para cada passo, se está concluído,
 * disponível ou bloqueado, e por quê.
 *
 * Regras fixas:
 * - cada passo exige o anterior concluído (sem pular etapa);
 * - Enviar, Registrar assinatura e Liberar são efeitos externos e sempre
 *   exigem confirmação humana explícita; nenhum passo é automático;
 * - nenhum passo emite fatura, cobrança ou pagamento — isso é ato separado
 *   do financeiro (`liberar_cobranca_futura`), fora deste fluxo;
 * - Liberar o App exige contrato assinado (mesma regra do guard
 *   `fn_portal_case_access_guard` no banco).
 */

import { bloqueiosDaAcao, type AcaoGateada, type ContextoGates } from "@/lib/gates-formalizacao";

export const PASSOS_CONTRATO = [
  "preparar",
  "revisar",
  "aprovar",
  "enviar",
  "registrar_assinatura",
  "liberar",
] as const;
export type PassoContrato = (typeof PASSOS_CONTRATO)[number];

export const ROTULO_PASSO: Record<PassoContrato, string> = {
  preparar: "Preparar",
  revisar: "Revisar",
  aprovar: "Aprovar",
  enviar: "Enviar",
  registrar_assinatura: "Registrar assinatura",
  liberar: "Liberar",
};

/** Ação gateada canônica que o servidor avalia para cada passo. */
export const ACAO_DO_PASSO: Record<PassoContrato, AcaoGateada> = {
  preparar: "preparar_anexo_escopo",
  revisar: "gerar_versao_final",
  aprovar: "solicitar_assinatura",
  enviar: "formalizacao_contrato_enviado",
  registrar_assinatura: "formalizacao_contrato_assinado",
  liberar: "liberar_onboarding",
};

export const PASSO_EFEITO_EXTERNO: Record<PassoContrato, boolean> = {
  preparar: false,
  revisar: false,
  aprovar: false,
  enviar: true,
  registrar_assinatura: true,
  liberar: true,
};

/** Fatos já persistidos sobre o contrato (lidos do banco, nunca inferidos). */
export type MarcosContrato = {
  preparado: boolean;
  revisado: boolean;
  aprovado: boolean;
  enviado: boolean;
  assinado: boolean;
  liberado: boolean;
};

const MARCO_DO_PASSO: Record<PassoContrato, keyof MarcosContrato> = {
  preparar: "preparado",
  revisar: "revisado",
  aprovar: "aprovado",
  enviar: "enviado",
  registrar_assinatura: "assinado",
  liberar: "liberado",
};

export type EstadoPasso = {
  passo: PassoContrato;
  rotulo: string;
  estado: "concluido" | "disponivel" | "bloqueado";
  motivos: string[];
  exigeConfirmacaoHumana: boolean;
  automatico: false;
  emiteCobranca: false;
};

export function avaliarFluxoContrato(ctx: ContextoGates, marcos: MarcosContrato): EstadoPasso[] {
  let anteriorConcluido = true;
  let anteriorRotulo: string | null = null;
  return PASSOS_CONTRATO.map((passo) => {
    const concluido = marcos[MARCO_DO_PASSO[passo]];
    const motivos: string[] = [];
    if (!concluido) {
      if (!anteriorConcluido && anteriorRotulo) motivos.push(`Passo anterior pendente: ${anteriorRotulo}.`);
      for (const b of bloqueiosDaAcao(ACAO_DO_PASSO[passo], ctx)) motivos.push(b.descricao);
      if (passo === "liberar" && !marcos.assinado) {
        motivos.push("Liberação do App exige contrato assinado.");
      }
    }
    const estado: EstadoPasso["estado"] = concluido ? "concluido" : motivos.length ? "bloqueado" : "disponivel";
    anteriorConcluido = concluido;
    anteriorRotulo = ROTULO_PASSO[passo];
    return {
      passo,
      rotulo: ROTULO_PASSO[passo],
      estado,
      motivos: [...new Set(motivos)],
      exigeConfirmacaoHumana: PASSO_EFEITO_EXTERNO[passo],
      automatico: false,
      emiteCobranca: false,
    };
  });
}

/** Próximo passo acionável (um CTA principal por estado), ou null. */
export function proximoPassoContrato(fluxo: EstadoPasso[]): EstadoPasso | null {
  return fluxo.find((p) => p.estado !== "concluido") ?? null;
}
