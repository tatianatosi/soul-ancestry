import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import { recusaDePublicacaoNoApp, exigirPublicavelNoApp } from "@/lib/projecao-publicavel";

/**
 * Guard de publicação no App (03/10/2026) — achado medido no banco ao vivo,
 * no caso real da Ana (`CA-CID-AT-FAM-2026-001`).
 *
 * As TRÊS projeções publicadas dela eram todas descartadas pelo App, então a
 * tela do cliente ficava vazia COM conteúdo publicado no banco:
 * contrato e proposta por preço (A7 bloqueado), e a microentrega legítima
 * por dizer "fontes consultadas" (vocabulário interno).
 *
 * A regra nunca é afrouxar o filtro do App: é recusar na gravação o que não
 * pode chegar ao cliente, dizendo o motivo — publicar algo invisível é pior
 * que recusar, porque a equipe acha que entregou.
 */

/** Textos exatamente como estavam publicados no banco em 03/10. */
const CONTRATO_PUBLICADO =
  "Contrato-base familiar — Silveira / Friedmann-Reimer (Áustria) · 2026-CB-0001 · Aguardando dados · Vigência a partir de 26/08/2026 · Parcelas: 3 assinaturas mensais de R$ 320 por responsável, durante 10 meses — total R$ 9.600. Cada assinatura termina automaticamente após a 10ª cobrança.";
const PROPOSTA_PUBLICADA =
  "Proposta do estudo · Versão 1 · Aprovada · Validade até 30/09/2026 · Parcelas: 3 assinaturas mensais de R$ 320 por responsável, durante 10 meses — total R$ 9.600.";
const MICROENTREGA_PUBLICADA =
  "Concluimos a primeira prancha da linha materna Silveira e ja registramos as fontes consultadas.";

describe("guard de publicação — reproduz o caso real da Ana", () => {
  it("recusa o contrato publicado: tem preço, e o App ficaria sem mostrar nada", () => {
    const r = recusaDePublicacaoNoApp(CONTRATO_PUBLICADO);
    expect(r).not.toBeNull();
    expect(r!.motivo).toMatch(/preço|parcela/i);
    expect(r!.comoCorrigir).toMatch(/A7/);
  });

  it("recusa a proposta publicada pelo mesmo motivo", () => {
    expect(recusaDePublicacaoNoApp(PROPOSTA_PUBLICADA)).not.toBeNull();
  });

  it("recusa a microentrega legítima porque cita 'fontes' — e ensina a troca de expressão do Adendo", () => {
    const r = recusaDePublicacaoNoApp(MICROENTREGA_PUBLICADA);
    expect(r).not.toBeNull();
    expect(r!.motivo).toMatch(/vocabulário interno/i);
    expect(r!.comoCorrigir).toMatch(/tipo de evidência, estado de validação/);
  });

  it("o mesmo conteúdo reescrito na linguagem do cliente passa", () => {
    const reescrito =
      "Concluímos a primeira prancha da linha materna Silveira. Estado de validação: em conferência. Próximo passo: devolutiva da equipe.";
    expect(recusaDePublicacaoNoApp(reescrito)).toBeNull();
    expect(exigirPublicavelNoApp(reescrito)).toBe(reescrito);
  });

  it("texto vazio é recusado com motivo próprio", () => {
    expect(recusaDePublicacaoNoApp("")!.motivo).toMatch(/não há texto/i);
    expect(recusaDePublicacaoNoApp("   ")).not.toBeNull();
  });

  it("exigirPublicavelNoApp lança com motivo e correção juntos", () => {
    expect(() => exigirPublicavelNoApp(CONTRATO_PUBLICADO)).toThrow(/A7/);
  });
});

describe("guard de publicação — o escritor do Go Live deixou de compor preço e passou a validar", () => {
  const src = readFileSync("src/lib/golive-escritores.functions.ts", "utf8");

  it("não compõe mais `Parcelas:` no texto que vai ao App", () => {
    expect(src).not.toContain("`Parcelas: ${texto(p.data.forma_pagamento)}`");
    expect(src).not.toContain("`Parcelas: ${texto(r.data.forma_pagamento)}`");
  });

  it("valida o resumo antes de gravar em app_projections", () => {
    // Só o trecho desta função: o arquivo tem 16 escritas em app_projections.
    const inicio = src.indexOf("export const publicarInstrumentoNoAppGoLive");
    const fim = src.indexOf("export const despublicarDoAppGoLive");
    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    const trecho = src.slice(inicio, fim);
    expect(trecho).toContain("exigirPublicavelNoApp(resumo)");
    expect(
      trecho.indexOf("exigirPublicavelNoApp(resumo)"),
      "o guard precisa vir ANTES do insert",
    ).toBeLessThan(trecho.indexOf('.insert({'));
  });

  it("a condição comercial continua existindo no Desk — nada foi apagado do contrato/proposta", () => {
    expect(src).toContain("forma_pagamento");
  });
});

describe("guard de publicação — a regra que NÃO muda", () => {
  it("o filtro de leitura do App segue intacto: o guard é adicional, não substituto", () => {
    const portal = readFileSync("src/lib/portal-dados-vivos.ts", "utf8");
    expect(portal).toContain("contemConteudoInterno");
  });
});
