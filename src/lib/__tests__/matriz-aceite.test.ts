import { describe, expect, it } from "vitest";
import { MATRIZ_RENDERIZACAO } from "@/lib/contrato-base-consolidado";
import {
  ANEXOS_FAMILIARES,
  GATES_BLOQUEANTES,
  ORDEM_FONTES,
  aceiteConcluido,
  avaliarCriteriosAceite,
  blocosRenderizados,
} from "@/lib/matriz-aceite";
import {
  anexosIaVTeste,
  criteriosAceiteTeste,
  matrizRenderizacaoPreviaTeste,
} from "@/lib/contrato-base-previa";

describe("matriz de renderização e gates v1.0", () => {
  it("cobre os 16 blocos da especificação", () => {
    expect(MATRIZ_RENDERIZACAO).toHaveLength(16);
    for (const b of ["Pesquisa externa", "Procuração", "Alteração de escopo"]) {
      const linha = MATRIZ_RENDERIZACAO.find((l) => l.bloco === b);
      expect(linha?.renderiza).toBe("quando_aplicavel");
    }
  });

  it("ordem de fontes começa no planejador homologado e termina em importado a confirmar", () => {
    expect(ORDEM_FONTES[0]?.fonte).toContain("Planejador");
    expect(ORDEM_FONTES.at(-1)?.fonte).toContain("Importado");
  });

  it("bloco condicional sem anexo aplicável sai como não aplicável, não como pendência", () => {
    const blocos = blocosRenderizados([]);
    const pesquisa = blocos.find((b) => b.bloco === "Pesquisa externa");
    expect(pesquisa?.situacao).toBe("nao_aplicavel");
  });

  it("pendência declarada por bloco aparece com motivo", () => {
    const blocos = blocosRenderizados(anexosIaVTeste(), { Prazo: "Prazo não formalizado." });
    const prazo = blocos.find((b) => b.bloco === "Prazo");
    expect(prazo?.situacao).toBe("renderizado_com_pendencia");
    expect(prazo?.motivo).toContain("Prazo");
  });

  it("prévia TESTE renderiza todos os blocos com situação declarada", () => {
    const blocos = matrizRenderizacaoPreviaTeste();
    expect(blocos).toHaveLength(16);
    for (const b of blocos) expect(b.motivo.length).toBeGreaterThan(0);
  });

  it("aceite exige rascunho único e ausência de ação externa", () => {
    const base = {
      clausulasFixasRenderizadas: true,
      variaveisComFonteEstadoVersao: true,
      anexosIaVAvaliados: true,
      anexosFamiliaresConformes: true,
      rascunhosDoCaso: 1,
      snapshotsSomentePorEvento: true,
      bloqueiosComMotivoResponsavelRota: true,
      nenhumaAcaoExternaExecutada: true,
    };
    expect(aceiteConcluido(avaliarCriteriosAceite(base))).toBe(true);
    expect(aceiteConcluido(avaliarCriteriosAceite({ ...base, rascunhosDoCaso: 2 }))).toBe(false);
    expect(
      aceiteConcluido(avaliarCriteriosAceite({ ...base, nenhumaAcaoExternaExecutada: false })),
    ).toBe(false);
  });

  it("prévia TESTE atende os oito critérios de aceite", () => {
    const criterios = criteriosAceiteTeste();
    expect(criterios).toHaveLength(8);
    expect(aceiteConcluido(criterios)).toBe(true);
  });

  it("gates bloqueantes e anexos familiares estão declarados por extenso", () => {
    expect(GATES_BLOQUEANTES).toHaveLength(14);
    expect(ANEXOS_FAMILIARES.map((a) => a.anexo)).toContain("ANX-REPRESENTACAO");
  });
});
