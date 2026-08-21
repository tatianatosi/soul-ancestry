import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Público: solicita link mágico. Resposta sempre genérica. */
export const solicitarLinkAcesso = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(async ({ data }) => {
    const helpers = await import("./portal.server");
    const email = helpers.normalizarEmail(data.email);
    if (!helpers.emailValido(email)) return { ok: true };

    const origem =
      getRequestHeader("origin") ??
      (getRequestHeader("host") ? `https://${getRequestHeader("host")}` : "");
    const redirectTo = `${origem}/acesso/confirmar`;

    // Limite de emissão por e-mail e por origem: reduz abuso e enumeração.
    const { limiteExcedido } = await import("./equipe.server");
    const origemBruta =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for") ??
      getRequestHeader("origin") ??
      "desconhecida";
    const [porEmail, porOrigem] = await Promise.all([
      limiteExcedido("portal_magic_link_email", email, 3, 15),
      limiteExcedido("portal_magic_link_origem", origemBruta, 20, 15),
    ]);
    if (porEmail || porOrigem) return { ok: true };

    const acesso = await helpers.acessoPorEmail(email);
    if (!helpers.acessoUtilizavel(acesso)) {
      if (acesso) {
        await helpers.registrarEvento({
          organizationId: acesso.organization_id,
          acessoId: acesso.id,
          tipo: "access_denied",
          metadata: { motivo: "acesso_indisponivel", status: acesso.access_status },
        });
      }
      return { ok: true };
    }

    await helpers.registrarEvento({
      organizationId: acesso.organization_id,
      acessoId: acesso.id,
      tipo: "magic_link_requested",
      metadata: {},
    });

    const userId = acesso.auth_user_id ?? (await helpers.garantirUsuarioAuth(email));

    // Uso único e janela curta. Cada novo envio reabre a janela a partir de
    // agora e mantém o contador em um uso: o link anterior deixa de servir
    // assim que qualquer um deles for consumido.
    const { LINK_LOGIN_VALIDADE_MINUTOS } = await import("./portal-elegibilidade");
    await helpers.adminClient
      .from("client_portal_access")
      .update({
        ...(userId && !acesso.auth_user_id ? { auth_user_id: userId } : {}),
        magic_link_uses: 0,
        magic_link_max_uses: 1,
        magic_link_expires_at: new Date(Date.now() + LINK_LOGIN_VALIDADE_MINUTOS * 60 * 1000).toISOString(),
      })
      .eq("id", acesso.id);

    await helpers.enviarLinkMagico(email, redirectTo);
    await helpers.registrarEvento({
      organizationId: acesso.organization_id,
      acessoId: acesso.id,
      authUserId: userId,
      tipo: "magic_link_sent",
      metadata: {},
    });
    return { ok: true };
  });


/** Pós-autenticação: autenticar não é autorizar. Valida vínculo e devolve destino. */
export const confirmarAcessoPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const helpers = await import("./portal.server");
    const email = helpers.normalizarEmail((context as any).claims?.email ?? "");
    const acesso = await helpers.acessoPorEmail(email);

    if (!acesso || !["invited", "active"].includes(acesso.access_status)) {
      if (acesso) {
        await helpers.registrarEvento({
          organizationId: acesso.organization_id,
          acessoId: acesso.id,
          authUserId: context.userId as string,
          tipo: "authentication_denied",
          metadata: { status: acesso.access_status },
        });
      }
      return { autorizado: false as const, destino: null, motivo: "sem_autorizacao" };
    }

    // Link mágico de uso controlado: expirado ou já consumido não libera acesso.
    const { estadoDoLink } = await import("./portal-elegibilidade");
    const estado = estadoDoLink(acesso);
    if (estado !== "valido") {
      await helpers.registrarEvento({
        organizationId: acesso.organization_id,
        acessoId: acesso.id,
        authUserId: context.userId as string,
        tipo: "session_expired",
        metadata: { estado },
      });
      return { autorizado: false as const, destino: null, motivo: estado };
    }

    const agora = new Date().toISOString();
    await helpers.adminClient
      .from("client_portal_access")
      .update({
        auth_user_id: context.userId,
        access_status: "active",
        first_authenticated_at: acesso.first_authenticated_at ?? agora,
        last_authenticated_at: agora,
        magic_link_uses: (acesso.magic_link_uses ?? 0) + 1,
      })
      .eq("id", acesso.id);


    await helpers.registrarEvento({
      organizationId: acesso.organization_id,
      acessoId: acesso.id,
      authUserId: context.userId as string,
      tipo: "authenticated",
      metadata: { nivel: acesso.access_level },
    });

    return {
      autorizado: true as const,
      destino: acesso.access_level === "client_workspace" ? "/portal" : "/portal/proposta",
      nivel: acesso.access_level as "proposal_portal" | "client_workspace",
    };
  });

/** Contexto do cliente autenticado: apenas dados do próprio vínculo. */
export const portalContexto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const acesso = await supabase
      .from("client_portal_access")
      .select("id, access_level, access_status, client_id, organization_id")
      .eq("auth_user_id", context.userId)
      .is("archived_at", null)
      .maybeSingle();

    if (!acesso.data || acesso.data.access_status !== "active") {
      return { autorizado: false as const, cliente: null, casos: [], nivel: null };
    }

    const [cliente, casos] = await Promise.all([
      supabase.from("portal_meu_cadastro").select("id, nome, pais_interesse").maybeSingle(),
      supabase
        .from("portal_casos")
        .select("id, codigo, titulo, pais, via, status, ativo, updated_at")
        .order("created_at", { ascending: false }),
    ]);

    return {
      autorizado: true as const,
      nivel: acesso.data.access_level as "proposal_portal" | "client_workspace",
      cliente: (cliente.data ?? null) as { id: string; nome: string; pais_interesse: string | null } | null,
      casos: (casos.data ?? []) as any[],
    };
  });

export const portalCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const [caso, evidencias] = await Promise.all([
      supabase
        .from("portal_casos")
        .select("id, codigo, titulo, pais, via, status, ativo, updated_at")
        .eq("id", data.id)
        .maybeSingle(),
      supabase
        .from("evidencias")
        .select("id, titulo, tipo, status, descricao, updated_at")
        .eq("caso_id", data.id)
        .order("updated_at", { ascending: false }),
    ]);
    if (!caso.data) {
      // Acesso indevido a um caso não autorizado: registrar evento de auditoria
      // sem gravar identificador de caso nem dado pessoal nos metadados.
      const helpers = await import("./portal.server");
      const acesso = await supabase
        .from("client_portal_access")
        .select("id, organization_id")
        .eq("auth_user_id", context.userId)
        .maybeSingle();
      if (acesso.data) {
        await helpers.registrarEvento({
          organizationId: acesso.data.organization_id,
          acessoId: acesso.data.id,
          authUserId: context.userId as string,
          tipo: "access_denied",
          metadata: { motivo: "caso_nao_autorizado", superficie: "portal_caso" },
        });
      }
      return { caso: null, evidencias: [] };
    }
    return { caso: caso.data as any, evidencias: (evidencias.data ?? []) as any[] };
  });


export const portalDocumentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const { data } = await supabase
      .from("evidencias")
      .select("id, caso_id, titulo, tipo, status, descricao, updated_at")
      .order("updated_at", { ascending: false });
    return (data ?? []) as any[];
  });

export const portalProposta = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const [casos, faturas] = await Promise.all([
      supabase.from("portal_casos").select("id, codigo, titulo, pais, via, status"),
      supabase
        .from("eventos_financeiros")
        .select("id, descricao, valor, moeda, status, vencimento")
        .order("vencimento", { ascending: true }),
    ]);
    return { casos: (casos.data ?? []) as any[], faturas: (faturas.data ?? []) as any[] };
  });

/* ============ ÁREA INTERNA: CLIENTES > ACESSOS AO PORTAL ============ */

export const listarAcessosPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const [acessos, casosAcesso, clientes, casos, autorizacoes, propostas] = await Promise.all([
      supabase
        .from("client_portal_access")
        .select(
          "id, client_id, email, access_status, access_level, finalidade, authorized_email_id, invited_at, invitation_expires_at, magic_link_uses, magic_link_max_uses, magic_link_expires_at, first_authenticated_at, last_authenticated_at, revocation_reason, is_demo, archived_at, created_at",
        )
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_portal_case_access")
        .select("id, client_portal_access_id, case_id, access_status, granted_at"),
      supabase.from("clientes").select("id, nome, email, classificacao, is_demo").is("archived_at", null),
      supabase
        .from("crm_casos")
        .select(
          "id, codigo, titulo, cliente_id, ativo, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, onboarding_iniciado_em, app_access_status, demo",
        )
        .is("archived_at", null),
      supabase
        .from("authorized_portal_emails")
        .select(
          "id, client_id, case_id, email, finalidade, nivel_pretendido, status, validado_em, motivo_recusa, is_demo, archived_at, created_at",
        )
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase.from("proposals").select("id, client_id, case_id, status, archived_at").is("archived_at", null),
    ]);
    return {
      acessos: (acessos.data ?? []) as any[],
      casosAcesso: (casosAcesso.data ?? []) as any[],
      clientes: (clientes.data ?? []) as any[],
      casos: (casos.data ?? []) as any[],
      autorizacoes: (autorizacoes.data ?? []) as any[],
      propostas: (propostas.data ?? []) as any[],
    };
  });

/* ---- E-mails previamente autorizados ---- */

export const registrarEmailAutorizado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      clientId: string;
      casoId?: string | null;
      email: string;
      finalidade: string;
      nivel: "proposal_portal" | "client_workspace";
      isDemo?: boolean;
    }) => {
      if (!data.finalidade || data.finalidade.trim().length < 5) {
        throw new Error("Descreva a finalidade do acesso (mínimo 5 caracteres).");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const helpers = await import("./portal.server");
    const supabase = context.supabase as any;
    const { organizationId } = await helpers.exigirGestor(supabase, context.userId as string);

    const email = helpers.normalizarEmail(data.email);
    if (!helpers.emailValido(email)) throw new Error("E-mail inválido.");

    const cliente = await supabase
      .from("clientes")
      .select("id, is_demo")
      .eq("id", data.clientId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!cliente.data) throw new Error("Pessoa não encontrada nesta organização.");

    const inserido = await supabase
      .from("authorized_portal_emails")
      .insert({
        organization_id: organizationId,
        client_id: data.clientId,
        case_id: data.casoId ?? null,
        email,
        finalidade: data.finalidade.trim(),
        nivel_pretendido: data.nivel,
        status: "pendente",
        is_demo: data.isDemo ?? cliente.data.is_demo ?? false,
        created_by: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (inserido.error) throw new Error(inserido.error.message);

    await helpers.registrarAuditoria({
      organizationId,
      userId: context.userId as string,
      acao: "email_portal_autorizado_registrado",
      entidadeId: inserido.data.id,
      metadados: { email, nivel: data.nivel, finalidade: data.finalidade.trim() },
    });
    return { id: inserido.data.id as string };
  });

export const validarEmailAutorizado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "aprovado" | "recusado" | "revogado"; motivo?: string }) => {
    if (data.status !== "aprovado" && (!data.motivo || data.motivo.trim().length < 5)) {
      throw new Error("Informe o motivo (mínimo 5 caracteres).");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const helpers = await import("./portal.server");
    const supabase = context.supabase as any;
    const { organizationId } = await helpers.exigirGestor(supabase, context.userId as string);

    const { error } = await supabase
      .from("authorized_portal_emails")
      .update({
        status: data.status,
        validado_por: context.userId,
        validado_em: new Date().toISOString(),
        motivo_recusa: data.status === "aprovado" ? null : data.motivo?.trim(),
        updated_by: context.userId,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);

    if (data.status === "revogado") {
      // revogar acessos vivos originados desta autorização
      await supabase
        .from("client_portal_access")
        .update({
          access_status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: context.userId,
          revocation_reason: data.motivo?.trim() ?? "Autorização de e-mail revogada",
        })
        .eq("authorized_email_id", data.id)
        .eq("organization_id", organizationId);
    }

    await helpers.registrarAuditoria({
      organizationId,
      userId: context.userId as string,
      acao: `email_portal_${data.status}`,
      entidadeId: data.id,
      metadados: { motivo: data.motivo ?? null },
    });
    return { ok: true };
  });


export const listarEventosAcesso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { acessoId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const { data: eventos } = await supabase
      .from("client_access_events")
      .select("id, event_type, occurred_at, metadata")
      .eq("client_portal_access_id", data.acessoId)
      .order("occurred_at", { ascending: false })
      .limit(50);
    return (eventos ?? []) as any[];
  });

export const criarConvitePortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      clientId: string;
      autorizacaoId: string;
      nivel: "proposal_portal" | "client_workspace";
      casoId?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const helpers = await import("./portal.server");
    const supabase = context.supabase as any;
    const { organizationId } = await helpers.exigirGestor(supabase, context.userId as string);

    // Somente e-mail previamente autorizado e aprovado, no nível pretendido.
    const autorizacao = await supabase
      .from("authorized_portal_emails")
      .select("id, client_id, case_id, email, finalidade, nivel_pretendido, status, is_demo, archived_at")
      .eq("id", data.autorizacaoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    const auth = autorizacao.data;
    if (!auth || auth.archived_at) throw new Error("Autorização de e-mail não encontrada.");
    if (auth.status !== "aprovado") throw new Error("E-mail não aprovado: valide a autorização antes de convidar.");
    if (auth.nivel_pretendido !== data.nivel) throw new Error("Autorização não cobre o nível de acesso escolhido.");
    if (auth.client_id !== data.clientId) throw new Error("Autorização não pertence a esta pessoa.");

    const email = helpers.normalizarEmail(auth.email);
    if (!helpers.emailValido(email)) throw new Error("E-mail inválido.");

    const cliente = await supabase
      .from("clientes")
      .select("id, is_demo")
      .eq("id", data.clientId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!cliente.data) throw new Error("Cliente não encontrado nesta organização.");

    let caso: any = null;
    if (data.nivel === "client_workspace") {
      if (!data.casoId) throw new Error("Para acesso ao espaço do cliente é obrigatório associar um caso.");
      if (auth.case_id && auth.case_id !== data.casoId) {
        throw new Error("A autorização é específica de outro caso.");
      }
      const r = await supabase
        .from("crm_casos")
        .select(
          "id, cliente_id, contrato_assinado, pagamento_confirmado, documentos_minimos_ok, ativado_em, onboarding_iniciado_em, archived_at",
        )
        .eq("id", data.casoId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      caso = r.data;
      if (!caso || caso.archived_at) throw new Error("Caso não encontrado nesta organização.");
      if (caso.cliente_id !== data.clientId) throw new Error("O caso selecionado não pertence a este cliente.");
      if (!caso.contrato_assinado || !caso.pagamento_confirmado || !caso.documentos_minimos_ok) {
        throw new Error("Caso inelegível: exige contrato assinado, pagamento confirmado e documentos mínimos.");
      }
      if (!caso.ativado_em && !caso.onboarding_iniciado_em) {
        throw new Error("Caso inelegível: falta decisão humana de ativação ou onboarding elegível.");
      }
    }

    const agora = new Date();
    const { CONVITE_VALIDADE_HORAS } = await import("./portal-elegibilidade");
    const expira = new Date(agora.getTime() + CONVITE_VALIDADE_HORAS * 60 * 60 * 1000);

    const inserido = await supabase
      .from("client_portal_access")
      .insert({
        organization_id: organizationId,
        client_id: data.clientId,
        email,
        access_level: data.nivel,
        access_status: "invited",
        finalidade: auth.finalidade,
        authorized_email_id: auth.id,
        is_demo: auth.is_demo || cliente.data.is_demo || false,
        invited_at: agora.toISOString(),
        invited_by: context.userId,
        invitation_expires_at: expira.toISOString(),
        magic_link_expires_at: expira.toISOString(),
        magic_link_uses: 0,
        magic_link_max_uses: 1,
      })
      .select("id")
      .maybeSingle();
    if (inserido.error) throw new Error(inserido.error.message);
    const acessoId = inserido.data.id as string;


    if (caso) {
      const vinculo = await supabase.from("client_portal_case_access").insert({
        organization_id: organizationId,
        client_portal_access_id: acessoId,
        case_id: caso.id,
      });
      if (vinculo.error) throw new Error(vinculo.error.message);
    }

    const userId = await helpers.garantirUsuarioAuth(email);
    if (userId) {
      await helpers.adminClient.from("client_portal_access").update({ auth_user_id: userId }).eq("id", acessoId);
    }

    const origem =
      getRequestHeader("origin") ?? (getRequestHeader("host") ? `https://${getRequestHeader("host")}` : "");
    await helpers.enviarLinkMagico(email, `${origem}/acesso/confirmar`);

    await helpers.registrarEvento({
      organizationId,
      acessoId,
      actorUserId: context.userId as string,
      tipo: "invite_created",
      metadata: { nivel: data.nivel, caso_id: caso?.id ?? null },
    });
    await helpers.registrarEvento({
      organizationId,
      acessoId,
      actorUserId: context.userId as string,
      tipo: "magic_link_sent",
      metadata: { contexto: "convite" },
    });
    await helpers.registrarAuditoria({
      organizationId,
      userId: context.userId as string,
      acao: "convite_portal_criado",
      entidadeId: acessoId,
      metadados: { email, nivel: data.nivel, caso_id: caso?.id ?? null },
    });

    return { id: acessoId };
  });

export const reenviarConvitePortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { acessoId: string }) => data)
  .handler(async ({ data, context }) => {
    const helpers = await import("./portal.server");
    const supabase = context.supabase as any;
    const { organizationId } = await helpers.exigirGestor(supabase, context.userId as string);

    const acesso = await supabase
      .from("client_portal_access")
      .select("id, email, access_status")
      .eq("id", data.acessoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!acesso.data) throw new Error("Acesso não encontrado.");
    if (["revoked", "suspended", "expired"].includes(acesso.data.access_status)) {
      throw new Error("Acesso indisponível para reenvio.");
    }

    // Reenvio: janela curta e novo uso único. O link anterior deixa de valer
    // porque a janela e o contador são regravados no mesmo registro.
    const { LINK_LOGIN_VALIDADE_MINUTOS } = await import("./portal-elegibilidade");
    const expira = new Date(Date.now() + LINK_LOGIN_VALIDADE_MINUTOS * 60 * 1000).toISOString();
    await supabase
      .from("client_portal_access")
      .update({
        invitation_expires_at: expira,
        magic_link_expires_at: expira,
        magic_link_uses: 0,
        magic_link_max_uses: 1,
        invited_at: new Date().toISOString(),
        updated_by: context.userId,
      })

      .eq("id", data.acessoId)
      .eq("organization_id", organizationId);

    const origem =
      getRequestHeader("origin") ?? (getRequestHeader("host") ? `https://${getRequestHeader("host")}` : "");
    await helpers.enviarLinkMagico(acesso.data.email, `${origem}/acesso/confirmar`);

    await helpers.registrarEvento({
      organizationId,
      acessoId: data.acessoId,
      actorUserId: context.userId as string,
      tipo: "invite_resent",
      metadata: {},
    });
    await helpers.registrarAuditoria({
      organizationId,
      userId: context.userId as string,
      acao: "convite_portal_reenviado",
      entidadeId: data.acessoId,
    });
    return { ok: true };
  });

export const alterarStatusAcessoPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { acessoId: string; status: "active" | "suspended" | "revoked"; motivo?: string }) => {
    if (data.status !== "active" && (!data.motivo || data.motivo.trim().length < 5)) {
      throw new Error("Informe um motivo com pelo menos 5 caracteres.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const helpers = await import("./portal.server");
    const supabase = context.supabase as any;
    const { organizationId } = await helpers.exigirGestor(supabase, context.userId as string);

    const patch: Record<string, unknown> = { access_status: data.status, updated_by: context.userId };
    if (data.status === "revoked") {
      patch["revoked_at"] = new Date().toISOString();
      patch["revoked_by"] = context.userId;
      patch["revocation_reason"] = data.motivo?.trim();
    }
    if (data.status === "suspended") patch["revocation_reason"] = data.motivo?.trim();

    const { error } = await supabase
      .from("client_portal_access")
      .update(patch)
      .eq("id", data.acessoId)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);

    if (data.status === "revoked") {
      await supabase
        .from("client_portal_case_access")
        .update({
          access_status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: context.userId,
          revocation_reason: data.motivo?.trim(),
        })
        .eq("client_portal_access_id", data.acessoId)
        .eq("organization_id", organizationId);
    }

    await helpers.registrarEvento({
      organizationId,
      acessoId: data.acessoId,
      actorUserId: context.userId as string,
      tipo: data.status === "revoked" ? "access_revoked" : data.status === "suspended" ? "access_suspended" : "authenticated",
      metadata: { motivo: data.motivo ?? null },
    });
    await helpers.registrarAuditoria({
      organizationId,
      userId: context.userId as string,
      acao: `acesso_portal_${data.status}`,
      entidadeId: data.acessoId,
      metadados: { motivo: data.motivo ?? null },
    });
    return { ok: true };
  });

export const definirCasoDoAcesso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { acessoId: string; casoId: string; conceder: boolean; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const helpers = await import("./portal.server");
    const supabase = context.supabase as any;
    const { organizationId } = await helpers.exigirGestor(supabase, context.userId as string);

    const acesso = await supabase
      .from("client_portal_access")
      .select("id, client_id, access_level")
      .eq("id", data.acessoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!acesso.data) throw new Error("Acesso não encontrado.");

    if (data.conceder) {
      if (acesso.data.access_level !== "client_workspace") {
        throw new Error("Somente acessos de espaço do cliente podem receber casos.");
      }
      const caso = await supabase
        .from("crm_casos")
        .select("id, cliente_id, contrato_assinado, pagamento_confirmado, documentos_minimos_ok")
        .eq("id", data.casoId)
        .eq("organization_id", organizationId)
        .maybeSingle();
      if (!caso.data || caso.data.cliente_id !== acesso.data.client_id) {
        throw new Error("Caso inválido para este cliente.");
      }
      if (!caso.data.contrato_assinado || !caso.data.pagamento_confirmado || !caso.data.documentos_minimos_ok) {
        throw new Error("Caso inelegível: exige contrato, pagamento e documentos mínimos.");
      }
      const existente = await supabase
        .from("client_portal_case_access")
        .select("id")
        .eq("client_portal_access_id", data.acessoId)
        .eq("case_id", data.casoId)
        .maybeSingle();
      if (existente.data) {
        await supabase
          .from("client_portal_case_access")
          .update({ access_status: "active", revoked_at: null, revoked_by: null, revocation_reason: null })
          .eq("id", existente.data.id);
      } else {
        const { error } = await supabase.from("client_portal_case_access").insert({
          organization_id: organizationId,
          client_portal_access_id: data.acessoId,
          case_id: data.casoId,
        });
        if (error) throw new Error(error.message);
      }
    } else {
      if (!data.motivo || data.motivo.trim().length < 5) throw new Error("Informe o motivo da revogação.");
      const { error } = await supabase
        .from("client_portal_case_access")
        .update({
          access_status: "revoked",
          revoked_at: new Date().toISOString(),
          revoked_by: context.userId,
          revocation_reason: data.motivo.trim(),
        })
        .eq("client_portal_access_id", data.acessoId)
        .eq("case_id", data.casoId)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
    }

    await helpers.registrarEvento({
      organizationId,
      acessoId: data.acessoId,
      actorUserId: context.userId as string,
      tipo: data.conceder ? "case_access_granted" : "case_access_revoked",
      metadata: { caso_id: data.casoId, motivo: data.motivo ?? null },
    });
    await helpers.registrarAuditoria({
      organizationId,
      userId: context.userId as string,
      acao: data.conceder ? "acesso_portal_caso_concedido" : "acesso_portal_caso_revogado",
      entidadeId: data.acessoId,
      metadados: { caso_id: data.casoId },
    });
    return { ok: true };
  });

/** Liberação do caso para o app do cliente (nível de visibilidade + consentimento). */
export const definirLiberacaoCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      casoId: string;
      liberado: boolean;
      nivel?: "nenhum" | "workspace" | "completo";
      consentimento?: boolean;
      infoLiberada?: boolean;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const helpers = await import("./portal.server");
    const supabase = context.supabase as any;
    const { organizationId } = await helpers.exigirGestor(supabase, context.userId as string);

    const { error } = await supabase
      .from("crm_casos")
      .update({
        app_access_status: data.liberado ? "liberado" : "bloqueado",
        app_visibility_level: data.liberado ? (data.nivel ?? "workspace") : "nenhum",
        consentimento_compartilhamento: data.liberado ? (data.consentimento ?? false) : false,
        info_cliente_liberada: data.liberado ? (data.infoLiberada ?? false) : false,
      })
      .eq("id", data.casoId)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);

    await helpers.registrarAuditoria({
      organizationId,
      userId: context.userId as string,
      acao: data.liberado ? "caso_liberado_portal" : "caso_bloqueado_portal",
      entidadeId: data.casoId,
      metadados: { nivel: data.nivel ?? null },
    });
    return { ok: true };
  });
