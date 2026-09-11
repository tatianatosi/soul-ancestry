import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  PROXIMA_ACAO_ABERTURA,
  TITULO_PRIMEIRA_TAREFA_CASO,
  validarAberturaCasoOperacional,
} from "@/lib/abrir-caso-operacional";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { nomeResponsavelSessao } from "@/lib/cadeia-operacional.server";
import { nomeResponsavelPadrao } from "@/lib/responsavel-padrao";
import { autoSatisfazerChecksIdentidade } from "@/lib/checks-identidade-startup";
import { garantirTarefaAberta } from "@/lib/tarefa-garantida.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Abre um caso operacional no eixo canônico `crm_casos`.
 * Sem tabela nova. Status rascunho. Responsável padrão = sessão / Tatiana.
 * Primeira tarefa em `tarefas` com tipo `geral`. Próxima ação gravada no caso.
 */
export const abrirCasoOperacional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { cliente_id: string; titulo: string; tipo_servico: string; resumo?: string }) => {
      const v = validarAberturaCasoOperacional(data);
      if (!v.ok) throw new Error(v.erros.join(" "));
      return {
        cliente_id: String(data.cliente_id).trim(),
        titulo: String(data.titulo).trim(),
        tipo_servico: String(data.tipo_servico).trim(),
        resumo: data.resumo?.trim() || null,
      };
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const organizationId = await organizacaoDo(supabase, userId);
    const responsavelNome = nomeResponsavelPadrao(
      await nomeResponsavelSessao(supabase, organizationId, userId),
    );

    const { data: recente } = await supabase
      .from("crm_casos")
      .select("id,codigo,titulo,cliente_id,tipo_servico,proxima_acao")
      .eq("organization_id", organizationId)
      .eq("cliente_id", data.cliente_id)
      .eq("titulo", data.titulo)
      .is("archived_at", null)
      .gte("created_at", new Date(Date.now() - 60_000).toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recente?.id) {
      return {
        id: recente.id as string,
        codigo: (recente.codigo as string | null) ?? null,
        titulo: recente.titulo as string,
        cliente_id: recente.cliente_id as string,
        tipo_servico: recente.tipo_servico as string,
        proxima_acao: recente.proxima_acao as string,
      };
    }

    const { data: caso, error } = await supabase
      .from("crm_casos")
      .insert({
        organization_id: organizationId,
        cliente_id: data.cliente_id,
        titulo: data.titulo,
        tipo_servico: data.tipo_servico,
        resumo: data.resumo,
        status: "rascunho",
        proxima_acao: PROXIMA_ACAO_ABERTURA,
        responsavel_id: userId,
        responsavel_principal: responsavelNome,
        created_by: userId,
        updated_by: userId,
      })
      .select("id,codigo,titulo,cliente_id,tipo_servico,proxima_acao")
      .single();
    if (error) throw new Error(error.message);
    if (!caso?.id) throw new Error("NENHUMA_LINHA_AFETADA: o caso não foi criado.");

    const tarefa = await garantirTarefaAberta(supabase, {
      organizationId,
      casoId: caso.id as string,
      titulo: TITULO_PRIMEIRA_TAREFA_CASO,
      tipo: "geral",
      descricao: "Confirmar serviço e jornada no planejador do caso.",
      userId,
    });

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: caso.id as string,
      eventType: "caso",
      title: "Caso aberto",
      summaryInternal: (caso.codigo as string | null) ?? data.titulo,
      sourceEntityType: "crm_casos",
      sourceEntityId: caso.id as string,
      userId,
      nextAction: PROXIMA_ACAO_ABERTURA,
    });
    if (tarefa.criada) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: caso.id as string,
        eventType: "tarefa",
        title: "Tarefa criada",
        summaryInternal: TITULO_PRIMEIRA_TAREFA_CASO,
        sourceEntityType: "tarefas",
        sourceEntityId: tarefa.id,
        userId,
      });
    }

    await autoSatisfazerChecksIdentidade(supabase, {
      organizationId,
      caseId: caso.id as string,
      userId,
      temResponsavel: true,
    });

    return {
      id: caso.id as string,
      codigo: (caso.codigo as string | null) ?? null,
      titulo: caso.titulo as string,
      cliente_id: caso.cliente_id as string,
      tipo_servico: caso.tipo_servico as string,
      proxima_acao: caso.proxima_acao as string,
    };
  });
