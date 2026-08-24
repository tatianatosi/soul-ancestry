import { describe, expect, it } from "vitest";

import {
  ACOES_JAMAIS_LIBERADAS_POR_OVERRIDE,
  ESCOPOS_LIBERAVEIS,
  estadoArtefatoMaterializacao,
  estadoOverride,
  montarEventoOverride,
  MOTIVO_MINIMO_OVERRIDE,
  permiteEscopoInterno,
  validarSolicitacaoOverride,
  type SolicitacaoOverride,
} from "../override-proprietaria-comercial";

/** Caso real citado pela Proprietária (PROMPT 03) — usado só como fixture de teste. */
const CASO_ANA_LUIZA = "CA-CID-AT-FAM-2026-001";

const solicitacaoAnaLuiza = (over: Partial<SolicitacaoOverride> = {}): SolicitacaoOverride => ({
  tipo: "iniciar_antes_pagamento",
  casoId: CASO_ANA_LUIZA,
  objetoAfetado: "inicio_preparacao_interna",
  condicaoOriginal: "Início condicionado a pagamento inicial confirmado (gate de ativação do caso).",
  gatesPendentes: [
    { chave: "pagamento_confirmado_ou_condicao_financeira_autorizada", motivo: "Primeira cobrança prevista para 01/10/2026, ainda não confirmada." },
  ],
  escopoLiberado: ["preparacao_contratual", "coleta_de_dados", "onboarding_interno"],
  justificativa: "Aceite formal registrado e proposta familiar aprovada; adiantar preparação reduz atraso após a confirmação do pagamento.",
  autorPapel: "admin",
  autorUserId: "user-proprietaria-1",
  dataRevisao: "2026-10-15T00:00:00.000Z",
  ...over,
});

describe("override auditável da Proprietária — validação (PROMPT 02)", () => {
  it("aceita uma solicitação completa e válida", () => {
    const r = validarSolicitacaoOverride(solicitacaoAnaLuiza());
    expect(r.valida).toBe(true);
    expect(r.erros).toEqual([]);
  });

  it("recusa quem não é a Proprietária administradora", () => {
    for (const papel of ["operacoes", "pesquisa", "financeiro", null, undefined]) {
      const r = validarSolicitacaoOverride(solicitacaoAnaLuiza({ autorPapel: papel as any }));
      expect(r.valida).toBe(false);
      expect(r.erros.join(" ")).toMatch(/Proprietária administradora autenticada/);
    }
  });

  it("aceita o papel canônico proprietaria_administradora, além de admin", () => {
    const r = validarSolicitacaoOverride(solicitacaoAnaLuiza({ autorPapel: "proprietaria_administradora" }));
    expect(r.valida).toBe(true);
  });

  it("exige justificativa obrigatória e específica (mínimo de caracteres)", () => {
    const curta = validarSolicitacaoOverride(solicitacaoAnaLuiza({ justificativa: "ok" }));
    expect(curta.valida).toBe(false);
    expect(curta.erros.join(" ")).toMatch(new RegExp(`pelo menos ${MOTIVO_MINIMO_OVERRIDE}`));

    const vazia = validarSolicitacaoOverride(solicitacaoAnaLuiza({ justificativa: "" }));
    expect(vazia.valida).toBe(false);
  });

  it("exige condição original declarada — a exceção nunca apaga a regra que está superando", () => {
    const r = validarSolicitacaoOverride(solicitacaoAnaLuiza({ condicaoOriginal: "" }));
    expect(r.valida).toBe(false);
    expect(r.erros.join(" ")).toMatch(/condição original/i);
  });

  it("exige ao menos um gate pendente declarado", () => {
    const r = validarSolicitacaoOverride(solicitacaoAnaLuiza({ gatesPendentes: [] }));
    expect(r.valida).toBe(false);
  });

  it("exige data de revisão/expiração válida", () => {
    expect(validarSolicitacaoOverride(solicitacaoAnaLuiza({ dataRevisao: "" })).valida).toBe(false);
    expect(validarSolicitacaoOverride(solicitacaoAnaLuiza({ dataRevisao: "não-é-uma-data" })).valida).toBe(false);
  });

  it("recusa escopo fora do permitido para o tipo de override — nunca amplia o alcance sozinho", () => {
    const r = validarSolicitacaoOverride(
      solicitacaoAnaLuiza({ escopoLiberado: ["preparacao_contratual", "assinatura_do_contrato"] }),
    );
    expect(r.valida).toBe(false);
    expect(r.erros.join(" ")).toMatch(/fora do permitido/);
  });

  it("escopo liberável de iniciar_antes_pagamento nunca inclui assinatura, cobrança, envio ou publicação", () => {
    const escopo = ESCOPOS_LIBERAVEIS.iniciar_antes_pagamento;
    for (const proibido of ["assinatura", "cobranca", "envio_cliente", "publicacao_portal", "pesquisa_externa"]) {
      expect(escopo).not.toContain(proibido);
    }
  });
});

describe("estado do override — expiração e revogação (PROMPT 02)", () => {
  it("fica LIBERADO_POR_OVERRIDE_PROPRIETARIA antes da data de revisão", () => {
    expect(estadoOverride({ dataRevisao: "2026-10-15T00:00:00.000Z", agora: "2026-09-01T00:00:00.000Z" })).toBe(
      "LIBERADO_POR_OVERRIDE_PROPRIETARIA",
    );
  });

  it("expira automaticamente após a data de revisão, sem exigir ação manual para deixar de valer", () => {
    expect(estadoOverride({ dataRevisao: "2026-10-15T00:00:00.000Z", agora: "2026-10-16T00:00:00.000Z" })).toBe(
      "EXPIRADO_AGUARDA_REVISAO",
    );
  });

  it("revogação sempre prevalece, mesmo antes da data de revisão", () => {
    expect(
      estadoOverride({
        dataRevisao: "2026-10-15T00:00:00.000Z",
        agora: "2026-09-01T00:00:00.000Z",
        revogadoEm: "2026-08-25T00:00:00.000Z",
      }),
    ).toBe("REVOGADO");
  });
});

describe("permiteEscopoInterno — nunca consulta nem infere campo financeiro", () => {
  const overridesAtivos = [
    {
      casoId: CASO_ANA_LUIZA,
      tipo: "iniciar_antes_pagamento" as const,
      escopoLiberado: ["preparacao_contratual", "coleta_de_dados"],
      estado: "LIBERADO_POR_OVERRIDE_PROPRIETARIA" as const,
    },
  ];

  it("libera exatamente o escopo autorizado, para o caso e tipo corretos", () => {
    expect(permiteEscopoInterno(overridesAtivos, CASO_ANA_LUIZA, "iniciar_antes_pagamento", "preparacao_contratual")).toBe(
      true,
    );
  });

  it("não libera escopo não incluído na exceção", () => {
    expect(permiteEscopoInterno(overridesAtivos, CASO_ANA_LUIZA, "iniciar_antes_pagamento", "onboarding_interno")).toBe(
      false,
    );
  });

  it("não vaza para outro caso", () => {
    expect(permiteEscopoInterno(overridesAtivos, "outro-caso", "iniciar_antes_pagamento", "preparacao_contratual")).toBe(
      false,
    );
  });

  it("um override expirado ou revogado nunca libera escopo", () => {
    const expirado = [{ ...overridesAtivos[0], estado: "EXPIRADO_AGUARDA_REVISAO" as const }];
    const revogado = [{ ...overridesAtivos[0], estado: "REVOGADO" as const }];
    expect(permiteEscopoInterno(expirado, CASO_ANA_LUIZA, "iniciar_antes_pagamento", "preparacao_contratual")).toBe(false);
    expect(permiteEscopoInterno(revogado, CASO_ANA_LUIZA, "iniciar_antes_pagamento", "preparacao_contratual")).toBe(false);
  });
});

describe("evento de auditoria — nunca marca pagamento, nunca autoriza ação externa", () => {
  it("monta o payload completo exigido: quem, gates pendentes, justificativa, escopo, estados", () => {
    const evento = montarEventoOverride(solicitacaoAnaLuiza(), "org-1");
    expect(evento.actor_user_id).toBe("user-proprietaria-1");
    expect(evento.actor_papel).toBe("admin");
    expect(evento.categoria).toBe("override_proprietaria_comercial");
    expect(evento.entidade_id).toBe(CASO_ANA_LUIZA);
    expect(evento.pendencias_assumidas).toEqual(solicitacaoAnaLuiza().gatesPendentes);
    expect(evento.motivo.length).toBeGreaterThanOrEqual(MOTIVO_MINIMO_OVERRIDE);
    expect(evento.valor_anterior).toMatchObject({ estado: "BLOQUEADO" });
    expect(evento.valor_novo).toMatchObject({ estado: "LIBERADO_POR_OVERRIDE_PROPRIETARIA" });
  });

  it("nunca marca ação externa, confirmação manual pendente resolvida ou irreversibilidade", () => {
    const evento = montarEventoOverride(solicitacaoAnaLuiza(), "org-1");
    expect(evento.acao_externa).toBe(false);
    expect(evento.irreversivel).toBe(false);
    expect(evento.dados_teste).toBe(false);
  });

  it("o payload não contém nenhuma das ações jamais liberadas por override, em nenhum valor de texto", () => {
    const evento = montarEventoOverride(solicitacaoAnaLuiza(), "org-1");
    const textoCompleto = JSON.stringify(evento).toLowerCase();
    for (const acao of ACOES_JAMAIS_LIBERADAS_POR_OVERRIDE) {
      // A lista de proibições pode aparecer como referência em outros módulos,
      // mas o evento de override em si nunca declara essas ações como parte
      // do que foi liberado.
      expect(textoCompleto.includes(`"${acao}"`)).toBe(false);
    }
  });

  it("condição original (pagamento pendente) permanece registrada dentro do próprio evento de liberação", () => {
    const evento = montarEventoOverride(solicitacaoAnaLuiza(), "org-1");
    expect(evento.fonte).toMatch(/pagamento/i);
    expect((evento.valor_anterior as any).condicao_original).toMatch(/pagamento/i);
  });
});

describe("materialização contratual com exceção (PROMPT 04)", () => {
  it("fica BLOQUEADO quando há gate pendente e nenhum override válido", () => {
    expect(
      estadoArtefatoMaterializacao({
        temOverrideValido: false,
        gatesPendentes: [{ chave: "aprovacao", motivo: "proposta não aprovada" }],
        camposPendentes: [],
        revisaoHumanaConcluida: true,
      }),
    ).toBe("BLOQUEADO");
  });

  it("com override válido mas campos ausentes, fica AGUARDA_REVISAO — nunca PRONTO_PARA_CONFIRMACAO", () => {
    expect(
      estadoArtefatoMaterializacao({
        temOverrideValido: true,
        gatesPendentes: [{ chave: "aprovacao", motivo: "proposta não aprovada" }],
        camposPendentes: ["preco", "data_assinatura"],
        revisaoHumanaConcluida: true,
      }),
    ).toBe("AGUARDA_REVISAO");
  });

  it("com override válido cobrindo o gate pendente e sem campo ausente, gera RASCUNHO_INTERNO", () => {
    expect(
      estadoArtefatoMaterializacao({
        temOverrideValido: true,
        gatesPendentes: [{ chave: "financeiro", motivo: "cobrança não confirmada" }],
        camposPendentes: [],
        revisaoHumanaConcluida: false,
      }),
    ).toBe("RASCUNHO_INTERNO");
  });

  it("sem gate pendente, sem campo ausente, mas sem revisão humana, ainda é AGUARDA_REVISAO", () => {
    expect(
      estadoArtefatoMaterializacao({
        temOverrideValido: false,
        gatesPendentes: [],
        camposPendentes: [],
        revisaoHumanaConcluida: false,
      }),
    ).toBe("AGUARDA_REVISAO");
  });

  it("só chega a PRONTO_PARA_CONFIRMACAO com tudo resolvido e revisão humana concluída", () => {
    expect(
      estadoArtefatoMaterializacao({
        temOverrideValido: false,
        gatesPendentes: [],
        camposPendentes: [],
        revisaoHumanaConcluida: true,
      }),
    ).toBe("PRONTO_PARA_CONFIRMACAO");
  });

  it("RASCUNHO_INTERNO nunca é o mesmo que PRONTO_PARA_CONFIRMACAO: estados são distintos", () => {
    const rascunho = estadoArtefatoMaterializacao({
      temOverrideValido: true,
      gatesPendentes: [{ chave: "financeiro", motivo: "cobrança não confirmada" }],
      camposPendentes: [],
      revisaoHumanaConcluida: false,
    });
    expect(rascunho).toBe("RASCUNHO_INTERNO");
    expect(rascunho).not.toBe("PRONTO_PARA_CONFIRMACAO");
  });
});
