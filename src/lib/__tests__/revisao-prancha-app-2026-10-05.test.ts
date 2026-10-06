import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COPY_TELAS } from "@/lib/portal-copy";
import { rotuloTipoProjecao } from "@/lib/projecoes-cliente";

describe("Revisão da prancha do App Cliente", () => {
  it("mantém nome Legado e subtítulo sem limite genealógico", () => {
    expect(COPY_TELAS.legado.titulo).toBe(COPY_TELAS.legado.navegacao);
    expect(COPY_TELAS.arvore.descricao).toBe("As gerações que compõem você.");
  });

  it("usa o mesmo rótulo humano para a microentrega publicada", () => {
    expect(rotuloTipoProjecao("microentrega")).toBe("Da nossa jornada");
  });

  it("não declara ausência de nomes quando há notas da árvore publicadas", () => {
    const fonte = readFileSync("src/routes/portal/arvore.tsx", "utf8");
    expect(fonte).toContain("Os nomes já compartilhados ainda não têm posição disponível nesta árvore.");
    expect(fonte).toContain("geracoesPublicadas.has(geracao.id)");
    expect(fonte).not.toContain("Cinco gerações da sua família");
  });

  it("preserva a correção de português e os alvos de toque", () => {
    expect(readFileSync("src/routes/portal/conta.tsx", "utf8")).toContain("neste espaço.");
    const shell = readFileSync("src/components/portal/portal-shell.tsx", "utf8");
    expect(shell).toContain("min-h-[4rem]");

    /*
      06/10/2026 — a asserção era a classe exata `text-[9px]`, e o Lovable
      subiu o rótulo da aba para 11px na prancha mobile nova. Congelar a
      classe era a asserção errada: 11px é MELHOR no eixo que este teste
      existe para proteger (legibilidade no telefone). Então o teste passou a
      exigir a propriedade — rótulo de aba com pelo menos 10px — em vez do
      valor literal. Abaixo de 10px volta a falhar.
    */
    const tamanhos = [...shell.matchAll(/text-\[(\d+)px\]/g)].map((m) => Number(m[1]));
    expect(tamanhos.length).toBeGreaterThan(0);
    expect(Math.min(...tamanhos)).toBeGreaterThanOrEqual(10);
  });
});