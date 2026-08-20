import { describe, expect, it } from "vitest";

import type { LinhaCobertura } from "@/lib/escopo-proposta";
import { lerValidade, sanearProposta, statusPaginas } from "@/lib/proposta-saneamento";

const HOJE = new Date("2026-09-01T00:00:00Z");

const proposta = {
  id: "p1",
  case_id: "CA-CID-AT-FAM-2026-001",
  versao: 1,
  status: "aprovada",
  validade: "2026-08-19",
  origem: "canva",
  origem_referencia: "DECK-CANVA-CA-CID-AT-FAM-2026-001-v1",
  paginas_registradas: [1, 2, 3, 4, 5, 6, 7],
} as any;

function cobertura(parcial: Partial<LinhaCobertura>): LinhaCobertura {
  return {
    campo: "valor_total",
    label: "Valor total",
    paginas: [6],
    origem: "proposta",
    obrigatorio: true,
    valorProposta: null,
    parametros: [],
    anexos: [],
    estado: "nao_localizado_na_proposta",
    divergencia: null,
    ...parcial,
  } as LinhaCobertura;
}

describe("ANA-A-01 — saneamento da proposta Canva", () => {
  it("1. página não extraída permanece pendente e bloqueia", () => {
    const linhas = statusPaginas([
      { page_number: 1, extracao_status: "extraida" },
      { page_number: 3, extracao_status: "em_extracao", campos_nao_localizados: ["servicos_incluidos"] },
    ]);
    expect(linhas).toHaveLength(7);
    expect(linhas[0]?.bloqueia).toBe(false);
    expect(linhas[2]?.bloqueia).toBe(true);
    expect(linhas[6]?.estado).toBe("nao_registrada");
  });

  it("2. validade vencida bloqueia e exige decisão humana", () => {
    const v = lerValidade(proposta, HOJE);
    expect(v.estado).toBe("vencida");
    expect(v.bloqueia).toBe(true);
    expect(v.decisoes_humanas).toEqual(["renovar", "substituir", "encerrar"]);
  });

  it("3. campo obrigatório não localizado não é inferido e bloqueia", () => {
    const s = sanearProposta({ proposta, paginas: [], cobertura: [cobertura({})], hoje: HOJE });
    const campo = s.campos[0]!;
    expect(campo.estado_codigo).toBe("nao_localizado_na_proposta");
    expect(campo.bloqueia).toBe(true);
    expect(s.bloqueios.map((b) => b.codigo)).toContain("ESCOPO_CAMPO_OBRIGATORIO_AUSENTE");
  });

  it("4. campo coberto é reportado como coberto_validado e não bloqueia", () => {
    const s = sanearProposta({
      proposta: { ...proposta, validade: "2026-12-31" },
      paginas: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ page_number: n, extracao_status: "extraida" })),
      cobertura: [cobertura({ estado: "coberto", valorProposta: "x" })],
      hoje: HOJE,
    });
    expect(s.campos[0]?.estado_codigo).toBe("coberto_validado");
    expect(s.bloqueios).toHaveLength(0);
    expect(s.acao_humana_requerida).toBeNull();
  });

  it("5. opcional não declarado é pendência informativa, não bloqueio", () => {
    const s = sanearProposta({
      proposta: { ...proposta, validade: "2026-12-31" },
      paginas: [1, 2, 3, 4, 5, 6, 7].map((n) => ({ page_number: n, extracao_status: "extraida" })),
      cobertura: [cobertura({ estado: "opcional_nao_declarado", obrigatorio: false })],
      hoje: HOJE,
    });
    expect(s.campos[0]?.pendencia).toBe(true);
    expect(s.campos[0]?.bloqueia).toBe(false);
    expect(s.bloqueios).toHaveLength(0);
  });

  it("6. proposta substituída não serve como fonte de escopo", () => {
    const v = lerValidade({ ...proposta, substituida_em: "2026-08-25" }, HOJE);
    expect(v.estado).toBe("substituida");
    expect(v.bloqueia).toBe(true);
  });

  it("7. saneamento não expõe URL nem conteúdo do Canva", () => {
    const s = sanearProposta({ proposta, paginas: [], cobertura: [], hoje: HOJE });
    expect(JSON.stringify(s)).not.toMatch(/https?:\/\//);
    expect(s.deck_referencia_interna).toBe("DECK-CANVA-CA-CID-AT-FAM-2026-001-v1");
  });
});
