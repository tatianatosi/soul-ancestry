import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  meusPapeis,
  podeAtivar,
  podeValidar,
  registrar,
  resolverOrganizacao,
  type CheckAtivacao,
  type EventoOnboarding,
  type Papel,
  type SupabaseCliente,
} from "@/lib/onboarding-regras";
import {
  autoSatisfazerChecksIdentidade,
  filtrarChecksAtivacaoOperacionais,
  filtrarItensOnboardingOperacionais,
} from "@/lib/checks-identidade-startup";

export type { CheckAtivacao, EventoOnboarding, Papel } from "@/lib/onboarding-regras";

export const obterOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const papeis = await meusPapeis(supabase, organizationId);

    const caso = await supabase
      .from("crm_casos")
      .select(
        "id,codigo,titulo,status,ativo,ativado_em,ativado_por,data_ativacao,responsavel_id,responsavel_principal,cliente_id,tipo_servico,suspenso_motivo,suspenso_em,created_at",
      )
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const temResponsavel = Boolean(
      (caso.data as { responsavel_id?: string | null }).responsavel_id ||
        String((caso.data as { responsavel_principal?: string | null }).responsavel_principal ?? "").trim(),
    );
    await autoSatisfazerChecksIdentidade(supabase, {
      organizationId,
      caseId: data.casoId,
      userId: context.userId as string,
      temResponsavel,
    });

    const checks = await supabase
      .from("case_activation_checks")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("case_id", data.casoId)
      .order("created_at", { ascending: true });

    // 05/09/2026 — a tela mostrava "Requisitos completos" olhando só para o
    // checklist de auto-atestação (case_activation_pendencias), enquanto o
    // banco recusa a ativação por até 4 outras fontes reais (consentimento,
    // onboarding_checklist, quality_issues, e o próprio checklist via outra
    // função). bloqueiosReais é a projeção de tudo que o banco de fato
    // verifica; pronto/"Requisitos completos" agora vem dela, não do
    // checklist clicável sozinho.
    const bloqueiosReais = await supabase.rpc("case_ativacao_bloqueios_reais", {
      _case: data.casoId,
    });
    const pendencias = await supabase.rpc("case_activation_pendencias", { _case: data.casoId });

    // Fonte #4 do bloqueio real (ver migration 20260905120000): tabela
    // diferente do checklist de 14 itens acima, e — até hoje — sem nenhuma
    // tela que permitisse completá-la. Carregada aqui para dar uma ação real
    // a cada item que a bloqueiosReais aponta.
    const checklistOnboarding = await supabase
      .from("onboarding_checklist")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("case_id", data.casoId)
      .is("archived_at", null)
      .order("ordem", { ascending: true });

    const logs = await supabase
      .from("audit_logs")
      .select("id,acao,entidade,entidade_id,metadados,created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(200);

    const linha = (caso.data ?? {}) as Record<string, string | number | boolean | null>;
    const listaChecks = filtrarChecksAtivacaoOperacionais(
      ((checks.data ?? []) as CheckAtivacao[]).sort((a, b) => a.check_key.localeCompare(b.check_key)),
    );
    const idsChecks = new Set(listaChecks.map((c) => c.id));

    const timeline: EventoOnboarding[] = ((logs.data ?? []) as Record<string, any>[])
      .filter(
        (l) =>
          l["entidade_id"] === data.casoId ||
          (l["entidade"] === "case_activation_checks" && idsChecks.has(String(l["entidade_id"]))),
      )
      .map((l) => ({
        id: String(l["id"]),
        acao: String(l["acao"]),
        entidade: String(l["entidade"]),
        quando: String(l["created_at"]),
        detalhe:
          l["entidade"] === "case_activation_checks"
            ? String(
                listaChecks.find((c) => c.id === l["entidade_id"])?.label ??
                  "Requisito de ativação",
              )
            : String((l["metadados"] as any)?.["resumo"] ?? "Caso"),
      }));

    const checklistOperacional = filtrarItensOnboardingOperacionais(
      (checklistOnboarding.data ?? []) as {
        id: string;
        item_code: string;
        label: string;
        obrigatorio: boolean;
        status: string;
        observacao: string | null;
        concluido_em: string | null;
      }[],
    );

    return {
      caso: linha,
      papeis,
      checks: listaChecks,
      pendencias: ((pendencias.data ?? []) as { check_key: string; label: string; motivo: string }[]).filter(
        (p) => !["responsavel_designado", "aprovacao_interna_ativacao"].includes(p.check_key),
      ),
      bloqueiosReais: (bloqueiosReais.data ?? []) as {
        regra: string;
        dominio: string;
        motivo: string;
        tabela_campo: string;
        valor_atual: string;
        cta_tela: string | null;
      }[],
      checklistOnboarding: checklistOperacional,
      podeAtivar: podeAtivar(papeis),
      timeline,
    };
  });

/**
 * Marca um item do checklist de onboarding (onboarding_checklist) —
 * 05/09/2026: até hoje essa tabela existia e era lida por
 * trg_caso_ativo_guard/case_ativacao_bloqueios_reais, mas nenhuma tela
 * permitia completá-la. Concluir ou marcar não aplicável exige uma
 * observação com a evidência real; não é um clique vazio.
 */
export const atualizarItemChecklistOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      itemId: string;
      status: "pendente" | "concluido" | "nao_aplicavel";
      observacao?: string;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);

    if (data.status !== "pendente" && !data.observacao?.trim()) {
      return {
        ok: false,
        erro: "Informe a evidência real que sustenta esta conclusão — não é permitido marcar sem registrar o que foi verificado.",
      };
    }

    const { data: atual } = await supabase
      .from("onboarding_checklist")
      .select("id,case_id,label")
      .eq("id", data.itemId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual) return { ok: false, erro: "Item não encontrado." };

    const { data: linhaAtualizada, error } = await supabase
      .from("onboarding_checklist")
      .update({
        status: data.status,
        observacao: data.observacao?.trim() || null,
        concluido_em: data.status === "pendente" ? null : new Date().toISOString(),
        concluido_por: data.status === "pendente" ? null : context.userId,
      })
      .eq("id", data.itemId)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, erro: error.message };
    if (!linhaAtualizada?.id)
      return { ok: false, erro: "Nada foi gravado: verifique permissão e identificação do item." };

    await registrar(
      supabase,
      organizationId,
      "onboarding_checklist_item_atualizado",
      atual.case_id as string,
      {
        resumo: `${atual.label as string}: ${data.status}`,
        observacao: data.observacao ?? null,
      },
    );

    return { ok: true, erro: null as string | null };
  });

export const atualizarCheckAtivacao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      checkId: string;
      status: "pendente" | "validado" | "isento" | "nao_aplicavel";
      observacao?: string;
      isencaoMotivo?: string;
      isencaoExpiraEm?: string | null;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const papeis = await meusPapeis(supabase, organizationId);

    const atual = await supabase
      .from("case_activation_checks")
      .select("*")
      .eq("id", data.checkId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Requisito não encontrado.");
    const check = atual.data as CheckAtivacao & { case_id: string };

    if (!podeValidar(papeis, check.dominio, data.status)) {
      return { ok: false, erro: "Seu papel não permite esta validação." };
    }
    if (data.status === "isento") {
      if (!papeis.includes("admin")) return { ok: false, erro: "Somente admin autoriza isenção." };
    }
    const isencaoMotivo = (data.isencaoMotivo ?? "").trim() || "Isenção sem motivo informado.";

    const patch: Record<string, unknown> = {
      status: data.status,
      observacao: data.observacao ?? check.observacao,
      origem_validacao: data.status === "isento" ? "isencao_admin" : "validacao_manual",
    };
    if (data.status === "isento") {
      patch["isencao_motivo"] = isencaoMotivo;
      patch["isencao_expira_em"] = data.isencaoExpiraEm || null;
    }

    const { data: linhaAtualizada, error } = await supabase
      .from("case_activation_checks")
      .update(patch)
      .eq("id", data.checkId)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, erro: error.message };
    if (!linhaAtualizada?.id)
      return {
        ok: false,
        erro: "Nada foi gravado: verifique permissão e identificação do requisito.",
      };

    /*
     * 04/09/2026 — achado real reportado pela Proprietária: marcar este
     * requisito "isento" aqui NUNCA satisfazia a trava real de ativação
     * (guard_consentimento_ativacao → fn_guard_consentimento_ativacao,
     * migration 20260816202602), porque essa trava lê exclusivamente
     * consent_records/consent_exceptions — duas tabelas que esta função
     * nunca escrevia. O caso passava "Requisitos completos" na tela e
     * mesmo assim era recusado ao tentar ativar de verdade, com a mesma
     * mensagem de erro do banco, sem nenhuma ação disponível para
     * resolver. Agora a isenção deste requisito específico grava a
     * exceção formal real que o banco verifica.
     */
    if (data.status === "isento" && check.check_key === "consentimento_registrado") {
      const { error: erroExcecao } = await supabase.from("consent_exceptions").insert({
        organization_id: organizationId,
        case_id: check.case_id,
        motivo: isencaoMotivo,
        valido_ate: data.isencaoExpiraEm || null,
        aprovado_por: context.userId,
      });
      if (erroExcecao)
        return {
          ok: false,
          erro: `Isenção registrada, mas a exceção formal falhou: ${erroExcecao.message}`,
        };
    }

    /*
     * 04/09/2026 — achado real reportado pela Proprietária: marcar este
     * requisito "isento" aqui NUNCA satisfazia a trava real de ativação
     * (guard_consentimento_ativacao → fn_guard_consentimento_ativacao,
     * migration 20260816202602), porque essa trava lê exclusivamente
     * consent_records/consent_exceptions — duas tabelas que esta função
     * nunca escrevia. O caso passava "Requisitos completos" na tela e
     * mesmo assim era recusado ao tentar ativar de verdade, com a mesma
     * mensagem de erro do banco, sem nenhuma ação disponível para
     * resolver. Agora a isenção deste requisito específico grava a
     * exceção formal real que o banco verifica.
     */
    if (data.status === "isento" && check.check_key === "consentimento_registrado") {
      const { error: erroExcecao } = await supabase.from("consent_exceptions").insert({
        organization_id: organizationId,
        case_id: check.case_id,
        motivo: isencaoMotivo,
        valido_ate: data.isencaoExpiraEm || null,
        aprovado_por: context.userId,
      });
      if (erroExcecao) return { ok: false, erro: `Isenção registrada, mas a exceção formal falhou: ${erroExcecao.message}` };
    }

    await registrar(
      supabase,
      organizationId,
      data.status === "isento" ? "isencao_autorizada" : "check_ativacao_atualizado",
      check.case_id,
      {
        resumo: `${check.label}: ${data.status}`,
        check_key: check.check_key,
        motivo: data.status === "isento" ? isencaoMotivo : null,
        expira_em: data.isencaoExpiraEm ?? null,
      },
    );

    return { ok: true, erro: null as string | null };
  });

export const ativarCasoComChecks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; motivoOverride?: string | null }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const papeis = await meusPapeis(supabase, organizationId);
    if (!podeAtivar(papeis)) {
      await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
        resumo: "Tentativa de ativação recusada: papel sem permissão",
      });
      return { ok: false, pendencias: ["Somente admin ou operações podem ativar."] };
    }

    // Fonte de verdade: as 5 trilhas reais de trava — mesma projeção da tela.
    const bloq = await supabase.rpc("case_ativacao_bloqueios_reais", { _case: data.casoId });
    const lista = ((bloq.data ?? []) as { motivo: string }[]).map((b) => b.motivo);
    if (bloq.error) lista.push(bloq.error.message);

    if (lista.length > 0) {
      // Pendência informa: proprietária assume e ativa; demais papéis bloqueiam.
      const { assumirOuRecusarComUsuario } = await import("@/lib/autoridade.server");
      let assumidas: string[];
      try {
        assumidas = await assumirOuRecusarComUsuario(
          supabase,
          context.userId as string,
          lista,
          `Ativação bloqueada: ${lista.join("; ")}`,
        );
      } catch (e) {
        await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
          resumo: `Tentativa de ativação recusada: ${lista.length} requisito(s) obrigatório(s) fora de validado`,
          pendencias: lista,
        });
        return { ok: false, pendencias: lista };
      }
      await supabase.from("owner_override_events").insert({
        organization_id: organizationId,
        actor_user_id: context.userId,
        actor_papel: "admin",
        categoria: "override_interno",
        acao: "ativar_caso_com_pendencia",
        modulo: "onboarding",
        operacao: "avanco_fase_caso",
        entidade: "crm_casos",
        entidade_id: data.casoId,
        motivo:
          (data.motivoOverride ?? "").trim() ||
          "Ativação por decisão da proprietária com checklist incompleto (startup solo).",
        fonte: "onboarding_ativacao",
        pendencias_assumidas: assumidas,
        acao_externa: false,
        irreversivel: false,
        confirmacao_manual: true,
        executado: true,
      });
    }

    // A máquina de estados não permite pular direto de "rascunho" para "ativo".
    const caminhoAteAtivo: Record<string, string> = {
      rascunho: "aguardando_documentos",
      aguardando_documentos: "pronto_para_ativar",
      aguardando_pagamento: "pronto_para_ativar",
      pronto_para_ativar: "ativo",
    };

    // Responsável padrão Tatiana/sessão se o caso ainda estiver sem dono.
    const { data: casoAntes } = await supabase
      .from("crm_casos")
      .select("responsavel_id,responsavel_principal")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (casoAntes && !casoAntes.responsavel_id) {
      const { nomeResponsavelPadrao } = await import("@/lib/responsavel-padrao");
      const { nomeResponsavelSessao } = await import("@/lib/cadeia-operacional.server");
      const nome = nomeResponsavelPadrao(
        (casoAntes.responsavel_principal as string | null) ||
          (await nomeResponsavelSessao(supabase, organizationId, context.userId as string)),
      );
      await supabase
        .from("crm_casos")
        .update({
          responsavel_id: context.userId,
          responsavel_principal: nome,
        })
        .eq("id", data.casoId)
        .eq("organization_id", organizationId);
    }

    const { data: casoAtual, error: erroLeitura } = await supabase
      .from("crm_casos")
      .select("status")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (erroLeitura || !casoAtual) {
      const motivo = erroLeitura?.message ?? "Caso não encontrado nesta organização.";
      await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
        resumo: "Ativação recusada: caso não localizado",
        pendencias: [motivo],
      });
      return { ok: false, pendencias: [motivo] };
    }

    let statusAtual = casoAtual["status"] as string;
    let saltos = 0;
    while (statusAtual !== "ativo") {
      const proximo = caminhoAteAtivo[statusAtual];
      if (!proximo || saltos > 5) {
        const motivo = `Transição de caso não permitida: ${statusAtual} → ativo.`;
        await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
          resumo: "Ativação recusada: sem caminho válido até ativo",
          pendencias: [motivo],
        });
        return { ok: false, pendencias: [motivo] };
      }
      const { data: linhaAtualizada, error } = await supabase
        .from("crm_casos")
        .update(
          proximo === "ativo"
            ? // Propaga para o campo que o gate de acesso ao App Cliente de fato
              // verifica (portal-elegibilidade.ts/fn_portal_case_access_guard) —
              // mesma classe de lacuna já corrigida para assinatura de contrato
              // (contrato-parametros.functions.ts) e pagamento (comercial.functions.ts):
              // sem isto, um caso ativado aqui nunca conta como "ativado_em" para o portal.
              { status: proximo, ativo: true, ativado_em: new Date().toISOString() }
            : { status: proximo },
        )
        .eq("id", data.casoId)
        .eq("organization_id", organizationId)
        .select("id")
        .maybeSingle();
      if (error || !linhaAtualizada?.id) {
        const motivo =
          error?.message ?? "Nada foi gravado: verifique permissão e identificação do caso.";
        await registrar(supabase, organizationId, "ativacao_bloqueada", data.casoId, {
          resumo: `Ativação recusada pelo banco na transição ${statusAtual} → ${proximo}`,
          pendencias: [motivo],
        });
        return { ok: false, pendencias: [motivo] };
      }
      statusAtual = proximo;
      saltos += 1;
    }

    await registrar(supabase, organizationId, "caso_ativado", data.casoId, {
      resumo:
        lista.length > 0
          ? `Caso ativado por decisão da proprietária com ${lista.length} pendência(s) preservada(s)`
          : "Caso ativado com requisitos validados",
      pendencias: lista.length ? lista : undefined,
    });
    return { ok: true, pendencias: lista };
  });

export const suspenderCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; motivo: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as SupabaseCliente;
    const organizationId = await resolverOrganizacao(supabase, context.userId as string);
    const papeis = await meusPapeis(supabase, organizationId);
    if (!podeAtivar(papeis))
      return { ok: false, erro: "Somente admin ou operações podem suspender." };
    const motivo = (data.motivo ?? "").trim() || "Suspensão sem motivo informado.";

    const { data: linhaAtualizada, error } = await supabase
      .from("crm_casos")
      .update({ status: "pausado", suspenso_motivo: motivo })
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (error) return { ok: false, erro: error.message };
    if (!linhaAtualizada?.id)
      return { ok: false, erro: "Nada foi gravado: verifique permissão e identificação do caso." };

    await registrar(supabase, organizationId, "caso_suspenso", data.casoId, {
      resumo: "Caso suspenso",
      motivo,
    });
    return { ok: true, erro: null as string | null };
  });
