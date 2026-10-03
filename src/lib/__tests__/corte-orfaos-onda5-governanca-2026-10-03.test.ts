import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { ACOES_JAMAIS_LIBERADAS_POR_OVERRIDE, ESCOPOS_LIBERAVEIS, TIPOS_OVERRIDE, validarSolicitacaoOverride } from "@/lib/override-proprietaria-comercial";

/**
 * Corte ÓRFÃOS onda 5 (03/10/2026) — governança.
 *
 * Seis escritores/leitores de governança existiam sem nenhum chamador de UI:
 * a exceção da Proprietária só podia ser registrada por SQL, a trilha de
 * auditoria do catálogo não podia ser aberta, a primeira conciliação de
 * catálogo nunca era gravada pela tela, e o histórico de vigência da
 * Biblioteca Mestre era inalcançável.
 */

const painelOverride = readFileSync("src/components/caso/override-comercial.tsx", "utf8");
const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
const painelAuditoria = readFileSync("src/components/catalogo/auditoria-catalogo.tsx", "utf8");
const telaCatalogo = readFileSync("src/routes/_authenticated/catalogo.tsx", "utf8");
const bloqueioOS = readFileSync("src/components/contrato/bloqueio-emissao-os.tsx", "utf8");
const biblioteca = readFileSync("src/routes/_authenticated/biblioteca.tsx", "utf8");

describe("os 6 órfãos de governança ganharam chamador", () => {
  it.each([
    ["registrarOverrideComercial", painelOverride],
    ["revogarOverrideComercial", painelOverride],
    ["listarOverridesComerciais", painelOverride],
    ["lerAuditoriaCatalogo", painelAuditoria],
    ["executarConciliacaoCatalogo", bloqueioOS],
    ["historicoVigenciaItem", biblioteca],
  ])("%s", (fn, arquivo) => {
    expect(arquivo).toContain(fn);
  });

  it("montados nas superfícies reais", () => {
    expect(caso360).toMatch(/OverrideComercial/);
    expect(telaCatalogo).toMatch(/AuditoriaCatalogo/);
    expect(bloqueioOS).toMatch(/RegistrarConciliacao/);
    expect(biblioteca).toMatch(/HistoricoVigencia/);
  });
});

describe("a exceção da Proprietária não ficou mais frouxa por ter tela", () => {
  it("exige objeto, condição original, gate, escopo, justificativa e data de revisão", () => {
    const r = validarSolicitacaoOverride({
      tipo: "iniciar_antes_pagamento",
      casoId: "",
      objetoAfetado: "",
      condicaoOriginal: "",
      gatesPendentes: [],
      escopoLiberado: [],
      justificativa: "",
      autorUserId: "u",
      autorPapel: "admin",
      dataRevisao: "",
    } as never);
    expect(r.erros.length).toBeGreaterThan(4);
    expect(r.erros.join(" ")).toMatch(/a exceção precisa declarar a regra que está superando/);
  });

  it("a tela só oferece escopos liberáveis daquele tipo, nunca texto livre", () => {
    expect(painelOverride).toMatch(/ESCOPOS_LIBERAVEIS\[tipo\]/);
    expect(painelOverride).toMatch(/TIPOS_OVERRIDE\.map/);
    expect(TIPOS_OVERRIDE.length).toBe(5);
    expect(Object.keys(ESCOPOS_LIBERAVEIS).sort()).toEqual([...TIPOS_OVERRIDE].sort());
  });

  it("a tela diz que enviar, assinar, cobrar e publicar nunca são liberados", () => {
    expect(painelOverride).toMatch(/Enviar, assinar,\s*\n?\s*cobrar e publicar nunca são liberados/);
    expect(ACOES_JAMAIS_LIBERADAS_POR_OVERRIDE.length).toBeGreaterThan(0);
  });

  it("revogar exige motivo escrito antes de agir", () => {
    expect(painelOverride).toMatch(/Escreva o motivo da revogação/);
  });
});

describe("as leituras de governança são somente leitura", () => {
  it("a trilha de auditoria do catálogo não oferece edição", () => {
    expect(painelAuditoria).toMatch(/Somente\s*\n?\s*leitura/);
    expect(painelAuditoria).not.toMatch(/useMutation|AcaoOperacional/);
  });

  it("o histórico de vigência não grava nada", () => {
    const bloco = biblioteca.slice(biblioteca.indexOf("function HistoricoVigencia"));
    expect(bloco).not.toMatch(/useMutation|definirVigenciaItem/);
  });

  it("a primeira conciliação invalida a leitura e o histórico, para a tela não mentir", () => {
    const bloco = bloqueioOS.slice(bloqueioOS.indexOf("function RegistrarConciliacao"), bloqueioOS.indexOf("function ReprocessarConciliacao"));
    expect(bloco).toMatch(/invalidateQueries/);
  });
});
