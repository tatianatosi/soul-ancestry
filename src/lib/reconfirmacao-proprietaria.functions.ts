/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Reconfirmação de propriedade e recuperação de acesso administrativo.
 *
 * Fluxo em duas etapas, sempre iniciado por decisão humana autenticada:
 *  1. `diagnosticoAcessoProprietaria` — lê o retrato real do banco e devolve o
 *     checklist de integridade (conta única, organização ativa, vínculo, papel
 *     admin e cadastro de equipe).
 *  2. `reconfirmarPropriedade` — só executa para o e-mail canônico da
 *     proprietária, exige a digitação do e-mail e um motivo, restaura os
 *     registros logicamente arquivados/ausentes e grava auditoria.
 *
 * Nenhuma ação externa é disparada aqui: apenas restauração interna de vínculo,
 * papel e cadastro de equipe da própria conta autenticada.
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  EMAIL_PROPRIETARIA,
  ORGANIZACAO_CANONICA_ID,
  ORGANIZACAO_CANONICA_SLUG,
  verificarAcessoProprietaria,
  type RetratoAcesso,
  type ResultadoVerificacao,
} from "@/lib/verificacao-acesso-proprietaria";

export const MOTIVO_MINIMO_RECONFIRMACAO = 12;

function normalizar(valor: unknown) {
  return String(valor ?? "").trim().toLowerCase();
}

async function emailAutenticado(context: any): Promise<string> {
  const claim = normalizar(context?.claims?.email);
  if (claim) return claim;
  const { data } = await context.supabase.auth.getUser();
  return normalizar(data?.user?.email);
}

async function lerRetrato(admin: any, email: string): Promise<RetratoAcesso> {
  const { data: perfisAuth } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const perfis = (perfisAuth?.users ?? [])
    .filter((u: any) => normalizar(u.email) === email)
    .map((u: any) => ({ id: u.id as string, email: normalizar(u.email) }));

  const userIds = perfis.map((p: { id: string }) => p.id);

  const [{ data: organizacao }, { data: memberships }, { data: papeis }, { data: staff }] = await Promise.all([
    admin
      .from("organizations")
      .select("id,slug,archived_at")
      .eq("id", ORGANIZACAO_CANONICA_ID)
      .maybeSingle(),
    userIds.length
      ? admin.from("organization_members").select("organization_id,user_id,archived_at").in("user_id", userIds)
      : Promise.resolve({ data: [] }),
    userIds.length
      ? admin.from("user_roles").select("organization_id,user_id,role").in("user_id", userIds)
      : Promise.resolve({ data: [] }),
    admin
      .from("staff_access")
      .select("organization_id,auth_user_id,status,role,archived_at,email")
      .eq("organization_id", ORGANIZACAO_CANONICA_ID)
      .ilike("email", email),
  ]);

  return {
    perfis,
    organizacao: (organizacao as any) ?? null,
    memberships: (memberships as any) ?? [],
    papeis: (papeis as any) ?? [],
    staff: (staff as any) ?? [],
  };
}

export type DiagnosticoAcesso = ResultadoVerificacao & {
  email: string;
  elegivel: boolean;
  organizacao: { id: string; slug: string } | null;
};

/** Leitura do estado real de propriedade e acesso administrativo. */
export const diagnosticoAcessoProprietaria = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DiagnosticoAcesso> => {
    const email = await emailAutenticado(context);
    const elegivel = email === EMAIL_PROPRIETARIA;
    if (!elegivel) {
      return {
        email,
        elegivel: false,
        aprovado: false,
        userId: null,
        itens: [
          {
            chave: "conta_proprietaria",
            titulo: "Conta autenticada é a proprietária canônica",
            aprovado: false,
            detalhe: "esta conta não é a proprietária administradora registrada",
          },
        ],
        organizacao: null,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const retrato = await lerRetrato(supabaseAdmin as any, email);
    const resultado = verificarAcessoProprietaria(retrato);
    return {
      ...resultado,
      email,
      elegivel: true,
      organizacao: retrato.organizacao
        ? { id: retrato.organizacao.id, slug: retrato.organizacao.slug }
        : null,
    };
  });

export type ResultadoReconfirmacao = {
  ok: boolean;
  reparos: string[];
  diagnostico: ResultadoVerificacao;
};

/**
 * Reconfirma a propriedade e restaura o acesso administrativo integral da
 * própria conta autenticada, com motivo obrigatório e auditoria.
 */
export const reconfirmarPropriedade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { emailConfirmado: string; motivo: string }) => {
    const emailConfirmado = normalizar(input?.emailConfirmado);
    const motivo = String(input?.motivo ?? "").trim();
    if (!emailConfirmado) throw new Error("Digite o e-mail da proprietária para confirmar.");
    if (motivo.length < MOTIVO_MINIMO_RECONFIRMACAO) {
      throw new Error(`Descreva o motivo com pelo menos ${MOTIVO_MINIMO_RECONFIRMACAO} caracteres.`);
    }
    return { emailConfirmado, motivo };
  })
  .handler(async ({ data, context }): Promise<ResultadoReconfirmacao> => {
    const email = await emailAutenticado(context);
    if (email !== EMAIL_PROPRIETARIA) {
      throw new Error("Apenas a proprietária administradora pode reconfirmar a propriedade.");
    }
    if (data.emailConfirmado !== email) {
      throw new Error("O e-mail digitado não confere com a conta autenticada.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as any;
    const userId = context.userId as string;
    const reparos: string[] = [];
    const agora = new Date().toISOString();

    // 1. organização canônica ativa
    const { data: org } = await admin
      .from("organizations")
      .select("id,slug,archived_at")
      .eq("id", ORGANIZACAO_CANONICA_ID)
      .maybeSingle();
    if (!org) throw new Error("Organização canônica não encontrada.");
    if (org.archived_at) {
      await admin
        .from("organizations")
        .update({ archived_at: null, archived_by: null })
        .eq("id", ORGANIZACAO_CANONICA_ID);
      reparos.push("Organização Clube Ancestral restaurada (arquivamento lógico removido).");
    }
    if (org.slug !== ORGANIZACAO_CANONICA_SLUG) {
      reparos.push(`Atenção: slug divergente (${org.slug}).`);
    }

    // 2. vínculo ativo
    const { data: membership } = await admin
      .from("organization_members")
      .select("id,archived_at")
      .eq("organization_id", ORGANIZACAO_CANONICA_ID)
      .eq("user_id", userId)
      .maybeSingle();
    if (!membership) {
      await admin
        .from("organization_members")
        .insert({ organization_id: ORGANIZACAO_CANONICA_ID, user_id: userId });
      reparos.push("Vínculo com a organização recriado.");
    } else if (membership.archived_at) {
      await admin
        .from("organization_members")
        .update({ archived_at: null, archived_by: null, archive_motivo: null })
        .eq("id", membership.id);
      reparos.push("Vínculo com a organização reativado.");
    }

    // 3. papel admin
    const { data: papeis } = await admin
      .from("user_roles")
      .select("role")
      .eq("organization_id", ORGANIZACAO_CANONICA_ID)
      .eq("user_id", userId);
    if (!(papeis ?? []).some((p: any) => p.role === "admin")) {
      await admin
        .from("user_roles")
        .insert({ organization_id: ORGANIZACAO_CANONICA_ID, user_id: userId, role: "admin" });
      reparos.push("Papel admin concedido na organização.");
    }

    // 4. cadastro de equipe ativo
    const { data: staff } = await admin
      .from("staff_access")
      .select("id,status,role,archived_at,activated_at")
      .eq("organization_id", ORGANIZACAO_CANONICA_ID)
      .ilike("email", email)
      .maybeSingle();
    if (!staff) {
      await admin.from("staff_access").insert({
        organization_id: ORGANIZACAO_CANONICA_ID,
        auth_user_id: userId,
        email,
        full_name: "Proprietária Administradora",
        role: "admin",
        status: "active",
        activated_at: agora,
      });
      reparos.push("Cadastro de equipe criado como admin ativo.");
    } else if (staff.status !== "active" || staff.role !== "admin" || staff.archived_at) {
      await admin
        .from("staff_access")
        .update({
          auth_user_id: userId,
          role: "admin",
          status: "active",
          activated_at: staff.activated_at ?? agora,
          suspended_at: null,
          revoked_at: null,
          archived_at: null,
          archived_by: null,
          archive_reason: null,
          updated_by: userId,
        })
        .eq("id", staff.id);
      reparos.push("Cadastro de equipe reativado como admin.");
    }

    // 5. auditoria (sempre, mesmo sem reparo)
    await admin.from("audit_logs").insert({
      organization_id: ORGANIZACAO_CANONICA_ID,
      user_id: userId,
      acao: "propriedade_reconfirmada",
      entidade: "organizations",
      entidade_id: ORGANIZACAO_CANONICA_ID,
      metadados: {
        email,
        motivo: data.motivo,
        reparos,
        origem: "fluxo_reconfirmacao_proprietaria",
      },
    });

    const retrato = await lerRetrato(admin, email);
    return { ok: true, reparos, diagnostico: verificarAcessoProprietaria(retrato) };
  });
