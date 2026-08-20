/**
 * Matriz de conformidade — mockup aprovado (17 páginas) × implementação atual.
 * Somente leitura e somente registro: nenhum módulo aprovado pode ser alterado
 * sem uma linha correspondente nesta matriz.
 */

export const ESTADOS_CONFORMIDADE = [
  { valor: "preservado", rotulo: "Preservado", tom: "border-sage/50 bg-sage/10 text-navy" },
  { valor: "adaptado", rotulo: "Adaptado", tom: "border-gold/60 bg-gold/15 text-navy" },
  { valor: "pendente", rotulo: "Pendente", tom: "border-navy/25 bg-navy/5 text-navy" },
  { valor: "divergente", rotulo: "Divergente", tom: "border-terracotta/50 bg-terracotta/10 text-navy" },
  { valor: "oculto_por_gate", rotulo: "Oculto por gate", tom: "border-navy/30 bg-white text-navy/70" },
] as const;

export type EstadoConformidade = (typeof ESTADOS_CONFORMIDADE)[number]["valor"];

export type LinhaConformidade = {
  mockup_page: string;
  elemento_aprovado: string;
  rota_atual: string;
  entidade_fonte: string;
  estado: EstadoConformidade;
  justificativa: string;
  impacto: string;
  responsavel: string;
  revisao_humana_necessaria: boolean;
  data_ultima_revisao: string;
};

const REV = "2026-08-20";
const RESP = "Tatiana Tosi";

export const MATRIZ_CONFORMIDADE: LinhaConformidade[] = [
  /* ---------- App Cliente ---------- */
  {
    mockup_page: "01 — App Cliente / Home",
    elemento_aprovado:
      "Próximos passos, achados recentes, última entrega, pendências documentais e resumo da timeline desde o primeiro contato",
    rota_atual: "/ (App Cliente → Home)",
    entidade_fonte: "case_timeline_events, case_checklist_items, client_deliverables, research_events",
    estado: "adaptado",
    justificativa:
      "Layout aprovado mantido; leitura deixa de ser limitada à porcentagem de origem e passa a resumir a timeline desde o primeiro contato.",
    impacto: "Cliente enxerga jornada completa, não apenas completude de origem.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "02 — App Cliente / Jornada",
    elemento_aprovado: "Timeline dupla: operacional (primeiro contato → entregas) e familiar/genealógica",
    rota_atual: "/ (App Cliente → Jornada)",
    entidade_fonte: "case_timeline_events, case_services, proposals, research_events",
    estado: "adaptado",
    justificativa:
      "Fases exibidas conforme escopo da proposta e case_service; Fase 1/Fase 2 aparecem apenas quando contratadas e liberadas por timing/touchpoint.",
    impacto: "Sem upsell de Fase 2 quando a pesquisa completa já está contratada (Ana e João).",
    responsavel: RESP,
    revisao_humana_necessaria: true,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "03 — App Cliente / Radar Ancestral",
    elemento_aprovado:
      "Seis dimensões: Origem, Documentação, Conexões Familiares, Elegibilidade, Memória, Legado",
    rota_atual: "/ (App Cliente → Radar)",
    entidade_fonte: "radar-eixos + documents + research_evidence_items",
    estado: "preservado",
    justificativa:
      "Percentuais representam completude documental, organizacional e evidencial; nunca probabilidade jurídica ou garantia.",
    impacto: "Detalhe de cada dimensão sem score interno, risco interno ou hipótese jurídica.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "04 — App Cliente / Árvore Familiar",
    elemento_aprovado: "Árvore contextual individual e familiar com suporte a G5/G6 e anteriores",
    rota_atual: "/ (App Cliente → Árvore)",
    entidade_fonte: "research_people, research_relationships (sanitizados)",
    estado: "adaptado",
    justificativa:
      "Quadrante “o que ainda falta” substituído por “Panorama Genealógico”, usando apenas relações e fatos aprovados e sanitizados.",
    impacto: "Remove leitura de lacuna como juízo de mérito, mantendo o layout aprovado.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "05 — App Cliente / Documentos",
    elemento_aprovado:
      "Checklist consolidado, pendências pessoais, organização em andamento no topo, log de envio por pessoa e biblioteca histórica",
    rota_atual: "/ (App Cliente → Docs)",
    entidade_fonte: "documents, case_checklist_items, portal_document_requests",
    estado: "adaptado",
    justificativa:
      "Documentos passam a vir antes de Entregas na navegação; documentos pessoais permanecem separados do acervo ancestral.",
    impacto: "Links seguros e miniaturas autorizadas; nenhuma URL interna crua é exposta.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "06 — App Cliente / Entregas da Jornada",
    elemento_aprovado: "Relatórios F1/F2 como entregas robustas e micro-entregas aprovadas",
    rota_atual: "/ (App Cliente → Entregas da Jornada)",
    entidade_fonte: "client_deliverables, ops_microentregas, case_services",
    estado: "adaptado",
    justificativa:
      "“Entrega” renomeada para “Entregas da Jornada”. Fase 1/Fase 2 só são ocultadas quando não contratadas, não liberadas ou não aplicáveis.",
    impacto: "Conteúdo acionável entregue como card aprovado, nunca bloqueio genérico.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "07 — App Cliente / Legado",
    elemento_aprovado:
      "Descritivo de achados, push para detalhe, relatórios aprovados, encontros de linhagem, linha do tempo familiar e biblioteca histórica",
    rota_atual: "/ (App Cliente → Legado)",
    entidade_fonte: "research_reports, knowledge_items, client_deliverables",
    estado: "preservado",
    justificativa: "Conteúdo adaptado ao contrato e aos anexos vigentes do caso.",
    impacto: "Sem exposição de hipótese jurídica ou material não autorizado.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "08 — App Cliente / Minha Conta",
    elemento_aprovado:
      "Data de entrada como membro, papel no núcleo, nome comercial do plano e histórico individual",
    rota_atual: "/ (App Cliente → Conta)",
    entidade_fonte: "case_members, nucleo_membros, product_catalog (nome comercial)",
    estado: "adaptado",
    justificativa:
      "Papel exibido como pagante, participante, dependente ou responsável legal; Familiar Conectado aparece quando aplicável, até quatro membros.",
    impacto: "Nunca mostra SKU técnico, preço interno, contrato bruto ou dados de terceiros.",
    responsavel: RESP,
    revisao_humana_necessaria: true,
    data_ultima_revisao: REV,
  },

  /* ---------- Acesso familiar ---------- */
  {
    mockup_page: "09 — Acesso familiar / João e esposa",
    elemento_aprovado: "Jornada compartilhada com João como pagante e checklists individuais",
    rota_atual: "/ (App Cliente, contexto por participante)",
    entidade_fonte: "case_members, case_checklist_items",
    estado: "pendente",
    justificativa: "Projeção por participante depende de app_projections autorizadas por contrato.",
    impacto: "Pagante não pode monopolizar a experiência da jornada.",
    responsavel: RESP,
    revisao_humana_necessaria: true,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "10 — Acesso familiar / Ana, pai e irmã",
    elemento_aprovado: "Jornada familiar aprovada, cada membro com checklist e documentos próprios",
    rota_atual: "/ (App Cliente, contexto por participante)",
    entidade_fonte: "nucleos_familiares, nucleo_membros, case_dependents",
    estado: "pendente",
    justificativa:
      "Visibilidade de Felipe por Ana depende de autorização registrada de responsável legal (hoje pendente).",
    impacto: "Árvore e Legado contextualizados por participante e contrato.",
    responsavel: RESP,
    revisao_humana_necessaria: true,
    data_ultima_revisao: REV,
  },

  /* ---------- Desk original ---------- */
  {
    mockup_page: "11 — Desk / Visão Geral",
    elemento_aprovado: "Casos ativos, alertas, receita do mês e taxa de conversão",
    rota_atual: "/ (Desk Intelligence → Visão Geral)",
    entidade_fonte: "crm_casos, case_alerts, invoices, conversion_events",
    estado: "preservado",
    justificativa: "Cards mantidos como blocos acionáveis dentro da Visão Geral.",
    impacto: "Cada card abre lista filtrada e permite ação.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "12 — Desk / Funil e prioridades",
    elemento_aprovado: "Funil de leads, achados de hoje, prioridades de hoje e checklist da semana",
    rota_atual: "/ (Desk Intelligence → Visão Geral)",
    entidade_fonte: "leads, research_events, tarefas, ops_microentregas",
    estado: "preservado",
    justificativa: "Blocos permanecem na Visão Geral, sem virar abas isoladas.",
    impacto: "Gestão transversal preservada.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "13 — Desk / Validação jurídica",
    elemento_aprovado: "Bloco de validação jurídica acionável",
    rota_atual: "/ (Desk → Visão Geral) e /matriz-juridica",
    entidade_fonte: "legal_clause_matrix",
    estado: "adaptado",
    justificativa: "Card resume os 12 temas normativos e abre a matriz jurídica filtrada.",
    impacto: "Temas pendentes bloqueiam assinatura conforme gates.",
    responsavel: RESP,
    revisao_humana_necessaria: true,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "14 — Desk / Radar interno e matriz de prioridade",
    elemento_aprovado: "Radar interno, matriz de prioridade geral e radar individual por caso",
    rota_atual: "/ (Desk → Visão Geral) e /casos/:caseId",
    entidade_fonte: "crm_casos, case_alerts, ops_sla_regras",
    estado: "preservado",
    justificativa: "Layout aprovado mantido; dados passam a vir das entidades canônicas.",
    impacto: "Priorização diária sem redesenho.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "15 — Desk / Gestão de descobertas",
    elemento_aprovado: "Gestão de descobertas com curadoria e push para o cliente",
    rota_atual: "/ (Desk → Descobertas) e /pesquisa",
    entidade_fonte: "research_events, research_evidence_items, client_deliverables",
    estado: "preservado",
    justificativa: "Publicação para o cliente continua exigindo aprovação humana.",
    impacto: "Nenhuma publicação automática.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "16 — Desk / Biblioteca mestre",
    elemento_aprovado: "Biblioteca mestre e curadoria por cliente",
    rota_atual: "/biblioteca",
    entidade_fonte: "knowledge_items, documents",
    estado: "preservado",
    justificativa: "Curadoria por cliente mantida como filtro da biblioteca mestre.",
    impacto: "Acervo ancestral separado de documentos pessoais.",
    responsavel: RESP,
    revisao_humana_necessaria: false,
    data_ultima_revisao: REV,
  },
  {
    mockup_page: "17 — Taxonomia e conteúdo",
    elemento_aprovado: "Nomes comerciais e fases aprovadas em timeline, App e entregas",
    rota_atual: "Transversal (App Cliente, Desk, entregas)",
    entidade_fonte: "product_catalog, case_services, proposals, case_timeline_events",
    estado: "adaptado",
    justificativa:
      "SKU técnico nunca aparece ao cliente; Blueprint gera proposta no Desk com log de versão e o Canva é camada visual.",
    impacto:
      "WhatsApp de pacote ativo não se confunde com alerta operacional; Familiar Conectado é escopo contextual e não cria família ou dossiê automaticamente.",
    responsavel: RESP,
    revisao_humana_necessaria: true,
    data_ultima_revisao: REV,
  },
];

export function contarPorEstado(linhas: LinhaConformidade[] = MATRIZ_CONFORMIDADE) {
  const base: Record<EstadoConformidade, number> = {
    preservado: 0,
    adaptado: 0,
    pendente: 0,
    divergente: 0,
    oculto_por_gate: 0,
  };
  for (const l of linhas) base[l.estado] += 1;
  return base;
}

export function filtrarPorEstado(
  estado: EstadoConformidade | "todos",
  linhas: LinhaConformidade[] = MATRIZ_CONFORMIDADE,
) {
  return estado === "todos" ? linhas : linhas.filter((l) => l.estado === estado);
}

export function pendentesDeRevisaoHumana(linhas: LinhaConformidade[] = MATRIZ_CONFORMIDADE) {
  return linhas.filter((l) => l.revisao_humana_necessaria);
}

export function rotuloEstado(estado: EstadoConformidade) {
  return ESTADOS_CONFORMIDADE.find((e) => e.valor === estado)?.rotulo ?? estado;
}

export function tomEstado(estado: EstadoConformidade) {
  return ESTADOS_CONFORMIDADE.find((e) => e.valor === estado)?.tom ?? "border-navy/20 bg-white text-navy";
}
