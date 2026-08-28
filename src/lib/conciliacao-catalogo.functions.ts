/* eslint-disable @typescript-eslint/no-explicit-any */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Conciliação somente leitura da proposta contra o catálogo homologado. */
export const conciliarCatalogoProposta = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: String(d.proposalId) }))
  .handler(async ({ data, context }) => {
    semCache();
    const { conciliarPropostaComCatalogo } = await import("@/lib/conciliacao-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    return conciliarPropostaComCatalogo(supabase, { org, proposalId: data.proposalId });
  });

/** Executa a conciliação e registra/resolve as divergências, com auditoria. */
export const executarConciliacaoCatalogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: String(d.proposalId) }))
  .handler(async ({ data, context }) => {
    const { registrarConciliacao } = await import("@/lib/conciliacao-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return registrarConciliacao(supabase, { org, userId, proposalId: data.proposalId });
  });

/** Reprocessa a conciliação preservando a versão anterior das decisões. */
export const reprocessarConciliacaoCatalogo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string; motivo?: string | null }) => ({
    proposalId: String(d.proposalId),
    motivo: d.motivo ? String(d.motivo).slice(0, 400) : null,
  }))
  .handler(async ({ data, context }) => {
    const { reprocessarConciliacao } = await import("@/lib/conciliacao-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return reprocessarConciliacao(supabase, {
      org,
      userId,
      proposalId: data.proposalId,
      motivo: data.motivo,
    });
  });

/** Histórico append-only das execuções de conciliação de uma proposta. */
export const historicoConciliacaoCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: String(d.proposalId) }))
  .handler(async ({ data, context }) => {
    semCache();
    const { historicoConciliacao } = await import("@/lib/conciliacao-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    return historicoConciliacao(supabase, { org, proposalId: data.proposalId });
  });

/** Varredura somente leitura de todas as propostas vivas contra o catálogo. */
export const varreduraConciliacaoCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const { varrerConciliacao } = await import("@/lib/conciliacao-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    return varrerConciliacao(supabase, { org });
  });
