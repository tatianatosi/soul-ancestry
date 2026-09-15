/**
 * Patch P0 do Comercial go-live.
 *
 * Regras provadas aqui: lead nasce sem caso, call vencida respeita status e
 * hora, proposta sem follow-up usa a data da proposta e interações posteriores
 * (nunca `updated_at`), e leads sem data de entrada não somem da lista.
 */
import { describe, expect, it } from "vitest";

import {
  callVencidaDoLead,
  colunaDoLead,
  estadoDaCall,
  noPeriodo,
  saudeDosLeads,
  semDataDeEntrada,
  type LeadComercial,
} from "@/lib/golive-comercial";

const base: LeadComercial = {
  id: "l1",
  nome: "Lead",
  etapa: "novo",
  estagio: "novo",
  origem: "indicacao",
  canal: "real",
  responsavel: "Tatiana",
  ultimoToque: null,
  proximoPasso: "Agendar call",
  proximoPassoEm: null,
  criadoEm: "2026-09-10T12:00:00Z",
  callAgendada: null,
  callRealizada: null,
  statusCall: null,
  resumoCall: null,
  discoveryResultado: null,
  objetivo: null,
  consentimento: null,
  consentimentoEm: null,
  consentimentoCanal: null,
  propostaReferencia: null,
  propostaEm: null,
  ultimaInteracaoEm: null,
  casoId: null,
};

const agora = new Date("2026-09-15T09:00:00");

describe("1. lead sem caso por padrão", () => {
  it("lead sem case_id fica na coluna Lead", () => {
    expect(colunaDoLead(base)).toBe("Lead");
  });

  it("só o handoff com caso vinculado muda a coluna", () => {
    expect(colunaDoLead({ ...base, casoId: "caso-1" })).toBe("Handoff");
  });
});

describe("3. call vencida", () => {
  it("agendada com hora no passado vence", () => {
    expect(callVencidaDoLead({ ...base, statusCall: "agendada", callAgendada: "2026-09-14T15:00:00" }, agora)).toBe(true);
  });

  it("confirmada com hora futura não vence", () => {
    expect(callVencidaDoLead({ ...base, statusCall: "confirmada", callAgendada: "2026-09-15T18:00:00" }, agora)).toBe(false);
  });

  it("data sem hora no mesmo dia não vence pela manhã", () => {
    expect(callVencidaDoLead({ ...base, statusCall: "agendada", callAgendada: "2026-09-15" }, agora)).toBe(false);
  });

  it("data sem hora de ontem vence", () => {
    expect(callVencidaDoLead({ ...base, statusCall: "agendada", callAgendada: "2026-09-14" }, agora)).toBe(true);
  });

  it("cancelada, remarcada, no-show e realizada não vencem", () => {
    for (const s of ["cancelada_lead", "cancelada_clube", "remarcada", "no_show", "realizada"]) {
      expect(callVencidaDoLead({ ...base, statusCall: s, callAgendada: "2026-09-01T10:00:00" }, agora)).toBe(false);
    }
  });

  it("call já realizada não vence mesmo sem status", () => {
    expect(
      callVencidaDoLead(
        { ...base, callAgendada: "2026-09-01T10:00:00", callRealizada: "2026-09-01T10:30:00" },
        agora,
      ),
    ).toBe(false);
  });

  it("estado da call vem do status gravado", () => {
    expect(estadoDaCall({ ...base, statusCall: "remarcada" })).toBe("remarcada");
    expect(estadoDaCall(base)).toBe("sem_agenda");
  });
});

describe("4. proposta sem follow-up", () => {
  it("proposta sem interação posterior conta como pendente", () => {
    const l = { ...base, propostaReferencia: "P-1", propostaEm: "2026-09-01T10:00:00Z" };
    expect(saudeDosLeads([l], agora).propostaSemFollowUp).toHaveLength(1);
  });

  it("interação posterior à proposta limpa a pendência", () => {
    const l = {
      ...base,
      propostaReferencia: "P-1",
      propostaEm: "2026-09-01T10:00:00Z",
      ultimaInteracaoEm: "2026-09-05T10:00:00Z",
    };
    expect(saudeDosLeads([l], agora).propostaSemFollowUp).toHaveLength(0);
  });

  it("proposta sem data vira lacuna declarada, não pendência", () => {
    const l = { ...base, propostaReferencia: "P-1", ultimoToque: "2026-09-02T10:00:00Z" };
    const s = saudeDosLeads([l], agora);
    expect(s.propostaSemFollowUp).toHaveLength(0);
    expect(s.propostaSemData).toHaveLength(1);
  });
});

describe("5. período e leads sem data de entrada", () => {
  it("lead sem data de entrada continua na lista", () => {
    const l = { ...base, criadoEm: null };
    expect(noPeriodo([l], 30, agora)).toHaveLength(1);
    expect(semDataDeEntrada([l])).toHaveLength(1);
  });

  it("lead fora do período sai do recorte", () => {
    const l = { ...base, criadoEm: "2026-01-01T10:00:00Z" };
    expect(noPeriodo([l], 30, agora)).toHaveLength(0);
  });
});
