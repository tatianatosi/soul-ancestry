import { describe, expect, it } from "vitest";
import {
  avaliarCadencia,
  contemConteudoInterno,
  derivarEstadoCaso,
  diagnosticarOnboarding,
  esperaExternaSuspendeAlerta,
  podeAtivarCaso,
  podeIniciarOnboarding,
  projetarEntregasCliente,
  CHECKLIST_ONBOARDING_PADRAO,
} from "@/lib/onboarding-jornada";
import { estadoDaTela, podeLerConteudo, telasVisiveis } from "@/lib/app-cliente-gate";

const casoCompleto = {
  contrato_assinado: true,
  pagamento_confirmado: true,
  responsavel_principal: "Equipe",
  dossie_mae_referencia: "DOS-1",
  app_visibility_level: "basico",
  case_service_id: "svc-1",
  eixo_operacao: "pagamento_inicial_confirmado",
  onboarding_iniciado_em: null,
};

const ctxCompleto = {
  nucleoValidado: true,
  participantesVinculados: true,
  representacaoOk: true,
  escopoAprovado: true,
  checklistDocumentalCriado: true,
  plano: {
    status: "ativo",
    responsavel_user_id: "u1",
    proxima_acao: "Levantar certidões",
    prazo_proxima_acao: "2026-09-01",
    proxima_microentrega: "Boas-vindas",
    proxima_atualizacao_limite_em: "2026-09-05T00:00:00Z",
  },
};

describe("checklist padrão", () => {
  it("tem 15 itens obrigatórios", () => {
    expect(CHECKLIST_ONBOARDING_PADRAO).toHaveLength(15);
    expect(CHECKLIST_ONBOARDING_PADRAO.every((i) => i.obrigatorio)).toBe(true);
  });
});

describe("diagnóstico de onboarding", () => {
  it("bloqueia sem contrato e pagamento", () => {
    const d = diagnosticarOnboarding(
      { ...casoCompleto, contrato_assinado: false, pagamento_confirmado: false },
      ctxCompleto,
    );
    expect(d.status).toBe("bloqueado");
    expect(podeIniciarOnboarding(d).ok).toBe(false);
  });

  it("libera quando todos os gates estão atendidos", () => {
    const d = diagnosticarOnboarding(casoCompleto, ctxCompleto);
    expect(d.gates_pendentes).toHaveLength(0);
    expect(podeIniciarOnboarding(d).ok).toBe(true);
  });

  it("exige onboarding iniciado para ativar o caso", () => {
    const d = diagnosticarOnboarding(casoCompleto, ctxCompleto);
    expect(podeAtivarCaso(casoCompleto, d).ok).toBe(false);
    expect(
      podeAtivarCaso(
        {
          ...casoCompleto,
          eixo_operacao: "onboarding_iniciado",
          onboarding_iniciado_em: "2026-08-01",
        },
        d,
      ).ok,
    ).toBe(true);
  });

  it("deriva estado formalização pendente antes do onboarding", () => {
    const caso = { ...casoCompleto, dossie_mae_referencia: null };
    const d = diagnosticarOnboarding(caso, ctxCompleto);
    expect(derivarEstadoCaso(caso, d, ctxCompleto)).toBe("formalizacao_pendente");
  });
});

describe("cadência interna", () => {
  const hoje = new Date("2026-09-01T12:00:00Z");

  it("alerta D7 sem microentrega planejada", () => {
    const a = avaliarCadencia(
      { onboardingIniciadoEm: "2026-08-20", primeiraMicroentregaPlanejada: false },
      hoje,
    );
    expect(a.some((x) => x.regra === "D7")).toBe(true);
  });

  it("alerta D10 e D14 por ausência de touchpoint", () => {
    const a = avaliarCadencia(
      {
        onboardingIniciadoEm: "2026-08-01",
        primeiraMicroentregaPlanejada: true,
        ultimoTouchpointEm: "2026-08-10",
      },
      hoje,
    );
    expect(a.map((x) => x.regra)).toEqual(expect.arrayContaining(["D10", "D14"]));
  });

  it("espera externa completa suspende alertas de touchpoint", () => {
    const a = avaliarCadencia(
      {
        onboardingIniciadoEm: "2026-08-01",
        primeiraMicroentregaPlanejada: true,
        ultimoTouchpointEm: "2026-08-10",
        esperaExternaAtiva: true,
      },
      hoje,
    );
    expect(a).toHaveLength(0);
  });

  it("espera externa incompleta não suspende", () => {
    expect(
      esperaExternaSuspendeAlerta(
        {
          motivo: "Cartório",
          responsavel_user_id: "u1",
          prazo_rechecagem: "2026-09-30",
          status: "em_espera",
        },
        hoje,
      ),
    ).toBe(false);
    expect(
      esperaExternaSuspendeAlerta(
        {
          motivo: "Cartório",
          responsavel_user_id: "u1",
          prazo_rechecagem: "2026-09-30",
          ultima_atualizacao_contextualizada_em: "2026-08-28",
          status: "em_espera",
        },
        hoje,
      ),
    ).toBe(true);
  });
});

describe("projeção sanitizada para o cliente", () => {
  it("só publica entrega aprovada, publicada e sem conteúdo interno", () => {
    const saida = projetarEntregasCliente(
      [
        {
          id: "1",
          case_id: "c",
          approval_status: "aprovado",
          approved_by: "u",
          summary_approved: "Tudo certo",
        },
        { id: "2", case_id: "c", approval_status: "publicado", summary_approved: "Sem aprovador" },
        {
          id: "3",
          case_id: "c",
          approval_status: "publicado",
          approved_by: "u",
          summary_approved: "Preço R$ 1.000",
        },
        {
          id: "4",
          case_id: "c",
          approval_status: "publicado",
          approved_by: "u",
          title_client: "Boas-vindas",
          summary_approved: "Recebemos seus dados e seguimos com a preparação.",
          journey_phase: "onboarding",
          deliverable_type: "boas_vindas",
        },
      ],
      "c",
    );
    expect(saida.map((s) => s.id)).toEqual(["4"]);
    expect(saida[0].fase).toBe("Preparação do seu acompanhamento");
  });

  it("detecta termos internos", () => {
    expect(contemConteudoInterno("Hipótese confirmada pela fonte")).toBe(true);
    expect(contemConteudoInterno("Sua árvore foi atualizada")).toBe(false);
  });
});

describe("gate do App Cliente", () => {
  it("mantém as 10 telas do mockup visíveis", () => {
    expect(telasVisiveis()).toHaveLength(10);
  });

  it("antes do onboarding, jornada mostra estado seguro e nada é legível", () => {
    const ctx = { eixoOperacao: "contrato_assinado" };
    expect(estadoDaTela("jornada", ctx)).toBe("aguardando_formalizacao");
    expect(podeLerConteudo("entrega", ctx)).toBe(false);
  });

  it("com onboarding iniciado e entregas publicadas, libera leitura", () => {
    const ctx = { eixoOperacao: "onboarding_iniciado", entregasPublicadas: 2 };
    expect(podeLerConteudo("entrega", ctx)).toBe(true);
    expect(estadoDaTela("docs", ctx)).toBe("sem_itens");
  });
});
