import { describe, expect, it } from "vitest";
import { agendaDoLead, colunaDoLead, funil, progressoRoteiro, type LeadComercial } from "@/lib/golive-comercial";

const base: LeadComercial = {
  id: "1", nome: "Ana Luiza", etapa: "novo", estagio: "novo", origem: null, canal: null,
  responsavel: null, ultimoToque: null, proximoPasso: null, proximoPassoEm: null, criadoEm: null,
  callAgendada: null, callRealizada: null, statusCall: null, resumoCall: null,
  discoveryResultado: null, objetivo: null, consentimento: null, consentimentoEm: null,
  consentimentoCanal: null, propostaReferencia: null, propostaEm: null, ultimaInteracaoEm: null, casoId: null,
};

describe("roteiro progressivo e agenda", () => {
  it("conta apenas respostas gravadas e aponta a próxima pergunta", () => {
    const vazio = progressoRoteiro(base);
    // situação da call sempre tem rótulo gravado ("sem agenda")
    expect(vazio.respondidas).toBe(1);
    expect(vazio.proxima?.pergunta).toBe("Qual é o objetivo da família?");

    const comObjetivo = progressoRoteiro({ ...base, objetivo: "Cidadania italiana" });
    expect(comObjetivo.respondidas).toBe(2);
    expect(comObjetivo.percentual).toBeGreaterThan(0);
    expect(comObjetivo.proxima?.pergunta).not.toBe("Qual é o objetivo da família?");
  });

  it("cada passo declara a fonte da resposta", () => {
    for (const passo of progressoRoteiro(base).proxima ? [progressoRoteiro(base).proxima!] : []) {
      expect(passo.fonte).toBeTruthy();
    }
  });

  it("agenda usa a situação e a data gravadas, com próxima ação", () => {
    const lead = { ...base, statusCall: "agendada", callAgendada: "2026-01-10", proximoPasso: "Enviar proposta", proximoPassoEm: "2026-01-12" };
    const agenda = agendaDoLead(lead, new Date("2026-01-20T12:00:00"))!;
    expect(agenda.estado).toBe("agendada");
    expect(agenda.quando).toBe("2026-01-10");
    expect(agenda.vencida).toBe(true);
    expect(agenda.proximaAcao).toBe("Enviar proposta");
    expect(agenda.prazo).toBe("vencida");
  });

  it("Discovery e call movem o lead no funil", () => {
    expect(colunaDoLead(base)).toBe("Lead");
    const comDiscovery = { ...base, discoveryResultado: "qualificado" };
    expect(colunaDoLead(comDiscovery)).toBe("Discovery");
    const comCall = { ...comDiscovery, callRealizada: "2026-01-11T10:00:00Z" };
    expect(colunaDoLead(comCall)).toBe("Call");
    expect(funil([base, comDiscovery, comCall]).find((f) => f.rotulo === "Call")?.valor).toBe(1);
  });

  it("agenda sem lead é nula", () => {
    expect(agendaDoLead(null)).toBeNull();
  });
});
