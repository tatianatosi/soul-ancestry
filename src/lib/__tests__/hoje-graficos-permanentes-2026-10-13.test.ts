import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { ritmoSemanal } from "@/lib/golive-operacao";

/*
 * Regra do componente permanente (Proprietária, 13/10/2026): no Hoje, os
 * gráficos da Prancha V4 nunca saem da tela. Sem dado, desenham o estado
 * neutro e dizem "Sem dados suficientes" ao lado — sem fatia ou ponto inventado.
 */
const painel = readFileSync("src/routes/_authenticated/painel.tsx", "utf8");
const kit = readFileSync("src/components/prancha-v4/kit.tsx", "utf8");

describe("Hoje — grade visível e gráficos sempre desenhados", () => {
  it("a grade de blocos não fica escondida atrás de um <details>", () => {
    expect(painel).not.toContain("<details");
    expect(painel).not.toContain("Abrir operação detalhada do dia");
  });

  it("ritmo operacional é gráfico de linha, sem troca por texto quando vazio", () => {
    expect(painel).toContain("<GraficoLinha");
    expect(painel).toContain("data-hoje-ritmo-linha");
    expect(painel).toContain("const ritmo = ritmoSemanal(caso.microentregas, 6);");
    expect(painel).not.toContain("Nenhuma microentrega concluída com data — sem série para mostrar.");
  });

  it("prioridades é rosca com as 4 faixas do CHECK, sem troca por texto quando vazia", () => {
    expect(painel).toContain("<DonutEstados");
    expect(painel).toContain("data-hoje-prioridades-rosca");
    for (const chave of ['"critica"', '"alta"', '"media"', '"baixa"']) expect(painel).toContain(chave);
    expect(painel).not.toContain("Nenhum caso ativo com prioridade registrada.");
  });

  it("estado vazio dos dois gráficos é rotulado 'Sem dados suficientes'", () => {
    expect(painel).toContain("data-hoje-ritmo-vazio");
    expect(painel).toContain("data-hoje-prioridades-vazio");
    expect(painel.match(/Sem dados suficientes/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it("os 4 KPIs da prancha continuam no topo, ligados às mesmas funções", () => {
    for (const r of ["Decisões do dia", "Cadências vencidas", "Casos sem próxima ação", "Microentregas"]) {
      expect(painel).toContain(`rotulo: "${r}"`);
    }
    expect(painel).toContain("kpisHoje(caso.carteira, caso.tarefas)");
  });
});

describe("GraficoLinha do kit", () => {
  it("existe no kit da Prancha V4 e desenha base, linha e pontos sempre", () => {
    expect(kit).toContain("export function GraficoLinha");
    const trecho = kit.slice(kit.indexOf("export function GraficoLinha"), kit.indexOf("export function DonutEstados"));
    expect(trecho).toContain("<polyline");
    expect(trecho).toContain("<circle");
    expect(trecho).not.toContain("return null");
  });

  it("série sem microentrega concluída tem 6 semanas, todas em zero — nada inventado", () => {
    const serie = ritmoSemanal([], 6, new Date("2026-10-13T12:00:00Z"));
    expect(serie).toHaveLength(6);
    expect(serie.every((s) => s.valor === 0)).toBe(true);
  });
});
