import { describe, expect, it } from "vitest";

import { CAMPOS } from "@/components/pesquisa/modulo-campos";

/**
 * 28/08/2026 — a Proprietária não conseguia salvar nada na Pesquisa:
 * "check constraint research_people_identity_status_check". As opções de
 * quase todo campo `select` do módulo eram um vocabulário inventado, nunca
 * cotejado contra as constraints reais das tabelas `research_*`
 * (supabase/migrations/20260816231149_0424098a-7ba0-4959-80c3-3d5a48184760.sql).
 * Toda opção enviada ao banco fora dessa lista quebra o `check` e a
 * gravação falha por inteiro — em qualquer bloco, não só "pessoas".
 *
 * Esta trava mantém `CAMPOS` (fonte dos <select> da tela) sempre um
 * subconjunto do vocabulário real do banco. Se alguém adicionar uma opção
 * nova sem conferir a constraint, o teste quebra antes de virar o mesmo
 * bug de novo.
 */
const VALORES_PERMITIDOS_NO_BANCO: Record<string, Record<string, string[]>> = {
  pessoas: {
    person_status: ["subject", "family_member", "ancestor", "descendant", "related_person", "unknown_person"],
    living_status: ["living", "deceased", "unknown"],
    birth_date_precision: ["exact", "month_year", "year", "estimated", "unknown"],
    death_date_precision: ["exact", "month_year", "year", "estimated", "unknown"],
    identity_status: ["unreviewed", "tentative", "reviewed", "confirmed", "conflicting"],
    sensitivity_level: ["standard", "restricted", "highly_restricted"],
  },
  variantes: {
    variant_type: ["spelling", "transliteration", "married_name", "record_error", "abbreviation", "alternate_language", "other"],
    status: ["unreviewed", "plausible", "validated", "rejected"],
  },
  relacoes: {
    relationship_type: [
      "parent", "child", "spouse", "sibling", "grandparent", "grandchild", "guardian", "adopter", "adopted_child", "other", "unknown",
    ],
    status: ["asserted", "under_review", "supported", "validated", "conflicting", "rejected"],
    confidence_level: ["low", "medium", "high"],
  },
  eventos: {
    event_type: [
      "birth", "baptism", "marriage", "divorce", "death", "burial", "migration", "naturalization",
      "military_service", "residence", "name_change", "document_issue", "other",
    ],
    event_date_precision: ["exact", "month_year", "year", "estimated", "unknown"],
    status: ["asserted", "under_review", "supported", "validated", "conflicting", "rejected"],
    confidence_level: ["low", "medium", "high"],
  },
  fontes: {
    source_type: [
      "family_document", "civil_record", "religious_record", "archive_catalog", "public_archive",
      "familysearch_reference", "official_registry", "interview", "client_provided", "internal_note", "other",
    ],
    source_status: ["referenced", "located", "reviewed", "verified", "inaccessible", "rejected"],
    access_level: ["internal_restricted", "case_team", "client_provided_restricted"],
  },
  evidencias: {
    evidence_type: [
      "document", "record_excerpt", "photo", "oral_history", "registry_entry",
      "archive_reference", "timeline_item", "correspondence", "structured_note", "other",
    ],
    evidence_status: ["collected", "under_review", "validated", "inconclusive", "discarded", "archived"],
    confidence_level: ["low", "medium", "high"],
    sensitivity_level: ["standard", "restricted", "highly_restricted"],
  },
  hipoteses: {
    category: ["identity", "parentage", "lineage", "location", "date", "document_gap", "legal_context_internal", "other"],
    status: ["open", "under_review", "supported", "not_supported", "inconclusive", "closed"],
    confidence_level: ["low", "medium", "high"],
  },
  pedidos: {
    request_type: [
      "client_document", "internal_review", "future_external_request", "archive_request",
      "registry_request", "translation", "apostille", "other",
    ],
    status: ["draft", "requested_from_client", "received", "under_review", "completed", "blocked_by_gate", "cancelled", "archived"],
  },
  pendencias: {
    category: ["identity", "relationship", "event", "source", "document", "conflict", "authorization", "external_gate", "review", "other"],
    severity: ["critical", "high", "medium", "low"],
    status: ["open", "in_progress", "blocked", "resolved", "not_applicable", "archived"],
  },
  relatorios: {
    report_type: ["internal_progress", "internal_findings", "client_summary_draft", "client_summary_approved", "delivery_internal"],
    status: ["draft", "under_review", "approved", "released", "archived"],
  },
  resumos: {
    status: ["draft", "under_review", "approved_for_release", "released", "archived"],
  },
};

describe("Pesquisa — vocabulário dos <select> nunca diverge da constraint real do banco", () => {
  for (const [bloco, campos] of Object.entries(VALORES_PERMITIDOS_NO_BANCO)) {
    for (const [campo, permitidos] of Object.entries(campos)) {
      it(`${bloco}.${campo}: toda opção da tela existe na constraint do banco`, () => {
        const definicao = CAMPOS[bloco as keyof typeof CAMPOS].find((c) => c.nome === campo);
        expect(definicao, `campo "${campo}" não encontrado no bloco "${bloco}"`).toBeDefined();
        const valoresNaTela = (definicao?.opcoes ?? []).map(([v]) => v);
        expect(valoresNaTela.length).toBeGreaterThan(0);
        for (const v of valoresNaTela) {
          expect(permitidos, `"${v}" em ${bloco}.${campo} não existe na constraint do banco`).toContain(v);
        }
      });
    }
  }
});
