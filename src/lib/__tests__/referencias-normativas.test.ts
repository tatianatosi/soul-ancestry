import { describe, expect, it } from "vitest";
import {
  aplicavelAoCaso,
  ordenarReferencias,
  referenciaSegura,
  situacaoDe,
  type ReferenciaNormativa,
} from "@/lib/referencias-normativas";

const ref = (p: Partial<ReferenciaNormativa>): ReferenciaNormativa => ({
  id: "1",
  origem: "biblioteca",
  subarea: "Acervo",
  titulo: "Item",
  tipo: null,
  escopo: null,
  situacao: "em_revisao",
  versao: null,
  responsavel: null,
  trilha: null,
  apenasCatalogada: false,
  motivoAplicabilidade: "Referência normativa geral",
  ...p,
});

describe("ponte de referências normativas", () => {
  it("aplica por trilha do caso", () => {
    const r = aplicavelAoCaso({ citizenship_track_id: "t1" }, { trilhaId: "t1" });
    expect(r).toEqual({ aplicavel: true, motivo: "Trilha do caso" });
  });

  it("aplica por país ignorando acento e caixa", () => {
    expect(aplicavelAoCaso({ pais: "Itália" }, { pais: "italia" }).aplicavel).toBe(true);
  });

  it("mantém referência normativa geral sem país nem trilha", () => {
    expect(aplicavelAoCaso({}, { pais: "Itália" }).motivo).toBe("Referência normativa geral");
  });

  it("descarta registro fora do escopo do caso", () => {
    expect(aplicavelAoCaso({ pais: "Portugal" }, { pais: "Itália" }).aplicavel).toBe(false);
  });

  it("deriva situação de campos existentes, sem inventar estado", () => {
    expect(situacaoDe({ archived_at: "2026-01-01" })).toBe("arquivada");
    expect(situacaoDe({ status: "aprovado" })).toBe("homologada");
    expect(situacaoDe({ status: null, ativo: false })).toBe("em_revisao");
  });

  it("ordena homologadas antes de arquivadas", () => {
    const out = ordenarReferencias([
      ref({ id: "a", titulo: "A", situacao: "arquivada" }),
      ref({ id: "b", titulo: "B", situacao: "homologada" }),
    ]);
    expect(out.map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("bloqueia campo técnico ou sensível na ponte", () => {
    expect(referenciaSegura(ref({}) as unknown as Record<string, unknown>)).toBe(true);
    expect(referenciaSegura({ titulo: "x", url_referencia_interna: "https://…" })).toBe(false);
    expect(referenciaSegura({ titulo: "x", custo: 10 })).toBe(false);
  });
});
