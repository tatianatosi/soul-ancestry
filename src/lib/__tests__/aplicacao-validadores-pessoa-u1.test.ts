import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// Corte U1 (17/09/2026) — aplicar validadores/máscaras canônicos já
// existentes (formatarTelefone, <input type="email">) aos campos crus
// identificados em docs/design-system/de-para-pessoa-unificada.md e
// docs/design-system/taxonomia-interface-ctas.md §9.4. Sem schema novo,
// sem validador novo — só consumo do que já existe.

const leadsTsx = readFileSync("src/routes/_authenticated/leads.tsx", "utf8");
const novoLeadTsx = readFileSync("src/components/crm/novo-lead.tsx", "utf8");
const clientesTsx = readFileSync("src/routes/_authenticated/clientes.tsx", "utf8");

describe("Corte U1 — Lead (leads.tsx)", () => {
  it("campo E-mail agora usa tipo=email (mesmo mecanismo já usado em acessos-portal.tsx)", () => {
    /*
      03/10/2026 — a asserção antes exigia os dois atributos na MESMA linha
      (`label="E-mail" tipo="email"`), e quebrou quando o campo ganhou o
      validador e virou multilinha. A intenção original era o mecanismo, não
      a formatação: o campo de e-mail do lead é `tipo="email"`. Agora é isso
      que o teste afirma — e também que ele passou a validar de fato.
    */
    const i = leadsTsx.indexOf('label="E-mail"');
    expect(i).toBeGreaterThan(-1);
    const campo = leadsTsx.slice(i, i + 320);
    expect(campo).toContain('tipo="email"');
    expect(campo).toContain('motivoCampoInvalido("E-mail", "email"');
  });

  it("campo Telefone continua mascarado por formatarTelefone (já correto antes deste corte)", () => {
    expect(leadsTsx).toContain("onChange={(x) => set(\"telefone\")(formatarTelefone(x))}");
  });
});

describe("Corte U1 — Novo lead (novo-lead.tsx)", () => {
  it("importa formatarTelefone de @/lib/validacao-pessoa", () => {
    expect(novoLeadTsx).toContain('import { formatarTelefone } from "@/lib/validacao-pessoa"');
  });

  it("campo E-mail usa tipo=email", () => {
    expect(novoLeadTsx).toContain('tipo="email"');
  });

  it("campo Telefone aplica formatarTelefone no onChange", () => {
    expect(novoLeadTsx).toContain('onChange={(v) => set("telefone")(formatarTelefone(v))}');
  });
});

describe("Corte U1 — Cliente/Pessoa 360, modal Novo cadastro (clientes.tsx)", () => {
  // A ordem P1 (21/09/2026) acrescentou o campo CPF opcional a este mesmo
  // modal, com `formatarCpf`. As asserções abaixo continuam travando o que o
  // Corte U1 garantia — telefone mascarado, nome/e-mail intocados — sem
  // proibir a máscara nova.
  it("importa as máscaras de @/lib/validacao-pessoa", () => {
    expect(clientesTsx).toContain('from "@/lib/validacao-pessoa"');
    expect(clientesTsx).toContain("formatarTelefone");
    expect(clientesTsx).toContain("formatarCpf");
  });

  it("os campos do modal declaram tipo (text/email/tel) em vez de <input> cru sem type", () => {
    expect(clientesTsx).toContain('{ chave: "nome", rotulo: "Nome", tipo: "text" }');
    expect(clientesTsx).toContain('{ chave: "email", rotulo: "E-mail", tipo: "email" }');
    expect(clientesTsx).toContain('{ chave: "telefone", rotulo: "Telefone", tipo: "tel" }');
  });

  it("telefone e CPF são formatados antes de entrar no estado; nome/e-mail não são alterados no onChange", () => {
    expect(clientesTsx).toContain('c.chave === "telefone"');
    expect(clientesTsx).toContain("formatarTelefone(e.target.value)");
    expect(clientesTsx).toContain('c.chave === "cpf"');
    expect(clientesTsx).toContain("formatarCpf(e.target.value)");
    // O ramo final continua devolvendo o valor cru — nome e e-mail seguem
    // sem transformação no onChange, como o Corte U1 fixou.
    expect(clientesTsx).toContain(": e.target.value,");
  });
});

describe("Corte U1 — áreas sem alteração (achado: nada a aplicar com validador já existente)", () => {
  it("Núcleo (nucleos.tsx) não tem campo de CPF/e-mail/telefone — nucleo_membros não tem essas colunas", () => {
    const nucleosTsx = readFileSync("src/routes/_authenticated/nucleos.tsx", "utf8");
    expect(nucleosTsx).not.toContain('label="E-mail"');
    expect(nucleosTsx).not.toContain('label="Telefone"');
    expect(nucleosTsx).not.toContain('label="CPF"');
  });

  it("Contrato (contratos.$id.tsx), tela Adicionar parte, só coleta nome e papel — sem campo de e-mail/telefone/CPF na UI", () => {
    const contratosTsx = readFileSync("src/routes/_authenticated/contratos.$id.tsx", "utf8");
    const trecho = contratosTsx.slice(
      contratosTsx.indexOf('const [nome, setNome] = useState("")'),
      contratosTsx.indexOf('rotulo="Adicionar parte"') + 200,
    );
    expect(trecho).not.toContain("email");
    expect(trecho).not.toContain("telefone");
  });

  it("Pesquisa (pessoas-linhagens.$caseId.tsx) usa Selecao fechada para sexo e input type=date para nascimento — já conforme", () => {
    const pesquisaTsx = readFileSync("src/routes/_authenticated/pessoas-linhagens.$caseId.tsx", "utf8");
    expect(pesquisaTsx).toContain('opcoes={SEXO}');
    expect(pesquisaTsx).toContain('type="date"');
    expect(pesquisaTsx).not.toContain('label="CPF"');
  });

  it("Portal (acessos-portal.tsx) já usa input type=email e valida e-mail no servidor — sem gap", () => {
    const acessosPortalTsx = readFileSync("src/routes/_authenticated/acessos-portal.tsx", "utf8");
    expect(acessosPortalTsx).toContain('type="email"');
  });
});
