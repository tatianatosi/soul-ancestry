import { describe, expect, it } from "vitest";

import {
  decidirAcao,
  deveDesabilitar,
  ehAcaoExterna,
  ehProprietaria,
  rotuloDecisao,
} from "../autoridade-operacional";

const proprietaria = { papeis: ["admin"], organizationId: "org-1" };
const leitura = { papeis: ["leitura"], organizationId: "org-1" };

describe("autoridade operacional", () => {
  it("reconhece a proprietária administradora", () => {
    expect(ehProprietaria(["admin"])).toBe(true);
    expect(ehProprietaria(["leitura", "comercial"])).toBe(false);
  });

  it("libera operação interna da proprietária sem confirmação", () => {
    const r = decidirAcao(proprietaria, { capacidade: "editar_rascunho" });
    expect(r.decisao).toBe("permitir");
    expect(deveDesabilitar(r)).toBe(false);
    expect(rotuloDecisao(r)).toBeNull();
  });

  // Retificação de 18/10/2026 (07d98d94): para a proprietária administradora a
  // operação interna é permitida direto; a pendência segue visível como aviso.
  it("nunca bloqueia a proprietária por gate de domínio: permite e mantém a pendência como aviso", () => {
    const r = decidirAcao(proprietaria, {
      capacidade: "avancar_caso_planejador_tarefa",
      pendenciaGate: "Contrato ainda não assinado.",
    });
    expect(r.decisao).toBe("permitir");
    expect(deveDesabilitar(r)).toBe(false);
    expect(r.porDecisaoDaProprietaria).toBe(true);
    expect(r.exigeMotivo).toBe(false);
    expect(r.pendencia).toBe("Contrato ainda não assinado.");
  });

  it("mantém o gate bloqueante para quem não é proprietária", () => {
    const r = decidirAcao(leitura, { pendenciaGate: "Contrato ainda não assinado." });
    expect(r.decisao).toBe("bloquear");
    expect(deveDesabilitar(r)).toBe(true);
  });

  it("exige confirmação explícita em ação externa, inclusive para a proprietária", () => {
    const r = decidirAcao(proprietaria, { acaoExterna: "enviar_contrato" });
    expect(r.decisao).toBe("confirmar");
    expect(r.exigeMotivo).toBe(true);
    expect(deveDesabilitar(r)).toBe(false);
  });

  it("classifica ações externas conhecidas", () => {
    expect(ehAcaoExterna("enviar_whatsapp")).toBe(true);
    expect(ehAcaoExterna("editar_rascunho")).toBe(false);
  });

  it("bloqueia apenas por falta de identidade ou organização", () => {
    expect(decidirAcao({ papeis: [], organizationId: "org-1" }, {}).decisao).toBe("bloquear");
    expect(decidirAcao({ papeis: ["admin"], organizationId: null }, {}).decisao).toBe("bloquear");
    expect(
      decidirAcao({ papeis: ["admin"], organizationId: "org-1", carregando: true }, {}).decisao,
    ).toBe("bloquear");
  });

  it("todo bloqueio traz motivo legível", () => {
    const r = decidirAcao({ papeis: [], organizationId: null }, {});
    expect(r.motivo.length).toBeGreaterThan(20);
  });
});
