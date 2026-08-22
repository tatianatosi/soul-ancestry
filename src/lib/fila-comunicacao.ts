/**
 * Fila Humana de Comunicação (WhatsApp/e-mail).
 *
 * Esta camada apenas SUGERE mensagens para envio humano. Nenhum disparo,
 * webhook, cron, worker ou chamada externa existe neste corte. Toda sugestão
 * nasce em rascunho e depende de aprovação humana antes de qualquer envio
 * manual registrado.
 */

export const ENVIO_AUTOMATICO_HABILITADO = false as const;

export type Gatilho =
  | "lembrete_discovery"
  | "followup_proposta"
  | "confirmacao_formal"
  | "contrato_aguardando_assinatura"
  | "pagamento_inicial_aguardado"
  | "boas_vindas_onboarding"
  | "pendencia_documental"
  | "atualizacao_caso_aprovada"
  | "ausencia_touchpoint";

export const GATILHOS: { chave: Gatilho; rotulo: string; motivo: string; prioridade: 1 | 2 | 3 }[] = [
  { chave: "lembrete_discovery", rotulo: "Lembrete de Discovery agendada", motivo: "Call marcada e ainda não confirmada com o cliente.", prioridade: 2 },
  { chave: "followup_proposta", rotulo: "Follow-up de proposta sem resposta", motivo: "Proposta enviada sem retorno dentro do SLA interno.", prioridade: 1 },
  { chave: "confirmacao_formal", rotulo: "Confirmação formal recebida", motivo: "Aceite formal registrado; próximo passo é a formalização.", prioridade: 2 },
  { chave: "contrato_aguardando_assinatura", rotulo: "Contrato enviado e aguardando assinatura", motivo: "Instrumento enviado sem assinatura registrada.", prioridade: 1 },
  { chave: "pagamento_inicial_aguardado", rotulo: "Pagamento inicial aguardado", motivo: "Cobrança válida emitida e ainda não confirmada.", prioridade: 1 },
  { chave: "boas_vindas_onboarding", rotulo: "Boas-vindas após onboarding liberado", motivo: "Contrato assinado e pagamento inicial confirmado.", prioridade: 3 },
  { chave: "pendencia_documental", rotulo: "Pendência documental prioritária", motivo: "Documento essencial pendente no caso.", prioridade: 2 },
  { chave: "atualizacao_caso_aprovada", rotulo: "Atualização contextual aprovada de caso", motivo: "Conteúdo já aprovado internamente para o cliente.", prioridade: 3 },
  { chave: "ausencia_touchpoint", rotulo: "Ausência de touchpoint no prazo", motivo: "Cadência configurada vencida sem contato registrado.", prioridade: 2 },
];

export type Contexto = {
  gatilho: Gatilho;
  lead_id?: string | null;
  case_id?: string | null;
  rotulo: string;
  canal?: "whatsapp" | "email" | "outro" | null;
  /** Consentimento aplicável para o canal escolhido. */
  consentimento?: "concedido" | "pendente" | "recusado" | "nao_solicitado" | null;
  contrato_assinado?: boolean;
  pagamento_inicial_confirmado?: boolean;
  referencia_financeira_autorizada?: boolean;
  template_id?: string | null;
  is_demo?: boolean;
};

export type Sugestao = {
  gatilho: Gatilho;
  rotulo: string;
  canal: "whatsapp" | "email" | "outro";
  reason_for_contact: string;
  priority: 1 | 2 | 3;
  recommended_template_id: string | null;
  approval_status: "rascunho";
  delivery_status: "nao_enviado";
  lead_id: string | null;
  case_id: string | null;
};

/** Termos internos que nunca podem entrar no texto sugerido. */
const TERMOS_PROIBIDOS = [
  /https?:\/\//i,
  /token/i,
  /score/i,
  /radar de elegibilidade/i,
  /hip[óo]tese/i,
  /marco jur[íi]dico/i,
  /gravaç[ãa]o/i,
  /evid[êe]ncia/i,
  /custo|cac|cpl|roi|roas/i,
];

export function textoSuspeito(texto: string): string[] {
  return TERMOS_PROIBIDOS.filter((r) => r.test(texto)).map((r) => String(r));
}

export type Recusa = { bloqueado: true; motivo: string };

/**
 * Avalia um contexto e devolve uma sugestão em rascunho ou o motivo do bloqueio.
 * Nunca envia mensagem.
 */
export function avaliarSugestao(ctx: Contexto): Sugestao | Recusa {
  const def = GATILHOS.find((g) => g.chave === ctx.gatilho);
  if (!def) return { bloqueado: true, motivo: "Gatilho não catalogado." };
  const canal = ctx.canal ?? null;
  if (!canal) return { bloqueado: true, motivo: "Contato sem canal aplicável registrado." };
  if (ctx.consentimento !== "concedido")
    return { bloqueado: true, motivo: "Sem consentimento aplicável registrado para o canal." };
  if (ctx.gatilho === "pagamento_inicial_aguardado" && !ctx.referencia_financeira_autorizada)
    return { bloqueado: true, motivo: "Cobrança sem referência financeira autorizada." };
  if (ctx.gatilho === "boas_vindas_onboarding" && !(ctx.contrato_assinado && ctx.pagamento_inicial_confirmado))
    return { bloqueado: true, motivo: "Onboarding exige contrato assinado e pagamento inicial confirmado." };

  return {
    gatilho: ctx.gatilho,
    rotulo: ctx.rotulo,
    canal,
    reason_for_contact: def.motivo,
    priority: def.prioridade,
    recommended_template_id: ctx.template_id ?? null,
    approval_status: "rascunho",
    delivery_status: "nao_enviado",
    lead_id: ctx.lead_id ?? null,
    case_id: ctx.case_id ?? null,
  };
}

export function montarFilaHumana(contextos: Contexto[], opcoes?: { incluirDemo?: boolean }) {
  const base = opcoes?.incluirDemo ? contextos : contextos.filter((c) => !c.is_demo);
  const sugestoes: Sugestao[] = [];
  const bloqueadas: { rotulo: string; motivo: string }[] = [];
  for (const c of base) {
    const r = avaliarSugestao(c);
    if ("bloqueado" in r) bloqueadas.push({ rotulo: c.rotulo, motivo: r.motivo });
    else sugestoes.push(r);
  }
  sugestoes.sort((a, b) => a.priority - b.priority || a.rotulo.localeCompare(b.rotulo));
  return { sugestoes, bloqueadas };
}

/** Backlog reservado para a etapa pós-migração (fora do Lovable neste corte). */
export const BACKLOG_POS_MIGRACAO = [
  "Adaptador de provedor WhatsApp com credenciais em secret manager.",
  "Webhook de status de entrega sem conteúdo sensível em log.",
  "Serviço de fila com idempotência, rate limit, retentativa e opt-out.",
  "Worker agendado para transformar sugestão aprovada em envio autorizado.",
  "Testes de isolamento por organização, consentimento, template e duplicidade.",
  "Reconciliação de sent_at/delivery_status com auditoria append-only.",
  "Monitoramento de erro, falha de webhook e mensagem duplicada.",
  "Templates versionados com revisão humana antes da ativação.",
];
