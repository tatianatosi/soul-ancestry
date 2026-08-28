import { describe, expect, it } from "vitest";

import { lerCadenciaOnboarding } from "../cadencia-onboarding";
import { CADENCIA_D0_D30, lerCadenciaD0D30, leituraD0D30 } from "../cadencia-d0-d30";

/** O plano real da Ana Luiza: touchpoints em D7, D10 e D14. */
const PLANO_ANA = {
  inicio_previsto: null as string | null,
  estado: "bloqueado",
  motivos_bloqueio: ["Contrato assinado pendente.", "Pagamento inicial confirmado pendente."],
  plano_acao: [
    { acao: "Concluir formalização (contrato assinado)", ordem: 1, prazo: "pendente de gate" },
    { acao: "Confirmar pagamento inicial na fonte transacional", ordem: 2, prazo: "pendente de gate" },
    { acao: "Liberar ambiente e nível de acesso do caso", ordem: 3, prazo: "D3 após início" },
    { acao: "Publicar checklist documental por participante", ordem: 4, prazo: "D5 após início" },
    { acao: "Realizar call de onboarding", ordem: 5, prazo: "D7 após início" },
  ],
  touchpoints: [
    { marco: "D7", status: "planejado", descricao: "Primeira micro-entrega planejada" },
    { marco: "D10", status: "planejado", descricao: "Touchpoint de acompanhamento contextualizado" },
    { marco: "D14", status: "planejado", descricao: "Limite de atualização contextualizada ao cliente" },
  ],
};

function ler(inicio: string | null, hoje: string) {
  const cadenciaDoCaso = lerCadenciaOnboarding({
    plano: { ...PLANO_ANA, inicio_previsto: inicio },
    hoje,
  });
  return lerCadenciaD0D30({ cadenciaDoCaso, hoje });
}

describe("a norma é transcrição, não invenção", () => {
  it("tem os seis momentos da tabela canônica §10.3", () => {
    expect(CADENCIA_D0_D30.map((m) => m.rotulo)).toEqual([
      "D0",
      "D1–D3",
      "Até D7",
      "D10",
      "D14",
      "D30",
    ]);
  });

  it("todo momento diz o que a equipe faz e o que pode chegar ao cliente", () => {
    for (const m of CADENCIA_D0_D30) {
      expect(m.acaoInterna.length).toBeGreaterThan(0);
      expect(m.entregaAoCliente.length).toBeGreaterThan(0);
    }
  });

  it("o NPS de D30 fica marcado como aprovação à parte", () => {
    // A norma diz "NPS somente se aprovado". Misturá-lo ao check-in perderia
    // a condição.
    const d30 = CADENCIA_D0_D30.find((m) => m.id === "d30");
    expect(d30?.aprovacaoExtra).toMatch(/NPS/);
  });

  it("distingue ponto, janela e limite", () => {
    const porId = Object.fromEntries(CADENCIA_D0_D30.map((m) => [m.id, m]));
    expect(porId.d0.tipo).toBe("ponto");
    expect(porId.d1_d3.tipo).toBe("janela");
    expect(porId.ate_d7.tipo).toBe("limite");
  });
});

describe("a lacuna real do caso da Ana Luiza", () => {
  const l = ler(null, "2026-08-26");

  it("acusa exatamente os três momentos que o plano não prevê", () => {
    // Os touchpoints cobrem D7, D10 e D14; o plano de ação tem D3 e D5.
    // Ninguém previu D0 nem D30.
    expect(l.lacunas).toContain("D0");
    expect(l.lacunas).toContain("D30");
  });

  it("reconhece o que o plano de fato cobre", () => {
    const porId = Object.fromEntries(l.momentos.map((m) => [m.momento.id, m]));
    expect(porId.d10.cobertura).toBe("coberto");
    expect(porId.d14.cobertura).toBe("coberto");
    expect(porId.d1_d3.cobertura).toBe("coberto"); // "D3 após início"
  });

  it("nomeia quem cobre, em vez de só dizer que cobre", () => {
    const porId = Object.fromEntries(l.momentos.map((m) => [m.momento.id, m]));
    expect(porId.d10.cobertoPor).toContain("Touchpoint de acompanhamento contextualizado");
  });

  it("a lacuna é dita mesmo sem data de início", () => {
    // Faltar D0 e D30 no plano não depende de o onboarding ter começado.
    expect(leituraD0D30(l)).toMatch(/não prevê nada em/);
  });
});

describe("sem D0 nenhum momento é atraso", () => {
  it("todos ficam aguardando o início", () => {
    const l = ler(null, "2026-08-26");
    expect(l.momentos.every((m) => m.situacao === "aguardando_inicio")).toBe(true);
    expect(l.resumo.atrasados).toBe(0);
  });

  it("não produz data nenhuma", () => {
    const l = ler(null, "2026-08-26");
    expect(l.momentos.every((m) => m.deEm === null && m.ateEm === null)).toBe(true);
  });
});

describe("com D0 a norma vira calendário", () => {
  it("data o início e o fim de cada momento", () => {
    const l = ler("2026-08-01", "2026-08-01");
    const porId = Object.fromEntries(l.momentos.map((m) => [m.momento.id, m]));
    expect(porId.d0.deEm).toBe("2026-08-01");
    expect(porId.d1_d3.deEm).toBe("2026-08-02");
    expect(porId.d1_d3.ateEm).toBe("2026-08-04");
    expect(porId.d30.deEm).toBe("2026-08-31");
  });

  it("a janela D1–D3 fica ABERTA no dia 2, não atrasada", () => {
    // Tratar janela como ponto colocaria D1–D3 em atraso já no segundo dia.
    const l = ler("2026-08-01", "2026-08-03");
    const d1d3 = l.momentos.find((m) => m.momento.id === "d1_d3");
    expect(d1d3?.situacao).toBe("vence_hoje");
  });

  it("o teto 'até D7' vale o intervalo inteiro, não só o sétimo dia", () => {
    const l = ler("2026-08-01", "2026-08-04");
    const ate7 = l.momentos.find((m) => m.momento.id === "ate_d7");
    expect(ate7?.situacao).toBe("vence_hoje");
  });

  it("momento descoberto e vencido vira atraso", () => {
    const l = ler("2026-08-01", "2026-09-30"); // muito depois de D30
    const d30 = l.momentos.find((m) => m.momento.id === "d30");
    expect(d30?.cobertura).toBe("descoberto");
    expect(d30?.situacao).toBe("atrasado");
  });

  it("momento coberto e vencido NÃO é declarado cumprido", () => {
    // Quem sabe se a entrega saiu é o registro dela, não este módulo.
    // Afirmar "cumprido" sem esse registro seria inventar.
    const l = ler("2026-08-01", "2026-09-30");
    const d10 = l.momentos.find((m) => m.momento.id === "d10");
    expect(d10?.cobertura).toBe("coberto");
    expect(d10?.situacao).not.toBe("cumprido");
    expect(d10?.situacao).not.toBe("atrasado");
  });

  it("momento futuro é previsto, não aberto", () => {
    const l = ler("2026-08-01", "2026-08-01");
    const d30 = l.momentos.find((m) => m.momento.id === "d30");
    expect(d30?.situacao).toBe("previsto");
  });
});

describe("resiste a caso sem plano", () => {
  it("acusa os seis momentos como lacuna, sem quebrar", () => {
    const vazio = lerCadenciaOnboarding({});
    const l = lerCadenciaD0D30({ cadenciaDoCaso: vazio, hoje: "2026-08-26" });
    expect(l.resumo.descobertos).toBe(6);
    expect(l.momentos).toHaveLength(6);
  });
});
