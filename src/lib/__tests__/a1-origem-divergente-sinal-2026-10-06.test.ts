import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * A1 — recusa "origem não aceita" ao salvar no planejador o nome da
 * proposta (06/10/2026).
 *
 * Reproduzido: salvar `contratante_nome`/`produto_sku` com origem "proposta"
 * (a origem da proposta aprovada abb12c85 v1 da Ana) morria em
 * `validarValorCampo` (parametros-dicionario.ts), camada SERVIDOR —
 * "Origem não permitida para este campo" — mesmo o trigger do banco
 * (`fn_cpv_guard`) já aceitando a mesma divergência com justificativa
 * registrada. Tela e servidor nunca recusavam por si; banco e servidor
 * discordavam sobre a mesma gravação.
 *
 * Corrigido nas 3 camadas:
 * - servidor: `contratante_nome`/`produto_sku` ganham "proposta" nas origens
 *   homologadas; origem fora da lista, mas rastreável, passa a validar COM
 *   SINAL quando há justificativa (de-para ORIGENS_SEM_FORCA_CONTRATUAL, que
 *   nunca passa — mesma régua do trigger);
 * - escritor: `salvarParametro` grava o sinal em `conflito`, nunca descarta;
 * - banco: inalterado — já aceitava a divergência com justificativa.
 */
const DICIONARIO = readFileSync("src/lib/parametros-dicionario.ts", "utf8");
const ESCRITOR = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

describe("A1 — origem divergente vira sinal declarado, não recusa seca", () => {
  it("contratante_nome e produto_sku aceitam origem proposta", () => {
    const contratanteNome = DICIONARIO.slice(
      DICIONARIO.indexOf('campo: "contratante_nome"'),
      DICIONARIO.indexOf('campo: "contratante_documento"'),
    );
    expect(contratanteNome).toContain('"proposta"');

    const produtoSku = DICIONARIO.slice(
      DICIONARIO.indexOf('campo: "produto_sku"'),
      DICIONARIO.indexOf('campo: "pais_rota"'),
    );
    expect(produtoSku).toContain('origens: ["planejador", "proposta"]');
  });

  it("origem fora da lista, com justificativa, entra como sinal — não é mais recusa seca", () => {
    expect(DICIONARIO).toContain("ORIGENS_SEM_FORCA_CONTRATUAL");
    expect(DICIONARIO).toContain("Origem divergente declarada");
    expect(DICIONARIO).not.toMatch(
      /if \(valor && def\.origens\?\.length && !def\.origens\.includes\(input\.origem\)\) \{\s*return \{ ok: false/,
    );
  });

  it("whatsapp e transcrição seguem sem força contratual, com ou sem justificativa", () => {
    expect(DICIONARIO).toMatch(/ORIGENS_SEM_FORCA_CONTRATUAL\s*=\s*\["whatsapp",\s*"transcricao"\]/);
  });

  it("nomeQuePrevalece existe e documenta a premissa literal da Proprietária", () => {
    expect(DICIONARIO).toContain("export function nomeQuePrevalece");
    expect(DICIONARIO).toContain("o nome da proposta prevalece");
  });

  it("o escritor grava o sinal em conflito, nunca descarta a divergência", () => {
    expect(ESCRITOR).toContain("const sinalOrigem = check.sinal ?? null");
    expect(ESCRITOR).toContain("conflito: sinalOrigem ? [sinalOrigem] : []");
  });
});
