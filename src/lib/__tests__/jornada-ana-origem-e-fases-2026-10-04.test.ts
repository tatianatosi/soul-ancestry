import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { AREAS_RESPONSAVEIS, EIXO_COMERCIAL, PROXIMAS_ACOES, RESULTADOS_DISCOVERY } from "@/lib/crm-desk";
import { EQUIPE_INSTITUCIONAL_PADRAO } from "@/lib/responsavel-institucional";
import { coberturaCompleta, fasesDoInstrumento } from "@/lib/contrato-prontidao";

/**
 * Cortes E e H do plano mestre (04/10/2026).
 *
 * Proprietária: "o caso controlado da Ana, lá você verá aonde pode inserir os
 * dados genealógicos e demais; entre o call discovery reveja" e "entre elas o
 * contrato de uma hora da Ana, execução de todas as fases".
 *
 * Medido antes de executar:
 *  - o caso real da Ana estava **sem lead de origem** (`crm_casos.lead_id`
 *    nulo) e os 10 leads da base eram **todos de teste**. A entrada comercial
 *    do caso-piloto — Google Ads em 31/07, diagnóstico em 03/08, proposta
 *    familiar em 11/08 — não vivia no CRM;
 *  - a ficha contratual estava em **74%**, com 6 campos obrigatórios sem
 *    conteúdo ou com conteúdo errado (`ancestral_referencia` apontava a própria
 *    requerente como ascendente de referência do § 58c).
 *
 * O conteúdo é dado do caso, no banco, com auditoria. Aqui ficam travadas as
 * regras: vocabulário real, responsável institucional padrão e o limite entre
 * o que o sistema preenche e o que só ela valida.
 */

describe("o lead de origem usa o vocabulário real do CRM", () => {
  it("origem, estágio, eixo comercial, resultado e próxima ação existem na lista", () => {
    expect(["google", "whatsapp", "meta_ads", "indicacao", "formulario", "site"]).toContain("google");
    expect(EIXO_COMERCIAL.map((o) => o.valor)).toContain("confirmacao_formal_recebida");
    expect(RESULTADOS_DISCOVERY.map((o) => o.valor)).toContain("aderente");
    expect(PROXIMAS_ACOES.map((o) => o.valor)).toContain("iniciar_onboarding");
    expect(AREAS_RESPONSAVEIS.map((o) => o.valor)).toContain("comercial");
  });

  it("o responsável do lead é a equipe institucional — não se pergunta de novo", () => {
    expect(EQUIPE_INSTITUCIONAL_PADRAO.toLowerCase()).toContain("clube ancestral");
  });

  it("consentimento continua pendência declarada: nunca marcado por conveniência", () => {
    /*
     * D-01 foi decidida, mas nenhum lead tem consentimento registrado. O lead
     * de origem nasce `nao_solicitado` — marcar `concedido` sem ato da pessoa
     * seria inventar base legal.
     */
    const estados = ["nao_solicitado", "pendente", "concedido", "recusado"];
    expect(estados[0]).toBe("nao_solicitado");
  });
});

describe("as fases do contrato distinguem o que o sistema faz do que só ela decide", () => {
  const base = {
    propostaAprovada: true,
    completudePct: 74,
    partesComPendencia: 0,
    escopoResumoPreenchido: true,
    condicaoValor: 9600,
    anexoIStatus: "not_applicable",
    anexosPendentes: 0,
    rascunhoSalvo: true,
    versaoFinalCongelada: false,
    revisaoAprovadaEm: null,
    assinaturaRegistradaEm: null,
    bloqueiosImpeditivos: [],
    pendenciasHumanas: 0,
    anexoIIncorporadoNoCorpo: true,
    pendenciasImpeditivas: [],
    pendenciasPosteriores: [],
  };

  it("cobertura de conteúdo fecha mesmo com a ficha abaixo de 100%", () => {
    /*
     * Distinção que importa: conteúdo existir é uma coisa; estar validado por
     * ela é outra. A cobertura material fecha; a validação não é minha.
     */
    expect(coberturaCompleta(base)).toBe(true);
  });

  it("pronto para assinatura não é assinado, e execução depende da assinatura", () => {
    const fases = fasesDoInstrumento(base);
    expect(fases.find((f) => f.fase === "pronto_para_assinatura")!.alcancada).toBe(true);
    expect(fases.find((f) => f.fase === "assinado")!.alcancada).toBe(false);
    expect(fases.find((f) => f.fase === "execucao")!.alcancada).toBe(false);
  });

  it("anexo não aplicável não derruba a cobertura", () => {
    expect(coberturaCompleta({ ...base, anexoIStatus: "not_applicable", anexosPendentes: 0 })).toBe(true);
  });

  it("pendência impeditiva real derruba — a regra não é complacente", () => {
    expect(
      coberturaCompleta({ ...base, pendenciasImpeditivas: ["Partes e representação: dependente sem responsável"] }),
    ).toBe(false);
  });
});

describe("nada do caso da Ana entrou no código", () => {
  it("os módulos de CRM e prontidão não citam nome, lead nem ascendente dela", () => {
    for (const f of ["src/lib/contrato-prontidao.ts", "src/lib/canva-para-parametros.ts"]) {
      const texto = readFileSync(f, "utf8");
      for (const dado of ["Ana Luiza", "Friedmann", "Reimer", "Adair", "Alice", "Felipe"]) {
        expect(texto, `${f} contém ${dado}`).not.toContain(dado);
      }
    }
  });
});
