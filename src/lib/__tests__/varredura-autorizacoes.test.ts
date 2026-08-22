import { describe, expect, it } from "vitest";

import { ACOES_EXTERNAS } from "@/lib/modo-proprietaria";
import {
  AREAS_CANONICAS,
  CATALOGO_EXCECOES,
  acoesInternas,
  documentoPodeSerAdicionadoEm,
  excecaoPorChave,
  excecaoVencida,
  resumoVarredura,
  validadeSugerida,
} from "@/lib/varredura-autorizacoes";
import { TIPOS_EXCECAO } from "@/lib/ops.server";

describe("varredura de autorizações", () => {
  it("nenhuma ação interna bloqueia o avanço da proprietária", () => {
    expect(acoesInternas().every((a) => a.bloqueiaInterno === false)).toBe(true);
    expect(resumoVarredura().bloqueiosInternos).toBe(0);
  });

  it("toda área canônica tem ao menos uma ação interna liberada", () => {
    for (const area of AREAS_CANONICAS) {
      expect(area.acoes.some((a) => a.natureza === "interna")).toBe(true);
    }
  });

  it("toda ação externa pertence ao catálogo canônico e exige confirmação", () => {
    const externas = AREAS_CANONICAS.flatMap((a) => a.acoes).filter((a) => a.natureza === "externa");
    expect(externas.length).toBeGreaterThan(0);
    for (const acao of externas) {
      expect(ACOES_EXTERNAS as readonly string[]).toContain(acao.chave);
      expect(acao.autorizacao).toMatch(/confirmação final/i);
    }
  });

  it("o seletor de exceções do Desk usa o catálogo canônico", () => {
    for (const e of CATALOGO_EXCECOES) expect(TIPOS_EXCECAO[e.chave]).toBe(e.rotulo);
    expect(Object.keys(TIPOS_EXCECAO)).toHaveLength(CATALOGO_EXCECOES.length);
  });

  it("cada exceção declara quando ocorre, quem autoriza e como regularizar", () => {
    for (const e of CATALOGO_EXCECOES) {
      expect(e.quando.length).toBeGreaterThan(10);
      expect(e.autoriza).toMatch(/[Pp]roprietária/);
      expect(e.regularizacao.length).toBeGreaterThan(10);
      expect(e.impacto.length).toBeGreaterThan(5);
    }
  });

  it("exceção regularizada nunca é vencida e prazo sugerido respeita o tipo", () => {
    const base = new Date("2026-01-01T00:00:00.000Z");
    expect(excecaoVencida({ valido_ate: "2025-01-01T00:00:00.000Z", regularizado_em: "2025-02-01" }, base)).toBe(false);
    expect(excecaoVencida({ valido_ate: "2025-01-01T00:00:00.000Z" }, base)).toBe(true);
    expect(excecaoVencida({ valido_ate: null }, base)).toBe(false);

    const prazo = validadeSugerida("documento_pendente", base);
    expect(prazo).not.toBeNull();
    expect(new Date(prazo as string).getTime()).toBeGreaterThan(base.getTime());
    expect(validadeSugerida("reabertura_caso", base)).toBeNull();
    expect(excecaoPorChave("inexistente")).toBeUndefined();
  });

  it("documentos podem ser adicionados em qualquer etapa do ciclo", () => {
    expect(documentoPodeSerAdicionadoEm("pos_entrega")).toBe(true);
    expect(documentoPodeSerAdicionadoEm("lead")).toBe(true);
    expect(documentoPodeSerAdicionadoEm("etapa_inexistente")).toBe(false);
  });
});
