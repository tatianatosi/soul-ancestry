import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { radarSeisDimensoes } from "@/lib/radar-seis-eixos";
import { EIXOS_RADAR_CANONICOS } from "@/lib/radar-eixos";

/**
 * Radar reconciliado (03/10/2026).
 *
 * Autorização literal: "radar correto de 06 eixos no app e 04 eixos no desk
 * reconciliação autorizada mostrando as percentagens e calculos de acordo
 * com premissas já aprovadas anteriormente no app e no portal app do
 * cliente".
 *
 * O que estava errado não era o cálculo: era um COMENTÁRIO. `portal/radar.tsx`
 * afirmava "Elegibilidade continua sem percentual (decisão institucional)"
 * enquanto `radar-seis-eixos.ts` calculava o percentual desde 07/09 por
 * decisão da Proprietária. Dois lugares do código discordando sobre o mesmo
 * eixo é dívida, não decisão — e era o tipo de contradição que fazia a
 * próxima pessoa "corrigir" o código a favor do texto errado.
 *
 * 07/10/2026 — correção legítima da Proprietária em `radar-seis-eixos.ts`,
 * registrada no próprio cabeçalho do módulo: "sem total real, mostrar a
 * lacuna, nunca 0% sobre 0". `origem`, `memoria` e `legado` nunca tiveram
 * teto conhecido e passam a devolver `percentual: null` em vez de fingir
 * 0/100 por mera presença/ausência; `elegibilidade` passa a ser a média só
 * dos eixos que têm total real (hoje: Documentação e Conexões Familiares),
 * nunca mais os 5 tratando ausência como zero. As duas asserções abaixo que
 * assumiam "todas as 6 sempre têm percentual numérico" e "média sobre os 5"
 * ficaram desatualizadas por essa melhoria — atualizadas para refletir o
 * comportamento novo, sem reverter o código.
 */

const APP = readFileSync("src/routes/portal/radar.tsx", "utf8");
const DESK = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");

const entrada = {
  projecoes: [
    { id: "p1", projection_type: "arvore", pessoa_id: "pessoa-1", content_sanitized: "Maria Silveira — bisavó" },
    { id: "p2", projection_type: "achado", content_sanitized: "Registro de 1912 localizado" },
    { id: "p3", projection_type: "marco", content_sanitized: "Etapa de conferência iniciada" },
  ] as never,
  documentos: [
    { id: "d1", liberado_cliente: true },
    { id: "d2", liberado_cliente: false },
  ] as never,
  /*
   * 05/10/2026 — PREMISSA da Proprietária (não reabrir): "Conexões
   * Familiares" usa pessoas mapeadas como denominador, nunca o teto
   * ilustrativo de 31. Aqui: 1 pessoa publicada de 4 mapeadas pela pesquisa.
   */
  pessoasMapeadas: 4,
};

describe("App Cliente — 6 dimensões, todas com percentual e com a conta visível", () => {
  const dims = radarSeisDimensoes(entrada);

  it("são exatamente 6, na ordem do mockup", () => {
    expect(dims.map((d) => d.id)).toEqual([
      "documentacao",
      "origem",
      "conexoes",
      "elegibilidade",
      "memoria",
      "legado",
    ]);
  });

  it("eixo com total real mostra percentual numérico; eixo sem total mostra a lacuna honesta", () => {
    /*
      07/10/2026 (Proprietária): "sem total real, mostrar a lacuna, nunca 0%
      sobre 0". Documentação e Conexões Familiares têm denominador real nesta
      fixture (docs liberados/total; pessoas publicadas/mapeadas) e devolvem
      número. Origem, Memória e Legado nunca tiveram teto conhecido e
      devolvem percentual: null — Elegibilidade, por ser média, só existe
      quando ao menos um eixo tem total real.
    */
    for (const id of ["documentacao", "conexoes", "elegibilidade"] as const) {
      const d = dims.find((x) => x.id === id)!;
      expect(typeof d.percentual, id).toBe("number");
    }
    for (const id of ["origem", "memoria", "legado"] as const) {
      const d = dims.find((x) => x.id === id)!;
      expect(d.percentual, id).toBeNull();
    }
  });

  it("todas dizem COMO o número foi calculado", () => {
    for (const d of dims) {
      expect(d.comoCalculamos.trim().length, d.id).toBeGreaterThan(20);
    }
  });

  it("o 4º eixo é a média só dos eixos com total real, e a conta aparece escrita", () => {
    /*
      07/10/2026 (Proprietária): a média deixou de somar os 5 outros eixos
      tratando ausência de total como 0 — agora soma só os que têm total
      real (nesta fixture: Documentação 50% + Conexões Familiares 25% = 38%,
      não mais os 5 com origem/memória/legado contando como zero).
    */
    const comTotal = dims.filter((d) => d.id !== "elegibilidade" && d.percentual !== null);
    const media = Math.round(comTotal.reduce((s, d) => s + (d.percentual ?? 0), 0) / comTotal.length);
    const geral = dims.find((d) => d.id === "elegibilidade")!;
    expect(geral.percentual).toBe(media);
    expect(geral.comoCalculamos).toContain("Média dos eixos com total real");
  });

  it("eixo com denominador real mostra a razão; eixo sem total conhecido diz que não há total", () => {
    const docs = dims.find((d) => d.id === "documentacao")!;
    expect(docs.comoCalculamos).toContain("÷");
    /*
      05/10/2026 — PREMISSA da Proprietária (não reabrir): Conexões Familiares
      usa pessoas mapeadas como denominador, nunca o teto ilustrativo de 31.
      1 pessoa publicada ÷ 4 mapeadas (fixture acima).
    */
    const conexoes = dims.find((d) => d.id === "conexoes")!;
    expect(conexoes.comoCalculamos).toContain("÷");
    expect(conexoes.comoCalculamos).toContain("mapeadas");
    expect(conexoes.comoCalculamos).not.toContain("31");
    expect(conexoes.percentual).toBe(25);

    for (const id of ["origem", "memoria", "legado"] as const) {
      const d = dims.find((x) => x.id === id)!;
      expect(d.comoCalculamos, id).toMatch(/não existe um total/i);
    }
  });

  it("nenhuma legenda nem conta PROMETE chance, parecer ou elegibilidade jurídica", () => {
    /*
      A primeira versão deste teste reprovou a própria ressalva do eixo de
      progresso — "não parecer jurídico, chance ou resultado" — porque
      procurava a palavra, não a afirmação. Negar é o oposto de prometer, e
      a ressalva é justamente a fronteira que queremos manter. Então o teste
      exige que cada ocorrência venha negada.
    */
    const proibido = /(chance|probabilidade|parecer|garantia|elegível|deferimento)/gi;
    const negadoAntes = (texto: string, posicao: number) =>
      /\b(não|nunca|jamais|sem)\b[^.]{0,40}$/i.test(texto.slice(Math.max(0, posicao - 60), posicao));

    for (const d of dims) {
      for (const campo of ["legenda", "comoCalculamos"] as const) {
        const texto = d[campo];
        for (const m of texto.matchAll(proibido)) {
          expect(
            negadoAntes(texto, m.index ?? 0),
            `${campo} de ${d.id} usa "${m[0]}" como promessa, não como ressalva: ${texto}`,
          ).toBe(true);
        }
      }
    }
  });

  it("a tela do cliente renderiza a conta", () => {
    expect(APP).toContain("data-radar-calculo");
    // 08/10/2026: virou disclosure (<summary>Como calculamos</summary>) no
    // Lovable; a conta continua visível ao cliente, agora recolhível.
    expect(APP).toContain("Como calculamos");
    expect(APP).toContain("d.comoCalculamos");
  });

  it("o comentário contraditório sumiu — texto e código dizem a mesma coisa", () => {
    expect(APP).not.toContain("Elegibilidade continua sem percentual");
    expect(APP).toContain("Dois lugares do código discordavam");
    expect(APP).toContain("PROGRESSO PUBLICADO");
  });
});

describe("Desk — 4 eixos, sem invasão das 6 dimensões do App", () => {
  it("os eixos canônicos do Desk são 4", () => {
    expect(EIXOS_RADAR_CANONICOS).toHaveLength(4);
  });

  it("Radar & Matrizes usa os 4 eixos, não o módulo de 6", () => {
    expect(DESK).toContain("EIXOS_RADAR_CANONICOS");
    expect(DESK).not.toContain("radarSeisDimensoes");
  });

  it("a visão administrativa do App continua mostrando as 6 — é prévia do App, não o Radar do Desk", () => {
    const admin = readFileSync("src/routes/_authenticated/golive.app.tsx", "utf8");
    expect(admin).toContain("RadarSeisEixos");
  });
});
