import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { avaliarContexto, contextoDaCadeia, orgDoUsuario, persistirAnexoI } from "@/lib/cadeia-formalizacao.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Estado somente-leitura da cadeia proposta → assinatura de um caso. */
export const carregarCadeiaFormalizacao = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const org = await orgDoUsuario(supabase, context.userId as string);
    const ctx = await contextoDaCadeia(supabase, org, data.caseId);
    return avaliarContexto(ctx);
  });

/** Deriva e grava o Anexo I (Ordem de Serviço) da proposta aprovada. */
export const derivarAnexoIDaProposta = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return persistirAnexoI(supabase, { org, userId, caseId: data.caseId });
  });
