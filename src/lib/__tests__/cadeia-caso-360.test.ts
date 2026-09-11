import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ENVIO_AUTOMATICO_HABILITADO } from "../fila-comunicacao";
import {
  caso360Completo,
  montarCadeiaCaso360,
  pecasCaso360,
  produtoPaiCanonico,
} from "../cadeia-caso-360";

describe("cadeia canônica do Caso 360", () => {
  it("legado nunca opera — mesmo com rastro da Planilha Mestre", () => {
    const c = montarCadeiaCaso360({
      legado: { fonteVersao: "v2026-08", fonteLinha: 42 },
    });
    expect(c.legadoOpera).toBe(false);
    expect(c.camadas[0].estado).toBe("legado_somente");
    expect(c.camadas[0].resumo).toContain("Não opera");
  });

  it("lista-alimento é planner_catalog_feed, não a planilha", () => {
    const c = montarCadeiaCaso360({
      listaAlimento: {
        itemId: "CA-DIAG-002",
        productParent: "Diagnóstico de Cidadania por Etapas",
        statusDictionary: "ATIVO_HOMOLOGADO",
      },
    });
    expect(c.camadas[1].estado).toBe("operavel");
    expect(c.camadas[1].resumo).toContain("CA-DIAG-002");
  });

  it("item arquivado na lista-alimento não entra no motor", () => {
    const c = montarCadeiaCaso360({
      listaAlimento: { itemId: "CA-CURSO-001", statusDictionary: "ARQUIVADO_DECISAO_PROPRIETARIA" },
    });
    expect(c.camadas[1].estado).toBe("bloqueado");
  });

  it("catálogo operacional exige homologação — preço não volta da planilha", () => {
    const bloqueado = montarCadeiaCaso360({
      catalogoOperacional: { code: "CA-DIAG-002", statusHomologacao: "em_revisao", elegivelParaProposta: true },
    });
    expect(bloqueado.camadas[2].estado).toBe("bloqueado");
    expect(bloqueado.camadas[2].resumo).toContain("Planilha Mestre");

    const ok = montarCadeiaCaso360({
      catalogoOperacional: {
        code: "CA-DIAG-002",
        nomeComercial: "Diagnóstico",
        statusHomologacao: "homologado",
        elegivelParaProposta: true,
        produtoPai: "Diagnóstico de Cidadania por Etapas",
      },
    });
    expect(ok.camadas[2].estado).toBe("operavel");
  });

  it("Caso 360 só fecha com produto-pai + fase + trilha + itens + condição particular", () => {
    const pecas = pecasCaso360({
      produtoPai: "Diagnóstico de Cidadania por Etapas",
      faseJornada: "aceite_e_formalizacao",
      trilhas: ["Áustria §58c"],
      itens: ["CA-DIAG-002"],
      condicaoParticular: "R$ 9.600 nesta composição familiar",
    });
    expect(caso360Completo(pecas)).toBe(true);
    expect(produtoPaiCanonico(pecas.produtoPai)).toBe(true);

    const incompleto = montarCadeiaCaso360({
      caso: { produtoPai: "Diagnóstico de Cidadania por Etapas", faseJornada: "onboarding" },
    });
    expect(incompleto.camadas[3].estado).toBe("pendente");
    expect(incompleto.camadas[3].resumo).toContain("trilha");
    expect(incompleto.camadas[3].resumo).toContain("condição particular");
  });

  it("App só opera com valor publicado; WhatsApp não dispara sozinho", () => {
    expect(ENVIO_AUTOMATICO_HABILITADO).toBe(false);
    const pendente = montarCadeiaCaso360({
      liberacao: { deskProduziu: 2, appPublicado: 0, whatsappFila: 1, whatsappAprovado: 0 },
    });
    expect(pendente.camadas[4].estado).toBe("pendente");
    expect(pendente.camadas[4].resumo).toContain("sem publicação no App");

    const ok = montarCadeiaCaso360({
      liberacao: { deskProduziu: 2, appPublicado: 1, whatsappFila: 1, whatsappAprovado: 1 },
    });
    expect(ok.camadas[4].estado).toBe("operavel");
    expect(ok.envioAutomaticoWhatsapp).toBe(false);
    expect(ok.camadas[4].resumo).toContain("sem disparo automático");
  });
});

describe("Caso 360 mostra a cadeia no runtime", () => {
  const fn = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
  const ui = readFileSync("src/components/caso/cadeia-caso-360.tsx", "utf8");
  const rota = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("lê case_plans, lista-alimento e projeções — sem tabela nova", () => {
    expect(fn).toContain('eq("case_plans")');
    expect(fn).toContain('eq("planner_catalog_feed")');
    expect(fn).toContain('eq("app_projections")');
    expect(fn).not.toMatch(/citizenship_cases|case_participants/);
  });

  it("a jornada do caso abre pela cadeia, não pela Planilha Mestre", () => {
    expect(rota).toContain("CadeiaCaso360");
    expect(ui).toContain("produto-pai");
    expect(ui).toContain("condição particular");
    expect(ui).not.toMatch(/Planilha Mestre é fonte/i);
  });
});
