import { describe, expect, it } from "vitest";

import {
  AVISO_RASCUNHO_TESTE,
  MARCADOR_SEM_FONTE,
  MODELOS_CONTRATUAIS,
  montarRascunhoModelo,
  rascunhoHabilitaAcao,
} from "@/lib/matriz-modelos-contratuais";
import {
  QUALIFICACAO_INSTITUCIONAL_PARAGRAFOS,
  qualificacaoInstitucionalRenderizada,
  violacoesQualificacao,
} from "@/lib/qualificacao-institucional";
import {
  anexosIndividuaisDoNucleo,
  criarPessoaNucleo,
  representacaoPrevista,
  validarComposicaoNucleo,
} from "@/lib/modelo-nucleo-familiar";
import { validarComposicaoIndividual, criarRequerentePrincipal, criarAcompanhante } from "@/lib/modelo-individual-acompanhante";

const CHAVES = ["individual", "casal", "nucleo_familiar"] as const;

describe("matriz de modelos contratuais", () => {
  it("tem três modelos distintos e versionados", () => {
    expect(MODELOS_CONTRATUAIS).toHaveLength(3);
    expect(new Set(MODELOS_CONTRATUAIS.map((m) => m.id)).size).toBe(3);
    for (const m of MODELOS_CONTRATUAIS) expect(m.versao).toBe("v1.0");
  });

  it("todos nascem em under_legal_review sobre a mesma base", () => {
    for (const m of MODELOS_CONTRATUAIS) {
      expect(m.status).toBe("under_legal_review");
      expect(m.base).toBe("MODELO-ESTUDO + BASE-GEN-V2");
    }
  });

  it("nenhum rascunho habilita ação", () => {
    expect(rascunhoHabilitaAcao()).toBe(false);
  });

  it.each(CHAVES)("rascunho %s contém perfil, 14 cláusulas, matriz, anexos e pendências", (chave) => {
    const r = montarRascunhoModelo(chave, "2026-08-22");
    expect(r.aviso).toBe(AVISO_RASCUNHO_TESTE);
    expect(r.capa.status).toBe("under_legal_review");
    expect(r.clausulas).toHaveLength(14);
    expect(r.matriz).toHaveLength(16);
    expect(r.perfil.qualificacao.paragrafos).toEqual(QUALIFICACAO_INSTITUCIONAL_PARAGRAFOS);
    expect(r.anexos.length).toBeGreaterThanOrEqual(10);
    expect(r.pendencias.length).toBeGreaterThanOrEqual(6);
    for (const p of r.pendencias) expect(p.gateBloqueado).toBeTruthy();
    expect(r.perfil.placeholders.map((p) => p.valor)).toContain("[CNPJ INSTITUCIONAL]");
  });

  it.each(CHAVES)("rascunho %s usa apenas placeholders neutros no bloco de partes", (chave) => {
    const r = montarRascunhoModelo(chave, "2026-08-22");
    for (const p of r.partes) expect(p).toMatch(/^\[.+\]$/);
    const texto = JSON.stringify(r);
    for (const proibido of ["Ana Luiza", "Adair", "Alice", "Felipe", "João", "Melani", "9.600", "1.290"]) {
      expect(texto).not.toContain(proibido);
    }
  });

  it("marca campos sem fonte formal e não infere preço/país/vencimento", () => {
    const r = montarRascunhoModelo("casal", "2026-08-22");
    const comercial = r.pendencias.find((p) => p.tema.includes("Condição comercial"));
    expect(comercial?.situacao).toBe(MARCADOR_SEM_FONTE);
    const anexoIV = r.anexos.find((a) => a.codigo === "ANEXO-IV");
    expect(anexoIV?.motivoBloqueio).toMatch(/país|País/);
  });
});

describe("qualificação institucional", () => {
  it("nasce em revisão jurídica e sem declarações vedadas", () => {
    const q = qualificacaoInstitucionalRenderizada();
    expect(q.status).toBe("under_legal_review");
    expect(q.vigente).toBe(false);
    expect(q.violacoes).toEqual([]);
    expect(q.pendencias.length).toBeGreaterThan(0);
  });

  it("detecta declarações proibidas", () => {
    expect(violacoesQualificacao("Somos exclusivos e garantia de cidadania").length).toBeGreaterThan(0);
  });
});

describe("modelo individual", () => {
  it("aceita um requerente com acompanhante opcional limitada", () => {
    const r = validarComposicaoIndividual({
      requerentes: [criarRequerentePrincipal({ identificado: "confirmado_humano" })],
      acompanhante: criarAcompanhante(),
    } as never);
    expect(r.bloqueios.every((b) => !b.mensagem.includes("acompanhante"))).toBe(true);
  });
});

describe("modelo núcleo familiar", () => {
  const adulto = () =>
    criarPessoaNucleo("adulto_requerente", {
      identificado: "confirmado_humano",
      parteContratante: "confirmado_humano",
      signatario: "confirmado_humano",
    });

  it("exige ao menos um adulto requerente", () => {
    const r = validarComposicaoNucleo({ pessoas: [], propostaAprovadaNoCaso: false, escopoFamiliarCentral: false });
    expect(r.valido).toBe(false);
    expect(r.bloqueios.some((b) => b.codigo === "MN-G01")).toBe(true);
  });

  it("aceita dependente identificado sem torná-lo signatário", () => {
    const dependente = criarPessoaNucleo("dependente", {
      identificado: "confirmado_humano",
      relevanteAoEscopo: true,
    });
    const r = validarComposicaoNucleo({
      pessoas: [adulto(), dependente],
      propostaAprovadaNoCaso: true,
      escopoFamiliarCentral: true,
    });
    expect(r.valido).toBe(true);
    expect(dependente.signatario).toBe("pendente");
  });

  it("bloqueia dependente signatário", () => {
    const dependente = criarPessoaNucleo("dependente", {
      identificado: "confirmado_humano",
      relevanteAoEscopo: true,
      signatario: "confirmado_humano",
    });
    const r = validarComposicaoNucleo({
      pessoas: [adulto(), dependente],
      propostaAprovadaNoCaso: true,
      escopoFamiliarCentral: true,
    });
    expect(r.bloqueios.some((b) => b.codigo === "MN-G04")).toBe(true);
  });

  it("gera um anexo individual por adulto confirmado e nenhum para dependente", () => {
    const composicao = {
      pessoas: [adulto(), adulto(), criarPessoaNucleo("dependente", { identificado: "confirmado_humano", relevanteAoEscopo: true })],
      propostaAprovadaNoCaso: true,
      escopoFamiliarCentral: true,
    };
    expect(anexosIndividuaisDoNucleo(composicao)).toHaveLength(2);
    expect(representacaoPrevista(composicao)).toBe(false);
  });
});
