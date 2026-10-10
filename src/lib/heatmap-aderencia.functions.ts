import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { agruparHeatmapPorPais, type RamoHeatmapBruto } from "@/lib/heatmap-aderencia";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Heatmap de aderência por país de UM caso — só leitura, filtrado pela organização ativa. */
export const carregarHeatmapAderencia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const { data: membro } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("user_id", context.userId as string)
      .is("archived_at", null)
      .maybeSingle();
    if (!membro?.organization_id) throw new Error("Usuário sem organização ativa.");
    const organizationId = membro.organization_id as string;

    const { data: ramos, error } = await supabase
      .from("lineage_paths")
      .select("id,nome_da_linha,citizenship_track_id,aderencia_percentual,evidencias_chave")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null);
    if (error) throw new Error(error.message);

    const lista = (ramos ?? []) as any[];
    const idsTrilhas = [...new Set(lista.map((r) => r.citizenship_track_id).filter(Boolean))] as string[];
    const trilhas = idsTrilhas.length
      ? await supabase.from("citizenship_tracks").select("id,pais").in("id", idsTrilhas)
      : { data: [] as any[] };
    const paisPorTrilha = new Map<string, string | null>(
      ((trilhas.data ?? []) as any[]).map((t) => [t.id as string, (t.pais as string | null) ?? null]),
    );

    const brutos: RamoHeatmapBruto[] = lista.map((r) => ({
      id: r.id,
      nome_da_linha: r.nome_da_linha,
      pais: r.citizenship_track_id ? (paisPorTrilha.get(r.citizenship_track_id) ?? null) : null,
      aderencia_percentual: r.aderencia_percentual,
      evidencias_chave: r.evidencias_chave,
    }));
    return { paises: agruparHeatmapPorPais(brutos), totalRamos: brutos.length };
  });
