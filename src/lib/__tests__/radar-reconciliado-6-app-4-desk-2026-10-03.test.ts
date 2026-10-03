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
 */

const APP = readFileSync("src/routes/portal/radar.tsx", "utf8");
const DESK = readFileSync("src/routes/_authenticated/qualidade.tsx", "utf8");

const entrada = {
  projecoes: [
    { id: "p1", projection_type: "arvore", content_sanitized: "Maria Silveira — bisavó" },
    { id: "p2", projection_type: "achado", content_sanitized: "Registro de 1912 localizado" },
    { id: "p3", projection_type: "marco", content_sanitized: "Etapa de conferência iniciada" },
  ] as never,
  documentos: [
    { id: "d1", liberado_cliente: true },
    { id: "d2", liberado_cliente: false },
  ] as never,
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

  it("todas têm percentual — nenhuma fica sem número", () => {
    for (const d of dims) {
      expect(d.estado, d.id).toBe("percentual");
      expect(typeof d.percentual, d.id).toBe("number");
    }
  });

  it("todas dizem COMO o número foi calculado", () => {
    for (const d of dims) {
      expect(d.comoCalculamos.trim().length, d.id).toBeGreaterThan(20);
    }
  });

  it("o 4º eixo é a média dos outros 5, e a conta aparece escrita", () => {
    const outros = dims.filter((d) => d.id !== "elegibilidade");
    const media = Math.round(outros.reduce((s, d) => s + (d.percentual ?? 0), 0) / outros.length);
    const geral = dims.find((d) => d.id === "elegibilidade")!;
    expect(geral.percentual).toBe(media);
    expect(geral.comoCalculamos).toContain("Média dos outros 5 eixos");
  });

  it("eixo com denominador real mostra a razão; eixo sem total conhecido diz que não há total", () => {
    const docs = dims.find((d) => d.id === "documentacao")!;
    expect(docs.comoCalculamos).toContain("÷");
    const conexoes = dims.find((d) => d.id === "conexoes")!;
    expect(conexoes.comoCalculamos).toContain("31");

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
    expect(APP).toContain("Como calculamos:");
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
