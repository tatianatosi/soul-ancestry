/**
 * Fontes concorrentes da Pesquisa — responsabilidade de cada tabela
 * (24/09/2026, fase 1 da consolidação pedida pela Proprietária).
 *
 * Não funde nada à força nem apaga dado. Para cada conceito diz qual tabela
 * é a fonte de escrita, quais são camadas com papel próprio e quais são
 * legado — legado não recebe registro novo (só edição e arquivamento do
 * que já existe) e tem ponte explícita, com prévia, para a canônica.
 *
 * Base factual (banco conectado, 24/09/2026):
 * - `genealogical_relationships` e `genealogical_events` referenciam
 *   `research_people` e `research_evidence_items` — são a camada
 *   genealógica consolidada (G-02), editada em /pessoas-linhagens/$caseId.
 *   Decisão anterior da Proprietária (04/09, migration 20260904190000) já
 *   tinha feito de `genealogical_relationships` a relação canônica; os dados
 *   antigos nunca tinham sido copiados.
 * - `research_evidence_items` é a evidência com dado real (inclusive da
 *   Ana) e o alvo das FKs da camada genealógica.
 * - `evidencias`, `research_events` pertencem ao dossiê antigo
 *   (/pesquisa/$id, pessoa = case_members) e só têm dado do caso DEMO.
 * - `evidences` (cadeia de custódia, 0 linhas) depende de decisão.
 */

export type PapelFonte = "canonica" | "camada_propria" | "legado" | "decisao_pendente";

export type FontePesquisa = {
  tabela: string;
  papel: PapelFonte;
  /** O que esta tabela representa — nunca o mesmo que outra do mesmo conceito. */
  representa: string;
  /** Writer permitido para registro novo (null = nenhum; legado não cria). */
  escritaNova: string | null;
  /** Onde o time edita/cria hoje. */
  casa: string;
  /** Para legado: para onde vai e como. */
  ponte?: string;
};

export type ConceitoPesquisa = "evidencia" | "relacao" | "evento";

export const FONTES_PESQUISA: Record<ConceitoPesquisa, FontePesquisa[]> = {
  evidencia: [
    {
      tabela: "research_evidence_items",
      papel: "canonica",
      representa: "Evidência de pesquisa do caso (documento, registro, nota) com status e confiança.",
      escritaNova: "src/lib/pesquisa-modulo.functions.ts#salvarBlocoPesquisa",
      casa: "/pesquisa-modulo/$id (bloco Evidências)",
    },
    {
      tabela: "evidences",
      papel: "decisao_pendente",
      representa: "Cadeia de custódia e revisão (workflow_status, revisão jurídica, busca negativa).",
      escritaNova: "src/lib/biblioteca-evidencias.functions.ts",
      casa: "/biblioteca-evidencias/$caseId",
      ponte: "Sem dado hoje. Decidir: extensão 1:1 de research_evidence_items ou absorção.",
    },
    {
      tabela: "evidencias",
      papel: "legado",
      representa: "Evidência do dossiê antigo (pessoa = case_members). Só dado do caso DEMO.",
      escritaNova: null,
      casa: "/pesquisa/$id e /evidencias (edição e arquivamento do que existe)",
      ponte: "Sem registro real a migrar; congelado para criação.",
    },
  ],
  relacao: [
    {
      tabela: "genealogical_relationships",
      papel: "canonica",
      representa: "Relação genealógica entre pessoas pesquisadas, com status de pesquisa e visibilidade.",
      escritaNova: "src/lib/pessoas-linhagens.functions.ts#salvarRegistroG02",
      casa: "/pessoas-linhagens/$caseId (aba Relações)",
    },
    {
      tabela: "case_members.pai_id/mae_id",
      papel: "camada_propria",
      representa: "Parentesco administrativo do caso (quem é pai/mãe de quem no processo), não fato genealógico.",
      escritaNova: "src/lib/caso-canonico.functions.ts",
      casa: "Caso 360 → Pessoa e família; Pessoa 360 → Relações",
    },
    {
      tabela: "research_relationships",
      papel: "legado",
      representa: "Relação do módulo de pesquisa antigo (antes da camada genealógica).",
      escritaNova: null,
      casa: "/pesquisa-modulo/$id (edição e arquivamento do que existe)",
      ponte: "Copiada para genealogical_relationships pela ponte com prévia (/governanca/migracao-onboarding-gate).",
    },
  ],
  evento: [
    {
      tabela: "genealogical_events",
      papel: "canonica",
      representa: "Evento genealógico (nascimento, casamento, migração…) de pessoa pesquisada — linha do tempo genealógica.",
      escritaNova: "src/lib/pessoas-linhagens.functions.ts#salvarRegistroG02",
      casa: "/pessoas-linhagens/$caseId (aba Eventos)",
    },
    {
      tabela: "case_timeline_events",
      papel: "camada_propria",
      representa: "Linha do tempo operacional do caso (o que a equipe fez), nunca fato genealógico.",
      escritaNova: "src/lib/timeline-operacional.server.ts#registrarTimelineCaso",
      casa: "Caso 360 → Linha do tempo do caso",
    },
    {
      tabela: "research_case_events",
      papel: "legado",
      representa: "Evento do módulo de pesquisa antigo.",
      escritaNova: null,
      casa: "/pesquisa-modulo/$id (edição e arquivamento do que existe)",
      ponte: "Copiado para genealogical_events pela ponte com prévia; evento sem pessoa fica pendente.",
    },
    {
      tabela: "research_events",
      papel: "legado",
      representa: "Evento do dossiê antigo (pessoa = case_members). Só dado do caso DEMO.",
      escritaNova: null,
      casa: "/pesquisa/$id (edição e arquivamento do que existe)",
      ponte: "Sem registro real a migrar; congelado para criação.",
    },
  ],
};

/** Mensagem para quem tenta criar registro novo em tabela legada. */
export function mensagemLegadoSemCriacao(conceito: ConceitoPesquisa): string {
  const canonica = FONTES_PESQUISA[conceito].find((f) => f.papel === "canonica")!;
  return `Esta lista é legado: aqui só se edita ou arquiva o que já existe. Registre ${
    conceito === "evidencia" ? "a evidência nova" : conceito === "relacao" ? "a relação nova" : "o evento novo"
  } em ${canonica.casa}.`;
}

/* ------------------------------------------------------------ ponte */

/** Marca de origem gravada no texto interno da cópia — torna a ponte idempotente. */
export function marcadorOrigem(tabela: string, id: string): string {
  return `[origem ${tabela}:${id}]`;
}

/** Ids de origem já copiados, lidos das marcas nos textos internos. */
export function idsJaCopiados(textos: (string | null | undefined)[], tabela: string): Set<string> {
  const saida = new Set<string>();
  const padrao = new RegExp(`\\[origem ${tabela}:([0-9a-f-]{36})\\]`, "gi");
  for (const t of textos) {
    for (const m of String(t ?? "").matchAll(padrao)) saida.add(m[1]!.toLowerCase());
  }
  return saida;
}

const TIPO_RELACAO: Record<string, string> = {
  parent: "pai_mae",
  child: "filho",
  spouse: "conjuge",
  sibling: "irmao",
  guardian: "tutor_representante",
};

/**
 * status da relação de pesquisa → status_pesquisa da camada genealógica.
 * Conservador: sem evidência vinculada (a tabela antiga não tem o campo),
 * nada chega a "com_suporte"/"confirmado" — o banco recusaria, e com razão.
 */
const STATUS_PESQUISA_RELACAO: Record<string, string> = {
  asserted: "hipotese",
  under_review: "pendente",
  supported: "provavel",
  validated: "provavel",
  conflicting: "a_confirmar",
  rejected: "refutado",
};

export type RelacaoPesquisa = {
  id: string;
  person_a_id: string;
  person_b_id: string;
  relationship_type: string;
  directionality?: string | null;
  status?: string | null;
  confidence_level?: string | null;
  supporting_evidence_count?: number | null;
  notes_internal?: string | null;
};

export function relacaoDePesquisaParaGenealogica(r: RelacaoPesquisa, caseId: string): Record<string, unknown> {
  const tipo = TIPO_RELACAO[r.relationship_type] ?? "a_confirmar";
  const tipoOriginal = tipo === "a_confirmar" ? ` Tipo original: ${r.relationship_type}.` : "";
  return {
    case_id: caseId,
    person_from_id: r.person_a_id,
    person_to_id: r.person_b_id,
    relation_type: tipo,
    directionality: r.directionality ?? "unknown",
    status: r.status ?? "asserted",
    status_pesquisa: STATUS_PESQUISA_RELACAO[r.status ?? "asserted"] ?? "a_confirmar",
    confidence_level: r.confidence_level ?? "low",
    supporting_evidence_count: r.supporting_evidence_count ?? 0,
    client_visibility: "interna",
    internal_notes: `${(r.notes_internal ?? "").trim()}${tipoOriginal} ${marcadorOrigem("research_relationships", r.id)}`.trim(),
  };
}

const TIPO_EVENTO: Record<string, string> = {
  birth: "nascimento",
  baptism: "batismo",
  marriage: "casamento",
  death: "morte",
  burial: "sepultamento",
  migration: "migracao",
  military_service: "servico_militar",
  residence: "residencia",
};

const PRECISAO: Record<string, string> = {
  exact: "exata",
  month_year: "aproximada",
  year: "aproximada",
  estimated: "estimada",
  unknown: "desconhecida",
};

/** Sem evidência vinculada, nenhum evento chega a "confirmado" (o banco exige). */
const VALIDACAO_EVENTO: Record<string, string> = {
  asserted: "pendente",
  under_review: "em_revisao",
  supported: "em_revisao",
  validated: "em_revisao",
  conflicting: "em_revisao",
  rejected: "descartado",
};

export type EventoModulo = {
  id: string;
  person_id?: string | null;
  event_type: string;
  event_date?: string | null;
  event_date_precision?: string | null;
  location_text?: string | null;
  country_context?: string | null;
  status?: string | null;
  notes_internal?: string | null;
};

/** null quando não dá para copiar (evento sem pessoa: a camada genealógica exige). */
export function eventoDeModuloParaGenealogico(e: EventoModulo, caseId: string): Record<string, unknown> | null {
  if (!e.person_id) return null;
  const tipo = TIPO_EVENTO[e.event_type] ?? "outro";
  const tipoOriginal = tipo === "outro" && e.event_type !== "other" ? ` Tipo original: ${e.event_type}.` : "";
  const contexto = e.country_context ? ` País/contexto: ${e.country_context}.` : "";
  return {
    case_id: caseId,
    person_id: e.person_id,
    event_type: tipo,
    start_date: e.event_date ?? null,
    data_precisao: PRECISAO[e.event_date_precision ?? "unknown"] ?? "desconhecida",
    locality: e.location_text ?? null,
    validation_status: VALIDACAO_EVENTO[e.status ?? "asserted"] ?? "pendente",
    client_visibility: "interna",
    description_internal:
      `${(e.notes_internal ?? "").trim()}${tipoOriginal}${contexto} ${marcadorOrigem("research_case_events", e.id)}`.trim(),
  };
}
