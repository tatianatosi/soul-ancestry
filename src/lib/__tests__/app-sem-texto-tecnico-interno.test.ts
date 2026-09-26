import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { MENSAGEM_FALHA, mensagemDeFalha } from "../portal-linguagem-viva";

/**
 * Regra do produto: o App Cliente nunca mostra nota interna, URL interna,
 * rota do Desk, nome de policy/tabela do banco, nem texto técnico.
 *
 * Dois vazamentos reais foram encontrados e fechados em 21/09/2026:
 *
 * 1. `portal/radar.tsx` tinha um bloco `sr-only` com "Desk usa 4 eixos,
 *    diferentes dos 6 do App" e a contagem de dimensões com percentual. O
 *    comentário dizia manter a comparação "fora da superfície do cliente" —
 *    mas `sr-only` não é fora: está no DOM e é lido por leitor de tela.
 *    A comparação virou teste (abaixo), que é onde prova de auditoria mora.
 * 2. `EstadoDados` é compartilhado entre Desk e App. No App ele imprimia a
 *    mensagem crua do erro (nome de policy/tabela do Postgres) e o caminho
 *    "Administração → Equipe", que é rota do Desk.
 *
 * A decisão da proprietária sobre o Radar permanece intacta: 6 dimensões,
 * eixos e percentual não se alteram. O que saiu foi só a comparação interna.
 */

const radar = readFileSync("src/routes/portal/radar.tsx", "utf8");
const estadoDados = readFileSync("src/components/saas/estado-dados.tsx", "utf8");

const ABAS_DO_APP = [
  "src/routes/portal/index.tsx",
  "src/routes/portal/jornada.tsx",
  "src/routes/portal/radar.tsx",
  "src/routes/portal/arvore.tsx",
  "src/routes/portal/documentos.tsx",
  "src/routes/portal/legado.tsx",
  "src/routes/portal/proposta.tsx",
];

describe("Radar do cliente não carrega comparação interna", () => {
  it("não menciona o Desk nem a contagem de eixos internos", () => {
    expect(radar).not.toContain("Desk usa 4 eixos");
    expect(radar).not.toContain("percentual inventado");
    expect(radar).not.toContain("dimensões com percentual real");
  });

  it("os 6 eixos e o gráfico continuam de pé — nada de eixo removido", () => {
    // A ordem da proprietária é explícita: não alterar os seis eixos nem
    // remover o cálculo. Este teste existe para que a limpeza do texto
    // técnico nunca seja confundida com mexer no Radar.
    expect(radar).toContain("radarSeisDimensoes");
    expect(radar).toContain("<RadarSeisEixos");
    expect(radar).toContain("dimensoes.map((d, i)");
    expect(radar).toContain("Parte {i + 1} de 6");
  });
});

describe("EstadoDados não vaza texto técnico no App", () => {
  it("tem superfície explícita, com Desk como padrão", () => {
    expect(estadoDados).toContain('superficie?: "desk" | "app"');
    expect(estadoDados).toContain('superficie = "desk"');
  });

  it("no App usa a mensagem neutra e omite o caminho de correção interno", () => {
    expect(estadoDados).toContain("mensagemDeFalha(erro)");
    expect(estadoDados).toContain("noApp ? null : caminhoDeCorrecao(erro)");
  });

  it("o caminho de correção do Desk continua existindo para o Desk", () => {
    // Não é para apagar diagnóstico interno: é para não mandá-lo ao cliente.
    expect(estadoDados).toContain("Administração → Equipe");
    expect(estadoDados).toContain("caminhoDeCorrecao");
  });

  it("a mensagem de cliente descarta o conteúdo original do erro", () => {
    expect(mensagemDeFalha(new Error("permission denied for table crm_casos"))).toBe(MENSAGEM_FALHA);
    expect(MENSAGEM_FALHA).not.toMatch(/policy|table|row-level|Administração/i);
  });
});

describe("todas as abas do App declaram a superfície", () => {
  for (const caminho of ABAS_DO_APP) {
    it(`${caminho} passa superficie="app"`, () => {
      const arquivo = readFileSync(caminho, "utf8");
      if (!arquivo.includes("<EstadoDados")) return;
      expect(arquivo).toContain('superficie="app"');
    });
  }
});
