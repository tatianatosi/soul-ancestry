import { describe, expect, it } from "vitest";
import { gravarConvitePortal, erroDemoIncompativel, MOTIVO_ARQUIVO_CONVITE_INCOMPLETO } from "../portal-convite";

/** Cliente Supabase falso: registra operações e devolve respostas programadas. */
function fake(opts: { existente?: any; vinculos?: any[]; vinculoErro?: string }) {
  const ops: any[] = [];
  const client = {
    from(tabela: string) {
      const st: any = { tabela, op: "select", filtros: [] as any[] };
      const b: any = {
        select: () => b,
        insert: (v: any) => ((st.op = "insert"), (st.v = v), b),
        update: (v: any) => ((st.op = "update"), (st.v = v), b),
        eq: (c: string, v: any) => (st.filtros.push([c, v]), b),
        neq: () => b,
        is: () => b,
        maybeSingle: () => {
          ops.push(st);
          if (st.op === "insert") return Promise.resolve({ data: { id: "novo" }, error: null });
          return Promise.resolve({ data: opts.existente ?? null, error: null });
        },
        then: (res: any, rej: any) => {
          ops.push(st);
          let r: any = { data: null, error: null };
          if (tabela === "client_portal_case_access" && st.op === "select") r = { data: opts.vinculos ?? [], error: null };
          if (tabela === "client_portal_case_access" && st.op === "insert" && opts.vinculoErro)
            r = { data: null, error: { message: opts.vinculoErro } };
          return Promise.resolve(r).then(res, rej);
        },
      };
      return b;
    },
  };
  return { client, ops };
}

const base = {
  organizationId: "o1", userId: "u1", clientId: "c1", email: "a@b.co", nivel: "client_workspace" as const,
  finalidade: null, autorizacaoId: "au1", isDemo: false, casoId: "caso1",
  agora: new Date("2026-11-02T10:00:00Z"), expira: new Date("2026-11-03T10:00:00Z"),
};

describe("C2 convite do portal sem transação", () => {
  it("2º insert falha: arquiva a 1ª linha com motivo (sem delete) e propaga o erro original", async () => {
    const { client, ops } = fake({ vinculoErro: "violação X" });
    await expect(gravarConvitePortal(client, base)).rejects.toThrow("violação X");
    const arq = ops.find((o) => o.op === "update" && o.tabela === "client_portal_access");
    expect(arq.v.archived_at).toBeTruthy();
    expect(arq.v.archive_motivo).toBe(MOTIVO_ARQUIVO_CONVITE_INCOMPLETO);
    expect(arq.v.archived_by).toBe("u1");
    expect(arq.filtros).toContainEqual(["id", "novo"]);
    expect(ops.some((o) => o.op === "delete")).toBe(false);
  });

  it("reconvite com órfã: reaproveita a linha existente, sem novo insert em client_portal_access", async () => {
    const { client, ops } = fake({
      existente: { id: "orfa", access_level: "client_workspace", access_status: "invited", is_demo: false },
      vinculos: [],
    });
    const r = await gravarConvitePortal(client, base);
    expect(r).toEqual({ acessoId: "orfa", reaproveitado: true });
    expect(ops.some((o) => o.tabela === "client_portal_access" && o.op === "insert")).toBe(false);
    const vinc = ops.find((o) => o.tabela === "client_portal_case_access" && o.op === "insert");
    expect(vinc.v.client_portal_access_id).toBe("orfa");
  });

  it("reaproveitada que falha no vínculo não é arquivada (já existia)", async () => {
    const { client, ops } = fake({
      existente: { id: "orfa", access_level: "client_workspace", access_status: "invited", is_demo: false },
      vinculos: [], vinculoErro: "boom",
    });
    await expect(gravarConvitePortal(client, base)).rejects.toThrow("boom");
    expect(ops.some((o) => o.op === "update" && o.v?.archived_at)).toBe(false);
  });

  it("linha existente com vínculo não é reaproveitada (cai no insert/índice único)", async () => {
    const { client, ops } = fake({
      existente: { id: "x", access_level: "client_workspace", access_status: "active", is_demo: false },
      vinculos: [{ id: "v" }],
    });
    const r = await gravarConvitePortal(client, base);
    expect(r.reaproveitado).toBe(false);
    expect(ops.some((o) => o.tabela === "client_portal_access" && o.op === "insert")).toBe(true);
  });

  it("demo do caso x is_demo do acesso", () => {
    expect(erroDemoIncompativel(false, true)).toBeTruthy();
    expect(erroDemoIncompativel(true, false)).toBeTruthy();
    expect(erroDemoIncompativel(true, true)).toBeNull();
    expect(erroDemoIncompativel(false, false)).toBeNull();
  });
});
