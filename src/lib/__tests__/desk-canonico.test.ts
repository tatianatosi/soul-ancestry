import { describe, expect, it } from "vitest";

import {
  EVENTOS_FUNIL,
  avaliarCadencia,
  avaliarGatesOnboarding,
  derivarStatusCaso,
  efeitosLiberados,
  encontrarDuplicado,
  eventoSensivel,
  normalizarTelefone,
  proximaAcaoPadrao,
  validarConversa,
  validarEvento,
  visivelNoAppCliente,
} from "@/lib/desk-canonico";

const gatesCompletos = {
  contrato_assinado: true,
  pagamento_inicial_confirmado: true,
  responsavel_principal: "Tatiana Melani Tosi",
  nucleo_validado: true,
  representacao_necessaria: false,
  representacao_documentada: false,
  dossie_mae_referencia_interna: "DOSSIE-INT-001",
  case_service_id: "cs-1",
  checklist_criado: true,
  plano_criado: true,
  acesso_definido: true,
};

describe("eventos de funil", () => {
  it("mantém a lista fechada de 16 marcos", () => {
    expect(EVENTOS_FUNIL).toHaveLength(16);
    expect(EVENTOS_FUNIL).toContain("aceite_verbal_confirmado");
    expect(EVENTOS_FUNIL).toContain("confirmacao_formal_recebida");
  });

  it("recusa evento fora da lista", () => {
    const erros = validarEvento({
      tipo_evento: "cliente_ativo_livre",
      ocorreu_em: "2026-08-21T10:00:00Z",
      responsavel_user_id: "u1",
      evidencia_referencia_interna: "conv-1",
      confirmado: true,
    });
    expect(erros.some((e) => e.campo === "tipo_evento")).toBe(true);
  });

  it("exige evidência e confirmação humana em evento sensível", () => {
    expect(eventoSensivel("aceite_verbal_confirmado")).toBe(true);
    const erros = validarEvento({
      tipo_evento: "contrato_assinado",
      ocorreu_em: "2026-08-21T10:00:00Z",
      responsavel_user_id: "u1",
      evidencia_referencia_interna: "",
    });
    expect(erros.map((e) => e.campo)).toEqual(
      expect.arrayContaining(["evidencia_referencia_interna", "confirmado"]),
    );
  });

  it("aceite verbal só gera registro interno e pedido de confirmação formal", () => {
    expect(efeitosLiberados("aceite_verbal_confirmado")).toEqual([
      "registro_interno",
      "proxima_acao_confirmacao_formal",
    ]);
    expect(proximaAcaoPadrao("aceite_verbal_confirmado")).toMatch(/confirmação formal/i);
  });

  it("confirmação formal libera apenas preparação interna", () => {
    expect(efeitosLiberados("confirmacao_formal_recebida")).toEqual([
      "preparacao_interna_formalizacao",
    ]);
  });
});

describe("conversas", () => {
  it("exige tipo, data, resumo, responsável, ação, prazo e vínculo", () => {
    const erros = validarConversa({});
    expect(erros.map((e) => e.campo)).toEqual(
      expect.arrayContaining([
        "tipo",
        "ocorreu_em",
        "resumo_validado",
        "responsavel_user_id",
        "proxima_acao",
        "prazo_proxima_acao",
        "vinculo",
      ]),
    );
  });

  it("aceita conversa completa vinculada a uma oportunidade", () => {
    expect(
      validarConversa({
        tipo: "whatsapp_registrado",
        direcao: "inbound",
        ocorreu_em: "2026-08-21T10:00:00Z",
        resumo_validado: "Cliente confirmou interesse no núcleo familiar.",
        responsavel_user_id: "u1",
        proxima_acao: "Solicitar confirmação formal por escrito",
        prazo_proxima_acao: "2026-08-24",
        opportunity_id: "op-1",
      }),
    ).toEqual([]);
  });
});

describe("gates de onboarding", () => {
  it("contrato e pagamento não bastam", () => {
    const r = avaliarGatesOnboarding({
      contrato_assinado: true,
      pagamento_inicial_confirmado: true,
    });
    expect(r.liberado).toBe(false);
    expect(r.pendencias.length).toBeGreaterThan(0);
  });

  it("libera apenas com todos os gates", () => {
    expect(avaliarGatesOnboarding(gatesCompletos).liberado).toBe(true);
  });

  it("bloqueia quando a representação necessária não está documentada", () => {
    const r = avaliarGatesOnboarding({ ...gatesCompletos, representacao_necessaria: true });
    expect(r.liberado).toBe(false);
    expect(r.pendencias.join(" ")).toMatch(/Representação/);
  });
});

describe("estado derivado do caso", () => {
  it("aceite verbal não cria cliente ativo", () => {
    expect(derivarStatusCaso({ eventos: ["aceite_verbal_confirmado"], gates: {} })).toBe(
      "aceite_confirmado_formalizacao_pendente",
    );
  });

  it("confirmação formal com bloqueios mantém pré-onboarding bloqueado (caso Ana)", () => {
    expect(
      derivarStatusCaso({
        eventos: [
          "aceite_verbal_confirmado",
          "confirmacao_formal_recebida",
          "formalizacao_em_preparacao",
        ],
        gates: { contrato_assinado: false, pagamento_inicial_confirmado: false },
      }),
    ).toBe("pre_onboarding_bloqueado");
  });

  it("caso ativo exige gates completos", () => {
    expect(derivarStatusCaso({ eventos: ["caso_ativo"], gates: {} })).not.toBe("ativo");
    expect(derivarStatusCaso({ eventos: ["caso_ativo"], gates: gatesCompletos })).toBe("ativo");
  });
});

describe("cadência e sanitização", () => {
  it("D10 é atenção e D14 é crítico, sempre sem envio externo", () => {
    expect(avaliarCadencia(10).estado).toBe("atencao");
    const critico = avaliarCadencia(15);
    expect(critico.estado).toBe("critico");
    expect(critico.envioExterno).toBe(false);
  });

  it("espera externa justificada suspende o alerta", () => {
    expect(avaliarCadencia(20, true).estado).toBe("regular");
  });

  it("somente entrega publicada aparece no App Cliente", () => {
    expect(visivelNoAppCliente({ approval_status: "aprovado" })).toBe(false);
    expect(visivelNoAppCliente({ approval_status: "publicado" })).toBe(true);
    expect(visivelNoAppCliente({ approval_status: "publicado", archived_at: "2026-01-01" })).toBe(
      false,
    );
  });
});

describe("deduplicação de contatos", () => {
  it("normaliza telefone", () => {
    expect(normalizarTelefone("+55 (11) 99999-8888")).toBe("11999998888");
  });

  it("encontra duplicado por telefone e por e-mail", () => {
    const existentes = [{ id: "c1", telefone: "11999998888", email: "ana@example.com" }];
    expect(encontrarDuplicado({ telefone: "+55 11 99999-8888" }, existentes).motivo).toBe(
      "telefone_normalizado",
    );
    expect(encontrarDuplicado({ email: "ANA@example.com " }, existentes).motivo).toBe("email");
    expect(encontrarDuplicado({ nome: "Outro" }, existentes).duplicado).toBeNull();
  });
});
