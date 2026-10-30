/**
 * G2 — Caso 360 em cards-resumo da vida do cliente (23/10/2026).
 * Decisão da Proprietária: Caso 360 = visão MACRO (cards); GoLive = vida completa.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { montarCardsVida } from "@/components/caso/cards-vida-do-cliente";

const pagina = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const base: any = {
  encontrado: true,
  caso: { id: "c1", codigo: "CA-1", titulo: "Caso", proximaAcao: null },
  lead: { estagio: "discovery", origem: "indicacao", callRealizada: true },
  pessoas: [{ id: "p1" }, { id: "p2" }],
  dependentes: [],
  consentimentos: [{ id: "k" }],
  hipoteses: [{ id: "h" }],
  evidencias: [],
  achados: [{ id: "a1", validadoEm: "2026-10-01" }, { id: "a2", validacao: "pendente" }],
  propostas: [{ id: "pr", status: "aprovada", aprovadaEm: "x" }],
  contratos: [{ id: "ct", status: "sent", assinadoEm: null }],
  ordensServico: [],
  faturas: [
    { id: "f1", status: "paga", valor: 100, valorPago: 100 },
    { id: "f2", status: "vencida", valor: 300, valorPago: 0 },
  ],
  microentregas: [{ id: "m1", status: "aberta", concluidaEm: null }, { id: "m2", status: "concluida", concluidaEm: "x" }],
  documentos: [{ id: "d1", liberadoCliente: true }],
  publicados: [],
  projecoesEstados: [{ id: "pe", estado: "rascunho" }],
  tarefas: [{ id: "t1", status: "aberta", bloqueio: true }],
};

describe("cards da vida do cliente", () => {
  const cards = montarCardsVida(base);

  it("são 8 cards, do lead ao App, cada um com saída para o GoLive", () => {
    expect(cards.map((c) => c.id)).toEqual(["lead", "pessoas", "pesquisa", "contrato", "financeiro", "entregas", "app", "proxima"]);
    for (const c of cards) expect(c.golive.startsWith("/golive")).toBe(true);
  });

  it("números saem dos registros, não de estimativa", () => {
    const v = (id: string, r: string) => cards.find((c) => c.id === id)!.linhas.find((l) => l.rotulo === r)!.valor;
    expect(v("pessoas", "Pessoas no caso")).toBe(2);
    expect(v("pesquisa", "Achados validados")).toBe("1 de 2");
    expect(v("contrato", "Contratos")).toBe("1 · 0 assinado(s)");
    expect(v("financeiro", "Pagas")).toBe(1);
    expect(v("entregas", "Microentregas abertas")).toBe("1 de 2");
    expect(v("proxima", "Bloqueadas")).toBe(1);
  });

  it("zero aparece como zero declarado (P8), nunca some", () => {
    const v = cards.find((c) => c.id === "pesquisa")!.linhas.find((l) => l.rotulo === "Evidências")!.valor;
    expect(v).toBe("0 · sem registro ainda");
  });

  it("sinaliza o que pede atenção", () => {
    expect(cards.find((c) => c.id === "contrato")!.atencao).toMatch(/sem assinatura/);
    expect(cards.find((c) => c.id === "financeiro")!.atencao).toMatch(/vencida/);
    expect(cards.find((c) => c.id === "proxima")!.atencao).toMatch(/sem próxima ação/);
  });
});

describe("Caso 360: resumo por padrão, ficha completa em modo próprio", () => {
  it("abre no resumo (cards) e não empilha a ficha embaixo", () => {
    expect(pagina).toMatch(/useState<"resumo" \| "ficha">\("resumo"\)/);
    expect(pagina).toMatch(/modo === "resumo" \?\s*\(\s*<CardsVidaDoCliente/);
  });

  it("a ficha completa continua montada (editores preservados — AGENTS.md)", () => {
    for (const marca of ["FichaQuatroLotesGoLive", "PainelFichaUnica", "PainelJornadaPlanejador", "EstadoIntegradoCaso", "SecaoAncora id=\"financeiro\""]) {
      expect(pagina, marca).toContain(marca);
    }
  });

  it("menu #visao abre o resumo; outras seções abrem a ficha na seção", () => {
    expect(pagina).toMatch(/if \(secao && secao\.id !== "visao"\) setModo\("ficha"\)/);
  });

  it("dá para voltar ao resumo e ir à vida completa no GoLive", () => {
    expect(pagina).toContain("← Voltar ao resumo (Caso 360)");
    expect(pagina).toMatch(/to="\/golive" search=\{\{ casoId: id \}\}/);
  });
});
