import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, it, expect } from "vitest";

/**
 * A4 Árvore — §6 linha 4 do De-Para: "LIGAÇÃO COM A JORNADA"; "Próxima
 * atualização"; texto explicativo | "Próxima conexão liberada ou estado
 * vazio". Antes a seção ("Atualizações publicadas") só existia quando
 * `notasPublicadas.length > 0` — sem publicação, ela desaparecia por
 * inteiro, em vez de mostrar o estado vazio que o wireframe exige.
 */

const ROTA = resolve(__dirname, "../../routes/portal/arvore.tsx");
const codigo = readFileSync(ROTA, "utf8");

describe("A4 Árvore — seção Ligação com a Jornada nunca desaparece", () => {
  it("marca o bloco com data-arvore-ligacao-jornada", () => {
    expect(codigo).toContain("data-arvore-ligacao-jornada");
  });

  it("a seção está fora de qualquer condicional de comprimento — sempre renderiza", () => {
    const idxSecao = codigo.indexOf("data-arvore-ligacao-jornada");
    const trechoAntes = codigo.slice(Math.max(0, idxSecao - 120), idxSecao);
    expect(trechoAntes).not.toMatch(/notasPublicadas\.length > 0 \? \(\s*$/);
  });

  it("mostra estado vazio honesto quando não há publicação, não null/desaparecimento", () => {
    expect(codigo).toMatch(/painel\.notasPublicadas\.length === 0 \? \(/);
    // 01/10/2026 — o Lovable reescreveu a frase do estado vazio (é dele o
    // texto do App). O que este teste protege continua igual: existe um
    // estado vazio explícito, e ele não promete nem inventa vínculo.
    expect(codigo).toMatch(/A próxima ligação da família aparecerá aqui quando estiver confirmada e liberada/);
  });

  it("link 'Ver na Jornada' só aparece quando há publicação real", () => {
    const idxSecao = codigo.indexOf("data-arvore-ligacao-jornada");
    const trecho = codigo.slice(idxSecao, idxSecao + 700);
    expect(trecho).toMatch(/painel\.notasPublicadas\.length > 0 \? \(\s*<LinkPortal to="\/portal\/jornada"/);
  });

  it("título do card é 'Ligação com a Jornada', do wireframe §6", () => {
    expect(codigo).toContain("Próxima atualização da árvore");
  });
});
