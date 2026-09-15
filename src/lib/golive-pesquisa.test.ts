import { describe, expect, it } from "vitest";

import {
  coberturaPorFonte,
  filaEditorial,
  filaEmSerie,
  producaoPorSemana,
} from "./golive-pesquisa";

describe("cobertura por fonte", () => {
  it("agrupa pela fonte gravada e separa validada de em revisão", () => {
    const cobertura = coberturaPorFonte(
      [
        { id: "1", fonteId: "f1", status: "aprovada_para_entrega" },
        { id: "2", fonteId: "f1", status: "em_revisao" },
        { id: "3", tipo: "registro_civil", status: "registrada" },
      ],
      [{ id: "f1", titulo: "Arquivo Paroquial" }],
    );
    expect(cobertura[0]).toEqual({ origem: "Arquivo Paroquial", total: 2, validadas: 1, emRevisao: 1 });
    expect(cobertura[1]?.origem).toBe("registro_civil");
  });

  it("sem evidência não devolve linha", () => {
    expect(coberturaPorFonte([], [])).toEqual([]);
  });
});

describe("produção por semana", () => {
  it("ignora registro sem data e soma os três tipos", () => {
    const serie = producaoPorSemana(
      [{ id: "f", registradaEm: "2026-09-14" }],
      [{ id: "e", registradaEm: "2026-09-15" }, { id: "e2" }],
      [{ id: "a", registradoEm: "2026-09-15" }],
    );
    expect(serie).toHaveLength(1);
    expect(serie[0]?.valor).toBe(3);
  });
});

describe("fila editorial", () => {
  it("classifica evidências e achados nos quatro estados", () => {
    const fila = filaEditorial(
      [
        { id: "1", status: "publicada" },
        { id: "2", status: "aprovada_para_entrega" },
        { id: "3", status: "em_revisao" },
        { id: "4", status: "recebida" },
      ],
      [{ id: "a", validacao: "confirmado" }],
    );
    expect(fila).toEqual({ rascunho: 1, revisao: 1, aprovado: 2, publicado: 1 });
    expect(filaEmSerie(fila)).toHaveLength(4);
  });

  it("acervo vazio mantém os quatro estados em zero", () => {
    expect(filaEditorial([], [])).toEqual({ rascunho: 0, revisao: 0, aprovado: 0, publicado: 0 });
  });
});

describe("impactoNaArvore", () => {
  it("conta só achado validado internamente e separa por impacto", () => {
    const r = impactoNaArvore([
      { id: "1", titulo: "A", validacao: "validado_internamente", impactoArvore: "aplicado", validadoEm: "2026-09-15T12:00:00Z" },
      { id: "2", titulo: "B", validacao: "validado_internamente", impactoArvore: "proposto" },
      { id: "3", titulo: "C", validacao: "validado_internamente", impactoArvore: "nenhum" },
      { id: "4", titulo: "D", validacao: "em_revisao", impactoArvore: "nenhum" },
    ]);
    expect(r.validados).toBe(3);
    expect(r.aplicados).toBe(1);
    expect(r.propostos).toBe(1);
    expect(r.semImpacto).toBe(1);
    expect(r.emRevisao).toBe(1);
    expect(r.itens.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("sem achado, devolve tudo zerado e nenhum item", () => {
    const r = impactoNaArvore([]);
    expect(r).toMatchObject({ validados: 0, aplicados: 0, propostos: 0, emRevisao: 0 });
    expect(r.itens).toEqual([]);
  });
});
