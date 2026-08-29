import { describe, expect, it } from "vitest";
import {
  DOMINIOS_TAXONOMIA,
  SUBAREAS_BIBLIOTECA,
  exposicaoAppCliente,
  itemElegivelParaProposta,
  regraAplicavelACaso,
  subareaBiblioteca,
  validarArquivamento,
} from "@/lib/biblioteca-mestre";
import { ABAS_DESK_CANONICAS } from "@/lib/desk-arvore-canonica";

describe("Biblioteca Mestre", () => {
  it("mantém as 10 subáreas obrigatórias sem criar abas globais", () => {
    expect(SUBAREAS_BIBLIOTECA).toHaveLength(10);
    expect(SUBAREAS_BIBLIOTECA.map((s) => s.chave)).toEqual([
      "acervo",
      "bases",
      "dicionarios",
      "trilhas",
      "juridico",
      "governanca",
      "modelos",
      "top30",
      "mapas",
      "arquivo",
    ]);
    expect(ABAS_DESK_CANONICAS.filter((a) => a === "biblio")).toHaveLength(1);
    for (const s of SUBAREAS_BIBLIOTECA) {
      expect(ABAS_DESK_CANONICAS).not.toContain(s.chave as never);
    }
  });

  it("nunca projeta conteúdo no App Cliente", () => {
    expect(exposicaoAppCliente()).toBe(false);
  });

  it("descreve finalidade e dimensões de cada subárea", () => {
    for (const s of SUBAREAS_BIBLIOTECA) {
      expect(subareaBiblioteca(s.chave)?.finalidade.length).toBeGreaterThan(10);
      expect(s.dimensoes.length).toBeGreaterThan(2);
    }
  });

  it("cobre os domínios de taxonomia usados por pesquisa e evidências", () => {
    expect(DOMINIOS_TAXONOMIA).toContain("tipo_fonte");
    expect(DOMINIOS_TAXONOMIA).toContain("estado_evidencia");
    expect(DOMINIOS_TAXONOMIA).toContain("estado_relatorio");
    expect(new Set(DOMINIOS_TAXONOMIA).size).toBe(DOMINIOS_TAXONOMIA.length);
  });

  it("só aplica regra jurídica aprovada e vigente", () => {
    expect(regraAplicavelACaso({ status: "em_revisao" })).toBe(false);
    expect(regraAplicavelACaso({ status: "aprovado", archived_at: "2026-01-01" })).toBe(false);
    expect(regraAplicavelACaso({ status: "aprovado", vigencia_fim: "2020-01-01" })).toBe(false);
    expect(regraAplicavelACaso({ status: "aprovado", vigencia_inicio: "2020-01-01" })).toBe(true);
  });

  it("só permite proposta com item homologado e vigente", () => {
    expect(
      itemElegivelParaProposta({ status_homologacao: "homologado", elegivel_para_proposta: true }),
    ).toBe(true);
    expect(
      itemElegivelParaProposta({ status_homologacao: "rascunho", elegivel_para_proposta: true }),
    ).toBe(false);
    expect(
      itemElegivelParaProposta({
        status_homologacao: "homologado",
        elegivel_para_proposta: true,
        archived_at: "2026-01-01",
      }),
    ).toBe(false);
  });

  it("não bloqueia o arquivamento lógico por falta de motivo", () => {
    expect(validarArquivamento("").ok).toBe(true);
    expect(validarArquivamento("Substituído pelo modelo F2 v2").ok).toBe(true);
  });
});
