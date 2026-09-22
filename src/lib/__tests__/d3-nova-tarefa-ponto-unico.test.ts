import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * §13 do De-Para: a faixa "Trabalho dos casos" carrega filtros e a ação
 * "Nova tarefa", e a regra é: "Um único ponto de criação". Antes o botão
 * só existia na aba Fila — o Kanban ficava sem meio de criar tarefa, e
 * quem entrasse pelo Kanban tinha que trocar de aba.
 */
const arquivo = readFileSync("src/components/ops/desk-operacional.tsx", "utf8");

describe("Nova tarefa vive na faixa compartilhada, não numa aba só", () => {
  it("o botão canônico está na faixa de filtros, identificável", () => {
    expect(arquivo).toContain("data-nova-tarefa-faixa");
    expect(arquivo).toContain("+ Nova tarefa");
  });

  it("não há mais botão 'Nova tarefa' duplicado na aba Fila", () => {
    const fila = arquivo.slice(
      arquivo.indexOf('{aba === "fila" && ('),
      arquivo.indexOf('{aba === "kanban" &&'),
    );
    // Um único ponto de criação — o botão daqui foi removido.
    expect(fila).not.toContain("setNovaTarefa(true)");
    expect(fila).not.toContain(">Nova tarefa<");
  });

  it("um único callback setNovaTarefa(true) em toda a rota", () => {
    const ocorrencias = arquivo.match(/setNovaTarefa\(true\)/g) ?? [];
    expect(ocorrencias.length).toBe(1);
  });
});
