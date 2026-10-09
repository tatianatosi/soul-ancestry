import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { CLAUSULAS_FIXAS, CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";
import {
  AVISO_PREVIA_DESATUALIZADA,
  AVISO_PREVIA_SEM_CORPO,
  motivoBloqueioSaida,
  previaDefasada,
  previaVigente,
  previasSubstituidas,
  rotuloPrevia,
  temCorpoContratual,
  type PreviaRegistro,
} from "@/lib/previa-vigente";

/**
 * 08/10/2026 — medido no contrato da Ana (parameters 226234d5):
 * 7 prévias vivas. v1–v6 "congeladas" nasceram SEM corpo contratual
 * (`legado_sem_corpo = true`, 7–10 KB); a única com o contrato inteiro
 * (43 KB) é o rascunho editável (versão 0). O botão de PDF aceitava
 * qualquer uma — dava para baixar um contrato sem contrato dentro.
 */

const rascunho: PreviaRegistro = {
  id: "rascunho",
  versao: 0,
  estado: "rascunho_editavel",
  corpo_contratual: true,
  created_at: "2026-08-21T15:16:04Z",
};
const legadas: PreviaRegistro[] = [1, 2, 3, 4, 5, 6].map((v) => ({
  id: `v${v}`,
  versao: v,
  estado: "congelado",
  corpo_contratual: false,
  legado_sem_corpo: true,
  congelado_em: `2026-08-17T19:4${v}:00Z`,
}));

describe("qual prévia vale", () => {
  it("o rascunho editável é a vigente quando existe", () => {
    expect(previaVigente([...legadas, rascunho])?.id).toBe("rascunho");
  });

  it("sem rascunho, vale a congelada de maior versão", () => {
    expect(previaVigente(legadas)?.id).toBe("v6");
  });

  it("todas as outras ficam como substituídas — nenhuma some", () => {
    const substituidas = previasSubstituidas([...legadas, rascunho]);
    expect(substituidas).toHaveLength(6);
    expect(substituidas.map((p) => p.id).sort()).toEqual(["v1", "v2", "v3", "v4", "v5", "v6"]);
  });

  it("sem prévia nenhuma, não inventa vigente", () => {
    expect(previaVigente([])).toBeNull();
    expect(previasSubstituidas([])).toEqual([]);
  });
});

describe("prévia sem corpo contratual não é documento", () => {
  it("prévia legada é recusada mesmo congelada", () => {
    expect(temCorpoContratual(legadas[0]!)).toBe(false);
    expect(motivoBloqueioSaida(legadas[0]!, null)).toBe(AVISO_PREVIA_SEM_CORPO);
  });

  it("prévia com corpo passa", () => {
    expect(temCorpoContratual(rascunho)).toBe(true);
    expect(motivoBloqueioSaida(rascunho, "2026-08-01T00:00:00Z")).toBeNull();
  });
});

describe("defasagem: o documento nunca sai mais velho que o dado", () => {
  it("parâmetro alterado depois da geração deixa a prévia defasada", () => {
    expect(previaDefasada(rascunho, "2026-10-07T10:00:00Z")).toBe(true);
    expect(motivoBloqueioSaida(rascunho, "2026-10-07T10:00:00Z")).toBe(AVISO_PREVIA_DESATUALIZADA);
  });

  it("parâmetro alterado antes da geração não bloqueia", () => {
    expect(previaDefasada(rascunho, "2026-08-01T00:00:00Z")).toBe(false);
  });

  it("sem alteração registrada, não acusa defasagem por suposição", () => {
    expect(previaDefasada(rascunho, null)).toBe(false);
  });
});

describe("cabeçalho mostra data e versão", () => {
  it("nomeia modelo, cláusulas, estado e data de geração", () => {
    const r = rotuloPrevia(rascunho, CONTRATO_BASE_VERSAO, CLAUSULAS_FIXAS.length);
    expect(r).toContain("Modelo v2.0");
    expect(r).toContain("16 cláusulas");
    expect(r).toContain("rascunho de trabalho");
    expect(r).toContain("gerada em");
  });

  it("congelada mostra a versão", () => {
    expect(rotuloPrevia(legadas[5]!, CONTRATO_BASE_VERSAO, 16)).toContain("versão v6 (congelada)");
  });
});

describe("a trava vale no servidor, não só na tela", () => {
  for (const arquivo of ["src/lib/contrato-pdf.functions.ts", "src/lib/contrato-docx.functions.ts"]) {
    it(`${arquivo} recusa prévia sem corpo ou defasada`, () => {
      /*
       * 09/10/2026 — este assert pinçava a regra escrita DENTRO do PDF e do
       * DOCX. A regra virou uma só, em `previa-vigente.server.ts`, e passou a
       * cobrir também "a prévia tem de ser a vigente" (a Ana tem duas vivas),
       * revisão humana e envio para assinatura. Protege mais, não menos — o
       * assert passa a exigir o guard compartilhado.
       */
      const fn = readFileSync(arquivo, "utf8");
      expect(fn).toContain("exigirPreviaVigenteLiberada(");
      expect(fn).toContain('saida: "documento"');
      const guard = readFileSync("src/lib/previa-vigente.server.ts", "utf8");
      expect(guard).toContain("motivoBloqueioSaida(vigente");
      expect(guard).toContain("archived_at");
    });
  }
});

describe("a tela de preparação usa a prévia vigente e mostra data/versão", () => {
  const tela = readFileSync("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx", "utf8");

  it("cabeçalho com modelo, cláusulas e data de geração", () => {
    expect(tela).toContain("data-previa-cabecalho");
    expect(tela).toContain("rotuloPrevia(previaAtual, CONTRATO_BASE_VERSAO, CLAUSULAS_FIXAS.length)");
  });

  it('mostra "Prévia desatualizada" e trava a saída', () => {
    expect(tela).toContain("data-previa-bloqueio");
    expect(tela).toContain("motivoBloqueioSaida(previaAtual");
  });

  it("PDF e DOCX leem só a vigente, nunca a prévia clicada na lista", () => {
    expect(tela).toContain("previaId={bloqueioPrevia ? null : (previaAtual?.id ?? null)}");
    expect(tela).not.toContain("previaId={previaVistaId ??");
  });

  it("o leitor entrega quando o último parâmetro mudou", () => {
    const fn = readFileSync("src/lib/contrato-preparar.functions.ts", "utf8");
    expect(fn).toContain("parametroAlteradoEm");
    expect(fn).toContain("atualizado_em");
  });
});
