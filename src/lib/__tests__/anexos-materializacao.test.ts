import { describe, expect, it } from "vitest";

import type { InstanciaPersistida } from "@/lib/anexos-instancia";
import {
  ANEXOS_REVISADOS,
  ehAnexoRevisado,
  planejarMaterializacao,
  resumoMaterializacao,
} from "@/lib/anexos-materializacao";

function persistida(over: Partial<InstanciaPersistida>): InstanciaPersistida {
  return {
    annex_code: "ANEXO_II_DESPESAS_EXTERNAS",
    title: "Anexo II",
    status: "drafting",
    annex_version: 1,
    model_version: "v1.0",
    file_hash: "h1",
    tem_conteudo: true,
    atualizado_em: "2026-08-01T00:00:00Z",
    is_test: false,
    ...over,
  };
}

const candidatos = [
  { codigo: "ANEXO_II_DESPESAS_EXTERNAS", titulo: "Anexo II", hash: "h1" },
  { codigo: "ANEXO_IV_PROCURACAO", titulo: "Anexo IV", hash: "h4" },
  { codigo: "ANEXO_V_ALTERACAO_ESCOPO", titulo: "Anexo V", hash: "h5" },
];

describe("anexos-materializacao", () => {
  it("cobre exatamente os anexos revisados II, IV e V", () => {
    expect(ANEXOS_REVISADOS).toEqual([
      "ANEXO_II_DESPESAS_EXTERNAS",
      "ANEXO_IV_PROCURACAO",
      "ANEXO_V_ALTERACAO_ESCOPO",
    ]);
    expect(ehAnexoRevisado("ANEXO_I_ORDEM_SERVICO")).toBe(false);
  });

  it("materializa quando não há instância salva", () => {
    const plano = planejarMaterializacao({ candidatos, persistidas: [] });
    expect(plano.every((p) => p.acao === "materializar")).toBe(true);
    expect(plano[0].proximaVersao).toBe(1);
  });

  it("não recria quando o conteúdo já é canônico", () => {
    const plano = planejarMaterializacao({ candidatos, persistidas: [persistida({})] });
    const ii = plano.find((p) => p.codigo === "ANEXO_II_DESPESAS_EXTERNAS")!;
    expect(ii.acao).toBe("ja_canonica");
    expect(ii.proximaVersao).toBeNull();
  });

  it("gera versão nova preservando histórico quando o conteúdo mudou", () => {
    const plano = planejarMaterializacao({
      candidatos,
      persistidas: [persistida({ annex_version: 3, file_hash: "antigo" })],
    });
    const ii = plano.find((p) => p.codigo === "ANEXO_II_DESPESAS_EXTERNAS")!;
    expect(ii.acao).toBe("materializar");
    expect(ii.versaoAtual).toBe(3);
    expect(ii.proximaVersao).toBe(4);
  });

  it("preserva instância assinada, anexada ou arquivada", () => {
    for (const status of ["signed_with_contract", "attached", "archived"]) {
      const plano = planejarMaterializacao({
        candidatos,
        persistidas: [persistida({ status, file_hash: "outro" })],
      });
      const ii = plano.find((p) => p.codigo === "ANEXO_II_DESPESAS_EXTERNAS")!;
      expect(ii.acao).toBe("preservado");
      expect(ii.proximaVersao).toBeNull();
    }
  });

  it("ignora instâncias de teste ao calcular a versão vigente", () => {
    const plano = planejarMaterializacao({
      candidatos,
      persistidas: [persistida({ annex_version: 9, is_test: true })],
    });
    const ii = plano.find((p) => p.codigo === "ANEXO_II_DESPESAS_EXTERNAS")!;
    expect(ii.acao).toBe("materializar");
    expect(ii.proximaVersao).toBe(1);
  });

  it("marca anexos fora do lote", () => {
    const plano = planejarMaterializacao({
      candidatos: [{ codigo: "ANEXO_I_ORDEM_SERVICO", titulo: "Anexo I", hash: "x" }],
      persistidas: [],
    });
    expect(plano[0].acao).toBe("fora_do_lote");
  });

  it("resume o lote sem prometer reescrita de conteúdo aprovado", () => {
    const plano = planejarMaterializacao({ candidatos, persistidas: [] });
    const r = resumoMaterializacao(plano);
    expect(r.materializar).toBe(3);
    expect(r.mensagem).toContain("Nenhum conteúdo aprovado é reescrito");
    expect(resumoMaterializacao([]).mensagem).toContain("Nada a materializar");
  });
});
