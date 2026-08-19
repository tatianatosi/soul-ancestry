import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Linha = Record<string, any>;

async function organizacaoDo(supabase: any) {
  const { data } = await supabase
    .from("organization_members")
    .select("organization_id")
    .is("archived_at", null)
    .maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}


/** Carrega a ficha operacional canônica do caso (dados reais, sem inferência). */
export const carregarFichaCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);

    const caso = await supabase
      .from("crm_casos")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!caso.data) throw new Error("Caso não encontrado nesta organização.");

    const [membros, log, cliente, nucleos, planos] = await Promise.all([
      supabase
        .from("case_members")
        .select("*")
        .eq("case_id", data.id)
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("caso_log")
        .select("*")
        .eq("case_id", data.id)
        .order("created_at", { ascending: false })
        .limit(80),
      caso.data.cliente_id
        ? supabase.from("clientes").select("id, nome, email, telefone").eq("id", caso.data.cliente_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("nucleos_familiares").select("*").eq("case_id", data.id).is("archived_at", null),
      supabase.from("tarefas").select("id").eq("caso_id", data.id).limit(1),
    ]);

    return {
      caso: caso.data as Linha,
      membros: (membros.data ?? []) as Linha[],
      log: (log.data ?? []) as Linha[],
      cliente: (cliente as any)?.data ?? null,
      nucleoOk: ((nucleos.data ?? []) as Linha[]).length > 0,
      planoInicialOk: ((planos.data ?? []) as Linha[]).length > 0,
    };
  });

/** Lista enxuta de casos para a aba Casos do Desk. */
export const listarCasosFicha = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);
    const { data, error } = await supabase
      .from("crm_casos")
      .select("*")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { casos: (data ?? []) as Linha[] };
  });
