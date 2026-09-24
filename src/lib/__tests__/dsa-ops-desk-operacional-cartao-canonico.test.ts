import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Continuação de DSA-10 (Painel → CaCard canônico), família Ops:
 * src/components/ops/desk-operacional.tsx era o único arquivo restante
 * dessa família (ops-excecoes.tsx já migrado). Mesmo mecanismo mecânico
 * dos cortes anteriores.
 */

const ARQUIVO = "src/components/ops/desk-operacional.tsx";
const arquivo = readFileSync(ARQUIVO, "utf8");

describe("ops/desk-operacional.tsx — migrado para CaCard canônico", () => {
  it("não usa mais Painel de @/components/comercial/base", () => {
    expect(arquivo).not.toMatch(/<Painel[\s>]/);
    expect(arquivo).not.toContain("</Painel>");
    expect(arquivo).not.toMatch(/import\s*\{[^}]*\bPainel\b/);
  });

  it("importa CaCard e usa variante compacto nos 5 blocos", () => {
    expect(arquivo).toContain('import { CaCard } from "@/components/ui/ca-card";');
    expect(arquivo.match(/<CaCard variante="compacto"/g)?.length).toBe(5);
  });

  it("preserva os 5 rótulos (Carga por responsável, Fila de trabalho, Micro-entregas, Calendário de prazos, SLA)", () => {
    expect(arquivo).toContain('titulo="Carga por responsável"');
    expect(arquivo).toContain('titulo="Fila de trabalho"');
    expect(arquivo).toContain('titulo="Micro-entregas"');
    expect(arquivo).toContain('titulo="Calendário de prazos"');
    expect(arquivo).toContain('titulo="SLA por tipo de tarefa e prioridade"');
  });
});
