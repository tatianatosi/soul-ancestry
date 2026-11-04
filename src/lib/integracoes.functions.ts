import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarAuditoria } from "@/lib/auditoria-segura.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Centro de Integrações — funções de servidor.
 *
 * Nenhuma função aqui faz chamada externa. Testes rodam com dados DEMO, o log
 * guarda apenas payload mascarado e a ativação depende de admin + confirmação.
 */

async function contexto(supabase: any, userId: string) {
  const h = await import("./documentos.server");
  return h.contextoDocumentos(supabase, userId);
}

async function auditar(entrada: {
  organizationId: string;
  userId: string;
  acao: string;
  entidadeId: string;
  metadados: Record<string, unknown>;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await registrarAuditoria(supabaseAdmin, {
    organization_id: entrada.organizationId,
    user_id: entrada.userId,
    acao: entrada.acao,
    entidade: "integrations",
    entidade_id: entrada.entidadeId,
    metadados: entrada.metadados,
  } as any);
}

export const listarIntegracoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);

    const [integracoes, execucoes, revisao, equipe] = await Promise.all([
      supabase
        .from("integrations")
        .select("*")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("categoria", { ascending: true }),
      supabase
        .from("integration_runs")
        .select("id, integration_id, operacao, ambiente, resultado, tentativa, mensagem, payload_mascarado, resposta_mascarada, efeito_local, created_at")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(120),
      supabase
        .from("integration_review_queue")
        .select("*")
        .eq("organization_id", organizationId)
        .neq("status", "resolvido")
        .order("created_at", { ascending: false }),
      supabase
        .from("staff_access")
        .select("auth_user_id, nome:full_name, email, role, status")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .is("archived_at", null),
    ]);

    return {
      papel,
      podeConfigurar: h.PAPEIS_CONFIG.includes(papel),
      podeAtivar: papel === "admin",
      integracoes: (integracoes.data ?? []) as any[],
      execucoes: (execucoes.data ?? []) as any[],
      revisao: (revisao.data ?? []) as any[],
      equipe: (equipe.data ?? []) as any[],
    };
  });

/** Configuração: responsável, mapeamento de campos e política de retry. */
export const salvarIntegracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      ownerUserId?: string | null;
      ownerNome?: string | null;
      fieldMap?: Record<string, string>;
      retryMax?: number;
      retryBackoff?: number;
      config?: Record<string, unknown>;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (!h.PAPEIS_CONFIG.includes(papel)) throw new Error("Sem permissão para configurar integrações.");

    const patch: Record<string, unknown> = { updated_by: context.userId };
    if (data.ownerUserId !== undefined) patch["owner_user_id"] = data.ownerUserId || null;
    if (data.ownerNome !== undefined) patch["owner_nome"] = data.ownerNome || null;
    if (data.fieldMap) patch["field_map"] = data.fieldMap;
    if (data.retryMax !== undefined) patch["retry_max"] = Math.min(10, Math.max(1, Math.trunc(data.retryMax)));
    if (data.retryBackoff !== undefined)
      patch["retry_backoff_seg"] = Math.min(3600, Math.max(5, Math.trunc(data.retryBackoff)));
    if (data.config) patch["config"] = data.config;

    await gravarComVerificacao({
      supabase,
      tabela: "integrations",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
    return { ok: true };
  });

/** Mudança de situação sem ativar: desligada, teste e pausada. */
export const alterarSituacaoIntegracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "desligada" | "teste" | "pausada"; motivo?: string }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (!h.PAPEIS_CONFIG.includes(papel)) throw new Error("Sem permissão para alterar integrações.");
    if (!["desligada", "teste", "pausada"].includes(data.status)) throw new Error("Situação inválida.");
    if (data.status === "pausada" && !(data.motivo ?? "").trim()) throw new Error("Pausar exige motivo.");

    await gravarComVerificacao({
      supabase,
      tabela: "integrations",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        status: data.status,
        pausa_motivo: data.status === "pausada" ? (data.motivo ?? "").trim().slice(0, 500) : null,
      },
    });

    await auditar({
      organizationId,
      userId: context.userId as string,
      acao: `integracao_${data.status}`,
      entidadeId: data.id,
      metadados: { motivo: data.motivo ?? null },
    });
    return { ok: true };
  });

/** Ativação: exige admin, confirmação explícita e mapeamento completo. */
export const ativarIntegracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; confirmacao: string }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (papel !== "admin") throw new Error("Somente admin pode ativar uma integração.");
    if ((data.confirmacao ?? "").trim().toUpperCase() !== "ATIVAR")
      throw new Error('Digite ATIVAR para confirmar a ativação.');

    const atual = await supabase
      .from("integrations")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Integração não encontrada.");

    const faltando = (atual.data.campos_obrigatorios as string[]).filter(
      (c) => !String((atual.data.field_map ?? {})[c] ?? "").trim(),
    );
    if (faltando.length) throw new Error(`Campos obrigatórios sem mapeamento: ${faltando.join(", ")}`);
    if (!atual.data.owner_user_id) throw new Error("Defina o responsável interno antes de ativar.");

    await gravarComVerificacao({
      supabase,
      tabela: "integrations",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { status: "ativa", ativacao_confirmacao: "ATIVAR", pausa_motivo: null },
    });

    await auditar({
      organizationId,
      userId: context.userId as string,
      acao: "integracao_ativada",
      entidadeId: data.id,
      metadados: {
        chave: atual.data.chave,
        confirmacao: "ATIVAR",
        campos_mapeados: Object.keys(h.mascararPayload(atual.data.field_map ?? {})),
      },
    });
    return { ok: true };
  });

/**
 * Teste de conexão com dados DEMO. Sempre ambiente simulado: nada sai daqui,
 * e o log guarda somente payload mascarado.
 */
export const testarIntegracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; payload?: Record<string, unknown> }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (!h.PAPEIS_CONFIG.includes(papel)) throw new Error("Sem permissão para testar integrações.");

    const integ = await supabase
      .from("integrations")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!integ.data) throw new Error("Integração não encontrada.");

    const inicio = Date.now();
    const chave = integ.data.chave as string;
    const payload = data.payload ?? h.PAYLOAD_DEMO[chave] ?? {};
    const fieldMap = (integ.data.field_map ?? {}) as Record<string, string>;
    const { semMapa, semValor } = h.camposFaltantes(
      (integ.data.campos_obrigatorios ?? []) as string[],
      fieldMap,
      payload,
    );

    const bloqueado = semMapa.length > 0 || semValor.length > 0;
    const mensagem = bloqueado
      ? `Sincronização bloqueada. ${semMapa.length ? `Sem mapeamento: ${semMapa.join(", ")}. ` : ""}${
          semValor.length ? `Sem valor no payload: ${semValor.join(", ")}.` : ""
        }`.trim()
      : "Conexão simulada com sucesso. Nenhuma chamada externa foi feita.";

    const traduzido = h.aplicarMapa(fieldMap, payload);
    const resposta = bloqueado
      ? { simulado: true, status: "bloqueado", motivo: mensagem }
      : h.simularResposta(chave, traduzido);

    const run = await supabase
      .from("integration_runs")
      .insert({
        organization_id: organizationId,
        integration_id: integ.data.id,
        operacao: "teste_conexao",
        ambiente: "simulado",
        resultado: bloqueado ? "bloqueado" : "ok",
        tentativa: 1,
        duracao_ms: Date.now() - inicio,
        mensagem,
        payload_mascarado: h.mascararPayload(payload),
        resposta_mascarada: h.mascararPayload(resposta),
        efeito_local: "nenhum",
        created_by: context.userId,
      })
      .select("id")
      .maybeSingle();
    if (run.error) throw new Error(run.error.message);

    return {
      ok: !bloqueado,
      mensagem,
      semMapa,
      semValor,
      payloadMascarado: h.mascararPayload(payload),
      traduzidoMascarado: h.mascararPayload(traduzido),
      respostaMascarada: h.mascararPayload(resposta),
    };
  });

/**
 * Integração DEMO: formulário → lead. Roda inteiramente dentro do sistema,
 * cria o lead marcado como demo e nunca chama serviço externo.
 */
export const executarDemoFormLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; payload?: Record<string, unknown>; forcarFalha?: boolean }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (!h.PAPEIS_CONFIG.includes(papel)) throw new Error("Sem permissão para executar integrações.");

    const integ = await supabase
      .from("integrations")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!integ.data) throw new Error("Integração não encontrada.");
    if (integ.data.chave !== "demo_form_lead") throw new Error("Esta execução é exclusiva da integração DEMO.");
    if (integ.data.status === "pausada") throw new Error("Integração pausada.");

    const inicio = Date.now();
    const payload = data.payload ?? h.PAYLOAD_DEMO["demo_form_lead"] ?? {};
    const fieldMap = (integ.data.field_map ?? {}) as Record<string, string>;
    const { semMapa, semValor } = h.camposFaltantes(
      (integ.data.campos_obrigatorios ?? []) as string[],
      fieldMap,
      payload,
    );
    const tentativa = Math.min(
      Number(integ.data.retry_max ?? 3),
      Number(integ.data.falhas_consecutivas ?? 0) + 1,
    );

    async function registrar(resultado: "ok" | "erro" | "bloqueado", mensagem: string, efeito: string, resposta: unknown) {
      const r = await supabase.from("integration_runs").insert({
        organization_id: organizationId,
        integration_id: integ.data.id,
        operacao: "form_para_lead",
        ambiente: "simulado",
        resultado,
        tentativa,
        duracao_ms: Date.now() - inicio,
        mensagem,
        payload_mascarado: h.mascararPayload(payload),
        resposta_mascarada: h.mascararPayload(resposta),
        efeito_local: efeito,
        created_by: context.userId,
      });
      if (r.error) throw new Error(r.error.message);
    }

    if (semMapa.length || semValor.length) {
      const mensagem = `Sincronização impedida por campos obrigatórios ausentes: ${[...semMapa, ...semValor].join(", ")}.`;
      await registrar("bloqueado", mensagem, "nenhum", { status: "bloqueado" });
      return { ok: false, mensagem, leadId: null as string | null };
    }

    if (data.forcarFalha) {
      const mensagem = "Falha simulada da origem (para testar limite de tentativas e fila de revisão).";
      await registrar("erro", mensagem, "nenhum — nada foi marcado como concluído", { status: "erro" });
      return { ok: false, mensagem, leadId: null as string | null };
    }

    const dados = h.aplicarMapa(fieldMap, payload) as Record<string, any>;
    const lead = await supabase
      .from("leads")
      .insert({
        organization_id: organizationId,
        nome: String(dados["nome"] ?? "Lead DEMO").slice(0, 160),
        email: dados["email"] ? String(dados["email"]).slice(0, 160) : null,
        telefone: dados["telefone"] ? String(dados["telefone"]).slice(0, 40) : null,
        pais_interesse: dados["pais_interesse"] ? String(dados["pais_interesse"]).slice(0, 80) : null,
        origem: "integracao_demo_formulario",
        estagio: "novo",
        demo: true,
        observacoes: "Criado pela integração DEMO de formulário. Sem chamada externa.",
        created_by: context.userId,
      })
      .select("id")
      .maybeSingle();

    if (lead.error) {
      const mensagem = `Não foi possível criar o lead: ${lead.error.message}`;
      await registrar("erro", mensagem, "nenhum — nada foi marcado como concluído", { status: "erro" });
      return { ok: false, mensagem, leadId: null as string | null };
    }

    await registrar("ok", "Lead DEMO criado localmente.", `lead ${lead.data.id}`, {
      status: "ok_simulado",
      lead_id: lead.data.id,
    });
    return { ok: true, mensagem: "Lead DEMO criado a partir do formulário simulado.", leadId: lead.data.id as string };
  });

/** Fila de revisão: falha repetida não volta sozinha para produção. */
export const resolverRevisaoIntegracao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; resolucao: string }) => data)
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (!h.PAPEIS_CONFIG.includes(papel)) throw new Error("Sem permissão para tratar a fila de revisão.");
    const resolucao = (data.resolucao ?? "").trim();
    if (resolucao.length < 10) throw new Error("Descreva a resolução com pelo menos 10 caracteres.");

    const item = await supabase
      .from("integration_review_queue")
      .select("id, integration_id")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!item.data) throw new Error("Item não encontrado.");

    const r = await supabase
      .from("integration_review_queue")
      .update({
        status: "resolvido",
        resolucao: resolucao.slice(0, 2000),
        resolvido_por: context.userId,
        resolvido_em: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do item da fila.");

    // Zera o contador, mas a integração volta desligada: religar é decisão humana.
    await gravarComVerificacao({
      supabase,
      tabela: "integrations",
      id: item.data.integration_id,
      organizationId,
      userId: context.userId as string,
      payload: { falhas_consecutivas: 0, status: "desligada" },
    });

    await auditar({
      organizationId,
      userId: context.userId as string,
      acao: "integracao_revisao_resolvida",
      entidadeId: item.data.integration_id,
      metadados: { fila_id: data.id },
    });
    return { ok: true };
  });

/* ---- Agentes (MCP) — 04/11/2026 ----
 * Cadastro e perfil em `integrations` (categoria agente_mcp); visitas em
 * `integration_runs`. Nada aqui conecta o agente: o cadastro nasce desligado
 * e em modo simulado, e ativar continua exigindo admin + confirmação. */

export const cadastrarAgenteMcp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; provedor?: string | null; descricao?: string | null }) => {
    const nome = (d.nome ?? "").trim();
    if (nome.length < 2) throw new Error("Informe o nome do agente.");
    return { nome, provedor: d.provedor?.trim() || null, descricao: d.descricao?.trim() || null };
  })
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (!h.PAPEIS_CONFIG.includes(papel)) throw new Error("Sem permissão para cadastrar agentes.");
    const chave = "agente_mcp_" + data.nome.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const { data: linha, error } = await supabase
      .from("integrations")
      .insert({
        organization_id: organizationId,
        chave,
        nome: data.nome,
        categoria: "agente_mcp",
        provedor: data.provedor,
        descricao: data.descricao,
        status: "desligada",
        created_by: context.userId,
        updated_by: context.userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.code === "23505" ? "Já existe um agente com esse nome." : error.message);
    await auditar({ organizationId, userId: context.userId as string, acao: "agente_mcp_cadastrado", entidadeId: linha.id, metadados: { nome: data.nome } });
    return { id: linha.id as string };
  });

export const atualizarPerfilAgenteMcp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; nome: string; provedor?: string | null; descricao?: string | null; ownerUserId?: string | null }) => {
    if ((d.nome ?? "").trim().length < 2) throw new Error("Informe o nome do agente.");
    return d;
  })
  .handler(async ({ data, context }) => {
    const h = await import("./integracoes.server");
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contexto(supabase, context.userId as string);
    if (!h.PAPEIS_CONFIG.includes(papel)) throw new Error("Sem permissão para editar agentes.");
    await gravarComVerificacao({
      supabase,
      tabela: "integrations",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        nome: data.nome.trim(),
        provedor: data.provedor?.trim() || null,
        descricao: data.descricao?.trim() || null,
        owner_user_id: data.ownerUserId || null,
        updated_by: context.userId,
      },
    });
    await auditar({ organizationId, userId: context.userId as string, acao: "agente_mcp_perfil_atualizado", entidadeId: data.id, metadados: {} });
    return { ok: true };
  });
