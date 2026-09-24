import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

/*
 * Contrato de Uma Hora, item "OS real" (autorização 2026-09-24): a Ordem de
 * Serviço já tinha responsible_user_id/start_date/end_date na tabela
 * service_orders desde as migrations existentes, mas nenhuma tela expunha
 * escritor para eles — só scope_summary/status eram editáveis. Este teste
 * confere, no mesmo padrão de motor-lote2-batch5-comercial.test.ts
 * (trecho de código entre dois nomes de função), que o escritor existente
 * (atualizarObservacaoOrdem) passou a aceitar e gravar os três campos, e que
 * a tela de ordens de serviço monta o seletor de responsável a partir da
 * equipe ativa (staff_access via listarVinculos), não de um valor inventado.
 */

const fn = readFileSync("src/lib/comercial.functions.ts", "utf8");
const rota = readFileSync("src/routes/_authenticated/ordens-servico.tsx", "utf8");

function trechoDe(nomeFn: string, proximaFn: string) {
  return fn.slice(fn.indexOf(`export const ${nomeFn}`), fn.indexOf(`export const ${proximaFn}`));
}

describe("atualizarObservacaoOrdem — planejamento (responsável, início, prazo)", () => {
  const t = trechoDe("atualizarObservacaoOrdem", "mudarStatusOrdem");

  it("aceita os três campos como opcionais no inputValidator", () => {
    expect(t).toContain("responsible_user_id?: string | null");
    expect(t).toContain("start_date?: string | null");
    expect(t).toContain("end_date?: string | null");
  });

  it("grava cada campo só quando informado, sem sobrescrever com undefined", () => {
    expect(t).toContain("if (data.responsible_user_id !== undefined) patch.responsible_user_id");
    expect(t).toContain("if (data.start_date !== undefined) patch.start_date");
    expect(t).toContain("if (data.end_date !== undefined) patch.end_date");
  });

  it("continua registrando histórico (nenhum escritor silencioso)", () => {
    expect(t).toContain("registrarTimelineCaso(");
  });
});

describe("listarVinculos — equipe ativa para o seletor de responsável", () => {
  const t = trechoDe("listarVinculos", "obterPropostaCanvaDoCliente");

  it('lê staff_access filtrando status "active", não uma lista inventada', () => {
    expect(t).toContain('.from("staff_access")');
    expect(t).toContain('.eq("status", "active")');
    expect(t).toContain("equipe:");
  });
});

describe("ordens-servico.tsx — UI de planejamento operável", () => {
  it("tem inputs de responsável, início e prazo ligados ao escritor", () => {
    expect(rota).toContain("Planejamento (responsável, início, prazo)");
    expect(rota).toContain("mPlanejamento.mutate");
    expect(rota).toContain("responsible_user_id: responsavel || null");
    expect(rota).toContain("start_date: dataInicio || null");
    expect(rota).toContain("end_date: dataFim || null");
  });

  it("popula o seletor de responsável a partir de qv.data.equipe (staff ativo), não hardcoded", () => {
    expect(rota).toContain("const equipe = qv.data?.equipe ?? []");
    expect(rota).toContain("{equipe.map((m) =>");
  });

  it("declara a ausência de dependências entre OS como dívida, não inventa o campo", () => {
    expect(rota).toContain("Dependências entre ordens de serviço ainda não existem");
  });
});
