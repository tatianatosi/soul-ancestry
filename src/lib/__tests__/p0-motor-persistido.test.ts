import { describe, expect, it } from "vitest";

import {
  CLAUSULAS_FIXAS,
  MATRIZ_RENDERIZACAO,
  PERFIL_INSTITUCIONAL,
} from "@/lib/contrato-base-consolidado";
import { renderCorpoContratual, MODELO_VERSAO_ANEXO } from "@/lib/contrato-corpo.server";
import { instanciasDeAnexos } from "@/lib/anexos-persistidos.server";
import { montarPrevia } from "@/lib/contrato-parametros.server";

const valores = [
  { campo: "produto_sku", valor: "CA-ESTUDO-IT-01", origem: "proposta", status: "confirmado" },
  { campo: "pais_rota", valor: "Itália", origem: "planejador", status: "confirmado" },
  { campo: "valor_total", valor: "R$ 12.000,00", origem: "proposta", status: "confirmado" },
  { campo: "beneficiarios", valor: "Ana Luiza", origem: "planejador", status: "confirmado" },
];

const entrada = {
  caseId: "CASE-TESTE",
  casoCodigo: "CA-2026-TESTE-001",
  clienteNome: "Cliente TESTE",
  responsavel: "Operações",
  valores,
  anexosInternos: [
    { codigo: "ANX-ESCOPO", titulo: "Anexo de escopo", motivo: "Obrigatório no MODELO ESTUDO" },
  ],
};

describe("corpo contratual persistido", () => {
  const corpo = renderCorpoContratual(entrada);

  it("renderiza o perfil institucional versionado", () => {
    expect(corpo.estrutura.perfilVersao).toMatch(/PERFIL-INST/);
    for (const campo of PERFIL_INSTITUCIONAL) expect(corpo.html).toContain(campo.rotulo);
  });

  it("renderiza as 16 cláusulas fixas do contrato-base", () => {
    expect(corpo.estrutura.clausulas).toBe(16);
    for (const c of CLAUSULAS_FIXAS) expect(corpo.html).toContain(`Cláusula ${c.numero}`);
  });

  it("avalia os 16 blocos da matriz de renderização", () => {
    expect(corpo.blocos).toHaveLength(MATRIZ_RENDERIZACAO.length);
    expect(corpo.blocos.every((b) => Boolean(b.motivo))).toBe(true);
  });

  it("expõe os cinco anexos governados com modelo versionado", () => {
    expect(corpo.anexos).toHaveLength(5);
    for (const a of corpo.anexos) expect(MODELO_VERSAO_ANEXO[a.codigo]).toBeTruthy();
  });

  it("não executa assinatura, cobrança, pesquisa externa nem comunicação", () => {
    expect(corpo.html).not.toMatch(/assinado em|cobran[çc]a efetuada|e-mail enviado/i);
  });
});

describe("instâncias persistíveis dos anexos", () => {
  const corpo = renderCorpoContratual(entrada);
  const instancias = instanciasDeAnexos({ anexos: corpo.anexos, internos: entrada.anexosInternos });

  it("gera uma instância por anexo governado e interno", () => {
    expect(instancias).toHaveLength(corpo.anexos.length + 1);
  });

  it("marca anexo condicional não aplicável sem virar pendência", () => {
    const naoAplicaveis = instancias.filter((i) => i.status === "not_applicable");
    expect(naoAplicaveis.every((i) => Boolean(i.reason_not_applicable))).toBe(true);
  });

  it("carrega dados estruturados e regra de aplicabilidade", () => {
    expect(instancias.every((i) => Boolean(i.applicability_rule) && Boolean(i.model_version))).toBe(
      true,
    );
  });
});

describe("prévia com corpo contratual", () => {
  it("marca corpoContratual e persiste a estrutura no conteúdo", () => {
    const corpo = renderCorpoContratual(entrada);
    const previa = montarPrevia({
      tipo: "rascunho",
      caso: { id: "1", codigo: "CA-2026-TESTE-001", titulo: "Caso TESTE" },
      cliente: { nome: "Cliente TESTE" },
      templateCode: "MODELO-ESTUDO",
      templateVersion: 1,
      valores: [],
      corpo,
    });
    expect(previa.corpoContratual).toBe(true);
    expect((previa.conteudo as any).corpo.clausulas).toBe(16);
    expect((previa.conteudo as any).blocos).toHaveLength(16);
    expect(previa.html).toContain("Contrato de Estudo Genealógico v2");
  });

  it("prévia sem corpo continua marcada como sem corpo contratual", () => {
    const previa = montarPrevia({
      tipo: "rascunho",
      caso: { id: "1", codigo: "CA-2026-TESTE-001" },
      cliente: null,
      templateCode: "MODELO-ESTUDO",
      templateVersion: 1,
      valores: [],
    });
    expect(previa.corpoContratual).toBe(false);
  });
});
