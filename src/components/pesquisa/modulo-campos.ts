import type { BlocoRg } from "@/lib/pesquisa-modulo.server";

export type Campo = {
  nome: string;
  rotulo: string;
  tipo?: "texto" | "area" | "data" | "select" | "bool" | "ref";
  opcoes?: [string, string][];
  ref?: "pessoas" | "relacoes" | "eventos" | "fontes" | "evidencias" | "documentos";
  ajuda?: string;
};

/**
 * 28/08/2026 — a Proprietária não conseguia salvar nada na Pesquisa:
 * "check constraint research_people_identity_status_check". Causa: as
 * opções de quase todo campo `select` deste arquivo eram um vocabulário
 * inventado, nunca cotejado contra as constraints reais das tabelas
 * `research_*` (supabase/migrations/20260816231149_...sql). Todo valor
 * abaixo foi conferido linha a linha contra o `check (...)` de cada coluna
 * — nenhum foi inventado.
 */
export const PRECISAO: [string, string][] = [
  ["exact", "Data exata"],
  ["month_year", "Mês e ano"],
  ["year", "Só o ano"],
  ["estimated", "Estimada"],
  ["unknown", "Desconhecida"],
];

export const CONFIANCA: [string, string][] = [
  ["low", "Baixa"],
  ["medium", "Média"],
  ["high", "Alta"],
];

export const SENSIBILIDADE: [string, string][] = [
  ["standard", "Padrão"],
  ["restricted", "Restrita"],
  ["highly_restricted", "Altamente restrita"],
];

/** Situação de asserção — mesmo vocabulário nas 3 tabelas que o usam (relações, eventos e, com variação, nomes). */
const SITUACAO_ASSERCAO: [string, string][] = [
  ["asserted", "Afirmada"],
  ["under_review", "Em revisão"],
  ["supported", "Sustentada por evidência"],
  ["validated", "Validada"],
  ["conflicting", "Conflitante"],
  ["rejected", "Rejeitada"],
];

export const CAMPOS: Record<BlocoRg, Campo[]> = {
  pessoas: [
    { nome: "canonical_name", rotulo: "Nome canônico" },
    { nome: "preferred_display_name", rotulo: "Nome de exibição" },
    {
      nome: "person_status",
      rotulo: "Situação da pessoa",
      tipo: "select",
      opcoes: [
        ["subject", "Requerente"],
        ["family_member", "Membro da família"],
        ["ancestor", "Ascendente"],
        ["descendant", "Descendente"],
        ["related_person", "Pessoa relacionada"],
        ["unknown_person", "Pessoa não identificada"],
      ],
    },
    {
      nome: "living_status",
      rotulo: "Situação vital",
      tipo: "select",
      opcoes: [
        ["unknown", "Desconhecida"],
        ["living", "Viva"],
        ["deceased", "Falecida"],
      ],
      ajuda: "Pessoas vivas e menores recebem tratamento restrito automaticamente.",
    },
    { nome: "is_minor", rotulo: "Menor de idade", tipo: "bool" },
    { nome: "birth_date", rotulo: "Nascimento", tipo: "data" },
    { nome: "birth_date_precision", rotulo: "Precisão do nascimento", tipo: "select", opcoes: PRECISAO },
    { nome: "birth_place", rotulo: "Local de nascimento" },
    { nome: "death_date", rotulo: "Óbito", tipo: "data" },
    { nome: "death_date_precision", rotulo: "Precisão do óbito", tipo: "select", opcoes: PRECISAO },
    { nome: "death_place", rotulo: "Local de óbito" },
    { nome: "gender_or_descriptor", rotulo: "Descritor" },
    { nome: "nationality_context", rotulo: "Contexto de nacionalidade" },
    {
      nome: "identity_status",
      rotulo: "Identificação",
      tipo: "select",
      opcoes: [
        ["unreviewed", "Não revisada"],
        ["tentative", "Provisória"],
        ["reviewed", "Revisada"],
        ["confirmed", "Confirmada"],
        ["conflicting", "Conflitante"],
      ],
    },
    { nome: "sensitivity_level", rotulo: "Sensibilidade", tipo: "select", opcoes: SENSIBILIDADE },
    { nome: "notes_internal", rotulo: "Notas internas", tipo: "area" },
  ],
  variantes: [
    { nome: "person_id", rotulo: "Pessoa", tipo: "ref", ref: "pessoas" },
    { nome: "variant_name", rotulo: "Variação de nome" },
    {
      nome: "variant_type",
      rotulo: "Tipo",
      tipo: "select",
      opcoes: [
        ["spelling", "Grafia"],
        ["transliteration", "Transliteração"],
        ["married_name", "Nome de casada(o)"],
        ["record_error", "Erro de registro"],
        ["abbreviation", "Abreviação"],
        ["alternate_language", "Idioma alternativo"],
        ["other", "Outro"],
      ],
    },
    {
      nome: "status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: [
        ["unreviewed", "Não revisada"],
        ["plausible", "Plausível"],
        ["validated", "Validada"],
        ["rejected", "Rejeitada"],
      ],
    },
    { nome: "notes", rotulo: "Notas", tipo: "area" },
  ],
  relacoes: [
    { nome: "person_a_id", rotulo: "Pessoa A", tipo: "ref", ref: "pessoas" },
    { nome: "person_b_id", rotulo: "Pessoa B", tipo: "ref", ref: "pessoas" },
    {
      nome: "relationship_type",
      rotulo: "Tipo de relação",
      tipo: "select",
      opcoes: [
        ["parent", "Genitor(a)"],
        ["child", "Filho(a)"],
        ["spouse", "Cônjuge"],
        ["sibling", "Irmão(ã)"],
        ["grandparent", "Avô/avó"],
        ["grandchild", "Neto(a)"],
        ["guardian", "Tutor(a)"],
        ["adopter", "Adotante"],
        ["adopted_child", "Filho(a) adotivo(a)"],
        ["other", "Outro"],
        ["unknown", "Desconhecido"],
      ],
    },
    {
      nome: "status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: SITUACAO_ASSERCAO,
      ajuda: "Validar exige evidência validada vinculada à relação.",
    },
    { nome: "confidence_level", rotulo: "Confiança", tipo: "select", opcoes: CONFIANCA },
    { nome: "notes_internal", rotulo: "Notas internas", tipo: "area" },
  ],
  eventos: [
    { nome: "person_id", rotulo: "Pessoa", tipo: "ref", ref: "pessoas" },
    {
      nome: "event_type",
      rotulo: "Tipo de evento",
      tipo: "select",
      opcoes: [
        ["birth", "Nascimento"],
        ["baptism", "Batismo"],
        ["marriage", "Casamento"],
        ["divorce", "Divórcio"],
        ["death", "Óbito"],
        ["burial", "Sepultamento"],
        ["migration", "Migração"],
        ["naturalization", "Naturalização"],
        ["military_service", "Serviço militar"],
        ["residence", "Residência"],
        ["name_change", "Mudança de nome"],
        ["document_issue", "Emissão de documento"],
        ["other", "Outro"],
      ],
    },
    { nome: "event_date", rotulo: "Data", tipo: "data" },
    { nome: "event_date_precision", rotulo: "Precisão", tipo: "select", opcoes: PRECISAO },
    { nome: "location_text", rotulo: "Local" },
    { nome: "country_context", rotulo: "País" },
    { nome: "status", rotulo: "Situação", tipo: "select", opcoes: SITUACAO_ASSERCAO },
    { nome: "confidence_level", rotulo: "Confiança", tipo: "select", opcoes: CONFIANCA },
    { nome: "notes_internal", rotulo: "Notas internas", tipo: "area" },
  ],
  fontes: [
    { nome: "title", rotulo: "Título da fonte" },
    {
      nome: "source_type",
      rotulo: "Tipo",
      tipo: "select",
      opcoes: [
        ["family_document", "Documento de família"],
        ["civil_record", "Registro civil"],
        ["religious_record", "Registro religioso"],
        ["archive_catalog", "Catálogo de arquivo"],
        ["public_archive", "Arquivo público"],
        ["familysearch_reference", "Referência FamilySearch"],
        ["official_registry", "Registro oficial"],
        ["interview", "Entrevista"],
        ["client_provided", "Fornecida pelo cliente"],
        ["internal_note", "Nota interna"],
        ["other", "Outro"],
      ],
    },
    { nome: "repository_or_institution", rotulo: "Instituição / repositório" },
    { nome: "citation_text", rotulo: "Citação completa", tipo: "area" },
    { nome: "url", rotulo: "URL" },
    { nome: "access_date", rotulo: "Data de acesso", tipo: "data" },
    { nome: "publication_or_record_date", rotulo: "Data do registro", tipo: "data" },
    {
      nome: "source_status",
      rotulo: "Situação da fonte",
      tipo: "select",
      opcoes: [
        ["referenced", "Referenciada"],
        ["located", "Localizada"],
        ["reviewed", "Revisada"],
        ["verified", "Verificada"],
        ["inaccessible", "Inacessível"],
        ["rejected", "Rejeitada"],
      ],
    },
    {
      nome: "access_level",
      rotulo: "Acesso",
      tipo: "select",
      opcoes: [
        ["internal_restricted", "Interno restrito"],
        ["case_team", "Equipe do caso"],
        ["client_provided_restricted", "Fornecida pelo cliente (restrito)"],
      ],
    },
    { nome: "external_source", rotulo: "Fonte externa", tipo: "bool" },
    { nome: "notes_internal", rotulo: "Notas internas", tipo: "area" },
  ],
  evidencias: [
    { nome: "title", rotulo: "Título" },
    {
      nome: "evidence_type",
      rotulo: "Tipo de evidência",
      tipo: "select",
      opcoes: [
        ["document", "Documento"],
        ["record_excerpt", "Trecho de registro"],
        ["photo", "Fotografia"],
        ["oral_history", "História oral"],
        ["registry_entry", "Lançamento de registro"],
        ["archive_reference", "Referência de arquivo"],
        ["timeline_item", "Item de linha do tempo"],
        ["correspondence", "Correspondência"],
        ["structured_note", "Nota estruturada"],
        ["other", "Outro"],
      ],
    },
    { nome: "description", rotulo: "Descrição", tipo: "area" },
    { nome: "source_id", rotulo: "Fonte", tipo: "ref", ref: "fontes" },
    { nome: "person_id", rotulo: "Pessoa relacionada", tipo: "ref", ref: "pessoas" },
    { nome: "relationship_id", rotulo: "Relação relacionada", tipo: "ref", ref: "relacoes" },
    { nome: "event_id", rotulo: "Evento relacionado", tipo: "ref", ref: "eventos" },
    { nome: "external_reference", rotulo: "Referência externa" },
    { nome: "origem_externa", rotulo: "Obtida em pesquisa externa", tipo: "bool" },
    { nome: "fornecida_pelo_cliente", rotulo: "Fornecida pelo cliente", tipo: "bool" },
    {
      nome: "evidence_status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: [
        ["collected", "Coletada"],
        ["under_review", "Em revisão"],
        ["validated", "Validada"],
        ["inconclusive", "Inconclusiva"],
        ["discarded", "Descartada"],
        ["archived", "Arquivada"],
      ],
      ajuda: "Validar exige fonte vinculada e justificativa; a revisão é sempre humana.",
    },
    { nome: "confidence_level", rotulo: "Confiança", tipo: "select", opcoes: CONFIANCA },
    { nome: "validation_rationale", rotulo: "Justificativa da validação", tipo: "area" },
    { nome: "discard_reason", rotulo: "Motivo de rejeição/descarte", tipo: "area" },
    { nome: "sensitivity_level", rotulo: "Sensibilidade", tipo: "select", opcoes: SENSIBILIDADE },
  ],
  vinculos: [],
  hipoteses: [
    { nome: "title", rotulo: "Título da hipótese" },
    { nome: "statement", rotulo: "Enunciado", tipo: "area" },
    {
      nome: "category",
      rotulo: "Categoria",
      tipo: "select",
      opcoes: [
        ["identity", "Identidade"],
        ["parentage", "Filiação"],
        ["lineage", "Linha familiar"],
        ["location", "Localização"],
        ["date", "Data"],
        ["document_gap", "Lacuna documental"],
        ["legal_context_internal", "Contexto jurídico (interno)"],
        ["other", "Outra"],
      ],
    },
    {
      nome: "status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: [
        ["open", "Aberta"],
        ["under_review", "Em revisão"],
        ["supported", "Sustentada por evidências"],
        ["not_supported", "Não sustentada"],
        ["inconclusive", "Inconclusiva"],
        ["closed", "Encerrada"],
      ],
      ajuda: "Hipótese nunca é conclusão jurídica.",
    },
    { nome: "confidence_level", rotulo: "Confiança", tipo: "select", opcoes: CONFIANCA },
    { nome: "related_person_id", rotulo: "Pessoa", tipo: "ref", ref: "pessoas" },
    { nome: "closure_reason", rotulo: "Motivo de encerramento", tipo: "area" },
  ],
  pedidos: [
    { nome: "person_id", rotulo: "Pessoa", tipo: "ref", ref: "pessoas" },
    {
      nome: "request_type",
      rotulo: "Tipo de pedido",
      tipo: "select",
      opcoes: [
        ["client_document", "Documento do cliente"],
        ["internal_review", "Revisão interna"],
        ["future_external_request", "Pedido externo futuro"],
        ["archive_request", "Pedido de arquivo"],
        ["registry_request", "Pedido de registro"],
        ["translation", "Tradução"],
        ["apostille", "Apostilamento"],
        ["other", "Outro"],
      ],
    },
    { nome: "requested_document_type", rotulo: "Documento solicitado" },
    { nome: "target_institution", rotulo: "Instituição" },
    { nome: "target_location", rotulo: "Localidade" },
    {
      nome: "status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: [
        ["draft", "Rascunho"],
        ["requested_from_client", "Solicitado ao cliente"],
        ["received", "Recebido"],
        ["under_review", "Em revisão"],
        ["completed", "Concluído"],
        ["blocked_by_gate", "Bloqueado por trava"],
        ["cancelled", "Cancelado"],
        ["archived", "Arquivado"],
      ],
    },
    {
      nome: "external_action_required",
      rotulo: "Exige ação externa",
      tipo: "bool",
      ajuda: "Pedidos externos só saem do estado planejado com as travas liberadas.",
    },
    { nome: "due_at", rotulo: "Prazo", tipo: "data" },
    { nome: "client_visible", rotulo: "Pode aparecer ao cliente", tipo: "bool" },
    { nome: "notes_internal", rotulo: "Notas internas", tipo: "area" },
  ],
  pendencias: [
    { nome: "title", rotulo: "Título" },
    { nome: "description", rotulo: "Descrição", tipo: "area" },
    {
      nome: "category",
      rotulo: "Categoria",
      tipo: "select",
      opcoes: [
        ["identity", "Identidade"],
        ["relationship", "Relação"],
        ["event", "Evento"],
        ["source", "Fonte"],
        ["document", "Documento"],
        ["conflict", "Conflito"],
        ["authorization", "Autorização"],
        ["external_gate", "Trava externa"],
        ["review", "Revisão"],
        ["other", "Outra"],
      ],
    },
    {
      nome: "severity",
      rotulo: "Severidade",
      tipo: "select",
      opcoes: [
        ["low", "Baixa"],
        ["medium", "Média"],
        ["high", "Alta"],
        ["critical", "Crítica"],
      ],
    },
    {
      nome: "status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: [
        ["open", "Aberta"],
        ["in_progress", "Em andamento"],
        ["blocked", "Bloqueada"],
        ["resolved", "Resolvida"],
        ["not_applicable", "Não aplicável"],
        ["archived", "Arquivada"],
      ],
    },
    { nome: "blocking_reason", rotulo: "Motivo do bloqueio", tipo: "area" },
    { nome: "due_at", rotulo: "Prazo", tipo: "data" },
  ],
  relatorios: [
    { nome: "title", rotulo: "Título" },
    {
      nome: "report_type",
      rotulo: "Tipo",
      tipo: "select",
      opcoes: [
        ["internal_progress", "Progresso interno"],
        ["internal_findings", "Achados internos"],
        ["client_summary_draft", "Rascunho de resumo ao cliente"],
        ["client_summary_approved", "Resumo ao cliente aprovado"],
        ["delivery_internal", "Entrega interna"],
      ],
    },
    {
      nome: "status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: [
        ["draft", "Rascunho"],
        ["under_review", "Em revisão"],
        ["approved", "Aprovado"],
        ["released", "Liberado"],
        ["archived", "Arquivado"],
      ],
    },
    { nome: "content", rotulo: "Conteúdo (uso interno)", tipo: "area" },
  ],
  resumos: [
    { nome: "title_client_facing", rotulo: "Título para o cliente" },
    {
      nome: "summary_client_facing",
      rotulo: "Resumo para o cliente",
      tipo: "area",
      ajuda: "Somente fatos validados, sem hipótese, sem juízo de mérito e sem dado sensível.",
    },
    { nome: "validated_facts_only", rotulo: "Contém apenas fatos validados", tipo: "bool" },
    {
      nome: "status",
      rotulo: "Situação",
      tipo: "select",
      opcoes: [
        ["draft", "Rascunho"],
        ["under_review", "Em revisão"],
        ["approved_for_release", "Aprovado para liberação"],
        ["released", "Liberado ao cliente"],
        ["archived", "Arquivado"],
      ],
    },
  ],
};

export const ROTULOS: Record<string, string> = {
  // pessoas.person_status
  subject: "Requerente",
  family_member: "Membro da família",
  ancestor: "Ascendente",
  descendant: "Descendente",
  related_person: "Pessoa relacionada",
  unknown_person: "Pessoa não identificada",
  // pessoas.identity_status / variantes.status (parcial)
  unreviewed: "Não revisada",
  tentative: "Provisória",
  reviewed: "Revisada",
  confirmed: "Confirmada",
  conflicting: "Conflitante",
  // variantes.status / name_variants
  plausible: "Plausível",
  validated: "Validada",
  rejected: "Rejeitada",
  // relações / eventos — situação de asserção
  asserted: "Afirmada",
  under_review: "Em revisão",
  supported: "Sustentada",
  // fontes.source_status
  referenced: "Referenciada",
  located: "Localizada",
  verified: "Verificada",
  inaccessible: "Inacessível",
  // evidências
  collected: "Coletada",
  inconclusive: "Inconclusiva",
  discarded: "Descartada",
  archived: "Arquivada",
  // hipóteses.status
  open: "Aberta",
  not_supported: "Não sustentada",
  closed: "Encerrada",
  // pedidos.status
  draft: "Rascunho",
  requested_from_client: "Solicitado ao cliente",
  received: "Recebido",
  completed: "Concluído",
  blocked_by_gate: "Bloqueado por trava",
  cancelled: "Cancelado",
  // pendências.status
  in_progress: "Em andamento",
  blocked: "Bloqueada",
  resolved: "Resolvida",
  not_applicable: "Não aplicável",
  // relatórios/resumos.status
  approved: "Aprovado",
  approved_for_release: "Aprovado para liberação",
  released: "Liberado",
  // confiança / severidade / sensibilidade (comuns)
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
  standard: "Padrão",
  restricted: "Restrita",
  highly_restricted: "Altamente restrita",
  // vital
  living: "Viva",
  deceased: "Falecida",
  unknown: "Desconhecida",
};

export function rotulo(valor: unknown) {
  if (valor === null || valor === undefined || valor === "") return "—";
  return ROTULOS[String(valor)] ?? String(valor);
}
