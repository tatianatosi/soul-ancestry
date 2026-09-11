import { describe, expect, it } from "vitest";

import {
  CATALOGO_OPERACIONAL_30,
  FORA_DO_CATALOGO_30,
  MATRIZ_CICLO_VIDA,
  DECISOES_BLOQUEADORAS,
  csvCatalogo30,
  podeReferenciarSku,
  resumoCatalogo30,
  resumoForaCatalogo,
} from "@/lib/ca06-catalogo-operacional";
import { GRUPOS_DESK, MENU_CONTA } from "@/lib/navegacao-desk";

describe("CA-06 — Catálogo Operacional 30", () => {
  it("registra exatamente 30 SKUs sem duplicidade", () => {
    expect(CATALOGO_OPERACIONAL_30).toHaveLength(30);
    const ids = new Set(CATALOGO_OPERACIONAL_30.map((i) => i.sku_id));
    expect(ids.size).toBe(30);
  });

  it("registra os 61 itens fora do catálogo com a distribuição declarada", () => {
    expect(FORA_DO_CATALOGO_30).toHaveLength(61);
    expect(resumoForaCatalogo()).toEqual({
      ARQUIVAR_HISTÓRICO: 19,
      FASE_2: 18,
      PENDENTE_DE_VALIDAÇÃO: 13,
      FUNDIR: 11,
    });
  });

  it("mantém CA-CURSO-001 pendente e fora de referência operacional", () => {
    const kit = CATALOGO_OPERACIONAL_30.find((i) => i.sku_id === "CA-CURSO-001");
    expect(kit?.status_catalogo_30).toBe("PENDENTE");
    expect(kit?.visibilidade_app).toBe("NÃO");
    expect(podeReferenciarSku("CA-CURSO-001")).toBe(false);
    expect(podeReferenciarSku("CA-CID-001")).toBe(true);
    expect(podeReferenciarSku("CA-POS-001")).toBe(false);
  });

  it("resume os status conforme o nível de confiança da Fase 3", () => {
    const r = resumoCatalogo30();
    expect(r.ATIVO).toBe(2);
    expect(r.PILOTO).toBe(3);
    expect(r.PENDENTE).toBe(1);
    expect(r.ATIVO + r.PILOTO + r.CONDICIONAL + r.PENDENTE).toBe(30);
  });

  it("liga toda a matriz de ciclo de vida a SKUs do Catálogo 30", () => {
    expect(MATRIZ_CICLO_VIDA).toHaveLength(8);
    const ids = new Set(CATALOGO_OPERACIONAL_30.map((i) => i.sku_id));
    for (const etapa of MATRIZ_CICLO_VIDA) {
      for (const sku of etapa.skus_elegiveis) expect(ids.has(sku)).toBe(true);
    }
  });

  it("mantém as 6 decisões bloqueadoras; catálogo operacional 30 mora no MENU_CONTA (legado), fora da sidebar", () => {
    expect(DECISOES_BLOQUEADORAS).toHaveLength(6);
    expect(MENU_CONTA.itens.some((s) => "to" in s && s.to === "/governanca/catalogo-operacional-30")).toBe(
      true,
    );
    expect(GRUPOS_DESK.map((g) => g.id)).not.toContain("governanca");
    const casos = GRUPOS_DESK.find((g) => g.id === "casos-360");
    const rotasCasos = casos?.sub.filter((s) => "to" in s).map((s) => s.to);
    expect(rotasCasos).not.toContain("/governanca/catalogo-operacional-30");
    expect(JSON.stringify(GRUPOS_DESK)).not.toContain("/governanca/catalogo-operacional-30");
  });

  it("exporta CSV com cabeçalho e uma linha por SKU", () => {
    const linhas = csvCatalogo30().split("\n");
    expect(linhas).toHaveLength(31);
    expect(linhas[0]).toContain("sku_id");
  });
});
