import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Achado 25 da design critique do App Cliente (27/10/2026): a coluna "Linha
 * do Processo" de /portal/jornada mostrava DOIS progressos de fase
 * diferentes empilhados sem rótulo — o bloco "Preparação do caso" (5 etapas
 * canônicas, `etapas-caso.ts`) e a trilha de bolhas numeradas (8 fases de
 * `case_plans.fase_jornada`) pareciam um widget duplicado/quebrado, quando
 * na verdade são fontes DIFERENTES por desenho, já registradas como
 * divergência não resolvida por invenção (§29, comentário de
 * `etapaDoCasoCliente` em portal-dados-vivos.ts).
 *
 * Fix: só um rótulo foi adicionado acima da trilha de 8 fases ("Passo a
 * passo da jornada"), distinguindo-a do bloco "Preparação do caso" acima.
 * Nenhum de-para entre as duas fontes foi inventado nem os dados foram
 * mesclados — a decisão de qual delas é "a" fonte de progresso continua em
 * aberto para a Proprietária, exatamente como o comentário original pede.
 */
const src = readFileSync("src/routes/portal/jornada.tsx", "utf8");

describe("Jornada — os dois progressos de fase ficam rotulados, não mesclados", () => {
  it("a trilha de 8 fases agora tem um rótulo próprio, distinto de 'Preparação do caso'", () => {
    expect(src).toContain("Passo a passo da jornada");
    expect(src).toContain("Preparação do caso");
  });

  it("as duas fontes de dado continuam separadas — nenhum de-para 8↔5 foi inventado", () => {
    expect(src).toContain("etapaAtualRotulo");
    expect(src).toContain("passoAtualIndice");
    // Confirma que a trilha ainda lê a fase de 8 passos (vivo.etapa), não as 5 etapas canônicas.
    expect(src).toMatch(/passoAtualIndice\s*=\s*ehDemo[\s\S]{0,80}vivo\.etapa/);
  });
});
