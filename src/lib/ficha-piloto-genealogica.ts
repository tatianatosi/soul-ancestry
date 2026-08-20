/**
 * Ficha piloto genealógica — preparação de pesquisa.
 *
 * Regras invioláveis desta camada:
 * - nenhuma fonte é consultada, nenhum documento é solicitado, nenhum arquivo é contatado;
 * - árvore, achado e relatório não são publicados nesta etapa;
 * - pessoa, vínculo ou linhagem só saem de "afirmado" com evidência registrada;
 * - o Plano de Ação de Pesquisa só recebe ações após autorização humana.
 */

export const STATUS_PESQUISA: Record<string, string> = {
  not_started: "Não iniciada",
  preparation: "Preparação pendente",
  internal_research: "Pesquisa interna",
  awaiting_documents: "Aguardando documentos",
  awaiting_review: "Aguardando revisão",
  paused: "Pausada",
  completed: "Concluída",
  archived: "Arquivada",
};

export const STATUS_AUTORIZACAO: Record<string, string> = {
  not_applicable: "Não aplicável",
  not_requested: "Não solicitada",
  pending: "Pendente",
  registered: "Registrada",
  denied: "Negada",
  expired: "Expirada",
};

export const STATUS_GATE_PESQUISA: Record<string, string> = {
  blocked_by_contract: "Bloqueada por contrato",
  blocked_by_financial_gate: "Bloqueada por gate financeiro",
  pending_authorization: "Autorização pendente",
  blocked_by_quality: "Bloqueada por qualidade",
  blocked_by_case_status: "Bloqueada pelo estado do caso",
  eligible_for_human_release: "Elegível a liberação humana",
  released_by_authorized_user: "Liberada por responsável autorizado",
};

export const STATUS_PESSOA: Record<string, string> = {
  subject: "Titular",
  family_member: "Familiar",
  ancestor: "Antepassado",
  descendant: "Descendente",
  related_person: "Pessoa relacionada",
  unknown_person: "Pessoa não identificada",
};

export const STATUS_IDENTIDADE: Record<string, string> = {
  unreviewed: "Não revisada",
  tentative: "Provisória",
  reviewed: "Revisada",
  confirmed: "Confirmada",
  conflicting: "Conflitante",
};

export const STATUS_VINCULO: Record<string, string> = {
  asserted: "Apenas afirmado",
  under_review: "Em revisão",
  supported: "Com suporte",
  validated: "Validado",
  conflicting: "Conflitante",
  rejected: "Rejeitado",
};

export const STATUS_FONTE: Record<string, string> = {
  referenced: "Referência interna",
  located: "Localizada",
  reviewed: "Revisada",
  verified: "Verificada",
  inaccessible: "Inacessível",
  rejected: "Rejeitada",
};

export const STATUS_SOLICITACAO: Record<string, string> = {
  draft: "Não solicitado / a preparar",
  requested_from_client: "Solicitado ao cliente",
  received: "Recebido",
  under_review: "Em revisão",
  completed: "Concluído",
  blocked_by_gate: "Bloqueado por gate",
  cancelled: "Cancelado",
  archived: "Arquivado",
};

export type ContextoPesquisa = {
  autorizacao?: string | null;
  gate?: string | null;
  contrato_assinado?: boolean | null;
  pagamento_confirmado?: boolean | null;
};

/** Motivos que impedem qualquer consulta externa ou pedido de documento. */
export function bloqueiosPesquisaExterna(ctx: ContextoPesquisa): string[] {
  const motivos: string[] = [];
  if (ctx.autorizacao !== "registered") motivos.push("Autorização de pesquisa pendente.");
  if (!ctx.contrato_assinado) motivos.push("Contrato assinado pendente.");
  if (!ctx.pagamento_confirmado) motivos.push("Pagamento inicial confirmado pendente.");
  if (ctx.gate === "released_by_authorized_user" && motivos.length === 0) return [];
  return motivos;
}

export function podeConsultarFonteExterna(ctx: ContextoPesquisa): boolean {
  return bloqueiosPesquisaExterna(ctx).length === 0;
}

/** O plano de ação só recebe ações depois de autorização humana registrada. */
export function planoDeAcaoAberto(ctx: ContextoPesquisa): boolean {
  return ctx.autorizacao === "registered";
}

/** Nada é confirmado sem evidência: vínculo, identidade ou linhagem. */
export function podeMarcarConfirmado(evidencias: number): boolean {
  return evidencias > 0;
}
