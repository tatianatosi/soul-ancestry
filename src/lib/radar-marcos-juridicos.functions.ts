import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { radarMarcosJuridicos } from "@/lib/radar-marcos-juridicos";
import { organizacaoDo } from "@/lib/caso-canonico.server";

/**
 * Leitura só-leitura do radar de marcos jurídicos × casos afetados (P25,
 * 2026-09-26). Mesmo padrão de `referencias-normativas.functions.ts`:
 * cada tabela lida separadamente, junção em memória — nenhuma tabela nova,
 * nenhuma escrita.
 */
export const radarMarcosJuridicosDoPainel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const [{ data: trilhas }, { data: marcosRaw }, { data: casosRaw }] = await Promise.all([
      supabase
        .from("citizenship_tracks")
        .select("id,pais,code")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("legal_reference_milestones")
        .select("id,track_id,label,status,review_required")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("crm_casos")
        .select("id,citizenship_track_id")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .not("citizenship_track_id", "is", null)
        .neq("demo", true),
    ]);

    return radarMarcosJuridicos(trilhas ?? [], marcosRaw ?? [], casosRaw ?? []);
  });
