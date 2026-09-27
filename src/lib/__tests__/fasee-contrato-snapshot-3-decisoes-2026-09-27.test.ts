import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

/**
 * Fase E (27/09/2026): antes de `contract_parties` congelar/enviar, um
 * conflito com o cadastro canônico não pode ficar só sinalizado para
 * sempre — 3 decisões humanas explícitas, cada uma com motivo obrigatório:
 * atualizar_snapshot / manter_com_motivo / corrigir_pessoa_canonica.
 * Endereço nunca oferece "corrigir_pessoa_canonica" (composto de 7
 * colunas). Nunca disponível em contrato já assinado.
 */
const contratosFn = readFileSync("src/lib/contratos.functions.ts", "utf8");
const cpfUi = readFileSync("src/components/contrato/reconciliar-cpf-partes.tsx", "utf8");
const contatoUi = readFileSync("src/components/contrato/reconciliar-contato-partes.tsx", "utf8");
const prepararRota = readFileSync(
  "src/routes/_authenticated/casos.$caseId.contrato.preparar.tsx",
  "utf8",
);

describe("Fase E — tipo de decisão com exatamente 3 valores", () => {
  it("DecisaoConflitoContrato é atualizar_snapshot | manter_com_motivo | corrigir_pessoa_canonica", () => {
    expect(contratosFn).toContain(
      'export type DecisaoConflitoContrato = "atualizar_snapshot" | "manter_com_motivo" | "corrigir_pessoa_canonica";',
    );
  });
});

describe("Fase E — motivo é obrigatório para resolver qualquer conflito (CPF e contato)", () => {
  it("sincronizarPessoaDoCaso recusa resolverPartyId sem motivo", () => {
    const inicio = contratosFn.indexOf("export const sincronizarPessoaDoCaso");
    const trecho = contratosFn.slice(inicio, inicio + 900);
    expect(trecho).toContain("Resolver conflito de CPF exige o motivo da decisão");
  });

  it("sincronizarContatoPartesDoCaso recusa resolverPartyId sem motivo", () => {
    const inicio = contratosFn.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = contratosFn.slice(inicio, inicio + 1200);
    expect(trecho).toContain("Resolver conflito exige o motivo da decisão");
  });
});

describe("Fase E — endereço nunca corrige a Pessoa Canônica (composto, não fatiável)", () => {
  it("inputValidator de sincronizarContatoPartesDoCaso recusa corrigir_pessoa_canonica quando campo === 'endereco'", () => {
    const inicio = contratosFn.indexOf("export const sincronizarContatoPartesDoCaso");
    const trecho = contratosFn.slice(inicio, inicio + 1400);
    expect(trecho).toContain('d.decisao === "corrigir_pessoa_canonica" && d.campo === "endereco"');
  });
});

describe("Fase E — resolver conflito nunca disponível em contrato assinado", () => {
  it("sincronizarPessoaDoCaso lança antes de resolver quando contrato.signed_at", () => {
    const inicio = contratosFn.indexOf("if (data.resolverPartyId) {");
    const trecho = contratosFn.slice(inicio, inicio + 200);
    expect(trecho).toContain("if (contrato.signed_at) throw new Error");
  });

  it("os dois componentes escondem o botão de resolver quando contratoAssinado", () => {
    expect(cpfUi).toContain("if (contratoAssinado) return null;");
    expect(contatoUi).toContain("if (contratoAssinado) return null;");
  });
});

describe("Fase E — manter_com_motivo nunca escreve dado, só registra decisão aceita", () => {
  it("o ramo manter_com_motivo não chama gravarComVerificacao", () => {
    const inicio = contratosFn.indexOf('await evento(supabase, organizationId, contrato.id, "conflito_mantido_com_motivo"');
    expect(inicio).toBeGreaterThan(-1);
    // Nenhuma chamada gravarComVerificacao entre o início do bloco manter_com_motivo e seu return.
    const fimBloco = contratosFn.indexOf("return { simulado: false, plano, atualizados: 0, resolvido: alvo.id };", inicio);
    const trecho = contratosFn.slice(inicio, fimBloco);
    expect(trecho).not.toContain("gravarComVerificacao");
  });

  it("decisaoConflitoJaAceita é consultada nos dois planos antes de marcar conflito", () => {
    expect(contratosFn).toContain("async function decisaoConflitoJaAceita(");
    const ocorrencias = contratosFn.match(/decisaoConflitoJaAceita\(/g) ?? [];
    // 1 declaração + 2 chamadas (CPF e contato).
    expect(ocorrencias.length).toBe(3);
  });

  it("conflito_aceito é um estado distinto de conflito, nunca escondido", () => {
    expect(contratosFn).toContain('"conflito_aceito"');
    expect(cpfUi).toContain("conflito_aceito");
    expect(contatoUi).toContain("conflito_aceito");
  });
});

describe("Fase E — corrigir_pessoa_canonica grava em clientes, nunca em contract_parties", () => {
  it("sincronizarPessoaDoCaso: ramo corrigir_pessoa_canonica grava tabela clientes", () => {
    const inicio = contratosFn.indexOf('decisao === "corrigir_pessoa_canonica"');
    const trecho = contratosFn.slice(inicio, inicio + 400);
    expect(trecho).toContain('tabela: "clientes"');
  });

  it("sincronizarContatoPartesDoCaso: ramo corrigir_pessoa_canonica grava tabela clientes", () => {
    const inicio = contratosFn.lastIndexOf('decisao === "corrigir_pessoa_canonica"');
    const trecho = contratosFn.slice(inicio, inicio + 400);
    expect(trecho).toContain('tabela: "clientes"');
  });
});

describe("Fase E — UI oferece as 3 decisões (2 para endereço) sempre com motivo obrigatório", () => {
  it("componente de CPF tem os 3 botões de decisão", () => {
    expect(cpfUi).toContain('onResolver("atualizar_snapshot"');
    expect(cpfUi).toContain('onResolver("corrigir_pessoa_canonica"');
    expect(cpfUi).toContain('onResolver("manter_com_motivo"');
    expect(cpfUi).toContain("disabled={ocupado || !motivo.trim()}");
  });

  it("componente de contato só oferece 'corrigir cadastro' quando campo !== endereco", () => {
    expect(contatoUi).toContain('campo !== "endereco"');
  });

  it("rota de preparar contrato passa onResolverConflito para ReconciliarCpfPartes", () => {
    expect(prepararRota).toContain("onResolverConflito={(id, decisao, motivo) =>");
    expect(prepararRota).toContain("mResolverConflitoCpf.mutate({ id, decisao, motivo })");
  });
});
