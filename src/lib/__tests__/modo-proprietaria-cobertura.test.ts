import { describe, expect, it } from "vitest";

import {
  COBERTURA_MODULOS,
  MODULOS_COBERTOS,
  operacaoDoModulo,
  podeOperarModulo,
  resumoCobertura,
  validarOperacaoModulo,
} from "@/lib/modo-proprietaria-cobertura";

describe("cobertura obrigatória do modo proprietária", () => {
  it("cobre os sete módulos exigidos, todos com operações e entidade canônica", () => {
    expect(COBERTURA_MODULOS.map((m) => m.id)).toEqual([...MODULOS_COBERTOS]);
    for (const m of COBERTURA_MODULOS) {
      expect(m.operacoes.length).toBeGreaterThan(0);
      expect(m.regras.length).toBeGreaterThan(0);
      for (const o of m.operacoes) expect(o.entidade).toMatch(/\w/);
    }
    expect(resumoCobertura()).toHaveLength(7);
  });

  it("libera operação interna só para a proprietária", () => {
    expect(podeOperarModulo("admin", "planejador", "avancar_plano_incompleto")).toBe(true);
    expect(podeOperarModulo("operacoes", "planejador", "avancar_plano_incompleto")).toBe(false);
    expect(podeOperarModulo("admin", "planejador", "inexistente")).toBe(false);
  });

  it("resolve a entidade canônica da operação do Painel Hoje", () => {
    expect(operacaoDoModulo("painel_hoje", "corrigir_responsavel")?.entidade).toBe("tarefas");
    const v = validarOperacaoModulo("admin", { modulo: "painel_hoje", operacao: "corrigir_prazo" });
    expect(v.valida).toBe(true);
    expect(v.entidade).toBe("tarefas");
  });

  it("recusa ação externa fora da janela final de confirmação", () => {
    const v = validarOperacaoModulo("admin", {
      modulo: "formalizacao",
      operacao: "solicitar_assinatura",
    });
    expect(v.valida).toBe(false);
    expect(v.erros.join(" ")).toContain("confirmação");
  });

  it("nunca aprova projeção do App Cliente com dado TESTE/DEMO", () => {
    const v = validarOperacaoModulo("admin", {
      modulo: "financeiro_app_cliente",
      operacao: "aprovar_projecao_app",
      dados_teste: true,
    });
    expect(v.valida).toBe(false);
    expect(v.erros.join(" ")).toContain("TESTE/DEMO");
  });

  it("mantém SKU em revisão como override permitido na formalização", () => {
    expect(podeOperarModulo("admin", "formalizacao", "override_sku_em_revisao")).toBe(true);
  });
});
