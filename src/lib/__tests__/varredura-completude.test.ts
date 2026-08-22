import { describe, expect, it } from "vitest";

import {
  ANEXOS_VARREDURA,
  CONFIRMACAO_VARREDURA_COMPLETUDE,
  CONSOLIDADO_ANA,
  COBERTURA_TESTES,
  MATRIZ_PENDENCIAS,
  acoesDisponiveis,
  aguardandoConfirmacaoExterna,
  anexosNaoLocalizados,
  pendenciasPorArea,
  pendenciasSuperaveis,
} from "@/lib/varredura-completude";

describe("varredura de completude", () => {
  it("marca Anexos II, IV e V como não localizados", () => {
    const codigos = anexosNaoLocalizados().map((a) => a.codigo).sort();
    expect(codigos).toEqual(["ANEXO_II", "ANEXO_IV", "ANEXO_V"]);
  });

  it("permite prévia interna para todos os anexos, inclusive ausentes", () => {
    expect(ANEXOS_VARREDURA.every((a) => a.permitePreviaInterna)).toBe(true);
    expect(ANEXOS_VARREDURA.every((a) => a.acaoInternaProprietaria.length > 0)).toBe(true);
  });

  it("não duplica ids na matriz de pendências", () => {
    const ids = MATRIZ_PENDENCIAS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("agrupa pendências por área sem perder linhas", () => {
    const total = Object.values(pendenciasPorArea()).reduce((s, l) => s + l.length, 0);
    expect(total).toBe(MATRIZ_PENDENCIAS.length);
  });

  it("garante ação interna acessível para toda pendência", () => {
    for (const l of MATRIZ_PENDENCIAS) {
      const acoes = acoesDisponiveis(l);
      expect(acoes).toContain("editar");
      expect(acoes).toContain("registrar_excecao_operacional");
      expect(acoes).toContain("gerar_previa_interna");
      expect(acoes.includes("assumir_decisao_e_avancar")).toBe(l.superavelPorDecisaoAuditada);
    }
  });

  it("separa superáveis de itens que exigem confirmação externa", () => {
    expect(pendenciasSuperaveis().length + aguardandoConfirmacaoExterna().length).toBe(MATRIZ_PENDENCIAS.length);
    expect(aguardandoConfirmacaoExterna().some((l) => l.id === "PEND-07")).toBe(true);
  });

  it("recomenda um único id canônico para Ana Luiza", () => {
    expect(CONSOLIDADO_ANA.idCanonicoRecomendado).toBe("CA-CID-AT-FAM-2026-001");
    expect(CONSOLIDADO_ANA.idAlternativo).not.toBe(CONSOLIDADO_ANA.idCanonicoRecomendado);
  });

  it("classifica cada teste da cobertura", () => {
    for (const t of COBERTURA_TESTES) {
      expect(["existe_passa", "existe_falha", "ausente", "dispensado"]).toContain(t.classe);
      if (t.classe === "dispensado") expect(t.observacao).toMatch(/Dispensado/);
    }
  });

  it("mantém a confirmação literal da varredura", () => {
    expect(CONFIRMACAO_VARREDURA_COMPLETUDE).toContain("Anexos II, IV e V");
    expect(CONFIRMACAO_VARREDURA_COMPLETUDE).toContain("preparar atos externos para confirmação final");
  });
});
