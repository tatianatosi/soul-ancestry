/**
 * Helpers server-only do Portal do Cliente.
 *
 * Regras invioláveis:
 * - cliente não tem senha e não cria conta: só entra por link mágico enviado
 *   a e-mail previamente autorizado pela equipe;
 * - autenticar NÃO é autorizar: toda leitura exige vínculo ativo em
 *   client_portal_access + caso autorizado + liberação do caso (validado por RLS);
 * - nenhuma resposta pública revela se um e-mail existe;
 * - nenhum token/magic link é gravado em banco ou log.
 */
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/* eslint-disable @typescript-eslint/no-explicit-any */
const admin = supabaseAdmin as any;

export type NivelAcesso = "proposal_portal" | "client_workspace";
export type StatusAcesso = "pending" | "invited" | "active" | "suspended" | "revoked" | "expired";

const PAPEIS_GESTAO = ["admin", "operacoes"];

export function normalizarEmail(email: string) {
  return String(email ?? "").trim().toLowerCase();
}

export function emailValido(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Cliente publishable no servidor: usado só para disparar o e-mail do link mágico. */
function clientePublico() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
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

export async function registrarEvento(params: {
  organizationId: string;
  acessoId?: string | null;
  authUserId?: string | null;
  actorUserId?: string | null;
  tipo: string;
  metadata?: Record<string, unknown>;
}) {
  await admin.from("client_access_events").insert({
    organization_id: params.organizationId,
    client_portal_access_id: params.acessoId ?? null,
    auth_user_id: params.authUserId ?? null,
    actor_user_id: params.actorUserId ?? null,
    event_type: params.tipo,
    metadata: params.metadata ?? {},
  });
}

export async function registrarAuditoria(params: {
  organizationId: string;
  userId?: string | null;
  acao: string;
  entidadeId?: string | null;
  metadados?: Record<string, unknown>;
}) {
  await admin.from("audit_logs").insert({
    organization_id: params.organizationId,
    user_id: params.userId ?? null,
    acao: params.acao,
    entidade: "client_portal_access",
    entidade_id: params.entidadeId ?? null,
    metadados: params.metadados ?? {},
  });
}

/** Organização do usuário interno + validação de papel de gestão de acessos. */
export async function exigirGestor(supabase: any, userId: string) {
  const membro = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .is("archived_at", null)
    .maybeSingle();
  const organizationId = membro.data?.organization_id as string | undefined;
  if (!organizationId) throw new Error("Organização não encontrada para este usuário.");

  const papeis = await supabase.from("user_roles").select("role").eq("organization_id", organizationId);
  const lista = ((papeis.data ?? []) as { role: string }[]).map((p) => p.role);
  const gestor = lista.some((p) => PAPEIS_GESTAO.includes(p));
  if (!gestor) throw new Error("Apenas admin e operações podem gerenciar acessos ao portal.");
  return { organizationId, papeis: lista, userId };
}

/** Garante um usuário de auth para o e-mail autorizado (sem senha). */
export async function garantirUsuarioAuth(email: string): Promise<string | null> {
  const criado = await admin.auth.admin.createUser({ email, email_confirm: true });
  if (criado?.data?.user?.id) return criado.data.user.id as string;
  // já existe: localizar
  const lista = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const achado = (lista?.data?.users ?? []).find(
    (u: any) => normalizarEmail(u.email ?? "") === normalizarEmail(email),
  );
  return achado?.id ?? null;
}

/**
 * Envia o link mágico. Nunca revela se o e-mail existe.
 *
 * 16/09/2026 — a falha do provedor era silenciada e a tela dizia "enviado"
 * mesmo quando nenhum e-mail saía. Agora a falha sobe para quem chamou.
 */
export async function enviarLinkMagico(email: string, redirectTo: string) {
  const publico = clientePublico();
  const { error } = await publico.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: redirectTo },
  });
  if (error) throw new Error(error.message);
}

/** Casos efetivamente liberados para um acesso do portal. */
export async function casosLiberados(acessoId: string): Promise<number> {
  const { data } = await admin
    .from("client_portal_case_access")
    .select("id")
    .eq("client_portal_access_id", acessoId)
    .is("revoked_at", null)
    .eq("access_status", "active");
  return (data ?? []).length;
}

export async function acessoPorEmail(email: string) {
  const { data } = await admin
    .from("client_portal_access")
    .select(
      "id, organization_id, client_id, email, access_status, access_level, invitation_expires_at, auth_user_id, first_authenticated_at, magic_link_uses, magic_link_max_uses, magic_link_expires_at",
    )
    .eq("email", normalizarEmail(email))
    .is("archived_at", null)
    .limit(1);
  return (data ?? [])[0] ?? null;
}


export function acessoUtilizavel(acesso: any) {
  if (!acesso) return false;
  if (!["invited", "active", "pending"].includes(acesso.access_status)) return false;
  if (
    acesso.access_status !== "active" &&
    acesso.invitation_expires_at &&
    new Date(acesso.invitation_expires_at).getTime() < Date.now()
  ) {
    return false;
  }
  return true;
}

export { admin as adminClient };

/**
 * Revalidação canônica de elegibilidade no servidor.
 * Usada na criação, no reenvio e na reativação — nunca confia no payload do front.
 * Retorna a lista de motivos de bloqueio (vazia = elegível).
 */
export async function revalidarElegibilidade(
  supabase: any,
  organizationId: string,
  params: { clientId: string; nivel: "proposal_portal" | "client_workspace"; casoId?: string | null; autorizacaoId?: string | null },
): Promise<string[]> {
  const motivos: string[] = [];

  if (params.autorizacaoId) {
    const a = await supabase
      .from("authorized_portal_emails")
      .select("id, status, archived_at, nivel_pretendido, client_id, case_id")
      .eq("id", params.autorizacaoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    const auth = a.data;
    if (!auth || auth.archived_at) motivos.push("Autorização de e-mail inexistente ou arquivada.");
    else {
      if (auth.status !== "aprovado") motivos.push("E-mail autorizado não está aprovado.");
      if (auth.nivel_pretendido !== params.nivel) motivos.push("Autorização não cobre o nível de acesso.");
      if (auth.client_id !== params.clientId) motivos.push("Autorização pertence a outra pessoa.");
      if (params.casoId && auth.case_id && auth.case_id !== params.casoId) {
        motivos.push("Autorização é específica de outro caso.");
      }
    }
  }

  if (params.nivel === "client_workspace") {
    if (!params.casoId) {
      motivos.push("Espaço do cliente exige um caso associado.");
    } else {
      const r = await supabase
        .from("crm_casos")
        .select(
          "id, cliente_id, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, onboarding_iniciado_em, archived_at",
        )
        .eq("id", params.casoId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      const caso = r.data;
      if (!caso || caso.archived_at) motivos.push("Caso inexistente ou arquivado nesta organização.");
      else {
        if (caso.cliente_id !== params.clientId) motivos.push("Caso não pertence a esta pessoa.");
        if (!caso.contrato_assinado) motivos.push("Contrato pendente.");
        if (!caso.pagamento_confirmado) motivos.push("Pagamento pendente.");
        if (!caso.documentos_minimos_ok) motivos.push("Documentos mínimos pendentes.");
        if (!caso.ativado_em && !caso.onboarding_iniciado_em) motivos.push("Falta decisão humana de ativação.");
      }
    }
  }

  if (params.nivel === "proposal_portal") {
    const p = await supabase
      .from("proposals")
      .select("id, status, archived_at, client_id, case_id")
      .eq("organization_id", organizationId)
      .eq("client_id", params.clientId)
      .is("archived_at", null);
    const validas = ((p.data ?? []) as any[]).filter((x) =>
      ["enviada", "enviado", "aprovada", "aprovado"].includes(String(x.status ?? "").toLowerCase()),
    );
    if (validas.length === 0) motivos.push("Nenhuma proposta enviada ou aprovada e não arquivada para esta pessoa.");
  }

  return motivos;
}
