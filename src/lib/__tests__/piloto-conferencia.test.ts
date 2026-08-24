import { describe, expect, it } from "vitest";

import { conferenciaPiloto, LETRAS_GATE_PILOTO } from "@/lib/piloto-conferencia";

describe("conferência do piloto Ana Luiza", () => {
  it("expõe exatamente os gates A a H", () => {
    const c = conferenciaPiloto(null);
    expect(c.gates.map((g) => g.letra)).toEqual([...LETRAS_GATE_PILOTO]);
    expect(c.total).toBe(8);
  });

  it("permanece NO_GO enquanto houver gate crítico pendente", () => {
    const c = conferenciaPiloto(null);
    expect(c.situacao).toBe("NO_GO");
    expect(c.criticosPendentes.length).toBeGreaterThan(0);
    expect(c.explicacao).toContain("NO_GO");
  });

  it("mantém NO_GO mesmo com dados comerciais e financeiros preenchidos", () => {
    const c = conferenciaPiloto({
      condicoes_verificadas_em: "2026-08-01",
      proposta_referencia_interna: "PROP",
      escopo_incluido_resumido: "in",
      escopo_excluido_resumido: "out",
      marcos_gerais_da_proposta: "marcos",
      situacao_financeira: "quitado",
      pagamento_confirmado: true,
      contrato_assinado: true,
      metodo_assinatura: "eletronica",
    });
    expect(c.situacao).toBe("NO_GO");
  });

  it("declara origem e evidência para cada campo conferido", () => {
    for (const g of conferenciaPiloto(null).gates) {
      expect(g.campos.length).toBeGreaterThan(0);
      for (const campo of g.campos) {
        expect(campo.origem.length).toBeGreaterThan(0);
        expect(campo.evidencia.length).toBeGreaterThan(0);
      }
    }
  });

  it("reaproveita os requisitos de ativação da ficha nos gates correspondentes", () => {
    const gates = conferenciaPiloto(null).gates;
    const chaves = gates.flatMap((g) => g.requisitos.map((r) => r.chave));
    expect(chaves).toContain("assinatura");
    expect(chaves).toContain("pagamento_confirmado");
    expect(new Set(chaves).size).toBe(chaves.length);
  });
});
