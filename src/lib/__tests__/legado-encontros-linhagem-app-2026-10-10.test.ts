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

  it("sem encontro aprovado, mostra acolhimento em vez de sumir a seção ou girar spinner infinito", () => {
    expect(rota).toContain("data-legado-encontros-vazio");
    expect(rota).toContain("carregandoEncontros");
    // A seção só decide (lista ou vazio) depois que a consulta termina —
    // nunca mostra a mensagem de vazio por cima de um carregamento em curso.
    expect(rota).toContain("casoId && !carregandoEncontros");
  });

  it("a tela do cliente não expõe botão de excluir, input de edição nem rótulo de ID de banco", () => {
    const secao = rota.slice(rota.indexOf("data-legado-encontros"), rota.indexOf("data-legado-prateleiras"));
    expect(secao).not.toMatch(/excluir|deletar|apagar/i);
    expect(secao).not.toMatch(/<input|<textarea|onChange=/);
    expect(secao).not.toMatch(/\be\.id\b\s*[^}]*<\/|>\s*{?\s*e\.id\s*}?\s*</);
  });
});
