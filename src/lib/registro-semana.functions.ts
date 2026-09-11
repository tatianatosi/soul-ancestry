import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { linhas } from "@/lib/linhas";
import { semCache } from "@/lib/no-store";
import { somarDias, hojeISO } from "@/lib/painel-dia";
import { recortarRegistroSemana, type EventoRegistro } from "@/lib/registro-semana";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/** Timeline operacional da semana — `case_timeline_events`, sem tabela nova. */
export const listarRegistroSemana = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirDemo?: boolean }) => ({ incluirDemo: d?.incluirDemo === true }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const org = await orgDoUsuario(supabase, context.userId as string);
    const hoje = hojeISO();
    const inicio = `${somarDias(hoje, -6)}T00:00:00.000Z`;

    const brutos = linhas<any>(
      await supabase
        .from("case_timeline_events")
        .select("id, title, occurred_at, event_type, next_action, case_id")
        .eq("organization_id", org)
        .is("archived_at", null)
        .gte("occurred_at", inicio)
        .order("occurred_at", { ascending: false })
        .limit(80),
      "o registro da semana",
    );

    const ids = [...new Set(brutos.map((e) => String(e.case_id)))].filter(Boolean);
    const casos = ids.length
      ? linhas<any>(
          await supabase.from("crm_casos").select("id, codigo, titulo, dados_teste").in("id", ids),
          "os casos do registro da semana",
        )
      : [];
    const porId = new Map(casos.map((c) => [String(c.id), c]));

    const eventos: EventoRegistro[] = [];
    for (const e of brutos) {
      const caso = porId.get(String(e.case_id));
      if (!data.incluirDemo && caso?.dados_teste === true) continue;
      eventos.push({
        id: String(e.id),
        title: String(e.title ?? "Evento sem título"),
        occurred_at: e.occurred_at ? String(e.occurred_at) : null,
        case_id: String(e.case_id),
        case_codigo: caso?.codigo ? String(caso.codigo) : null,
        case_titulo: caso?.titulo ? String(caso.titulo) : null,
        next_action: e.next_action ? String(e.next_action) : null,
      });
    }

    return recortarRegistroSemana(eventos, hoje);
  });
