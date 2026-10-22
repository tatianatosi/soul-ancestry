import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auditoria de prontidão de lançamento (18/10/2026): `contratos.index.tsx`
 * não tinha teste dedicado para a listagem. A rota foi tocada recentemente
 * por outro agente, que ligou `ResumoMatrizJuridica` (matriz jurídica real,
 * `legal_clause_matrix` via `listarMatrizJuridica`) — ver
 * `src/components/contratos/resumo-matriz-juridica.tsx`.
 *
 * Rota de `_authenticated`, code-split pelo TanStack Start — ver a nota em
 * `rota-etiquetas.test.ts` sobre por que esta família é provada por
 * leitura do código real, no mesmo padrão já usado no projeto.
 */
const ROTA = readFileSync("src/routes/_authenticated/contratos.index.tsx", "utf8");
const CONTRATOS_FN = readFileSync("src/lib/contratos.functions.ts", "utf8");

describe("Rota /contratos (índice) — listagem de instrumentos", () => {
  it("lista os instrumentos contratuais reais vindos de listarContratos, sem fonte paralela", () => {
    expect(ROTA).toMatch(/from "@\/lib\/contratos\.functions"/);
    expect(ROTA).toContain("listarContratos");
    expect(ROTA).toContain('useServerFn(listarContratos)');
    expect(ROTA).toContain('titulo="Instrumentos contratuais"');
  });

  it("listarContratos lê a tabela real de contratos, por organização", () => {
    const trecho = CONTRATOS_FN.slice(
      CONTRATOS_FN.indexOf("export const listarContratos"),
      CONTRATOS_FN.indexOf("export const listarContratos") + 1200,
    );
    expect(trecho).toMatch(/\.from\("contracts"\)/);
    expect(trecho).toMatch(/organization_id/);
  });

  it("cada linha da tabela mostra número, instrumento, caso, pessoa, tipo, status e os dois gates reais", () => {
    for (const coluna of ["Número", "Instrumento", "Caso", "Pessoa", "Tipo", "Status", "Financeiro", "Pesquisa"]) {
      expect(ROTA, `coluna ausente: ${coluna}`).toContain(`<th className="px-3 py-2">${coluna}</th>`);
    }
    expect(ROTA).toContain("{c.contract_number}");
    expect(ROTA).toContain("ROTULO_TIPO_INSTRUMENTO[c.contract_type] ?? c.contract_type");
    expect(ROTA).toContain("ROTULO_STATUS_CONTRATO[c.status] ?? c.status");
    expect(ROTA).toContain("ROTULO_GATE_FINANCEIRO[c.financial_gate_status]");
    expect(ROTA).toContain("ROTULO_GATE_PESQUISA[c.research_gate_status]");
  });

  it("os KPIs contam exatamente a lista já carregada (conforme os filtros aplicados), sem número de cabeça", () => {
    expect(ROTA).toContain(
      'const kpi = (n: number) => (qLista.isLoading ? "…" : qLista.error || qLista.data === undefined ? "—" : String(n));',
    );
    expect(ROTA).toContain('Indicador rotulo="Instrumentos" valor={kpi(listaContratos.length)}');
    expect(ROTA).toContain('Indicador rotulo="Contratos-base" valor={kpi(bases.length)}');
    expect(ROTA).toMatch(
      /rotulo="Em revisão"\s*\n\s*valor=\{kpi\(listaContratos\.filter\(\(c\) => c\.status === "ready_for_review" \|\| c\.status === "under_human_review"\)\.length\)\}/,
    );
    expect(ROTA).toMatch(/rotulo="Assinados" valor=\{kpi\(listaContratos\.filter\(\(c\) => c\.status === "signed"\)\.length\)\}/);
  });

  it("mostra o resumo real da matriz jurídica (legal_clause_matrix) na página, importado do módulo canônico", () => {
    expect(ROTA).toMatch(/import\s*\{\s*ResumoMatrizJuridica\s*\}\s*from\s*"@\/components\/contratos\/resumo-matriz-juridica"/);
    expect(ROTA).toContain("<ResumoMatrizJuridica />");
  });

  it("estado vazio honesto: sem nenhum instrumento, mostra a mensagem certa, não tabela em branco silenciosa", () => {
    expect(ROTA).toContain('vazio="Nenhum instrumento contratual nesta organização ainda."');
  });

  it("nada aqui é enviado, cobrado ou assinado automaticamente (descrição declarada da rota)", () => {
    expect(ROTA).toMatch(/Nada aqui é enviado, cobrado ou assinado automaticamente/);
  });

  it("head/meta identifica a página, sem indexação", () => {
    expect(ROTA).toContain('title: "Contratos — Clube Ancestral"');
    expect(ROTA).toMatch(/name: "robots", content: "noindex"/);
  });
});
