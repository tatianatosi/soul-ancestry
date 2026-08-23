/**
 * Rótulos humanos para entidades técnicas.
 *
 * O fluxo principal do Desk nunca deve exibir nome de tabela. Nomes técnicos
 * aparecem somente em "Detalhes técnicos", recolhido por padrão e restrito à
 * proprietária administradora.
 */

export const ROTULO_ENTIDADE: Record<string, string> = {
  organizations: "Organizações",
  profiles: "Perfis",
  staff_access: "Acesso da equipe",
  user_roles: "Papéis de acesso",
  leads: "Leads",
  clientes: "Clientes",
  casos: "Casos",
  crm_casos: "Casos do CRM",
  case_plans: "Planos do caso",
  citizenship_tracks: "Rota de cidadania",
  ops_microentregas: "Microentregas",
  microentregas: "Microentregas",
  case_checklist_items: "Itens do checklist",
  checklist_cadastral: "Checklist cadastral",
  commercial_conditions: "Condições comerciais",
  contract_scope_items: "Itens de escopo",
  contracts: "Contratos",
  contract_versions: "Versões do contrato",
  contract_annexes: "Anexos contratuais",
  service_orders: "Ordens de serviço",
  proposals: "Propostas",
  product_catalog: "Catálogo de produtos",
  sku_catalog: "Catálogo de SKUs",
  catalog_source_divergences: "Divergências de catálogo",
  catalog_reconciliation_runs: "Reprocessamentos de conciliação",
  audit_logs: "Registro de auditoria",
  owner_override_events: "Decisões da proprietária",
  documents: "Documentos",
  evidencias: "Evidências",
  evidences: "Evidências",
  research_cases: "Casos de pesquisa",
  research_people: "Pessoas pesquisadas",
  research_sources: "Fontes de pesquisa",
  tarefas: "Tarefas",
  invoices: "Faturas",
  payments: "Pagamentos",
  app_projections: "Projeções para o App Cliente",
  client_portal_access: "Acessos do portal do cliente",
  case_timeline_events: "Linha do tempo do caso",
  case_alerts: "Alertas do caso",
  ops_excecoes: "Exceções operacionais",
  cadeia_operacional: "Cadeia operacional",
  acao_externa: "Ação externa",
};

/** Converte identificador técnico em rótulo humano legível. */
export function rotuloHumano(chave: string | null | undefined): string {
  if (!chave) return "—";
  const direto = ROTULO_ENTIDADE[chave];
  if (direto) return direto;
  return chave
    .replace(/[_.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/** Verdadeiro quando a chave é um nome técnico conhecido de tabela/entidade. */
export function ehNomeTecnico(chave: string | null | undefined): boolean {
  return Boolean(chave && chave in ROTULO_ENTIDADE);
}
