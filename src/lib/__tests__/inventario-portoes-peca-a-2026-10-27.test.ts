import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { inventarioDePortoesDoCaso, portoesDoPilotoDoCaso } from "@/lib/inventario-portoes.server";

/**
 * Peça A do laudo "nada persiste" (#189, 27/10/2026) — decisão da
 * Proprietária: "deve ser construída todas as peças não só no caso 360".
 *
 * Leitor único (`inventarioDePortoesDoCaso`) reusado em mais de uma tela —
 * não só o Caso 360 — mesmo princípio de etapas-caso.ts (uma fonte, vários
 * consumidores). `portoesDoPilotoDoCaso` é role-aware: desde 25/10/2026
 * `fn_piloto_caso_guard` cede a `fn_proprietaria_operando()`, então o
 * mesmo bloqueio de `piloto_bloqueios` só recusa de fato quem não está
 * logado como admin ativo.
 */
describe("Peça A — inventário de portões, usado em mais de uma tela", () => {
  it("o leitor é consumido pelo Caso 360 e pela Lista de Casos, não só por um", () => {
    const fichaCaso = readFileSync("src/lib/caso-ficha.functions.ts", "utf8");
    const listaCasos = readFileSync("src/lib/casos-ativacao.functions.ts", "utf8");
    expect(fichaCaso).toContain('from "@/lib/inventario-portoes.server"');
    expect(listaCasos).toContain('from "@/lib/inventario-portoes.server"');
    expect(fichaCaso).toContain("portoesDoPilotoDoCaso(");
    expect(listaCasos).toContain("portoesDoPilotoDoCaso(");
  });

  /**
   * Stub de query encadeável: .eq()/.is() devolvem o mesmo objeto (aceita
   * qualquer profundidade de encadeamento, como o cliente real do
   * Supabase), e .maybeSingle() resolve com `single`. O array final (não
   * resolvido por .maybeSingle) é o próprio stub, então `await` sobre ele
   * funciona porque arrays não são thenable — por isso devolvemos uma
   * Promise já resolvida com `{ data }` no ponto terminal real (.is()).
   */
  function queryEncadeavel(data: unknown, single?: unknown) {
    const stub: Record<string, unknown> = {
      eq: () => stub,
      is: () => Promise.resolve({ data }),
      maybeSingle: () => Promise.resolve({ data: single }),
    };
    return stub;
  }

  it("portoesDoPilotoDoCaso só retorna algo para caso piloto, e nunca para caso sem piloto=true", async () => {
    const chamadas: string[] = [];
    const supabase = {
      from: (tabela: string) => {
        chamadas.push(tabela);
        return {
          select: () =>
            queryEncadeavel([{ chave: "contrato", descricao: "x", criticidade: "critico" }], {
              piloto: false,
            }),
        };
      },
      rpc: async () => ({ data: [] }),
    };
    const resultado = await portoesDoPilotoDoCaso(supabase as never, "caso-1", false);
    expect(resultado).toEqual([]);
    expect(chamadas).toContain("crm_casos");
    expect(chamadas).not.toContain("piloto_bloqueios");
  });

  it("role-aware: o mesmo portão de piloto_bloqueios bloqueia quem não é a Proprietária e cede para quem é", async () => {
    const bloqueioRaw = {
      chave: "contrato_assinado",
      descricao: "Contrato assinado com registro externo",
      criticidade: "critico",
    };
    const supabase = {
      from: (tabela: string) => ({
        select: () =>
          tabela === "crm_casos"
            ? queryEncadeavel(null, { piloto: true })
            : queryEncadeavel([bloqueioRaw]),
      }),
      rpc: async () => ({ data: [] }),
    };
    const paraOutroPapel = await portoesDoPilotoDoCaso(supabase as never, "caso-1", false);
    const paraProprietaria = await portoesDoPilotoDoCaso(supabase as never, "caso-1", true);
    expect(paraOutroPapel[0]?.bloqueiaAtivacaoHoje).toBe(true);
    expect(paraProprietaria[0]?.bloqueiaAtivacaoHoje).toBe(false);
    // Mesmo portão, mesma descrição — só a avaliação de quem está logado muda.
    expect(paraOutroPapel[0]?.protege).toBe(bloqueioRaw.descricao);
    expect(paraProprietaria[0]?.protege).toBe(bloqueioRaw.descricao);
  });

  it("os itens de case_ativacao_bloqueios_reais ficam com bloqueiaAtivacaoHoje: null (não verificado contra o guard real)", async () => {
    const supabase = {
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { piloto: false } }) }) }),
      }),
      rpc: async () => ({
        data: [
          {
            regra: "checklist_ativacao_14_itens",
            dominio: "operacional",
            motivo: "x",
            tabela_campo: "y",
            valor_atual: "z",
            cta_tela: null,
          },
        ],
      }),
    };
    const resultado = await inventarioDePortoesDoCaso(supabase as never, "caso-1", "user-1");
    expect(resultado).toHaveLength(1);
    expect(resultado[0]?.bloqueiaAtivacaoHoje).toBeNull();
  });
});
