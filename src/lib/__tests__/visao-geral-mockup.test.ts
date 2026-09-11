import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  recorteFunilHoje,
  receitaDoMes,
  taxaConversaoLeadParaCaso,
} from "@/lib/visao-geral-mockup";

describe("Visão Geral — receita e conversão reais", () => {
  it("sem lista de pagamentos não inventa zero", () => {
    expect(receitaDoMes(null, "2026-09")).toBeNull();
    expect(receitaDoMes(undefined, "2026-09")).toBeNull();
  });

  it("soma só o mês e só pagamento confirmado", () => {
    const pagamentos = [
      { status: "confirmado", pago_em: "2026-09-03", valor: 1200 },
      { status: "confirmado", pago_em: "2026-08-20", valor: 9000 },
      { status: "pendente", pago_em: "2026-09-10", valor: 500 },
    ];
    expect(receitaDoMes(pagamentos, "2026-09-11")).toBe(1200);
  });

  it("exclui DEMO por padrão", () => {
    const pagamentos = [{ status: "confirmado", pago_em: "2026-09-01", valor: 18400, dados_teste: true }];
    expect(receitaDoMes(pagamentos, "2026-09")).toBe(0);
    expect(receitaDoMes(pagamentos, "2026-09", true)).toBe(18400);
  });

  it("conversão sem lead criado não inventa 34%", () => {
    expect(taxaConversaoLeadParaCaso([])).toBeNull();
    expect(taxaConversaoLeadParaCaso([{ codigo: "caso_ativo", entidades: 3 }])).toBeNull();
  });

  it("conversão é casos ativos sobre leads criados", () => {
    expect(
      taxaConversaoLeadParaCaso([
        { codigo: "lead_criado", entidades: 10 },
        { codigo: "caso_ativo", entidades: 2 },
      ]),
    ).toBe(0.2);
  });

  it("recorte do funil do Hoje usa as cinco etapas do mockup", () => {
    const recorte = recorteFunilHoje([
      { codigo: "lead_criado", entidades: 8, rotulo: "Lead criado" },
      { codigo: "proposta_enviada", entidades: 3, rotulo: "Proposta enviada" },
    ]);
    expect(recorte.map((e) => e.rotulo)).toEqual(["Leads", "Discovery", "Propostas", "Contratos", "Casos"]);
    expect(recorte[0]?.entidades).toBe(8);
    expect(recorte[1]?.entidades).toBe(0);
  });
});

describe("Visão Geral — face do mockup no Hoje", () => {
  it("o topo declara os quatro KPIs, o funil e as prioridades", () => {
    const topo = readFileSync("src/components/painel/visao-geral-topo.tsx", "utf8");
    expect(topo).toContain("Funil de leads");
    expect(topo).toContain("Prioridades de hoje");
    expect(topo).toContain("Painel Hoje");
    expect(topo).toContain('to="/casos"');
    expect(topo).toContain('to="/financeiro"');
    expect(topo).toContain('to="/conversao"');
  });
});

