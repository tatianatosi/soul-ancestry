/**
 * G-07 — Plano de ação de pesquisa, instituições e previsão de terceiros.
 *
 * Este módulo é espelho das travas do banco (fonte de verdade). Nada aqui
 * contata instituição, envia e-mail ou WhatsApp, gera despesa, cobrança,
 * reembolso, pedido externo ou evento de calendário.
 */

export type Prioridade = "critica" | "alta" | "media" | "baixa";
export type StatusAcao =
  | "planejada"
  | "pronta_para_revisao"
  | "aguardando_aprovacao"
  | "aprovada"
  | "realizada"
  | "aguardando_resposta"
  | "concluida"
  | "cancelada";

export const PRIORIDADES: { id: Prioridade; rotulo: string }[] = [
  { id: "critica", rotulo: "Crítica" },
  { id: "alta", rotulo: "Alta" },
  { id: "media", rotulo: "Média" },
  { id: "baixa", rotulo: "Baixa" },
];

export const STATUS_ACAO: { id: StatusAcao; rotulo: string }[] = [
  { id: "planejada", rotulo: "Planejada" },
  { id: "pronta_para_revisao", rotulo: "Pronta para revisão" },
  { id: "aguardando_aprovacao", rotulo: "Aguardando aprovação" },
  { id: "aprovada", rotulo: "Aprovada" },
  { id: "realizada", rotulo: "Realizada" },
  { id: "aguardando_resposta", rotulo: "Aguardando resposta" },
  { id: "concluida", rotulo: "Concluída" },
  { id: "cancelada", rotulo: "Cancelada" },
];

export const TIPOS_ACAO: { id: string; rotulo: string }[] = [
  { id: "consulta_acervo_interno", rotulo: "Consulta ao acervo interno" },
  { id: "solicitacao_documento", rotulo: "Solicitação de documento" },
  { id: "contato_institucional", rotulo: "Contato institucional" },
  { id: "visita_presencial", rotulo: "Visita presencial" },
  { id: "pesquisa_em_campo", rotulo: "Pesquisa em campo" },
  { id: "traducao", rotulo: "Tradução" },
  { id: "apostilamento", rotulo: "Apostilamento" },
  { id: "conferencia_documental", rotulo: "Conferência documental" },
  { id: "revisao_interna", rotulo: "Revisão interna" },
  { id: "organizacao_de_evidencias", rotulo: "Organização de evidências" },
  { id: "preparacao_de_pedido", rotulo: "Preparação de pedido (sem envio)" },
  { id: "outro", rotulo: "Outro" },
];

export const CANAIS: { id: string; rotulo: string }[] = [
  { id: "desk_only", rotulo: "Somente Desk (sem contato externo)" },
  { id: "email", rotulo: "E-mail (rascunho)" },
  { id: "telefone", rotulo: "Telefone (roteiro)" },
  { id: "presencial", rotulo: "Presencial" },
  { id: "portal_web", rotulo: "Portal web" },
  { id: "correio", rotulo: "Correio" },
  { id: "whatsapp", rotulo: "WhatsApp (rascunho)" },
  { id: "intermediario", rotulo: "Intermediário" },
];

export const TIPOS_INSTITUICAO: { id: string; rotulo: string }[] = [
  { id: "cartorio", rotulo: "Cartório" },
  { id: "arquivo_publico", rotulo: "Arquivo público" },
  { id: "arquivo_eclesiastico", rotulo: "Arquivo eclesiástico" },
  { id: "paroquia", rotulo: "Paróquia" },
  { id: "consulado", rotulo: "Consulado" },
  { id: "embaixada", rotulo: "Embaixada" },
  { id: "orgao_estatal", rotulo: "Órgão estatal" },
  { id: "biblioteca", rotulo: "Biblioteca" },
  { id: "museu", rotulo: "Museu" },
  { id: "tradutor", rotulo: "Tradutor" },
  { id: "apostilamento", rotulo: "Apostilamento" },
  { id: "pesquisador_local", rotulo: "Pesquisador local" },
  { id: "outro", rotulo: "Outro" },
];

export const STATUS_ATUALIZACAO: { id: string; rotulo: string }[] = [
  { id: "nao_verificado", rotulo: "Não verificado" },
  { id: "verificado", rotulo: "Verificado" },
  { id: "desatualizado", rotulo: "Desatualizado" },
  { id: "invalido", rotulo: "Inválido" },
];

export const TIPOS_DESPESA: { id: string; rotulo: string }[] = [
  { id: "taxa_cartorio", rotulo: "Taxa de cartório" },
  { id: "emolumento", rotulo: "Emolumento" },
  { id: "certidao", rotulo: "Certidão" },
  { id: "busca_documental", rotulo: "Busca documental" },
  { id: "traducao_juramentada", rotulo: "Tradução juramentada" },
  { id: "apostilamento", rotulo: "Apostilamento" },
  { id: "envio_postal", rotulo: "Envio postal" },
  { id: "pesquisador_local", rotulo: "Pesquisador local" },
  { id: "taxa_consular", rotulo: "Taxa consular" },
  { id: "deslocamento", rotulo: "Deslocamento" },
  { id: "outro", rotulo: "Outro" },
];

export const ORIGENS_ESTIMATIVA: { id: string; rotulo: string }[] = [
  { id: "tabela_publicada", rotulo: "Tabela publicada" },
  { id: "informacao_institucional", rotulo: "Informação institucional" },
  { id: "historico_de_casos", rotulo: "Histórico de casos" },
  { id: "estimativa_interna", rotulo: "Estimativa interna" },
];

export const APROVACOES_CLIENTE: { id: string; rotulo: string }[] = [
  { id: "nao_submetida", rotulo: "Não submetida" },
  { id: "aguardando_aprovacao", rotulo: "Aguardando aprovação" },
  { id: "aprovada", rotulo: "Aprovada" },
  { id: "recusada", rotulo: "Recusada" },
];

export const PAGADORES: { id: string; rotulo: string }[] = [
  { id: "cliente", rotulo: "Cliente" },
  { id: "clube", rotulo: "Clube Ancestral" },
  { id: "terceiro", rotulo: "Terceiro" },
];

export const AVISO_ESTIMATIVA =
  "Previsão de valores e prazos de terceiros. Não é caixa, receita, custo próprio, " +
  "reembolso nem cobrança automática do Clube Ancestral.";

export const AVISO_RASCUNHO =
  "Rascunho interno. Nenhuma mensagem é enviada por este módulo: o envio depende de revisão e ação humana fora daqui.";

export type ItemPlano = {
  id?: string;
  action_type?: string;
  titulo?: string | null;
  priority?: Prioridade;
  reason?: string | null;
  status?: StatusAcao;
  due_date?: string | null;
  next_check_at?: string | null;
  suggested_channel?: string | null;
  institution_id?: string | null;
  communication_draft?: string | null;
  requires_human_approval?: boolean;
  contact_result_internal?: string | null;
  estimated_cost_amount?: number | null;
  expense_approval_status?: string | null;
  payer?: string | null;
  archived_at?: string | null;
};

/** Validação espelho das travas do banco. Retorna a lista de impedimentos. */
export function validarItemPlano(item: ItemPlano): string[] {
  const erros: string[] = [];
  if (!item.action_type) erros.push("Informe o tipo de ação.");
  if (!item.titulo || !item.titulo.trim()) erros.push("Informe um título para a ação.");
  if (!item.reason || !item.reason.trim()) erros.push("Descreva o motivo da ação.");
  if (item.requires_human_approval === false) erros.push("Aprovação humana é obrigatória e não pode ser desligada.");
  if (item.status === "aguardando_resposta" && !item.next_check_at)
    erros.push("Item aguardando resposta exige data de próxima rechecagem.");
  if (
    (item.status === "realizada" || item.status === "concluida") &&
    !(item.contact_result_internal ?? "").trim()
  )
    erros.push("Registre o resultado interno da ação realizada.");
  if (
    item.suggested_channel &&
    item.suggested_channel !== "desk_only" &&
    !item.institution_id &&
    ["contato_institucional", "visita_presencial", "solicitacao_documento"].includes(String(item.action_type))
  )
    erros.push("Vincule a instituição de referência em vez de repetir contatos na tarefa.");
  if (typeof item.estimated_cost_amount === "number" && item.estimated_cost_amount < 0)
    erros.push("Previsão de custo não pode ser negativa.");
  if (item.expense_approval_status === "aprovada" && (!item.payer || item.payer === "nao_definido"))
    erros.push("Defina quem paga antes de aprovar a previsão.");
  return erros;
}

/** Regra: prioridade crítica com prazo hoje ou vencido gera alerta imediato no Desk. */
export function exigeAlertaImediato(item: ItemPlano, hoje: Date = new Date()): boolean {
  if (item.priority !== "critica") return false;
  if (!item.due_date) return false;
  if (item.archived_at) return false;
  if (item.status === "concluida" || item.status === "cancelada") return false;
  const dia = new Date(`${String(item.due_date).slice(0, 10)}T23:59:59.999Z`);
  const limite = new Date(`${hoje.toISOString().slice(0, 10)}T23:59:59.999Z`);
  return dia.getTime() <= limite.getTime();
}

/** Rascunho de comunicação: sempre fila interna, nunca envio. */
export function rascunhoComunicacao(item: ItemPlano) {
  return {
    status: "draft_created" as const,
    target_audience: "interno_tatiana" as const,
    visibility: "internal_only" as const,
    requires_human_approval: true as const,
    enviado: false as const,
    canal: item.suggested_channel ?? "desk_only",
    aviso: AVISO_RASCUNHO,
  };
}

export type Estimativa = {
  quantity?: number;
  unit_price_min?: number | null;
  unit_price_max?: number | null;
  estimated_wait_days_min?: number | null;
  estimated_wait_days_max?: number | null;
  currency?: string;
  estimate_source?: string;
  client_approval_status?: string;
};

export function calcularEstimativa(e: Estimativa) {
  const q = Number(e.quantity ?? 1);
  const min = Number(e.unit_price_min ?? 0);
  const max = Number(e.unit_price_max ?? e.unit_price_min ?? 0);
  return {
    estimated_total_min: Math.round(min * q * 100) / 100,
    estimated_total_max: Math.round(max * q * 100) / 100,
    /** Previsão nunca vira lançamento financeiro. */
    geraLancamentoFinanceiro: false as const,
    aviso: AVISO_ESTIMATIVA,
  };
}

export function validarEstimativa(e: Estimativa): string[] {
  const erros: string[] = [];
  if (!e.quantity || Number(e.quantity) <= 0) erros.push("Informe quantidade maior que zero.");
  if (e.unit_price_min != null && e.unit_price_max != null && Number(e.unit_price_min) > Number(e.unit_price_max))
    erros.push("Preço mínimo não pode ser maior que o máximo.");
  if (
    e.estimated_wait_days_min != null &&
    e.estimated_wait_days_max != null &&
    Number(e.estimated_wait_days_min) > Number(e.estimated_wait_days_max)
  )
    erros.push("Prazo mínimo não pode ser maior que o máximo.");
  if (e.client_approval_status === "aprovada" && !(e.estimate_source ?? "").trim())
    erros.push("Informe a origem da estimativa antes de registrar aprovação.");
  return erros;
}

export type Instituicao = {
  name?: string | null;
  update_status?: string;
  contact_source?: string | null;
  last_verified_at?: string | null;
};

export function validarInstituicao(i: Instituicao): string[] {
  const erros: string[] = [];
  if (!(i.name ?? "").trim()) erros.push("Informe o nome da instituição.");
  if (i.update_status === "verificado" && (!(i.contact_source ?? "").trim() || !i.last_verified_at))
    erros.push("Contato verificado exige fonte do contato e data da verificação.");
  return erros;
}

export const moedaBR = (v: number | null | undefined, moeda = "BRL") =>
  v == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: moeda }).format(Number(v));
