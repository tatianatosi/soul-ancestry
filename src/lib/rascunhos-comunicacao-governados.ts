/**
 * Rascunhos governados de comunicação (PROMPT 07).
 *
 * Estende a Fila Humana de Comunicação (`fila-comunicacao.ts`) com
 * versionamento de template, canal previsto e revisão de terminologia. Todo
 * rascunho nasce e permanece em `rascunho_interno`; este módulo não define
 * nenhuma função de envio — não existe "handler de envio" para ser chamado
 * por engano.
 */

import { textoSuspeito } from "@/lib/fila-comunicacao";

export type TemplateComunicacao = {
  id: string;
  proposito: string;
  versao: number;
  vigente: boolean;
  /** ISO 8601 — null significa sem prazo de expiração definido. */
  expiraEm: string | null;
  canalPrevisto: "whatsapp" | "email" | "outro";
  corpo: string;
};

/**
 * Escolhe a versão vigente e não expirada de maior número para o propósito.
 * Se nada estiver vigente/não expirado, devolve null — nunca cai para uma
 * versão antiga silenciosamente.
 */
export function templateVigente(
  templates: TemplateComunicacao[],
  proposito: string,
  agoraIso: string,
): TemplateComunicacao | null {
  const agora = new Date(agoraIso).getTime();
  const candidatos = templates
    .filter((t) => t.proposito === proposito && t.vigente)
    .filter((t) => !t.expiraEm || new Date(t.expiraEm).getTime() >= agora)
    .sort((a, b) => b.versao - a.versao);
  return candidatos[0] ?? null;
}

export type ContextoRascunho = {
  proposito: string;
  destinatarioResolvido: boolean;
  contextoCaso: string | null;
  faseCaso: string | null;
  destino: "interno" | "cliente";
};

export type ResultadoRascunho =
  | { estado: "rascunho_interno"; corpo: string; origem: { templateId: string; versao: number }; revisaoTerminologia: string[] }
  | { estado: "bloqueado"; motivos: string[] };

/**
 * Monta o rascunho a partir do template vigente. Bloqueia (nunca envia,
 * nunca completa por conta própria) quando falta destinatário resolvido,
 * contexto, fase, template vigente, ou quando o texto reprova a revisão de
 * terminologia.
 */
export function montarRascunhoComunicacao(
  templates: TemplateComunicacao[],
  ctx: ContextoRascunho,
  agoraIso: string,
): ResultadoRascunho {
  const motivos: string[] = [];
  if (!ctx.destinatarioResolvido) motivos.push("Destinatário ainda não resolvido.");
  if (!ctx.contextoCaso?.trim()) motivos.push("Contexto do caso obrigatório.");
  if (!ctx.faseCaso?.trim()) motivos.push("Fase do caso obrigatória.");

  const template = templateVigente(templates, ctx.proposito, agoraIso);
  if (!template) motivos.push("Nenhuma versão vigente e não expirada do template para este propósito.");

  if (motivos.length > 0) return { estado: "bloqueado", motivos };

  const revisaoTerminologia = textoSuspeito(template!.corpo);
  if (revisaoTerminologia.length > 0) {
    return {
      estado: "bloqueado",
      motivos: [`Terminologia reprovada na revisão: ${revisaoTerminologia.join(", ")}.`],
    };
  }

  return {
    estado: "rascunho_interno",
    corpo: template!.corpo,
    origem: { templateId: template!.id, versao: template!.versao },
    revisaoTerminologia: [],
  };
}

/* ------------------------------------------------------------------ */
/* Dois modelos de uso interno pedidos (PROMPT 07)                      */
/* Nunca enviados por este módulo: ficam disponíveis para uso manual   */
/* após revisão humana, exatamente como os demais rascunhos da fila.   */
/* ------------------------------------------------------------------ */

/**
 * João é contratante individual; a esposa pode acompanhar, mas não é
 * incluída como parte contratual sem decisão explícita — por isso o texto
 * não a menciona. Fluxo: aceite verbal com evidência → confirmação escrita
 * → só então contrato/cobrança/ativação.
 */
export const TEMPLATE_CONFIRMACAO_FORMAL_JOAO: TemplateComunicacao = {
  id: "confirmacao-formal-joao-v1",
  proposito: "solicitar_confirmacao_formal",
  versao: 1,
  vigente: true,
  expiraEm: null,
  canalPrevisto: "whatsapp",
  corpo:
    "Oi, João! Para seguirmos com a próxima etapa, preciso da sua confirmação por escrito aqui mesmo: você confirma que quer seguir com a proposta como conversamos? Pode responder só com \"confirmo\". Assim que eu tiver essa confirmação, já preparamos os próximos passos.",
};

/** Sem pressão, sem promessa de resultado, sem preço, sem inferir aceite. */
export const TEMPLATE_FOLLOW_UP_LARA: TemplateComunicacao = {
  id: "follow-up-agendamento-lara-v1",
  proposito: "convite_agendamento_reuniao",
  versao: 1,
  vigente: true,
  expiraEm: null,
  canalPrevisto: "whatsapp",
  corpo:
    "Oi, Lara! Passando para saber se faz sentido marcarmos um horário para eu te apresentar a proposta com calma e tirar suas dúvidas. Qual seria um bom dia para você essa semana ou a próxima?",
};

export const TEMPLATES_CONHECIDOS = [TEMPLATE_CONFIRMACAO_FORMAL_JOAO, TEMPLATE_FOLLOW_UP_LARA];
