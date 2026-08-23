/**
 * MATRIZ DE EQUIVALÊNCIA CA-UX (mockup → rota → dado → estado)
 *
 * Registro somente leitura exigido pela regra "mockup aprovado = contrato
 * visual e de navegação". Nenhuma consolidação de grupos (7 → 8) pode ocorrer
 * sem aprovação explícita da Proprietária sobre esta matriz.
 *
 * Este módulo NÃO lê nem grava dados operacionais: descreve equivalências.
 */

export type EstadoEquivalencia =
  | "implementado"
  | "parcial"
  | "ausente"
  | "a_confirmar";

export const ESTADO_EQUIVALENCIA_LABEL: Record<EstadoEquivalencia, string> = {
  implementado: "Implementado",
  parcial: "Parcial",
  ausente: "Ausente",
  a_confirmar: "A confirmar",
};

export type LinhaEquivalencia = {
  /** Aba/bloco do mockup aprovado que originou o item. */
  mockup: string;
  /** Rota real do Desk onde o item vive hoje. */
  rota: string;
  /** Fonte canônica de dado (tabela/derivação) que alimenta a tela. */
  dado: string;
  estado: EstadoEquivalencia;
  /** Observação operacional curta, sem juízo de mérito sobre casos. */
  nota?: string;
};

export type GrupoEquivalencia = {
  id: string;
  /** Nome do grupo tal como aparece hoje na navegação do Desk. */
  grupo: string;
  /** Grupo correspondente na navegação CA-UX-03 de 8 grupos. */
  grupoNovo?: string;
  rotaBase: string;
  linhas: LinhaEquivalencia[];
};

export const MATRIZ_EQUIVALENCIA: GrupoEquivalencia[] = [
  {
    id: "visao-geral",
    grupo: "Visão geral",
    grupoNovo: "Hoje",
    rotaBase: "/painel",
    linhas: [
      { mockup: "Overview / Visão Geral", rota: "/painel", dado: "derivado: casos, tarefas, ops_microentregas, communication_queue", estado: "implementado", nota: "Painel Hoje com ordem canônica e deduplicação." },
      { mockup: "Métricas do topo", rota: "/metricas", dado: "derivado: crm_casos, leads, eventos_financeiros", estado: "implementado" },
      { mockup: "Relatórios", rota: "/relatorios", dado: "case_reports, research_reports", estado: "parcial", nota: "Exportações consolidadas; alguns relatórios ainda manuais." },
      { mockup: "Alertas", rota: "/painel (Sinais de atenção)", dado: "derivado (alertas-derivados.ts) sobre case_alerts e SLA", estado: "implementado", nota: "Visão derivada, sem segunda fonte de verdade." },
      { mockup: "Radar interno multi-país", rota: "—", dado: "—", estado: "ausente", nota: "Lacuna real: radar multi-país não tem fonte canônica definida." },
    ],
  },
  {
    id: "comercial",
    grupo: "Comercial",
    grupoNovo: "Comercial",
    rotaBase: "/leads",
    linhas: [
      { mockup: "CRM Vivo — leads", rota: "/leads", dado: "leads, lead_sources, discovery_assessments", estado: "implementado" },
      { mockup: "Calls e interações", rota: "/calls · /leads#crm-contatos", dado: "crm_interactions, touchpoints", estado: "implementado", nota: "Interações imutáveis." },
      { mockup: "Próximas ações", rota: "/proximas-acoes", dado: "derivado: tarefas + leads", estado: "implementado" },
      { mockup: "Planejador", rota: "/casos#planejador", dado: "planner_tarefas", estado: "parcial" },
      { mockup: "Propostas (páginas 1–7)", rota: "/propostas", dado: "proposals, proposal_canva_pages", estado: "implementado" },
      { mockup: "Conversão e follow-up", rota: "/conversao", dado: "conversion_events", estado: "implementado", nota: "Sem promoção automática de lead para caso." },
      { mockup: "Clientes e núcleos", rota: "/clientes", dado: "clientes, nucleos_familiares, nucleo_membros", estado: "implementado" },
    ],
  },
  {
    id: "casos",
    grupo: "Casos e núcleos",
    grupoNovo: "Casos",
    rotaBase: "/casos",
    linhas: [
      { mockup: "Casos 360", rota: "/casos · /casos/$id", dado: "crm_casos, case_members, case_services", estado: "implementado" },
      { mockup: "Pessoas e dossiê-mãe", rota: "/nucleos", dado: "nucleos_familiares, case_dependents", estado: "implementado" },
      { mockup: "Jornada e tarefas", rota: "/tarefas", dado: "tarefas, ops_microentregas, ops_sla_regras", estado: "implementado", nota: "Cadência D10/D14 derivada." },
      { mockup: "Exceções operacionais", rota: "/ops-excecoes", dado: "ops_excecoes", estado: "implementado" },
      { mockup: "Qualidade e fechamento", rota: "/qualidade", dado: "quality_issues, case_activation_checks", estado: "implementado", nota: "9 gates de fechamento." },
      { mockup: "Onboarding / ativação", rota: "/onboarding/$id", dado: "onboarding_checklist, case_activation_checks", estado: "implementado" },
      { mockup: "Piloto", rota: "/piloto · /piloto-ana", dado: "piloto_conferencia, piloto_bloqueios", estado: "implementado" },
    ],
  },
  {
    id: "pesquisa",
    grupo: "Pesquisa genealógica",
    grupoNovo: "Pesquisa",
    rotaBase: "/pesquisa",
    linhas: [
      { mockup: "Pesquisa e plano de ação", rota: "/pesquisa-modulo · /plano-acao/$caseId", dado: "research_cases, research_action_plan_items, research_hypotheses", estado: "implementado" },
      { mockup: "Evidências e documentos", rota: "/evidencias", dado: "evidencias, documents, evidence_validations", estado: "implementado", nota: "URLs assinadas e log de acesso." },
      { mockup: "Fontes e consultas", rota: "/fontes-genealogicas", dado: "genealogical_sources_catalog, source_evaluation_matrix", estado: "implementado" },
      { mockup: "Privacidade e liberação", rota: "/privacidade/$id", dado: "consent_records, consent_exceptions, privacy_alerts", estado: "implementado" },
      { mockup: "Ficha piloto (13 módulos)", rota: "/piloto-ana", dado: "cadastral_records e demais registros históricos", estado: "parcial", nota: "Módulos históricos criados; preenchimento por caso ainda em curso." },
      { mockup: "Assistente AI de pesquisa", rota: "/pesquisa-modulo (painel lateral)", dado: "knowledge_items + gateway AI", estado: "parcial", nota: "Sugestões nunca confirmam achado automaticamente." },
    ],
  },
  {
    id: "contratos",
    grupo: "Contratos e financeiro",
    grupoNovo: "Contratos e financeiro",
    rotaBase: "/contratos",
    linhas: [
      { mockup: "Contratos, prévia e revisão", rota: "/contratos · /casos/$id/contrato/preparar", dado: "contracts, contract_versions, contract_review_events", estado: "implementado" },
      { mockup: "Anexos I–V", rota: "/ordens-servico · /governanca/contrato-base", dado: "contract_annexes, artifact_register", estado: "implementado", nota: "Revisão jurídica concluída; pendências apenas de materialização." },
      { mockup: "Origem do escopo", rota: "/escopo-origem", dado: "proposals → commercial_conditions → service_orders → contract_scope_items", estado: "implementado" },
      { mockup: "Catálogo e conciliação", rota: "/conciliacao-catalogo · /divergencias-catalogo · /homologacao-skus", dado: "sku_catalog, catalog_source_divergences, catalog_reconciliation_runs", estado: "implementado", nota: "Divergência bloqueia emissão de OS." },
      { mockup: "Dados parametrizáveis", rota: "/contrato-parametros", dado: "contract_parameter_values, blueprint_parameters", estado: "implementado" },
      { mockup: "Financeiro", rota: "/financeiro", dado: "invoices, payments, eventos_financeiros", estado: "parcial", nota: "Cobrança externa exige confirmação final; gateways não configurados." },
    ],
  },
  {
    id: "governanca",
    grupo: "Governança e biblioteca",
    grupoNovo: "Governança",
    rotaBase: "/biblioteca",
    linhas: [
      { mockup: "Modo Proprietária", rota: "/modo-proprietaria", dado: "owner_override_events, staff_access", estado: "implementado" },
      { mockup: "Biblioteca Mestre", rota: "/biblioteca", dado: "master_library_items, master_library_state_events", estado: "implementado" },
      { mockup: "Biblioteca de Mensagens", rota: "/biblioteca-mensagens", dado: "message_templates, message_template_versions", estado: "implementado" },
      { mockup: "Catálogo comercial", rota: "/catalogo", dado: "product_catalog, sku_catalog", estado: "implementado" },
      { mockup: "Validação jurídica", rota: "/matriz-juridica", dado: "legal_clause_matrix, versioned_legal_rules, legal_reference_milestones", estado: "parcial", nota: "Marcos, trilhas e casos impactados ainda com fonte a confirmar." },
      { mockup: "Auditoria e decisões", rota: "/governanca/decisoes · /auditoria", dado: "decisions, audit_logs, change_log", estado: "implementado" },
      { mockup: "Inventário e completude", rota: "/governanca/inventario-patrimonial · /governanca/varredura-completude", dado: "artifact_register, derivações de varredura", estado: "implementado" },
      { mockup: "Integrações", rota: "/integracoes", dado: "integrations, integration_runs", estado: "a_confirmar", nota: "E-mail bloqueado por DNS; assinatura e cobrança sem credencial." },
    ],
  },
  {
    id: "app-cliente",
    grupo: "App Cliente",
    grupoNovo: "Cliente",
    rotaBase: "/acessos-portal",
    linhas: [
      { mockup: "Acessos e visibilidade", rota: "/acessos-portal", dado: "client_portal_access, client_portal_case_access, authorized_portal_emails", estado: "implementado", nota: "Link mágico de uso único, 20 min." },
      { mockup: "Atendimento e publicação", rota: "/atendimento", dado: "portal_tickets, portal_ticket_messages, client_deliverables", estado: "implementado", nota: "Publicação nunca automática." },
      { mockup: "Projeção do caso ao cliente", rota: "/portal · /canvas/$token", dado: "app_projections (projeção autorizada)", estado: "implementado", nota: "Somente dados classificados como real." },
      { mockup: "Solicitações de documento", rota: "/atendimento (solicitações)", dado: "portal_document_requests, document_requests", estado: "implementado" },
    ],
  },
  {
    id: "administracao",
    grupo: "Administração (novo grupo CA-UX-03)",
    grupoNovo: "Administração",
    rotaBase: "/modo-proprietaria",
    linhas: [
      { mockup: "Modo Proprietária", rota: "/modo-proprietaria", dado: "owner_override_events, staff_access", estado: "implementado", nota: "Reagrupado; nenhuma regra alterada." },
      { mockup: "Equipe e papéis", rota: "/equipe", dado: "profiles, staff_access, user_roles", estado: "implementado", nota: "Visível somente para admin." },
      { mockup: "Configurações", rota: "/configuracoes", dado: "organizations, org_settings", estado: "a_confirmar", nota: "Cobertura de parâmetros ainda sem evidência consolidada." },
      { mockup: "Segurança e verificação administrativa", rota: "/reconfirmar-propriedade · /governanca/varredura-administracao", dado: "audit_logs, owner_override_events", estado: "parcial", nota: "Verificação existe; prova ponta a ponta depende de login manual." },
    ],
  },
];

export function contarEstados(): Record<EstadoEquivalencia, number> {
  const base: Record<EstadoEquivalencia, number> = {
    implementado: 0,
    parcial: 0,
    ausente: 0,
    a_confirmar: 0,
  };
  for (const g of MATRIZ_EQUIVALENCIA) for (const l of g.linhas) base[l.estado] += 1;
  return base;
}

export function totalLinhas(): number {
  return MATRIZ_EQUIVALENCIA.reduce((n, g) => n + g.linhas.length, 0);
}

/** Grupos que ainda têm item ausente ou a confirmar — bloqueiam consolidação. */
export function gruposComLacuna(): string[] {
  return MATRIZ_EQUIVALENCIA.filter((g) =>
    g.linhas.some((l) => l.estado === "ausente" || l.estado === "a_confirmar"),
  ).map((g) => g.grupo);
}
