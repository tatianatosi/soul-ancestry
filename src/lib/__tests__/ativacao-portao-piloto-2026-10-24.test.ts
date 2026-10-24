import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Proprietária, 24/10/2026: "pra variar eu até hoje nao consigo ativar o caso
 * eu clico em ativar o caso e nao acontece nada nem salva" — e, em seguida, o
 * aviso real da tela: "Ativação bloqueada: Ativação operacional NO_GO.
 * Bloqueios críticos abertos: ...".
 *
 * Medido no banco vivo em 24/10/2026, caso a11a0000-…-002:
 *   status ......................... pronto_para_ativar
 *   ativado_em ..................... null
 *   piloto_bloqueios abertos ....... 19, todos criticidade 'critico'
 *   staff_access da Proprietária ... role=admin, status=active (1 linha)
 *
 * Diagnóstico: o botão funciona e o papel dela passa. O que recusa é o trigger
 * `fn_piloto_caso_guard` (migration 20260816232935): num caso com piloto=true,
 * QUALQUER transição para ativo é recusada enquanto houver linha em
 * `piloto_bloqueios` com status 'aberto' e criticidade 'critico'. O separador
 * '; ' do aviso é o `string_agg` daquele trigger.
 *
 * É a MESMA CLASSE DE BUG que o comentário de 05/09/2026 em
 * onboarding.functions.ts já descreve — tela olhando uma fonte, banco
 * recusando por outras — com uma quinta fonte que ficou de fora:
 * `piloto_bloqueios` não entra em `case_ativacao_bloqueios_reais`. Então a
 * tela mostrava "pronto", prometia que pendência não impede a proprietária, e
 * o clique não gravava nada.
 *
 * Esta rodada não resolve os 19 bloqueios — são decisões de governança dela.
 * Ela torna o portão visível ANTES do clique, e tira o silêncio do erro.
 */

const fn = readFileSync("src/lib/onboarding.functions.ts", "utf8");
const tela = readFileSync("src/routes/_authenticated/onboarding.$id.tsx", "utf8");

describe("a quinta fonte de bloqueio passa a ser lida", () => {
  it("o caso é lido com a marca de piloto, que decide se o portão se aplica", () => {
    expect(fn).toContain("suspenso_em,created_at,piloto");
  });

  it("lê piloto_bloqueios só o que o trigger de fato verifica", () => {
    expect(fn).toContain('.from("piloto_bloqueios")');
    expect(fn).toContain('.eq("status", "aberto")');
    expect(fn).toContain('.eq("criticidade", "critico")');
    expect(fn).toContain('.is("archived_at", null)');
  });

  it("devolve a lista para a tela", () => {
    expect(fn).toContain("bloqueiosPiloto: (bloqueiosPiloto.data ?? [])");
  });

  it("não inventa tabela nem vocabulário: o nome do trigger real está registrado", () => {
    expect(fn).toContain("fn_piloto_caso_guard");
  });
});

describe("a tela avisa antes do clique, em vez de prometer o que o banco nega", () => {
  it("mostra o portão do piloto com a contagem e a lista", () => {
    expect(tela).toContain("data-portao-piloto");
    expect(tela).toContain("O banco vai recusar a ativação deste caso");
    expect(tela).toContain("bloqueiosPiloto ?? []).map(");
  });

  it("diz explicitamente que o override da proprietária NÃO vence este portão", () => {
    expect(tela).toContain("o override da proprietária não o vence");
    expect(tela).toContain("fn_piloto_caso_guard");
  });

  it("o texto de 'pendência não impede' deixou de valer para o portão do banco", () => {
    expect(tela).toContain("Isso não vale para o portão do piloto acima");
  });
});

describe("um erro do servidor nunca mais é silencioso", () => {
  it("a mutation de ativar tem onError que escreve na tela", () => {
    const bloco = tela.slice(tela.indexOf("const mAtivar"), tela.indexOf("const mAtualizarOnboarding"));
    expect(bloco).toContain("onError:");
    expect(bloco).toContain("Ativação falhou antes de gravar");
  });
});
