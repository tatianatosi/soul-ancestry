import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Decisão da Proprietária, 24/10/2026: retirar as camadas de auditoria que travam o
 * onboarding. Ela pediu várias vezes; o que recusava a ativação do caso da Ana era o
 * trigger `fn_piloto_caso_guard` (19 linhas de `piloto_bloqueios`, abertas desde
 * agosto) e, depois dele, `fn_guard_ativacao` (checklist de auto-atestação).
 *
 * Em 05/09/2026 ela já autorizara que 27 guards de cerimônia cedessem a ela
 * (`fn_proprietaria_operando()`); estes dois ficaram de fora. A proposta SQL os faz
 * ceder do mesmo jeito, só na parte "recusar por pendência". Quem aplica é o Lovable.
 *
 * Substitui os testes do PR #188 (que mostravam o portão) e do PR #190 (que
 * ofereciam um botão para resolver cada bloqueio).
 */

const fn = readFileSync("src/lib/onboarding.functions.ts", "utf8");
const tela = readFileSync("src/routes/_authenticated/onboarding.$id.tsx", "utf8");
const sqlCompleto = readFileSync("supabase/pendentes/20261024170000_ativacao_cede_a_proprietaria.sql", "utf8");
/** Só o SQL executável: os comentários citam a condição para explicar a reversão. */
const sql = sqlCompleto
  .split("\n")
  .filter((l) => !l.trim().startsWith("--"))
  .join("\n");

describe("a tela de onboarding não tem mais a camada de bloqueios do piloto", () => {
  it("não lê piloto_bloqueios nem devolve a lista", () => {
    expect(fn).not.toContain('.from("piloto_bloqueios")');
    expect(fn).not.toContain("bloqueiosPiloto");
  });

  it("não mostra o painel de portão nem o botão de resolver", () => {
    expect(tela).not.toContain("data-portao-piloto");
    expect(tela).not.toContain("O banco vai recusar a ativação deste caso");
    expect(tela).not.toContain("ResolucaoBloqueioPiloto");
    expect(tela).not.toContain("mBloqueio");
  });

  it("a proprietária continua ativando com pendências, e a mensagem diz isso sem ressalva", () => {
    expect(tela).toContain("Ativar mesmo com pendências");
    expect(tela).toContain("Pendências do checklist informam — para a proprietária não impedem.");
    expect(tela).not.toContain("Isso não vale para o portão do piloto");
  });

  it("um erro do servidor nunca é silencioso na ativação", () => {
    const bloco = tela.slice(tela.indexOf("const mAtivar"), tela.indexOf("const mSuspender"));
    expect(bloco).toContain("onError:");
    expect(bloco).toContain("Ativação falhou antes de gravar");
  });
});

describe("a proposta SQL faz os dois guards cederem, e só neles", () => {
  it("usa o helper já autorizado em 05/09/2026, nos dois guards", () => {
    expect((sql.match(/and not public\.fn_proprietaria_operando\(\)/g) ?? []).length).toBe(2);
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.fn_piloto_caso_guard()");
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.fn_guard_ativacao()");
  });

  it("mantém as proteções de caso real e o papel/carimbos da ativação", () => {
    expect(sql).toContain("O caso piloto real não pode ser marcado como demonstração.");
    expect(sql).toContain("Somente admin ou operações podem ativar um caso.");
    expect(sql).toContain("NEW.ativado_em := coalesce(NEW.ativado_em, now());");
    expect(sql).toContain("Suspensão exige motivo com no mínimo 10 caracteres.");
  });

  it("é segura de aplicar: confere o corpo atual e aborta se for outro", () => {
    expect(sql).toContain("ABORTADO: o corpo atual de fn_piloto_caso_guard difere do esperado");
    expect(sql).toContain("ABORTADO: o corpo atual de fn_guard_ativacao difere do esperado");
    expect(sql).toContain("to_regprocedure('public.fn_proprietaria_operando()')");
  });

  it("não apaga nem altera dado, não faz DROP nem RENAME", () => {
    expect(sql).not.toMatch(/^\s*(DROP|DELETE|TRUNCATE|UPDATE|INSERT|ALTER)\b/im);
    expect(sql).not.toMatch(/\bRENAME\b/i);
  });
});

describe("checklist de 14 itens removido de /onboarding/$id (25/10/2026)", () => {
  it("a tela não mostra o checklist, o diálogo de evidência nem o indicador", () => {
    expect(tela).not.toContain("Checklist de onboarding");
    expect(tela).not.toContain("Checklist concluído");
    expect(tela).not.toContain("itemOnboardingDe");
    expect(tela).not.toContain("evidenciaOnboarding");
    expect(tela).not.toContain("atualizarItemChecklistOnboarding");
  });

  it("o servidor não lê onboarding_checklist para a tela nem expõe o escritor", () => {
    expect(fn).not.toContain('.from("onboarding_checklist")');
    expect(fn).not.toContain("checklistOnboarding");
    expect(fn).not.toContain("atualizarItemChecklistOnboarding");
  });

  it("os outros requisitos e a linha do tempo da tela seguem, e a tabela no banco não foi tocada", () => {
    expect(tela).toContain("Requisitos validados");
    expect(tela).toContain("Linha do tempo do onboarding");
    expect(sqlCompleto).not.toMatch(/onboarding_checklist/i);
  });
});

describe("checklist de 14 itens removido também do Caso 360 (25/10/2026)", () => {
  const aba = readFileSync("src/components/caso/onboarding-caso.tsx", "utf8");
  const caso360 = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");
  const canon = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");

  it("a aba de onboarding do Caso 360 não tem o checklist, o item editável nem o escritor", () => {
    expect(aba).not.toContain("Checklist de onboarding");
    expect(aba).not.toContain("ItemOnboarding");
    expect(aba).not.toContain("atualizarItemOnboarding");
    expect(caso360).not.toContain("itens={c.onboarding}");
    expect(canon).not.toContain("atualizarItemOnboarding");
  });

  it("o resto da aba segue: plano de onboarding, jornada pós-gates, gates e núcleo familiar", () => {
    expect(aba).toContain("PainelPlanoOnboarding");
    expect(aba).toContain("PainelJornadaPosGates");
    expect(aba).toContain("Gates de cliente ativo");
    expect(aba).toContain("Núcleo familiar");
  });
});
