import { describe, expect, it } from "vitest";

import {
  SEM_CLASSIFICACAO,
  cargaPorResponsavel,
  diasAte,
  distribuicaoPorEtapa,
  faixaDePrazo,
  kpisHoje,
  kpisPrazo,
  origemDoSinal,
  prioridadeDaCarteira,
  ritmoSemanal,
  type AcaoOperacional,
  type CasoCarteira,
  type EventoCaso,
  type MicroentregaOperacional,
} from "./golive-operacao";

/** Referência fixa: quarta-feira, 2026-09-16, 10h local. */
const AGORA = new Date(2026, 8, 16, 10, 0, 0);

function acao(p: Partial<AcaoOperacional>): AcaoOperacional {
  return {
    id: "a",
    titulo: "Ação",
    status: "em_andamento",
    prazo: null,
    bloqueio: false,
    concluidaEm: null,
    responsavel: null,
    ...p,
  };
}

function micro(p: Partial<MicroentregaOperacional>): MicroentregaOperacional {
  return {
    id: "m",
    titulo: "Microentrega",
    status: "em_andamento",
    fase: "pesquisa_inicial",
    prazo: null,
    concluidaEm: null,
    responsavel: null,
    ...p,
  };
}

describe("datas sem horário", () => {
  it("lê AAAA-MM-DD como o mesmo dia local, sem deslocamento UTC", () => {
    expect(diasAte("2026-09-16", AGORA)).toBe(0);
    expect(diasAte("2026-09-15", AGORA)).toBe(-1);
    expect(diasAte("2026-09-23", AGORA)).toBe(7);
    expect(diasAte(null, AGORA)).toBeNull();
    expect(diasAte("não é data", AGORA)).toBeNull();
  });
});

describe("faixa de prazo", () => {
  it("hoje", () => {
    expect(faixaDePrazo(acao({ prazo: "2026-09-16" }), AGORA)).toBe("Hoje");
  });
  it("vencida", () => {
    expect(faixaDePrazo(acao({ prazo: "2026-09-10" }), AGORA)).toBe("Vencida");
  });
  it("próximos 7 dias", () => {
    expect(faixaDePrazo(acao({ prazo: "2026-09-20" }), AGORA)).toBe("Próximos 7 dias");
  });
  it("sem prazo", () => {
    expect(faixaDePrazo(acao({ prazo: null }), AGORA)).toBe("Sem prazo");
  });
  it("concluída", () => {
    expect(faixaDePrazo(acao({ concluidaEm: "2026-09-12T14:00:00-03:00" }), AGORA)).toBe("Concluída");
  });
  it("externo com prazo vencido aparece como vencida", () => {
    const a = acao({ status: "aguardando_cliente", prazo: "2026-09-01" });
    expect(faixaDePrazo(a, AGORA)).toBe("Vencida");
  });
  it("bloqueio sozinho não vira espera externa", () => {
    const a = acao({ bloqueio: true, status: "em_andamento", prazo: "2026-09-20" });
    expect(faixaDePrazo(a, AGORA)).toBe("Próximos 7 dias");
  });
});

describe("KPIs", () => {
  const carteira: CasoCarteira[] = [
    { id: "1", status: "ativo", prioridade: "alta", temProximaAcao: true, prazoProximaAcao: null },
    { id: "2", status: "ativo", prioridade: "media", temProximaAcao: false, prazoProximaAcao: null },
    { id: "3", status: "encerrado", prioridade: "alta", temProximaAcao: false, prazoProximaAcao: null },
  ];
  const acoes = [
    acao({ id: "1", prazo: "2026-09-10" }),
    acao({ id: "2", prazo: "2026-09-16" }),
    acao({ id: "3", status: "aguardando_documento", prazo: "2026-09-30" }),
  ];

  it("conta só a carteira ativa e ignora caso encerrado sem próxima ação", () => {
    expect(kpisHoje(carteira, acoes, AGORA)).toEqual({
      ativos: 2,
      vencidas: 1,
      semProxima: 1,
      externo: 1,
    });
  });

  it("caso encerrado prioritário não entra na rosca de prioridade", () => {
    expect(prioridadeDaCarteira(carteira)).toEqual([
      { rotulo: "alta", valor: 1 },
      { rotulo: "media", valor: 1 },
    ]);
  });

  it("KPIs de prazo do Kanban", () => {
    expect(kpisPrazo(acoes, AGORA)).toEqual({ vencida: 1, hoje: 1, proximos7: 0, externo: 1 });
  });
});

describe("ritmo semanal", () => {
  it("domingo pertence à semana iniciada na segunda anterior", () => {
    const domingo = new Date(2026, 8, 20, 9, 0, 0); // domingo
    const serie = ritmoSemanal(
      [micro({ status: "publicada", concluidaEm: "2026-09-14T08:00:00" })],
      2,
      domingo,
    );
    expect(serie.at(-1)).toEqual({ rotulo: "14/09", valor: 1 });
  });

  it("segunda-feira abre uma semana nova", () => {
    const segunda = new Date(2026, 8, 21, 9, 0, 0);
    const serie = ritmoSemanal(
      [micro({ status: "publicada", concluidaEm: "2026-09-14T08:00:00" })],
      2,
      segunda,
    );
    expect(serie.at(-1)).toEqual({ rotulo: "21/09", valor: 0 });
    expect(serie[0]).toEqual({ rotulo: "14/09", valor: 1 });
  });
});

describe("distribuição por etapa", () => {
  const itens = [
    micro({ id: "1", fase: "pesquisa_inicial" }),
    micro({ id: "2", fase: "pesquisa_inicial", status: "publicada" }),
    micro({ id: "3", fase: "onboarding", status: "cancelada" }),
    micro({ id: "4", fase: "onboarding", status: "arquivada" }),
  ];

  it("conta só o trabalho em aberto", () => {
    expect(distribuicaoPorEtapa(itens)).toEqual([{ rotulo: "pesquisa_inicial", valor: 1 }]);
  });

  it("card histórico pode incluir tudo", () => {
    expect(distribuicaoPorEtapa(itens, { incluirHistorico: true })).toEqual([
      { rotulo: "pesquisa_inicial", valor: 2 },
      { rotulo: "onboarding", valor: 2 },
    ]);
  });

  it("carga por responsável ignora concluída e cancelada", () => {
    expect(
      cargaPorResponsavel([
        micro({ id: "1", responsavel: "Tati" }),
        micro({ id: "2", responsavel: "Tati", status: "cancelada" }),
        micro({ id: "3", responsavel: "Tati", concluidaEm: "2026-09-01T10:00:00" }),
      ]),
    ).toEqual([{ rotulo: "Tati", valor: 1 }]);
  });
});

describe("origem do sinal", () => {
  function evento(p: Partial<EventoCaso>): EventoCaso {
    return { id: "e", titulo: "Evento", tipo: null, fase: null, em: null, origem: null, responsavel: null, ...p };
  }

  it("usa o tipo de entidade canônico e mostra o não mapeado", () => {
    const itens = origemDoSinal([
      evento({ id: "1", origem: "lead" }),
      evento({ id: "2", origem: null, tipo: "evidence_registered" }),
      evento({ id: "3", origem: "sistema_interno", tipo: "coisa_nova" }),
    ]);
    const mapa = Object.fromEntries(itens.map((i) => [i.rotulo, i.valor]));
    expect(mapa["Comercial"]).toBe(1);
    expect(mapa["Pesquisa"]).toBe(1);
    expect(mapa[SEM_CLASSIFICACAO]).toBe(1);
  });

  it("sem evento, devolve vazio para o estado vazio canônico", () => {
    expect(origemDoSinal([])).toEqual([]);
  });
});
