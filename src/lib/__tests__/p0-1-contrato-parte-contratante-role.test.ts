import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P0.1 (2026-09-17) — enviarParaAssinatura gravava role: "contratante" na
// criação automática da parte contratante em contract_parties — valor fora
// da constraint CHECK da coluna (só aceita 'contracting_client' entre os
// valores válidos, ver supabase/migrations/20260816155807_...sql:206). O
// insert nunca checava o erro, então uma rejeição por constraint falhava
// silenciosamente: o contrato era criado, a parte contratante nunca existia.
// Este teste prova, por leitura do código real (mesmo padrão já usado em
// pessoa-unica-vinculos.test.ts e pessoa-unica-pesquisa-vinculo.test.ts
// nesta base), que a correção mínima foi aplicada e não reintroduzida.

const funcoes = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

const trechoEnviarParaAssinatura = funcoes.slice(
  funcoes.indexOf("export const enviarParaAssinatura"),
  funcoes.indexOf("export const enviarParaAssinatura") +
    funcoes.slice(funcoes.indexOf("export const enviarParaAssinatura")).indexOf("\n  });") +
    "\n  });".length,
);

describe("P0.1 — parte contratante com role válida e falha explícita", () => {
  it("não grava mais role: \"contratante\" (valor fora da CHECK constraint)", () => {
    expect(trechoEnviarParaAssinatura).not.toContain('role: "contratante"');
  });

  it("usa role: \"contracting_client\" (valor aceito pela constraint)", () => {
    expect(trechoEnviarParaAssinatura).toContain('role: "contracting_client"');
  });

  it("captura o retorno do insert de contract_parties", () => {
    expect(trechoEnviarParaAssinatura).toMatch(
      /const \{\s*error: \w+\s*\} = await supabase\.from\("contract_parties"\)\.insert\(/,
    );
  });

  it("lança erro com contexto da parte contratante quando o insert falha, preservando a causa original", () => {
    const match = trechoEnviarParaAssinatura.match(
      /const \{\s*error: (\w+)\s*\} = await supabase\.from\("contract_parties"\)\.insert\(/,
    );
    expect(match).not.toBeNull();
    const nomeErro = match![1];
    expect(trechoEnviarParaAssinatura).toContain(`if (${nomeErro}) {`);
    // contexto de registro da parte contratante + causa original preservada
    // (a mensagem original do erro do Supabase entra na nova Error, não é
    // descartada nem substituída por um texto genérico).
    expect(trechoEnviarParaAssinatura).toMatch(new RegExp(`parte contratante[\\s\\S]{0,80}\\$\\{${nomeErro}\\.message\\}`));
  });
});

/**
 * Nota de limitação (declarada, não corrigida aqui): um teste dinâmico com
 * mock do client Supabase (simular o insert rejeitando por CHECK e provar
 * que a exceção se propaga até o chamador) foi avaliado e não incluído
 * nesta rodada — não há, em nenhum teste desta base (`src/lib/__tests__/`),
 * precedente de invocar diretamente o `.handler` de uma `createServerFn`
 * com um client Supabase falso; construir esse arnês agora ampliaria o
 * escopo deste corte (que é só a troca de role + checagem de erro), além
 * de exigir simular toda a cadeia de leituras anteriores ao insert dentro
 * de `enviarParaAssinatura` (parâmetros aprovados, caso, contrato). A prova
 * de leitura de código acima já confirma, sem ambiguidade, que a role
 * inválida foi removida e que o erro do insert agora é capturado e lançado.
 */
