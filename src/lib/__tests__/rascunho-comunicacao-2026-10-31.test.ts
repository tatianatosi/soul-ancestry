import { describe, expect, it } from "vitest";

import { criarRascunhoSeNaoHouver } from "@/lib/rascunho-comunicacao";

type Row = { id: string; created_at: string; archived_at: string | null; status: string };

/** Cliente falso: `aoSelecionar` roda a cada select, para simular uma gravação concorrente. */
function falso(rows: Row[], aoSelecionar?: (n: number) => void) {
  let selects = 0;
  let proximo = 100;
  return {
    rows,
    from: () => ({
      select: () => {
        const q: any = {
          eq: () => q,
          in: () => q,
          is: () => q,
          order: () => q,
          then: (ok: (v: unknown) => void) => {
            aoSelecionar?.(++selects);
            ok({ data: rows.filter((r) => !r.archived_at).sort((a, b) => a.created_at.localeCompare(b.created_at)), error: null });
          },
        };
        return q;
      },
      insert: () => ({
        select: () => ({
          maybeSingle: async () => {
            const r = { id: `novo-${proximo++}`, created_at: "2026-10-31T12:00:02Z", archived_at: null, status: "awaiting_approval" };
            rows.push(r);
            return { data: { id: r.id }, error: null };
          },
        }),
      }),
      update: (patch: Partial<Row>) => ({
        eq: async (_c: string, id: string) => {
          const r = rows.find((x) => x.id === id);
          if (r) Object.assign(r, patch);
          return { error: null };
        },
      }),
    }),
  };
}

const linha = { organization_id: "o", case_id: "c", acao_codigo: "envio_contrato" };

describe("criarRascunhoSeNaoHouver (31/10/2026)", () => {
  it("cria quando não há pendente", async () => {
    const sb = falso([]);
    const r = await criarRascunhoSeNaoHouver(sb as never, linha);
    expect(r.criado).toBe(true);
    expect(sb.rows).toHaveLength(1);
  });

  it("não cria quando já existe pendente", async () => {
    const sb = falso([{ id: "a", created_at: "2026-10-31T12:00:00Z", archived_at: null, status: "draft_created" }]);
    const r = await criarRascunhoSeNaoHouver(sb as never, linha);
    expect(r).toEqual({ criado: false, id: "a" });
    expect(sb.rows).toHaveLength(1);
  });

  it("corrida: outra chamada insere entre a checagem e o insert, a mais nova se arquiva", async () => {
    const rows: Row[] = [];
    const sb = falso(rows, (n) => {
      if (n === 1) rows.push({ id: "concorrente", created_at: "2026-10-31T12:00:01Z", archived_at: null, status: "awaiting_approval" });
    });
    // o primeiro select já vê o concorrente? não: ele entra DEPOIS de devolver vazio
    const original = rows.length;
    expect(original).toBe(0);
    const r = await criarRascunhoSeNaoHouver(sb as never, linha);
    expect(r.criado).toBe(false);
    expect(r.id).toBe("concorrente");
    expect(rows.filter((x) => !x.archived_at)).toHaveLength(1);
  });
});
