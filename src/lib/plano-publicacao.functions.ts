/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Corte 3a (01/10/2026) — "Publicar plano no App": o Desk publica e despublica
 * o plano do caso na aba Conta do cliente (autor, data, caso, estado), sem SQL
 * manual. Regras em `plano-publicacao.ts`. Mesma receita de
 * `arvore-publicacao.functions.ts`.
 *
 * Nunca SKU, preço ou parcela — o servidor recusa, não só a tela.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { conteudoPlano, validarPublicacaoPlano } from "@/lib/plano-publicacao";

/** O plano publicado hoje para este caso (ou `null`). */
export const listarPlanoDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const { data: linhas, error } = await supabase
      .from("app_projections")
      .select("id,content_sanitized,effective_from,approved_at")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("projection_type", "plano")
      .eq("approval_status", "published")
      .is("archived_at", null)
      .order("effective_from", { ascending: false })
      .limit(1);
    if (error) throw new Error(error.message);
    const atual = ((linhas ?? []) as any[])[0];
    return atual
      ? {
          id: atual.id as string,
          conteudo: (atual.content_sanitized as string) ?? "",
          publicadoEm: (atual.effective_from as string | null) ?? (atual.approved_at as string | null) ?? null,
        }
      : null;
  });

export const publicarPlanoNoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; nomeComercial: string; situacao: string; vigencia?: string | null }) => {
    if (!data?.caseId) throw new Error("Caso é obrigatório.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    const erros = validarPublicacaoPlano({
      nomeComercial: data.nomeComercial,
      situacao: data.situacao,
      vigencia: data.vigencia,
    });
    if (erros.length) throw new Error(erros.join(" "));

    const agora = new Date().toISOString();
    const payload = {
      content_sanitized: conteudoPlano({
        nomeComercial: data.nomeComercial,
        situacao: data.situacao,
        vigencia: data.vigencia,
      }),
      approval_status: "published",
      approved_by: userId,
      approved_at: agora,
    };

    const { data: existente } = await supabase
      .from("app_projections")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .eq("projection_type", "plano")
      .eq("approval_status", "published")
      .is("archived_at", null)
      .limit(1);
    const idExistente = ((existente ?? []) as { id: string }[])[0]?.id ?? null;

    const r = idExistente
      ? await gravarComVerificacao({ supabase, tabela: "app_projections", id: idExistente, organizationId, userId, payload })
      : await inserirComVerificacao({
          supabase,
          tabela: "app_projections",
          organizationId,
          userId,
          payload: {
            ...payload,
            case_id: data.caseId,
            projection_type: "plano",
            destination: "app",
            source_entity_type: "case",
            source_entity_id: data.caseId,
            visibility_scope: "titular",
            effective_from: agora,
          },
        });

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: (idExistente ?? (r as { id?: string }).id) ?? null,
      acao: idExistente ? "plano_app_atualizado" : "plano_app_publicado",
      user_id: userId,
      metadados: { case_id: data.caseId, situacao: data.situacao },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: idExistente ? "Plano atualizado no App" : "Plano publicado no App",
      summaryInternal: payload.content_sanitized,
      sourceEntityType: "app_projections",
      sourceEntityId: idExistente ?? (r as { id?: string }).id ?? data.caseId,
      userId,
    });
    return { ok: true, conteudo: payload.content_sanitized, salvoEm: r.salvoEm };
  });

export const despublicarPlanoDoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; projecaoId: string; motivo: string }) => {
    if ((data?.motivo ?? "").trim().length < 5)
      throw new Error("Informe o motivo (mínimo 5 letras) para tirar o plano do App.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const { data: proj } = await supabase
      .from("app_projections")
      .select("id,case_id,projection_type")
      .eq("id", data.projecaoId)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .maybeSingle();
    if (!proj || proj.projection_type !== "plano") throw new Error("Publicação de plano não encontrada neste caso.");
    const r = await gravarComVerificacao({
      supabase,
      tabela: "app_projections",
      id: proj.id,
      organizationId,
      userId,
      payload: { approval_status: "archived", archived_at: new Date().toISOString(), archived_reason: data.motivo.trim() },
    });
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: proj.id,
      acao: "plano_app_despublicado",
      user_id: userId,
      metadados: { case_id: data.caseId, motivo: data.motivo.trim() },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Plano retirado do App",
      summaryInternal: data.motivo.trim(),
      sourceEntityType: "app_projections",
      sourceEntityId: proj.id,
      userId,
    });
    return { ok: true, salvoEm: r.salvoEm };
  });
