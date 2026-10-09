import { describe, expect, it } from "vitest";
import {
  TERMOS_PERMITIDOS_REFERENCIA,
  exigeRevisaoHumana,
  verificarTermosProibidos,
} from "@/lib/linguagem-proibida";

/**
 * Seção 8 do adendo ao Bloco 5A (11/08/2026) — Governança de Fontes,
 * Evidências, Visibilidade e Linguagem de Legado: "Todo conteúdo narrativo
 * passa por verificação automática de termos proibidos antes de aprovação."
 * Lista exata de termos proibidos/permitidos do próprio documento.
 */
describe("checker de linguagem proibida — Seção 8 do adendo Bloco 5A", () => {
  it("detecta cada um dos 11 termos proibidos listados no adendo", () => {
    const casos = [
      "Fizemos uma sessão de constelação familiar com a árvore completa.",
      "O documento promete cura ancestral para os descendentes.",
      "Isto evidencia um trauma herdado na linhagem materna.",
      "Aplicamos terapia sistêmica durante a entrevista.",
      "Identificamos padrões psicológicos familiares no ramo paterno.",
      "O texto descreve o comportamento por nacionalidade italiana da família.",
      "Essa escolha selou o destino de toda a linhagem.",
      "A pesquisa sugere personalidade herdada dos avós.",
      "O relatório inclui um diagnóstico emocional do requerente.",
      "O produto promete fortalecimento terapêutico pela ancestralidade.",
      "Descreve a força emocional do povo austríaco.",
    ];
    for (const texto of casos) {
      expect(verificarTermosProibidos(texto).length, texto).toBeGreaterThan(0);
    }
  });

  it("texto só com vocabulário permitido não dispara nenhum termo proibido", () => {
    const textoPermitido =
      "Este caderno apresenta os contextos históricos, territórios migratórios e " +
      "encontros de linhagem da família, com práticas culturais documentadas e " +
      "narrativas de adaptação ao Brasil — pertencimento e identidade, sem juízo " +
      "sobre personalidade ou comportamento individual.";
    expect(verificarTermosProibidos(textoPermitido)).toEqual([]);
    expect(exigeRevisaoHumana(textoPermitido)).toBe(false);
  });

  it("cada achado devolve termo, razão do adendo e o trecho onde apareceu", () => {
    const [achado] = verificarTermosProibidos("A família sofreu um trauma herdado real.");
    expect(achado?.termo).toBe("trauma herdado");
    expect(achado?.razao).toMatch(/psicológica sem validação clínica/i);
    expect(achado?.trecho).toMatch(/trauma herdado/i);
  });

  it("exigeRevisaoHumana é o gate booleano simples sobre o mesmo checker", () => {
    expect(exigeRevisaoHumana("Encontros de linhagem documentados em 1912.")).toBe(false);
    expect(exigeRevisaoHumana("Isso define o destino da família.")).toBe(true);
  });

  it("texto vazio ou ausente nunca lança, só devolve lista vazia", () => {
    expect(verificarTermosProibidos("")).toEqual([]);
    expect(verificarTermosProibidos(undefined as unknown as string)).toEqual([]);
  });

  it("não falsos-positivos em palavras comuns que contêm substrings do radar — 'destino' é intencionalmente amplo e documentado como tal", () => {
    // "destino" é o único termo do adendo sem delimitação de contexto —
    // o próprio documento lista "Destino" como termo proibido isolado,
    // sem qualificador. Mantido literal, não restringido por mim.
    expect(verificarTermosProibidos("Chegaram ao destino final da viagem.").length).toBeGreaterThan(0);
  });

  it("a lista de referência de termos permitidos é a do adendo, só para documentação/teste cruzado", () => {
    expect(TERMOS_PERMITIDOS_REFERENCIA).toContain("contextos históricos");
    expect(TERMOS_PERMITIDOS_REFERENCIA).toContain("legado narrativo");
    expect(TERMOS_PERMITIDOS_REFERENCIA.length).toBe(10);
  });
});
