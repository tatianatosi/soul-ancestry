import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * P31 (26/09/2026) — pedido direto da Proprietária: "Pode executar comercial,
 * consentimentos da pessoa 360, verifique também os cards do visao app
 * cliente, todos os documentos Rg, cpf, passaporte, endereço completo...
 * telefone 55 11 também aplicar se é o WhatsApp ou não, e-mail, comprovante
 * residencial, tudo deve ser estruturado com máscaras e validações em todas
 * as abas... aplique e unifique cep conferência será mesmo necessário
 * verificar três vezes o mesmo dado?"
 */

import { estadoCepMembroCaso, sinalCepDaPessoaPorCaso } from "@/lib/pessoa-vinculo";

describe("P31 — estadoCepMembroCaso (mesmo padrão de estadoCpfMembroCaso/estadoTelefoneMembroCaso)", () => {
  it("dependente nunca sincroniza", () => {
    expect(estadoCepMembroCaso({ dependente: true, cep: null }, "01525-001")).toBe("dependente_nao_sincronizado");
  });

  it("sem CEP canônico, nada a fazer", () => {
    expect(estadoCepMembroCaso({ cep: null }, null)).toBe("sem_dado_canonico");
    expect(estadoCepMembroCaso({ cep: null }, "")).toBe("sem_dado_canonico");
  });

  it("membro sem CEP e canônico com CEP: preencher", () => {
    expect(estadoCepMembroCaso({ cep: null }, "01525-001")).toBe("preencher");
    expect(estadoCepMembroCaso({ cep: "" }, "01525-001")).toBe("preencher");
  });

  it("mesmo CEP (ignorando máscara): já sincronizado", () => {
    expect(estadoCepMembroCaso({ cep: "01525001" }, "01525-001")).toBe("ja_sincronizado");
  });

  it("CEP divergente: conflito, nunca sobrescreve sozinho", () => {
    expect(estadoCepMembroCaso({ cep: "04567-000" }, "01525-001")).toBe("conflito");
  });
});

describe("P31 — sinalCepDaPessoaPorCaso", () => {
  it("agrega só conflito/preencher, ignora membros projetados de núcleo", () => {
    const sinal = sinalCepDaPessoaPorCaso(
      [
        { case_id: "c1", cliente_id: "p1", cep: null, origem: "case_members" },
        { case_id: "c1", cliente_id: "p1", cep: "99999-999", origem: "case_members" },
        { case_id: "c2", cliente_id: "p1", cep: "01525-001", origem: "nucleo" },
      ],
      "p1",
      "01525-001",
    );
    expect(sinal.c1).toEqual({ conflito: 1, preencher: 1 });
    expect(sinal.c2).toBeUndefined();
  });
});

describe("P31 — Pessoa 360: seções Comercial e Consentimentos executadas", () => {
  const arquivo = readFileSync("src/routes/_authenticated/pessoas.$clienteId.tsx", "utf8");

  it("existe um CaCard 'Comercial' lendo classificacao/status_comercial/origem/data_origin/ativação", () => {
    expect(arquivo).toContain('<CaCard titulo="Comercial">');
    expect(arquivo).toContain("cliente.classificacao");
    expect(arquivo).toContain("cliente.status_comercial");
    expect(arquivo).toContain("cliente.data_origin");
    expect(arquivo).toContain("cliente.ativacao_decidida_em");
    expect(arquivo).toContain("cliente.ativacao_justificativa");
  });

  it("existe um CaCard 'Consentimentos' lendo consent_records via consentimentos", () => {
    expect(arquivo).toMatch(/<CaCard\s*\n?\s*titulo="Consentimentos"/);
    expect(arquivo).toContain("consentimentos.length");
    expect(arquivo).toContain("tipo_consentimento");
    expect(arquivo).toContain("escopo_compartilhamento");
  });

  it("campo telefone_whatsapp aparece como select Sim/Não em Pessoa 360", () => {
    expect(arquivo).toContain('chave: "telefone_whatsapp"');
    expect(arquivo).toContain('rotulo: "É WhatsApp?"');
  });

  it("contagem de CaCard da Pessoa 360 subiu para 14 (12 + Comercial + Consentimentos)", () => {
    const abertas = arquivo.match(/<CaCard/g) ?? [];
    expect(abertas.length).toBe(14);
  });
});

describe("P31 — pessoa.functions.ts: leitor real de Comercial e Consentimentos", () => {
  const arquivo = readFileSync("src/lib/pessoa.functions.ts", "utf8");

  it("carregarPessoa lê os campos comerciais novos e consent_records por client_id", () => {
    expect(arquivo).toContain("classificacao, data_origin, ativacao_decidida_em, ativacao_justificativa");
    expect(arquivo).toContain('.from("consent_records")');
    expect(arquivo).toContain('.eq("client_id", cliente.id)');
  });

  it("atualizarPessoa trata telefone_whatsapp como boolean, não string forçada", () => {
    expect(arquivo).toContain("CAMPOS_BOOLEANOS");
    expect(arquivo).toContain('typeof v === "boolean" ? v : null');
  });
});

describe("P31 — Caso 360: reconciliação de CEP conectada (mesmo padrão de CPF/telefone)", () => {
  const arquivo = readFileSync("src/routes/_authenticated/casos.$caseId.index.tsx", "utf8");

  it("importa e usa ReconciliarCepMembrosCaso nos dois ramos (com e sem núcleo)", () => {
    expect(arquivo).toContain(
      'import { ReconciliarCepMembrosCaso } from "@/components/caso/reconciliar-cep-membros-caso"',
    );
    const ocorrencias = arquivo.match(/<ReconciliarCepMembrosCaso/g) ?? [];
    expect(ocorrencias.length).toBe(2);
  });

  it("importa conferirDivergenciaCepMembrosCaso do servidor", () => {
    expect(arquivo).toContain("conferirDivergenciaCepMembrosCaso");
  });

  it("formulário de pessoa do caso valida e-mail e telefone antes de gravar (não só CPF/CEP)", () => {
    expect(arquivo).toContain("emailValido(email)");
    expect(arquivo).toContain("telefoneValido(telefone)");
  });

  it("campo 'É WhatsApp?' aparece no formulário de pessoa do caso", () => {
    expect(arquivo).toContain('label="É WhatsApp?"');
  });
});

describe("P31 — caso-canonico.functions.ts: conferirDivergenciaCepMembrosCaso segue o mesmo contrato de CPF/telefone", () => {
  const arquivo = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");

  it("nunca sobrescreve conflito sem motivo explícito", () => {
    const inicio = arquivo.indexOf("export const conferirDivergenciaCepMembrosCaso");
    const trecho = arquivo.slice(inicio, inicio + 3000);
    expect(trecho).toContain("Resolver conflito de CEP exige o motivo da decisão.");
    expect(trecho).toContain('payload: { cep: canonico }');
  });

  it("só preenche CEP vazio, nunca sobrescreve valor já gravado em lote", () => {
    const inicio = arquivo.indexOf("export const conferirDivergenciaCepMembrosCaso");
    const trecho = arquivo.slice(inicio, inicio + 5000);
    expect(trecho).toContain('if (item.acao !== "preencher") continue;');
  });
});

describe("P31 — saas.functions.ts: telefone_whatsapp liberado no allowlist de case_members", () => {
  const arquivo = readFileSync("src/lib/saas.functions.ts", "utf8");

  it("case_members aceita telefone_whatsapp no criar/atualizar genérico", () => {
    const inicio = arquivo.indexOf("case_members: [");
    const trecho = arquivo.slice(inicio, inicio + 600);
    expect(trecho).toContain('"telefone_whatsapp"');
  });
});

describe("P31 — migration da coluna WhatsApp é aditiva e nullable", () => {
  const arquivo = readFileSync(
    "supabase/migrations/20260926190000_telefone_whatsapp_flag.sql",
    "utf8",
  );

  it("adiciona coluna boolean sem NOT NULL, em clientes e case_members", () => {
    expect(arquivo).toContain("ADD COLUMN IF NOT EXISTS telefone_whatsapp boolean");
    expect(arquivo).not.toMatch(/telefone_whatsapp boolean NOT NULL/);
    expect(arquivo).toContain("public.clientes");
    expect(arquivo).toContain("public.case_members");
  });
});
