import { describe, expect, it } from "vitest";

import {
  CLAUSULAS_FIXAS,
  CONTRATO_BASE_STATUS,
  MATRIZ_RENDERIZACAO,
  PERFIL_INSTITUCIONAL,
  PROIBICOES_IDENTIFICACAO,
  VARIAVEIS_PERMITIDAS,
} from "@/lib/contrato-base-consolidado";
import {
  SECOES_DOCUMENTO_PUBLICADO,
  clausulasSemSecaoPublicada,
} from "@/lib/contrato-base-consolidado";
import {
  VARIAVEIS_TESTE,
  anexosDaPreviaTeste,
  bloqueiosDaPreviaTeste,
  matrizRenderizacaoPreviaTeste,
  previaTesteAssinavel,
} from "@/lib/contrato-base-previa";

describe("contrato-base consolidado v1.0", () => {
  it("registra as 14 cláusulas fixas, numeradas e com conteúdo", () => {
    expect(CLAUSULAS_FIXAS).toHaveLength(14);
    expect(CLAUSULAS_FIXAS.map((c) => c.numero)).toEqual(
      Array.from({ length: 14 }, (_, i) => i + 1),
    );
    for (const c of CLAUSULAS_FIXAS) {
      expect(c.titulo.length).toBeGreaterThan(5);
      expect(c.itens.length).toBeGreaterThan(0);
    }
  });

  it("28/08/2026 — revisão jurídica concluída (Proprietária): modelo vigente; prévia TESTE segue sempre não assinável (dado fictício)", () => {
    expect(CONTRATO_BASE_STATUS).toBe("vigente");
    expect(previaTesteAssinavel()).toBe(false);
  });

  it("perfil institucional não expõe dado pessoal do sócio", () => {
    const texto = PERFIL_INSTITUCIONAL.map((c) => `${c.campo} ${c.valor}`)
      .join(" ")
      .toLowerCase();
    for (const proibido of ["cpf", "rg", "estado civil", "nacionalidade"]) {
      expect(texto).not.toContain(proibido);
    }
    expect(PROIBICOES_IDENTIFICACAO.length).toBeGreaterThan(0);
  });

  it("matriz de variáveis e de renderização estão preenchidas", () => {
    expect(VARIAVEIS_PERMITIDAS.length).toBeGreaterThan(5);
    for (const g of VARIAVEIS_PERMITIDAS) expect(g.variaveis.length).toBeGreaterThan(0);
    expect(MATRIZ_RENDERIZACAO.length).toBeGreaterThan(5);
    for (const l of MATRIZ_RENDERIZACAO) expect(l.clausulas.length).toBeGreaterThan(0);
  });
});

describe("prévia TESTE do motor", () => {
  const anexos = anexosDaPreviaTeste();

  it("campo sem fonte permanece pendente, nunca inferido", () => {
    const valor = VARIAVEIS_TESTE.find((v) => v.campo === "valor_total")!;
    expect(valor.valor).toBeNull();
    expect(valor.estado).toBe("pendente");
  });

  it("deriva anexo individual por beneficiário e representação para o menor", () => {
    const ind = anexos.find((a) => a.codigo === "ANX-INDIVIDUAL")!;
    expect(ind.instancias).toHaveLength(2);
    const rep = anexos.find((a) => a.codigo === "ANX-REPRESENTACAO")!;
    expect(rep.obrigatorio).toBe(true);
  });

  it("cada bloqueio traz motivo e rota de resolução, incluindo revisão jurídica", () => {
    const b = bloqueiosDaPreviaTeste(anexos);
    expect(b.length).toBeGreaterThan(1);
    for (const item of b) {
      expect(item.motivo.length).toBeGreaterThan(10);
      expect(item.rotaResolucao.length).toBeGreaterThan(5);
    }
    expect(b.some((x) => x.titulo.includes("Revisão humana"))).toBe(true);
  });

  it("matriz de renderização marca blocos pendentes na prévia", () => {
    const m = matrizRenderizacaoPreviaTeste(anexos);
    expect(m.some((l) => l.situacao === "renderizado_com_pendencia")).toBe(true);
  });
});

describe("equivalência com o documento consolidado publicado", () => {
  it("mapeia as 14 seções publicadas sem deixar cláusula interna órfã", () => {
    expect(SECOES_DOCUMENTO_PUBLICADO).toHaveLength(14);
    expect(clausulasSemSecaoPublicada()).toEqual([]);
  });

  it("mantém o perfil institucional como fonte própria da seção 1", () => {
    expect(SECOES_DOCUMENTO_PUBLICADO[0]!.clausulaInterna).toBeNull();
  });
});
