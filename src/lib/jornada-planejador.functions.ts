/**
 * P4 (25/09/2026) — wrappers finos de `createServerFn` sobre
 * `jornada-planejador.server.ts` (onde mora a lógica testável).
 */
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { lerJornadaDoCaso, salvarJornadaDoCaso } from "@/lib/jornada-planejador.server";
import type { CamposJornada } from "@/lib/jornada-planejador";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Leitura da jornada persistida do caso — nunca cria nada. */
export const lerJornadaPlanejador = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    return lerJornadaDoCaso(supabase, organizationId, data.caseId);
  });

/**
 * Edição pontual dos campos da jornada. Nunca cria a linha (o formulário
 * grande — "Preencher planejador" — é quem cria); recusa com mensagem clara
 * se ainda não há plano, em vez de fingir persistência.
 */
export const atualizarJornadaPlanejador = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; campos: CamposJornada }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const userId = context.userId as string;
    const organizationId = await organizacaoDo(supabase, userId);
    return salvarJornadaDoCaso(supabase, { organizationId, caseId: data.caseId, userId, campos: data.campos });
  });
