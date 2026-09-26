import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * P32b (26/09/2026) — correção direta ao feedback da Proprietária: "ela não
 * funciona... eu não pedi para duplicar só pedi para entre ficha piloto e
 * ficha genealógica prevalece a mais completa, verifique novamente".
 *
 * Achado real (releitura do schema, não do código já escrito): a Ficha
 * Piloto (`research_people`, identidade mínima) e a Ficha Genealógica
 * (`genealogical_person_profiles`, nascimento/óbito/sexo) já são ligadas por
 * uma FK OBRIGATÓRIA (`genealogical_person_profiles.research_person_id`) —
 * mas a Ficha Piloto nunca lia esse perfil, então sempre mostrava a versão
 * mais pobre da mesma pessoa. Corrigido: a Ficha Piloto passa a puxar o
 * perfil vinculado e deixar seus campos preenchidos prevalecerem — nunca
 * escreve de volta em `research_people`.
 */

import { pessoaComPerfilMaisCompleto } from "@/lib/ficha-piloto-genealogica";

describe("P32b — pessoaComPerfilMaisCompleto: a Ficha Genealógica prevalece quando existe perfil", () => {
  it("sem perfil vinculado: todos os campos ricos ficam nulos, sem inventar dado", () => {
    const r = pessoaComPerfilMaisCompleto({ id: "p1", canonical_name: "Ana" }, undefined);
    expect(r.nascimento_data).toBeNull();
    expect(r.nascimento_localidade).toBeNull();
    expect(r.morte_data).toBeNull();
    expect(r.tem_perfil_mais_completo).toBe(false);
  });

  it("com perfil vinculado: nascimento/óbito/sexo do perfil prevalecem sobre a ficha piloto vazia", () => {
    const r = pessoaComPerfilMaisCompleto(
      { id: "p1", canonical_name: "Ana" },
      {
        research_person_id: "p1",
        nascimento_data: "1990-05-10",
        nascimento_localidade: "Treviso",
        morte_data: null,
        morte_localidade: null,
        sexo: "feminino",
      },
    );
    expect(r.nascimento_data).toBe("1990-05-10");
    expect(r.nascimento_localidade).toBe("Treviso");
    expect(r.sexo).toBe("feminino");
    expect(r.tem_perfil_mais_completo).toBe(true);
  });

  it("nunca sobrescreve os campos originais da pessoa (canonical_name, identity_status etc.)", () => {
    const r = pessoaComPerfilMaisCompleto(
      { id: "p1", canonical_name: "Ana", identity_status: "confirmed" },
      { research_person_id: "p1", nascimento_data: "1990-05-10" },
    );
    expect(r.canonical_name).toBe("Ana");
    expect(r.identity_status).toBe("confirmed");
  });
});

describe("P32b — carregarFichaPiloto busca o perfil pela FK real, não por nome", () => {
  const arquivo = readFileSync("src/lib/ficha-piloto-genealogica.functions.ts", "utf8");

  it("consulta genealogical_person_profiles por research_person_id (FK direta), não por client_id/nome", () => {
    expect(arquivo).toContain('.from("genealogical_person_profiles")');
    expect(arquivo).toContain('.in("research_person_id", idsPessoas)');
  });

  it("nunca escreve em genealogical_person_profiles nem em research_people (só leitura)", () => {
    expect(arquivo).not.toContain(".insert(");
    expect(arquivo).not.toContain(".update(");
  });

  it("aplica pessoaComPerfilMaisCompleto a cada pessoa antes de devolver", () => {
    expect(arquivo).toContain("pessoaComPerfilMaisCompleto(");
  });
});

describe("P32b — a tela da Ficha Piloto mostra o dado mais completo, não só a versão pobre", () => {
  const arquivo = readFileSync("src/components/caso/ficha-piloto-genealogica.tsx", "utf8");

  it("renderiza nascimento/óbito quando presentes, sem exigir abrir a Ficha Genealógica à parte", () => {
    expect(arquivo).toContain("x.nascimento_data");
    expect(arquivo).toContain("x.morte_data");
  });
});
