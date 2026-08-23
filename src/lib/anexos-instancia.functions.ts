import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { InstanciaPersistida } from "@/lib/anexos-instancia";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura somente-metadados das instâncias documentais de anexos de um caso.
 * Não devolve notas internas nem HTML bruto — apenas o suficiente para provar
 * qual versão salva a tela autenticada está apontando.
 */
export const instanciasDocumentaisDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const caseId = String((data as any)?.caseId ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(caseId)) throw new Error("Caso inválido.");
    return { caseId };
  })
  .handler(async ({ data, context }): Promise<InstanciaPersistida[]> => {
    const supabase = (context as any).supabase;
    const { data: linhas, error } = await supabase
      .from("contract_annexes")
      .select("annex_code,title,status,annex_version,model_version,file_hash,rendered_html,structured_data,updated_at,created_at,is_test")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("annex_version", { ascending: true });
    if (error) throw new Error(error.message);

    return ((linhas ?? []) as any[]).map((l) => ({
      annex_code: l.annex_code,
      title: l.title ?? l.annex_code,
      status: l.status,
      annex_version: l.annex_version ?? 1,
      model_version: l.model_version ?? null,
      file_hash: l.file_hash ?? null,
      tem_conteudo: Boolean(l.rendered_html) && Boolean(l.structured_data),
      atualizado_em: l.updated_at ?? l.created_at ?? null,
      is_test: Boolean(l.is_test),
    }));
  });
