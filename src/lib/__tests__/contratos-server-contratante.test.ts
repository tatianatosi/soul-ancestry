import { describe, expect, it } from "vitest";

import { contratanteCanonica, enderecoDoCliente } from "@/lib/contratos.server";

describe("contratanteCanonica — CRM é a fonte canônica da contratante (decisão 02/09/2026)", () => {
  it("usa nome/documento/endereço do cliente (CRM) quando o cadastro está completo", () => {
    const cliente = {
      nome: "Ana Luiza",
      cpf: "111.111.111-11",
      endereco_logradouro: "Rua das Flores",
      endereco_numero: "100",
      endereco_complemento: null,
      endereco_bairro: "Centro",
      endereco_cidade: "Curitiba",
      endereco_uf: "PR",
      endereco_cep: "80000-000",
      endereco_pais: "Brasil",
    };
    const r = contratanteCanonica(cliente, { nome: "Nome digitado errado", documento: "999", endereco: "Outro endereço" });
    expect(r.nome).toBe("Ana Luiza");
    expect(r.documento).toBe("111.111.111-11");
    expect(r.endereco).toBe("Rua das Flores, 100, Centro, CEP 80000-000, Curitiba – PR, Brasil");
  });

  it("cai para a matriz de Parâmetros quando o CRM não tem o campo preenchido", () => {
    const cliente = { nome: "", cpf: null, endereco_logradouro: null };
    const r = contratanteCanonica(cliente, {
      nome: "Preenchido na matriz",
      documento: "222.222.222-22",
      endereco: "Endereço digitado",
    });
    expect(r.nome).toBe("Preenchido na matriz");
    expect(r.documento).toBe("222.222.222-22");
    expect(r.endereco).toBe("Endereço digitado");
  });

  it("sem cliente e sem matriz preenchida, retorna null em todos os campos", () => {
    const r = contratanteCanonica(null, {});
    expect(r).toEqual({ nome: null, documento: null, endereco: null });
  });
});

describe("enderecoDoCliente", () => {
  it("retorna null quando o cliente é nulo", () => {
    expect(enderecoDoCliente(null)).toBeNull();
  });

  it("omite partes ausentes sem deixar separadores soltos", () => {
    const endereco = enderecoDoCliente({
      endereco_logradouro: "Av. Central",
      endereco_numero: "50",
      endereco_cidade: "São Paulo",
      endereco_uf: "SP",
    });
    expect(endereco).toBe("Av. Central, 50, São Paulo – SP");
  });
});
