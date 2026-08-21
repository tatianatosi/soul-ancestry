import { describe, expect, it } from "vitest";

import { compararPersistencia } from "@/lib/verificacao-persistencia";
import { CODIGOS_PERSISTENCIA, classificarErroPersistencia } from "@/lib/persistencia-erros";
import { ehFixtureLinha, semFixtures, FIXTURE_ORIGIN } from "@/lib/fixtures";
import { ehCampoSensivel, mascararValor } from "@/lib/persistencia-mascara";
import { exigirProximaAcaoCompleta } from "@/lib/proxima-acao-regras";
import { MAPA_PERSISTENCIA, campoMapeado } from "@/lib/persistencia-caso";
import { limparCamposDeControle } from "@/lib/persistencia.server";


describe("ANA-SAVE-SEC-01B — persistência da Aba Casos", () => {
  it("1. campo alterado e salvo é confirmado pela releitura", () => {
    const r = compararPersistencia({ titulo: "Caso Ana" }, { titulo: "Caso Ana", pais: "AT" });
    expect(r).toHaveLength(0);
  });

  it("2. divergência entre enviado e gravado é detectada", () => {
    const r = compararPersistencia({ titulo: "Novo" }, { titulo: "Antigo" });
    expect(r.map((d) => d.campo)).toContain("titulo");
  });

  it("3. campo não mapeado retorna código estável", () => {
    const c = classificarErroPersistencia(new Error(CODIGOS_PERSISTENCIA.NAO_MAPEADO));
    expect(c.codigo).toBe(CODIGOS_PERSISTENCIA.NAO_MAPEADO);
    expect(c.titulo).toMatch(/não mapeado/i);
  });

  it("4. bloqueio por permissão vira erro explícito, não sucesso silencioso", () => {
    const c = classificarErroPersistencia(new Error(CODIGOS_PERSISTENCIA.SEM_LINHA));
    expect([CODIGOS_PERSISTENCIA.SEM_LINHA, CODIGOS_PERSISTENCIA.PERMISSAO]).toContain(c.codigo);
  });

  it("5. próxima ação incompleta é rejeitada no servidor", () => {
    expect(() =>
      exigirProximaAcaoCompleta({
        proxima_acao_codigo: "enviar_contrato",
        prazo_proxima_acao: null,
        responsavel_principal: null,
      }),
    ).toThrow();
  });

  it("6. ação externa exige aprovação humana", () => {
    expect(() =>
      exigirProximaAcaoCompleta({
        proxima_acao_codigo: "enviar_contrato",
        prazo_proxima_acao: "2026-03-01",
        responsavel_principal: "Tatiana",
        target_audience: "cliente",
        visibility: "externo",
        suggested_channel: "email",
        requires_human_approval: false,
      }),
    ).toThrow();
  });

  it("7. auditoria mascara campos sensíveis", () => {
    expect(ehCampoSensivel("cpf")).toBe(true);
    expect(ehCampoSensivel("titulo")).toBe(false);
    expect(mascararValor("12345678900")).not.toContain("345678");
  });

  it("8. fixtures ficam fora de listas operacionais e são identificáveis", () => {
    const linhas = [
      { id: "a", data_origin: FIXTURE_ORIGIN },
      { id: "b", data_origin: "desk_manual" },
    ];
    expect(ehFixtureLinha(linhas[0]!)).toBe(true);
    expect(semFixtures(linhas).map((l) => l.id)).toEqual(["b"]);
  });

  it("9. o mapa formal cobre os campos editáveis e marca somente leitura", () => {
    expect(campoMapeado("crm_casos", "titulo")).toBe(true);
    expect(campoMapeado("crm_casos", "campo_inexistente")).toBe(false);
    const codigo = MAPA_PERSISTENCIA.find((l) => l.coluna === "codigo");
    expect(codigo?.estado).toBe("somente_leitura");
  });

  it("10. campos de controle nunca vêm da tela", () => {
    const limpo = limparCamposDeControle({
      titulo: "Caso Ana",
      updated_by: "atacante",
      organization_id: "outra-org",
      data_origin: "real",
      vazio: undefined,
    });
    expect(limpo).toEqual({ titulo: "Caso Ana" });
  });
});

