import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

// MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA — Lote 2, batch 2 (erros silenciosos).
// Varredura exaustiva dos 6 grupos do Desk encontrou vários updates/inserts
// que checavam `error` mas nunca a linha afetada (ou nem isso) — a mesma
// classe de bug que gravarComVerificacao existe para prevenir, reintroduzida
// manualmente fora dela. Prova por leitura do código real.

const crmDesk = readFileSync("src/lib/crm-desk.functions.ts", "utf8");
const ops = readFileSync("src/lib/ops.functions.ts", "utf8");
const portalFn = readFileSync("src/lib/portal.functions.ts", "utf8");
const casoCanonico = readFileSync("src/lib/caso-canonico.functions.ts", "utf8");
const contratoParametros = readFileSync("src/lib/contrato-parametros.functions.ts", "utf8");

describe("salvarLeadDesk — insert de lead novo checa linha afetada", () => {
  const trecho = crmDesk.slice(crmDesk.indexOf("export const salvarLeadDesk"));
  // P27 (26/09/2026): o insert manual com checagem de `error` foi substituído
  // por inserirComVerificacao (grava → relê pelo id → compara payload) — o
  // gap apontado no adendo de 31/08/2026 (Painel de Calls) está fechado.
  it("usa inserirComVerificacao, que lança erro explícito se o insert não retornar linha", () => {
    expect(trecho).toContain('tabela: "leads"');
    expect(trecho).toContain("await inserirComVerificacao(");
  });
});

describe("salvarRegraSla — upsert checa linha afetada", () => {
  const trecho = ops.slice(ops.indexOf("export const salvarRegraSla"), ops.indexOf("export const salvarRegraSla") + 1500);
  it("upsert agora seleciona e verifica a linha gravada", () => {
    expect(trecho).toContain('.select("id")');
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: regra de SLA não foi gravada.");
  });
});

describe("validarEmailAutorizado — update principal e cascata checam erro/linha", () => {
  const trecho = portalFn.slice(
    portalFn.indexOf("export const validarEmailAutorizado"),
    portalFn.indexOf("export const validarEmailAutorizado") + 1800,
  );
  it("update de authorized_portal_emails checa linha afetada", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: autorização de e-mail não foi atualizada.");
  });
  it("cascata em client_portal_access agora checa erro", () => {
    expect(trecho).toContain("if (cascata.error) throw new Error(cascata.error.message);");
  });
});

describe("registrarProximaAcao — escrita em case_alerts checa erro e linha afetada", () => {
  const trecho = casoCanonico.slice(
    casoCanonico.indexOf("export const registrarProximaAcao"),
    casoCanonico.indexOf("export const voltarProximaAcaoAoAutomatico"),
  );
  it("update do alerta existente checa erro e linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: alerta de próxima ação não foi atualizado.");
  });
  it("insert de novo alerta checa erro e linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: alerta de próxima ação não foi criado.");
  });
});

describe("preencherDeOrigens — todos os updates em loop checam erro e linha afetada", () => {
  const trecho = contratoParametros.slice(
    contratoParametros.indexOf("export const preencherDeOrigens"),
    contratoParametros.indexOf("export const salvarParametro"),
  );
  it("limpeza de parâmetro revogado/incoerente checa linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: parâmetro não foi limpo.");
  });
  it("conflito de país/rota checa linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: conflito de país não foi registrado.");
  });
  it("correção de origem checa linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: origem do parâmetro não foi corrigida.");
  });
  it("conflito de parâmetro (menor confiança) checa linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: conflito de parâmetro não foi registrado.");
  });
  it("importação do valor candidato checa linha (a escrita principal da função)", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: parâmetro não foi importado.");
  });
  it("conflito proposta×planejador checa linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: conflito proposta×planejador não foi registrado.");
  });
});

describe("aprovarParametros — os dois updates checam linha afetada", () => {
  const trecho = contratoParametros.slice(
    contratoParametros.indexOf("export const aprovarParametros"),
    contratoParametros.indexOf("export const enviarParaAssinatura"),
  );
  it("aprovação da prévia checa linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: prévia não foi aprovada.");
  });
  it("aprovação dos parâmetros do caso checa linha", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: parâmetros do caso não foram aprovados.");
  });
});

describe("enviarParaAssinatura — insert de escopo e update final checam erro/linha", () => {
  const trecho = contratoParametros.slice(
    contratoParametros.indexOf("export const enviarParaAssinatura"),
    contratoParametros.indexOf("export const registrarAssinatura"),
  );
  it("insert de contract_scope_items agora checa erro", () => {
    expect(trecho).toContain("Falha ao registrar o escopo do contrato");
  });
  it("update final de status checa linha afetada", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: envio para assinatura não foi registrado.");
  });
});

describe("corrigirParametroPlanejador — update checa linha afetada", () => {
  const trecho = contratoParametros.slice(contratoParametros.indexOf("export const corrigirParametroPlanejador"));
  it("checa linha afetada na correção", () => {
    expect(trecho).toContain("NENHUMA_LINHA_AFETADA: parâmetro não foi corrigido.");
  });
});
