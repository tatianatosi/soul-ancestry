import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * §16 linha 7 do De-Para (Desk — Radar & Matrizes, "Lista de situação" —
 * Situação, Prioridade, Urgência, Elegibilidade, Responsável). A matriz
 * visual e o Radar Individual já existiam; faltava a lista tabular, que
 * lê os MESMOS casos já posicionados pelo motor (`posicionar`) — nenhum
 * cálculo novo, nenhuma query nova.
 */

const conectada = readFileSync("src/components/desk/matriz-prioridades-conectada.tsx", "utf8");
const posicionamento = readFileSync("src/lib/matriz-posicionamento.ts", "utf8");
const grade = readFileSync("src/components/desk/matriz-prioridades.tsx", "utf8");

describe("MatrizPrioridadesConectada — Lista de situação (§16 linha 7)", () => {
  it("renderiza a seção com as 5 colunas do wireframe", () => {
    expect(conectada).toContain("data-radar-lista-situacao");
    expect(conectada).toContain(">Situação<");
    expect(conectada).toContain(">Prioridade<");
    expect(conectada).toContain(">Urgência<");
    expect(conectada).toContain(">Elegibilidade<");
    expect(conectada).toContain(">Responsável<");
  });

  it("cada linha é clicável e chama o mesmo onSelecionarCaso da matriz visual", () => {
    expect(conectada).toContain("data-radar-lista-item={caso.id}");
    expect(conectada).toContain("onClick={onSelecionarCaso ? () => onSelecionarCaso(caso.id) : undefined}");
  });

  it("lê status/responsável da linha crua já carregada — sem useQuery/useServerFn novo", () => {
    const antes = conectada.split("data-radar-lista-situacao")[0]!;
    const useQueryCount = (antes.match(/useQuery\(/g) ?? []).length;
    expect(useQueryCount).toBe(1); // a mesma query de crm_casos já existente
    expect(conectada).toContain('bruto?.["status"]');
    expect(conectada).toContain('bruto?.["proxima_acao_responsavel"]');
  });

  it("não inventa vocabulário: usa ROTULO_URGENCIA/ROTULO_ELEGIBILIDADE exportados de matriz-posicionamento (fonte única, sem 2ª cópia)", () => {
    expect(posicionamento).toContain("export const ROTULO_ELEGIBILIDADE");
    expect(posicionamento).toContain("export const ROTULO_URGENCIA");
    expect(conectada).toContain('posicionar, ROTULO_ELEGIBILIDADE, ROTULO_URGENCIA } from "@/lib/matriz-posicionamento"');
  });

  it("a grade (MatrizPrioridades) passa a importar os mesmos rótulos, sem manter 2ª cópia local", () => {
    expect(grade).not.toMatch(/^const ROTULO_ELEGIBILIDADE/m);
    expect(grade).not.toMatch(/^const ROTULO_FAIXA/m);
    expect(grade).toContain("ROTULO_ELEGIBILIDADE,");
    expect(grade).toContain('ROTULO_URGENCIA as ROTULO_FAIXA,');
  });
});
