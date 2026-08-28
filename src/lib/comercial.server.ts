/**
 * Helpers server-only dos módulos Propostas, Contratos, Ordens de Serviço e Financeiro.
 *
 * Regras invioláveis (reforçadas por triggers/RLS no banco):
 * - a organização vem sempre do usuário autenticado;
 * - alteração financeira exige papel financeiro ou admin;
 * - sem exclusão física: apenas arquivamento com motivo;
 * - valor de fatura paga só muda por ajuste separado e auditado.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Sb = { from: (t: string) => any; rpc: (f: string, a?: unknown) => any };

export type Recurso = "proposals" | "contracts" | "service_orders" | "invoices" | "payments";

export const RECURSOS: Recurso[] = ["proposals", "contracts", "service_orders", "invoices", "payments"];

export const CAMPOS: Record<string, string[]> = {
  proposals: [
    "client_id",
    "lead_id",
    "case_id",
    "versao",
    "status",
    "valor",
    "moeda",
    "escopo",
    "exclusoes",
    "forma_pagamento",
    "validade",
    "observacoes_internas",
    "observacoes_cliente",
  ],
  invoices: [
    "client_id",
    "case_id",
    "proposal_id",
    "numero",
    "descricao",
    "valor",
    "moeda",
    "vencimento",
    "status",
    "referencia_externa",
    "conciliacao_status",
  ],
  payments: [
    "invoice_id",
    "valor",
    "moeda",
    "vencimento",
    "pago_em",
    "metodo",
    "status",
    "referencia_externa",
    "conciliacao_status",
  ],
};

export function limpar(recurso: string, dados: Record<string, unknown>) {
  const saida: Record<string, unknown> = {};
  for (const chave of CAMPOS[recurso] ?? []) {
    const v = dados[chave];
    if (v === undefined) continue;
    saida[chave] = v === "" ? null : v;
  }
  return saida;
}

export async function contextoInterno(supabase: Sb, userId: string) {
  const { data, error } = await supabase
    .from("staff_access")
    .select("organization_id,role,status")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data && data.status === "active") {
    return { organizationId: data.organization_id as string, papel: data.role as string };
  }
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  if (!membro.data?.organization_id) throw new Error("Acesso interno não autorizado.");
  const papeis = await supabase
    .from("user_roles")
    .select("role")
    .eq("organization_id", membro.data.organization_id);
  const lista = ((papeis.data ?? []) as { role: string }[]).map((p) => p.role);
  return {
    organizationId: membro.data.organization_id as string,
    papel: lista.includes("admin") ? "admin" : (lista[0] ?? "leitura"),
  };
}

export function exigirPapel(papel: string, permitidos: string[], mensagem: string) {
  if (!permitidos.includes(papel)) throw new Error(mensagem);
}

export const PAPEIS_COMERCIAL = ["admin", "comercial", "operacoes"];
export const PAPEIS_FINANCEIRO = ["admin", "financeiro"];

/** Perfis internos autorizados a visualizar registros DEMO/TESTE com selo. */
export const PAPEIS_DEMO_VISIVEL = ["admin", "operacoes", "financeiro"];

/** Recursos que carregam a marca técnica de origem no próprio registro. */
export const TEM_MARCA_TESTE: string[] = ["proposals", "invoices", "payments", "service_orders"];

export { FLUXO, validarFluxo } from "@/lib/comercial-fluxo";
