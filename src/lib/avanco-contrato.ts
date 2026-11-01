import type { PassoContrato } from "@/lib/contrato-prontidao";
import {
  decidirEdicao,
  type DecisaoEdicao,
  type EstadoEdicao,
  type OperacaoAvanco,
  type Pendencia,
} from "@/lib/estados-edicao";

/**
 * Regra de edição × avanço aplicada ao contrato real.
 *
 * `estados-edicao.ts` define a regra central do motor ("bloqueio de completude
 * nunca torna a tela somente leitura; ele impede só os atos de avanço"), mas
 * nenhuma tela a consultava. Aqui os passos de prontidão que a tela já calcula
 * viram `Pendencia` por gate, e `decidirEdicao` responde por avanço. Nada é
 * executado: é só a leitura de "o que posso fazer agora e o que falta".
 */

/** Qual ato de avanço cada passo da prontidão segura. */
const GATE_DO_PASSO: Record<string, OperacaoAvanco> = {
  proposta: "aprovar_proposta",
  partes: "congelar_previa",
  escopo: "congelar_previa",
  comercial: "congelar_previa",
  cobertura: "congelar_previa",
  rascunho: "solicitar_assinatura",
  revisao: "solicitar_assinatura",
};

export const AVANCOS_DO_CONTRATO: { operacao: OperacaoAvanco; rotulo: string }[] = [
  { operacao: "aprovar_proposta", rotulo: "Aprovar a proposta" },
  { operacao: "congelar_previa", rotulo: "Congelar a prévia final" },
  { operacao: "solicitar_assinatura", rotulo: "Solicitar a assinatura" },
];

export function pendenciasDeAvanco(passos: PassoContrato[]): Pendencia[] {
  const out: Pendencia[] = [];
  for (const p of passos) {
    if (p.estado === "ok") continue;
    const gate = GATE_DO_PASSO[p.chave];
    if (!gate) continue; // assinatura é ato externo posterior, não gate interno
    out.push({
      campo: p.rotulo,
      fonte: p.ancora,
      responsavel: "equipe do caso",
      proximaAcao: p.detalhe,
      gate,
    });
  }
  return out;
}

/** Estado de edição do contrato, derivado dos passos que a tela já calcula. */
export function estadoDeEdicaoDoContrato(passos: PassoContrato[]): EstadoEdicao {
  const ok = (c: string) => passos.find((p) => p.chave === c)?.estado === "ok";
  if (ok("assinatura")) return "aprovado_para_formalizacao";
  if (ok("rascunho")) return "aprovado_para_preparacao";
  if (ok("revisao")) return "em_revisao";
  return passos.some((p) => p.estado === "bloqueado")
    ? "bloqueado_por_pendencia"
    : "rascunho_editavel";
}

export type LinhaAvanco = { operacao: OperacaoAvanco; rotulo: string; decisao: DecisaoEdicao };

export function avancosDoContrato(passos: PassoContrato[], papel: string): LinhaAvanco[] {
  const pendencias = pendenciasDeAvanco(passos);
  const estado = estadoDeEdicaoDoContrato(passos);
  return AVANCOS_DO_CONTRATO.map(({ operacao, rotulo }) => ({
    operacao,
    rotulo,
    decisao: decidirEdicao({ estado, operacao, papel, pendencias }),
  }));
}
