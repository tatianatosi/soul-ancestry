import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Auditoria de prontidão de lançamento (18/10/2026): `importacoes.tsx`
 * (Importações e migração controlada) não tinha nenhum teste automatizado.
 *
 * Rota de página de `_authenticated`, code-split pelo TanStack Start — ver
 * a nota em `rota-etiquetas.test.ts` sobre por que esta família de rotas é
 * provada por leitura do código real, no mesmo padrão já usado no projeto
 * para `acessos-portal.tsx`/`configuracoes.tsx`/etc. (`dsa11-...`, `d11-...`,
 * `motor-lote4-batch15-...`).
 */
const ROTA = readFileSync("src/routes/_authenticated/importacoes.tsx", "utf8");
const MIGRACAO_FN = readFileSync("src/lib/migracao.functions.ts", "utf8");
const LEGADO = readFileSync("src/lib/migracao-legado.ts", "utf8");

describe("Rota /importacoes — fontes legadas e governança", () => {
  it("lista as fontes legadas reais (FONTES_LEGADAS), somente leitura — nunca tabela nova", () => {
    expect(ROTA).toMatch(/from "@\/lib\/migracao-legado"/);
    expect(ROTA).toContain("FONTES_LEGADAS.map((f) =>");
    expect(ROTA).toContain(
      'texto={f.situacao === "canonica" ? "canônica" : "legado somente leitura"}',
    );
  });

  it("carrega lotes, exceções e vínculos reais via carregarMigracao, sem fonte paralela", () => {
    expect(ROTA).toContain("useServerFn(carregarMigracao)");
    expect(ROTA).toMatch(/useQuery\(\{ queryKey: \["migracao"\]/);
    const trecho = MIGRACAO_FN.slice(
      MIGRACAO_FN.indexOf("export const carregarMigracao"),
      MIGRACAO_FN.indexOf("export const carregarMigracao") + 1500,
    );
    expect(trecho).toMatch(/\.from\("legacy_import_batches"\)|\.from\("import_batches"\)|lotes/);
  });
});

describe("Rota /importacoes — prévia e confirmação da importação Placego (CSV)", () => {
  it("mapeia o CSV com os campos reais do catálogo Placego, sugerindo o mapeamento do cabeçalho", () => {
    expect(ROTA).toMatch(/from "@\/lib\/migracao-legado"/);
    expect(ROTA).toContain("CAMPOS_PLACEGO.map((c) =>");
    expect(ROTA).toContain("sugerirMapeamento(cabecalho)");
    expect(ROTA).toContain("lerCsv(csv).cabecalho");
  });

  it("pré-visualiza (com dedup) antes de confirmar — dois passos reais, dois botões", () => {
    expect(ROTA).toContain("useServerFn(previewImportacaoPlacego)");
    expect(ROTA).toContain("useServerFn(executarImportacaoPlacego)");
    expect(ROTA).toMatch(/mPreview\.mutate\(\)/);
    expect(ROTA).toMatch(/disabled=\{!mPreview\.data \|\| mExecutar\.isPending\}/);
    expect(ROTA).toContain("mExecutar.mutate()");
  });

  it("a prévia mostra o resumo real (criar/atualizar/duplicado/rejeitado), nunca número inventado", () => {
    expect(ROTA).toMatch(
      /Prévia: \{mPreview\.data\.resumo\.total\} linhas — criar \{mPreview\.data\.resumo\.criar\}, atualizar \{mPreview\.data\.resumo\.atualizar\}, duplicadas\{" "\}/,
    );
  });

  it("cada importação gera um lote auditável que preserva o ID original do Placego", () => {
    expect(ROTA).toMatch(/gera um lote auditável e preserva o ID original do Placego/);
    const trecho = MIGRACAO_FN.slice(
      MIGRACAO_FN.indexOf("export const executarImportacaoPlacego"),
      MIGRACAO_FN.indexOf("export const executarImportacaoPlacego") + 3000,
    );
    expect(trecho).toMatch(/lead_id_placego|legacy_record_id|legacy_record_links/);
  });
});

describe("Rota /importacoes — exceções de migração", () => {
  it("resolve uma exceção aberta chamando atualizarExcecaoMigracao com status 'resolvida'", () => {
    expect(ROTA).toContain("useServerFn(atualizarExcecaoMigracao)");
    expect(ROTA).toMatch(
      /resolver\(\{ data: \{ id: e\.id, status: "resolvida" \} \}\)/,
    );
    expect(ROTA).toContain('{e.status === "aberta" && (');
  });

  it("vínculo somente leitura vira pendência declarada, nunca botão silenciosamente desabilitado", () => {
    expect(ROTA).toContain('capacidade: "editar_rascunho"');
    expect(ROTA).toMatch(/pendenciaVinculo = podeEscreverVinculo/);
  });

  it("estado vazio honesto: nenhum lote/exceção/vínculo mostra mensagem certa, não tabela em branco", () => {
    expect(ROTA).toContain('vazio="Nenhuma importação registrada."');
    expect(ROTA).toContain('vazio="Nenhuma exceção registrada."');
    expect(ROTA).toContain('vazio="Nenhum vínculo legado registrado."');
  });
});

describe("Rota /importacoes — vocabulário real, sem CHECK/tabela hipotética", () => {
  it("os campos do catálogo Placego mapeiam para tabelas/colunas reais do schema", () => {
    for (const destino of [
      "legacy_record_links.legacy_record_id",
      "leads.nome",
      "lead_sources.codigo",
      "marketing_campaigns.codigo",
    ]) {
      expect(LEGADO, `destino ausente em migracao-legado.ts: ${destino}`).toContain(destino);
    }
  });

  it("head/meta identifica a página, sem indexação", () => {
    expect(ROTA).toContain('title: "Importações e migração — Clube Ancestral"');
    expect(ROTA).toMatch(/name: "robots", content: "noindex"/);
  });
});
