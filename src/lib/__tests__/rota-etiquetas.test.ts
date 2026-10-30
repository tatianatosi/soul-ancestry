import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auditoria de prontidão de lançamento (18/10/2026): `etiquetas.tsx`
 * (Taxonomia canônica de etiquetas) não tinha nenhum teste automatizado.
 *
 * Esta rota não pode ser renderizada por `Route.component` em teste: as
 * rotas em `src/routes/_authenticated/*` são code-split pelo plugin do
 * TanStack Start (o `component` passado a `createFileRoute` é reescrito
 * para `lazyRouteComponent(() => import(...))` em build/transform, antes
 * de qualquer `vi.mock`), e a função de página não é exportada — só
 * `Route`. Comprovado: renderizar `Route.component` direto trava
 * indefinidamente num Suspense sem nunca resolver (nenhum erro lançado).
 * Por isso, como o resto do Desk (`dsa11-acessos-portal-cacard.test.ts`,
 * `d11-portal-publicacao-por-caso.test.ts`,
 * `motor-lote4-batch15-alta-prioridade.test.ts`, `navegacao-desk.test.ts`),
 * este teste prova o comportamento por leitura do código-fonte real.
 */
const ROTA = readFileSync("src/routes/_authenticated/etiquetas.tsx", "utf8");
const CANONICO_FN = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");

describe("Rota /etiquetas — Taxonomia canônica", () => {
  it("carrega a taxonomia real via carregarMapaEtiquetas, sem fonte paralela", () => {
    expect(ROTA).toMatch(/from "@\/lib\/caso-canonico\.functions"/);
    expect(ROTA).toContain("carregarMapaEtiquetas");
    expect(ROTA).toContain('useQuery({ queryKey: ["mapa-etiquetas"]');
  });

  it("carregarMapaEtiquetas lê label_taxonomy de verdade, por organização", () => {
    const trecho = CANONICO_FN.slice(
      CANONICO_FN.indexOf("export const carregarMapaEtiquetas"),
      CANONICO_FN.indexOf("export const carregarMapaEtiquetas") + 1200,
    );
    expect(trecho).toMatch(/\.from\("label_taxonomy"\)/);
    expect(trecho).toMatch(/\.eq\("organization_id", organizationId\)/);
    // "aplicacoes" é contagem real de entity_labels, não valor inventado.
    expect(trecho).toMatch(/\.from\("entity_labels"\)/);
    expect(trecho).toContain("aplicacoes: uso.get(l.id) ?? 0");
  });

  it("lista as etiquetas em tabela com categoria traduzida, código, escopo, equivalente e aplicações", () => {
    expect(ROTA).toContain("CATEGORIAS[String(l.category)] ?? l.category");
    for (const coluna of ["Etiqueta", "Categoria", "Escopo", "Equivalente Meta Agent", "Aplicações"]) {
      expect(ROTA, `coluna ausente: ${coluna}`).toContain(`<th className="px-4 py-3">${coluna}</th>`);
    }
    expect(ROTA).toContain("{l.name}");
    expect(ROTA).toContain("{l.code}");
    expect(ROTA).toContain("{l.scope}");
    expect(ROTA).toContain("{l.meta_agent_equivalent ?? "); // sem valor inventado
    expect(ROTA).toContain("{l.aplicacoes}");
  });

  it("a busca filtra por nome, código, categoria e equivalente, em memória sobre o já carregado", () => {
    expect(ROTA).toMatch(/placeholder="Buscar por nome, código ou equivalente"/);
    expect(ROTA).toMatch(
      /`\$\{l\.name\} \$\{l\.code\} \$\{l\.category\} \$\{l\.meta_agent_equivalent \?\? ""\}`\.toLowerCase\(\)\.includes\(filtro\)/,
    );
  });

  it("estado vazio honesto: sem etiqueta cadastrada ou busca sem correspondência, nunca lista em branco silenciosa", () => {
    expect(ROTA).toContain('vazio="Nenhuma etiqueta cadastrada na taxonomia canônica."');
    expect(ROTA).toContain('<EstadoVazio mensagem="Nenhuma etiqueta corresponde à busca." />');
  });

  it("os KPIs contam somente a taxonomia já carregada, ou traço quando a leitura falhou", () => {
    expect(ROTA).toContain('const taxonomiaCarregada = q.data?.taxonomia as LinhaEtiqueta[] | undefined;');
    expect(ROTA).toMatch(/q\.isLoading \? "…" : q\.error \|\| !taxonomiaCarregada \? "—" : String\(contar/);
  });

  it("head/meta identifica a página, sem indexação", () => {
    expect(ROTA).toContain('title: "Taxonomia de etiquetas — Clube Ancestral"');
    expect(ROTA).toMatch(/name: "robots", content: "noindex"/);
  });
});
