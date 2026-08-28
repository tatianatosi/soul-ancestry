import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { contextoInterno } from "@/lib/comercial.server";
import { ehProprietariaAdministradora } from "@/lib/modo-proprietaria";
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 28/08/2026 — "preciso com o acesso master ter acesso ao app cliente como
 * pessoa" (Proprietária). Só existia uma demo com dado fictício (Sophia),
 * sem consulta real. Esta função é a irmã autorizada de `dadosVivosDoPortal`
 * (CA-PORTAL-02): mesma forma de saída ({projecoes, documentos}), mesma
 * fonte (`portal_projecoes.content_sanitized`, já a projeção sanitizada —
 * nunca dado bruto do Desk/Mestre/Planejador), mas autorizada por papel de
 * staff dentro da organização em vez de `client_portal_access` do cliente.
 * Somente leitura; nenhum dado é alterado, nenhuma comunicação é disparada.
 */
export const dadosVivosDoPortalComoAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string }) => {
    if (!data?.casoId) throw new Error("Selecione um caso.");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ projecoes: ProjecaoBruta[]; documentos: DocumentoPortal[] }> => {
    semCache();
    const supabase = context.supabase as any;
    const { organizationId, papel } = await contextoInterno(supabase, context.userId as string);
    if (!ehProprietariaAdministradora(papel)) {
      throw new Error("Somente a Proprietária Administradora pode abrir o App Cliente como uma pessoa real.");
    }

    const caso = await supabase
      .from("crm_casos")
      .select("id")
      .eq("id", data.casoId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const [proj, docs] = await Promise.all([
      supabase
        .from("portal_projecoes")
        .select("id, case_id, projection_type, content_sanitized, effective_from, updated_at")
        .eq("case_id", data.casoId),
      supabase.from("documents").select("id, liberado_cliente, origem, is_demo").eq("case_id", data.casoId),
    ]);

    return {
      projecoes: (proj.data ?? []) as ProjecaoBruta[],
      documentos: (docs.data ?? []) as DocumentoPortal[],
    };
  });
