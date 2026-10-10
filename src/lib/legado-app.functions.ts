import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { casoAutorizado } from "@/lib/portal-cliente.server";

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
  territoriosMigratorios: string | null;
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

    // Isolamento A×B: o caso precisa estar liberado para ESTE cliente na view
    // do portal (RLS). Caso alheio ou não liberado devolve lista vazia.
    const caso = await casoAutorizado(supabase, data.caseId);
    if (!caso?.organization_id) return [];

    // Os encontros não têm política de leitura para o cliente: a leitura é feita
    // no servidor, depois da autorização acima, e só devolve o que foi aprovado
    // e sanitizado (nunca contexto, memória ou títulos internos).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: encontros, error } = await (supabaseAdmin as any)
      .from("lineage_encounters")
      .select("id,title_client,territorios_migratorios,resumo_aprovado_cliente,created_at")
      .eq("organization_id", caso.organization_id)
      .eq("case_id", caso.id)
      .eq("approval_status", "aprovado")
      .is("archived_at", null)
      .not("resumo_aprovado_cliente", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("[legado] Falha ao ler lineage_encounters para o App:", error.message);
      return [];
    }

    return ((encontros ?? []) as any[]).map((e) => ({
      id: String(e.id),
      titulo: String(e.title_client || "Encontro de Linhagem"),
      territoriosMigratorios: e.territorios_migratorios ?? null,
      resumoAprovado: String(e.resumo_aprovado_cliente),
      criadoEm: String(e.created_at),
    }));
  });
