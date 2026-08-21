import { describe, expect, it } from "vitest";

import { classificarPrazo, escadaConversao, handoffLead, listaPrioritaria, type Fila, type LeadDesk } from "@/lib/crm-desk";

const base: LeadDesk = { nome: "Teste" };

describe("escada de conversão", () => {
  it("João: aceite verbal com confirmação formal pendente mantém contrato e cobrança bloqueados", () => {
    const joao: LeadDesk = { ...base, nome: "João", eixo_comercial: "negociacao", eixo_formalizacao: "nao_iniciado" };
    const e = escadaConversao(joao);
    expect(e[0]?.estado).toBe("concluido");
    expect(e[1]?.estado).toBe("em_andamento");
    expect(e[2]?.estado).toBe("bloqueado");
    expect(e[3]?.estado).toBe("bloqueado");
  });

  it("Ana: aceite confirmado com formalização pendente mantém onboarding bloqueado", () => {
    const ana: LeadDesk = {
      ...base,
      nome: "Ana Luiza",
      eixo_comercial: "negociacao",
      eixo_formalizacao: "contrato_enviado",
    };
    const e = escadaConversao(ana);
    expect(e[1]?.estado).toBe("concluido");
    expect(e[2]?.estado).toBe("em_andamento");
    expect(e[3]?.estado).toBe("bloqueado");
  });

  it("aceite verbal nunca conclui contrato/cobrança nem onboarding", () => {
    const e = escadaConversao({ ...base, eixo_comercial: "proposta_enviada" });
    expect(e.filter((d) => d.estado === "concluido").map((d) => d.chave)).toEqual(["aceite_verbal"]);
  });
});

describe("handoff", () => {
  it("marca oportunidade sem responsável, próxima ação ou prazo como não operável", () => {
    const h = handoffLead({ ...base, eixo_comercial: "discovery_realizada" });
    expect(h.operavel).toBe(false);
    expect(h.bloqueios.some((b) => b.alvo === "proposta")).toBe(true);
  });

  it("separa confirmado e pendente do Discovery e bloqueia onboarding sem pagamento", () => {
    const h = handoffLead({
      ...base,
      responsavel_nome: "Tati",
      area_responsavel: "comercial",
      proxima_acao: "agendar_call",
      proxima_acao_em: "2026-08-25",
      discovery_resultado: "seguir_proposta",
      resumo_validado: true,
      call_realizada_em: "2026-08-20T14:00:00Z",
      eixo_formalizacao: "contrato_assinado",
    });
    expect(h.operavel).toBe(true);
    expect(h.confirmado).toContain("Resumo da call validado");
    expect(h.bloqueios.some((b) => b.alvo === "onboarding")).toBe(true);
  });
});

describe("cockpit diário", () => {
  it("classifica prazo em atraso, hoje e futuro", () => {
    expect(classificarPrazo("2026-08-20", "2026-08-21").chave).toBe("atrasado");
    expect(classificarPrazo("2026-08-21", "2026-08-21").chave).toBe("hoje");
    expect(classificarPrazo("2026-08-25", "2026-08-21").chave).toBe("futuro");
    expect(classificarPrazo(null, "2026-08-21").chave).toBe("sem_data");
  });

  it("ordena por prazo da próxima ação e não por criação, respeitando filtros", () => {
    const filas: Fila[] = [
      {
        chave: "a",
        rotulo: "Ações vencidas",
        criticidade: 1,
        itens: [
          {
            id: "1",
            rotulo: "Lead antigo",
            detalhe: "vencida",
            data: "2026-08-30",
            tipo: "lead",
            area: "comercial",
            responsavel: "Tati",
            etapa: "negociacao",
          },
        ],
      },
      {
        chave: "b",
        rotulo: "Ações de hoje",
        criticidade: 5,
        itens: [
          {
            id: "2",
            rotulo: "Lead novo",
            detalhe: "hoje",
            data: "2026-08-21",
            tipo: "lead",
            area: "operacoes",
            responsavel: "Ana",
            etapa: "triagem",
          },
        ],
      },
    ];
    expect(listaPrioritaria(filas).map((i) => i.id)).toEqual(["2", "1"]);
    expect(listaPrioritaria(filas, { area: "comercial" }).map((i) => i.id)).toEqual(["1"]);
    expect(listaPrioritaria(filas, { responsavel: "Ana" }).map((i) => i.id)).toEqual(["2"]);
    expect(listaPrioritaria(filas, { etapa: "negociacao" }).map((i) => i.id)).toEqual(["1"]);
  });
});
