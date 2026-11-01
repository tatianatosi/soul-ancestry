import { semCache } from "@/lib/no-store";
import { origemDeAutenticacao } from "@/lib/origem-canonica";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Destino oficial dos convites e redefinições de senha da equipe.
 * E1 (23/10/2026): antes era uma lista de BLOQUEIO (prévia/localhost) sobre o cabeçalho
 * da requisição — qualquer host novo passava. Agora é lista de PERMISSÃO exata
 * (`origem-canonica.ts`): só a produção; o cabeçalho nunca define o destino.
 */
function origem() {
  return origemDeAutenticacao(getRequestHeader("origin"));
}

/** Rate limit de login. Resposta neutra: não revela existência de conta. */
export const prepararLoginEquipe = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const h = await import("./equipe.server");
    const email = h.normalizarEmail(data.email);
    if (!h.emailValido(email)) return { bloqueado: false, liberaEmSegundos: 0 };
    /*
     * 26/10/2026 (auditoria pré-lançamento, H2): este limite não protegia nada
     * (a senha é conferida direto no Supabase, que já tem limite próprio) e
     * podia ser usado para trancar a Proprietária: `registrarFalhaLoginEquipe`
     * não exige login, então qualquer pessoa contava "falhas" no e-mail dela.
     * As falhas continuam registradas em auth_throttle para consulta; o
     * formulário não bloqueia mais por elas.
     */
    void h.estadoLimite;
    return { bloqueado: false, liberaEmSegundos: 0 };
  });

/** Credencial inválida: só a falha consome o limite. */
export const registrarFalhaLoginEquipe = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const h = await import("./equipe.server");
    const email = h.normalizarEmail(data.email);
    if (!h.emailValido(email)) return { ok: true };
    await h.registrarTentativa("staff_login", email);
    return { ok: true };
  });


/** Pós-login: autenticar não é autorizar. Valida staff_access ativo e deriva papel/organização. */
export const confirmarSessaoEquipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const h = await import("./equipe.server");
    const userId = context.userId as string;
    const email = h.normalizarEmail((context as any).claims?.email ?? "");

    /*
      26/08/2026 — a autorização tinha uma única fonte: a chave secreta. Com a
      chave do ambiente apontando para outro projeto, o resultado era
      "sem_vinculo" para uma conta ativa, e ninguém entrava.

      Agora há duas fontes para o MESMO fato, nesta ordem:
        1. o cliente administrativo, que também resolve vínculo por e-mail;
        2. a própria linha, lida com o token de quem está entrando, sob a
           política `staff_select_self`.

      A segunda não exige segredo nenhum e não vê nada além da linha da própria
      pessoa. Quem decide continua sendo o banco.
    */
    let staff = await h
      .staffPorUsuario(userId)
      .catch(() => null as Awaited<ReturnType<typeof h.staffPorUsuario>> | null);

    if (!staff && email) {
      const porEmail = await h.staffPorEmail(email).catch(() => null);
      if (porEmail && (porEmail.auth_user_id === null || porEmail.auth_user_id === userId)) {
        const vinculou = await h.efeitoAdministrativo("vincular auth_user_id", () =>
          h.adminClient.from("staff_access").update({ auth_user_id: userId }).eq("id", porEmail.id),
        );
        if (vinculou) staff = { ...porEmail, auth_user_id: userId };
      }
    }

    if (!staff) {
      staff = await h
        .staffPorUsuarioComRls((context as any).supabase, userId)
        .catch(() => null);
    }

    if (!staff) return { autorizado: false as const, motivo: "sem_vinculo" };

    if (staff.status !== "active") {
      if (staff.status === "invited") {
        // primeiro acesso após definir a senha pelo link de convite
        await h.efeitoAdministrativo("ativar conta convidada", () =>
          h.adminClient
            .from("staff_access")
            .update({ status: "active", activated_at: new Date().toISOString(), auth_user_id: userId })
            .eq("id", staff.id),
        );
        await h.efeitoAdministrativo("auditar ativação", () =>
          h.registrarAuditoria({
            organizationId: staff.organization_id,
            userId,
            acao: "equipe_conta_ativada",
            entidadeId: staff.id,
          }),
        );
        staff = { ...staff, status: "active" };
      } else {
        await h.efeitoAdministrativo("auditar recusa", () =>
          h.registrarAuditoria({
            organizationId: staff.organization_id,
            userId,
            acao: "equipe_falha_autorizacao",
            entidadeId: staff.id,
            metadados: { status: staff.status },
          }),
        );
        return { autorizado: false as const, motivo: staff.status };
      }
    }

    /*
      Daqui para baixo são CONSEQUÊNCIAS de entrar, não condições. Antes,
      qualquer uma delas lançando derrubava um login já autorizado — e foi
      assim que uma falha de configuração virou "não foi possível entrar".
    */
    await h.efeitoAdministrativo("sincronizar vínculo", () => h.sincronizarVinculo(staff, userId));
    if (email) {
      await h.efeitoAdministrativo("limpar tentativas", () => h.limparTentativas("staff_login", email));
    }
    await h.efeitoAdministrativo("carimbar last_login_at", () =>
      h.adminClient
        .from("staff_access")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", staff.id),
    );
    await h.efeitoAdministrativo("auditar login", () =>
      h.registrarAuditoria({
        organizationId: staff.organization_id,
        userId,
        acao: "equipe_login",
        entidadeId: staff.id,
        metadados: { papel: staff.role },
      }),
    );

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
    semCache();
    const h = await import("./equipe.server");
    const supabase = context.supabase as any;
    const staff = await h.staffPorUsuario(context.userId as string);
    const { data } = await supabase
      .from("staff_access")
      .select(
        "id, auth_user_id, email, full_name, role, status, invited_at, invitation_expires_at, activated_at, last_login_at, reason, demo",
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
      const vinculo = await h.adminClient
        .from("staff_access")
        .update({ auth_user_id: convite.data.user.id })
        .eq("id", inserido.data.id);
      if (vinculo.error) throw new Error(vinculo.error.message);
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
  .inputValidator((data: { id: string; papel: string; motivo?: string }) => ({
    ...data,
    motivo: data.motivo?.trim() || "Motivo não informado (fluxo sem confirmação humana explícita).",
  }))
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

    const atualizado = await h.adminClient
      .from("staff_access")
      .update({ role: data.papel, updated_by: context.userId })
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id)
      .select("id");
    if (atualizado.error) throw new Error(atualizado.error.message);
    if (!atualizado.data?.length) throw new Error("NENHUMA_LINHA_AFETADA: papel do membro não foi alterado.");

    if (alvo.data.auth_user_id && alvo.data.status === "active") {
      await h.sincronizarVinculo({ ...alvo.data, role: data.papel, email: null, full_name: null }, alvo.data.auth_user_id);
    }

    await h.registrarAuditoria({
      organizationId: gestor.organization_id,
      userId: context.userId as string,
      acao: "equipe_papel_alterado",
      entidadeId: data.id,
      metadados: { de: alvo.data.role, para: data.papel, motivo: data.motivo },
    });
    return { ok: true };
  });

export const alterarStatusMembro = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "active" | "suspended" | "revoked"; motivo?: string }) => data)
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
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const patch: Record<string, unknown> = {
      status: data.status,
      reason: data.status === "active" ? null : motivo,
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

    const { data: linhaStatus, error } = await h.adminClient
      .from("staff_access")
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhaStatus?.length) throw new Error("NENHUMA_LINHA_AFETADA: status do membro não foi alterado.");

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
      metadados: { motivo: data.status === "active" ? null : motivo },
    });
    return { ok: true };
  });

export const arquivarMembroEquipe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; motivo: string }) => data)
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

    const { data: linhaArquivada, error } = await h.adminClient
      .from("staff_access")
      .update({
        status: "revoked",
        archived_at: new Date().toISOString(),
        archived_by: context.userId,
        archive_reason: (data.motivo ?? "").trim() || "Sem motivo informado.",
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", gestor.organization_id)
      .select("id");
    if (error) throw new Error(error.message);
    if (!linhaArquivada?.length) throw new Error("NENHUMA_LINHA_AFETADA: membro não foi arquivado.");

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
 * Regras (não remover):
 * - Só é permitido enquanto NÃO existir nenhum registro em staff_access e nenhuma trava de bootstrap.
 * - A criação é atômica no banco (função `bootstrap_primeiro_admin`, com advisory lock).
 * - Após o primeiro admin, o bootstrap é bloqueado em definitivo — não reabre por suspensão,
 *   revogação ou arquivamento do admin. Nesses casos, use recuperação administrativa controlada.
 * - organization_id, papel e status nunca vêm do front-end: o papel é sempre 'admin' e a
 *   organização é criada pelo próprio banco.
 * - Auditoria: bootstrap_success (no banco) e bootstrap_denied, sem senha, token ou link.
 */
async function registrarBootstrapNegado(h: typeof import("./equipe.server"), motivo: string) {
  const trava = await h.adminClient.from("bootstrap_lock").select("organization_id").limit(1).maybeSingle();
  const organizationId = trava.data?.organization_id as string | undefined;
  if (!organizationId) return;
  await h.adminClient.from("audit_logs").insert({
    organization_id: organizationId,
    acao: "bootstrap_denied",
    entidade: "staff_access",
    metadados: { motivo },
  });
}

export const criarPrimeiroAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; senha: string; nome: string; organizacao: string }) => {
    if (!data.senha || data.senha.length < 10) throw new Error("A senha deve ter ao menos 10 caracteres.");
    return data;
  })
  .handler(async ({ data }) => {
    const h = await import("./equipe.server");
    const email = h.normalizarEmail(data.email);
    if (!h.emailValido(email)) throw new Error("E-mail inválido.");

    const bloqueadoPorTentativas = await h.limiteExcedido("staff_bootstrap", email, 5, 30);
    if (bloqueadoPorTentativas) {
      await registrarBootstrapNegado(h, "limite_de_tentativas");
      throw new Error("Muitas tentativas. Tente novamente mais tarde.");
    }

    const permitido = await h.adminClient.rpc("bootstrap_permitido");
    if (permitido.error) throw new Error(permitido.error.message);
    if (permitido.data !== true) {
      await registrarBootstrapNegado(h, "bootstrap_ja_concluido");
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

    // Transação única no banco: organização + vínculo + papel + staff ativo + trava + auditoria.
    const rpc = await h.adminClient.rpc("bootstrap_primeiro_admin", {
      _user_id: userId,
      _email: email,
      _nome: data.nome?.trim() || null,
      _organizacao: data.organizacao.trim(),
    });

    if (rpc.error) {
      // desfaz o usuário recém-criado para não deixar conta órfã
      await h.adminClient.auth.admin.deleteUser(userId).catch(() => undefined);
      await registrarBootstrapNegado(h, "corrida_ou_bloqueio");
      throw new Error("Provisionamento inicial já concluído. Solicite um convite a um administrador.");
    }

    return { ok: true };
  });

/** Indica se o provisionamento inicial ainda está disponível (bloqueio definitivo após o primeiro admin). */
export const precisaProvisionamento = createServerFn({ method: "GET" }).handler(async () => {
    semCache();
  const h = await import("./equipe.server");
  const { data, error } = await h.adminClient.rpc("bootstrap_permitido");
  if (error) return { pendente: false };
  return { pendente: data === true };
});


/**
 * Status do envio de recuperação/convite de acesso (somente admin).
 * Combina as solicitações registradas em auditoria com os eventos de entrega
 * do provedor de e-mail. Nunca expõe token, URL de recuperação ou credenciais.
 */
export const statusEnvioRecuperacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }) => {
    semCache();
    const h = await import("./equipe.server");
    await h.exigirAdminEquipe(context.userId as string);

    const email = data.email ? h.normalizarEmail(data.email) : null;

    let q = h.adminClient
      .from("audit_logs")
      .select("id, acao, entidade_id, metadados, created_at")
      .in("acao", ["equipe_recuperacao_solicitada", "equipe_convite_enviado", "equipe_convite_reenviado"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (email) {
      const staff = await h.staffPorEmail(email);
      if (staff) q = q.eq("entidade_id", staff.id);
    }
    const { data: solicitacoes } = await q;

    let entregas: Array<{
      timestamp: string;
      recipient: string;
      event_type: string;
      status?: string;
      messageId?: string | null;
      tags?: string[];
    }> = [];
    let canal: "disponivel" | "sem_chave" | "indisponivel" = "disponivel";
    let detalheCanal: string | null = null;
    let historicoDesde: string | null = null;

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      canal = "sem_chave";
      detalheCanal = "Canal de e-mail ainda não habilitado neste ambiente.";
    } else {
      try {
        const { listEmailLogs } = await import("@lovable.dev/email-js");
        const resposta = await listEmailLogs({ recipient: email ?? undefined, limit: 20 }, { apiKey });
        historicoDesde = resposta.history_starts_at ?? null;
        entregas = (resposta.data ?? []).map((e) => ({
          timestamp: e.timestamp,
          recipient: e.recipient,
          event_type: e.event_type,
          status: e.status,
          // message_id é apenas o identificador do provedor — não é token nem credencial.
          messageId: e.message_id ?? null,
          tags: e.tags ?? [],
        }));
      } catch (erro) {
        canal = "indisponivel";
        detalheCanal = erro instanceof Error ? erro.message : "Falha ao consultar os eventos de entrega.";
      }
    }

    return {
      email,
      canal,
      detalheCanal,
      historicoDesde,
      consultadoEm: new Date().toISOString(),

      solicitacoes: (solicitacoes ?? []).map((s: any) => ({
        id: s.id as string,
        acao: s.acao as string,
        criadoEm: s.created_at as string,
      })),
      entregas,
    };
  });
