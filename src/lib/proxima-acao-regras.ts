/**
 * ANA-SAVE-SEC-01 — regras de completude da Próxima ação.
 *
 * Toda próxima ação exige responsável, prazo, público-alvo, visibilidade e canal
 * sugerido. Canal externo exige aprovação humana registrada. Persistência
 * incompleta é negada com erro específico — nunca gravada pela metade.
 * Nada aqui envia mensagem, cria contrato, cobrança ou pesquisa externa.
 */

export type ErroProximaAcao = { codigo: string; mensagem: string };

export const CANAIS_EXTERNOS = ["whatsapp", "email", "app", "app_and_whatsapp"] as const;
export const PUBLICOS_EXTERNOS = [
  "cliente_contratante",
  "participante_nucleo",
  "responsavel_legal",
  "colaborador_autorizado",
] as const;

export type EstadoProximaAcao = {
  proxima_acao_codigo?: unknown;
  proxima_acao_justificativa?: unknown;
  responsavel_principal?: unknown;
  prazo_proxima_acao?: unknown;
  target_audience?: unknown;
  visibility?: unknown;
  suggested_channel?: unknown;
  requires_human_approval?: unknown;
};

const texto = (v: unknown) => (v === null || v === undefined ? "" : String(v).trim());

export function canalExterno(canal: unknown): boolean {
  return (CANAIS_EXTERNOS as readonly string[]).includes(texto(canal));
}

export function publicoExterno(publico: unknown): boolean {
  return (PUBLICOS_EXTERNOS as readonly string[]).includes(texto(publico));
}

/** Lista todos os bloqueios da próxima ação (vazio = pode registrar). */
export function validarProximaAcao(estado: EstadoProximaAcao): ErroProximaAcao[] {
  const erros: ErroProximaAcao[] = [];
  const add = (codigo: string, mensagem: string) => erros.push({ codigo, mensagem });

  const acao = texto(estado.proxima_acao_codigo);
  if (!acao) add("ACAO_NAO_DEFINIDA", "Defina a próxima ação a partir da lista controlada.");
  if (acao === "outro_justificar" && texto(estado.proxima_acao_justificativa).length < 5) {
    add("JUSTIFICATIVA_OBRIGATORIA", "A ação 'Outro' exige justificativa com pelo menos 5 caracteres.");
  }
  if (!texto(estado.responsavel_principal)) {
    add("RESPONSAVEL_OBRIGATORIO", "Informe o responsável principal pela ação.");
  }
  if (!texto(estado.prazo_proxima_acao)) {
    add("PRAZO_OBRIGATORIO", "Informe o prazo da próxima ação.");
  }
  if (!texto(estado.target_audience)) {
    add("PUBLICO_OBRIGATORIO", "Informe o público-alvo da ação.");
  }
  if (!texto(estado.visibility)) {
    add("VISIBILIDADE_OBRIGATORIA", "Informe a visibilidade da ação.");
  }
  const canal = texto(estado.suggested_channel);
  if (!canal) {
    add("CANAL_OBRIGATORIO", "Informe o canal sugerido da ação.");
  }
  if (canalExterno(canal) && estado.requires_human_approval !== true) {
    add(
      "APROVACAO_HUMANA_OBRIGATORIA",
      "Canal externo exige aprovação humana registrada antes de qualquer rascunho de comunicação.",
    );
  }
  if (publicoExterno(estado.target_audience) && texto(estado.visibility) === "internal_only") {
    add(
      "VISIBILIDADE_INCOMPATIVEL",
      "Público externo não pode ficar com visibilidade somente interna: ajuste público ou visibilidade.",
    );
  }
  return erros;
}

export function mensagemProximaAcao(erros: ErroProximaAcao[]): string {
  return `PROXIMA_ACAO_INCOMPLETA: ${erros.map((e) => `${e.codigo} — ${e.mensagem}`).join(" ")}`;
}

export function exigirProximaAcaoCompleta(estado: EstadoProximaAcao): void {
  const erros = validarProximaAcao(estado);
  if (erros.length > 0) throw new Error(mensagemProximaAcao(erros));
}
