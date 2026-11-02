import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";

/**
 * Trilhas jurídicas internas e marcos de referência (Biblioteca Mestre).
 * Conteúdo interno: nunca projetado no App Cliente e nunca apresentado como
 * parecer jurídico, garantia de direito ou instrução automática ao cliente.
 */

export type TrilhaJuridica = {
  id: string;
  code: string | null;
  pais: string | null;
  track_name: string | null;
  via_preliminar: string | null;
  status_via: string | null;
  legal_reference_label: string | null;
  legal_reference_summary: string | null;
  official_source_name: string | null;
  official_source_url: string | null;
  revisao_humana_juridica: string | null;
  idioma_entrevista: string | null;
  autorizacao_pesquisa_necessaria: boolean | null;
  lifecycle_status: string;
  versao: string | null;
  ultima_revisao_em: string | null;
};

export type MarcoJuridico = {
  id: string;
  track_id: string;
  label: string;
  reference_type: string;
  summary_internal: string | null;
  official_source_url: string | null;
  status: string;
  review_required: string;
  verified_at: string | null;
  versao: string | null;
  lifecycle_status: string;
};

/** Trilhas + marcos disponíveis como referência de triagem no Painel de Calls. */
export const listarTrilhasJuridicas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const [trilhas, marcos] = await Promise.all([
      supabase
        .from("citizenship_tracks")
        .select(
          "id,code,pais,track_name,via_preliminar,status_via,legal_reference_label,legal_reference_summary,official_source_name,official_source_url,revisao_humana_juridica,idioma_entrevista,autorizacao_pesquisa_necessaria,lifecycle_status,versao,ultima_revisao_em",
        )
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("pais"),
      supabase
        .from("legal_reference_milestones")
        .select(
          "id,track_id,label,reference_type,summary_internal,official_source_url,status,review_required,verified_at,versao,lifecycle_status",
        )
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("label"),
    ]);
    if (trilhas.error) throw new Error(trilhas.error.message);
    return {
      trilhas: (trilhas.data ?? []) as TrilhaJuridica[],
      marcos: (marcos.data ?? []) as MarcoJuridico[],
    };
  });
