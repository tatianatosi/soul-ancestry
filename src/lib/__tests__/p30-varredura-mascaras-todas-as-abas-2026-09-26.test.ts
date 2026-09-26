import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// P30 (26/09/2026) — pedido direto e reiterado da Proprietária: máscaras devem se repetir em
// CADA aba onde CPF/telefone/CEP aparecem, não só num arquivo. Varredura real (grep por
// interpolação direta de campo sem formatarCpf/formatarTelefone/formatarCep) encontrou 7
// ocorrências em 6 arquivos além de Pessoa 360 (já corrigida em P29) — todas corrigidas aqui.

const arquivos = {
  clientes: readFileSync("src/routes/_authenticated/clientes.tsx", "utf8"),
  golivePessoa: readFileSync("src/routes/_authenticated/golive.pessoa.tsx", "utf8"),
  goliveApp: readFileSync("src/routes/_authenticated/golive.app.tsx", "utf8"),
  fluxoCanonico: readFileSync("src/components/crm/fluxo-canonico.tsx", "utf8"),
  pessoa360: readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8"),
  reconciliarCpfPartes: readFileSync("src/components/contrato/reconciliar-cpf-partes.tsx", "utf8"),
  reconciliarCpfMembros: readFileSync("src/components/caso/reconciliar-cpf-membros-caso.tsx", "utf8"),
  reconciliarTelefoneMembros: readFileSync("src/components/caso/reconciliar-telefone-membros-caso.tsx", "utf8"),
};

describe("P30 — /clientes: alerta de duplicidade mostra CPF/telefone formatados, não crus", () => {
  it("usa formatarCpf/formatarTelefone na lista de possíveis duplicidades", () => {
    expect(arquivos.clientes).toContain("formatarTelefone(d.telefone)");
    expect(arquivos.clientes).toContain("formatarCpf(d.cpf)");
  });
});

describe("P30 — golive.pessoa.tsx: telefone da identidade formatado", () => {
  it("usa formatarTelefone no card 'Pessoa individual — identidade e contato'", () => {
    expect(arquivos.golivePessoa).toContain("formatarTelefone(String(caso.identidade.telefone))");
  });
});

describe("P30 — golive.app.tsx: prévia 'Seus dados' do App Cliente mostra telefone formatado", () => {
  it("usa formatarTelefone no bloco 'Seus dados'", () => {
    expect(arquivos.goliveApp).toContain("formatarTelefone(String(caso.identidade.telefone))");
  });
});

describe("P30 — CRM Vivo (fluxo-canonico.tsx): telefone de Contatos agora tem máscara no digitar", () => {
  it("onChange de Telefone aplica formatarTelefone, não passa o valor cru", () => {
    const inicio = arquivos.fluxoCanonico.indexOf('label="Telefone"');
    const bloco = arquivos.fluxoCanonico.slice(inicio, inicio + 200);
    expect(bloco).toContain("formatarTelefone(v)");
  });
});

describe("P30 — Pessoa 360: endereço em modo leitura formata o CEP dentro da linha concatenada", () => {
  it("a linha de endereço usa formatarCep para o segmento de CEP", () => {
    const inicio = pessoa360Trecho();
    expect(inicio).toContain("formatarCep(String(cliente.endereco_cep))");
  });

  function pessoa360Trecho() {
    const i = arquivos.pessoa360.indexOf("endereco_logradouro, cliente.endereco_numero");
    return arquivos.pessoa360.slice(i, i + 700);
  }
});

describe("P30 — os 3 painéis de reconciliação (CPF partes, CPF membros, telefone membros) formatam os dois lados do conflito", () => {
  it("reconciliar-cpf-partes.tsx formata 'atual' e 'canonico' com formatarCpf", () => {
    expect(arquivos.reconciliarCpfPartes).toContain("formatarCpf(p.atual)");
    expect(arquivos.reconciliarCpfPartes).toContain("formatarCpf(p.canonico)");
  });

  it("reconciliar-cpf-membros-caso.tsx formata 'atual' e 'canonico' com formatarCpf", () => {
    expect(arquivos.reconciliarCpfMembros).toContain("formatarCpf(p.atual)");
    expect(arquivos.reconciliarCpfMembros).toContain("formatarCpf(p.canonico)");
  });

  it("reconciliar-telefone-membros-caso.tsx formata 'atual' e 'canonico' com formatarTelefone", () => {
    expect(arquivos.reconciliarTelefoneMembros).toContain("formatarTelefone(p.atual)");
    expect(arquivos.reconciliarTelefoneMembros).toContain("formatarTelefone(p.canonico)");
  });
});
