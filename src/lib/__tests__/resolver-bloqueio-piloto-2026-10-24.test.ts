import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * Proprietária, 24/10/2026: "nao depende de mim porque tudo que eu faço no meu
 * aplicativo nao e valido nao e salvo nada funciona".
 *
 * Ela estava certa e eu estava errado. Eu havia tratado os 19 bloqueios
 * críticos do caso dela como decisão dela. Medido antes de escrever:
 *
 *   escritor de piloto_bloqueios montado em alguma tela ...... 0
 *   `piloto.functions.ts#resolverBloqueioPiloto` ............. existia, correta,
 *                                                             e nunca montada
 *   `piloto-ana.functions.ts#definirIdCanonicoPiloto` ........ resolve 1 chave
 *                                                             só, também órfã
 *
 * Não existia botão: a decisão não dependia dela porque o produto não a deixava
 * executá-la. Mesmo padrão que o comentário de 05/09/2026 em
 * onboarding.functions.ts registra para `onboarding_checklist`.
 *
 * Primeira tentativa minha: escrevi um segundo `resolverBloqueioPiloto` em
 * onboarding.functions.ts. O teste do catálogo de órfãos deste repositório
 * recusou — caminho paralelo, contra o AGENTS.md. A duplicata foi descartada e
 * esta rodada monta a função que já existia.
 *
 * A autorização segue sendo do banco (`fn_piloto_bloqueio_guard`): papel
 * admin/operações, justificativa de no mínimo 10 caracteres, `resolvido_por` e
 * `resolvido_em` preenchidos por ele, auditoria por trigger, sem exclusão
 * física. Nada disso é recriado na aplicação.
 */

const piloto = readFileSync("src/lib/piloto.functions.ts", "utf8");
const tela = readFileSync("src/routes/_authenticated/onboarding.$id.tsx", "utf8");
const orfaos = readFileSync("src/lib/orfaos-classificados.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20260816232935_a72396bb-9c38-4f6d-9885-b163c680b7d8.sql",
  "utf8",
);

const bloco = piloto.slice(
  piloto.indexOf("export const resolverBloqueioPiloto"),
  piloto.indexOf("export const criarPesquisaPiloto"),
);

/**
 * O bloco CITA o texto removido num comentário, para registrar o defeito.
 * Medir a burla é medir o código, não a explicação dela.
 */
const soCodigo = bloco
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n")
  .filter((l) => !l.trim().startsWith("//"))
  .join("\n");

describe("não existe segundo escritor: a função montada é a que já existia", () => {
  it("o escritor vive em piloto.functions.ts, e a tela importa de lá", () => {
    expect(bloco).toContain("createServerFn");
    expect(tela).toContain('import { resolverBloqueioPiloto } from "@/lib/piloto.functions"');
  });

  it("onboarding.functions.ts não ganhou uma cópia", () => {
    const onboarding = readFileSync("src/lib/onboarding.functions.ts", "utf8");
    expect(onboarding).not.toContain("resolverBloqueioPiloto");
  });

  it("segue gravando pela camada central que confere, relê e compara", () => {
    expect(bloco).toContain("gravarComVerificacao(");
    expect(bloco).toContain('tabela: "piloto_bloqueios"');
  });

  it("usa só o vocabulário do CHECK da coluna", () => {
    expect(bloco).toContain('status: "resolvido" | "nao_aplicavel"');
    expect(migration).toContain("check (status in ('aberto','resolvido','nao_aplicavel'))");
  });
});

describe("a justificativa automática, que burlava o guard, saiu", () => {
  it("o texto de preenchimento automático não existe mais", () => {
    expect(soCodigo).not.toContain('"Sem justificativa informada."');
  });

  it("menos de 10 caracteres é recusado na aplicação, com motivo legível", () => {
    expect(bloco).toContain("justificativa.length < 10");
    expect(bloco).toContain("ao menos 10 caracteres");
  });

  it("o guard do banco continua sendo a autoridade, não a aplicação", () => {
    expect(migration).toContain("Registre a justificativa da resolução (mínimo 10 caracteres)");
    expect(migration).toContain(
      "Somente admin ou operações podem resolver bloqueios críticos do piloto.",
    );
    expect(bloco).not.toContain("resolvido_por");
    expect(bloco).not.toContain("resolvido_em");
  });
});

describe("o botão existe, dentro do portão que o PR #188 passou a mostrar", () => {
  it("cada bloqueio ganha as duas ações do vocabulário real", () => {
    expect(tela).toContain('(["resolvido", "nao_aplicavel"] as const).map(');
    expect(tela).toContain('rotulo={st === "resolvido" ? "Resolver" : "Marcar não aplicável"}');
    expect(tela).toContain("id: b.id");
  });

  it("a justificativa vem do motivo que a ação operacional já exige", () => {
    expect(tela).toContain('justificativa: String(motivo ?? "")');
  });

  it("erro do servidor não é silencioso nesta mutation", () => {
    const m = tela.slice(tela.indexOf("const mBloqueio"), tela.indexOf("const mAtualizarOnboarding"));
    expect(m).toContain("onError:");
  });
});

describe("o catálogo de órfãos conta a verdade", () => {
  it("resolverBloqueioPiloto saiu da lista, com o motivo registrado", () => {
    expect(orfaos).toContain("saiu desta lista em 24/10/2026");
    expect(orfaos).toContain("NÃO havia tela alguma para resolvê-los");
  });

  it("as outras cinco do piloto seguem aguardando a decisão da Proprietária", () => {
    for (const f of ["painelPiloto", "salvarDadoPiloto", "verificarDadoPiloto", "criarPesquisaPiloto", "liberarPortalPiloto"]) {
      expect(orfaos, f).toContain(`"${f}"`);
    }
  });
});
