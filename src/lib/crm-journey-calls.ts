/**
 * Ponte CRM Journey ↔ Painel de Calls / leads.
 * Persistência canônica = tabela `leads` (não criar crm_calls).
 */

export const CRM_JOURNEY_FONTE_CALLS = "leads" as const;

/** De-para documental Journey → coluna/comportamento em `leads`. */
export const DE_PARA_CRM_JOURNEY_LEADS: ReadonlyArray<{
  journey: string;
  leads: string;
}> = [
  { journey: "crm_calls / call_id", leads: "leads.id" },
  { journey: "opportunity_id", leads: "leads.id → crm_casos.lead_id / leads.case_id (sem tabela opportunities)" },
  { journey: "status_call", leads: "leads.status_call" },
  { journey: "consentimento_gravacao", leads: "leads.consentimento_status (+ canal/em/versão) / consentimento_gravacao" },
  { journey: "spin_*", leads: "leads.spin_situacao|problema|implicacao|necessidade" },
  { journey: "resumo_validado", leads: "leads.resumo_call + resumo_validado" },
  { journey: "proxima_acao / data_proxima_acao", leads: "leads.proxima_acao / proxima_acao_em" },
  { journey: "area_responsavel / responsavel_nominal", leads: "leads.area_responsavel / responsavel_nome" },
  { journey: "crm_interactions", leads: "NÃO CRIAR — dívida WhatsApp/timeline" },
];

const EIXOS_INATIVOS = new Set(["perdido", "encerrado_sem_aderencia"]);

export type LeadOperacionalMinimo = {
  archived_at?: string | null;
  eixo_comercial?: string | null;
  area_responsavel?: string | null;
  responsavel_nome?: string | null;
  proxima_acao?: string | null;
  proxima_acao_em?: string | null;
  case_id?: string | null;
};

function vazio(v: unknown): boolean {
  return v == null || String(v).trim() === "";
}

/** Lead ainda na esteira comercial (não arquivado / não encerrado). */
export function leadComercialAtivo(l: LeadOperacionalMinimo): boolean {
  return !l.archived_at && !EIXOS_INATIVOS.has(String(l.eixo_comercial ?? ""));
}

/**
 * Pendências operacionais do Journey: lead ativo sem área, responsável,
 * próxima ação ou data. Informam — não substituem autoridade da proprietária.
 */
export function pendenciasLeadAtivoSemProximaAcao(l: LeadOperacionalMinimo): string[] {
  if (!leadComercialAtivo(l)) return [];
  const out: string[] = [];
  if (vazio(l.area_responsavel)) out.push("Área responsável ausente");
  if (vazio(l.responsavel_nome)) out.push("Responsável nominal ausente");
  if (vazio(l.proxima_acao)) out.push("Próxima ação ausente");
  if (vazio(l.proxima_acao_em)) out.push("Data da próxima ação ausente");
  return out;
}

export function searchPropostaAposHandoff(opts: {
  leadId?: string | null;
  caseId?: string | null;
  clienteId?: string | null;
}): { lead?: string; caso?: string; cliente?: string } {
  const search: { lead?: string; caso?: string; cliente?: string } = {};
  if (opts.leadId && String(opts.leadId).trim()) search.lead = String(opts.leadId);
  if (opts.caseId && String(opts.caseId).trim()) search.caso = String(opts.caseId);
  if (opts.clienteId && String(opts.clienteId).trim()) search.cliente = String(opts.clienteId);
  return search;
}

/** Path+query para Link simples / testes de superfície. */
export function hrefPropostaAposHandoff(opts: {
  leadId?: string | null;
  caseId?: string | null;
  clienteId?: string | null;
}): string {
  const s = searchPropostaAposHandoff(opts);
  const q = new URLSearchParams();
  if (s.lead) q.set("lead", s.lead);
  if (s.caso) q.set("caso", s.caso);
  if (s.cliente) q.set("cliente", s.cliente);
  const qs = q.toString();
  return qs ? `/propostas?${qs}` : "/propostas";
}
