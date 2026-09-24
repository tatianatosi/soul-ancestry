import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

/*
 * Integração real — isolamento entre dois clientes autenticados (A e B).
 *
 * Roda contra o banco conectado, com RLS de verdade, usando as sessões de
 * dois clientes SINTÉTICOS de homologação. Não cria usuário, não envia magic
 * link, não grava nada: só lê com o token de cada um.
 *
 * Variáveis (nunca commitar valores; nunca usar service_role):
 *   VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY
 *   CA_TESTE_CLIENTE_A_TOKEN, CA_TESTE_CLIENTE_B_TOKEN  (access_token de cada sessão)
 * Sem elas o teste é pulado e aparece como "skipped" — nunca como aprovado.
 */

const URL = process.env["VITE_SUPABASE_URL"];
const CHAVE = process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
const TOKEN_A = process.env["CA_TESTE_CLIENTE_A_TOKEN"];
const TOKEN_B = process.env["CA_TESTE_CLIENTE_B_TOKEN"];
const pronto = Boolean(URL && CHAVE && TOKEN_A && TOKEN_B);

function sessao(token: string): SupabaseClient {
  return createClient(URL!, CHAVE!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/** Tabelas que o App Cliente lê, com a coluna que liga ao caso. */
const LEITURAS = [
  { tabela: "client_portal_case_access", coluna: "case_id" },
  { tabela: "crm_casos", coluna: "id" },
  { tabela: "app_projections", coluna: "case_id" },
  { tabela: "client_deliverables", coluna: "case_id" },
  { tabela: "portal_tickets", coluna: "case_id" },
  { tabela: "portal_document_requests", coluna: "case_id" },
] as const;

async function casosVisiveis(c: SupabaseClient, tabela: string, coluna: string): Promise<Set<string>> {
  const { data, error } = await c.from(tabela).select(coluna).limit(1000);
  if (error) throw new Error(`${tabela}: ${error.message}`);
  return new Set(((data ?? []) as unknown as Record<string, string | null>[]).map((r) => r[coluna]).filter(Boolean) as string[]);
}

describe.skipIf(!pronto)("isolamento A × B com duas sessões autenticadas", () => {
  const a = pronto ? sessao(TOKEN_A!) : (null as unknown as SupabaseClient);
  const b = pronto ? sessao(TOKEN_B!) : (null as unknown as SupabaseClient);

  it("A e B são pessoas diferentes", async () => {
    const [ua, ub] = await Promise.all([a.auth.getUser(TOKEN_A), b.auth.getUser(TOKEN_B)]);
    expect(ua.data.user?.id).toBeTruthy();
    expect(ub.data.user?.id).toBeTruthy();
    expect(ua.data.user?.id).not.toBe(ub.data.user?.id);
  });

  for (const { tabela, coluna } of LEITURAS) {
    it(`${tabela}: nenhum caso visível às duas sessões`, async () => {
      const [ca, cb] = await Promise.all([casosVisiveis(a, tabela, coluna), casosVisiveis(b, tabela, coluna)]);
      const comum = [...ca].filter((id) => cb.has(id));
      expect(comum).toEqual([]);
    });
  }

  it("B não lê o caso de A mesmo pedindo pelo id (e vice-versa)", async () => {
    const [ca, cb] = await Promise.all([
      casosVisiveis(a, "client_portal_case_access", "case_id"),
      casosVisiveis(b, "client_portal_case_access", "case_id"),
    ]);
    for (const [leitor, alvos] of [
      [b, ca],
      [a, cb],
    ] as const) {
      for (const id of alvos) {
        const { data } = await leitor.from("crm_casos").select("id").eq("id", id);
        expect(data ?? []).toEqual([]);
        const { data: proj } = await leitor.from("app_projections").select("id").eq("case_id", id);
        expect(proj ?? []).toEqual([]);
      }
    }
  });
});

describe("isolamento A × B — pré-condição", () => {
  it("sem as duas sessões sintéticas o teste de integração fica pulado, nunca aprovado", () => {
    if (!pronto) expect(TOKEN_A && TOKEN_B).toBeFalsy();
    else expect(TOKEN_A).not.toBe(TOKEN_B);
  });
});
