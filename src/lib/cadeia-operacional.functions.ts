/* eslint-disable @typescript-eslint/no-explicit-any */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { EntradaPlanejador } from "@/lib/cadeia-operacional";

/** Leitura consolidada da cadeia LEAD → … → ASSINATURA (desabilitada). */
export const lerCadeiaOperacional = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: String(d.caseId) }))
  .handler(async ({ data, context }) => {
    semCache();
    const { estadoCadeiaOperacional, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    return estadoCadeiaOperacional(supabase, org, data.caseId, { userId: context.userId as string });
  });

/**
 * Corte 1 (27/09/2026): último plano salvo do caso, para o formulário do
 * Planejador abrir preenchido em vez de em branco (e não apagar o que já
 * estava gravado ao salvar de novo).
 */
export const lerPlanejadorSalvo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: String(d.caseId) }))
  .handler(async ({ data, context }) => {
    semCache();
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    const { data: linha, error } = await supabase
      .from("case_plans")
      .select(
        "id,versao,updated_at,objetivo,etapa,fase_jornada,produto_pai_id,composicao,rota_confirmada,product_catalog_id,proxima_acao,prazo_proxima_acao,entregas,microentregas,marcos,checklist_aplicavel,perguntas,dependencias_cliente,dependencias_terceiros,fontes,regras_anexos",
      )
      .eq("organization_id", org)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!linha) {
      // Corte U1 (28/09/2026): sem plano salvo, o objetivo é sugerido a partir
      // do lead de origem do caso (Discovery) — nunca rota nem produto.
      const { data: caso } = await supabase
        .from("crm_casos")
        .select("lead_id")
        .eq("id", data.caseId)
        .eq("organization_id", org)
        .maybeSingle();
      let sugestaoObjetivo: string | null = null;
      if (caso?.lead_id) {
        const { data: lead } = await supabase.from("leads").select("objetivo").eq("id", caso.lead_id).maybeSingle();
        if (lead?.objetivo) {
          const { rotulo } = await import("@/lib/crm-desk");
          sugestaoObjetivo = rotulo("objetivo", lead.objetivo);
        }
      }
      return { plano: null as Record<string, any> | null, skuCodigo: null as string | null, sugestaoObjetivo };
    }
    let skuCodigo: string | null = null;
    if (linha.product_catalog_id) {
      const { data: sku } = await supabase.from("product_catalog").select("code").eq("id", linha.product_catalog_id).maybeSingle();
      skuCodigo = sku?.code ?? null;
    }
    return { plano: linha as Record<string, any> | null, skuCodigo, sugestaoObjetivo: null as string | null };
  });

/** Persiste o planejador do caso (idempotente por hash). */
export const salvarPlanejadorOperacional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entrada: EntradaPlanejador }) => d)
  .handler(async ({ data, context }) => {
    const { sincronizarPlanejador, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    // Responsável nominal é sempre quem preenche, resolvido pela sessão — nunca aceito do cliente.
    const entrada: EntradaPlanejador = { ...data.entrada, responsavelUserId: userId };
    return sincronizarPlanejador(supabase, { org, userId, entrada });
  });

/** SKUs do catálogo homologado elegíveis para o Planejador selecionar. */
export const listarSkusPlanejador = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { data, error } = await supabase
      .from("product_catalog")
      .select("id,code,nome_comercial")
      .is("archived_at", null)
      .neq("elegivel_para_proposta", false)
      .order("code", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return { skus: (data ?? []) as { id: string; code: string; nome_comercial: string | null }[] };
  });

/**
 * Materializa a proposta estruturada a partir do planejador + SKU do catálogo.
 *
 * Decisão 5 (CA-DECISÕES-DA-PROPRIETÁRIA, 09/09/2026) — responsável comercial
 * e operacional nunca vêm do cliente (antes chegavam como texto fixo
 * "Comercial responsável"/"Operações responsável" da UI); são resolvidos no
 * servidor a partir da sessão real e do responsável já atribuído ao caso.
 */
export const gerarPropostaEstruturada = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: String(d.caseId) }))
  .handler(async ({ data, context }) => {
    const { materializarProposta, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return materializarProposta(supabase, { org, userId, caseId: data.caseId });
  });

/** Aprova a proposta e persiste a condição comercial derivada (sem cobrança). */
export const aprovarPropostaCadeia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    proposalId: string;
    formaPagamento?: string | null;
    parcelasDeclaradas?: number | null;
    primeiroVencimentoDeclarado?: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    const { aprovarPropostaEstruturada, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return aprovarPropostaEstruturada(supabase, { org, userId, ...data });
  });

/** Emite a OS/Anexo I derivada da proposta aprovada (rascunho, sem ativação). */
export const emitirOSCadeia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: String(d.proposalId) }))
  .handler(async ({ data, context }) => {
    const { emitirOuRecuperarOS, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return emitirOuRecuperarOS(supabase, {
      org,
      userId,
      origem: "planejador_proposta_condicao",
      proposalId: data.proposalId,
    });
  });
