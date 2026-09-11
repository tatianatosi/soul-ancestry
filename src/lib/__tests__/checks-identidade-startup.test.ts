import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  CHECKS_ATIVACAO_IDENTIDADE,
  ehCheckAtivacaoIdentidade,
  ehItemOnboardingIdentidade,
  filtrarChecksAtivacaoOperacionais,
  filtrarItensOnboardingOperacionais,
} from "@/lib/checks-identidade-startup";

describe("checks de identidade — sem tick cerimonial", () => {
  it("reconhece responsável e aprovação interna como identidade", () => {
    expect(ehCheckAtivacaoIdentidade("responsavel_designado")).toBe(true);
    expect(ehCheckAtivacaoIdentidade("aprovacao_interna_ativacao")).toBe(true);
    expect(ehCheckAtivacaoIdentidade("contrato_assinado_ou_isencao_autorizada")).toBe(false);
    expect(CHECKS_ATIVACAO_IDENTIDADE).toContain("responsavel_designado");
  });

  it("filtra checks de ativação operacionais", () => {
    const lista = filtrarChecksAtivacaoOperacionais([
      { check_key: "responsavel_designado" },
      { check_key: "contrato_assinado_ou_isencao_autorizada" },
      { check_key: "aprovacao_interna_ativacao" },
    ]);
    expect(lista.map((c) => c.check_key)).toEqual(["contrato_assinado_ou_isencao_autorizada"]);
  });

  it("filtra itens de onboarding de responsável", () => {
    expect(ehItemOnboardingIdentidade("responsavel_principal")).toBe(true);
    const lista = filtrarItensOnboardingOperacionais([
      { item_code: "responsavel_principal", label: "Responsável principal definido" },
      { item_code: "dossie_mae", label: "Dossiê-mãe" },
    ]);
    expect(lista).toHaveLength(1);
    expect(lista[0]!.item_code).toBe("dossie_mae");
  });

  it("não semeia mais contratada no checklist cadastral", () => {
    const src = readFileSync("src/lib/cadastro-checklist.functions.ts", "utf8");
    expect(src).not.toContain('tipo: "contratada"');
    expect(src).not.toContain("Clube Ancestral (contratada)");
  });

  it("UI de cadastro esconde grupo contratada", () => {
    const ui = readFileSync("src/components/caso/cadastro-checklist.tsx", "utf8");
    expect(ui).toContain('pessoa_tipo !== "contratada"');
  });

  it("onboarding carrega com auto-satisfação e filtro", () => {
    const onb = readFileSync("src/lib/onboarding.functions.ts", "utf8");
    expect(onb).toContain("autoSatisfazerChecksIdentidade");
    expect(onb).toContain("filtrarChecksAtivacaoOperacionais");
  });

  it("fechamento não abre tarefa de perfil institucional", () => {
    const ui = readFileSync("src/components/caso/fechamento.tsx", "utf8");
    expect(ui).toContain('g.chave !== "perfil_institucional"');
  });
});
