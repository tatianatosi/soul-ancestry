import { describe, expect, it } from "vitest";

import { agregarDossiePesquisa } from "@/lib/pesquisa-dossie";

describe("Tela 07 — dossiê de pesquisa (/pesquisa-modulo)", () => {
  it("1. KPIs contam acervos, hipóteses abertas, evidências validadas e cartórios acionados", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [{ id: "a1" }, { id: "a2" }, { id: "a3" }],
      hipoteses: [
        { status: "open" },
        { status: "under_review" },
        { status: "supported" },
        { status: "closed" },
      ],
      evidencias: [
        { evidence_status: "validated", created_at: "2026-10-01" },
        { evidence_status: "validated", created_at: "2026-09-15" },
        { evidence_status: "under_review", created_at: "2026-10-05" },
      ],
      fontes: [{ source_type: "civil_record" }],
      pedidos: [
        { status: "requested_from_client", target_institution: "Cartório de Lucca" },
        { status: "completed", target_institution: "Cartório de Lucca" },
        { status: "draft", target_institution: "Paróquia de Santos" },
        { status: "under_review", target_institution: null },
      ],
    });

    expect(d.acervosMapeados).toBe(3);
    expect(d.hipotesesEmAberto).toBe(2);
    expect(d.evidenciasValidadas).toBe(2);
    // "Cartório de Lucca" só conta uma vez; pedido em draft e sem instituição não contam.
    expect(d.cartoriosAcionados).toBe(1);
  });

  it("2. cobertura de fontes agrupa por source_type real, maior quantidade primeiro, com rótulo pt-BR", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [
        { source_type: "civil_record" },
        { source_type: "civil_record" },
        { source_type: "religious_record" },
      ],
      pedidos: [],
    });

    expect(d.totalFontes).toBe(3);
    expect(d.coberturaFontes).toEqual([
      { tipo: "civil_record", rotulo: "Registro civil", quantidade: 2 },
      { tipo: "religious_record", rotulo: "Paroquial", quantidade: 1 },
    ]);
  });

  it("3. tipo de fonte fora do dicionário conhecido não é descartado nem inventa rótulo falso", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [{ source_type: "other" }],
      pedidos: [],
    });
    expect(d.coberturaFontes).toEqual([{ tipo: "other", rotulo: "Outra fonte", quantidade: 1 }]);
  });

  it("4. sem nenhum dado real, todos os KPIs e listas ficam honestamente vazios (nunca inferidos)", () => {
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [],
      fontes: [],
      pedidos: [],
    });
    expect(d).toMatchObject({
      acervosMapeados: 0,
      hipotesesEmAberto: 0,
      evidenciasValidadas: 0,
      cartoriosAcionados: 0,
      coberturaFontes: [],
      totalFontes: 0,
    });
    expect(d.producaoEvidencias).toHaveLength(6);
    expect(d.producaoEvidencias.every((m) => m.quantidade === 0)).toBe(true);
  });

  it("5. produção mensal de evidências soma só por mês de created_at, 6 meses em ordem cronológica", () => {
    const hoje = new Date();
    const esteAno = hoje.getFullYear();
    const esteMes = String(hoje.getMonth() + 1).padStart(2, "0");
    const d = agregarDossiePesquisa({
      acervosCatalogo: [],
      hipoteses: [],
      evidencias: [
        { created_at: `${esteAno}-${esteMes}-10` },
        { created_at: `${esteAno}-${esteMes}-20` },
        { created_at: "2019-01-01" },
      ],
      fontes: [],
      pedidos: [],
    });
    expect(d.producaoEvidencias).toHaveLength(6);
    expect(d.producaoEvidencias[5]!.quantidade).toBe(2);
    const total = d.producaoEvidencias.reduce((s, m) => s + m.quantidade, 0);
    expect(total).toBe(2);
  });
});
