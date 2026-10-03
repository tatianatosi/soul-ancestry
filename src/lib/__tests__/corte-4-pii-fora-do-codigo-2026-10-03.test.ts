import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { CADASTRO_PLANEJADOR } from "@/lib/planejador-parametros";

/**
 * Corte 4 (03/10/2026) — autorizado pela Proprietária: a PII da Ana sai do
 * código e a Pessoa 360 (`clientes`) passa a ser a fonte.
 *
 * O que estava no repositório, em texto, desde 27/09: CPF e RG de duas
 * pessoas reais, endereço completo com CEP, três e-mails e três telefones,
 * dentro de `CADASTRO_PLANEJADOR` — e, por descuido, o e-mail de uma delas
 * também num comentário de `pessoa-identidade.ts`.
 *
 * Gravado primeiro no banco (preenche só campo vazio, nunca sobrescreve
 * divergente, com `audit_logs.acao = pii_migrada_do_planejador_para_pessoa_360`),
 * e só então removido do código — assim nada se perde.
 */

/** Varredura real de arquivos, não só dos que eu lembrei de citar. */
function arquivosDeCodigo(dir: string, saida: string[] = []): string[] {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) {
      if (nome === "__tests__" || nome === "node_modules") continue;
      arquivosDeCodigo(caminho, saida);
    } else if (/\.(ts|tsx)$/.test(nome)) {
      saida.push(caminho);
    }
  }
  return saida;
}

describe("PII real não vive mais no código", () => {
  const arquivos = arquivosDeCodigo("src");

  /*
    Os valores aqui são padrões de busca, não dado novo: cada um já estava no
    repositório e o teste existe para que não volte. CPF e RG ficam por
    fragmento, para o teste não reintroduzir o número inteiro.
  */
  const padroes: [string, RegExp][] = [
    ["CPF da contratante", /037\.?795\.?711/],
    ["CPF do beneficiário", /774\.?227\.?321/],
    ["RG da contratante", /\b5163875\b/],
    ["RG do beneficiário", /\b3184582\b/],
    ["CEP residencial", /75094-?290/],
    ["e-mails pessoais", /analuizabox|apsrepresentacoes|alicegomessilveira/],
    ["telefones pessoais", /9?8158-?4015|99134-?5298|99951-?5298/],
  ];

  for (const [rotulo, padrao] of padroes) {
    it(`nenhum arquivo de código contém ${rotulo}`, () => {
      const culpados = arquivos.filter((f) => padrao.test(readFileSync(f, "utf8")));
      expect(culpados, `PII encontrada em: ${culpados.join(", ")}`).toEqual([]);
    });
  }

  it("o cadastro do Planejador guarda nome, papel e decisão — não documento, endereço nem contato", () => {
    const caso = CADASTRO_PLANEJADOR.find((c) => c.codigos.includes("CA-CID-AT-FAM-2026-001"));
    expect(caso).toBeTruthy();
    const pessoas = [caso!.contratante, ...caso!.beneficiarios];
    for (const p of pessoas) {
      expect(p.nome.trim().length, "o nome permanece: ele é a identificação do papel").toBeGreaterThan(0);
      expect(p.papel.trim().length).toBeGreaterThan(0);
      expect(p.documentos ?? "", `documento de ${p.nome} deve vir da Pessoa 360`).toBe("");
      expect(p.endereco ?? "", `endereço de ${p.nome} deve vir da Pessoa 360`).toBe("");
      expect(p.contato ?? "", `contato de ${p.nome} deve vir da Pessoa 360`).toBe("");
      expect(p.nascimento ?? "", `nascimento de ${p.nome} deve vir da Pessoa 360`).toBe("");
    }
  });

  it("a migração, a divergência e as lacunas ficam declaradas no próprio cadastro", () => {
    const caso = CADASTRO_PLANEJADOR.find((c) => c.codigos.includes("CA-CID-AT-FAM-2026-001"))!;
    const texto = caso.observacoes.join(" ");
    expect(texto).toContain("pii_migrada_do_planejador_para_pessoa_360");
    // Divergência não resolvida por agente: fica como sinal, com a escolha humana.
    expect(texto).toContain("Divergência declarada");
    expect(texto).toContain("nunca sobrescrever divergente");
    // Lacunas ditas, nunca preenchidas por invenção.
    expect(texto).toContain("pendência de coleta, nada inventado");
    expect(texto).toContain("em vez de ser inventado");
    // E a própria observação não reintroduz o número.
    expect(texto).not.toMatch(/9?8158-?4015/);
  });
});
