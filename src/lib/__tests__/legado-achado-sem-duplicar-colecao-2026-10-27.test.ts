import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achado 23 da design critique do App Cliente (27/10/2026): os itens
 * `tipo === "achado"` apareciam em "Seus Achados" E eram redistribuídos de
 * novo pelas 5 Coleções via `prateleiraDe()` — mesma publicação em dois
 * esquemas da tela, sem elo entre eles.
 *
 * Fix: `idsComAchado` exclui do `acervo` (o que alimenta as Coleções) os
 * itens já mostrados em "Seus Achados" — mesmo padrão de `idsComPessoa` em
 * `arvore.tsx`. `prateleiraDe()` NÃO foi tocada: é compartilhada com a
 * Biblioteca Mestre do Desk e as duas telas nunca podem divergir sobre em
 * qual coleção um item cai (comentário em projecoes-cliente.ts).
 */
const src = readFileSync("src/routes/portal/legado.tsx", "utf8");

describe("Legado — achados não se repetem nas Coleções", () => {
  it("acervo exclui os itens já mostrados em 'Seus Achados' via idsComAchado", () => {
    expect(src).toContain("idsComAchado");
    expect(src).toContain("!idsComAchado.has(String(e.id))");
  });

  it("prateleiraDe() não foi modificada — import intacto, sem override local", () => {
    const projecoes = readFileSync("src/lib/projecoes-cliente.ts", "utf8");
    expect(projecoes).toContain("nunca podem divergir");
    expect(src).toContain("prateleiraDe,");
    expect(src).toContain('from "@/lib/projecoes-cliente"');
  });
});
