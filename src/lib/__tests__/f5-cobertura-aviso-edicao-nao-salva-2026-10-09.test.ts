import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * "Revise o feat de pessoa — continuidade F5, sair da linha, de todas as abas
 * e telas do Clube Ancestral, sem exceção e sem desculpas."
 *
 * O padrão nasceu em `casos.$caseId.index.tsx` (Corte 1, 27/09/2026) e ficou
 * uma tela só até 09/10/2026 — primeira fase sem continuidade. Este teste
 * existe para que isso não volte a acontecer em silêncio: ele varre o `src`,
 * acha toda tela/painel que coleta rascunho e grava, e exige que cada uma
 * use `useAvisoEdicaoNaoSalva` ou esteja nesta lista de exceções, com motivo
 * escrito. Arquivo novo que coleta rascunho e não faz nenhuma das duas coisas
 * quebra a suíte.
 */

/** Rascunho local: nome de estado que guarda o que a pessoa digitou. */
const NOMES_DE_RASCUNHO =
  /const \[(form|rascunho\w*|novo\w*|edicao|editando\w*|valores|nota|assinatura|motivo\w*|aval|back|draft|justificativa)\b/i;

/**
 * Exceções com motivo. Não é licença para crescer: cada entrada diz por que
 * travar a saída ali seria errado (ou por que ainda não é possível).
 */
const EXCECOES: Record<string, string> = {
  "src/routes/equipe.entrar.tsx":
    "Tela de login da equipe. Travar a saída de um formulário de entrada não protege trabalho nenhum.",
  "src/routes/acesso.confirmar.tsx":
    "Confirmação de acesso do cliente (magic link). Mesmo motivo do login: não há trabalho da equipe a perder.",
  "src/routes/_authenticated/contratos.index.tsx":
    "`novo` é um booleano que abre/fecha o modal — não guarda texto digitado. O rascunho real vive no componente de dentro.",
};

function arquivosTsx(raiz: string): string[] {
  const achados: string[] = [];
  const andar = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      const caminho = join(dir, nome);
      if (statSync(caminho).isDirectory()) andar(caminho);
      else if (nome.endsWith(".tsx")) achados.push(caminho);
    }
  };
  andar(raiz);
  return achados.sort();
}

function coletaRascunhoEGrava(conteudo: string): boolean {
  if (!NOMES_DE_RASCUNHO.test(conteudo)) return false;
  return conteudo.includes("useMutation") || conteudo.includes("useServerFn");
}

describe("F5 / sair da linha — cobertura do aviso de edição não salva", () => {
  const telas = [...arquivosTsx("src/routes"), ...arquivosTsx("src/components")];

  it("toda tela ou painel que coleta rascunho e grava tem o guard — ou uma exceção com motivo", () => {
    const semGuard: string[] = [];
    for (const caminho of telas) {
      const conteudo = readFileSync(caminho, "utf8");
      if (!coletaRascunhoEGrava(conteudo)) continue;
      if (conteudo.includes("useAvisoEdicaoNaoSalva")) continue;
      if (EXCECOES[caminho]) continue;
      semGuard.push(caminho);
    }
    expect(semGuard, `sem guard e sem exceção declarada:\n${semGuard.join("\n")}`).toEqual([]);
  });

  it("nenhuma exceção é genérica: cada uma diz o motivo, em uma frase de verdade", () => {
    for (const [caminho, motivo] of Object.entries(EXCECOES)) {
      expect(motivo.length, caminho).toBeGreaterThan(40);
    }
  });

  it("exceção não aponta para arquivo que já ganhou o guard (lista não envelhece calada)", () => {
    for (const caminho of Object.keys(EXCECOES)) {
      const conteudo = readFileSync(caminho, "utf8");
      expect(conteudo.includes("useAvisoEdicaoNaoSalva"), caminho).toBe(false);
    }
  });

  it("a cobertura medida não regride: 60 arquivos e 81 pontos de guard em 09/10/2026", () => {
    const comGuard = telas.filter((c) => readFileSync(c, "utf8").includes("useAvisoEdicaoNaoSalva"));
    expect(comGuard.length).toBeGreaterThanOrEqual(60);
    const pontos = telas.reduce(
      (soma, c) => soma + (readFileSync(c, "utf8").match(/useAvisoEdicaoNaoSalva(ComConfirmacao)?\(/g)?.length ?? 0),
      0,
    );
    expect(pontos).toBeGreaterThanOrEqual(81);
  });

  it("todas as telas usam o mesmo mecanismo — nenhum beforeunload solto fora do módulo", () => {
    const soltos = telas.filter((c) => readFileSync(c, "utf8").includes('"beforeunload"'));
    expect(soltos, `beforeunload fora de aviso-edicao-nao-salva.ts:\n${soltos.join("\n")}`).toEqual([]);
  });
});
