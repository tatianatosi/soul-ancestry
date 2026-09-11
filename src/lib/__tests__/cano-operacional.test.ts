import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  ELOS_CANO,
  faseCanonicaDaListaAlimento,
  resumirCano,
} from "@/lib/cano-operacional";

describe("cano-operacional — de-para F1…F7 → fase_jornada", () => {
  it("traduz F1–F7 para valores do CHECK case_plans_fase_chk", () => {
    expect(faseCanonicaDaListaAlimento("F1")).toBe("aceite_e_formalizacao");
    expect(faseCanonicaDaListaAlimento("F2")).toBe("preparacao_documental");
    expect(faseCanonicaDaListaAlimento("f3")).toBe("pesquisa_e_validacao");
    expect(faseCanonicaDaListaAlimento("F7")).toBe("pos_reconhecimento");
  });

  it("não inventa fase fora da lista-alimento", () => {
    expect(faseCanonicaDaListaAlimento("em_pesquisa")).toBeNull();
    expect(faseCanonicaDaListaAlimento("")).toBeNull();
    expect(faseCanonicaDaListaAlimento(null)).toBeNull();
  });
});

describe("cano-operacional — resumirCano", () => {
  it("expose os 7 elos na ordem do diagrama confirmado", () => {
    expect([...ELOS_CANO]).toEqual([
      "legado",
      "lista_alimento",
      "catalogo_planejador",
      "caso_360",
      "desk_libera",
      "app_autorizado",
      "whatsapp_manual",
    ]);
  });

  it("próximo passo aponta ao elo quebrado mais cedo", () => {
    const semServico = resumirCano({
      temItemListaAlimento: true,
      produtoPai: "PP-01",
      caseServiceId: null,
      casePlanId: null,
      faseJornada: null,
      projecoesPublicadas: 0,
      alertasAbertos: 0,
    });
    expect(semServico.proximoPassoDesk).toMatch(/produto-pai/i);
    expect(semServico.elos.caso_360.estado).toBe("ausente");

    const semPlano = resumirCano({
      temItemListaAlimento: true,
      produtoPai: "Diagnóstico",
      caseServiceId: "svc-1",
      casePlanId: null,
      faseJornada: null,
      projecoesPublicadas: 0,
      alertasAbertos: 0,
    });
    expect(semPlano.proximoPassoDesk).toMatch(/plano/i);
    expect(semPlano.elos.caso_360.estado).toBe("parcial");

    const semApp = resumirCano({
      temItemListaAlimento: true,
      produtoPai: "Diagnóstico",
      caseServiceId: "svc-1",
      casePlanId: "plan-1",
      faseJornada: "onboarding",
      projecoesPublicadas: 0,
      alertasAbertos: 0,
    });
    expect(semApp.proximoPassoDesk).toMatch(/Biblioteca/i);
    expect(semApp.elos.desk_libera.estado).toBe("parcial");
    expect(semApp.elos.app_autorizado.estado).toBe("ausente");
  });

  it("WhatsApp nunca é ok de envio — só parcial com alerta", () => {
    const comAlerta = resumirCano({
      temItemListaAlimento: true,
      produtoPai: "X",
      caseServiceId: "s",
      casePlanId: "p",
      faseJornada: "onboarding",
      projecoesPublicadas: 1,
      alertasAbertos: 2,
    });
    expect(comAlerta.elos.whatsapp_manual.estado).toBe("parcial");
    expect(comAlerta.proximoPassoDesk).toMatch(/WhatsApp/i);
  });
});

describe("cano-operacional — fiação vertical (escritores + UI)", () => {
  const casoFn = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
  const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
  const card = readFileSync("src/components/caso/cano-operacional.tsx", "utf8");

  it("salvarCaseService amarra case_plans sem inventar tabela", () => {
    expect(casoFn).toContain("amarrarServicoAoPlanejador");
    expect(casoFn).toContain('.from("case_plans")');
    expect(casoFn).toContain("journey_phase_default");
    expect(casoFn).toContain('status: "rascunho"');
    expect(casoFn).not.toMatch(/create table|case_pipeline|cano_elos/i);
  });

  it("carregarCanonico devolve resumo do cano via resumirCano", () => {
    expect(casoFn).toContain("resumirCano");
    expect(casoFn).toContain("cano,");
    expect(casoFn).toContain("planoAtivo");
  });

  it("Caso 360 mostra CardCanoOperacional na jornada", () => {
    expect(pagina).toContain("CardCanoOperacional");
    expect(card).toContain("Cano operacional");
    expect(card).toContain("/biblioteca-evidencias/$caseId");
    expect(card).toContain("/biblioteca-mensagens");
  });
});
