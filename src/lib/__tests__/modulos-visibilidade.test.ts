import { describe, expect, it } from "vitest";

import {
  MODULOS_DESK,
  TELAS_PRINCIPAIS_DESK,
  bibliotecaAlcanca,
  casos360Alcanca,
  modulosDaTela,
  moduloEhAbaPrincipal,
} from "@/lib/desk-modulos";
import {
  ESCOPO_ANA,
  ESCOPO_DIAGNOSTICO_ISOLADO,
  ESCOPO_JOAO,
  TELAS_SEMPRE_DISPONIVEIS,
  TELA_APP_LABEL,
  ehEntrega,
  nomeComercialParaCliente,
  visibilidadeTela,
} from "@/lib/app-visibilidade";

describe("Desk — módulos contextuais", () => {
  it("1. nenhum módulo profundo vira aba principal", () => {
    expect(MODULOS_DESK.every((m) => !moduloEhAbaPrincipal(m.id))).toBe(true);
    expect(TELAS_PRINCIPAIS_DESK).toHaveLength(7);
  });

  it("2. Casos 360 alcança pesquisa, proposta, formalização e onboarding", () => {
    expect(casos360Alcanca("pesquisa")).toBe(true);
    expect(casos360Alcanca("proposta")).toBe(true);
    expect(casos360Alcanca("formalizacao")).toBe(true);
    expect(casos360Alcanca("onboarding")).toBe(true);
  });

  it("3. Biblioteca Mestre alcança fontes, catálogo, glossário e modelos", () => {
    expect(bibliotecaAlcanca("fontes")).toBe(true);
    expect(bibliotecaAlcanca("catalogo")).toBe(true);
    expect(bibliotecaAlcanca("glossario")).toBe(true);
    expect(bibliotecaAlcanca("modelos")).toBe(true);
  });

  it("4. assistente é painel lateral", () => {
    const [assistente] = modulosDaTela("assistente");
    expect(assistente?.forma).toBe("lateral");
  });
});

describe("App Cliente — visibilidade progressiva", () => {
  it("5. telas base permanecem acessíveis", () => {
    for (const t of TELAS_SEMPRE_DISPONIVEIS) {
      expect(visibilidadeTela(t, ESCOPO_DIAGNOSTICO_ISOLADO).navegavel).toBe(true);
      expect(visibilidadeTela(t, ESCOPO_DIAGNOSTICO_ISOLADO).estado).toBe("always_available");
    }
    expect(Object.keys(TELA_APP_LABEL)).toHaveLength(10);
  });

  it("6. Entregas vazia mostra estado de preparação sem prazo", () => {
    const v = visibilidadeTela("entrega", ESCOPO_ANA);
    expect(v.estado).toBe("available_empty");
    expect(v.mensagem).toBe("Sua próxima entrega está em preparação.");
    expect(v.mensagem).not.toMatch(/\d{1,2}\/\d{1,2}|dias|prazo/i);
  });

  it("6b. Fase 01 e Fase 02 obedecem escopo e estado", () => {
    expect(visibilidadeTela("relatorio", ESCOPO_ANA).estado).toBe("in_preparation");
    expect(visibilidadeTela("fase02", ESCOPO_ANA).estado).toBe("contracted_not_released");
    expect(visibilidadeTela("relatorio", ESCOPO_JOAO).estado).toBe("released");
    expect(visibilidadeTela("fase02", ESCOPO_JOAO).estado).toBe("in_preparation");
    expect(visibilidadeTela("fase02", ESCOPO_DIAGNOSTICO_ISOLADO).estado).toBe("not_applicable");
  });

  it("7. Ana e João não recebem upsell de Fase 02", () => {
    expect(visibilidadeTela("fase02", ESCOPO_ANA).permiteUpsell).toBe(false);
    expect(visibilidadeTela("fase02", ESCOPO_JOAO).permiteUpsell).toBe(false);
    expect(visibilidadeTela("fase02", ESCOPO_DIAGNOSTICO_ISOLADO).permiteUpsell).toBe(false);
  });

  it("8. dados internos não aparecem: SKU nunca é rótulo do cliente", () => {
    expect(
      nomeComercialParaCliente({ nomeComercial: "Pesquisa Ancestral", sku: "CA-CID-AT-001" }),
    ).toBe("Pesquisa Ancestral");
    expect(nomeComercialParaCliente({ sku: "CA-CID-AT-001", fase: "Fase 01" })).toBe("Fase 01");
  });

  it("taxonomia: próxima ação não é entrega", () => {
    expect(ehEntrega("proxima_acao")).toBe(false);
    expect(ehEntrega("relatorio_f1")).toBe(true);
    expect(ehEntrega("microentrega")).toBe(true);
  });
});

import { crmVivoAlcanca } from "@/lib/desk-modulos";

describe("rotas contextuais citadas (CRM/Casos/App)", () => {
  it("CRM Vivo alcança Propostas sem virar aba nova", () => {
    expect(crmVivoAlcanca("propostas")).toBe(true);
  });
  it("Casos 360 alcança Formalização e Fechamento (ex-Go-live)", () => {
    expect(casos360Alcanca("formalizacao")).toBe(true);
    expect(casos360Alcanca("go_live")).toBe(true);
  });
});
