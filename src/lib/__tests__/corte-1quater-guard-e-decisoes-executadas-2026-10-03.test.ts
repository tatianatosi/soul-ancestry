import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { contemConteudoInterno } from "@/lib/onboarding-jornada";
import { RESPONSAVEL_VALIDACAO_PADRAO } from "@/lib/decisoes-da-proprietaria";

/**
 * 03/10/2026 — a Proprietária revisou a fila e apontou o padrão: "documentar
 * e arquivar em vez de executar". A medição deu razão a ela em dois pontos
 * deste arquivo.
 *
 * 1. Corte 1-quater: o plano lista nome técnico de fonte, URL, token,
 *    endpoint, API, matching, score e RG como proibidos no App. Medido em
 *    03/10: NENHUM dos onze estava no guard — ele tinha os mesmos 23 termos
 *    de sempre. O App publicaria "encontramos no FamilySearch" para a
 *    cliente real.
 *
 * 2. Decisões D-04 e D-05: estavam marcadas `status: "decidida"` no módulo,
 *    mas sem consequência operacional nenhuma. No banco, 4 das 23 fontes
 *    ainda diziam "D-04 pendente: falta a 5a fonte" — afirmando à equipe uma
 *    pendência que a Proprietária já resolvera — e `responsavel_validacao`
 *    estava NULO nas 23, embora D-05 defina um responsável padrão.
 */

describe("Corte 1-quater — o que o plano mandava bloquear e não estava bloqueado", () => {
  const nomesDeFonte = [
    "Encontramos o registro no FamilySearch.",
    "Consulta ao Portale Antenati concluída.",
    "Verificado no DigitArq.",
    "Resultado do Geneanet.",
    "Confirmado no MyHeritage.",
    "Árvore do Ancestry.",
    "Busca no Szukaj w Archiwach.",
    "Ficha do Find a Grave.",
    "Registro no Archion.",
    "Índice do Geneteka.",
    "Base CISEI consultada.",
    "Arquivo ÖStA.",
  ];

  for (const texto of nomesDeFonte) {
    it(`bloqueia nome técnico de fonte: ${texto.slice(0, 32)}…`, () => {
      expect(contemConteudoInterno(texto)).toBe(true);
    });
  }

  it("bloqueia URL, token, endpoint, API, matching e score", () => {
    for (const t of [
      "Veja em https://antenati.cultura.gov.it/ark:/12345",
      "Link: www.familysearch.org",
      "O token expirou.",
      "Chamada ao endpoint de busca.",
      "A API devolveu 3 resultados.",
      "O matching deu 87%.",
      "Score de confiança: 0.87.",
    ]) {
      expect(contemConteudoInterno(t), t).toBe(true);
    }
  });

  it("bloqueia RG como documento, sem bloquear palavras que o contêm", () => {
    expect(contemConteudoInterno("Precisamos do RG do titular.")).toBe(true);
    // "organização", "margem" e "virgem" contêm "rg" — não podem ser barradas
    // por isso. (margem já era termo proibido por outro motivo, fora do teste.)
    expect(contemConteudoInterno("A organização da família está pronta.")).toBe(false);
    expect(contemConteudoInterno("Mata virgem na região de origem.")).toBe(false);
  });

  it("NÃO cria falso positivo: palavras comuns que contêm os termos curtos", () => {
    /*
      O guard compara por substring. Sem limite de palavra, "api" casaria em
      "capital" e "score" em nada, mas "pares" casaria em texto legítimo.
      Falso positivo aqui é grave: o texto seria descartado em silêncio.
    */
    for (const t of [
      "A capital da província foi confirmada.",
      "Encontramos pares de documentos equivalentes.",
      "O capitão do navio está no registro.",
    ]) {
      expect(contemConteudoInterno(t), t).toBe(false);
    }
  });

  it("PARES só conta em caixa alta isolada — a fonte espanhola, não a palavra comum", () => {
    expect(contemConteudoInterno("Consulta ao PARES concluída.")).toBe(true);
    expect(contemConteudoInterno("Separamos os pares de certidões.")).toBe(false);
  });

  it("texto legítimo do cliente continua passando", () => {
    expect(
      contemConteudoInterno(
        "Concluímos a primeira prancha da linha materna Silveira. Estado de validação: em conferência. Próximo passo: devolutiva da equipe.",
      ),
    ).toBe(false);
  });
});

describe("D-05 — decisão virou default de verdade, não só texto no registro", () => {
  it("existe constante reutilizável com o responsável padrão", () => {
    expect(RESPONSAVEL_VALIDACAO_PADRAO).toBe("Tatiana Melani Tosi");
  });

  it("o escritor de fonte aplica o default na criação, sem sobrescrever quem informa outro", () => {
    const src = readFileSync("src/lib/fontes-genealogicas.functions.ts", "utf8");
    expect(src).toContain("RESPONSAVEL_VALIDACAO_PADRAO");
    expect(src).toContain('"responsavel_validacao"');
    // Só na criação (`!data.id`) e só quando veio vazio.
    expect(src).toMatch(/!data\.id && !String\(valores\["responsavel_validacao"\]/);
  });
});
