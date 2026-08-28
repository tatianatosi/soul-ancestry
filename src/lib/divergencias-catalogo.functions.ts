/* eslint-disable @typescript-eslint/no-explicit-any */
import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Lista as divergências de catálogo da organização. */
export const listarDivergenciasCatalogo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const { listarDivergencias } = await import("@/lib/divergencias-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    return listarDivergencias(supabase, { org });
  });

/** Anexa observação de resolução a uma divergência. */
export const anotarResolucaoDivergencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; observacao: string }) => ({
    id: String(d.id),
    observacao: String(d.observacao ?? ""),
  }))
  .handler(async ({ data, context }) => {
    const { anotarResolucao } = await import("@/lib/divergencias-catalogo.server");
    const { orgDoUsuario } = await import("@/lib/cadeia-operacional.server");
    const supabase = (context as any).supabase;
    const userId = context.userId as string;
    const org = await orgDoUsuario(supabase, userId);
    return anotarResolucao(supabase, { org, userId, id: data.id, observacao: data.observacao });
  });
