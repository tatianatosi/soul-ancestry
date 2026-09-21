import { describe, expect, it } from "vitest";

import { restaurarRegistroNaOrganizacao, validarEntradaRestauracao } from "@/lib/saas.functions";

/**
 * Bloco B (21/09/2026) — `arquivarRegistro` já era genérico; restaurar não
 * tinha par e vinha sendo reimplementado caso a caso. Este teste exercita o
 * corpo real de `restaurarRegistro` contra um Supabase falso (mesmo padrão de
 * `materializar-proposta-canva-guard.test.ts`): comportamento, não presença de
 * import.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type Operacao = {
  tabela: string;
  tipo: "select" | "update" | "insert";
  payload?: Record<string, unknown>;
  filtros: Record<string, unknown>;
};

function criarSupabaseFalso(responder: (op: Operacao) => { data: unknown; error?: { message: string } | null }) {
  const operacoes: Operacao[] = [];
  const from = (tabela: string) => {
    const op: Operacao = { tabela, tipo: "select", filtros: {} };
    operacoes.push(op);
    const resolver = () => {
      const r = responder(op);
      return { data: r.data, error: r.error ?? null };
    };
    const api: any = {
      select: () => api,
      update: (payload: Record<string, unknown>) => {
        op.tipo = "update";
        op.payload = payload;
        return api;
      },
      insert: (payload: Record<string, unknown>) => {
        op.tipo = "insert";
        op.payload = payload;
        return resolver();
      },
      eq: (campo: string, valor: unknown) => {
        op.filtros[campo] = valor;
        return api;
      },
      is: (campo: string, valor: unknown) => {
        op.filtros[campo] = valor;
        return api;
      },
      gte: () => api,
      order: () => api,
      limit: () => api,
      maybeSingle: async () => {
        const r = resolver();
        const d: any = r.data;
        return { data: Array.isArray(d) ? (d[0] ?? null) : d, error: r.error };
      },
      // gravarComVerificacao aguarda o próprio encadeamento após .select("id").
      then: (ok: (v: unknown) => unknown, falha?: (e: unknown) => unknown) => {
        try {
          const r = resolver();
          const d: any = r.data;
          return Promise.resolve(ok({ data: Array.isArray(d) ? d : d ? [d] : [], error: r.error }));
        } catch (e) {
          return falha ? Promise.resolve(falha(e)) : Promise.reject(e);
        }
      },
    };
    return api;
  };
  return { supabase: { from, rpc: async () => ({ data: null, error: null }) } as any, operacoes };
}

const ORG = "org-da-sessao";
const OUTRA_ORG = "org-de-terceiro";
const USUARIO = "usuario-autenticado";

/** Tarefa da organização da sessão; o responder ignora o que não é dela. */
function cenario(inicial: Record<string, unknown>, organizationIdDaLinha: string = ORG) {
  const linha: Record<string, unknown> = { ...inicial };
  const { supabase, operacoes } = criarSupabaseFalso((op) => {
    if (op.tabela === "organization_members") return { data: { organization_id: ORG } };
    if (op.tabela === "case_timeline_events") return { data: null };
    if (op.tabela === "tarefas") {
      // Isolamento: só devolve linha quando o filtro bate com a organização dona.
      if (op.filtros["organization_id"] !== organizationIdDaLinha) return { data: null };
      if (op.filtros["id"] !== linha["id"]) return { data: null };
      if (op.tipo === "update") {
        Object.assign(linha, op.payload);
        return { data: [{ id: linha["id"] }] };
      }
      return { data: { ...linha } };
    }
    return { data: null };
  });
  return { supabase, operacoes, linha };
}

const chamar = (supabase: any, entrada: { entidade: any; id: string; motivo: string }) =>
  restaurarRegistroNaOrganizacao(supabase, { ...validarEntradaRestauracao(entrada), userId: USUARIO });

const ARQUIVADA = {
  id: "t-1",
  caso_id: "c-1",
  archived_at: "2026-09-01T00:00:00.000Z",
  archived_by: "outra-pessoa",
  archive_motivo: "duplicata de seed",
};

describe("restaurarRegistro — par genérico de arquivarRegistro", () => {
  it("recusa entidade fora da lista canônica", () => {
    expect(() => validarEntradaRestauracao({ entidade: "planilha_mestre" as any, id: "x", motivo: "m" })).toThrow(
      /Entidade inválida/,
    );
  });

  it("nunca deixa o motivo vazio: branco vira motivo explícito e o informado perde só os espaços", () => {
    expect(validarEntradaRestauracao({ entidade: "tarefas", id: "t-1", motivo: "   " }).motivo).toBe(
      "Motivo não informado.",
    );
    expect(
      validarEntradaRestauracao({ entidade: "tarefas", id: "t-1", motivo: "  reaberto pela cliente  " }).motivo,
    ).toBe("reaberto pela cliente");
  });

  it("não restaura registro que não está arquivado (evita sucesso falso) e não grava nada", async () => {
    const { supabase, operacoes } = cenario({ id: "t-1", caso_id: "c-1", archived_at: null });
    await expect(chamar(supabase, { entidade: "tarefas", id: "t-1", motivo: "reabrir" })).rejects.toThrow(
      /não está arquivado/,
    );
    expect(operacoes.some((o) => o.tipo === "update")).toBe(false);
  });

  it("registro de outra organização é invisível: falha como não encontrado e nada é gravado", async () => {
    const { supabase, operacoes } = cenario(ARQUIVADA, OUTRA_ORG);
    await expect(chamar(supabase, { entidade: "tarefas", id: "t-1", motivo: "tentativa" })).rejects.toThrow(
      /não encontrado nesta organização/,
    );
    expect(operacoes.some((o) => o.tipo === "update")).toBe(false);
  });

  it("limpa as três marcas de arquivamento e filtra sempre pela organização da sessão", async () => {
    const { supabase, operacoes, linha } = cenario(ARQUIVADA);

    await expect(chamar(supabase, { entidade: "tarefas", id: "t-1", motivo: "reaberto pela cliente" })).resolves.toEqual(
      { ok: true },
    );

    expect(linha["archived_at"]).toBeNull();
    expect(linha["archived_by"]).toBeNull();
    expect(linha["archive_motivo"]).toBeNull();

    const escritas = operacoes.filter((o) => o.tipo === "update");
    expect(escritas).toHaveLength(1);
    expect(escritas[0].filtros["organization_id"]).toBe(ORG);
    expect(escritas[0].payload).toMatchObject({ updated_by: USUARIO });

    for (const op of operacoes.filter((o) => o.tabela === "tarefas")) {
      expect(op.filtros["organization_id"]).toBe(ORG);
    }
  });

  it("deixa rastro no histórico do caso, com o motivo da restauração", async () => {
    const { supabase, operacoes } = cenario(ARQUIVADA);

    await chamar(supabase, { entidade: "tarefas", id: "t-1", motivo: "reaberto pela cliente" });

    const evento = operacoes.find((o) => o.tabela === "case_timeline_events" && o.tipo === "insert");
    expect(evento).toBeDefined();
    expect(evento!.payload).toMatchObject({
      organization_id: ORG,
      case_id: "c-1",
      title: "Registro restaurado: tarefas",
      summary_internal: "reaberto pela cliente",
      source_entity_type: "tarefas",
      source_entity_id: "t-1",
      created_by: USUARIO,
    });
  });

  it("registro sem caso associado é restaurado sem inventar evento de timeline", async () => {
    const { supabase, operacoes } = cenario({ ...ARQUIVADA, caso_id: null });

    await expect(chamar(supabase, { entidade: "tarefas", id: "t-1", motivo: "reabrir" })).resolves.toEqual({ ok: true });
    expect(operacoes.some((o) => o.tabela === "case_timeline_events")).toBe(false);
  });
});
