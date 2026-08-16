/**
 * INVENTÁRIO E RECUPERAÇÃO DE ATIVOS — CLUBE ANCESTRAL
 *
 * Snapshot técnico-funcional somente leitura. Nenhuma tabela, policy, função,
 * rota, componente, seed ou integração foi criada, alterada ou removida para
 * produzir este inventário. Todos os números vieram de leitura (SELECT) no
 * catálogo do banco e de listagem de arquivos do repositório.
 */

export const SNAPSHOT = {
  data: "2026-08-16",
  metodo:
    "Leitura de pg_class / pg_policies / pg_proc / storage.buckets / information_schema + listagem do repositório (src/routes, src/components, src/lib). Somente SELECT e leitura de arquivos.",
  totais: {
    tabelas: 84,
    views: 4,
    funcoes: 117,
    policies: 239,
    buckets: 3,
    rotasInternas: 33,
    rotasPortal: 7,
    rotasPublicas: 13,
    componentesDominio: 28,
    modulosLib: 50,
  },
} as const;

export type Dominio =
  | "CRM"
  | "Contrato"
  | "Proposta"
  | "Assinatura"
  | "Financeiro"
  | "Caso"
  | "Pesquisa"
  | "Documentos"
  | "Portal"
  | "Desk"
  | "SLA"
  | "Qualidade"
  | "Planejador"
  | "CA OPS"
  | "Governança"
  | "Transcrição"
  | "WhatsApp"
  | "Plataforma";

export type Tipo =
  | "tabela"
  | "view"
  | "função"
  | "policy"
  | "rota"
  | "componente"
  | "template"
  | "automação"
  | "integração"
  | "documento"
  | "prompt"
  | "configuração"
  | "storage";

export type Status =
  | "ativo"
  | "parcialmente ativo"
  | "órfão"
  | "duplicado"
  | "legado"
  | "DEMO"
  | "bloqueado por decisão"
  | "quebrado"
  | "desconhecido";

export type Risco = "baixo" | "médio" | "alto" | "crítico";

export type Decisao =
  | "preservar"
  | "reconectar"
  | "corrigir"
  | "substituir só com migração aprovada"
  | "arquivar"
  | "investigar";

export interface Ativo {
  id: string;
  dominio: Dominio;
  tipo: Tipo;
  local: string;
  consumidor: string;
  dependencias: string[];
  dados: string;
  status: Status;
  evidencia: string;
  risco: Risco;
  decisao: Decisao;
}

export const ATIVOS: Ativo[] = [
  // ---------------------------------------------------------------- Plataforma
  {
    id: "organizations / organization_members / user_roles / profiles",
    dominio: "Plataforma",
    tipo: "tabela",
    local: "public (banco)",
    consumidor: "SaasShell, todas as policies via is_org_member/has_org_role",
    dependencias: ["auth.users", "has_org_role()", "is_org_member()"],
    dados: "Tenants, vínculo usuário↔org, papéis (app_role)",
    status: "ativo",
    evidencia: "3 organizações (1 real + 2 DEMO), 1 membro, 2 papéis atribuídos",
    risco: "crítico",
    decisao: "preservar",
  },
  {
    id: "staff_access / auth_throttle / bootstrap_lock",
    dominio: "Plataforma",
    tipo: "tabela",
    local: "public (banco)",
    consumidor: "/equipe/entrar, /equipe, src/lib/equipe.functions.ts",
    dependencias: ["organizations", "fn_proteger_ultimo_admin"],
    dados: "Contas de equipe, throttle de login, trava de bootstrap",
    status: "ativo",
    evidencia: "8 registros em staff_access; bootstrap_lock com 1 linha (bootstrap fechado)",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "audit_logs / change_log",
    dominio: "Governança",
    tipo: "tabela",
    local: "public (banco)",
    consumidor: "/auditoria, triggers fn_audit / fn_audit_status",
    dependencias: ["fn_audit()", "fn_audit_status()"],
    dados: "Trilha de auditoria por entidade e mudança de status",
    status: "ativo",
    evidencia: "~120 linhas em audit_logs; change_log vazio",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "fn_block_delete (bloqueio de exclusão física)",
    dominio: "Plataforma",
    tipo: "função",
    local: "public.fn_block_delete()",
    consumidor: "Triggers em tabelas de domínio",
    dependencias: ["colunas archived_at/archived_by"],
    dados: "Impede DELETE; força arquivamento",
    status: "ativo",
    evidencia: "Função presente entre as 117 funções de public",
    risco: "crítico",
    decisao: "preservar",
  },
  {
    id: "Buckets contracts / pesquisa / documentos",
    dominio: "Documentos",
    tipo: "storage",
    local: "storage.buckets",
    consumidor: "Contratos, Pesquisa, Documentos e Portal (URLs assinadas)",
    dependencias: ["policies de storage", "documents.storage_path"],
    dados: "PDFs assinados, evidências, documentos do caso",
    status: "ativo",
    evidencia: "3 buckets, todos privados (public = false)",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "Variáveis de ambiente (por nome)",
    dominio: "Plataforma",
    tipo: "configuração",
    local: ".env",
    consumidor: "Cliente e servidor",
    dependencias: [],
    dados:
      "SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_PROJECT_ID, VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID",
    status: "ativo",
    evidencia: "Apenas nomes lidos; nenhum valor exposto. Não há segredo próprio de integração externa configurado.",
    risco: "médio",
    decisao: "preservar",
  },

  // ---------------------------------------------------------------- CRM / Caso
  {
    id: "crm_casos",
    dominio: "Caso",
    tipo: "tabela",
    local: "public.crm_casos (47 colunas, 12 triggers)",
    consumidor: "/casos, /piloto, /onboarding/$id, quase todos os módulos",
    dependencias: ["clientes", "organizations", "gates de contrato/pagamento"],
    dados: "Caso canônico: fase, prioridade, gates, selo, piloto, aceite comercial",
    status: "ativo",
    evidencia: "2 casos: CA-DEMO-IT-2026-001 (demo) e CA-2026-ANA-001 (piloto real)",
    risco: "crítico",
    decisao: "preservar",
  },
  {
    id: "casos (tabela antiga do protótipo)",
    dominio: "Caso",
    tipo: "tabela",
    local: "public.casos (16 colunas, 1 policy)",
    consumidor: "Nenhum módulo interno atual referencia",
    dependencias: ["microentregas", "planner_tarefas", "touchpoints", "sla_regras"],
    dados: "5 linhas remanescentes do protótipo inicial",
    status: "duplicado",
    evidencia: "Coexiste com crm_casos; 1 policy apenas; sem rota que a consulte",
    risco: "médio",
    decisao: "investigar",
  },
  {
    id: "clientes / client_contacts / leads",
    dominio: "CRM",
    tipo: "tabela",
    local: "public",
    consumidor: "/clientes, /leads, comercial.functions.ts",
    dependencias: ["organizations"],
    dados: "Cadastro de clientes, contatos e funil de leads",
    status: "parcialmente ativo",
    evidencia: "3 clientes; 0 contatos; 0 leads — funil comercial sem dados vivos",
    risco: "médio",
    decisao: "reconectar",
  },
  {
    id: "tarefas + fn_tarefa_sla",
    dominio: "SLA",
    tipo: "tabela",
    local: "public.tarefas (31 colunas)",
    consumidor: "/tarefas, Desk Operacional",
    dependencias: ["ops_sla_regras", "crm_casos"],
    dados: "Tarefas com SLA, bloqueio e vínculo a pessoa/evidência/hipótese",
    status: "parcialmente ativo",
    evidencia: "2 tarefas, ambas no caso DEMO; nenhuma no piloto real",
    risco: "médio",
    decisao: "reconectar",
  },
  {
    id: "Componentes de CRM/Desk do protótipo",
    dominio: "CRM",
    tipo: "componente",
    local: "src/components/desk-crm.tsx, desk-app.tsx, desk-go-live.tsx, cliente-app.tsx",
    consumidor: "/prototipo e / (vitrine visual)",
    dependencias: ["src/lib/caseAdapter.ts", "src/types/case.ts"],
    dados: "Mockup navegável sem backend",
    status: "legado",
    evidencia: "Renderizados apenas pelas rotas de protótipo; não consultam Supabase",
    risco: "baixo",
    decisao: "preservar",
  },
  {
    id: "Integrações CRM/WhatsApp/Calls/Transcrição",
    dominio: "WhatsApp",
    tipo: "integração",
    local: "public.integrations + /integracoes",
    consumidor: "Centro de integrações",
    dependencias: ["integration_runs", "integration_review_queue"],
    dados: "CRM externo, pré-onboarding, painel de calls, WhatsApp/Meta, gateway financeiro, armazenamento",
    status: "bloqueado por decisão",
    evidencia: "14 linhas, todas com status 'desligada'; 7 categorias duplicadas em 2 organizações",
    risco: "médio",
    decisao: "investigar",
  },

  // ---------------------------------------------------------------- Contratual
  {
    id: "contracts (49 colunas)",
    dominio: "Contrato",
    tipo: "tabela",
    local: "public.contracts",
    consumidor: "/contratos, /contratos/$id",
    dependencias: ["contract_templates", "contract_versions", "crm_casos", "clientes"],
    dados: "Contrato, gates financeiro/pesquisa, assinatura externa",
    status: "DEMO",
    evidencia: "4 contratos, todos demo=true, todos com case_id nulo e template_id nulo",
    risco: "alto",
    decisao: "corrigir",
  },
  {
    id: "contract_templates",
    dominio: "Contrato",
    tipo: "template",
    local: "public.contract_templates",
    consumidor: "Motor contratual parametrizável",
    dependencias: ["contract_case_parameters.contract_template_id"],
    dados: "MODELO ESTUDO (v1) e BASE-GEN-V2 (v2), ambos active e demo=false",
    status: "ativo",
    evidencia: "2 templates ativos; nenhum contrato existente aponta para eles",
    risco: "alto",
    decisao: "reconectar",
  },
  {
    id: "contract_case_parameters / contract_parameter_values / contract_parameter_previews",
    dominio: "Contrato",
    tipo: "tabela",
    local: "public",
    consumidor: "/contrato-parametros e /contrato-parametros/$id",
    dependencias: ["crm_casos", "proposals", "contract_templates", "trg_ccp_guard", "trg_cpv_guard"],
    dados: "Registro mestre parametrizável por caso (partes, objeto, comerciais, assinatura)",
    status: "órfão",
    evidencia: "0 linhas nas três tabelas — motor construído e nunca alimentado",
    risco: "crítico",
    decisao: "reconectar",
  },
  {
    id: "contract_versions / annexes / clause_overrides / scope_items / parties / exceptions / source_links / validation_results / review_events",
    dominio: "Contrato",
    tipo: "tabela",
    local: "public (9 tabelas satélite)",
    consumidor: "Motor contratual",
    dependencias: ["contracts"],
    dados: "Versões, anexos, cláusulas, escopo, partes, exceções, validações",
    status: "parcialmente ativo",
    evidencia: "Apenas linhas ligadas aos contratos DEMO (1 anexo, 2 partes, 2 overrides, 1 escopo); versions/validations/reviews vazios",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "Guardas contratuais (trg_guard_cobranca, trg_guard_pesquisa_externa, fn_contracts_signature_guard)",
    dominio: "Assinatura",
    tipo: "automação",
    local: "public (triggers/funções)",
    consumidor: "Financeiro e Pesquisa externa",
    dependencias: ["crm_casos.contrato_assinado", "contracts.status"],
    dados: "Bloqueia cobrança e pesquisa externa sem contrato assinado",
    status: "ativo",
    evidencia: "Funções presentes; research_cases DEMO está em 'blocked_by_contract'",
    risco: "crítico",
    decisao: "preservar",
  },
  {
    id: "Camada de serviço contratual",
    dominio: "Contrato",
    tipo: "componente",
    local:
      "src/lib/contratos.functions.ts, contratos.server.ts, contrato-parametros.functions.ts, contrato-parametros.server.ts",
    consumidor: "Rotas /contratos e /contrato-parametros",
    dependencias: ["requireSupabaseAuth"],
    dados: "CRUD, prévia HTML, regras de anexo por produto, criação downstream",
    status: "ativo",
    evidencia: "4 módulos presentes em src/lib",
    risco: "alto",
    decisao: "preservar",
  },

  // ---------------------------------------------------------------- Proposta / Financeiro
  {
    id: "proposals",
    dominio: "Proposta",
    tipo: "tabela",
    local: "public.proposals (30 colunas)",
    consumidor: "/propostas, pré-preenchimento contratual",
    dependencias: ["leads", "clientes", "crm_casos"],
    dados: "Proposta, valor, escopo, validade, aceite",
    status: "quebrado",
    evidencia: "2 propostas (1 aprovada, 1 enviada), ambas com case_id nulo — não ligam ao caso",
    risco: "alto",
    decisao: "corrigir",
  },
  {
    id: "invoices / payments / invoice_adjustments / eventos_financeiros",
    dominio: "Financeiro",
    tipo: "tabela",
    local: "public",
    consumidor: "/financeiro",
    dependencias: ["contracts", "service_orders", "guardas de cobrança"],
    dados: "Faturas, pagamentos, ajustes e eventos financeiros",
    status: "DEMO",
    evidencia: "1 fatura (emitida) no caso DEMO; 0 pagamentos; 0 ajustes; 0 eventos",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "service_orders",
    dominio: "Contrato",
    tipo: "tabela",
    local: "public.service_orders (24 colunas)",
    consumidor: "/ordens-servico",
    dependencias: ["contracts", "crm_casos"],
    dados: "Ordens de serviço por escopo contratado",
    status: "órfão",
    evidencia: "Rota existe; tabela sem linhas relevantes ao piloto",
    risco: "médio",
    decisao: "reconectar",
  },

  // ---------------------------------------------------------------- Onboarding / Piloto
  {
    id: "case_activation_checks + case_activation_pendencias()",
    dominio: "Caso",
    tipo: "automação",
    local: "public + /onboarding/$id",
    consumidor: "Ativação de caso",
    dependencias: ["fn_guard_ativacao", "fn_seed_activation_checks"],
    dados: "Checks obrigatórios de ativação (identificação, consentimento, contrato, pagamento)",
    status: "ativo",
    evidencia: "18 checks registrados",
    risco: "crítico",
    decisao: "preservar",
  },
  {
    id: "piloto_conferencia",
    dominio: "Caso",
    tipo: "tabela",
    local: "public.piloto_conferencia + /piloto",
    consumidor: "Piloto real Ana Luiza",
    dependencias: ["crm_casos", "fn_piloto_dado_guard"],
    dados: "18 campos de conferência com origem obrigatória",
    status: "parcialmente ativo",
    evidencia: "18 linhas do caso CA-2026-ANA-001, todas com valor vazio, origem nula e verificado=false",
    risco: "crítico",
    decisao: "reconectar",
  },
  {
    id: "piloto_bloqueios",
    dominio: "Caso",
    tipo: "tabela",
    local: "public.piloto_bloqueios",
    consumidor: "/piloto",
    dependencias: ["crm_casos.ativacao_operacional"],
    dados: "Bloqueios críticos do piloto",
    status: "ativo",
    evidencia:
      "6 bloqueios críticos abertos: contrato_assinado_externo, condicao_financeira, partes_qualificadas, consentimento_registrado, dossie_minimo_conferido, autorizacao_pesquisa_externa",
    risco: "crítico",
    decisao: "preservar",
  },

  // ---------------------------------------------------------------- Pesquisa
  {
    id: "Módulo de pesquisa (14 tabelas research_*)",
    dominio: "Pesquisa",
    tipo: "tabela",
    local:
      "research_cases, research_people, research_name_variants, research_relationships, research_events, research_sources, research_evidence_items, research_evidence_links, research_hypotheses, research_case_hypotheses, research_document_requests, research_pending_items, research_reports, research_audit_events",
    consumidor: "/pesquisa-modulo e /pesquisa-modulo/$id",
    dependencias: ["crm_casos", "pode_iniciar_pesquisa_externa()"],
    dados: "Pessoas, relações, eventos, fontes, evidências, hipóteses, pendências",
    status: "DEMO",
    evidencia: "1 research_case (DEMO, gate blocked_by_contract), 2 pessoas, 4 evidências — nada no piloto real",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "evidencias / evidencia_acessos (módulo antigo)",
    dominio: "Pesquisa",
    tipo: "tabela",
    local: "public.evidencias (34 colunas, 8 triggers) + /evidencias",
    consumidor: "Rota /evidencias",
    dependencias: ["crm_casos"],
    dados: "3 evidências do fluxo anterior",
    status: "duplicado",
    evidencia: "Coexiste com research_evidence_items; duas rotas distintas no menu (/evidencias e /pesquisa-modulo)",
    risco: "médio",
    decisao: "investigar",
  },
  {
    id: "Assistente de IA de pesquisa",
    dominio: "Pesquisa",
    tipo: "prompt",
    local: "src/lib/pesquisa-ia.server.ts (PROMPT_MESTRE) + src/routes/api/pesquisa-assistente.ts",
    consumidor: "src/components/pesquisa/assistente.tsx",
    dependencias: ["Lovable AI Gateway (google/gemini-2.5-pro)", "avaliarSuficiencia()", "temPlaceholder()"],
    dados: "Dossiê do caso confirmado; bloqueia execução com dados insuficientes",
    status: "ativo",
    evidencia: "Único endpoint em src/routes/api; trava de caso confirmado e selo DEMO implementados",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "pode_iniciar_pesquisa_externa()",
    dominio: "Pesquisa",
    tipo: "função",
    local: "public (security definer)",
    consumidor: "Gate de pesquisa externa",
    dependencias: ["contracts", "payments", "quality_issues"],
    dados: "Retorna jsonb com autorização e motivos",
    status: "ativo",
    evidencia: "Função presente; research_case DEMO bloqueado por contrato",
    risco: "crítico",
    decisao: "preservar",
  },

  // ---------------------------------------------------------------- Documentos / Privacidade
  {
    id: "documents (35 colunas, 5 policies)",
    dominio: "Documentos",
    tipo: "tabela",
    local: "public.documents + /privacidade",
    consumidor: "Equipe e Portal",
    dependencias: ["buckets", "consent_records", "fn_documents_guard"],
    dados: "Documentos com categoria, sensibilidade, liberação ao cliente",
    status: "DEMO",
    evidencia: "3 documentos, todos do caso DEMO (2 internos, 1 entrega liberada)",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "consent_records / consent_exceptions / privacy_alerts",
    dominio: "Documentos",
    tipo: "tabela",
    local: "public",
    consumidor: "/privacidade, guardas de consentimento",
    dependencias: ["fn_consent_guard", "consentimento_ativo()"],
    dados: "Consentimentos, exceções e alertas de privacidade",
    status: "órfão",
    evidencia: "0 consentimentos registrados — bloqueio 'consentimento_registrado' do piloto depende disso",
    risco: "crítico",
    decisao: "reconectar",
  },

  // ---------------------------------------------------------------- Portal
  {
    id: "portal_casos / portal_meu_cadastro (views de barreira)",
    dominio: "Portal",
    tipo: "view",
    local: "public (views)",
    consumidor: "Rotas /portal/*",
    dependencias: ["portal_meu_acesso()", "portal_caso_permitido()"],
    dados: "Colunas mínimas expostas ao cliente",
    status: "ativo",
    evidencia: "2 das 4 views de public; substituíram leitura direta das tabelas cruas",
    risco: "crítico",
    decisao: "preservar",
  },
  {
    id: "client_portal_access / client_portal_case_access / client_access_events",
    dominio: "Portal",
    tipo: "tabela",
    local: "public",
    consumidor: "/acessos-portal, magic link",
    dependencias: ["auth", "portal_meu_acesso()"],
    dados: "Convites, acesso por caso, eventos de acesso",
    status: "parcialmente ativo",
    evidencia: "1 acesso e 1 vínculo por caso; 0 eventos de acesso registrados",
    risco: "alto",
    decisao: "preservar",
  },
  {
    id: "portal_tickets / portal_ticket_messages / portal_document_requests",
    dominio: "Portal",
    tipo: "tabela",
    local: "public",
    consumidor: "/portal/mensagens/$id, /atendimento",
    dependencias: ["fn_portal_ticket_msg", "fn_portal_ticket_touch"],
    dados: "Tickets, mensagens e pedidos de documento",
    status: "DEMO",
    evidencia: "1 ticket, 3 mensagens, 1 pedido — todos no caso DEMO",
    risco: "médio",
    decisao: "preservar",
  },
  {
    id: "Rotas do portal",
    dominio: "Portal",
    tipo: "rota",
    local: "src/routes/portal/{route,index,casos.$id,documentos,faturas,mensagens.$id,proposta}.tsx",
    consumidor: "Cliente autenticado por magic link",
    dependencias: ["portal.functions.ts", "portal-cliente.functions.ts", "portal-atendimento.functions.ts"],
    dados: "Status, documentos liberados, faturas, mensagens",
    status: "ativo",
    evidencia: "7 arquivos de rota; nenhuma consulta a hipóteses ou logs internos",
    risco: "alto",
    decisao: "preservar",
  },

  // ---------------------------------------------------------------- Desk / SLA / Qualidade
  {
    id: "ops_sla_regras / ops_microentregas / ops_excecoes + v_ops_*",
    dominio: "Desk",
    tipo: "tabela",
    local: "public + /ops e /ops-excecoes",
    consumidor: "Desk Operacional (Kanban e calendário)",
    dependencias: ["tarefas", "ops_painel()", "ops_sla_status()"],
    dados: "Regras de SLA, microentregas e exceções",
    status: "parcialmente ativo",
    evidencia: "12 regras de SLA cadastradas; 0 microentregas operacionais; 0 exceções",
    risco: "médio",
    decisao: "reconectar",
  },
  {
    id: "microentregas / planner_tarefas / touchpoints / sla_regras (protótipo)",
    dominio: "Planejador",
    tipo: "tabela",
    local: "public (1 policy cada)",
    consumidor: "Nenhuma rota interna atual",
    dependencias: ["casos (tabela antiga)"],
    dados: "63 tarefas de planner e 6 microentregas do protótipo",
    status: "órfão",
    evidencia: "Ligadas a 'casos', não a 'crm_casos'; sem consumidor no app interno",
    risco: "médio",
    decisao: "investigar",
  },
  {
    id: "Planejador SKU × país × etapas",
    dominio: "Planejador",
    tipo: "configuração",
    local: "não localizado",
    consumidor: "—",
    dependencias: [],
    dados: "SKU, países, etapas, gates, checklist, dependências e entregas",
    status: "desconhecido",
    evidencia:
      "Nenhuma tabela de SKU/produto/planner por país no schema; planner_tarefas é lista plana do protótipo. Onde deveria estar: módulo Planejador + crm_casos.tipo_servico.",
    risco: "alto",
    decisao: "investigar",
  },
  {
    id: "quality_checklist_templates / quality_issues / quality_exports",
    dominio: "Qualidade",
    tipo: "tabela",
    local: "public + /qualidade",
    consumidor: "Gate de ativação",
    dependencias: ["fn_quality_guard_ativacao", "quality_scan RPC"],
    dados: "Checklists, não conformidades e exportações",
    status: "parcialmente ativo",
    evidencia: "0 issues abertas; templates presentes; guarda de ativação ativa",
    risco: "médio",
    decisao: "preservar",
  },

  // ---------------------------------------------------------------- Governança
  {
    id: "artifact_register (CA-EVO / Manifesto de Resgate)",
    dominio: "Governança",
    tipo: "documento",
    local: "public.artifact_register + /biblioteca",
    consumidor: "src/components/governanca/manifesto.tsx",
    dependencias: ["knowledge_items", "decisions"],
    dados: "Registro de artefatos com origem, lacuna, próxima ação e status de recuperação",
    status: "ativo",
    evidencia: "16 artefatos registrados; colunas de recuperação já existem (status_recuperacao, lacuna, proxima_acao)",
    risco: "médio",
    decisao: "preservar",
  },
  {
    id: "knowledge_items / decisions",
    dominio: "Governança",
    tipo: "tabela",
    local: "public",
    consumidor: "/biblioteca",
    dependencias: ["artifact_register"],
    dados: "Base de conhecimento e decisões formais",
    status: "parcialmente ativo",
    evidencia: "6 itens de conhecimento; 0 decisões registradas",
    risco: "médio",
    decisao: "reconectar",
  },
  {
    id: "Relatórios e painéis",
    dominio: "CA OPS",
    tipo: "rota",
    local: "/painel, /relatorios, ops_painel()",
    consumidor: "Equipe interna",
    dependencias: ["crm_casos", "tarefas", "invoices"],
    dados: "KPIs operacionais e comerciais",
    status: "parcialmente ativo",
    evidencia: "Rotas presentes; base de dados majoritariamente DEMO",
    risco: "baixo",
    decisao: "preservar",
  },
  {
    id: "Transcrições, chamadas e Drive",
    dominio: "Transcrição",
    tipo: "integração",
    local: "não localizado",
    consumidor: "—",
    dependencias: [],
    dados: "Transcrições de reunião, gravações, materiais de descoberta",
    status: "desconhecido",
    evidencia:
      "Nenhuma tabela de transcrição/chamada/Drive no schema. Origem 'transcricao' existe apenas como valor de confiança nos guards contratuais. Onde deveria estar: integrations (categoria calls) + documents.",
    risco: "alto",
    decisao: "investigar",
  },
];

// -------------------------------------------------------------- Mapas A a F

export interface Mapa {
  id: string;
  titulo: string;
  linhas: { item: string; situacao: string }[];
}

export const MAPAS: Mapa[] = [
  {
    id: "A",
    titulo: "A. Motor contratual parametrizável",
    linhas: [
      { item: "Templates ativos", situacao: "MODELO ESTUDO (v1) e BASE-GEN-V2 (v2) — únicos ativos, demo=false" },
      { item: "Registro mestre (contract_case_parameters)", situacao: "0 linhas — motor nunca alimentado" },
      { item: "Valores de campo (contract_parameter_values)", situacao: "0 linhas" },
      { item: "Prévias imutáveis (contract_parameter_previews)", situacao: "0 linhas" },
      { item: "proposta_id → contrato", situacao: "Quebrado: as 2 propostas têm case_id nulo" },
      { item: "case_id → contrato", situacao: "Quebrado: os 4 contratos existentes têm case_id nulo e são DEMO" },
      { item: "template_id no contrato", situacao: "Nulo nos 4 contratos — nenhum aponta para os templates ativos" },
      { item: "SKU / produto", situacao: "Não localizado no schema; anexos por produto dependem de regra em código" },
      { item: "Partes e valores", situacao: "contract_parties com 2 linhas DEMO; valores só em proposals" },
      { item: "Assinatura", situacao: "Campos de assinatura externa existem em contracts; nenhum contrato real" },
      { item: "Financeiro", situacao: "1 fatura DEMO; guarda de cobrança sem contrato assinado está ativa" },
      { item: "Campos duplicados", situacao: "Escopo aparece em proposals.escopo, contracts.scope_summary, contract_scope_items e piloto_conferencia.escopo_aprovado" },
      { item: "Campos sem origem", situacao: "Os 18 campos de piloto_conferencia estão com origem nula" },
    ],
  },
  {
    id: "B",
    titulo: "B. CRM e caso 360",
    linhas: [
      { item: "Cadastro", situacao: "3 clientes; 0 contatos; 0 leads" },
      { item: "Caso canônico", situacao: "crm_casos com 2 casos (1 DEMO, 1 piloto real)" },
      { item: "Pipeline", situacao: "Campos fase/prioridade/status existem; sem dados vivos fora do DEMO" },
      { item: "Placego / CRM externo", situacao: "Integração cadastrada e desligada; sem execução registrada" },
      { item: "Chamada / roteiro / transcrição", situacao: "Não localizado como tabela; apenas categoria 'calls' desligada" },
      { item: "WhatsApp", situacao: "Integração desligada; origem 'whatsapp' aceita nos guards como baixa confiança" },
      { item: "Tarefas / Desk / SLA", situacao: "12 regras de SLA ativas; 2 tarefas DEMO; 0 microentregas operacionais" },
      { item: "Dicionário de validação", situacao: "Existe em código (contract_parameter_definicoes, activation_check_definicoes)" },
    ],
  },
  {
    id: "C",
    titulo: "C. Planejador",
    linhas: [
      { item: "SKU × Planner", situacao: "Não localizado" },
      { item: "Países", situacao: "Somente crm_casos.pais e clientes.pais_interesse; sem catálogo de etapas por país" },
      { item: "Etapas e checklist", situacao: "case_checklist_items existe (0 linhas); planner_tarefas (63) órfão" },
      { item: "Gates", situacao: "Existem em outros módulos: ativação, contrato, pesquisa externa, qualidade" },
      { item: "Bloqueios", situacao: "piloto_bloqueios (6 críticos abertos) e ops_excecoes (0)" },
      { item: "Entregas", situacao: "microentregas (6, órfãs) e ops_microentregas (0)" },
      { item: "Ligação ao caso", situacao: "Quebrada: planner_tarefas/microentregas apontam para 'casos', não 'crm_casos'" },
    ],
  },
  {
    id: "D",
    titulo: "D. Portal e segurança",
    linhas: [
      { item: "portal_casos", situacao: "View de barreira ativa" },
      { item: "portal_meu_cadastro", situacao: "View de barreira ativa" },
      { item: "Endpoints legados", situacao: "Nenhum endpoint público exposto além de src/routes/api/pesquisa-assistente.ts" },
      { item: "Documentos", situacao: "Somente liberado_cliente=true chega ao portal; 1 documento liberado (DEMO)" },
      { item: "Tickets", situacao: "1 ticket e 3 mensagens DEMO" },
      { item: "Faturas", situacao: "1 fatura DEMO visível conforme liberação" },
      { item: "Storage", situacao: "3 buckets privados; acesso por URL assinada e auditado" },
      { item: "Policies", situacao: "239 policies em public; RLS habilitada em todas as 84 tabelas" },
    ],
  },
  {
    id: "E",
    titulo: "E. Pesquisa",
    linhas: [
      { item: "research_cases", situacao: "1 caso, DEMO, gate blocked_by_contract" },
      { item: "Pessoas e variantes", situacao: "2 pessoas cadastradas (DEMO)" },
      { item: "Relações e eventos", situacao: "Tabelas presentes, volume mínimo DEMO" },
      { item: "Fontes e evidências", situacao: "4 itens de evidência DEMO; módulo antigo 'evidencias' com 3 linhas em paralelo" },
      { item: "Hipóteses", situacao: "Tabelas research_hypotheses e research_case_hypotheses presentes" },
      { item: "Pedidos documentais e pendências", situacao: "Tabelas presentes; sem dados no piloto real" },
      { item: "Qualidade", situacao: "research_quality_scan disponível" },
      { item: "Gates externos", situacao: "pode_iniciar_pesquisa_externa() ativo e bloqueando" },
    ],
  },
  {
    id: "F",
    titulo: "F. Governança",
    linhas: [
      { item: "CA-EVO / artefatos", situacao: "artifact_register com 16 registros e campos de recuperação" },
      { item: "Decisões", situacao: "Tabela decisions vazia" },
      { item: "Exceções", situacao: "contract_exceptions (1), consent_exceptions (0), ops_excecoes (0)" },
      { item: "Auditoria", situacao: "audit_logs (~120), client_access_events (0), research_audit_events" },
      { item: "Relatórios e painéis", situacao: "/relatorios e /painel ativos sobre base majoritariamente DEMO" },
      { item: "CA OPS", situacao: "ops_painel() disponível; Desk sem dados operacionais reais" },
    ],
  },
];

// -------------------------------------------------------------- Ana Luiza

export interface ItemAna {
  item: string;
  situacao: string;
  localizado: boolean;
  evidencia: string;
}

export const ANA_LUIZA: ItemAna[] = [
  {
    item: "case_id canônico",
    situacao: "CA-2026-ANA-001 — 'Projeto familiar — Ana Luiza (piloto real)'",
    localizado: true,
    evidencia: "crm_casos: demo=false, piloto=true, selo 'PILOTO REAL — DADOS REAIS — ACESSO RESTRITO'",
  },
  {
    item: "Cliente vinculado",
    situacao: "Ana Luiza (organização Clube Ancestral)",
    localizado: true,
    evidencia: "clientes → crm_casos.cliente_id",
  },
  {
    item: "Aceite comercial",
    situacao: "Registrado em 14/08/2026",
    localizado: true,
    evidencia: "crm_casos.aceite_comercial_em",
  },
  {
    item: "Estado do caso",
    situacao: "status=rascunho; preparação=GO_CONDICIONAL; ativação operacional=NO_GO; ativo=false",
    localizado: true,
    evidencia: "crm_casos (colunas preparacao_status e ativacao_operacional)",
  },
  {
    item: "Proposta e registro do aceite",
    situacao: "Não localizado — as 2 propostas existentes têm case_id nulo e não estão ligadas a este caso",
    localizado: false,
    evidencia: "proposals.case_id nulo em ambas as linhas. Deveria estar em: proposals.case_id",
  },
  {
    item: "Materiais de descoberta, reunião, transcrição, apresentação e anexos",
    situacao: "Não localizado — nenhum documento vinculado ao caso",
    localizado: false,
    evidencia: "documents: 3 linhas, todas do caso DEMO. Deveria estar em: documents + bucket documentos",
  },
  {
    item: "Parâmetros contratuais preenchidos",
    situacao: "Não localizado — nenhum registro mestre criado",
    localizado: false,
    evidencia: "contract_case_parameters e contract_parameter_values com 0 linhas",
  },
  {
    item: "Contrato / rascunho e versão de template",
    situacao: "Não localizado — os 4 contratos existentes são DEMO e sem case_id",
    localizado: false,
    evidencia: "contracts.demo=true em todos; template_id nulo. Deveria usar MODELO ESTUDO ou BASE-GEN-V2",
  },
  {
    item: "Assinatura",
    situacao: "Não assinado; bloqueio crítico 'contrato_assinado_externo' aberto",
    localizado: true,
    evidencia: "piloto_bloqueios + crm_casos.contrato_assinado=false",
  },
  {
    item: "Financeiro",
    situacao: "Sem fatura ou pagamento; bloqueio 'condicao_financeira' aberto",
    localizado: true,
    evidencia: "invoices: única fatura pertence ao caso DEMO; crm_casos.pagamento_confirmado=false",
  },
  {
    item: "Conferência de dados (18 campos)",
    situacao: "Todos os 18 campos vazios, sem origem e não verificados",
    localizado: true,
    evidencia: "piloto_conferencia: valor nulo, origem nula, verificado=false em 18/18",
  },
  {
    item: "Bloqueios / gates",
    situacao:
      "6 bloqueios críticos abertos: contrato assinado, condição financeira, partes qualificadas, consentimento, dossiê mínimo, autorização de pesquisa externa",
    localizado: true,
    evidencia: "piloto_bloqueios (criticidade=critico, status=aberto)",
  },
  {
    item: "Tarefas",
    situacao: "Não localizado — as 2 tarefas existentes são do caso DEMO",
    localizado: false,
    evidencia: "tarefas.caso_id aponta apenas para CA-DEMO-IT-2026-001",
  },
  {
    item: "Pesquisa (research_case)",
    situacao: "Não localizado — o único research_case é DEMO",
    localizado: false,
    evidencia: "research_cases: 1 linha com demo=true",
  },
  {
    item: "Portal do cliente",
    situacao: "Não localizado acesso para este caso — 1 acesso de portal existente é do ambiente de demonstração",
    localizado: false,
    evidencia: "client_portal_case_access: 1 vínculo, não referente ao piloto",
  },
  {
    item: "Consentimento",
    situacao: "Não localizado — nenhum consentimento registrado no sistema",
    localizado: false,
    evidencia: "consent_records: 0 linhas",
  },
];

// -------------------------------------------------------------- Listas

export const DUPLICIDADES = [
  "casos (5 linhas, protótipo) × crm_casos (2 linhas, canônico) — dois modelos de caso convivendo",
  "evidencias (3) × research_evidence_items (4) — dois modelos de evidência com rotas próprias (/evidencias e /pesquisa-modulo)",
  "sla_regras (protótipo) × ops_sla_regras (12 regras ativas)",
  "microentregas (6, protótipo) × ops_microentregas (0, operacional)",
  "/pesquisa e /pesquisa-modulo — dois pontos de entrada no menu para o mesmo domínio",
  "integrations: 7 categorias repetidas em 2 organizações DEMO (14 linhas para 7 conectores)",
  "Escopo do serviço replicado em proposals.escopo, contracts.scope_summary, contract_scope_items e piloto_conferencia.escopo_aprovado",
];

export const ORFAOS = [
  "contract_case_parameters / contract_parameter_values / contract_parameter_previews — motor pronto, 0 linhas",
  "planner_tarefas (63) e microentregas (6) — ligadas à tabela 'casos', sem consumidor no app interno",
  "touchpoints e sla_regras — remanescentes do protótipo",
  "consent_records (0) — bloqueio de consentimento do piloto depende desta tabela",
  "decisions (0) — governança sem decisões formais registradas",
  "leads (0) e client_contacts (0) — funil comercial sem dados",
  "service_orders — rota ativa, sem ordens vinculadas ao piloto",
];

export const FLUXOS_QUEBRADOS = [
  "Proposta → Caso: proposals.case_id nulo nas 2 propostas; o aceite comercial da Ana não tem proposta rastreável.",
  "Caso → Contrato: nenhum contrato aponta para crm_casos; os 4 existentes são DEMO com case_id nulo.",
  "Contrato → Template: template_id nulo; MODELO ESTUDO e BASE-GEN-V2 estão ativos mas não consumidos.",
  "Registro mestre → Contrato/Financeiro/Assinatura: cadeia inteira sem dados de entrada.",
  "Conferência do piloto → Origem: 18 campos sem origem, o que mantém o gate de dossiê mínimo fechado.",
  "Planejador → Caso: planner_tarefas e microentregas referenciam o modelo antigo de caso.",
  "CRM externo / WhatsApp / calls / transcrição: integrações desligadas, sem tabela de destino para transcrições.",
  "Portal → Piloto: caso real sem acesso de portal e sem documentos liberados (comportamento esperado enquanto NO_GO).",
];

export interface AcaoPlano {
  prioridade: "P0" | "P1" | "P2" | "P3";
  acao: string;
  motivo: string;
  requerAprovacao: boolean;
}

export const PLANO: AcaoPlano[] = [
  {
    prioridade: "P0",
    acao: "Criar o registro mestre de parâmetros do caso CA-2026-ANA-001 a partir de fontes reais aprovadas",
    motivo: "Sem contract_case_parameters não há contrato, assinatura nem financeiro para o piloto",
    requerAprovacao: true,
  },
  {
    prioridade: "P0",
    acao: "Vincular a proposta aprovada da Ana ao case_id (preencher proposals.case_id com a proposta real)",
    motivo: "O aceite de 14/08/2026 está registrado no caso, mas sem documento comercial rastreável",
    requerAprovacao: true,
  },
  {
    prioridade: "P0",
    acao: "Registrar origem e verificação nos 18 campos de piloto_conferencia",
    motivo: "Gate 'dossie_minimo_conferido' permanece fechado enquanto origem for nula",
    requerAprovacao: true,
  },
  {
    prioridade: "P0",
    acao: "Registrar consentimento do titular em consent_records",
    motivo: "Bloqueio crítico 'consentimento_registrado' e liberação de documentos dependem disso",
    requerAprovacao: true,
  },
  {
    prioridade: "P0",
    acao: "Gerar o contrato do piloto apontando para MODELO ESTUDO ou BASE-GEN-V2 com case_id preenchido",
    motivo: "Nenhum contrato real existe; assinatura e cobrança estão travadas por desenho",
    requerAprovacao: true,
  },
  {
    prioridade: "P1",
    acao: "Decidir o destino da tabela 'casos' e das tabelas do protótipo (planner_tarefas, microentregas, touchpoints, sla_regras)",
    motivo: "Duplicidade de modelo de caso confunde relatórios e planejador",
    requerAprovacao: true,
  },
  {
    prioridade: "P1",
    acao: "Unificar a entrada de evidências (/evidencias × /pesquisa-modulo) sem apagar dados",
    motivo: "Dois modelos ativos para o mesmo domínio",
    requerAprovacao: true,
  },
  {
    prioridade: "P1",
    acao: "Reconectar leads e contatos ao funil comercial real",
    motivo: "CRM vivo hoje não tem dado de entrada",
    requerAprovacao: true,
  },
  {
    prioridade: "P2",
    acao: "Especificar e localizar o Planejador SKU × país × etapas",
    motivo: "Não existe catálogo de produto/etapas no schema; checklists dependem disso",
    requerAprovacao: true,
  },
  {
    prioridade: "P2",
    acao: "Definir destino de transcrições, chamadas e materiais de descoberta",
    motivo: "Origem 'transcricao' é aceita nos guards, mas não há tabela ou bucket específico",
    requerAprovacao: true,
  },
  {
    prioridade: "P2",
    acao: "Ligar Desk/SLA e painéis a dados operacionais reais após o GO do piloto",
    motivo: "12 regras de SLA sem microentregas operacionais",
    requerAprovacao: true,
  },
  {
    prioridade: "P3",
    acao: "Higienizar as 2 organizações DEMO e as 14 linhas de integração duplicadas",
    motivo: "Ruído em relatórios e no centro de integrações; nenhuma exclusão física é permitida (apenas arquivamento)",
    requerAprovacao: true,
  },
  {
    prioridade: "P3",
    acao: "Popular decisions e knowledge_items com as decisões já tomadas",
    motivo: "Governança sem registro formal de decisão",
    requerAprovacao: true,
  },
];
