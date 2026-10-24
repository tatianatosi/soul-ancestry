import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/**
 * EXEC-06 do plano executável de 24/10/2026: "Primeiro corte: onboarding,
 * contrato/contatos, publicação editorial, documentos e próxima ação do
 * caso. A análise AST encontrou 19 chamadas com objeto de useMutation sem
 * onError direto; antes de corrigir, ler o tratamento compartilhado/caller.
 * Não declarar 19 bugs só por essa contagem."
 *
 * Lido antes de mexer: mAtualizar, mAtualizarOnboarding e mSuspender, no
 * MESMO arquivo onboarding.$id.tsx já corrigido duas vezes hoje (mAtivar e
 * mBloqueio), tinham o padrão idêntico ao bug raiz do dia: onSuccess trata
 * r.ok/r.erro, mas uma exceção lançada (rede, guard do banco, RLS) não tinha
 * onError para cair — a tela ficava muda. Não é suposição por contagem: é o
 * mesmo arquivo, o mesmo padrão, a mesma causa já comprovada.
 *
 * Os outros 16 apontados pela contagem estão em arquivos fora do escopo
 * tocado hoje e não foram alterados nesta rodada — exigem leitura individual
 * do caller/tratamento compartilhado, como o plano pede.
 */
const tela = readFileSync("src/routes/_authenticated/onboarding.$id.tsx", "utf8");

describe("as 5 mutations de onboarding.$id.tsx têm onError", () => {
  for (const nome of ["mAtualizar", "mAtivar", "mBloqueio", "mAtualizarOnboarding", "mSuspender"]) {
    it(`${nome} trata exceção lançada, não só retorno negativo`, () => {
      const inicio = tela.indexOf(`const ${nome} = useMutation({`);
      expect(inicio, `${nome} não encontrada`).toBeGreaterThan(-1);
      // bloco até o próximo "const m" ou limite razoável
      const proximo = tela.indexOf("\n  const m", inicio + 10);
      const bloco = tela.slice(inicio, proximo > 0 ? proximo : inicio + 1200);
      expect(bloco).toContain("onError");
    });
  }
});
