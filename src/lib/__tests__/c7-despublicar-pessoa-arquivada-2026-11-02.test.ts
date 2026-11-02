import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/timeline-operacional.server", () => ({ registrarTimelineCaso: vi.fn(async () => undefined) }));

import { despublicarProjecoesDaPessoa } from "../projecao-app-despublicar.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

const ler = (f: string) => readFileSync(resolve(__dirname, "..", f), "utf8");

/** Cliente falso: app_projections com 2 publicadas da pessoa; registra updates. */
function fake(publicadas: string[], falhaUpdate = false) {
  const updates: any[] = [];
  const consultas: any[] = [];
  const client = {
    from(tabela: string) {
      const st: any = { tabela, filtros: [] as any[], op: "select" };
      const b: any = {
        select: () => b,
        update: (v: any) => ((st.op = "update"), (st.v = v), b),
        eq: (c: string, v: any) => (st.filtros.push([c, v]), b),
        is: (c: string, v: any) => (st.filtros.push([c, v]), b),
        maybeSingle: () => Promise.resolve({ data: { id: st.filtros.find((f: any) => f[0] === "id")?.[1], case_id: "caso1" }, error: null }),
        then: (res: any, rej: any) => {
          let r: any;
          if (st.op === "update") {
            updates.push(st);
            r = falhaUpdate
              ? { data: null, error: { message: "RLS negou" } }
              : { data: [{ id: st.filtros.find((f: any) => f[0] === "id")?.[1] }], error: null };
          } else {
            consultas.push(st);
            r = { data: publicadas.map((id) => ({ id })), error: null };
          }
          return Promise.resolve(r).then(res, rej);
        },
      };
      return b;
    },
  };
  return { client, updates, consultas };
}

describe("C7 arquivar/rebaixar perfil despublica a projeção da pessoa", () => {
  it("arquiva (sem apagar) cada projeção publicada da pessoa naquele caso, com motivo e auditoria", async () => {
    const { client, updates, consultas } = fake(["p1", "p2"]);
    const auditar = vi.fn(async (..._a: any[]) => undefined);
    const n = await despublicarProjecoesDaPessoa({
      supabase: client, organizationId: "o1", userId: "u1", caseId: "caso1", pessoaId: "pe1",
      motivo: "Perfil arquivado: erro de cadastro", auditar,
    });
    expect(n).toBe(2);
    // leitura escopada por organização, caso, pessoa e só publicadas não arquivadas
    const f = consultas[0].filtros;
    expect(f).toContainEqual(["case_id", "caso1"]);
    expect(f).toContainEqual(["pessoa_id", "pe1"]);
    expect(f).toContainEqual(["approval_status", "published"]);
    expect(f).toContainEqual(["archived_at", null]);
    expect(updates).toHaveLength(2);
    for (const u of updates) {
      expect(u.v.archived_at).toBeTruthy();
      expect(u.v.archived_reason).toBe("Perfil arquivado: erro de cadastro");
      expect(u.tabela).toBe("app_projections");
    }
    expect(auditar).toHaveBeenCalledTimes(2);
    expect(auditar.mock.calls[0][2]).toBe("projecao_app_despublicada");
    expect(registrarTimelineCaso).toHaveBeenCalledTimes(2);
  });

  it("sem projeção publicada: não escreve nada", async () => {
    const { client, updates } = fake([]);
    const n = await despublicarProjecoesDaPessoa({
      supabase: client, organizationId: "o1", userId: "u1", caseId: "c", pessoaId: "p", motivo: "m", auditar: vi.fn(),
    });
    expect(n).toBe(0);
    expect(updates).toHaveLength(0);
  });

  it("falha ao despublicar propaga (a pessoa não fica publicada em silêncio)", async () => {
    const { client } = fake(["p1"], true);
    await expect(
      despublicarProjecoesDaPessoa({ supabase: client, organizationId: "o", userId: "u", caseId: "c", pessoaId: "p", motivo: "m", auditar: vi.fn() }),
    ).rejects.toThrow();
  });

  it("arquivarRegistroG02 e rebaixamento em salvarRegistroG02 despublicam ANTES de gravar; despublicação oficial usa o mesmo caminho", () => {
    const fn = ler("pessoas-linhagens.functions.ts");
    const arq = fn.slice(fn.indexOf("export const arquivarRegistroG02"));
    expect(arq.indexOf("despublicarPessoaDoPerfil(")).toBeGreaterThan(-1);
    expect(arq.indexOf("despublicarPessoaDoPerfil(")).toBeLessThan(arq.indexOf(".update({ archived_at"));
    const salvar = fn.slice(fn.indexOf("export const salvarRegistroG02"), fn.indexOf("export const arquivarRegistroG02"));
    expect(salvar).toMatch(/"client_visibility" in valores &&\s*valores\["client_visibility"\] !== "aprovada"/);
    expect(salvar.indexOf("despublicarPessoaDoPerfil(")).toBeLessThan(salvar.indexOf("await gravarComVerificacao({\n        supabase,\n        tabela: data.tabela"));
    const oficial = ler("portal-atendimento.functions.ts");
    expect(oficial).toContain("despublicarProjecaoPorId(");
    expect(ler("projecao-app-despublicar.server.ts")).toContain('"projecao_app_despublicada"');
  });
});
