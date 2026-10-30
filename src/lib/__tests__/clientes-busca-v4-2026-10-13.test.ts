import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { filtrarPorBusca, type PessoaLista } from "@/lib/clientes-lista";

const pessoa = (over: Partial<PessoaLista>): PessoaLista =>
  ({
    id: "1",
    nome: "Ana Luiza Silveira",
    nome_social: null,
    email: "ana@exemplo.com",
    telefone: null,
    origem: null,
    status_comercial: null,
    pais_interesse: null,
    status: "ativo",
    classificacao: "cliente_ativo",
    is_demo: false,
    archived_at: null,
    archive_motivo: null,
    ativacao_decidida_em: null,
    ativacao_justificativa: null,
    contratoAssinado: true,
    pagamentoConfirmado: true,
    participacoes: [],
    ...over,
  }) as PessoaLista;

const base = [
  pessoa({ id: "a", nome: "Ana Luiza Silveira", email: "ana@exemplo.com" }),
  pessoa({ id: "b", nome: "João Almeida", nome_social: "Joana", email: "joao@exemplo.com" }),
];

describe("filtrarPorBusca", () => {
  it("termo vazio ou só espaços devolve a lista inteira sem recriar a referência", () => {
    expect(filtrarPorBusca(base, "")).toBe(base);
    expect(filtrarPorBusca(base, "   ")).toBe(base);
  });

  it("busca por nome civil, sem diferença de caixa e acento", () => {
    expect(filtrarPorBusca(base, "ana luiza").map((p) => p.id)).toEqual(["a"]);
    expect(filtrarPorBusca(base, "JOÃO").map((p) => p.id)).toEqual(["b"]);
  });

  it("busca também pelo nome social e pelo e-mail", () => {
    expect(filtrarPorBusca(base, "joana").map((p) => p.id)).toEqual(["b"]);
    expect(filtrarPorBusca(base, "@exemplo.com").map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("sem correspondência devolve lista vazia, nunca um registro inventado", () => {
    expect(filtrarPorBusca(base, "zzz")).toEqual([]);
  });
});

describe("Lista /clientes preserva moldura, ações e vazio honesto", () => {
  const arquivo = readFileSync("src/routes/_authenticated/clientes.tsx", "utf8");

  it("mantém a moldura da lista mesmo quando a busca não encontra ninguém", () => {
    expect(arquivo).toContain("Perfis de cliente (${listaVisivel.length})");
    expect(arquivo).toContain("Nenhuma pessoa encontrada para");
  });

  it("nome civil é o texto principal e o link leva à ficha /pessoas/$clienteId", () => {
    expect(arquivo).toContain("{p.nome}\n");
    expect(arquivo).toContain('to="/pessoas/$clienteId"');
    expect(arquivo).toContain("Ver pessoa 360");
  });

  it("ações de ativação e arquivamento continuam presentes", () => {
    expect(arquivo).toContain("Registrar decisão humana de ativação");
    expect(arquivo).toContain("Arquivar");
  });

  it("papel ausente aparece como 'Não registrado', sem valor inventado", () => {
    expect(arquivo).toContain('"Não registrado"');
    expect(arquivo).toContain("Papel no núcleo");
  });
});
