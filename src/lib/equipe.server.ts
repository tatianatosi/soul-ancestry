/**
 * Helpers server-only da autenticação da EQUIPE INTERNA.
 *
 * Regras invioláveis:
 * - equipe usa e-mail + senha do Supabase Auth; nenhuma senha, hash ou token
 *   é gravado em tabelas próprias;
 * - não existe auto-cadastro: somente admin convida;
 * - papel e organização são derivados no servidor a partir de staff_access;
 * - nenhuma resposta revela se um e-mail pertence à equipe;
 * - auditoria com metadados mínimos: nunca senha, token ou URL de redefinição.
 */
import { createHash } from "crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { chavePublicavelDoServidor, urlDoServidor } from "./config-servidor";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const adminClient = supabaseAdmin as any;

export type PapelEquipe = "admin" | "operacoes" | "pesquisador" | "comercial" | "financeiro" | "leitura";
export type StatusEquipe = "invited" | "active" | "suspended" | "revoked";

export const PAPEIS: PapelEquipe[] = [
  "admin",
  "operacoes",
  "pesquisador",
  "comercial",
  "financeiro",
  "leitura",
];

export function normalizarEmail(email: string) {
  return String(email ?? "").trim().toLowerCase();
}

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function senhaValida(senha: string) {
  return typeof senha === "string" && senha.length >= 12 && /[A-Za-z]/.test(senha) && /[0-9]/.test(senha);
}

/** Identificador embaralhado: o e-mail nunca é gravado em texto no controle de tentativas. */
function hashAssunto(valor: string) {
  return createHash("sha256")
    .update(`${urlDoServidor()}::${normalizarEmail(valor)}`)
    .digest("hex");
}

/** Rate limit simples por escopo (login / recuperação). */
export async function limiteExcedido(scope: string, assunto: string, maximo: number, minutos: number) {
  const desde = new Date(Date.now() - minutos * 60_000).toISOString();
  const subject_hash = hashAssunto(assunto);
  const { count } = await adminClient
    .from("auth_throttle")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .eq("subject_hash", subject_hash)
    .gte("occurred_at", desde);
  if ((count ?? 0) >= maximo) return true;
  await adminClient.from("auth_throttle").insert({ scope, subject_hash });
  return false;
}

/**
 * Leitura do limite SEM consumir tentativa. Usado no login: só a FALHA conta,
 * porque contar todo acesso trancava a própria proprietária depois de poucos
 * logins legítimos. Devolve também quantos segundos faltam para liberar.
 */
export async function estadoLimite(scope: string, assunto: string, maximo: number, minutos: number) {
  const desde = new Date(Date.now() - minutos * 60_000).toISOString();
  const subject_hash = hashAssunto(assunto);
  const { data } = await adminClient
    .from("auth_throttle")
    .select("occurred_at")
    .eq("scope", scope)
    .eq("subject_hash", subject_hash)
    .gte("occurred_at", desde)
    .order("occurred_at", { ascending: true });
  const linhas: { occurred_at: string }[] = data ?? [];
  if (linhas.length < maximo) return { bloqueado: false, liberaEmSegundos: 0 };
  const maisAntiga = new Date(linhas[0]!.occurred_at).getTime();
  const restante = Math.max(0, Math.ceil((maisAntiga + minutos * 60_000 - Date.now()) / 1000));
  return { bloqueado: true, liberaEmSegundos: restante };
}

/** Registra uma tentativa malsucedida. */
export async function registrarTentativa(scope: string, assunto: string) {
  await adminClient.from("auth_throttle").insert({ scope, subject_hash: hashAssunto(assunto) });
}

/** Login concluído: zera o contador para não punir o uso normal. */
export async function limparTentativas(scope: string, assunto: string) {
  await adminClient
    .from("auth_throttle")
    .delete()
    .eq("scope", scope)
    .eq("subject_hash", hashAssunto(assunto));
}


export async function registrarAuditoria(params: {
  organizationId: string;
  userId?: string | null;
  acao: string;
  entidadeId?: string | null;
  metadados?: Record<string, unknown>;
}) {
  await adminClient.from("audit_logs").insert({
    organization_id: params.organizationId,
    user_id: params.userId ?? null,
    acao: params.acao,
    entidade: "staff_access",
    entidade_id: params.entidadeId ?? null,
    metadados: params.metadados ?? {},
  });
}

export async function staffPorEmail(email: string) {
  const { data } = await adminClient
    .from("staff_access")
    .select("id, organization_id, auth_user_id, email, full_name, role, status, invitation_expires_at, archived_at")
    .eq("email", normalizarEmail(email))
    .is("archived_at", null)
    .limit(1);
  return (data ?? [])[0] ?? null;
}

export async function staffPorUsuario(userId: string) {
  const { data } = await adminClient
    .from("staff_access")
    .select("id, organization_id, auth_user_id, email, full_name, role, status, archived_at")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .limit(1);
  return (data ?? [])[0] ?? null;
}

/**
 * A própria linha de permissão, lida com o token de quem está entrando.
 *
 * 26/08/2026 — a autorização dependia inteiramente da chave secreta. Quando a
 * chave do ambiente pertencia a outro projeto, ninguém conseguia entrar: o
 * servidor não tinha como ler `staff_access` e concluía "sem vínculo" para uma
 * conta que existe e está ativa.
 *
 * Mas ler a PRÓPRIA linha nunca precisou de service role: a política
 * `staff_select_self` (`auth_user_id = auth.uid()`) já autoriza exatamente
 * isso. Este caminho usa o cliente do próprio usuário, com RLS ligado — o
 * banco continua sendo quem decide o que ela pode ver, e ela só enxerga a
 * própria linha.
 *
 * Não é um afrouxamento: a mesma informação, obtida de uma fonte que não exige
 * segredo. O token tem de ser válido e emitido pelo projeto declarado.
 */
export async function staffPorUsuarioComRls(clienteDoUsuario: any, userId: string) {
  const { data } = await clienteDoUsuario
    .from("staff_access")
    .select("id, organization_id, auth_user_id, email, full_name, role, status, archived_at")
    .eq("auth_user_id", userId)
    .is("archived_at", null)
    .limit(1);
  return (data ?? [])[0] ?? null;
}

/**
 * Executa um efeito colateral administrativo sem deixá-lo derrubar o login.
 *
 * Registrar auditoria, carimbar `last_login_at` e sincronizar papéis são
 * consequências de entrar, não condições para entrar. Enquanto a chave secreta
 * do ambiente não servir, elas falham — e quem falha não pode ser a porta.
 */
export async function efeitoAdministrativo(rotulo: string, acao: () => Promise<unknown>) {
  try {
    await acao();
    return true;
  } catch (e) {
    console.error(`[equipe] efeito administrativo ignorado (${rotulo}):`, e);
    return false;
  }
}

/** Sincroniza vínculo e papel a partir de staff_access (nunca do front-end). */
export async function sincronizarVinculo(staff: any, userId: string) {
  const membership = await adminClient
    .from("organization_members")
    .upsert(
      { organization_id: staff.organization_id, user_id: userId, archived_at: null },
      { onConflict: "organization_id,user_id" },
    );
  if (membership.error) throw new Error(membership.error.message);

  // 27/10/2026 (item 2 da auditoria pré-lançamento, autorizado): sem exclusão
  // física de papel (AGENTS.md) — arquiva em vez de apagar a linha.
  const papeisRemovidos = await adminClient
    .from("user_roles")
    .update({ archived_at: new Date().toISOString() })
    .eq("organization_id", staff.organization_id)
    .eq("user_id", userId)
    .neq("role", staff.role)
    .is("archived_at", null);
  if (papeisRemovidos.error) throw new Error(papeisRemovidos.error.message);

  const papel = await adminClient
    .from("user_roles")
    .upsert(
      { organization_id: staff.organization_id, user_id: userId, role: staff.role, archived_at: null },
      { onConflict: "organization_id,user_id,role" },
    );
  if (papel.error) throw new Error(papel.error.message);

  const perfil = await adminClient
    .from("profiles")
    .upsert({ id: userId, email: staff.email, nome: staff.full_name }, { onConflict: "id" });
  if (perfil.error) throw new Error(perfil.error.message);
}

/** Remove vínculos operacionais quando o acesso deixa de estar ativo. */
export async function revogarVinculo(staff: any) {
  if (!staff.auth_user_id) return;
  // 27/10/2026: idem — arquiva (archived_at), nunca apaga a linha.
  await adminClient
    .from("user_roles")
    .update({ archived_at: new Date().toISOString() })
    .eq("organization_id", staff.organization_id)
    .eq("user_id", staff.auth_user_id)
    .is("archived_at", null);
}

/** Cliente publishable no servidor: usado só para disparar e-mails de autenticação. */
export function clientePublico() {
  const key = chavePublicavelDoServidor();
  return createClient(urlDoServidor(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: any, init: any) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Exige admin de equipe ativo. Organização derivada do banco. */
export async function exigirAdminEquipe(userId: string) {
  const staff = await staffPorUsuario(userId);
  if (!staff || staff.status !== "active") throw new Error("Acesso não autorizado.");
  if (staff.role !== "admin") throw new Error("Apenas administradores podem gerenciar a equipe.");
  return staff;
}
