import { describe, expect, it } from "vitest";

import {
  diasAte,
  eixosDoCaso,
  ordemDeAtendimento,
  pontosDaMatriz,
  prontidao,
  urgencia,
  type CasoRadar,
} from "./golive-radar";

const AGORA = new Date(2026, 8, 15, 10, 0, 0); // 15/09/2026, horário local

function caso(p: Partial<CasoRadar> = {}): CasoRadar {
  return {
    id: p.id ?? "1",
    codigo: p.codigo ?? "CA-001",
    titulo: p.titulo ?? "Caso",
    status: p.status ?? "em_andamento",
    fase: p.fase ?? null,
    ativo: p.ativo ?? true,
    risco: p.risco ?? null,
    prioridade: p.prioridade ?? null,
    responsavel: p.responsavel ?? null,
    proximaAcao: "proximaAcao" in p ? (p.proximaAcao ?? null) : "Conferir documentos",
    prazoProximaAcao: p.prazoProximaAcao ?? null,
    contratoAssinado: p.contratoAssinado ?? false,
    pagamentoConfirmado: p.pagamentoConfirmado ?? false,
    documentosMinimosOk: p.documentosMinimosOk ?? false,
    aguardandoExterno: p.aguardandoExterno ?? false,
    alertasAbertos: p.alertasAbertos ?? 0,
  };
}

describe("diasAte", () => {
  it("lê data sem hora como dia local, sem deslocar para UTC", () => {
    expect(diasAte("2026-09-15", AGORA)).toBe(0);
    expect(diasAte("2026-09-14", AGORA)).toBe(-1);
    expect(diasAte("2026-09-22", AGORA)).toBe(7);
  });

  it("devolve null sem prazo ou com valor inválido", () => {
    expect(diasAte(null, AGORA)).toBeNull();
    expect(diasAte("não é data", AGORA)).toBeNull();
  });
});

describe("urgência", () => {
  it("vencido é o topo e hoje vem logo abaixo", () => {
    expect(urgencia(caso({ prazoProximaAcao: "2026-09-10" }), AGORA)).toBe(1);
    expect(urgencia(caso({ prazoProximaAcao: "2026-09-15" }), AGORA)).toBe(0.9);
  });

  it("prazo em sete dias fica acima do prazo longo", () => {
    const sete = urgencia(caso({ prazoProximaAcao: "2026-09-22" }), AGORA);
    const longe = urgencia(caso({ prazoProximaAcao: "2026-12-22" }), AGORA);
    expect(sete).toBeGreaterThan(longe);
  });

  it("sem prazo só distingue ter ou não próxima ação", () => {
    expect(urgencia(caso({ prazoProximaAcao: null }), AGORA)).toBe(0.5);
    expect(urgencia(caso({ prazoProximaAcao: null, proximaAcao: null }), AGORA)).toBe(0.2);
  });
});

describe("prontidão e eixos", () => {
  it("conta apenas marcos gravados", () => {
    expect(prontidao(caso())).toBe(0);
    expect(prontidao(caso({ contratoAssinado: true, pagamentoConfirmado: true }))).toBeCloseTo(2 / 3);
  });

  it("tem exatamente quatro eixos internos, sem percentual jurídico", () => {
    const eixos = eixosDoCaso(caso({ contratoAssinado: true }));
    expect(eixos.map((e) => e.rotulo)).toEqual(["Formalização", "Pagamento", "Documentos", "Próxima ação"]);
    expect(eixos[0]?.valor).toBe(1);
  });
});

describe("ordem de atendimento", () => {
  it("coloca prazo vencido na frente de prioridade alta", () => {
    const lista = ordemDeAtendimento(
      [
        caso({ id: "alta", titulo: "Prioridade alta", prioridade: "alta" }),
        caso({ id: "vencido", titulo: "Vencido", prazoProximaAcao: "2026-09-01" }),
      ],
      AGORA,
    );
    expect(lista[0]?.caso.id).toBe("vencido");
    expect(lista[0]?.motivo).toBe("Prazo vencido");
  });

  it("marca caso sem próxima ação e espera externa", () => {
    const lista = ordemDeAtendimento(
      [
        caso({ id: "sem", titulo: "Sem ação", proximaAcao: null }),
        caso({ id: "externo", titulo: "Externo", aguardandoExterno: true }),
      ],
      AGORA,
    );
    expect(lista.find((l) => l.caso.id === "sem")?.motivo).toBe("Sem próxima ação");
    expect(lista.find((l) => l.caso.id === "externo")?.motivo).toBe("Aguardando instituição externa");
  });

  it("espera externa não passa na frente de prazo vencido", () => {
    const lista = ordemDeAtendimento(
      [
        caso({ id: "externo", titulo: "Externo", aguardandoExterno: true, alertasAbertos: 5 }),
        caso({ id: "vencido", titulo: "Vencido", prazoProximaAcao: "2026-08-30" }),
      ],
      AGORA,
    );
    expect(lista[0]?.caso.id).toBe("vencido");
  });

  it("carteira vazia devolve lista vazia", () => {
    expect(ordemDeAtendimento([], AGORA)).toEqual([]);
  });
});

describe("pontos da matriz", () => {
  it("afasta casos coincidentes para não sobrepor rótulo", () => {
    const pontos = pontosDaMatriz([caso({ id: "a" }), caso({ id: "b" })], AGORA);
    expect(pontos).toHaveLength(2);
    const dx = Math.abs((pontos[0]?.x ?? 0) - (pontos[1]?.x ?? 0));
    const dy = Math.abs((pontos[0]?.y ?? 0) - (pontos[1]?.y ?? 0));
    expect(dx > 0.03 || dy > 0.03).toBe(true);
  });

  it("numera os casos e mantém coordenadas dentro de 0 a 1", () => {
    const pontos = pontosDaMatriz(
      [caso({ id: "a", prazoProximaAcao: "2026-09-01" }), caso({ id: "b", contratoAssinado: true })],
      AGORA,
    );
    expect(pontos.map((p) => p.indice)).toEqual([1, 2]);
    for (const p of pontos) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(1);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(1);
    }
  });

  it("carteira vazia não gera ponto", () => {
    expect(pontosDaMatriz([], AGORA)).toEqual([]);
  });
});

/* Casos pedidos na conferência: prazos, marcos, alerta e registro de teste. */
describe("conferência de prazos e marcos", () => {
  it("ordena hoje, +3, +7, +30 e sem prazo por urgência decrescente", () => {
    const u = (p: string | null) => urgencia(caso({ prazoProximaAcao: p }), AGORA);
    expect(u("2026-09-15")).toBeGreaterThan(u("2026-09-18"));
    expect(u("2026-09-18")).toBeGreaterThan(u("2026-09-22"));
    expect(u("2026-09-22")).toBeGreaterThan(u("2026-10-15"));
    expect(u("2026-10-15")).toBeGreaterThanOrEqual(u(null));
  });

  it("contrato não assinado e fatura em aberto mantêm prontidão baixa", () => {
    expect(prontidao(caso({ contratoAssinado: false, pagamentoConfirmado: false }))).toBe(0);
  });

  it("pagamento confirmado soma um terço da prontidão", () => {
    expect(prontidao(caso({ pagamentoConfirmado: true }))).toBeCloseTo(1 / 3);
  });

  it("checklist incompleto conta como pendente, nunca como estimativa", () => {
    const eixos = eixosDoCaso(caso({ documentosMinimosOk: false }));
    expect(eixos.find((e) => e.rotulo === "Documentos")?.valor).toBe(0);
  });

  it("alerta aberto sobe pontos sem inverter prazo vencido", () => {
    const [primeiro, segundo] = ordemDeAtendimento(
      [
        caso({ id: "alerta", titulo: "Com alerta", alertasAbertos: 4 }),
        caso({ id: "normal", titulo: "Sem alerta" }),
      ],
      AGORA,
    );
    expect(primeiro?.caso.id).toBe("alerta");
    expect(segundo?.caso.id).toBe("normal");
  });

  it("empate de pontos é resolvido pelo título, de forma estável", () => {
    const lista = ordemDeAtendimento(
      [caso({ id: "b", titulo: "Bravo" }), caso({ id: "a", titulo: "Alfa" })],
      AGORA,
    );
    expect(lista.map((l) => l.caso.id)).toEqual(["a", "b"]);
  });
});
