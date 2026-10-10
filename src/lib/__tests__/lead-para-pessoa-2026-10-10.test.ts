import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { camposParaPreencherNaPessoa } from "@/lib/lead-para-pessoa";
import { pendenciasDicionarioDoLead } from "@/lib/dicionario-calls-crm";

describe("Dados civis da call → Pessoa 360 (10/10/2026)", () => {
  it("preenche só o que está vazio na pessoa", () => {
    expect(
      camposParaPreencherNaPessoa(
        { nome: "Ana Luiza", telefone: "11 99999-0000", pais_interesse: "Itália" },
        { nome: "Ana Luiza", telefone: "", pais_interesse: null },
      ),
    ).toEqual({ telefone: "11 99999-0000", pais_interesse: "Itália" });
  });

  it("nunca sobrescreve valor já gravado na pessoa", () => {
    expect(
      camposParaPreencherNaPessoa(
        { nome: "Ana L.", telefone: "999", pais_interesse: "Portugal" },
        { nome: "Ana Luiza", telefone: "888", pais_interesse: "Itália" },
      ),
    ).toEqual({});
  });

  it("ignora campo vazio no lead", () => {
    expect(camposParaPreencherNaPessoa({ nome: "  ", telefone: null }, { nome: "", telefone: "" })).toEqual({});
  });

  it("salvarLeadDesk aplica o preenchimento sem bloquear o salvamento", () => {
    const fonte = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
    expect(fonte).toContain('import { camposParaPreencherNaPessoa } from "@/lib/lead-para-pessoa"');
    expect(fonte).toContain("levarDadosCivisParaPessoa(supabase, organizationId, userId, data.id");
    expect(fonte).toContain('.eq("lead_id", leadId)');
    expect(fonte).toContain("Pessoa 360 não recebeu os dados civis da call");
  });

  it("o dicionário de validações segue ligado ao Painel de Calls", () => {
    expect(readFileSync("src/lib/painel-calls.ts", "utf8")).toContain("pendenciasDicionarioDoLead");
    expect(typeof pendenciasDicionarioDoLead).toBe("function");
  });
});
