import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Prioridade de 04/10/2026: o Clube Ancestral virar produto com cliente.
 *
 * Medição no caso canônico CA-CID-AT-FAM-2026-001 (Ana): o contrato
 * 2026-CB-0001 está `rejected`, com 31 parâmetros e **5 obrigatórios vazios**
 * — é o que trava a prévia e, com ela, a revisão e a assinatura.
 *
 * Dos 5, três tinham fonte viva que ninguém lia:
 *   - servicos_excluidos  → `proposals.exclusoes` da proposta aprovada
 *   - produto_sku         → produto-pai do Planejador (PP-03 · Áustria)
 *   - anexos_aplicaveis   → instâncias já materializadas em contract_annexes
 *
 * Dois não têm fonte e seguem pendência humana declarada:
 *   - vencimentos         → a condição comercial do caso não tem dia de
 *                           vencimento nem parcelas gravadas
 *   - ancestral_referencia→ a âncora da linhagem é a própria requerente
 *                           (Ana), não o ancestral: derivar dali poria a
 *                           cliente como ancestral de si mesma
 */

const FN = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");
const MIGRACAO = readFileSync(
  "supabase/migrations/20260905140000_origem_perfil_institucional_parametros.sql",
  "utf8",
);

function trechoPrecarga() {
  const i = FN.indexOf("export const preencherDeOrigens");
  const j = FN.indexOf("export const", i + 10);
  return FN.slice(i, j > i ? j : undefined);
}

describe("Obrigatórios do contrato da Ana: só o que tem fonte real", () => {
  const t = trechoPrecarga();

  it("1. exclusões vêm da proposta aprovada, não de texto digitado", () => {
    expect(t).toContain('campo: "servicos_excluidos"');
    expect(t).toContain('origem: "proposta"');
    expect(t).toContain("propostaApta");
    expect(t).toContain("exclusoes");
  });

  it("2. produto contratado vem do produto-pai do Planejador — SKU de catálogo não manda", () => {
    expect(t).toContain('campo: "produto_sku"');
    expect(t).toContain("produto_pai_id");
    expect(t).toContain("produtoPaiPorId");
    expect(t).toContain("rota_confirmada");
    expect(t).toContain("sem SKU técnico de catálogo");
    // A regra da Proprietária fica escrita onde alguém vai mexer.
    expect(t).toContain("planilha mestre é legado");
  });

  it("3. anexos aplicáveis vêm da instância materializada, não de uma segunda derivação", () => {
    expect(t).toContain('campo: "anexos_aplicaveis"');
    expect(t).toContain('.from("contract_annexes")');
    expect(t).toContain('"not_applicable", "archived"');
    expect(t).toContain("já materializadas");
  });

  it("4. os dois sem fonte não são inventados", () => {
    expect(t).not.toContain('campo: "vencimentos"');
    expect(t).not.toContain('campo: "ancestral_referencia"');
    // E o motivo fica registrado no próprio código.
    // 27/10/2026: indentação do comentário mudou com o Prettier (3 espaços,
    // não 5) — checa as duas frases separadamente em vez da quebra de linha exata.
    expect(t).toContain("continuam pendência");
    expect(t).toContain("humana declarada");
    expect(t).toContain("ancestral de si mesma");
  });

  it("5. toda origem usada existe no CHECK do banco — nenhum vocabulário novo", () => {
    // `origem: "origem" in p ? …` é checagem de propriedade, não valor de origem.
    const usadas = [...t.matchAll(/origem: "([a-z_]+)",/g)].map((m) => m[1]);
    expect(usadas.length).toBeGreaterThan(0);
    for (const o of new Set(usadas)) expect(MIGRACAO, o).toMatch(new RegExp(`'${o}'`));
  });

  it("6. nada sobrescreve correção humana nem valor divergente já gravado", () => {
    expect(t).toContain("temCorrecaoHomologada");
    expect(t).toContain("conflitos");
  });

  it("7. caso ou cliente de demonstração continua proibido de alimentar o contrato", () => {
    expect(t).toContain("caso é inválido ou de demonstração");
    expect(t).toContain("Cliente de demonstração não pode alimentar o contrato real");
  });
});
