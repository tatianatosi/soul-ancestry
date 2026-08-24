import { describe, expect, it } from "vitest";

import {
  CATEGORIAS_GATE,
  estadoDerivadoPorGates,
  gatesAtivacaoFicha,
  gatesPorCategoria,
} from "@/lib/gates-ativacao-ficha";

const casoVazio = { id: "caso-1" };

const casoCompleto = {
  id: "caso-2",
  condicoes_verificadas_em: "2026-08-01",
  proposta_referencia_interna: "PROP-1",
  escopo_incluido_resumido: "incluído",
  escopo_excluido_resumido: "excluído",
  marcos_gerais_da_proposta: "marcos",
  preparacao_instrumentos: "pronto_para_assinatura",
  contrato_assinado: true,
  cobranca_aprovada: true,
  pagamento_confirmado: true,
  ativacao_operacional: "aprovada",
};

describe("requisitos da ficha operacional por categoria", () => {
  it("classifica todo requisito em uma das quatro categorias canônicas", () => {
    for (const g of gatesAtivacaoFicha(casoVazio)) {
      expect(CATEGORIAS_GATE).toContain(g.categoria);
    }
  });

  it("agrupa sem perder nem duplicar requisitos", () => {
    const blocos = gatesPorCategoria(casoVazio);
    const total = blocos.reduce((s, b) => s + b.total, 0);
    expect(blocos.map((b) => b.categoria)).toEqual([...CATEGORIAS_GATE]);
    expect(total).toBe(gatesAtivacaoFicha(casoVazio).length);
  });

  it("marca categoria como pendente enquanto faltar evidência", () => {
    const blocos = gatesPorCategoria(casoVazio);
    expect(blocos.every((b) => b.estado === "pendente")).toBe(true);
  });

  it("deriva bloqueio explicável a partir do primeiro requisito pendente", () => {
    const e = estadoDerivadoPorGates(casoVazio);
    expect(e.elegivel).toBe(false);
    expect(e.categoriaBloqueante).toBe("Comercial");
    expect(e.explicacao).toContain("requisito");
  });

  it("com todas as evidências, mantém a ativação dependente de decisão humana", () => {
    const e = estadoDerivadoPorGates(casoCompleto);
    expect(e.elegivel).toBe(true);
    expect(e.pendentes).toHaveLength(0);
    expect(e.explicacao).toContain("decidida por pessoa autorizada");
    expect(gatesPorCategoria(casoCompleto).every((b) => b.estado === "concluida")).toBe(true);
  });
});
