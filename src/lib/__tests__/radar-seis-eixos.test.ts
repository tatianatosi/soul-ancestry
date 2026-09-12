import { describe, expect, it } from "vitest";

import { radarSeisDimensoes, TETO_ANCESTRAIS_G1_G5 } from "@/lib/radar-seis-eixos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";

function projecao(tipo: string, id = tipo): ProjecaoBruta {
  return {
    id,
    projection_type: tipo,
    content_sanitized: `Conteúdo de ${tipo}`,
    effective_from: "2026-06-01",
  };
}

describe("radarSeisDimensoes", () => {
  it("devolve exatamente as 6 dimensões do mockup, na ordem aprovada", () => {
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos: [] });
    expect(dimensoes.map((d) => d.id)).toEqual([
      "documentacao",
      "origem",
      "conexoes",
      "elegibilidade",
      "memoria",
      "legado",
    ]);
  });

  it("sem publicação nem documento, dimensões ficam em_preparacao (sem % inventado)", () => {
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos: [] });
    for (const d of dimensoes) {
      expect(d.estado).toBe("em_preparacao");
      expect(d.percentual).toBeNull();
    }
  });

  it("elegibilidade nunca lê parecer jurídico — é sempre a média dos outros 5 eixos", () => {
    const projecoes = [projecao("arvore"), projecao("achado"), projecao("marco")];
    const documentos: DocumentoPortal[] = [{ id: "1", liberado_cliente: true }];
    const dimensoes = radarSeisDimensoes({ projecoes, documentos });
    const outros = dimensoes.filter((d) => d.id !== "elegibilidade");
    const mediaEsperada = Math.round(
      outros.reduce((soma, d) => soma + (d.percentual ?? 0), 0) / outros.length,
    );
    const elegibilidade = dimensoes.find((d) => d.id === "elegibilidade")!;
    expect(elegibilidade.estado).toBe("percentual");
    expect(elegibilidade.percentual).toBe(mediaEsperada);
  });

  it("sem nenhum dado publicado, elegibilidade fica em_preparacao (não inventa 0% medido)", () => {
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos: [] });
    const eleg = dimensoes.find((d) => d.id === "elegibilidade")!;
    expect(eleg.estado).toBe("em_preparacao");
    expect(eleg.percentual).toBeNull();
  });

  it("documentação é a proporção real de documentos liberados, ignorando demo", () => {
    const documentos: DocumentoPortal[] = [
      { id: "1", liberado_cliente: true },
      { id: "2", liberado_cliente: false },
      { id: "3", liberado_cliente: true, is_demo: true },
    ];
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos });
    const doc = dimensoes.find((d) => d.id === "documentacao")!;
    expect(doc.percentual).toBe(50);
  });

  it("conexões familiares usa o teto genealógico de 31 (5 gerações), nunca o total do caso", () => {
    const projecoes = [projecao("arvore", "a1"), projecao("arvore", "a2"), projecao("linha_tempo", "a3")];
    const dimensoes = radarSeisDimensoes({ projecoes, documentos: [] });
    const conexoes = dimensoes.find((d) => d.id === "conexoes")!;
    expect(conexoes.percentual).toBe(Math.round((3 / TETO_ANCESTRAIS_G1_G5) * 100));
  });

  it("origem e conexões sobem juntas (mesma fonte, presença vs. contagem)", () => {
    const semNada = radarSeisDimensoes({ projecoes: [], documentos: [] });
    expect(semNada.find((d) => d.id === "origem")!.estado).toBe("em_preparacao");
    expect(semNada.find((d) => d.id === "conexoes")!.estado).toBe("em_preparacao");

    const comArvore = radarSeisDimensoes({ projecoes: [projecao("arvore")], documentos: [] });
    expect(comArvore.find((d) => d.id === "origem")!.percentual).toBe(100);
    expect(comArvore.find((d) => d.id === "conexoes")!.percentual).toBeGreaterThan(0);
  });

  it("memória só conta publicações do tipo achado", () => {
    const dimensoes = radarSeisDimensoes({
      projecoes: [projecao("achado", "m1"), projecao("arvore", "m2")],
      documentos: [],
    });
    expect(dimensoes.find((d) => d.id === "memoria")!.percentual).toBe(100);
  });

  it("legado conta publicações do tipo marco ou resumo", () => {
    const porMarco = radarSeisDimensoes({ projecoes: [projecao("marco")], documentos: [] });
    const porResumo = radarSeisDimensoes({ projecoes: [projecao("resumo")], documentos: [] });
    expect(porMarco.find((d) => d.id === "legado")!.percentual).toBe(100);
    expect(porResumo.find((d) => d.id === "legado")!.percentual).toBe(100);
  });

  it("nunca devolve percentual fora de 0-100", () => {
    const muitasProjecoes = Array.from({ length: 50 }, (_, i) => projecao("arvore", `p${i}`));
    const dimensoes = radarSeisDimensoes({ projecoes: muitasProjecoes, documentos: [] });
    for (const d of dimensoes) {
      if (d.percentual === null) continue;
      expect(d.percentual).toBeGreaterThanOrEqual(0);
      expect(d.percentual).toBeLessThanOrEqual(100);
    }
  });
});
