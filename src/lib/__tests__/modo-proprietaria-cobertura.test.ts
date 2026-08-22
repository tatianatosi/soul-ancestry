import { describe, expect, it } from "vitest";

import {
  COBERTURA_MODULOS,
  MODULOS_COBERTOS,
  operacaoDoModulo,
  podeOperarModulo,
  REGRAS_GERAIS,
  resumoCobertura,
  validarOperacaoModulo,
} from "@/lib/modo-proprietaria-cobertura";

describe("cobertura obrigatória do modo proprietária", () => {
  it("cobre as dez áreas exigidas, todos com operações e entidade canônica", () => {
    expect(COBERTURA_MODULOS.map((m) => m.id)).toEqual([...MODULOS_COBERTOS]);
    for (const m of COBERTURA_MODULOS) {
      expect(m.operacoes.length).toBeGreaterThan(0);
      expect(m.regras.length).toBeGreaterThan(0);
      for (const o of m.operacoes) expect(o.entidade).toMatch(/\w/);
    }
    expect(resumoCobertura()).toHaveLength(10);
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
      modulo: "app_cliente",
      operacao: "aprovar_projecao_app",
      dados_teste: true,
    });
    expect(v.valida).toBe(false);
    expect(v.erros.join(" ")).toContain("TESTE");
  });

  it("mantém SKU em revisão como override permitido na formalização", () => {
    expect(podeOperarModulo("admin", "formalizacao", "override_sku_em_revisao")).toBe(true);
  });
});

describe("ampliação para todas as áreas do Desk", () => {
  it("inclui comercial/catálogo, caso/dossiê, financeiro e App Cliente como áreas próprias", () => {
    const ids = COBERTURA_MODULOS.map((m) => m.id);
    expect(ids).toContain("comercial_catalogo");
    expect(ids).toContain("caso_dossie");
    expect(ids).toContain("financeiro");
    expect(ids).toContain("app_cliente");
  });

  it("declara a regra geral aplicável a todas as áreas", () => {
    expect(REGRAS_GERAIS.length).toBeGreaterThanOrEqual(6);
    expect(REGRAS_GERAIS.join(" ")).toContain("entidade canônica");
    expect(REGRAS_GERAIS.join(" ")).toContain("RLS");
  });

  it("permite override de SKU em revisão e homologação auditada no catálogo", () => {
    expect(podeOperarModulo("admin", "comercial_catalogo", "selecionar_sku_em_revisao")).toBe(true);
    expect(podeOperarModulo("admin", "comercial_catalogo", "homologar_sku")).toBe(true);
    expect(podeOperarModulo("financeiro", "comercial_catalogo", "homologar_sku")).toBe(false);
  });

  it("mantém cobrança e publicação como confirmação final, nunca operação direta", () => {
    const cobranca = validarOperacaoModulo("admin", { modulo: "financeiro", operacao: "emitir_cobranca" });
    expect(cobranca.valida).toBe(false);
    const publicar = validarOperacaoModulo("admin", { modulo: "app_cliente", operacao: "publicar_no_app_cliente" });
    expect(publicar.valida).toBe(false);
  });

  it("grava correção de caso na entidade canônica crm_casos", () => {
    expect(operacaoDoModulo("caso_dossie", "editar_caso")?.entidade).toBe("crm_casos");
  });
});

describe("regra geral aplicada área a área", () => {
  it("permite vincular plano, revisar Canva, derivar versão congelada e aprovar achado interno", () => {
    expect(operacaoDoModulo("planejador", "vincular_plano")?.entidade).toBe("case_plans");
    expect(operacaoDoModulo("proposta_escopo", "revisar_paginas_canva")?.entidade).toBe("proposal_canva_pages");
    expect(operacaoDoModulo("formalizacao", "derivar_versao_congelada")?.entidade).toBe("contract_versions");
    expect(operacaoDoModulo("pesquisa_operacao", "aprovar_evidencia_interna")?.entidade).toBe(
      "genealogical_findings",
    );
  });

  it("bloqueia qualquer operação do App Cliente sobre dado TESTE/DEMO", () => {
    for (const op of ["editar_projecao_app", "aprovar_projecao_app", "definir_destinatario_visibilidade"]) {
      const r = validarOperacaoModulo("admin", { modulo: "app_cliente", operacao: op, dados_teste: true });
      expect(r.valida).toBe(false);
    }
    expect(
      validarOperacaoModulo("admin", { modulo: "app_cliente", operacao: "aprovar_projecao_app" }).valida,
    ).toBe(true);
  });

  it("nega o modo a qualquer papel que não seja a proprietária, em toda área", () => {
    for (const m of COBERTURA_MODULOS) {
      const op = m.operacoes[0]!.id;
      expect(podeOperarModulo("operacoes", m.id, op)).toBe(false);
      expect(podeOperarModulo("leitura", m.id, op)).toBe(false);
      expect(podeOperarModulo("admin", m.id, op)).toBe(true);
    }
  });
});
