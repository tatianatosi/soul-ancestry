/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Conciliação somente leitura da proposta contra o catálogo homologado. */
export const conciliarCatalogoProposta = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: String(d.proposalId) }))
  .handler(async ({ data, context }) => {
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

/** Varredura somente leitura de todas as propostas vivas contra o catálogo. */
export const varreduraConciliacaoCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { varrerConciliacao } = await import("@/lib/conciliacao-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    return varrerConciliacao(supabase, { org });
  });
