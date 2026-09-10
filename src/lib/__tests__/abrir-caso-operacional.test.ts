import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  PROXIMA_ACAO_ABERTURA,
  SERVICOS_CASO_OPERACIONAL,
  TITULO_PRIMEIRA_TAREFA_CASO,
  validarAberturaCasoOperacional,
} from "@/lib/abrir-caso-operacional";

describe("Abertura de caso operacional", () => {
  it("recusa caso sem cliente, título ou serviço", () => {
    expect(validarAberturaCasoOperacional({}).ok).toBe(false);
    expect(validarAberturaCasoOperacional({ cliente_id: "x" }).erros.join(" ")).toMatch(/título/i);
    expect(
      validarAberturaCasoOperacional({
        cliente_id: "x",
        titulo: "Caso",
        tipo_servico: "inventado",
      }).erros.join(" "),
    ).toMatch(/vocabulário/);
  });

  it("aceita o vocabulário já usado na lista de casos", () => {
    for (const s of SERVICOS_CASO_OPERACIONAL) {
      expect(
        validarAberturaCasoOperacional({
          cliente_id: "cli",
          titulo: "Caso teste",
          tipo_servico: s.valor,
        }).ok,
      ).toBe(true);
    }
  });

  it("a primeira tarefa usa tipo geral, não o valor inválido caso", () => {
    expect(TITULO_PRIMEIRA_TAREFA_CASO.length).toBeGreaterThan(3);
    const fn = readFileSync("src/lib/abrir-caso-operacional.functions.ts", "utf8");
    expect(fn).toContain('tipo: "geral"');
    expect(fn).not.toMatch(/tipo:\s*"caso"/);
    expect(fn).toContain("garantirTarefaAberta");
    expect(fn).toContain("proxima_acao: PROXIMA_ACAO_ABERTURA");
    expect(fn).toContain("registrarTimelineCaso");
    expect(PROXIMA_ACAO_ABERTURA).toMatch(/planejador/i);
  });
});
