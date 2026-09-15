import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { estadoDaCall, porResultadoDiscovery, porSituacaoDaCall } from "@/lib/golive-comercial";
import { linhaDoLead, type LeadRadar } from "@/lib/golive-radar";

const lead = (extra: Partial<Record<string, unknown>> = {}) =>
  ({
    id: "l1",
    nome: "Lead",
    etapa: null,
    estagio: null,
    origem: null,
    canal: null,
    responsavel: null,
    ultimoToque: null,
    proximoPasso: null,
    proximoPassoEm: null,
    criadoEm: null,
    callAgendada: null,
    callRealizada: null,
    statusCall: null,
    resumoCall: null,
    discoveryResultado: null,
    ...extra,
  }) as never;

const leadRadar = (extra: Partial<LeadRadar> = {}): LeadRadar => ({
  id: "l1",
  nome: "Lead",
  etapa: null,
  estagio: null,
  proximoPasso: null,
  proximoPassoEm: null,
  callAgendada: null,
  callRealizada: null,
  propostaEm: null,
  casoId: null,
  ...extra,
});

describe("gráficos de calls e Discovery usam só o que está gravado", () => {
  it("situação da call vem do status gravado, com as datas só completando", () => {
    expect(estadoDaCall(lead({ statusCall: "cancelada_lead", callAgendada: "2026-09-01" }))).toBe("cancelada");
    expect(estadoDaCall(lead({ callRealizada: "2026-09-01" }))).toBe("realizada");
    expect(estadoDaCall(lead())).toBe("sem_agenda");
  });

  it("conta cada lead uma única vez na distribuição das calls", () => {
    const dados = porSituacaoDaCall([
      lead({ statusCall: "realizada" }),
      lead({ statusCall: "realizada" }),
      lead({ statusCall: "no_show" }),
      lead(),
    ]);
    expect(dados.reduce((s, d) => s + d.valor, 0)).toBe(4);
    expect(dados[0]).toEqual({ rotulo: "Realizada", valor: 2 });
  });

  it("Discovery sem registro aparece como estado próprio, nunca como zero escondido", () => {
    const dados = porResultadoDiscovery([lead({ discoveryResultado: "segue_para_proposta" }), lead()]);
    expect(dados.map((d) => d.rotulo).sort()).toEqual(["Segue para proposta", "Sem Discovery registrado"]);
  });

  it("Radar não trata call cancelada ou sem comparecimento como call de pé", () => {
    expect(linhaDoLead(leadRadar({ callAgendada: "2026-09-01", statusCall: "cancelada_clube" })).marco).toBe(
      "Call cancelada",
    );
    expect(linhaDoLead(leadRadar({ callAgendada: "2026-09-01", statusCall: "no_show" })).marco).toBe(
      "Call sem comparecimento",
    );
    expect(linhaDoLead(leadRadar({ callAgendada: "2026-09-01" })).marco).toBe("Call agendada");
    expect(linhaDoLead(leadRadar({ callRealizada: "2026-09-02" })).marco).toBe("Call realizada");
  });
});

describe("App Cliente não recebe conteúdo comercial", () => {
  const arquivos = ["src/routes/_authenticated/golive.app.tsx", "src/lib/golive-app.ts"];

  it("não menciona lead, call, Discovery nem funil", () => {
    for (const caminho of arquivos) {
      const texto = readFileSync(caminho, "utf8").toLowerCase();
      for (const termo of ["lead", "call", "discovery", "funil", "origem do lead"]) {
        expect(texto.includes(termo), `${caminho} menciona "${termo}"`).toBe(false);
      }
    }
  });

  it("não navega para telas internas do Desk", () => {
    for (const caminho of arquivos) {
      const texto = readFileSync(caminho, "utf8");
      expect(texto.includes("/golive/comercial")).toBe(false);
      expect(texto.includes("/golive/leads")).toBe(false);
    }
  });
});
