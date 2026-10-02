/**
 * Casca HTTP de `ficha-master.server.ts`. Única rota de leitura da Ficha
 * Master com dado real (Prioridade 1 da sequência de 02/10/2026).
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { montarCaseDataReal } from "@/lib/ficha-master.server";
import { toFichaPiloto } from "@/lib/caseAdapter";
import { semCache } from "@/lib/no-store";

export const obterFichaMasterReal = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const caseData = await montarCaseDataReal({ supabase, organizationId, caseId: data.caseId });
    return { caseData, ficha: toFichaPiloto(caseData) };
  });
