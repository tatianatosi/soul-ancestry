import { describe, expect, it } from "vitest";

import {
  etapaDoResultado,
  kanbanPorPrazo,
  porResultadoDiscovery,
  porSituacaoDaCall,
  prazoDaProximaAcao,
  roteiroDiscovery,
  type LeadComercial,
} from "@/lib/golive-comercial";

const base: LeadComercial = {
  id: "1",
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
  objetivo: null,
  consentimento: null,
  consentimentoEm: null,
  consentimentoCanal: null,
  propostaReferencia: null,
  propostaEm: null,
  ultimaInteracaoEm: null,
  casoId: null,
};
const lead = (p: Partial<LeadComercial>): LeadComercial => ({ ...base, ...p });

describe("etapa a partir do resultado do Discovery", () => {
  it("mapeia só a lista fechada", () => {
    expect(etapaDoResultado("segue_para_proposta")).toBe("proposta_em_preparo");
    expect(etapaDoResultado("precisa_mais_informacao")).toBe("qualificado");
    expect(etapaDoResultado("fora_de_perfil")).toBe("perdido");
    expect(etapaDoResultado("sem_resposta")).toBe("novo");
  });
  it("não muda etapa sem resultado ou com valor desconhecido", () => {
    expect(etapaDoResultado(null)).toBeNull();
    expect(etapaDoResultado("qualquer_coisa")).toBeNull();
  });
});

describe("prazo da próxima ação", () => {
  const hoje = new Date("2026-09-15T10:00:00");
  it("classifica vencida, hoje, próximos 7 e depois", () => {
    expect(prazoDaProximaAcao(lead({ proximoPassoEm: "2026-09-14" }), hoje)).toBe("vencida");
    expect(prazoDaProximaAcao(lead({ proximoPassoEm: "2026-09-15" }), hoje)).toBe("hoje");
    expect(prazoDaProximaAcao(lead({ proximoPassoEm: "2026-09-20" }), hoje)).toBe("proximos_7");
    expect(prazoDaProximaAcao(lead({ proximoPassoEm: "2026-10-30" }), hoje)).toBe("depois");
  });
  it("sem prazo gravado fica sem prazo", () => {
    expect(prazoDaProximaAcao(lead({}), hoje)).toBe("sem_prazo");
  });
  it("kanban tem quatro colunas fixas, mesmo vazias", () => {
    const colunas = kanbanPorPrazo([lead({ proximoPassoEm: "2026-09-14" })], hoje);
    expect(colunas.map((c) => c.chave)).toEqual(["vencida", "hoje", "proximos_7", "sem_prazo"]);
    expect(colunas[0]!.leads).toHaveLength(1);
  });
});

describe("gráficos de call e Discovery", () => {
  it("conta situação da call pelo estado gravado", () => {
    const dados = porSituacaoDaCall([
      lead({ statusCall: "realizada", callRealizada: "2026-09-10" }),
      lead({ id: "2" }),
    ]);
    expect(dados.reduce((s, d) => s + d.valor, 0)).toBe(2);
    expect(dados.some((d) => d.rotulo === "Sem call marcada")).toBe(true);
  });
  it("resultado fora da lista vira Outros/sem classificação", () => {
    const dados = porResultadoDiscovery([
      lead({ discoveryResultado: "segue_para_proposta" }),
      lead({ id: "2", discoveryResultado: "coisa_estranha" }),
      lead({ id: "3" }),
    ]);
    expect(dados.find((d) => d.rotulo === "Outros/sem classificação")?.valor).toBe(1);
    expect(dados.find((d) => d.rotulo === "Sem Discovery registrado")?.valor).toBe(1);
  });
});

describe("roteiro progressivo", () => {
  it("marca pendente quando não há dado gravado", () => {
    const passos = roteiroDiscovery(lead({ objetivo: "Cidadania italiana" }));
    expect(passos).toHaveLength(6);
    expect(passos[0]!.estado).toBe("respondida");
    expect(passos[0]!.fonte).toBe("Entrada do lead");
    expect(passos[4]!.estado).toBe("pendente");
  });
  it("sem lead, tudo pendente menos nada inventado", () => {
    expect(roteiroDiscovery(null).every((p) => p.estado === "pendente")).toBe(true);
  });
});
