/**
 * Rótulos de negócio para nomes técnicos de tabela/campo.
 * A fonte canônica (nome da tabela) permanece no mapa; a UI mostra isto.
 */

const TABELA_PARA_ROTULO: Record<string, string> = {
  genealogical_sources_catalog: "Catálogo de bases genealógicas",
  research_sources: "Fontes consultadas no caso",
  citizenship_tracks: "Trilhas de cidadania",
  legal_reference_milestones: "Marcos jurídicos do caso",
  evidences: "Cadeia de custódia de evidências",
  research_evidence_items: "Evidências do módulo de pesquisa",
  research_people: "Pessoas da pesquisa",
  genealogical_person_profiles: "Perfis genealógicos",
  name_variants: "Variantes de nome (legado)",
  research_name_variants: "Variantes de nome",
  genealogical_findings: "Achados genealógicos",
  pesquisa: "Dossiê legado de pesquisa",
  master_library_items: "Acervo da Biblioteca Mestre",
  controlled_taxonomies: "Dicionários e taxonomias",
  editorial_content_items: "Conteúdo editorial",
  client_deliverables: "Microentregas do cliente",
  research_events: "Eventos do dossiê legado",
  research_case_events: "Eventos da pesquisa",
  research_cases: "Pesquisas genealógicas",
  evidencias: "Evidências (cadastro legado)",
  crm_casos: "Casos",
  clientes: "Clientes",
  tarefas: "Tarefas",
  contracts: "Contratos",
  proposals: "Propostas",
  nucleos_familiares: "Núcleos familiares",
  nucleo_membros: "Membros do núcleo",
  case_members: "Participantes do caso",
  case_dependents: "Dependentes do caso",
  service_orders: "Ordens de serviço",
  contract_case_parameters: "Parâmetros do contrato",
  case_plans: "Planos do caso",
  case_alerts: "Alertas do caso",
  onboarding_planos: "Planos de onboarding",
  document_requests: "Pedidos de documento",
  ops_microentregas: "Microentregas internas",
  app_projections: "Projeções do App Cliente",
  product_catalog: "Catálogo de produtos",
  planner_catalog_feed: "Alimentação do planejador",
  planner_tarefas: "Tarefas do planejador",
  invoices: "Faturas",
  payments: "Pagamentos",
  leads: "Leads",
  communication_queue: "Fila de comunicação",
};

const TOKEN = /[a-z][a-z0-9_]{2,}/g;

export function rotuloTabela(nome: string): string {
  const chave = nome.trim();
  return TABELA_PARA_ROTULO[chave] ?? chave.replaceAll("_", " ");
}

/** Converte a coluna `fonte` do Centro de Inteligência em rótulo humano, sem apagar o técnico. */
export function rotuloFonteNegocio(fonte: string): string {
  return fonte
    .split("·")
    .map((trecho) => {
      const limpo = trecho.trim();
      const entreParenteses = limpo.match(/^([a-z][a-z0-9_]*)\s*\((.+)\)$/);
      if (entreParenteses) {
        return `${rotuloTabela(entreParenteses[1]!)} (${entreParenteses[2]})`;
      }
      const soTabela = limpo.match(/^[a-z][a-z0-9_]*$/);
      if (soTabela) return rotuloTabela(limpo);
      return limpo.replace(TOKEN, (t) => (TABELA_PARA_ROTULO[t] ? rotuloTabela(t) : t));
    })
    .join(" · ");
}

const LINHA_TECNICA =
  /^(restaurado em|check constraint|workflow_status|organization_id|n[eê]nhuma_linha_afetada|campo_nao_mapeado)/i;

/** Separa decisão humana de log técnico colado no mesmo campo. */
export function separarNotaTecnica(texto: string | null | undefined): { humana: string; tecnica: string } {
  const bruto = (texto ?? "").replace(/\r\n/g, "\n").trim();
  if (!bruto) return { humana: "", tecnica: "" };
  const humanas: string[] = [];
  const tecnicas: string[] = [];
  for (const linha of bruto.split("\n")) {
    const t = linha.trim();
    if (!t) continue;
    const pareceLog =
      LINHA_TECNICA.test(t) ||
      /\bCA\d{2}-/.test(t) ||
      /\d{4}-\d{2}-\d{2}T\d{2}:/.test(t) ||
      /_[a-z0-9]+_[a-z0-9]+/.test(t) && /check|constraint|status|uuid/i.test(t);
    if (pareceLog) tecnicas.push(t);
    else humanas.push(t);
  }
  if (humanas.length === 0 && tecnicas.length === 0) return { humana: bruto, tecnica: "" };
  return { humana: humanas.join("\n"), tecnica: tecnicas.join("\n") };
}

export function filtrarPorBusca<T extends Record<string, unknown>>(
  linhas: T[],
  busca: string,
  chaves: string[],
): T[] {
  const q = busca.trim().toLowerCase();
  if (!q) return linhas;
  return linhas.filter((l) =>
    chaves.some((k) =>
      String(l[k] ?? "")
        .toLowerCase()
        .includes(q),
    ),
  );
}

/** Situação de evidência do módulo vivo → vocabulário da cadeia de custódia (UI). */
export const EVIDENCIA_MODULO_PARA_CADEIA: Record<string, string> = {
  collected: "recebida",
  under_review: "em_revisao",
  validated: "validada_internamente",
  inconclusive: "insuficiente",
  discarded: "rejeitada_ou_inaplicavel",
  archived: "rejeitada_ou_inaplicavel",
};

export function workflowStatusDeEvidenciaModulo(evidenceStatus: string | null | undefined): string {
  const bruto = String(evidenceStatus ?? "");
  return EVIDENCIA_MODULO_PARA_CADEIA[bruto] ?? bruto;
}

const PENDENCIA_ENCERRADA = new Set(["resolvido", "resolved", "not_applicable", "archived", "completed"]);

export function pendenciaPesquisaAberta(status: string | null | undefined): boolean {
  return !PENDENCIA_ENCERRADA.has(String(status ?? ""));
}
