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

/** Lê o planejador já persistido (hidratação do formulário após F5/reabertura). */
export const carregarPlanejadorOperacional = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: String(d.caseId) }))
  .handler(async ({ data, context }) => {
    semCache();
    const { carregarPlanejadorOperacional: carregar, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    return carregar(supabase, { org, caseId: data.caseId });
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
