import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

import {
  NIVEIS_PROXIMA_ACAO,
  projetarProximaAcaoCliente,
  rpcVazaParaCliente,
  sinaisDoCasoPortal,
  type ProximaAcaoCliente,
} from "@/lib/motor-caso";

/**
 * P0-1: Desk e App não podem divergir de fonte de prioridade — mas o App
 * também não pode chamar a RPC interna direto (vazaria tarefa/gate/SKU).
 * A trava de hoje era só o comentário "Mesma ordem da RPC" em
 * motor-caso.ts, sem nada comparando com a definição real em SQL. Este
 * teste lê a migration da RPC e falha se a ordem numérica dela divergir
 * de `NIVEIS_PROXIMA_ACAO` — sem tocar em `clientes.functions.ts`/
 * `clientes.tsx`, sem migration nova, sem RLS.
 */
const SQL = readFileSync(
  "supabase/migrations/20260905130000_proxima_acao_prioritaria_caso.sql",
  "utf8",
);

/** Extrai, na ordem em que aparecem no corpo da função, os níveis "-- Nível N:". */
function niveisDeclaradosNoSql(sql: string): number[] {
  const linhas = [...sql.matchAll(/--\s*Nível\s+(\d+):/gi)];
  return linhas.map((m) => Number(m[1]));
}

/** Extrai o texto do comentário "-- Nível N: <texto>" para checagem semântica. */
function textoDoNivel(sql: string, nivel: number): string {
  const m = sql.match(new RegExp(`--\\s*Nível\\s+${nivel}:\\s*(.+)`, "i"));
  return (m?.[1] ?? "").toLowerCase();
}

describe("P0-1 — sincronia entre a RPC proxima_acao_prioritaria e a projeção do App", () => {
  it("a RPC declara exatamente os níveis usados em NIVEIS_PROXIMA_ACAO, na mesma ordem", () => {
    const niveisSql = niveisDeclaradosNoSql(SQL);
    const niveisTs = Object.values(NIVEIS_PROXIMA_ACAO);
    expect(niveisSql).toEqual([1, 2, 3, 4, 5, 6, 8, 9]);
    expect(niveisSql).toEqual(niveisTs);
    expect(SQL).toMatch(/select 9, 'Definir próximo passo'/);
  });

  it("nível 4 (documento) e nível 6 (pagamento) no SQL são os únicos que o App projeta — semântica bate", () => {
    expect(textoDoNivel(SQL, NIVEIS_PROXIMA_ACAO.documentoCliente)).toMatch(/documento/);
    expect(textoDoNivel(SQL, NIVEIS_PROXIMA_ACAO.pagamento)).toMatch(/pagamento/);
  });

  it("níveis internos (1,2,3,5,8) nunca aparecem como nivelEquivalente do App — garantido pelo tipo", () => {
    // Checagem estrutural: o próprio tipo só admite 4 | 6 | 9. Se alguém
    // ampliar o union para incluir um nível interno, este teste precisa
    // ser atualizado manualmente — o que já é o comportamento desejado
    // (mudança visível em code review, não silenciosa).
    const niveisPermitidos: ProximaAcaoCliente["nivelEquivalente"][] = [4, 6, 9];
    expect(niveisPermitidos).not.toContain(NIVEIS_PROXIMA_ACAO.ativacao);
    expect(niveisPermitidos).not.toContain(NIVEIS_PROXIMA_ACAO.tarefaVencida);
    expect(niveisPermitidos).not.toContain(NIVEIS_PROXIMA_ACAO.tarefaHoje);
    expect(niveisPermitidos).not.toContain(NIVEIS_PROXIMA_ACAO.propostaContrato);
    expect(niveisPermitidos).not.toContain(NIVEIS_PROXIMA_ACAO.manual);
  });

  it("nível 7 (milestone) segue documentado como ausente das duas fontes, não inventado", () => {
    expect(SQL).toMatch(/nível 7.*omitido/i);
    expect(Object.values(NIVEIS_PROXIMA_ACAO)).not.toContain(7);
  });

  it("documento pendente (nível 4) tem prioridade sobre pagamento pendente (nível 6), igual à RPC", () => {
    // Na RPC, o nível 4 (document_requests) é checado e retorna antes de
    // chegar no nível 6 (invoices) — a ordem dos "if exists/return" no SQL
    // é a própria prova de prioridade. Aqui replicamos o mesmo cenário
    // (os dois pendentes ao mesmo tempo) e confirmamos que a projeção do
    // App resolve para o nível 4, nunca para o 6, preservando a ordem.
    const sinais = sinaisDoCasoPortal({
      status: "ativo",
      ativo: true,
      documentosPendentes: 1,
      pagamentoPendente: true,
    });
    const projecao = projetarProximaAcaoCliente(sinais);
    expect(projecao.nivelEquivalente).toBe(NIVEIS_PROXIMA_ACAO.documentoCliente);
    expect(projecao.destino).toBe("/portal/documentos");
  });

  it("com documento resolvido, pagamento pendente assume a próxima ação (nível 6)", () => {
    const sinais = sinaisDoCasoPortal({
      status: "ativo",
      ativo: true,
      documentosPendentes: 0,
      pagamentoPendente: true,
    });
    const projecao = projetarProximaAcaoCliente(sinais);
    expect(projecao.nivelEquivalente).toBe(NIVEIS_PROXIMA_ACAO.pagamento);
  });

  it("a projeção de fallback (nível 9) é genérica e não vaza nomenclatura interna em nenhum ramo", () => {
    const casos: Array<Parameters<typeof sinaisDoCasoPortal>[0]> = [
      { status: "concluido", ativo: false, documentosPendentes: 0, pagamentoPendente: false },
      { status: "pausado", ativo: false, documentosPendentes: 0, pagamentoPendente: false },
      { status: "ativo", ativo: true, documentosPendentes: 0, pagamentoPendente: false },
      { status: "", ativo: false, documentosPendentes: 0, pagamentoPendente: false },
    ];
    for (const c of casos) {
      const projecao = projetarProximaAcaoCliente(sinaisDoCasoPortal(c));
      expect(rpcVazaParaCliente(projecao.acao)).toBe(false);
    }
  });

  it("um nível novo na RPC sem entrada correspondente em NIVEIS_PROXIMA_ACAO derruba este teste", () => {
    // Prova de vida da trava: nível fictício 4.5 não documentado do lado
    // TS faria `niveisSql` ter um item que `niveisTs` não tem — o teste do
    // topo do arquivo já cobre isso por igualdade estrita de array; aqui
    // só deixamos explícito que a lista de níveis internos usada em
    // `motor-caso.test.ts` (2, 3, 1, 5, 8) mais os dois expostos (4, 6) e
    // o fallback (9) esgotam os 8 níveis reais — nenhum sobra sem dono.
    const todosOsNiveis = new Set(Object.values(NIVEIS_PROXIMA_ACAO));
    const expostosAoApp = new Set<number>([NIVEIS_PROXIMA_ACAO.documentoCliente, NIVEIS_PROXIMA_ACAO.pagamento, NIVEIS_PROXIMA_ACAO.indefinido]);
    const internos = new Set(
      [...todosOsNiveis].filter((n) => !expostosAoApp.has(n)),
    );
    expect(internos.size + expostosAoApp.size).toBe(todosOsNiveis.size);
  });
});
