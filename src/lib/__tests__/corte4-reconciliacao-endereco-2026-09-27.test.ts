import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  CAMPOS_CONTATO_PARTE_RECONCILIAVEIS,
  ROTULO_CAMPO_CONTATO_PARTE,
  montarEnderecoCanonico,
} from "@/lib/contratos.functions";

/**
 * Corte 4 (27/09/2026): estende a reconciliação sem-dedup de contract_parties
 * (Fase 0) para endereço — composto a partir do endereço estruturado de
 * clientes, comparado contra o texto livre do contrato. Só preenche vazio,
 * nunca sobrescreve, nunca grava de volta nos campos estruturados.
 */

describe("Corte 4 — montarEnderecoCanonico", () => {
  it("sem logradouro/cidade/UF suficientes, devolve null (nunca inventa parte faltante)", () => {
    expect(montarEnderecoCanonico(null)).toBeNull();
    expect(montarEnderecoCanonico({ endereco_logradouro: "Rua A" })).toBeNull();
    expect(montarEnderecoCanonico({ endereco_cidade: "São Paulo", endereco_uf: "SP" })).toBeNull();
  });

  it("com os 3 campos mínimos, compõe uma string única", () => {
    const s = montarEnderecoCanonico({
      endereco_logradouro: "Rua das Flores",
      endereco_numero: "123",
      endereco_bairro: "Centro",
      endereco_cidade: "São Paulo",
      endereco_uf: "SP",
      endereco_cep: "01000-000",
    });
    expect(s).toContain("Rua das Flores, 123");
    expect(s).toContain("Centro");
    expect(s).toContain("São Paulo/SP");
    expect(s).toContain("CEP 01000-000");
  });

  it("complemento entra separado quando presente", () => {
    const s = montarEnderecoCanonico({
      endereco_logradouro: "Rua das Flores",
      endereco_numero: "123",
      endereco_complemento: "Apto 45",
      endereco_cidade: "São Paulo",
      endereco_uf: "SP",
    });
    expect(s).toContain("- Apto 45");
  });
});

describe("Corte 4 — vocabulário controlado inclui endereço", () => {
  it("CAMPOS_CONTATO_PARTE_RECONCILIAVEIS e ROTULO_CAMPO_CONTATO_PARTE cobrem endereco", () => {
    expect(CAMPOS_CONTATO_PARTE_RECONCILIAVEIS).toContain("endereco");
    expect(ROTULO_CAMPO_CONTATO_PARTE.endereco).toBe("Endereço");
  });
});

describe("Corte 4 — sincronizarContatoPartesDoCaso resolve endereço via composição, não coluna única", () => {
  const arquivo = readFileSync("src/lib/contratos.functions.ts", "utf8");

  it("usa montarEnderecoCanonico quando campo === 'endereco', nunca lê uma coluna única de clientes para isso", () => {
    const inicio = arquivo.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = arquivo.slice(inicio, arquivo.indexOf("export const arquivarItemContrato"));
    expect(trecho).toContain('campo === "endereco" ? montarEnderecoCanonico(cliente)');
  });

  it("seleciona as 7 colunas estruturadas de endereço de clientes quando o campo é endereco", () => {
    const inicio = arquivo.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = arquivo.slice(inicio, arquivo.indexOf("export const arquivarItemContrato"));
    expect(trecho).toContain("COLUNAS_CLIENTE_ENDERECO");
  });

  it("nunca grava de volta nos campos estruturados de clientes — só escreve em contract_parties.address", () => {
    const inicio = arquivo.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = arquivo.slice(inicio, arquivo.indexOf("export const arquivarItemContrato"));
    expect(trecho).not.toContain('.from("clientes").update');
    expect(trecho).toContain('.from("contract_parties")\n        .update({ [colunaParte]: (item as { valor: string }).valor })');
  });
});

describe("Corte 4 — componente mostra os 4 blocos (nome/e-mail/telefone/endereço)", () => {
  const componente = readFileSync("src/components/contrato/reconciliar-contato-partes.tsx", "utf8");

  it("título e copy já mencionam endereço, não mais 'endereço não entra aqui'", () => {
    expect(componente).toContain("endereço das partes com o cadastro canônico");
    expect(componente).not.toContain("Endereço não entra aqui");
  });

  it("continua mapeando CAMPOS_CONTATO_PARTE_RECONCILIAVEIS (agora 4 itens) sem lista hardcoded paralela", () => {
    expect(componente).toContain("CAMPOS_CONTATO_PARTE_RECONCILIAVEIS.map((campo) =>");
  });
});
