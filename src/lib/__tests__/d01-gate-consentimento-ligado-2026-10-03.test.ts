import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { AVISO_PRIVACIDADE } from "@/lib/decisoes-da-proprietaria";

/**
 * D-01 — gate de consentimento LIGADO (03/10/2026).
 *
 * Autorização literal: "pode ligar o gate de consentimento aos 11 leads
 * lembrando que temos a politica de privacidade e anexo de lgpd em contrato
 * esse gate é no desk https://clubeancestral.com.br/".
 *
 * ## O defeito que a medição revelou
 *
 * Os 11 leads estavam todos em `consentimento_status = 'nao_solicitado'`, e
 * a leitura fácil seria "falta alguém registrar". Errado: o trigger do banco
 * (`20260821235800`) recusa `concedido` sem data/hora, canal E versão do
 * aviso — e `salvarConsentimentosDiscovery` NUNCA gravava a versão. Conceder
 * consentimento pela tela falhava sempre. O gate não aguardava dado: era
 * inalcançável por construção.
 *
 * O que este corte NÃO faz, de propósito: marcar os 11 como `concedido`.
 * Consentimento é fato sobre uma pessoa — quem concede é ela, e quem registra
 * é a equipe, na call. Fabricar isso seria exatamente o que a LGPD proíbe.
 */

const ESCRITOR = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
const UI = readFileSync("src/components/crm/mesa-roteiro-mestre.tsx", "utf8");

describe("Aviso de privacidade — versão vem da política publicada", () => {
  it("a constante aponta para a política e para o anexo contratual", () => {
    expect(AVISO_PRIVACIDADE.url).toBe("https://clubeancestral.com.br/");
    expect(AVISO_PRIVACIDADE.versao).toMatch(/politica-privacidade/);
    expect(AVISO_PRIVACIDADE.anexoContratual).toMatch(/LGPD/);
  });
});

describe("O escritor passou a cumprir o que o trigger exige", () => {
  it("carimba a versão do aviso ao conceder", () => {
    expect(ESCRITOR).toContain("payload.consentimento_versao_aviso = AVISO_PRIVACIDADE.versao");
  });

  it("recusa com motivo legível quando falta o canal, em vez de deixar o trigger estourar", () => {
    /*
      Antes, sem canal, a gravação chegava ao banco e voltava com a exceção
      crua do trigger. Recusar antes, dizendo o que falta, é a diferença
      entre erro útil e erro de banco na cara da equipe.
    */
    expect(ESCRITOR).toContain("Consentimento concedido exige o canal em que foi dado");
  });

  it("não sobrescreve a versão de um consentimento já registrado", () => {
    // Consentimento antigo continua apontando para o aviso que foi de fato
    // apresentado — reescrever a versão falsificaria o histórico.
    expect(ESCRITOR).toContain('if (!String(lead.consentimento_versao_aviso ?? "").trim())');
  });

  it("só carimba quando a resposta é SIM — recusa e pendente não ganham versão", () => {
    const i = ESCRITOR.indexOf('if (g === "sim") {');
    const j = ESCRITOR.indexOf("consentimento_versao_aviso = AVISO_PRIVACIDADE.versao", i);
    expect(i).toBeGreaterThan(-1);
    expect(j).toBeGreaterThan(i);
  });
});

describe("A tela diz qual aviso está sendo apresentado", () => {
  it("mostra versão, link da política e o anexo contratual", () => {
    expect(UI).toContain("data-aviso-privacidade");
    expect(UI).toContain("AVISO_PRIVACIDADE.versao");
    expect(UI).toContain("AVISO_PRIVACIDADE.url");
    expect(UI).toContain("AVISO_PRIVACIDADE.anexoContratual");
  });

  it("o gate é no Desk, não no App — nenhuma rota do portal registra consentimento", () => {
    for (const arquivo of ["src/routes/portal/conta.tsx", "src/routes/portal/index.tsx"]) {
      const src = readFileSync(arquivo, "utf8");
      expect(src.includes("salvarConsentimentosDiscovery"), arquivo).toBe(false);
    }
  });
});

describe("O que NÃO foi feito, e por quê", () => {
  it("nenhum lead é marcado como concedido por código", () => {
    /*
      Grep negativo deliberado: nenhum lugar do `src` escreve "concedido" em
      lote nem a partir de inferência. O status nasce da resposta registrada
      na call, por uma pessoa.
    */
    const ui = readFileSync("src/components/crm/mesa-roteiro-mestre.tsx", "utf8");
    expect(ui).toContain("m.mutate({ tipo: c.tipo, valor: v })");
    expect(ESCRITOR).toContain('g === "sim" ? "concedido"');
    // A decisão vem do valor escolhido (`g`), nunca de um default.
    expect(ESCRITOR).not.toMatch(/consentimento_status\s*=\s*"concedido"/);
  });
});
