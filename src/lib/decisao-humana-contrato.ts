/**
 * B05 (04/11/2026) — "Decisão humana atual" do instrumento contratual.
 *
 * Leitura pura do estado persistido (contracts.status, motivo de cancelamento, pendência do checklist
 * e responsável pela revisão). Nada aqui grava, envia, assina ou cobra. Estados do CHECK
 * contracts_status_check: draft, pending_data, ready_for_review, under_human_review,
 * approved_for_send, sent, signed, rejected, cancelled, archived.
 */
export type DecisaoHumanaContrato = {
  causa: string;
  impacto: string;
  responsavel: string;
};

export function decisaoHumanaAtual(entrada: {
  status: string | null | undefined;
  pendenciaChecklist?: string | null;
  motivoCancelamento?: string | null;
  responsavelNome?: string | null;
  /** Versões não arquivadas (número e status de contract_versions). */
  versoes?: { numero: number; status: string }[];
}): DecisaoHumanaContrato {
  const responsavel = entrada.responsavelNome?.trim() || "Responsável pela revisão não definido";
  const pendencia = entrada.pendenciaChecklist?.trim();
  const versoes = [...(entrada.versoes ?? [])].sort((a, b) => b.numero - a.numero);
  const aprovada = versoes.find((v) => v.status === "approved_for_send");
  const maisRecente = versoes[0];
  switch (entrada.status) {
    case "draft":
    case "pending_data":
      if (aprovada) {
        const emPreparo =
          maisRecente && maisRecente.numero !== aprovada.numero
            ? ` A versão ${maisRecente.numero}, mais recente, está em preparação.`
            : "";
        return {
          causa: `A versão ${aprovada.numero} está aprovada para envio.${emPreparo}${pendencia ? ` ${pendencia}` : ""}`,
          impacto: "Enviar é ato externo e depende da sua confirmação; o cliente ainda não recebeu o contrato.",
          responsavel,
        };
      }
      return {
        causa: pendencia ? `Instrumento em preparação — ${pendencia}` : "Instrumento em preparação.",
        impacto: "Nada vai ao cliente antes da revisão humana da versão.",
        responsavel,
      };
    case "ready_for_review":
    case "under_human_review":
      return {
        causa: "Versão aguardando revisão humana.",
        impacto: "Envio e assinatura aguardam esta revisão.",
        responsavel,
      };
    case "approved_for_send":
      return {
        causa: "Versão aprovada para envio. Enviar é ato externo e depende da sua confirmação.",
        impacto: "O cliente ainda não recebeu o contrato.",
        responsavel,
      };
    case "sent":
      return {
        causa: "Contrato enviado; aguardando o registro da assinatura.",
        impacto: "Cobrança e liberação do App aguardam a assinatura registrada.",
        responsavel,
      };
    case "signed":
      return {
        causa: "Assinatura registrada.",
        impacto: "O instrumento não muda mais; alterações só por aditivo ou complemento.",
        responsavel,
      };
    case "cancelled":
      return {
        causa: entrada.motivoCancelamento?.trim()
          ? `Contrato cancelado — ${entrada.motivoCancelamento.trim()}`
          : "Contrato cancelado (motivo não registrado).",
        impacto: "Não vale para o caso; o registro continua no histórico.",
        responsavel,
      };
    case "rejected":
      return {
        causa: "Versão recusada na revisão humana.",
        impacto: "É preciso preparar nova versão antes de qualquer envio.",
        responsavel,
      };
    case "archived":
      return {
        causa: "Instrumento arquivado.",
        impacto: "Fora da operação corrente; nada foi excluído.",
        responsavel,
      };
    default:
      return { causa: "Estado do instrumento não registrado.", impacto: "Dados insuficientes.", responsavel };
  }
}
