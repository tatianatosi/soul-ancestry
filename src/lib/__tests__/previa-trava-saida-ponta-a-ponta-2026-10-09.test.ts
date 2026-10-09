import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  AVISO_PREVIA_DESATUALIZADA,
  AVISO_PREVIA_SEM_CORPO,
  motivoBloqueioSaida,
  previaVigente,
  rotuloPrevia,
  type PreviaRegistro,
} from "@/lib/previa-vigente";
import { CONTRATO_BASE_VERSAO } from "@/lib/contrato-base-consolidado";

/**
 * Trava de saída ponta a ponta (09/10/2026): se um parâmetro mudar depois da
 * geração, PDF, revisão e preparação de assinatura ficam bloqueados até
 * regerar — com a MESMA regra na tela e no servidor.
 */

const ler = (p: string) => readFileSync(`${process.cwd()}/${p}`, "utf8");

const rascunho = (updated: string): PreviaRegistro =>
  ({
    id: "p-rascunho",
    tipo: "rascunho",
    estado: "rascunho_editavel",
    versao: 0,
    updated_at: updated,
    congelado_em: null,
    conteudo: { corpo: { clausulas: 16 } },
  }) as unknown as PreviaRegistro;

const congelada = (versao: number, congeladoEm: string): PreviaRegistro =>
  ({
    id: `p-v${versao}`,
    tipo: "rascunho",
    estado: "congelado",
    versao,
    updated_at: congeladoEm,
    congelado_em: congeladoEm,
    conteudo: { corpo: { clausulas: 16 } },
  }) as unknown as PreviaRegistro;

const legada = (versao: number): PreviaRegistro =>
  ({
    id: `legada-v${versao}`,
    tipo: "rascunho",
    estado: "congelado",
    versao,
    updated_at: "2026-08-17T19:45:00Z",
    congelado_em: "2026-08-17T19:45:00Z",
    legado_sem_corpo: true,
  }) as unknown as PreviaRegistro;

describe("a prévia vigente é uma só", () => {
  it("o rascunho editável prevalece sobre as congeladas", () => {
    const v = previaVigente([congelada(8, "2026-10-09T13:39:00Z"), rascunho("2026-10-09T13:39:00Z"), legada(1)]);
    expect(v?.estado).toBe("rascunho_editavel");
  });

  it("sem rascunho, vale a congelada de maior versão — nunca uma legada antiga", () => {
    const v = previaVigente([legada(1), congelada(7, "2026-10-09T13:00:00Z"), congelada(8, "2026-10-09T13:39:00Z")]);
    expect(v?.versao).toBe(8);
  });
});

describe("trava de saída: PDF, revisão e assinatura", () => {
  const gerada = "2026-10-09T13:39:00Z";

  it("libera quando nenhum parâmetro mudou depois da geração", () => {
    expect(motivoBloqueioSaida(rascunho(gerada), "2026-10-09T13:00:00Z")).toBeNull();
  });

  it("bloqueia com 'Prévia desatualizada' quando um parâmetro muda depois", () => {
    const motivo = motivoBloqueioSaida(rascunho(gerada), "2026-10-09T14:05:00Z");
    expect(motivo).toBe(AVISO_PREVIA_DESATUALIZADA);
    expect(motivo).toContain("Prévia desatualizada");
    expect(motivo).toMatch(/PDF/);
  });

  it("a trava vale igual para a versão congelada", () => {
    expect(motivoBloqueioSaida(congelada(8, gerada), "2026-10-09T14:05:00Z")).toBe(AVISO_PREVIA_DESATUALIZADA);
  });

  it("prévia legada sem corpo contratual é bloqueada pelo próprio motivo", () => {
    expect(motivoBloqueioSaida(legada(3), null)).toBe(AVISO_PREVIA_SEM_CORPO);
  });

  it("sem prévia nenhuma, diz isso em vez de deixar sair", () => {
    expect(motivoBloqueioSaida(null, null)).toContain("Nenhuma prévia gerada");
  });

  it("regerar libera a saída de novo — a trava não é permanente", () => {
    const alterado = "2026-10-09T14:05:00Z";
    expect(motivoBloqueioSaida(rascunho(gerada), alterado)).toBe(AVISO_PREVIA_DESATUALIZADA);
    // regeração = updated_at do rascunho passa a ser posterior à alteração
    expect(motivoBloqueioSaida(rascunho("2026-10-09T14:06:00Z"), alterado)).toBeNull();
  });
});

describe("cabeçalho mostra data e versão", () => {
  it("imprime modelo, cláusulas, estado e quando foi gerada", () => {
    const r = rotuloPrevia(rascunho("2026-10-09T13:39:00Z"), CONTRATO_BASE_VERSAO, 16);
    expect(r).toContain(CONTRATO_BASE_VERSAO);
    expect(r).toContain("16 cláusulas");
    expect(r).toContain("rascunho de trabalho");
    expect(r).toMatch(/gerada em .*2026/);
  });

  it("versão congelada aparece com o número da versão", () => {
    expect(rotuloPrevia(congelada(8, "2026-10-09T13:39:00Z"), CONTRATO_BASE_VERSAO, 16)).toContain("v8");
  });
});

describe("tela e servidor aplicam a mesma regra", () => {
  it("a rota de preparação usa previaVigente + motivoBloqueioSaida", () => {
    const rota = ler("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx");
    expect(rota).toContain("previaVigente(");
    expect(rota).toContain("motivoBloqueioSaida(");
    expect(rota).toContain("rotuloPrevia(");
  });

  it("a saída em documento (PDF/DOCX) recusa no servidor, não só na tela", () => {
    // Os dois caminhos de saída em documento do contrato.
    for (const alvo of ["src/lib/contrato-pdf.functions.ts", "src/lib/contrato-docx.functions.ts"]) {
      const src = ler(alvo);
      expect(src).toContain("motivoBloqueioSaida");
      // o servidor recusa de fato, não só calcula o motivo
      expect(src).toMatch(/if \(bloqueio\)[\s\S]{0,120}(throw|Error)/);
    }
  });
});

describe("a trava desarma os botões, não só mostra o aviso", () => {
  it("com a trava acesa, a rota passa previaId nulo para PDF e DOCX", () => {
    const rota = ler("src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx");
    // defesa em profundidade: a tela não oferece o id quando está bloqueada
    expect(rota).toMatch(/<BaixarPdfContrato\s+previaId=\{bloqueioPrevia \? null :/);
    expect(rota).toMatch(/<BaixarDocxContrato\s+previaId=\{bloqueioPrevia \? null :/);
    // e o aviso aparece na tela
    expect(rota).toContain("{bloqueioPrevia ?");
  });

  it("sem id de prévia, o botão não chama o servidor", () => {
    for (const alvo of [
      "src/components/contrato/baixar-pdf-contrato.tsx",
      "src/components/contrato/baixar-docx-contrato.tsx",
    ]) {
      const src = ler(alvo);
      expect(src).toMatch(/if \(!previaId\)[\s\S]{0,200}return;/);
    }
  });
});
