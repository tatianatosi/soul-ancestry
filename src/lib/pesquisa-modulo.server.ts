/**
 * Helpers server-only do MÓDULO de Pesquisa Genealógica e Evidências.
 *
 * O banco é a autoridade final das travas (gates, validação humana, sensibilidade
 * e arquivamento). Aqui apenas filtramos campos e papéis antes de gravar.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type Sb = any;

export const PAPEIS_EDITA = ["admin", "operacoes", "pesquisador"];
export const PAPEIS_LE_DETALHE = ["admin", "operacoes", "pesquisador", "leitura"];
export const PAPEIS_LE_RESUMO = [...PAPEIS_LE_DETALHE, "comercial"];

export type BlocoRg =
  | "pessoas"
  | "variantes"
  | "relacoes"
  | "eventos"
  | "fontes"
  | "evidencias"
  | "vinculos"
  | "hipoteses"
  | "pedidos"
  | "pendencias"
  | "relatorios"
  | "resumos";

type Def = { tabela: string; chaveCaso: "research_case_id" | null; campos: string[] };

export const BLOCOS: Record<BlocoRg, Def> = {
  pessoas: {
    tabela: "research_people",
    chaveCaso: "research_case_id",
    campos: [
      "canonical_name",
      "preferred_display_name",
      "person_status",
      "living_status",
      "is_minor",
      "birth_date",
      "birth_date_precision",
      "birth_place",
      "death_date",
      "death_date_precision",
      "death_place",
      "gender_or_descriptor",
      "nationality_context",
      "notes_internal",
      "identity_status",
      "sensitivity_level",
    ],
  },
  variantes: {
    tabela: "research_name_variants",
    chaveCaso: null,
    campos: ["person_id", "variant_name", "variant_type", "status", "notes", "source_evidence_id"],
  },
  relacoes: {
    tabela: "research_relationships",
    chaveCaso: "research_case_id",
    campos: [
      "person_a_id",
      "person_b_id",
      "relationship_type",
      "directionality",
      "status",
      "confidence_level",
      "notes_internal",
    ],
  },
  eventos: {
    tabela: "research_case_events",
    chaveCaso: "research_case_id",
    campos: [
      "person_id",
      "event_type",
      "event_date",
      "event_date_precision",
      "location_text",
      "country_context",
      "status",
      "confidence_level",
      "notes_internal",
    ],
  },
  fontes: {
    tabela: "research_sources",
    chaveCaso: "research_case_id",
    campos: [
      "source_type",
      "title",
      "repository_or_institution",
      "citation_text",
      "url",
      "access_date",
      "publication_or_record_date",
      "source_status",
      "access_level",
      "external_source",
      "notes_internal",
    ],
  },
  evidencias: {
    tabela: "research_evidence_items",
    chaveCaso: "research_case_id",
    campos: [
      "evidence_type",
      "title",
      "description",
      "person_id",
      "relationship_id",
      "event_id",
      "source_id",
      "document_id",
      "external_reference",
      "origem_externa",
      "fornecida_pelo_cliente",
      "evidence_status",
      "confidence_level",
      "validation_rationale",
      "discard_reason",
      "sensitivity_level",
      "client_visibility",
    ],
  },
  vinculos: {
    tabela: "research_evidence_links",
    chaveCaso: null,
    campos: ["evidence_item_id", "entity_type", "entity_id", "link_role", "notes"],
  },
  hipoteses: {
    tabela: "research_case_hypotheses",
    chaveCaso: "research_case_id",
    campos: [
      "title",
      "statement",
      "category",
      "status",
      "confidence_level",
      "related_person_id",
      "related_relationship_id",
      "related_event_id",
      "closure_reason",
    ],
  },
  pedidos: {
    tabela: "research_document_requests",
    chaveCaso: "research_case_id",
    campos: [
      "person_id",
      "request_type",
      "requested_document_type",
      "target_institution",
      "target_location",
      "status",
      "external_action_required",
      "requested_at",
      "due_at",
      "received_at",
      "responsible_user_id",
      "client_visible",
      "notes_internal",
    ],
  },
  pendencias: {
    tabela: "research_pending_items",
    chaveCaso: "research_case_id",
    campos: [
      "title",
      "description",
      "category",
      "severity",
      "status",
      "blocking_reason",
      "responsible_user_id",
      "due_at",
      "resolution_note",
    ],
  },
  relatorios: {
    tabela: "research_reports",
    chaveCaso: "research_case_id",
    campos: ["report_type", "status", "title", "content"],
  },
  resumos: {
    tabela: "research_client_summaries",
    chaveCaso: "research_case_id",
    campos: ["title_client_facing", "summary_client_facing", "validated_facts_only", "status"],
  },
};

const BOOLEANOS = new Set([
  "is_minor",
  "external_source",
  "origem_externa",
  "fornecida_pelo_cliente",
  "external_action_required",
  "client_visible",
  "validated_facts_only",
]);

export function limparCamposRg(permitidos: string[], dados: Record<string, unknown>) {
  const saida: Record<string, unknown> = {};
  for (const chave of permitidos) {
    if (!(chave in dados)) continue;
    const bruto = dados[chave];
    if (BOOLEANOS.has(chave)) {
      saida[chave] = bruto === true || bruto === "true" || bruto === "on";
      continue;
    }
    const valor = typeof bruto === "string" ? bruto.trim() : bruto;
    saida[chave] = valor === "" || valor === undefined ? null : valor;
  }
  return saida;
}

export async function contextoRg(supabase: Sb, userId: string) {
  const { data, error } = await supabase
    .from("staff_access")
    .select("organization_id,role,status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data && data.status === "active") {
    return { organizationId: data.organization_id as string, papel: data.role as string };
  }
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .is("archived_at", null)
    .maybeSingle();
  if (!membro.data?.organization_id) throw new Error("Acesso interno não autorizado.");
  const papeis = await supabase
    .from("user_roles")
    .select("role")
    .eq("organization_id", membro.data.organization_id);
  const lista = ((papeis.data ?? []) as { role: string }[]).map((p) => p.role);
  return {
    organizationId: membro.data.organization_id as string,
    papel: lista.includes("admin") ? "admin" : (lista[0] ?? "leitura"),
  };
}

/** Carrega a pesquisa e valida leitura/edição conforme papel e designação. */
export async function pesquisaAutorizada(
  supabase: Sb,
  organizationId: string,
  papel: string,
  userId: string,
  researchCaseId: string,
) {
  const { data, error } = await supabase
    .from("research_cases")
    .select("*")
    .eq("id", researchCaseId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Pesquisa não encontrada nesta organização.");

  const caso = await supabase
    .from("crm_casos")
    .select("id,codigo,titulo,status,pais,via,responsavel_id,contrato_assinado,pagamento_confirmado,ativo")
    .eq("id", data.case_id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  const designado =
    data.assigned_researcher_user_id === userId || caso.data?.responsavel_id === userId;
  const podeEditar =
    papel === "admin" || papel === "operacoes" || (papel === "pesquisador" && designado);

  return { pesquisa: data as Record<string, any>, caso: (caso.data ?? {}) as Record<string, any>, podeEditar };
}

export function exigirEdicao(podeEditar: boolean) {
  if (!podeEditar) {
    throw new Error("Seu papel não permite editar esta pesquisa. Solicite acesso a operações ou administração.");
  }
}
