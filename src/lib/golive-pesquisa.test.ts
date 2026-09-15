import { describe, expect, it } from "vitest";

import {
  cadeiaPesquisa,
  coberturaPorFonte,
  etapaEditorial,
  filaEditorial,
  inicioDaSemana,
  producaoSemanal,
  rotuloTipoEvidencia,
} from "@/lib/golive-pesquisa";

const ev = (over: Partial<Parameters<typeof coberturaPorFonte>[0][number]> = {}) => ({
  id: Math.random().toString(36).slice(2),
  titulo: "Evidência",
  tipo: "document",
  status: "validated",
  confianca: "high",
  ...over,
});

describe("cobertura por fonte", () => {
  it("separa validada de em revisão", () => {
    const linhas = coberturaPorFonte([
      ev({ status: "validated" }),
      ev({ status: "under_review" }),
      ev({ status: "collected" }),
    ]);
    expect(linhas).toHaveLength(1);
    expect(linhas[0]).toMatchObject({ rotulo: "Documento", validadas: 1, emRevisao: 2, total: 3 });
  });

  it("descartada e inconclusiva não contam como revisão nem validada", () => {
    const [linha] = coberturaPorFonte([ev({ status: "discarded" }), ev({ status: "inconclusive" })]);
    expect(linha).toMatchObject({ validadas: 0, emRevisao: 0, total: 2 });
  });

  it("tipo desconhecido vira Outros/sem classificação", () => {
    expect(rotuloTipoEvidencia("inexistente")).toBe("Outros/sem classificação");
    expect(rotuloTipoEvidencia(null)).toBe("Outros/sem classificação");
  });

  it("sem evidência, nenhuma linha", () => {
    expect(coberturaPorFonte([])).toEqual([]);
  });
});

describe("produção semanal", () => {
  const agora = new Date(2026, 8, 15, 10, 0, 0); // terça, 15/09/2026

  it("semana começa na segunda", () => {
    expect(inicioDaSemana(agora).getDate()).toBe(14);
    // domingo pertence à semana anterior
    expect(inicioDaSemana(new Date(2026, 8, 13, 23, 0, 0)).getDate()).toBe(7);
  });

  it("conta fontes, evidências e achados na semana correta", () => {
    const semanas = producaoSemanal(
      {
        fontes: [{ id: "f", titulo: "F", tipo: null, status: null, criadaEm: "2026-09-15T12:00:00Z" }],
        evidencias: [ev({ criadaEm: "2026-09-14T09:00:00-03:00" })],
        achados: [{ id: "a", titulo: "A", confianca: null, validacao: null, criadoEm: "2026-09-08T12:00:00Z" }],
      },
      7,
      agora,
    );
    expect(semanas).toHaveLength(7);
    const ultima = semanas[6]!;
    expect(ultima).toMatchObject({ fontes: 1, evidencias: 1, achados: 0, total: 2 });
    expect(semanas[5]).toMatchObject({ achados: 1, total: 1 });
  });

  it("registro fora da janela e sem data não entram", () => {
    const semanas = producaoSemanal(
      {
        fontes: [{ id: "f", titulo: "F", tipo: null, status: null, criadaEm: "2025-01-01T12:00:00Z" }],
        evidencias: [ev({ criadaEm: null })],
        achados: [],
      },
      7,
      agora,
    );
    expect(semanas.reduce((s, x) => s + x.total, 0)).toBe(0);
  });
});

describe("fila editorial", () => {
  it("mapeia estados canônicos", () => {
    expect(etapaEditorial("pauta_aprovada")).toBe("rascunho");
    expect(etapaEditorial("em_revisao")).toBe("revisao");
    expect(etapaEditorial("agendado")).toBe("aprovado");
    expect(etapaEditorial("publicado")).toBe("publicado");
    expect(etapaEditorial("arquivado")).toBe("outros");
    expect(etapaEditorial(null)).toBe("outros");
  });

  it("quatro colunas sempre, Outros só quando houver item", () => {
    const base = filaEditorial([{ id: "1", titulo: "T", tipo: "artigo", status: "publicado" }]);
    expect(base.map((c) => c.etapa)).toEqual(["rascunho", "revisao", "aprovado", "publicado"]);
    const comOutros = filaEditorial([{ id: "2", titulo: "T", tipo: "artigo", status: "arquivado" }]);
    expect(comOutros.map((c) => c.etapa)).toContain("outros");
  });
});

describe("cadeia visual", () => {
  it("tem seis passos e marca só o que existe", () => {
    const passos = cadeiaPesquisa({
      perguntas: 2,
      fontes: [{ id: "f", titulo: "F", tipo: null, status: null }],
      evidencias: [ev({ status: "under_review" })],
      achados: [],
      editorial: [],
    });
    expect(passos.map((p) => p.rotulo)).toEqual([
      "Pergunta",
      "Fonte",
      "Evidência",
      "Achado",
      "Revisão",
      "Publicação",
    ]);
    expect(passos[4]).toMatchObject({ quantidade: 1, feito: true });
    expect(passos[3]).toMatchObject({ quantidade: 0, feito: false });
    expect(passos[5]).toMatchObject({ quantidade: 0, feito: false });
  });
});
