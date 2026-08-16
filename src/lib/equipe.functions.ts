import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

function origem() {
  const o = getRequestHeader("origin");
  if (o) return o;
  const host = getRequestHeader("host");
  return host ? `https://${host}` : "";
}

/** Rate limit de login. Resposta neutra: não revela existência de conta. */
export const prepararLoginEquipe = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const h = await import("./equipe.server");
    const email = h.normalizarEmail(data.email);
    if (!h.emailValido(email)) return { bloqueado: false };
    const bloqueado = await h.limiteExcedido("staff_login", email, 8, 15);
    return { bloqueado };
  });

/** Pós-login: autenticar não é autorizar. Valida staff_access ativo e deriva papel/organização. */
export const confirmarSessaoEquipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const h = await import("./equipe.server");
    const userId = context.userId as string;
    const email = h.normalizarEmail((context as any).claims?.email ?? "");

    let staff = await h.staffPorUsuario(userId);
    if (!staff && email) {
      const porEmail = await h.staffPorEmail(email);
      if (porEmail && (porEmail.auth_user_id === null || porEmail.auth_user_id === userId)) {
        await h.adminClient.from("staff_access").update({ auth_user_id: userId }).eq("id", porEmail.id);
        staff = { ...porEmail, auth_user_id: userId };
      }
    }

    if (!staff) return { autorizado: false as const, motivo: "sem_vinculo" };

    if (staff.status !== "active") {
      if (staff.status === "invited") {
        // primeiro acesso após definir a senha pelo link de convite
        await h.adminClient
          .from("staff_access")
          .update({ status: "active", activated_at: new Date().toISOString(), auth_user_id: userId })
          .eq("id", staff.id);
        await h.registrarAuditoria({
          organizationId: staff.organization_id,
          userId,
          acao: "equipe_conta_ativada",
          entidadeId: staff.id,
        });
        staff = { ...staff, status: "active" };
      } else {
        await h.registrarAuditoria({
          organizationId: staff.organization_id,
          userId,
          acao: "equipe_falha_autorizacao",
          entidadeId: staff.id,
          metadados: { status: staff.status },
        });
        return { autorizado: false as const, motivo: staff.status };
      }
    }

    await h.sincronizarVinculo(staff, userId);
    await h.adminClient
      .from("staff_access")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", staff.id);
    await h.registrarAuditoria({
      organizationId: staff.organization_id,
      userId,
      acao: "equipe_login",
      entidadeId: staff.id,
      metadados: { papel: staff.role },
    });

    return { autorizado: true as const, papel: staff.role as string, organizationId: staff.organization_id as string };
  });

export const registrarLogoutEquipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const h = await import("./equipe.server");
    const staff = await h.staffPorUsuario(context.userId as string);
    if (staff) {
      await h.registrarAuditoria({
        organizationId: staff.organization_id,
        userId: context.userId as string,
        acao: "equipe_logout",
        entidadeId: staff.id,
      });
    }
    return { ok: true };
  });

/** Recuperação de senha: resposta sempre genérica. */
export const recuperarSenhaEquipe = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const h = await import("./equipe.server");
    const email = h.normalizarEmail(data.email);
    if (!h.emailValido(email)) return { ok: true };
    if (await h.limiteExcedido("staff_recovery", email, 5, 30)) return { ok: true };

    const staff = await h.staffPorEmail(email);
    if (!staff || !["active", "invited"].includes(staff.status)) return { ok: true };

    const publico = h.clientePublico();
    await publico.auth.resetPasswordForEmail(email, { redirectTo: `${origem()}/equipe/redefinir-senha` });

    await h.registrarAuditoria({
      organizationId: staff.organization_id,
      userId: staff.auth_user_id,
      acao: "equipe_recuperacao_solicitada",
      entidadeId: staff.id,
    });
    return { ok: true };
  });

/** Registra a conclusão da redefinição (sem token, sem URL). */
export const concluirRedefinicaoSenha = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const h = await import("./equipe.server");
    const staff = await h.staffPorUsuario(context.userId as string);
    if (staff) {
      await h.registrarAuditoria({
        organizationId: staff.organization_id,
        userId: context.userId as string,
        acao: "equipe_senha_redefinida",
        entidadeId: staff.id,
      });
    }
    return { ok: true };
  });

/* ============ GESTÃO DA EQUIPE (somente admin) ============ */

export const listarEquipe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const h = await import("./equipe.server");
    const supabase = context.supabase as any;
    const staff = await h.staffPorUsuario(context.userId as string);
    const { data } = await supabase
      .from("staff_access")
      .select(
        "id, email, full_name, role, status, invited_at, invitation_expires_at, activated_at, last_login_at, reason, demo",
      )
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    return {
      membros: (data ?? []) as any[],
      souAdmin: staff?.status === "active" && staff?.role === "admin",
    };
  });

export const convidarMembroEquipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; nome: string; papel: string; diasValidade?: number }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./equipe.server");
    const gestor = await h.exigirAdminEquipe(context.userId as string);
    const email = h.normalizarEmail(data.email);
    if (!h.emailValido(email)) throw new Error("E-mail inválido.");
    if (!h.PAPEIS.includes(data.papel as any)) throw new Error("Papel inválido.");

    const existente = await h.staffPorEmail(email);
    if (existente) throw new Error("Já existe um acesso de equipe para este e-mail.");

    const expira = new Date(Date.now() + (data.diasValidade ?? 7) * 24 * 60 * 60 * 1000).toISOString();
    const inserido = await h.adminClient
      .from("staff_access")
      .insert({
        organization_id: gestor.organization_id,
        email,
        full_name: data.nome?.trim() || null,
        role: data.papel,
        status: "invited",
        invited_by: context.userId,
        invitation_expires_at: expira,
        created_by: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (inserido.error) throw new Error(inserido.error.message);

    // Link temporário apenas para definir a senha inicial (não é acesso de cliente).
    const convite = await h.adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${origem()}/equipe/redefinir-senha`,
    });
    if (convite?.data?.user?.id) {
      await h.adminClient
        .from("staff_access")
        .update({ auth_user_id: convite.data.user.id })
        .eq("id", inserido.data.id);
    }

    await h.registrarAuditoria({
      organizationId: gestor.organization_id,
      userId: context.userId as string,
      acao: "equipe_convite_criado",
      entidadeId: inserido.data.id,
      metadados: { papel: data.papel },
    });
    return { id: inserido.data.id as string };
  });

export const alterarPapelMembro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; papel: string }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./equipe.server");
    const gestor = await h.exigirAdminEquipe(context.userId as string);
    if (!h.PAPEIS.includes(data.papel as any)) throw new Error("Papel inválido.");

    const alvo = await h.adminClient
      .from("staff_access")
      .select("id, organization_id, auth_user_id, role, status")
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id)
      .maybeSingle();
    if (!alvo.data) throw new Error("Membro não encontrado.");

    await h.adminClient
      .from("staff_access")
      .update({ role: data.papel, updated_by: context.userId })
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id);

    if (alvo.data.auth_user_id && alvo.data.status === "active") {
      await h.sincronizarVinculo({ ...alvo.data, role: data.papel, email: null, full_name: null }, alvo.data.auth_user_id);
    }

    await h.registrarAuditoria({
      organizationId: gestor.organization_id,
      userId: context.userId as string,
      acao: "equipe_papel_alterado",
      entidadeId: data.id,
      metadados: { de: alvo.data.role, para: data.papel },
    });
    return { ok: true };
  });

export const alterarStatusMembro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "active" | "suspended" | "revoked"; motivo?: string }) => {
    if (data.status !== "active" && (!data.motivo || data.motivo.trim().length < 5)) {
      throw new Error("Informe um motivo com pelo menos 5 caracteres.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const h = await import("./equipe.server");
    const gestor = await h.exigirAdminEquipe(context.userId as string);
    if (data.id === gestor.id && data.status !== "active") {
      throw new Error("Não é possível suspender ou revogar o próprio acesso.");
    }

    const alvo = await h.adminClient
      .from("staff_access")
      .select("id, organization_id, auth_user_id, role, status")
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id)
      .maybeSingle();
    if (!alvo.data) throw new Error("Membro não encontrado.");

    const agora = new Date().toISOString();
    const patch: Record<string, unknown> = {
      status: data.status,
      reason: data.status === "active" ? null : data.motivo?.trim(),
      updated_by: context.userId,
    };
    if (data.status === "suspended") {
      patch["suspended_at"] = agora;
      patch["suspended_by"] = context.userId;
    }
    if (data.status === "revoked") {
      patch["revoked_at"] = agora;
      patch["revoked_by"] = context.userId;
    }
    if (data.status === "active") {
      patch["suspended_at"] = null;
      patch["suspended_by"] = null;
      patch["revoked_at"] = null;
      patch["revoked_by"] = null;
      patch["activated_at"] = alvo.data.status === "invited" ? agora : undefined;
    }

    const { error } = await h.adminClient
      .from("staff_access")
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id);
    if (error) throw new Error(error.message);

    if (data.status === "active" && alvo.data.auth_user_id) {
      await h.sincronizarVinculo({ ...alvo.data, email: null, full_name: null }, alvo.data.auth_user_id);
    } else if (data.status !== "active") {
      await h.revogarVinculo(alvo.data);
    }

    await h.registrarAuditoria({
      organizationId: gestor.organization_id,
      userId: context.userId as string,
      acao: `equipe_${data.status}`,
      entidadeId: data.id,
      metadados: { motivo: data.motivo ?? null },
    });
    return { ok: true };
  });

export const arquivarMembroEquipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => {
    if (!data.motivo || data.motivo.trim().length < 5) throw new Error("Informe o motivo do arquivamento.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const h = await import("./equipe.server");
    const gestor = await h.exigirAdminEquipe(context.userId as string);
    if (data.id === gestor.id) throw new Error("Não é possível arquivar o próprio acesso.");

    const alvo = await h.adminClient
      .from("staff_access")
      .select("id, organization_id, auth_user_id")
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id)
      .maybeSingle();
    if (!alvo.data) throw new Error("Membro não encontrado.");

    const { error } = await h.adminClient
      .from("staff_access")
      .update({
        status: "revoked",
        archived_at: new Date().toISOString(),
        archived_by: context.userId,
        archive_reason: data.motivo.trim(),
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id);
    if (error) throw new Error(error.message);

    await h.revogarVinculo(alvo.data);
    await h.registrarAuditoria({
      organizationId: gestor.organization_id,
      userId: context.userId as string,
      acao: "equipe_arquivado",
      entidadeId: data.id,
    });
    return { ok: true };
  });

/**
 * Primeiro acesso da instância: cria a organização fundadora e o primeiro admin.
 * Só funciona enquanto não existir nenhum acesso de equipe — depois, apenas convite por admin.
 */
export const criarPrimeiroAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; senha: string; nome: string; organizacao: string }) => {
    if (!data.senha || data.senha.length < 10) throw new Error("A senha deve ter ao menos 10 caracteres.");
    if (!data.organizacao?.trim()) throw new Error("Informe o nome da organização.");
    return data;
  })
  .handler(async ({ data }) => {
    const h = await import("./equipe.server");
    const email = h.normalizarEmail(data.email);
    if (!h.emailValido(email)) throw new Error("E-mail inválido.");

    const existentes = await h.adminClient.from("staff_access").select("id").is("archived_at", null).limit(1);
    if ((existentes.data ?? []).length > 0) {
      throw new Error("Provisionamento inicial já concluído. Solicite um convite a um administrador.");
    }

    const criado = await h.adminClient.auth.admin.createUser({
      email,
      password: data.senha,
      email_confirm: true,
      user_metadata: { nome: data.nome?.trim() || null },
    });
    if (criado.error) throw new Error(criado.error.message);
    const userId = criado.data.user.id as string;

    const slug =
      data.organizacao
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 40) || `org-${Date.now()}`;

    const org = await h.adminClient
      .from("organizations")
      .insert({ nome: data.organizacao.trim(), slug, demo: false })
      .select("id")
      .maybeSingle();
    if (org.error) throw new Error(org.error.message);
    const organizationId = org.data.id as string;

    await h.adminClient.from("profiles").upsert({ id: userId, nome: data.nome?.trim() || null, email });
    await h.adminClient.from("organization_members").insert({ organization_id: organizationId, user_id: userId });
    await h.adminClient.from("user_roles").insert({ organization_id: organizationId, user_id: userId, role: "admin" });
    const staff = await h.adminClient
      .from("staff_access")
      .insert({
        organization_id: organizationId,
        auth_user_id: userId,
        email,
        full_name: data.nome?.trim() || null,
        role: "admin",
        status: "active",
        activated_at: new Date().toISOString(),
        created_by: userId,
      })
      .select("id")
      .maybeSingle();

    await h.registrarAuditoria({
      organizationId,
      userId,
      acao: "equipe_provisionamento_inicial",
      entidadeId: staff.data?.id ?? null,
    });
    return { ok: true };
  });

/** Indica se a instância ainda não tem nenhum acesso de equipe. */
export const precisaProvisionamento = createServerFn({ method: "GET" }).handler(async () => {
  const h = await import("./equipe.server");
  const { data } = await h.adminClient.from("staff_access").select("id").is("archived_at", null).limit(1);
  return { pendente: (data ?? []).length === 0 };
});
