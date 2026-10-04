import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  AVISO_INDICE_INTERNO,
  FAIXAS_INDICE_INTERNO,
  indiceInternoDeElegibilidade,
  type RaciocinioJuridicoCaso,
} from "@/lib/motor-raciocinio-juridico";

/**
 * Proprietária, 04/10/2026: "não está proibido o score, já tem uma regra pra
 * isso, e uso interno de elegibilidade está dentro das premissas do radar e
 * matrizes".
 *
 * Correção de escopo minha: eu vinha repetindo "nunca um score único" como
 * proibição geral. A regra é de DESTINO, não de cálculo — interno pode
 * (e já havia precedente vivo em `radar-elegibilidade.ts`, com faixas);
 * o que não pode é ir ao cliente nem virar parecer.
 */

const vazio: RaciocinioJuridicoCaso = {
  continuidade: [],
  completude: { documentosMinimosOk: false, totalEvidencias: 0, evidenciasValidadas: 0, proporcaoValidada: null, pendencias: [] },
  confiabilidade: {
    totalRegras: 0,
    regrasAprovadas: 0,
    totalMarcos: 0,
    marcosVigentes: 0,
    proporcaoRegrasAprovadas: null,
    proporcaoMarcosVigentes: null,
    pendencias: [],
  },
};

const cheio: RaciocinioJuridicoCaso = {
  continuidade: [
    { statusLinha: "em_estruturacao", totalElos: 4, elosComprovados: 2, proporcao: 0.5, pendencias: [] },
    { statusLinha: "em_estruturacao", totalElos: 2, elosComprovados: 2, proporcao: 1, pendencias: [] },
  ],
  completude: { documentosMinimosOk: true, totalEvidencias: 4, evidenciasValidadas: 3, proporcaoValidada: 0.75, pendencias: [] },
  confiabilidade: {
    totalRegras: 4,
    regrasAprovadas: 3,
    totalMarcos: 2,
    marcosVigentes: 2,
    proporcaoRegrasAprovadas: 0.75,
    proporcaoMarcosVigentes: 1,
    pendencias: [],
  },
};

describe("índice interno de elegibilidade — permitido, com regra", () => {
  it("compõe a média dos três, e mostra os três ao lado do número", () => {
    const i = indiceInternoDeElegibilidade(cheio);
    // continuidade (50+100)/2 = 75 · completude 75 · confiabilidade (75+100)/2 = 88
    expect(i.componentes).toEqual({ continuidade: 75, completude: 75, confiabilidade: 88 });
    expect(i.percentual).toBe(79);
    expect(i.faixa).toBe("provavel");
  });

  it("caso vazio não vira 100% nem erro: fica inconclusivo em 0, com limitantes", () => {
    const i = indiceInternoDeElegibilidade(vazio);
    expect(i.percentual).toBe(0);
    expect(i.faixa).toBe("inconclusiva");
    expect(i.limitantes.join(" ")).toContain("Documentos mínimos");
  });

  it("proporção nula não é tratada como zero silencioso — a linha sai da média e o fato é dito", () => {
    const comLinhaSemElo: RaciocinioJuridicoCaso = {
      ...cheio,
      continuidade: [{ statusLinha: "em_estruturacao", totalElos: 0, elosComprovados: 0, proporcao: null, pendencias: [] }],
    };
    const i = indiceInternoDeElegibilidade(comLinhaSemElo);
    expect(i.componentes.continuidade).toBe(0);
    expect(i.limitantes.join(" ")).toContain("sem elo registrado");
  });

  it("as faixas são as mesmas do radar interno — um vocabulário, não dois", () => {
    expect(FAIXAS_INDICE_INTERNO).toEqual(["inconclusiva", "baixa", "possivel_com_pesquisa", "provavel", "forte"]);
    const radar = readFileSync("src/lib/radar-elegibilidade.ts", "utf8");
    for (const f of FAIXAS_INDICE_INTERNO) expect(radar).toContain(f);
  });

  it("o número nunca anda sozinho: uso declarado e aviso obrigatório vêm com ele", () => {
    const i = indiceInternoDeElegibilidade(cheio);
    expect(i.usoPermitido).toBe("interno_radar_e_matrizes");
    expect(i.avisoObrigatorio).toBe(AVISO_INDICE_INTERNO);
    expect(AVISO_INDICE_INTERNO).toContain("Não é parecer jurídico");
    expect(AVISO_INDICE_INTERNO).toContain("nunca é exibido ao cliente");
  });

  it("o módulo deixou de afirmar que score é proibido, e explica o escopo real", () => {
    const fonte = readFileSync("src/lib/motor-raciocinio-juridico.ts", "utf8");
    expect(fonte).not.toContain("nunca\n * combinados num score único");
    expect(fonte).toContain("o score NÃO é proibido");
    expect(fonte).toContain("uso INTERNO");
  });

  it("está montado no Desk (Caso 360), não no App", () => {
    expect(readFileSync("src/components/caso/cadeia-caso-360.tsx", "utf8")).toContain("data-indice-interno-elegibilidade");
    // a fronteira do App continua barrando o módulo inteiro
    const fronteira = readFileSync("src/lib/__tests__/app-fronteira-pessoa-unificada-2026-09-24.test.ts", "utf8");
    expect(fronteira).toContain("motor");
  });
});
