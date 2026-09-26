import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { decidirClienteDoHandoff } from "../handoff-discovery";

/**
 * Ordem P1 (21/09/2026) — "Identidade única do Lead ao Caso".
 *
 * A cadeia Lead → Contato → Discovery → Cliente canônico → Caso já existia
 * quase inteira (writer único de lead, ação única de conversão, vínculo em
 * participante e perfil genealógico). Estes testes travam o que a ordem
 * exige e o que esta execução acrescentou: CPF na duplicidade preventiva.
 */

const clientesFn = readFileSync("src/lib/clientes.functions.ts", "utf8");
const rotaClientes = readFileSync("src/routes/_authenticated/clientes.tsx", "utf8");

describe("duplicidade preventiva — e-mail, telefone e CPF", () => {
  it("busca CPF na coluna canônica de clientes, não em case_members", () => {
    // `clientes.cpf` existe desde a migration 20260902144855 (Pessoa
    // Canônica). O comentário antigo da função dizia o contrário e por isso
    // CPF ficava de fora da prevenção.
    expect(clientesFn).toContain('.select("id, nome, email, telefone, cpf, classificacao")');
    expect(clientesFn).toContain('motivos.push("mesmo CPF")');
  });

  it("reusa a normalização de CPF de pessoa-identidade em vez de criar outra", () => {
    expect(clientesFn).toContain('import { normalizarCpf } from "@/lib/pessoa-identidade"');
    expect(clientesFn).toContain("normalizarCpf(l.cpf) === cpf");
  });

  it("mantém os três sinais anteriores — CPF é adição, não troca", () => {
    expect(clientesFn).toContain('motivos.push("mesmo e-mail")');
    expect(clientesFn).toContain('motivos.push("mesmo telefone")');
    expect(clientesFn).toContain('motivos.push("mesmo nome")');
  });

  it("isola por organização e ignora arquivados", () => {
    const trecho = clientesFn.slice(
      clientesFn.indexOf("export const verificarDuplicidadeCliente"),
      clientesFn.indexOf("export const reclassificarPessoa"),
    );
    expect(trecho).toContain('.eq("organization_id", organizationId)');
    expect(trecho).toContain('.is("archived_at", null)');
  });
});

describe("cadastro de pessoa no Desk", () => {
  it("coleta CPF com máscara e o envia à checagem preventiva", () => {
    expect(rotaClientes).toContain('import { formatarCpf, formatarTelefone } from "@/lib/validacao-pessoa"');
    expect(rotaClientes).toContain('chave: "cpf"');
    expect(rotaClientes).toContain("formatarCpf(e.target.value)");
    expect(rotaClientes).toContain("cpf: novo.cpf");
  });

  it("não grava direto quando há candidato: exige segundo clique consciente", () => {
    // Primeiro clique busca duplicidade e retorna sem criar; só o segundo
    // ("Cadastrar mesmo assim") grava. É a decisão humana que a ordem pede.
    expect(rotaClientes).toContain("if (duplicidades.length) {");
    expect(rotaClientes).toContain("setDuplicidadesNovo(duplicidades);");
    expect(rotaClientes).toContain('{duplicidadesNovo.length ? "Cadastrar mesmo assim" : "Cadastrar"}');
  });

  it("trava duplo submit enquanto a verificação está em voo", () => {
    expect(rotaClientes).toContain("disabled={verificandoDuplicidade}");
  });

  it("oferece abrir a ficha existente em vez de criar ficha concorrente", () => {
    expect(rotaClientes).toContain("abrir ficha existente");
  });
});

describe("conversão do lead em cliente canônico", () => {
  const lead = { nome: "Ana Luiza", email: "ana@exemplo.com", telefone: "(62) 98158-4015" };

  it("e-mail confirmado converte para o cliente existente", () => {
    const d = decidirClienteDoHandoff(lead, [
      { id: "c1", nome: "A. L. Rodrigues", email: "ANA@exemplo.com " },
    ]);
    expect(d.acao).toBe("reusar");
    expect(d).toMatchObject({ clienteId: "c1" });
  });

  it("CPF idêntico também converte para o existente, mesmo com e-mail diferente", () => {
    const d = decidirClienteDoHandoff({ nome: "Ana Luiza", cpf: "123.456.789-01" }, [
      { id: "c9", nome: "Outro nome", cpf: "12345678901", email: "outro@exemplo.com" },
    ]);
    expect(d.acao).toBe("reusar");
    expect(d).toMatchObject({ clienteId: "c9" });
  });

  it("telefone sozinho NÃO converte: devolve candidatos para decisão humana", () => {
    const d = decidirClienteDoHandoff({ nome: "Ana Luiza", telefone: "+5562981584015" }, [
      { id: "c2", nome: "Ana Luiza", telefone: "(62) 8158-4015" },
    ]);
    expect(d.acao).toBe("confirmar");
    expect(d).toMatchObject({ candidatos: [{ id: "c2" }] });
  });

  it("dois confirmados não fundem sozinhos: também pedem confirmação", () => {
    const d = decidirClienteDoHandoff(lead, [
      { id: "c3", nome: "Ana", email: "ana@exemplo.com" },
      { id: "c4", nome: "Ana L.", email: "ana@exemplo.com" },
    ]);
    expect(d.acao).toBe("confirmar");
  });

  it("sem elo nenhum, cria pessoa nova", () => {
    const d = decidirClienteDoHandoff(lead, [{ id: "c5", nome: "João", email: "joao@exemplo.com" }]);
    expect(d.acao).toBe("criar");
  });

  it("nome igual com um único candidato funde automaticamente — decisão explícita e reiterada da Proprietária (P30, 26/09/2026)", () => {
    // Antes: nome igual caía em apenas_indicio, decidirClienteDoHandoff nem
    // via isso como pendência e criava um cliente novo duplicado sem avisar
    // — o vazamento real. "Pode fundir caso seja nome exato" / "homônimos
    // irão sempre existir na face da terra": nome exato agora funde igual
    // CPF/e-mail quando há exatamente um candidato.
    const d = decidirClienteDoHandoff({ nome: "Ana Luiza" }, [{ id: "c6", nome: "Ana Luiza" }]);
    expect(d).toMatchObject({ acao: "reusar", clienteId: "c6" });
  });

  it("nome igual com dois candidatos continua pedindo escolha — ambiguidade real (duas pessoas), não homônimo negado", () => {
    const d = decidirClienteDoHandoff(
      { nome: "Ana Luiza" },
      [
        { id: "c6", nome: "Ana Luiza" },
        { id: "c8", nome: "Ana Luiza" },
      ],
    );
    expect(d.acao).toBe("confirmar");
    if (d.acao === "confirmar") {
      expect(d.candidatos.map((c) => c.id).sort()).toEqual(["c6", "c8"]);
    }
  });

  it("confirmação humana explícita vence e registra o motivo do elo", () => {
    const d = decidirClienteDoHandoff({ nome: "Ana Luiza" }, [{ id: "c7", nome: "Outra pessoa" }], "c7");
    expect(d).toMatchObject({ acao: "reusar", clienteId: "c7" });
  });
});

describe("caso só nasce depois do cliente canônico", () => {
  const handoff = readFileSync("src/lib/handoff-discovery.functions.ts", "utf8");

  it("devolve precisaConfirmarCliente sem criar caso quando há ambiguidade", () => {
    expect(handoff).toContain("precisaConfirmarCliente");
  });

  it("preserva o lead ligando-o ao caso, sem apagar nem duplicar", () => {
    expect(handoff).toContain("case_id");
    expect(handoff).not.toContain('.delete().eq("id", leadId)');
  });

  it("registra o evento no histórico do caso", () => {
    expect(handoff).toContain("registrarTimelineCaso");
  });
});

describe("writer único de lead", () => {
  it("/calls e /leads gravam pela mesma função", () => {
    const calls = readFileSync("src/components/crm/painel-calls.tsx", "utf8");
    const leads = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
    expect(calls).toContain("salvarLeadDesk");
    expect(leads).toContain("salvarLeadDesk");
  });
});
