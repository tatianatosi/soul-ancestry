import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import type { DocumentoPortal } from "@/lib/portal-dados-vivos";
import type { ProjecaoBruta } from "@/lib/projecoes-cliente";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * CA-PORTAL-02 — leitura viva do portal, sempre pelo client autenticado do
 * próprio usuário (RLS decide no banco). Nenhuma tabela interna sem policy de
 * portal é consultada; nenhum filtro de segurança vive no React.
 *
 * `casoId` opcional é apenas um recorte: caso não autorizado simplesmente não
 * retorna linha em `portal_casos`, e a leitura devolve conjunto vazio.
 */
export const dadosVivosDoPortal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId?: string } | undefined) => data ?? {})
  .handler(async ({ data, context }): Promise<{ projecoes: ProjecaoBruta[]; documentos: DocumentoPortal[] }> => {
    semCache();
    const supabase = context.supabase as any;

    const casos = await supabase.from("portal_casos").select("id");
    const permitidos = ((casos.data ?? []) as { id: string }[]).map((c) => String(c.id));
    const alvo = data.casoId ? permitidos.filter((id) => id === data.casoId) : permitidos;
    if (alvo.length === 0) return { projecoes: [], documentos: [] };

    const [proj, docs] = await Promise.all([
      supabase
        .from("portal_projecoes")
        .select("id, case_id, projection_type, content_sanitized, effective_from, updated_at")
        .in("case_id", alvo),
      supabase.from("documents").select("id, liberado_cliente, origem, is_demo").in("case_id", alvo),
    ]);

    return {
      projecoes: (proj.data ?? []) as ProjecaoBruta[],
      documentos: (docs.data ?? []) as DocumentoPortal[],
    };
  });
