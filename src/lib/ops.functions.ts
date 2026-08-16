import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  CAMPOS_MICRO,
  CAMPOS_TAREFA,
  contextoOps,
  exigirEscrita,
  limparOps,
  type Sb,
} from "@/lib/ops.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Filtro = {
  responsavelId?: string;
  status?: string;
  prioridade?: string;
  tipo?: string;
  casoId?: string;
  sla?: string;
  ate?: string;
  incluirArquivadas?: boolean;
};

/** Fila de trabalho + kanban: tarefas com SLA calculado pelo banco. */
export const listarFilaOps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Filtro) => data ?? {})
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);

    let q = supabase
      .from("v_ops_tarefas")
      .select("*")
      .eq("organization_id", ctx.organizationId)
      .order("sla_prazo_em", { ascending: true, nullsFirst: false });

    if (!data.incluirArquivadas) q = q.is("archived_at", null);
    if (data.responsavelId) q = q.eq("responsavel_id", data.responsavelId);
    if (data.status) q = q.eq("status", data.status);
    if (data.prioridade) q = q.eq("prioridade", data.prioridade);
    if (data.tipo) q = q.eq("tipo", data.tipo);
    if (data.casoId) q = q.eq("caso_id", data.casoId);
    if (data.ate) q = q.lte("prazo", data.ate);

    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);

    const filtradas = data.sla
      ? (linhas ?? []).filter((l: any) => l.sla_status === data.sla)
      : (linhas ?? []);

    return { tarefas: filtradas as Record<string, any>[], papel: ctx.papel, podeEscrever: ctx.podeEscrever };
  });

/** Micro-entregas com status de prazo calculado no banco. */
export const listarMicroentregas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Filtro) => data ?? {})
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);

    let q = supabase
      .from("v_ops_microentregas")
      .select("*")
      .eq("organization_id", ctx.organizationId)
      .order("prazo", { ascending: true, nullsFirst: false });

    if (!data.incluirArquivadas) q = q.is("archived_at", null);
    if (data.responsavelId) q = q.eq("responsavel_id", data.responsavelId);
    if (data.status) q = q.eq("status", data.status);
    if (data.casoId) q = q.eq("caso_id", data.casoId);
    if (data.ate) q = q.lte("prazo", data.ate);

    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);
    return { microentregas: (linhas ?? []) as Record<string, any>[], podeEscrever: ctx.podeEscrever };
  });

/** Casos, equipe e regras de SLA para alimentar filtros e formulários. */
export const referenciasOps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);

    const [casos, equipe, regras] = await Promise.all([
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,status")
        .eq("organization_id", ctx.organizationId)
        .is("archived_at", null)
        .order("codigo"),
      supabase
        .from("staff_access")
        .select("auth_user_id,nome,email,role,status")
        .eq("organization_id", ctx.organizationId)
        .eq("status", "active")
        .is("archived_at", null),
      supabase
        .from("ops_sla_regras")
        .select("*")
        .eq("organization_id", ctx.organizationId)
        .order("tipo_tarefa")
        .order("prioridade"),
    ]);

    return {
      casos: (casos.data ?? []) as Record<string, any>[],
      equipe: (equipe.data ?? []) as Record<string, any>[],
      regras: (regras.data ?? []) as Record<string, any>[],
      papel: ctx.papel,
      ehAdmin: ctx.ehAdmin,
      podeEscrever: ctx.podeEscrever,
      usuarioId: context.userId as string,
    };
  });

/** Painel OPS: indicadores calculados no servidor. */
export const painelOps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    const { data, error } = await supabase.rpc("ops_painel", { _org: ctx.organizationId });
    if (error) throw new Error(error.message);
    return data as Record<string, any>;
  });

/** Alertas de vencimento e atraso, dentro do sistema. */
export const alertasOps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);

    const [tarefas, micro] = await Promise.all([
      supabase
        .from("v_ops_tarefas")
        .select("id,titulo,status,prioridade,prazo,sla_prazo_em,sla_status,responsavel_id,caso_codigo")
        .eq("organization_id", ctx.organizationId)
        .is("archived_at", null)
        .not("status", "in", "(concluida,cancelada)"),
      supabase
        .from("v_ops_microentregas")
        .select("id,titulo,status,prazo,prazo_status,responsavel_id,caso_codigo,fase")
        .eq("organization_id", ctx.organizationId)
        .is("archived_at", null)
        .not("status", "in", "(concluida,cancelada)"),
    ]);

    const tt = (tarefas.data ?? []) as Record<string, any>[];
    const mm = (micro.data ?? []) as Record<string, any>[];

    return {
      atrasadas: tt.filter((t) => t["sla_status"] === "atrasada"),
      emRisco: tt.filter((t) => t["sla_status"] === "em_risco"),
      microAtrasadas: mm.filter((m) => m["prazo_status"] === "atrasada"),
      microEmRisco: mm.filter((m) => m["prazo_status"] === "em_risco"),
    };
  });

/** Cria ou atualiza tarefa. Transições e travas são validadas pelo banco. */
export const salvarTarefa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string; valores: Record<string, unknown> }) => {
    if (!data?.valores) throw new Error("Dados inválidos.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);

    const valores = limparOps(CAMPOS_TAREFA, data.valores);
    if (!valores["titulo"]) throw new Error("Informe o título da tarefa.");

    if (data.id) {
      const { error } = await supabase
        .from("tarefas")
        .update(valores)
        .eq("id", data.id)
        .eq("organization_id", ctx.organizationId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: novo, error } = await supabase
      .from("tarefas")
      .insert({ ...valores, organization_id: ctx.organizationId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: novo.id as string };
  });

/** Muda o status da tarefa no kanban, exigindo motivo/desbloqueio quando aplicável. */
export const moverTarefa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      status: string;
      motivoBloqueio?: string;
      desbloqueioJustificativa?: string;
    }) => {
      if (!data?.id || !data?.status) throw new Error("Dados inválidos.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const ctx = await contextoOps(supabase, userId);
    exigirEscrita(ctx);

    const atual = await supabase
      .from("tarefas")
      .select("status,bloqueio,bloqueado_em")
      .eq("id", data.id)
      .eq("organization_id", ctx.organizationId)
      .maybeSingle();
    if (!atual.data) throw new Error("Tarefa não encontrada.");

    const patch: Record<string, unknown> = { status: data.status };

    if (data.status === "bloqueada") {
      if (!data.motivoBloqueio || data.motivoBloqueio.trim().length < 5) {
        throw new Error("Informe o motivo do bloqueio (mínimo 5 caracteres).");
      }
      patch["motivo_bloqueio"] = data.motivoBloqueio.trim();
      patch["bloqueado_em"] = new Date().toISOString();
    }

    const saindoDeBloqueio = atual.data.status === "bloqueada" && data.status !== "bloqueada";
    const jaEsteveBloqueada = Boolean(atual.data.bloqueado_em);

    if (saindoDeBloqueio || (data.status === "concluida" && jaEsteveBloqueada)) {
      if (!data.desbloqueioJustificativa || data.desbloqueioJustificativa.trim().length < 5) {
        throw new Error("Registre a justificativa do desbloqueio (mínimo 5 caracteres).");
      }
      patch["desbloqueado_em"] = new Date().toISOString();
      patch["desbloqueio_por"] = userId;
      patch["desbloqueio_justificativa"] = data.desbloqueioJustificativa.trim();
    }

    const { error } = await supabase
      .from("tarefas")
      .update(patch)
      .eq("id", data.id)
      .eq("organization_id", ctx.organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria ou atualiza micro-entrega. */
export const salvarMicroentrega = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id?: string; valores: Record<string, unknown> }) => {
    if (!data?.valores) throw new Error("Dados inválidos.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);

    const valores = limparOps(CAMPOS_MICRO, data.valores);
    if (!valores["titulo"]) throw new Error("Informe o título da micro-entrega.");
    if (!valores["caso_id"]) throw new Error("Vincule a micro-entrega a um caso.");

    if (data.id) {
      const { error } = await supabase
        .from("ops_microentregas")
        .update(valores)
        .eq("id", data.id)
        .eq("organization_id", ctx.organizationId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const { data: novo, error } = await supabase
      .from("ops_microentregas")
      .insert({ ...valores, organization_id: ctx.organizationId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: novo.id as string };
  });

/** Arquivamento com motivo (sem exclusão física). */
export const arquivarOps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { tabela: "tarefas" | "ops_microentregas"; id: string; motivo: string }) => {
    if (!data?.id || !data?.motivo || data.motivo.trim().length < 5) {
      throw new Error("Informe o motivo do arquivamento (mínimo 5 caracteres).");
    }
    if (data.tabela !== "tarefas" && data.tabela !== "ops_microentregas") {
      throw new Error("Entidade inválida.");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    exigirEscrita(ctx);
    const { error } = await supabase
      .from(data.tabela)
      .update({
        archived_at: new Date().toISOString(),
        archived_by: context.userId,
        archive_motivo: data.motivo.trim(),
      })
      .eq("id", data.id)
      .eq("organization_id", ctx.organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Regras de SLA por tipo de tarefa e prioridade. */
export const salvarRegraSla = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id?: string;
      tipoTarefa: string;
      prioridade: string;
      horasAlvo: number;
      horasAlerta: number;
      ativo?: boolean;
      observacoes?: string;
    }) => {
      if (!data?.tipoTarefa || !data?.prioridade) throw new Error("Informe tipo e prioridade.");
      if (!(data.horasAlvo > 0) || !(data.horasAlerta >= 0)) throw new Error("Horas inválidas.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    if (ctx.papel !== "admin" && ctx.papel !== "operacoes") {
      throw new Error("Somente administração ou operações configuram SLA.");
    }
    const linha = {
      organization_id: ctx.organizationId,
      tipo_tarefa: data.tipoTarefa,
      prioridade: data.prioridade,
      horas_alvo: Math.round(data.horasAlvo),
      horas_alerta: Math.round(data.horasAlerta),
      ativo: data.ativo ?? true,
      observacoes: data.observacoes?.trim() || null,
    };
    const { error } = await supabase
      .from("ops_sla_regras")
      .upsert(linha, { onConflict: "organization_id,tipo_tarefa,prioridade" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Exceções operacionais: só administração autoriza. */
export const listarExcecoes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    const { data, error } = await supabase
      .from("ops_excecoes")
      .select("*, crm_casos(codigo,titulo,status)")
      .eq("organization_id", ctx.organizationId)
      .order("autorizado_em", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { excecoes: (data ?? []) as Record<string, any>[], ehAdmin: ctx.ehAdmin };
  });

export const registrarExcecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { tipo: string; casoId?: string; motivo: string; validoAte?: string; referenciaId?: string }) => {
      if (!data?.tipo) throw new Error("Informe o tipo de exceção.");
      if (!data?.motivo || data.motivo.trim().length < 10) {
        throw new Error("Descreva o motivo da exceção (mínimo 10 caracteres).");
      }
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const ctx = await contextoOps(supabase, context.userId as string);
    if (!ctx.ehAdmin) throw new Error("Somente administração registra exceções operacionais.");

    const { error } = await supabase.from("ops_excecoes").insert({
      organization_id: ctx.organizationId,
      caso_id: data.casoId || null,
      tipo: data.tipo,
      motivo: data.motivo.trim(),
      referencia_id: data.referenciaId || null,
      valido_ate: data.validoAte ? new Date(data.validoAte).toISOString() : null,
      autorizado_por: context.userId,
    });
    if (error) throw new Error(error.message);

    await supabase.from("audit_logs").insert({
      organization_id: ctx.organizationId,
      user_id: context.userId,
      acao: "excecao_operacional",
      entidade: "ops_excecoes",
      valores_posteriores: { tipo: data.tipo, motivo: data.motivo, caso_id: data.casoId ?? null },
    });

    return { ok: true };
  });
