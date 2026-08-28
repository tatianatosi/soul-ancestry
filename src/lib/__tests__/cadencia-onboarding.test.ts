import { describe, expect, it } from "vitest";

import {
  CODIGOS_COM_PRAZO_CONHECIDO,
  lerCadenciaOnboarding,
  lerPrazoRelativo,
  prazoDoCatalogo,
} from "../cadencia-onboarding";

/** O plano real da Ana Luiza, como está hoje no banco. */
const PLANO_ANA = {
  inicio_previsto: null,
  estado: "bloqueado",
  motivos_bloqueio: ["Contrato assinado pendente.", "Pagamento inicial confirmado pendente."],
  plano_acao: [
    { acao: "Concluir formalização (contrato assinado)", ordem: 1, prazo: "pendente de gate", responsavel: "Tatiana Melani Tosi" },
    { acao: "Confirmar pagamento inicial na fonte transacional", ordem: 2, prazo: "pendente de gate", responsavel: "Financeiro" },
    { acao: "Liberar ambiente e nível de acesso do caso", ordem: 3, prazo: "D3 após início", responsavel: "Tatiana Melani Tosi" },
    { acao: "Publicar checklist documental por participante", ordem: 4, prazo: "D5 após início", responsavel: "Tatiana Melani Tosi" },
    { acao: "Realizar call de onboarding", ordem: 5, prazo: "D7 após início", responsavel: "Tatiana Melani Tosi" },
  ],
  touchpoints: [
    { marco: "D7", status: "planejado", descricao: "Primeira micro-entrega planejada" },
    { marco: "D10", status: "planejado", descricao: "Touchpoint de acompanhamento contextualizado" },
    { marco: "D14", status: "planejado", descricao: "Limite de atualização contextualizada ao cliente" },
  ],
};

describe("lê prazo escrito à mão", () => {
  it("entende os marcos que o plano realmente usa", () => {
    expect(lerPrazoRelativo("D3 após início")).toBe(3);
    expect(lerPrazoRelativo("D7")).toBe(7);
    expect(lerPrazoRelativo("d10")).toBe(10);
    expect(lerPrazoRelativo("14")).toBe(14);
    expect(lerPrazoRelativo(7)).toBe(7);
  });

  it("distingue espera por gate de ausência de prazo", () => {
    // A distinção existe para não pintar de vermelho o que espera contrato.
    expect(lerPrazoRelativo("pendente de gate")).toBe("gate");
    expect(lerPrazoRelativo("pendente de contrato")).toBe("gate");
    expect(lerPrazoRelativo("assim que der")).toBeNull();
    expect(lerPrazoRelativo("")).toBeNull();
    expect(lerPrazoRelativo(null)).toBeNull();
  });
});

describe("sem D0 nada pode estar atrasado", () => {
  const c = lerCadenciaOnboarding({ plano: PLANO_ANA, hoje: "2026-08-26" });

  it("não inventa âncora quando o início não foi marcado", () => {
    expect(c.inicio).toBeNull();
    expect(c.semInicio).toBe("plano_bloqueado");
  });

  it("não declara nenhum atraso", () => {
    expect(c.resumo.atrasados).toBe(0);
    expect(c.resumo.venceHoje).toBe(0);
    expect(c.entradas.every((e) => e.previstaEm === null)).toBe(true);
  });

  it("separa o que espera gate do que espera o início", () => {
    expect(c.resumo.travadosPorGate).toBe(2);
    expect(c.resumo.aguardandoInicio).toBe(6); // 3 ações datadas + 3 touchpoints
  });

  it("preserva os motivos do bloqueio em vez de resumi-los a um número", () => {
    expect(c.motivosBloqueio).toEqual([
      "Contrato assinado pendente.",
      "Pagamento inicial confirmado pendente.",
    ]);
  });
});

describe("com D0 a cadência vira datas", () => {
  const plano = { ...PLANO_ANA, inicio_previsto: "2026-08-01", estado: "liberado", motivos_bloqueio: [] };

  it("calcula a data prevista a partir do início", () => {
    const c = lerCadenciaOnboarding({ plano, hoje: "2026-08-01" });
    const ambiente = c.entradas.find((e) => e.rotulo.startsWith("Liberar ambiente"));
    expect(ambiente?.previstaEm).toBe("2026-08-04"); // D0 + 3
    expect(ambiente?.situacao).toBe("previsto");
  });

  it("reconhece o que vence hoje sem confundir com atraso", () => {
    const c = lerCadenciaOnboarding({ plano, hoje: "2026-08-04" });
    const ambiente = c.entradas.find((e) => e.rotulo.startsWith("Liberar ambiente"));
    expect(ambiente?.situacao).toBe("vence_hoje");
    expect(ambiente?.diferencaDias).toBe(0);
  });

  it("conta o atraso em dias, não só marca vermelho", () => {
    const c = lerCadenciaOnboarding({ plano, hoje: "2026-08-11" });
    const ambiente = c.entradas.find((e) => e.rotulo.startsWith("Liberar ambiente"));
    expect(ambiente?.situacao).toBe("atrasado");
    expect(ambiente?.diferencaDias).toBe(7); // vencia D3, hoje é D10
  });

  it("mantém o gate fora da conta de atraso mesmo com o início marcado", () => {
    // Este é o alarme falso que o desenho evita: o contrato não atrasou por
    // causa do calendário do onboarding.
    const c = lerCadenciaOnboarding({ plano, hoje: "2026-12-31" });
    const contrato = c.entradas.find((e) => e.rotulo.includes("contrato assinado"));
    expect(contrato?.situacao).toBe("travado_por_gate");
    expect(contrato?.diferencaDias).toBeNull();
  });

  it("ordena pelo calendário, não pela ordem de digitação", () => {
    const c = lerCadenciaOnboarding({ plano, hoje: "2026-08-01" });
    const datadas = c.entradas.filter((e) => e.dias !== null).map((e) => e.dias);
    expect(datadas).toEqual([...datadas].sort((a, b) => (a ?? 0) - (b ?? 0)));
  });

  it("a conta de dias não muda com a hora do dia", () => {
    const manha = lerCadenciaOnboarding({ plano, hoje: "2026-08-11T02:00:00Z" });
    const noite = lerCadenciaOnboarding({ plano, hoje: "2026-08-11T23:30:00Z" });
    expect(manha.resumo).toEqual(noite.resumo);
  });
});

describe("o checklist entra sem que um vocabulário engula o outro", () => {
  const checklist = [
    { item_code: "contrato_assinado", label: "Contrato assinado", ordem: 1, status: "pendente" },
    { item_code: "ambiente_acesso", label: "Ambiente e nível de acesso definidos", ordem: 6, status: "pendente" },
    { item_code: "case_service", label: "Case service definido", ordem: 7, status: "pendente" },
    { item_code: "dossie_mae", label: "Dossiê-mãe validado", ordem: 5, status: "concluido", concluido_em: "2026-08-03" },
  ];

  it("usa o prazo do catálogo para os itens que casam", () => {
    expect(prazoDoCatalogo("dossie_mae")).toBe(7);
    expect(prazoDoCatalogo("ambiente_acesso")).toBe(3);
  });

  it("mantém visível o item que só existe no banco", () => {
    // `case_service` não tem correspondente no catálogo. Ele some da conta de
    // prazos, nunca da vista.
    const c = lerCadenciaOnboarding({
      plano: { ...PLANO_ANA, inicio_previsto: "2026-08-01" },
      checklist,
      hoje: "2026-08-10",
    });
    const cs = c.entradas.find((e) => e.id === "checklist:case_service");
    expect(cs).toBeDefined();
    expect(cs?.situacao).toBe("sem_prazo");
  });

  it("reconhece o item concluído pela data, não pelo texto do status", () => {
    const c = lerCadenciaOnboarding({
      plano: { ...PLANO_ANA, inicio_previsto: "2026-08-01" },
      checklist,
      hoje: "2026-08-10",
    });
    const dossie = c.entradas.find((e) => e.id === "checklist:dossie_mae");
    expect(dossie?.situacao).toBe("cumprido");
  });

  it("todo código visto no banco está declarado no mapa de prazos", () => {
    // Guarda contra o banco ganhar um item novo e ele virar "sem prazo" em
    // silêncio, sem ninguém decidir se ele tem prazo ou não.
    const noBanco = [
      "contrato_assinado", "pagamento_inicial", "responsavel_principal", "nucleo_familiar",
      "dossie_mae", "ambiente_acesso", "case_service", "checklist_inicial",
      "plano_acao", "grupo_familiar", "app_cliente", "micro_entrega_d7",
    ];
    for (const codigo of noBanco) expect(CODIGOS_COM_PRAZO_CONHECIDO).toContain(codigo);
  });
});

describe("resiste a plano ausente ou malformado", () => {
  it("não quebra sem plano nenhum", () => {
    const c = lerCadenciaOnboarding({});
    expect(c.entradas).toEqual([]);
    expect(c.resumo.total).toBe(0);
    expect(c.semInicio).toBe("inicio_nao_marcado");
  });

  it("ignora entradas sem rótulo em vez de exibir linha vazia", () => {
    const c = lerCadenciaOnboarding({
      plano: { plano_acao: [{ ordem: 1 }, { acao: "  ", ordem: 2 }], touchpoints: "não é lista" },
    });
    expect(c.entradas).toEqual([]);
  });

  it("aceita data de início inválida sem virar NaN na tela", () => {
    const c = lerCadenciaOnboarding({ plano: { ...PLANO_ANA, inicio_previsto: "banana" } });
    expect(c.entradas.every((e) => e.diferencaDias === null || Number.isFinite(e.diferencaDias))).toBe(true);
  });
});
