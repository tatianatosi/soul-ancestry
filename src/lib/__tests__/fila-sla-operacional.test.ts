import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ler = (p: string) => readFileSync(p, "utf8");

/**
 * 27/08/2026 — "o que é operacional pode ir pro painel hoje... mas veja a
 * sobreposição... isso iria lá pro painel hoje" (Proprietária), sobre o
 * Kanban de tarefas/micro-entregas em /ops. Mesma leitura de /ops
 * (alertasOps), sem cálculo paralelo; mora dentro do bloco "Exceções que
 * exigem dono" já aprovado — não é um sexto bloco (CA-UX-02 §6 trava 5).
 */
describe("Fila SLA operacional no Painel Hoje", () => {
  it("reusa alertasOps de /ops — não recalcula SLA", () => {
    const comp = ler("src/components/ops/fila-sla-operacional.tsx");
    expect(comp).toContain('from "@/lib/ops.functions"');
    expect(comp).toContain("alertasOps");
  });

  it("mora dentro do bloco Exceções, não cria bloco próprio", () => {
    const painel = ler("src/components/painel/painel-dia.tsx");
    const inicio = painel.indexOf('data-painel-bloco="excecoes"');
    const fim = painel.indexOf('data-painel-bloco="comercial"');
    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    const blocoExcecoes = painel.slice(inicio, fim);
    expect(blocoExcecoes).toContain("<FilaSlaOperacional");
    expect(painel).not.toContain('data-painel-bloco="sla"');
    expect(painel).not.toContain('data-painel-bloco="ops"');
  });
});
