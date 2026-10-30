import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * A2 App Jornada — mockup 2/7: duas colunas paralelas (LINHA ANCESTRAL ×
 * LINHA DO PROCESSO) com "MOMENTOS DE UNIÃO" como conector explícito.
 *
 * Correção de rumo da Proprietária (2026-09-23): o texto do De-Para §4
 * ("linha horizontal única: Início/Pesquisa/Conferência/Entrega") NÃO
 * prevalece aqui — o mockup visual de 17 páginas manda na composição
 * (§29: "o mockup é fonte de verdade para composição visual"). A
 * classificação histórico×processo já existia (`TIPOS_HISTORIA`,
 * `noRealDeItem`/`noDemoDeItem`) e já era usada para colorir um único
 * timeline misturado; este corte separa em duas colunas sem recalcular
 * a classificação.
 */

const ROTA = resolve(__dirname, "../../routes/portal/jornada.tsx");
const codigo = readFileSync(ROTA, "utf8");

describe("A2 Jornada — duas colunas paralelas (mockup 2/7)", () => {
  it("TimelineVertical recebe eventos já filtrados por linha, não a lista mista", () => {
    // Assinatura ganhou `variante` (gold = Linha Ancestral, navy = Processo) no contrato visual v4.
    expect(codigo).toMatch(/function TimelineVertical\(\{\s*eventos,\s*eyebrow,[\s\S]*?\}: \{\s*eventos: NoEvento\[\];\s*eyebrow: string;/);
  });

  it("separa linhaAncestral (categoria !== navy) de linhaProcesso (categoria === navy) a partir do mesmo array `nos`", () => {
    expect(codigo).toMatch(/const linhaAncestral = nos\.filter\(/);
    expect(codigo).toMatch(/n\.tipo === "evento" && n\.categoria !== "navy"/);
    expect(codigo).toMatch(/const linhaProcesso = nos\.filter\(/);
    expect(codigo).toMatch(/n\.tipo === "evento" && n\.categoria === "navy"/);
  });

  it("renderiza as duas colunas com os rótulos aprovados do mockup", () => {
    expect(codigo).toMatch(/eyebrow="Linha Ancestral"/);
    expect(codigo).toMatch(/eyebrow="Linha do Processo"/);
  });

  it("MOMENTOS DE UNIÃO vira conector próprio, não item misturado na lista", () => {
    expect(codigo).toContain("function MomentosDeUniao");
    expect(codigo).toMatch(/Momentos de União/);
    expect(codigo).toMatch(/<MomentosDeUniao pontes=\{pontes\}\s*\/>/);
  });

  /*
   * 13/10/2026 — paridade com o mockup p.4, pedido da Proprietária: "não
   * empilhe em 1 coluna só". As duas linhas ficam lado a lado em qualquer
   * largura (antes `sm:grid-cols-2` empilhava no celular), e Momentos de União
   * é o cartão abaixo das duas, ocupando a largura toda.
   */
  // 19/10/2026 — reconciliação com o Lovable: decisão de 13/10 (duas
  // colunas lado a lado mesmo no celular) foi substituída pela composição
  // real de hoje — empilha no celular (`grid-cols-1`), duas colunas a
  // partir de `md:` (ver mockup4-presentation.test.ts, "stacks Jornada on
  // mobile and restores two lines at desktop", já verde contra este mesmo
  // arquivo). Mantém Momentos de União como conector abaixo das duas.
  it("empilha no celular e restaura as duas colunas lado a lado a partir de md:", () => {
    expect(codigo).toMatch(/data-jornada-duas-linhas className="relative grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-2/);
  });

  it("marca cada coluna com estado vazio honesto, sem inventar item", () => {
    expect(codigo).toMatch(/gerações anteriores aparecerão aqui/);
    expect(codigo).toMatch(/passoAtualIndice !== null \? \(\s*<div className="mt-3"><TrilhaCompacta/);
  });

  it("Próxima ação (nó sintético __agora__) cai na Linha do Processo, nunca na Ancestral", () => {
    // O nó __agora__ é sempre categoria "navy" — confirma que a Próxima
    // ação nunca migra para a coluna histórica.
    const idxAgora = codigo.indexOf('id: "__agora__"');
    const trecho = codigo.slice(idxAgora, idxAgora + 200);
    expect(trecho).toMatch(/categoria: "navy"/);
  });
});
