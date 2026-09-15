import { describe, expect, it } from "vitest";

import { prontidaoDoApp, prontidaoPorGrupo, resumoProntidao } from "./golive-prontidao";

describe("prontidão para o App", () => {
  it("separa o que já está liberado do que aguarda aprovação", () => {
    const itens = prontidaoDoApp({
      contratos: [
        { id: "c1", numero: "2026-CB-0001", titulo: "Estudo", status: "aguardando_assinatura" },
        { id: "c2", titulo: "Aditivo", status: "assinado", assinadoEm: "2026-09-01" },
      ],
      anexos: [{ id: "a1", codigo: "I", titulo: "Escopo", status: "vigente", obrigatorio: true }],
      documentos: [
        { id: "d1", titulo: "Certidão", liberadoCliente: true },
        { id: "d2", titulo: "Rascunho", liberadoCliente: false },
      ],
      propostas: [{ id: "p1", versao: 1, status: "aprovada", aprovadaEm: "2026-08-10" }],
      projecoes: [
        { id: "x1", estado: "published", tipo: "microentrega" },
        { id: "x2", estado: "rascunho", tipo: "microentrega" },
        { id: "x3", estado: "published", tipo: "nota", despublicadaEm: "2026-09-10" },
      ],
    });

    const resumo = resumoProntidao(itens);
    expect(resumo.total).toBe(9);
    expect(resumo.prontos).toBe(4);
    expect(resumo.faltam).toBe(5);
  });

  it("não considera pronta a projeção interna da equipe", () => {
    const itens = prontidaoDoApp({
      projecoes: [{ id: "x", estado: "published", visibilidade: "equipe_interna" }],
    });
    expect(itens[0]?.situacao).toBe("falta");
  });

  it("agrupa na mesma ordem mesmo sem dados", () => {
    const grupos = prontidaoPorGrupo([]);
    expect(grupos.map((g) => g.grupo)).toEqual(["Contrato", "Anexo", "Documento", "Proposta", "Publicação"]);
    expect(grupos.every((g) => g.prontos === 0 && g.faltam === 0)).toBe(true);
  });
});
