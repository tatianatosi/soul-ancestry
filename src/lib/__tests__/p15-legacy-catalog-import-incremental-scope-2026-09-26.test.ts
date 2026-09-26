import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P15 (26/09/2026): a Proprietária insistiu, várias vezes, que o prompt
// "Planejador Universal Multipaís/Produtos-Pai/Preços Resgatados" não tinha
// sido executado — não só lido. Reconferido item a item contra o schema
// real: 8 das 10 entidades do MODELO DE DADOS já existiam sob nomes reais
// (case_plans/crm_casos, lineage_paths, research_cases, citizenship_tracks,
// commercial_conditions/case_services, client_deliverables,
// planner_catalog_feed, price_catalog_rescued) — recriá-las duplicaria
// estrutura viva com dado real (Ana Luiza). As 2 que realmente faltavam
// (`legacy_catalog_import`, `incremental_scope`) foram construídas de
// verdade neste corte, não apenas mapeadas.
const migracao = readFileSync(
  "supabase/migrations/20260926110000_legacy_catalog_import_incremental_scope.sql",
  "utf8",
);

describe("P15 — legacy_catalog_import: tabela real, RLS real, populada 1:1 de price_catalog_rescued", () => {
  it("cria a tabela com todos os campos pedidos na regra 5 do prompt", () => {
    expect(migracao).toContain("create table if not exists public.legacy_catalog_import");
    for (const campo of [
      "source_artifact",
      "source_version",
      "source_line",
      "legacy_sku",
      "legacy_name",
      "legacy_price",
      "legacy_link",
      "imported_at",
      "integrity_hash",
      "reconciliation_status",
    ]) {
      expect(migracao).toContain(campo);
    }
  });

  it("RLS habilitada com policies de select/insert/update por organização", () => {
    expect(migracao).toContain("alter table public.legacy_catalog_import enable row level security");
    expect(migracao).toContain("legacy_catalog_import_sel");
    expect(migracao).toContain("legacy_catalog_import_ins");
    expect(migracao).toContain("legacy_catalog_import_upd");
  });

  it("popula por SELECT direto de price_catalog_rescued — nenhum valor novo digitado à mão", () => {
    expect(migracao).toContain("from public.price_catalog_rescued p");
    expect(migracao).toContain("where not exists");
  });

  it("nunca fabrica source_line nem finge conhecer o arquivo xlsx original não lido", () => {
    const bloco = migracao.slice(
      migracao.indexOf("insert into public.legacy_catalog_import"),
      migracao.indexOf("incremental_scope — esforço"),
    );
    expect(bloco).not.toMatch(/source_line\s*,/); // coluna não é preenchida no insert (fica null, honesto)
  });
});

describe("P15 — incremental_scope: estrutura real pronta, sem dado fabricado", () => {
  it("cria a tabela com todos os campos pedidos e vínculo real a citizenship_tracks/price_catalog_rescued", () => {
    expect(migracao).toContain("create table if not exists public.incremental_scope");
    expect(migracao).toContain("track_id uuid not null references public.citizenship_tracks(id)");
    expect(migracao).toContain("reference_price_id uuid references public.price_catalog_rescued(id)");
  });

  it("approval_status nunca nasce aprovado — sempre pendente_aprovacao por padrão", () => {
    const trecho = migracao.slice(migracao.indexOf("create table if not exists public.incremental_scope"));
    expect(trecho).toContain("default 'pendente_aprovacao'");
  });

  it("não insere nenhuma linha de exemplo — nenhum caso real multi-trilha existe hoje para justificar dado", () => {
    const trecho = migracao.slice(migracao.indexOf("create table if not exists public.incremental_scope"));
    expect(trecho).not.toContain("insert into public.incremental_scope");
  });

  it("RLS habilitada com policies de select/insert/update por organização", () => {
    const trecho = migracao.slice(migracao.indexOf("create table if not exists public.incremental_scope"));
    expect(trecho).toContain("alter table public.incremental_scope enable row level security");
    expect(trecho).toContain("incremental_scope_sel");
    expect(trecho).toContain("incremental_scope_ins");
    expect(trecho).toContain("incremental_scope_upd");
  });
});

describe("P15 — as 6 entidades restantes do prompt não viram tabela nova duplicada", () => {
  it("a migration documenta explicitamente por que family_case/family_branch/research_base/nationality_track/case_commercial_condition/microdelivery não foram recriadas", () => {
    expect(migracao).toContain("family_case, family_branch");
    expect(migracao).toContain("já existem, ao vivo e populadas, sob nomes reais");
  });
});
