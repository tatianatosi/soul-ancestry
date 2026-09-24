import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const pessoaFn = readFileSync("src/lib/pessoa.functions.ts", "utf8");
const pessoaPg = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

/**
 * Decisão explícita da Proprietária (24/09/2026): agregar achados de
 * pesquisa (genealogical_findings) na ficha da pessoa, não só por caso em
 * /achados/$caseId. O vínculo (primary_research_person_id →
 * research_people.id) já existia no schema desde a migration
 * 20260816201830 — ninguém consultava. Corte aditivo: nenhuma tabela, rota
 * ou escritor novo, só a leitura que faltava.
 */
describe("Pessoa 360 agrega achados de pesquisa (2026-09-24)", () => {
  it("carregarPessoa consulta genealogical_findings pelo vínculo real (não por nome)", () => {
    expect(pessoaFn).toContain('.from("genealogical_findings")');
    expect(pessoaFn).toContain('.in("primary_research_person_id", idsPessoaPesquisa)');
    expect(pessoaFn).toContain("achadosPesquisa");
  });

  it("a consulta é organization-scoped e ignora achados arquivados", () => {
    const inicio = pessoaFn.indexOf('.from("genealogical_findings")');
    const trecho = pessoaFn.slice(inicio, inicio + 400);
    expect(trecho).toContain(".eq(\"organization_id\", organizationId)");
    expect(trecho).toContain('.is("archived_at", null)');
  });

  it("Pessoa 360 renderiza a seção 'Achados de pesquisa' com o mesmo isolamento das demais seções de pesquisa", () => {
    expect(pessoaPg).toContain('titulo="Achados de pesquisa"');
    expect(pessoaPg).toContain('className="border-dashed border-navy/20 bg-cream/20"');
    expect(pessoaPg).toContain("nunca é exposta ao App Cliente");
  });

  it("a seção linka de volta para os achados do caso, sem duplicar o motor de achados", () => {
    const inicio = pessoaPg.indexOf('titulo="Achados de pesquisa"');
    const trecho = pessoaPg.slice(inicio, inicio + 800);
    expect(trecho).toContain('to="/achados/$caseId"');
    expect(trecho).toContain("Abrir achados do caso");
  });

  it("reaproveita o vocabulário controlado existente, não inventa rótulo novo", () => {
    expect(pessoaPg).toMatch(
      /import\s*\{\s*RELEVANCIAS,\s*STATUS_VALIDACAO,\s*TIPOS_ACHADO\s*\}\s*from\s*"@\/lib\/achados-genealogicos"/,
    );
  });
});
