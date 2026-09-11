import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  celulasFunilMockup17,
  contarLeadsWhatsApp,
  diasDeEspera,
  ehCanalWhatsApp,
  percentualInteiro,
  recorteFunilHoje,
  recorteMesVisaoGeral,
  receitaDoMes,
  taxaConversaoLeadParaCaso,
  taxaLeadParaDiagnostico,
  tomEspera,
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

  it("recorte de cinco etapas permanece para a tela de Conversão", () => {
    const recorte = recorteFunilHoje([
      { codigo: "lead_criado", entidades: 8, rotulo: "Lead criado" },
      { codigo: "proposta_enviada", entidades: 3, rotulo: "Proposta enviada" },
    ]);
    expect(recorte.map((e) => e.rotulo)).toEqual(["Leads", "Discovery", "Propostas", "Contratos", "Casos"]);
    expect(recorte[0]?.entidades).toBe(8);
    expect(recorte[1]?.entidades).toBe(0);
  });
});

describe("Visão Geral — funil de 4 células da p. 11", () => {
  it("reconhece WhatsApp só pelo canal/origem gravado", () => {
    expect(ehCanalWhatsApp("WhatsApp")).toBe(true);
    expect(ehCanalWhatsApp(null, "indicação")).toBe(false);
    expect(
      contarLeadsWhatsApp(
        [
          { id: "a", canal: "whatsapp" },
          { id: "b", origem: "Instagram" },
        ],
        [{ event_type: "lead_criado", lead_id: "c", canal: "WhatsApp" }],
      ),
    ).toBe(2);
  });

  it("diagnóstico e cliente ficam nulos sem lead criado", () => {
    expect(taxaLeadParaDiagnostico([{ codigo: "discovery_realizada", entidades: 3 }])).toBeNull();
    expect(percentualInteiro(null)).toBeNull();
    expect(percentualInteiro(0.42)).toBe("42%");
  });

  it("monta as quatro células com barras navy, sage, gold e terracota", () => {
    const celulas = celulasFunilMockup17({
      funil: [
        { codigo: "lead_criado", entidades: 10 },
        { codigo: "discovery_realizada", entidades: 4 },
        { codigo: "caso_ativo", entidades: 1 },
      ],
      leads: [{ id: "a", canal: "whatsapp" }],
    });
    expect(celulas.map((c) => c.rotulo)).toEqual([
      "Novos leads",
      "Leads em WhatsApp",
      "Lead → diagnóstico",
      "Lead → cliente",
    ]);
    expect(celulas[0]?.texto).toBe("10");
    expect(celulas[1]?.texto).toBe("1");
    expect(celulas[2]?.texto).toBe("40%");
    expect(celulas[3]?.texto).toBe("10%");
    expect(celulas.map((c) => c.barra)).toEqual(["bg-navy", "bg-sage", "bg-gold", "bg-terracotta"]);
    expect(celulas.some((c) => c.texto.includes("18.400") || c.texto.includes("34%"))).toBe(false);
  });

  it("espera pinta 2d verde, 4d âmbar e 5d+ terracota", () => {
    expect(diasDeEspera("2026-09-09", "2026-09-11")).toBe(2);
    expect(tomEspera(2)).toBe("ok");
    expect(tomEspera(4)).toBe("atencao");
    expect(tomEspera(5)).toBe("critico");
  });

  it("eyebrow do mês não inventa julho fora de julho", () => {
    expect(recorteMesVisaoGeral(new Date(2026, 8, 11))).toBe("SETEMBRO 2026");
  });
});

describe("Visão Geral — face do mockup no Hoje", () => {
  it("o topo declara os quatro KPIs, o funil de 4 células e as prioridades", () => {
    const topo = readFileSync("src/components/painel/visao-geral-topo.tsx", "utf8");
    expect(topo).toContain("Funil de leads");
    expect(topo).toContain("Prioridades de hoje");
    expect(topo).toContain("Últimos 30 dias");
    expect(topo).toContain('rotulo="Taxa de conversão"');
    expect(topo).toContain('to="/casos"');
    expect(topo).toContain('to="/financeiro"');
    expect(topo).toContain('to="/conversao"');
    expect(topo).toContain("c.barra");
    expect(readFileSync("src/lib/visao-geral-mockup.ts", "utf8")).toContain('"bg-gold"');
    expect(readFileSync("src/lib/visao-geral-mockup.ts", "utf8")).toContain('"bg-terracotta"');
    expect(topo).not.toContain("18.400");
    expect(topo).not.toContain("34%");
  });
});

