import { describe, expect, it } from "vitest";
import { itensDerivadosDoCaso, itensDerivadosDoPainel } from "@/lib/painel-derivados";

const linha = (id: string, dias: number, extra: Record<string, unknown> = {}) => ({
  id,
  codigo: `CA-${id}`,
  responsavel_principal: "resp-1",
  cadencia: { diasSemTouchpoint: dias, status: dias >= 14 ? "critico" : "atencao" },
  ...extra,
});

describe("itens derivados do Painel Hoje", () => {
  it("deriva cadência D10/D14 com criticidade escalonada", () => {
    const itens = itensDerivadosDoPainel({ casosCadencia: [linha("a", 10), linha("b", 20)] });
    expect(itens.map((i) => i.criticidade)).toEqual(["critica", "alta"]);
  });

  it("não repete registro já exibido na fila do painel", () => {
    const itens = itensDerivadosDoPainel({
      casosCadencia: [linha("a", 12)],
      jaExibidos: new Set(["caso:a"]),
    });
    expect(itens).toHaveLength(0);
  });

  it("ignora espera externa comunicada", () => {
    const itens = itensDerivadosDoPainel({
      casosCadencia: [linha("a", 30, { aguardando_instituicao_externa: true, motivo_espera_externa: "cartório" })],
    });
    expect(itens.filter((i) => i.chave.startsWith("cadencia:"))).toHaveLength(0);
  });

  it("sinaliza caso sem responsável e gate de condição comercial", () => {
    const itens = itensDerivadosDoPainel({
      casosCadencia: [linha("a", 2, { responsavel_principal: null })],
      bloqueadosCatalogo: ["a"],
    });
    const chaves = itens.map((i) => i.chave);
    expect(chaves).toContain("sem-responsavel:a");
    expect(chaves.some((c) => c.startsWith("gate:a:"))).toBe(true);
  });

  it("filtra por caso e sempre aponta para o registro canônico", () => {
    const itens = itensDerivadosDoCaso("b", { casosCadencia: [linha("a", 15), linha("b", 15)] });
    expect(itens).toHaveLength(1);
    expect(itens[0]!.destino).toBe("/casos/b");
  });
});
