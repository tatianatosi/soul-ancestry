import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PAPEIS_PESSOA } from "@/lib/caso-ficha";

/**
 * Corte R4 (21/09/2026, sequência da auditoria de reconciliação):
 * `nucleo_membros.papel_no_caso` já tinha um CHECK fechado de 5 valores
 * (migration 20260821135341); `case_members.papel_no_caso` (mesmo
 * conceito) não tinha CHECK nenhum e `PAPEIS_PESSOA` só oferecia 4
 * valores, com "interlocutor" divergente de "interlocutor_externo". Este
 * corte alinha o vocabulário: PAPEIS_PESSOA ganha os valores canônicos,
 * "interlocutor" continua aceito como variante legada (nenhuma linha já
 * gravada é invalidada), e case_members ganha o mesmo CHECK.
 */

describe("PAPEIS_PESSOA (caso-ficha.ts) — vocabulário alinhado com nucleo_membros.papel_no_caso", () => {
  const valores = PAPEIS_PESSOA.map((o) => o.valor);

  it("contém os 5 valores canônicos do CHECK de nucleo_membros.papel_no_caso", () => {
    for (const v of ["contratante", "titular", "dependente", "representante", "interlocutor_externo"]) {
      expect(valores).toContain(v);
    }
  });

  it("mantém 'interlocutor' como variante legada — nenhuma linha já gravada fica sem opção", () => {
    expect(valores).toContain("interlocutor");
  });

  it("não duplica valor nenhum", () => {
    expect(new Set(valores).size).toBe(valores.length);
  });
});

describe("Migration — CHECK de papel_no_caso em case_members", () => {
  const migration = readFileSync(
    "supabase/migrations/20260921100000_case_members_papel_no_caso_chk.sql",
    "utf8",
  );

  it("adiciona o CHECK em case_members.papel_no_caso", () => {
    expect(migration).toContain("ALTER TABLE public.case_members");
    expect(migration).toContain("case_members_papel_no_caso_chk");
  });

  it("aceita os mesmos 6 valores que PAPEIS_PESSOA oferece (5 canônicos + legado)", () => {
    for (const v of PAPEIS_PESSOA.map((o) => o.valor)) {
      expect(migration).toContain(`'${v}'`);
    }
  });

  it("é aditiva — permite NULL e não faz UPDATE/backfill de dado existente", () => {
    expect(migration).toContain("papel_no_caso IS NULL");
    expect(migration).not.toMatch(/\bUPDATE\b/i);
  });

  it("é idempotente (não falha se já aplicada)", () => {
    expect(migration).toContain("EXCEPTION WHEN duplicate_object THEN NULL");
  });
});
