/**
 * Linha do tempo operacional do caso.
 *
 * A timeline é registro, não motor: ela referencia entidades já existentes
 * (proposta, contrato, pagamento, dossiê, pesquisa, relatório) e nunca duplica
 * o Roteiro Master — as perguntas do roteiro vivem no Discovery/Brief e os
 * campos aprovados vivem no Blueprint.
 */

export const TIPOS_EVENTO = [
  { valor: "discovery", rotulo: "Discovery", fase: "comercial" },
  { valor: "proposta", rotulo: "Proposta", fase: "comercial" },
  { valor: "aceite_verbal", rotulo: "Aceite verbal", fase: "comercial" },
  { valor: "confirmacao_formal", rotulo: "Confirmação formal", fase: "comercial" },
  { valor: "conferencia_canva", rotulo: "Conferência Canva", fase: "formalizacao" },
  { valor: "case_service", rotulo: "Case service", fase: "formalizacao" },
  { valor: "formalizacao", rotulo: "Formalização", fase: "formalizacao" },
  { valor: "contrato", rotulo: "Contrato", fase: "formalizacao" },
  { valor: "pagamento", rotulo: "Pagamento", fase: "formalizacao" },
  { valor: "caso", rotulo: "Caso", fase: "execucao" },
  { valor: "tarefa", rotulo: "Tarefa", fase: "execucao" },
  { valor: "pendencia", rotulo: "Pendência/bloqueio", fase: "execucao" },
  { valor: "onboarding", rotulo: "Onboarding", fase: "onboarding" },
  { valor: "dossie", rotulo: "Dossiê", fase: "execucao" },
  { valor: "pesquisa", rotulo: "Pesquisa", fase: "execucao" },
  { valor: "documento", rotulo: "Documento", fase: "execucao" },
  { valor: "evidencia", rotulo: "Evidência", fase: "execucao" },
  { valor: "achado", rotulo: "Achado", fase: "execucao" },
  { valor: "relatorio_f1", rotulo: "Relatório F1", fase: "execucao" },
  { valor: "relatorio_f2", rotulo: "Relatório F2", fase: "execucao" },
  { valor: "micro_entrega", rotulo: "Micro-entrega", fase: "execucao" },
  { valor: "protocolo", rotulo: "Protocolo", fase: "protocolo" },
  { valor: "pos_reconhecimento", rotulo: "Pós-reconhecimento", fase: "pos_reconhecimento" },
  { valor: "arquivamento", rotulo: "Arquivamento", fase: "encerramento" },
] as const;

export type TipoEvento = (typeof TIPOS_EVENTO)[number]["valor"];

export const STATUS_EVENTO = [
  { valor: "previsto", rotulo: "Previsto" },
  { valor: "em_andamento", rotulo: "Em andamento" },
  { valor: "registrado", rotulo: "Registrado" },
  { valor: "bloqueado", rotulo: "Bloqueado" },
  { valor: "cancelado", rotulo: "Cancelado" },
] as const;

export type EventoTimeline = {
  id?: string;
  case_id?: string;
  event_type: string;
  phase?: string | null;
  title: string;
  status: string;
  occurred_at?: string | null;
  due_at?: string | null;
  responsavel_nome?: string | null;
  source_entity_type?: string | null;
  source_entity_id?: string | null;
  next_action?: string | null;
  visibility?: string | null;
  summary_internal?: string | null;
  summary_client_approved?: string | null;
  bloqueio?: boolean | null;
  alerta?: string | null;
};

export function rotuloEvento(v: string): string {
  return TIPOS_EVENTO.find((t) => t.valor === v)?.rotulo ?? v;
}

export function faseDoEvento(v: string): string {
  return TIPOS_EVENTO.find((t) => t.valor === v)?.fase ?? "outros";
}

function ts(v?: string | null): number {
  return v ? new Date(v).getTime() : 0;
}

export type LinhaDoTempo = {
  passado: EventoTimeline[];
  proximosMarcos: EventoTimeline[];
  bloqueios: EventoTimeline[];
  alertas: string[];
  proximaAcao: EventoTimeline | null;
  responsaveis: string[];
};

/** Organiza os eventos reais do caso — nunca inventa marco nem duplica roteiro. */
export function montarLinhaDoTempo(eventos: EventoTimeline[], hoje: Date = new Date()): LinhaDoTempo {
  const passado = eventos
    .filter((e) => e.status === "registrado" || (e.occurred_at && ts(e.occurred_at) <= hoje.getTime()))
    .sort((a, b) => ts(b.occurred_at) - ts(a.occurred_at));

  const proximosMarcos = eventos
    .filter((e) => e.status === "previsto" || e.status === "em_andamento")
    .sort((a, b) => (ts(a.due_at) || Infinity) - (ts(b.due_at) || Infinity));

  const bloqueios = eventos.filter((e) => e.bloqueio || e.status === "bloqueado");

  const alertas: string[] = [];
  for (const e of eventos) {
    if (e.alerta?.trim()) alertas.push(`${rotuloEvento(e.event_type)}: ${e.alerta.trim()}`);
    if (e.due_at && e.status !== "registrado" && e.status !== "cancelado" && ts(e.due_at) < hoje.getTime()) {
      alertas.push(`${rotuloEvento(e.event_type)}: prazo vencido em ${new Date(e.due_at).toLocaleDateString("pt-BR")}.`);
    }
  }

  const proximaAcao = proximosMarcos.find((e) => e.next_action?.trim()) ?? proximosMarcos[0] ?? null;
  const responsaveis = [...new Set(eventos.map((e) => e.responsavel_nome).filter(Boolean) as string[])];

  return { passado, proximosMarcos, bloqueios, alertas, proximaAcao, responsaveis };
}

/** Só sai para o cliente o que tem resumo aprovado explicitamente. */
export function eventosVisiveisAoCliente(eventos: EventoTimeline[]): EventoTimeline[] {
  return eventos.filter((e) => e.visibility === "cliente_aprovado" && Boolean(e.summary_client_approved?.trim()));
}

/**
 * REVERIFICACAO-ADVERSARIAL-GIOVANNA (27/09/2026) — a policy `cte_select_portal`
 * (migration 20260910184500) e `eventosVisiveisAoCliente` acima já existiam;
 * nenhum escritor jamais gravou `visibility = 'cliente_aprovado'` em
 * `case_timeline_events` (todo escritor real usa `visibility: "interno"` fixo
 * — ver `timeline-operacional.server.ts`). Peça órfã: policy + filtro sem
 * escritor nem consumidor. Esta validação é o único portão antes de gravar —
 * exige o texto que a família vai ler, nunca aprova em branco.
 */
export function validarAprovacaoEventoCliente(resumoCliente: string | null | undefined): {
  valido: boolean;
  motivo: string | null;
} {
  const texto = (resumoCliente ?? "").trim();
  if (!texto) {
    return { valido: false, motivo: "Escreva o resumo que a família vai ler antes de aprovar." };
  }
  if (texto.length < 8) {
    return { valido: false, motivo: "O resumo para a família é curto demais para ser um marco compreensível." };
  }
  return { valido: true, motivo: null };
}
