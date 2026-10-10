import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Encontros de linhagem publicados para a aba Legado do App Cliente (Bloco 5C).
 *
 * Consome estritamente registros curados com `resumo_aprovado_cliente`
 * preenchido e sanitizado, protegendo o cliente contra dados brutos de pesquisa.
 */
export type EncontroLinhagemApp = {
  id: string;
  titulo: string;
  contextoHistorico: string | null;
  territoriosMigratorios: string | null;
  memoriaFamiliar: string | null;
  resumoAprovado: string;
  criadoEm: string;
};

export const listarEncontrosLinhagemApp = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }): Promise<EncontroLinhagemApp[]> => {
    semCache();
    const supabase = (context as any).supabase;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: encontros, error } = await supabase
      .from("lineage_encounters")
      .select("id,title_client,title_internal,contexto_historico,territorios_migratorios,memoria_familiar,resumo_aprovado_cliente,created_at")
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .not("resumo_aprovado_cliente", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[legado] Falha ao ler lineage_encounters para o App:", error.message);
      return [];
    }

    return ((encontros ?? []) as any[]).map((e) => ({
      id: String(e.id),
      titulo: String(e.title_client || e.title_internal || "Encontro de Linhagem"),
      contextoHistorico: e.contexto_historico ?? null,
      territoriosMigratorios: e.territorios_migratorios ?? null,
      memoriaFamiliar: e.memoria_familiar ?? null,
      resumoAprovado: String(e.resumo_aprovado_cliente),
      criadoEm: String(e.created_at),
    }));
  });
