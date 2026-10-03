/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A7 (03/10/2026) — o Desk publica a assinatura do cliente e o upsell no App,
 * com valor. Mesma receita de `plano-publicacao.functions.ts`: valida no
 * servidor, grava com releitura, audita e registra na timeline.
 *
 * O valor é campo estruturado (`valorCentavos`): o servidor nunca aceita
 * preço embutido em texto livre, e o cliente nunca vê parcela, desconto,
 * cobrança nem código de catálogo.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  assinaturaPublicada,
  conteudoAssinatura,
  TIPO_ASSINATURA,
  TIPO_UPSELL,
  upsellsPublicados,
  validarAssinatura,
} from "@/lib/assinatura-app";

type Tipo = typeof TIPO_ASSINATURA | typeof TIPO_UPSELL;

const tipoValido = (t: string): Tipo => {
  const v = String(t ?? "").trim().toLowerCase();
  if (v !== TIPO_ASSINATURA && v !== TIPO_UPSELL) {
    throw new Error('Tipo deve ser "assinatura" (a do cliente) ou "upsell" (o próximo nível).');
  }
  return v as Tipo;
};

/** O que o cliente vê hoje na Conta: a assinatura e os upsells publicados. */
export const listarAssinaturaDoCaso = createServerFn({ method: "GET" })
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
      .select("id,projection_type,content_sanitized,effective_from,updated_at")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .in("projection_type", [TIPO_ASSINATURA, TIPO_UPSELL])
      .eq("approval_status", "published")
      .is("archived_at", null);
    if (error) throw new Error(error.message);
    const projecoes = (linhas ?? []) as any[];
    return { assinatura: assinaturaPublicada(projecoes), upsells: upsellsPublicados(projecoes) };
  });

export const publicarAssinaturaNoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { caseId: string; tipo: string; nome: string; valorCentavos: number; periodicidade: string; situacao?: string }) => {
      if (!data?.caseId) throw new Error("Caso é obrigatório.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const tipo = tipoValido(data.tipo);

    const { data: caso } = await supabase
      .from("crm_casos")
      .select("id")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    const entrada = {
      nome: data.nome,
      valorCentavos: Number(data.valorCentavos),
      periodicidade: data.periodicidade,
      situacao: data.situacao,
    };
    const erros = validarAssinatura(entrada);
    if (erros.length) throw new Error(erros.join(" "));

    const agora = new Date().toISOString();
    const payload = {
      content_sanitized: conteudoAssinatura(entrada),
      approval_status: "published",
      approved_by: userId,
      approved_at: agora,
    };

    // Assinatura é uma só por caso (a vigente). Upsell pode ter mais de um.
    const idExistente =
      tipo === TIPO_ASSINATURA
        ? (
            ((
              await supabase
                .from("app_projections")
                .select("id")
                .eq("organization_id", organizationId)
                .eq("case_id", data.caseId)
                .eq("projection_type", TIPO_ASSINATURA)
                .eq("approval_status", "published")
                .is("archived_at", null)
                .limit(1)
            ).data ?? []) as { id: string }[]
          )[0]?.id ?? null
        : null;

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
            projection_type: tipo,
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
      acao: tipo === TIPO_ASSINATURA ? "assinatura_app_publicada" : "upsell_app_publicado",
      user_id: userId,
      valores_posteriores: { content_sanitized: payload.content_sanitized },
      metadados: { case_id: data.caseId, tipo, autorizacao_a7: "Proprietária, 03/10/2026" },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: tipo === TIPO_ASSINATURA ? "Assinatura publicada no App" : "Upsell publicado no App",
      summaryInternal: payload.content_sanitized,
      sourceEntityType: "app_projections",
      sourceEntityId: idExistente ?? (r as { id?: string }).id ?? data.caseId,
      userId,
    });

    return { ok: true, conteudo: payload.content_sanitized, salvoEm: r.salvoEm };
  });

/** Arquiva com motivo — nunca apaga. */
export const despublicarAssinaturaDoApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; projecaoId: string; motivo: string }) => {
    if (!data?.projecaoId) throw new Error("Publicação não informada.");
    if (!String(data?.motivo ?? "").trim()) throw new Error("Informe o motivo da despublicação.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const agora = new Date().toISOString();

    const r = await gravarComVerificacao({
      supabase,
      tabela: "app_projections",
      id: data.projecaoId,
      organizationId,
      userId,
      payload: { approval_status: "archived", archived_at: agora, archived_reason: data.motivo.trim() },
    });

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: data.projecaoId,
      acao: "assinatura_app_despublicada",
      user_id: userId,
      metadados: { case_id: data.caseId, motivo: data.motivo.trim() },
    });
    return { ok: true, salvoEm: r.salvoEm };
  });
