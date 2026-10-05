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

  it("sem nenhuma publicação nem documento, todos os percentuais ficam em 0", () => {
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos: [] });
    for (const d of dimensoes) {
      if (d.id === "elegibilidade") continue;
      expect(d.percentual).toBe(0);
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

  it("sem nenhum dado publicado, elegibilidade fica em 0 (média de zeros, não em preparação)", () => {
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos: [] });
    expect(dimensoes.find((d) => d.id === "elegibilidade")!.percentual).toBe(0);
  });

  it("RADAR-APP-SEMANTICA-PROGRESSO: título do eixo 'elegibilidade' não usa o termo, e a legenda afirma progresso, não conclusão jurídica", () => {
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos: [] });
    const eixo = dimensoes.find((d) => d.id === "elegibilidade")!;
    expect(eixo.titulo).not.toMatch(/elegib/i);
    // A legenda pode mencionar "parecer jurídico"/"chance"/"resultado" só para
    // negá-los explicitamente — nunca afirmá-los. Checa a negação literal, não
    // a mera ausência da palavra.
    expect(eixo.legenda).toContain("não parecer jurídico");
    expect(eixo.legenda).toMatch(/progresso|andamento/i);
  });

  it("RADAR-APP-SEMANTICA-PROGRESSO: nenhum título dos 6 eixos usa vocabulário jurídico/conclusivo", () => {
    const dimensoes = radarSeisDimensoes({ projecoes: [], documentos: [] });
    for (const d of dimensoes) {
      expect(d.titulo).not.toMatch(/elegib|chance|probabilidade|parecer/i);
    }
    expect(dimensoes).toHaveLength(6);
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

  it("conexões familiares não apresenta o teto ilustrativo como total da família", () => {
    const projecoes = [projecao("arvore", "a1"), projecao("arvore", "a2"), projecao("linha_tempo", "a3")];
    const dimensoes = radarSeisDimensoes({ projecoes, documentos: [] });
    const conexoes = dimensoes.find((d) => d.id === "conexoes")!;
    expect(conexoes.rotuloNumero).toBe("3 registro(s)");
    expect(conexoes.legenda + conexoes.comoCalculamos).not.toContain(String(TETO_ANCESTRAIS_G1_G5));
    expect(conexoes.percentual).toBe(100);
  });

  it("origem e conexões sobem juntas (mesma fonte, presença vs. contagem)", () => {
    const semNada = radarSeisDimensoes({ projecoes: [], documentos: [] });
    expect(semNada.find((d) => d.id === "origem")!.percentual).toBe(0);
    expect(semNada.find((d) => d.id === "conexoes")!.percentual).toBe(0);

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
