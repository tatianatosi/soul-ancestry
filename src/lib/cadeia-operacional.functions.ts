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
    return estadoCadeiaOperacional(supabase, org, data.caseId);
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
    return sincronizarPlanejador(supabase, { org, userId, entrada: data.entrada });
  });

/** Materializa a proposta estruturada a partir do planejador + SKU do catálogo. */
export const gerarPropostaEstruturada = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; responsavelComercial: string; responsavelOperacional: string }) => d)
  .handler(async ({ data, context }) => {
    const { materializarProposta, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return materializarProposta(supabase, { org, userId, ...data });
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
    const { emitirOSAnexoI, orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return emitirOSAnexoI(supabase, { org, userId, proposalId: data.proposalId });
  });
