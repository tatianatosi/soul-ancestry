import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte A (27/09/2026): lead_id persistente. `clientes`/`crm_casos` não
 * tinham nenhum vínculo reverso pro lead de origem — só `leads.case_id`
 * (unidirecional). Migration aditiva + gravação só na criação (nunca em
 * reuso de pessoa/caso existente).
 */
describe("Corte A — migration adiciona lead_id nullable, sem tocar dado existente", () => {
  const migration = readFileSync(
    "supabase/migrations/20260927110000_lead_id_persistente_clientes_crm_casos.sql",
    "utf8",
  );

  it("adiciona lead_id em clientes e crm_casos, aditivo (IF NOT EXISTS), referenciando leads(id)", () => {
    expect(migration).toContain("ALTER TABLE public.clientes");
    expect(migration).toContain("ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id)");
    expect(migration).toContain("ALTER TABLE public.crm_casos");
  });

  it("não tem backfill nem UPDATE de dado existente", () => {
    expect(migration).not.toContain("UPDATE public.clientes");
    expect(migration).not.toContain("UPDATE public.crm_casos");
  });
});

describe("Corte A — handoff grava lead_id só na criação, nunca em reuso", () => {
  const arquivo = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");

  it("grava lead_id no insert de clientes (ramo de criação, decisao.acao !== 'reusar')", () => {
    const inicioInsert = arquivo.indexOf('tabela: "clientes"');
    expect(inicioInsert).toBeGreaterThan(-1);
    const trecho = arquivo.slice(inicioInsert, inicioInsert + 700);
    expect(trecho).toContain("lead_id: data.leadId");
  });

  it("grava lead_id no insert de crm_casos (caso novo)", () => {
    const inicio = arquivo.indexOf('.from("crm_casos")\n        .insert({');
    expect(inicio).toBeGreaterThan(-1);
    const trecho = arquivo.slice(inicio, inicio + 900);
    expect(trecho).toContain("lead_id: data.leadId");
  });

  it("caminho de reuso de caso existente (lead.case_id já preenchido) não grava lead_id em nenhum insert novo", () => {
    const inicioReuso = arquivo.indexOf("if (lead.case_id) {");
    const fimReuso = arquivo.indexOf("const { data: clientesRows }");
    const trecho = arquivo.slice(inicioReuso, fimReuso);
    expect(trecho).not.toContain(".insert(");
  });
});

describe("Corte A — leitura exposta em Pessoa 360", () => {
  it("pessoa.functions.ts seleciona lead_id de clientes", () => {
    const arquivo = readFileSync("src/lib/pessoa.functions.ts", "utf8");
    expect(arquivo).toContain("lead_id");
  });

  it("pessoas.$clienteId.tsx mostra o campo Lead de origem", () => {
    const pagina = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");
    expect(pagina).toContain('rotulo="Lead de origem"');
  });
});
