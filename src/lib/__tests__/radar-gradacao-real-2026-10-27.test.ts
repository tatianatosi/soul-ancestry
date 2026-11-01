import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";

/**
 * Achado 24 da design critique do App Cliente (27/10/2026): a tela
 * `/portal/radar` descartava o percentual/estado/rotuloNumero/comoCalculamos
 * REAIS de `radarSeisDimensoes()` e os trocava por um binário fixo
 * ("Compartilhado"/"Em preparação"), desenhado numa mini-barra que só tinha
 * dois estados (width 0 ou 100%) — enquanto `andamento-publicado.tsx` já
 * usava a MESMA fonte corretamente (percentual real + JourneyProgress) em
 * todas as outras abas do App. A tela com o nome "Radar" era a única que
 * fingia gradação sem ter.
 *
 * Fix: o flatMap em radar.tsx só troca título/legenda (reconciliação de
 * nomes do App); percentual/estado/rotuloNumero/comoCalculamos continuam o
 * cálculo real. O chip e a barra usam esse dado real (`temDado`/`largura`),
 * não mais um booleano travado.
 */
const src = readFileSync("src/routes/portal/radar.tsx", "utf8");

describe("Radar do App — gradação real, não binário disfarçado", () => {
  it("o flatMap não sobrescreve mais percentual/estado/rotuloNumero/comoCalculamos com valores fixos", () => {
    expect(src).not.toContain('percentual: null, estado: "em_preparacao"');
    expect(src).not.toContain("Somente registros compartilhados; não representa nota");
    expect(src).toContain("...d, titulo: eixo.titulo, legenda: eixo.explicacao");
  });

  it("a barra usa largura derivada do percentual real, não um data-compartilhado fixo", () => {
    expect(src).not.toContain("data-compartilhado");
    expect(src).toContain("width: `${largura}%`");
  });

  it("radarSeisDimensoes continua devolvendo percentual numérico real para eixos com total conhecido", () => {
    const dims = radarSeisDimensoes({
      projecoes: [
        { id: "p1", projection_type: "arvore", pessoa_id: "pessoa-1", content_sanitized: "x" },
      ] as never,
      documentos: [
        { id: "d1", liberado_cliente: true },
        { id: "d2", liberado_cliente: false },
      ] as never,
      pessoasMapeadas: 2,
    });
    const docs = dims.find((d) => d.id === "documentacao")!;
    expect(docs.percentual).toBe(50);
  });
});
