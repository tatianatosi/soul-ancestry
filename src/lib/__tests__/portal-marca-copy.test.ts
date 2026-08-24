import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { AZUIS_RETIRADOS, MARCA_CORES } from "@/lib/marca";
import {
  COPY_ESTADO_TEXTO,
  COPY_ESTADO_TITULO,
  COPY_GERAL,
  COPY_TELAS,
  contemTermoProibido,
} from "@/lib/portal-copy";

const RAIZ = process.cwd();

function arquivosDoCliente(): string[] {
  const rotas = readdirSync(join(RAIZ, "src/routes/portal")).map((f) => join("src/routes/portal", f));
  const comps = readdirSync(join(RAIZ, "src/components/portal")).map((f) => join("src/components/portal", f));
  const emails = readdirSync(join(RAIZ, "src/lib/email-templates"))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join("src/lib/email-templates", f));
  return [...rotas, ...comps, ...emails].filter((f) => f.endsWith(".tsx"));
}

describe("marca do App Cliente", () => {
  it("o azul oficial do Guia de Marca é #2F4B6E", () => {
    expect(MARCA_CORES.azul).toBe("#2F4B6E");
  });

  it("nenhuma superfície do cliente usa o azul retirado", () => {
    const infratores = arquivosDoCliente().filter((f) => {
      const conteudo = readFileSync(join(RAIZ, f), "utf8");
      return AZUIS_RETIRADOS.some((hex) => conteudo.includes(hex));
    });
    expect(infratores).toEqual([]);
  });

  it("as telas do cliente não fixam cor de marca em estilo inline", () => {
    const infratores = arquivosDoCliente()
      .filter((f) => f.startsWith("src/routes/portal") || f.startsWith("src/components/portal"))
      .filter((f) => /#[0-9a-fA-F]{6}/.test(readFileSync(join(RAIZ, f), "utf8")));
    expect(infratores).toEqual([]);
  });
});

describe("copy do App Cliente", () => {
  const textos = [
    ...Object.values(COPY_ESTADO_TITULO),
    ...Object.values(COPY_ESTADO_TEXTO),
    ...Object.values(COPY_GERAL),
    ...Object.values(COPY_TELAS).flatMap((t) => [t.navegacao, t.titulo, t.descricao, t.vazio]),
  ];

  it("nenhum texto exposto ao cliente usa termo de operação interna", () => {
    const infratores = textos.filter((t) => contemTermoProibido(t));
    expect(infratores).toEqual([]);
  });

  it("os seis estados do spec têm título e texto próprios", () => {
    for (const estado of [
      "available_empty",
      "in_preparation",
      "contracted_not_released",
      "released",
      "not_applicable",
      "hidden_by_permission",
    ] as const) {
      expect(COPY_ESTADO_TITULO[estado].length).toBeGreaterThan(3);
      expect(COPY_ESTADO_TEXTO[estado].length).toBeGreaterThan(20);
    }
  });

  it("hidden_by_permission não revela conteúdo nem motivo sensível", () => {
    const texto = COPY_ESTADO_TEXTO.hidden_by_permission.toLowerCase();
    expect(texto).not.toMatch(/contrat|pagamento|pendênc|bloque/);
  });

  it("Fase 02 não usa linguagem de venda", () => {
    const fase2 = Object.values(COPY_TELAS.fase02).join(" ");
    expect(contemTermoProibido(fase2)).toBe(false);
    expect(fase2.toLowerCase()).not.toMatch(/contrat|invest|oferta|plano adicional/);
  });

  it("não sobra mensagem vaga nas telas do cliente", () => {
    const vagas = /sem dados|nenhum registro encontrado|erro desconhecido|undefined|Carregando…"/;
    const infratores = arquivosDoCliente()
      .filter((f) => f.startsWith("src/routes/portal"))
      .filter((f) => vagas.test(readFileSync(join(RAIZ, f), "utf8")));
    expect(infratores).toEqual([]);
  });

  it("o guarda de termos reconhece vocabulário interno", () => {
    expect(contemTermoProibido("Fila do Desk com SLA vencido")).toBe(true);
    expect(contemTermoProibido("A equipe está preparando esta etapa.")).toBe(false);
  });
});
