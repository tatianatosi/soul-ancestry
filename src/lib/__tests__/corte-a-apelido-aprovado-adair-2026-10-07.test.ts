import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  APELIDOS_APROVADOS,
  apelidoAprovadoDe,
  nomeCanonicoAprovado,
  nomeDaMesmaPessoa,
} from "@/lib/apelidos-aprovados";
import { montarPessoasContratuais } from "@/lib/contrato-blocos-incorporados";

/**
 * Corte A / D2 (07/10/2026) — "Nome correto do pai: Adair Pinto Silveira
 * Júnior. AUTORIZADO em 07/10, base CNH já citada em auditoria." e
 * "Registrar o nome do deck como apelido aprovado da mesma pessoa, com data,
 * decisão e base (CNH), de modo que o comparador deixe de tratar a diferença
 * como divergência."
 *
 * Critério de aceite da própria instrução: o nome do deck não aparece em
 * nenhuma saída ao cliente nem como divergência pendente.
 */

describe("registro do apelido aprovado", () => {
  const adair = APELIDOS_APROVADOS.find((a) => a.canonico === "Adair Pinto Silveira Júnior")!;

  it("existe com canônico, apelido, base, decisão, autor e data", () => {
    expect(adair).toBeDefined();
    expect(adair.apelido).toBe("Adair Gomes Silveira");
    expect(adair.base).toMatch(/CNH/i);
    expect(adair.decisao).toMatch(/D2/);
    expect(adair.decididoPor).toBe("tati@pluggedresearch.com");
    expect(adair.decididoEm).toBe("2026-10-07");
  });

  it("não guarda dado civil no código — CPF e RG ficam na Pessoa 360", () => {
    const codigo = readFileSync("src/lib/apelidos-aprovados.ts", "utf8");
    expect(codigo).not.toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    expect(codigo).not.toMatch(/\b\d{7,8}\s*SSP\b/);
  });

  it("resolve nos dois sentidos e devolve sempre o nome do cadastro", () => {
    expect(apelidoAprovadoDe("Adair Gomes Silveira")?.canonico).toBe("Adair Pinto Silveira Júnior");
    expect(apelidoAprovadoDe("Adair Pinto Silveira Júnior")?.apelido).toBe("Adair Gomes Silveira");
    expect(nomeCanonicoAprovado("Adair Gomes Silveira")).toBe("Adair Pinto Silveira Júnior");
    expect(nomeCanonicoAprovado("  adair gomes silveira ")).toBe("Adair Pinto Silveira Júnior");
  });

  it("nome sem registro continua ele mesmo", () => {
    expect(nomeCanonicoAprovado("Alice Gomes Silveira")).toBe("Alice Gomes Silveira");
    expect(apelidoAprovadoDe("Alice Gomes Silveira")).toBeNull();
    expect(apelidoAprovadoDe("")).toBeNull();
  });
});

describe("nomeDaMesmaPessoa — registro explícito, nunca semelhança", () => {
  it("aceita o par registrado, em qualquer ordem e sem diferenciar caixa", () => {
    expect(nomeDaMesmaPessoa("Adair Gomes Silveira", "Adair Pinto Silveira Júnior")).toBe(true);
    expect(nomeDaMesmaPessoa("Adair Pinto Silveira Júnior", "adair gomes silveira")).toBe(true);
  });

  it("recusa nome só parecido — fundir por semelhança continua proibido", () => {
    expect(nomeDaMesmaPessoa("Adair Pinto Silveira", "Adair Pinto Silveira Júnior")).toBe(false);
    expect(nomeDaMesmaPessoa("Adair Gomes Silveira", "Alice Gomes Silveira")).toBe(false);
    expect(nomeDaMesmaPessoa("Ana Luiza Gomes Silveira Rodrigues", "Ana Luiza Gomes Silveira")).toBe(false);
  });

  it("nome vazio nunca casa com ninguém", () => {
    expect(nomeDaMesmaPessoa("", "Adair Pinto Silveira Júnior")).toBe(false);
    expect(nomeDaMesmaPessoa("  ", "")).toBe(false);
  });
});

describe("saída contratual com o nome do deck na condição", () => {
  const PARTES = [
    { nome: "Ana Luiza Gomes Silveira Rodrigues", papel: "contracting_client", assinaturaExigida: true },
    { nome: "Adair Pinto Silveira Júnior", papel: "co_contractor", assinaturaExigida: true },
  ];

  const pessoas = montarPessoasContratuais({
    partesRegistradas: PARTES,
    membros: [],
    dependentes: [],
    // O deck (páginas 2 e 6) escreveu o nome antigo nos dois lugares.
    itensCondicao: [
      { parte: "Adair Gomes Silveira", valor: 2400, escopo: "Elo documental direto e declaração própria" },
    ],
    responsaveisFinanceiros: ["Adair Gomes Silveira"],
  });

  it("não cria pessoa nova pelo nome do deck", () => {
    expect(pessoas).toHaveLength(2);
    expect(pessoas.find((p) => p.nome === "Adair Gomes Silveira")).toBeUndefined();
  });

  it("o escopo e o valor do deck chegam à pessoa do cadastro", () => {
    const adair = pessoas.find((p) => p.nome === "Adair Pinto Silveira Júnior")!;
    expect(adair.valorIndividual).toBe(2400);
    expect(adair.escopoIndividual).toContain("Elo documental direto");
    expect(adair.papeis).toContain("responsavel_financeiro");
  });

  it("o nome do deck não aparece em nenhuma saída — nem como pendência", () => {
    const tudo = JSON.stringify(pessoas);
    expect(tudo).not.toContain("Adair Gomes Silveira");
  });
});
