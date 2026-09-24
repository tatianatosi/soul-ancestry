import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Corte U2 do de-para de Pessoa Unificada
 * (docs/design-system/de-para-pessoa-unificada.md): completa o vínculo
 * opcional Pessoa Canônica (clientes) ↔ Pesquisa (genealogical_person_
 * profiles.client_id) — coluna nullable já existente desde a migration
 * 20260906134500. Torna client_id editável via salvarRegistroG02 e
 * adiciona um seletor "Vincular a pessoa já cadastrada (opcional)" na
 * ficha de perfil, restrito aos clientes já ligados ao caso via
 * case_members.cliente_id. Nunca fusão automática, nunca migração em
 * massa — só grava com escolha humana explícita.
 */

const funcoes = readFileSync("src/lib/pessoas-linhagens.functions.ts", "utf8");
const rota = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");
const tipos = readFileSync("src/lib/pessoas-linhagens.ts", "utf8");

describe("pessoas-linhagens.functions.ts — client_id editável e candidatos do caso", () => {
  it("CAMPOS_PERFIL inclui client_id (editável via salvarRegistroG02)", () => {
    const trecho = funcoes.slice(funcoes.indexOf("const CAMPOS_PERFIL"), funcoes.indexOf("const CAMPOS_VARIANTE"));
    expect(trecho).toContain('"client_id"');
  });

  it("painelPessoasLinhagens busca clientesDoCaso reaproveitando pessoasDoCasoComFallbackNucleo (CA19), sem ler case_members cru", () => {
    const trecho = funcoes.slice(
      funcoes.indexOf("export const painelPessoasLinhagens"),
      funcoes.indexOf("export const criarPessoaComPerfil"),
    );
    expect(trecho).toContain("pessoasDoCasoComFallbackNucleo(supabase, data.caseId)");
    expect(trecho).not.toContain('.from("case_members")');
    expect(trecho).toContain("clientesDoCaso");
  });

  it("importa pessoasDoCasoComFallbackNucleo de @/lib/pessoa-vinculo (função canônica já usada por Caso 360/Pesquisa/Documentos)", () => {
    expect(funcoes).toMatch(/import \{[^}]*\bpessoasDoCasoComFallbackNucleo\b[^}]*\} from "@\/lib\/pessoa-vinculo";/);
  });
});

describe("pessoas-linhagens.$caseId.tsx — seletor de vínculo opcional, sem fusão automática", () => {
  it("AbaPerfis recebe clientesDoCaso e expõe o seletor com o texto explícito de opcionalidade", () => {
    expect(rota).toContain("clientesDoCaso:");
    expect(rota).toContain('label="Vincular a pessoa já cadastrada (opcional)"');
    expect(rota).toContain("Nunca automático — só grava se você escolher explicitamente.");
  });

  it("o payload de salvar perfil inclui client_id junto aos demais campos", () => {
    const idx = rota.indexOf("status_verificacao: e.status_verificacao,");
    const trecho = rota.slice(idx, idx + 300);
    expect(trecho).toContain("client_id: e.client_id,");
  });
});

describe("pessoas-linhagens.ts — tipo Perfil aceita client_id nullable/opcional", () => {
  it("client_id é string | null (opcional, para não quebrar fixtures existentes)", () => {
    const trecho = tipos.slice(tipos.indexOf("export type Perfil"), tipos.indexOf("export type Variante"));
    expect(trecho).toContain("client_id?: string | null;");
  });
});
