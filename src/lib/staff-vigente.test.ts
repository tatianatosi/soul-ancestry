import { describe, expect, it } from "vitest";
import { escolherStaffVigente } from "./staff-vigente";
import { ehProprietariaAdministradora } from "./modo-proprietaria";

describe("A04 staff vigente", () => {
  it("prefere o ativo mais recente mesmo com revogado mais novo", () => {
    const r = escolherStaffVigente([
      { id: "a", status: "active", updated_at: "2026-10-01" },
      { id: "b", status: "revoked", updated_at: "2026-11-01" },
      { id: "c", status: "active", updated_at: "2026-10-20" },
    ]);
    expect(r?.id).toBe("c");
  });
  it("sem linhas devolve null", () => expect(escolherStaffVigente([])).toBeNull());
  it("sem ativo devolve o mais recente", () => {
    expect(escolherStaffVigente([{ id: "x", status: "suspended", updated_at: "2026-01-01" }])?.id).toBe("x");
  });
});

describe("A01 equivalência da Proprietária", () => {
  it("aceita admin e proprietaria_administradora", () => {
    expect(ehProprietariaAdministradora("admin")).toBe(true);
    expect(ehProprietariaAdministradora("proprietaria_administradora")).toBe(true);
  });
  it("recusa outros papéis", () => {
    expect(ehProprietariaAdministradora("comercial")).toBe(false);
    expect(ehProprietariaAdministradora(null)).toBe(false);
  });
});
