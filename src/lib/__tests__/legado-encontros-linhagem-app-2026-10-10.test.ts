import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const endpoint = readFileSync("src/lib/legado-app.functions.ts", "utf8");
const rota = readFileSync("src/routes/portal/legado.tsx", "utf8");

describe("Legado do App — encontros de linhagem (Bloco 5C, 10/10/2026)", () => {
  it("o endpoint autoriza o caso pelo portal e só devolve encontro aprovado e sanitizado", () => {
    expect(endpoint).toContain("casoAutorizado(supabase, data.caseId)");
    expect(endpoint).toContain('.eq("approval_status", "aprovado")');
    expect(endpoint).toContain('.not("resumo_aprovado_cliente", "is", null)');
    expect(endpoint).toContain('.is("archived_at", null)');
    expect(endpoint).not.toContain("title_internal");
    expect(endpoint).not.toContain("memoria_familiar");
    expect(endpoint).not.toContain("contexto_historico");
  });

  it("a aba Legado consulta o endpoint e mostra título, territórios, resumo e o disclaimer obrigatório", () => {
    expect(rota).toContain("listarEncontrosLinhagemApp");
    expect(rota).toContain("data-legado-encontros");
    expect(rota).toContain("e.territoriosMigratorios");
    expect(rota).toContain("e.resumoAprovado");
    expect(rota).toContain(
      "Este conteúdo é histórico, cultural e narrativo. Não substitui acompanhamento terapêutico, psicológico ou médico.",
    );
  });
});
