import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * PR #32 (30/08/2026) — "Pessoa: salvar com releitura real + decisão de tarefa;
 * ajustes mobile" — ficou ABERTA, em draft, com base na branch da PR #29 em vez
 * da main. Varredura de 09/10/2026 mostrou que 5 dos 6 itens dela chegaram à
 * main por outros commits; este era o único gap real que restava.
 *
 * O defeito: a aba Partes do contrato era uma tabela `min-w-[640px]` dentro de
 * `overflow-x-auto` — inoperável em 375 px, porque as ações ficam fora da tela.
 */

const rota = readFileSync(`${process.cwd()}/src/routes/_authenticated/contratos.$id.tsx`, "utf8");

describe("aba Partes do contrato em tela estreita", () => {
  it("a tabela larga é exclusiva de md+", () => {
    expect(rota).toContain('className="hidden overflow-x-auto md:block"');
    // nenhuma tabela larga visível por padrão em tela estreita
    expect(rota).not.toMatch(/<div className="overflow-x-auto">\s*<table className="w-full min-w-\[640px\]/);
  });

  it("abaixo de md, cada parte é um card", () => {
    expect(rota).toContain("function CardsPartes(");
    expect(rota).toContain('className="flex flex-col gap-2 md:hidden"');
    expect(rota).toContain("<CardsPartes partes={partes as any[]} aoArquivar={arquivar} />");
  });

  it("o card não perde informação da tabela: nome, papel, capacidade e assinatura", () => {
    const i = rota.indexOf("function CardsPartes(");
    const bloco = rota.slice(i, rota.indexOf("function Partes({", i));
    expect(bloco).toContain("p.person_name");
    expect(bloco).toContain("ROTULO_PAPEL_PARTE[p.role]");
    expect(bloco).toContain("p.legal_capacity_status");
    expect(bloco).toContain("p.signature_required");
  });

  it("o card mantém a ação de arquivar, com confirmação e motivo", () => {
    const i = rota.indexOf("function CardsPartes(");
    const bloco = rota.slice(i, rota.indexOf("function Partes({", i));
    expect(bloco).toContain("AcaoOperacional");
    expect(bloco).toContain('acaoExterna="excluir_registro_ou_versao"');
    expect(bloco).toContain("onConfirmar={(motivo) => aoArquivar(p.id, motivo)}");
    expect(bloco).toContain("O registro permanece no histórico");
  });

  it("parte arquivada aparece como arquivada no card, não desaparece", () => {
    const i = rota.indexOf("function CardsPartes(");
    const bloco = rota.slice(i, rota.indexOf("function Partes({", i));
    expect(bloco).toContain("p.archived_at");
    expect(bloco).toContain("arquivada");
  });

  it("o link para Pessoa 360 continua disponível no card quando há cliente vinculado", () => {
    const i = rota.indexOf("function CardsPartes(");
    const bloco = rota.slice(i, rota.indexOf("function Partes({", i));
    expect(bloco).toContain("p.client_id");
    expect(bloco).toContain('to="/pessoas/$clienteId"');
  });

  it("nenhuma ação existe só no desktop: arquivar aparece nas duas vistas", () => {
    const ocorrencias = (rota.match(/acaoExterna="excluir_registro_ou_versao"/g) ?? []).length;
    expect(ocorrencias).toBeGreaterThanOrEqual(2);
  });
});
