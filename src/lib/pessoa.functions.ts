import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A pessoa, e tudo que o sistema sabe dela.
 *
 * Existe porque o Desk tinha casos e não tinha gente: `clientes` é lista, e não
 * havia página de ninguém. Quem quisesse ver a história de uma pessoa tinha de
 * abrir os casos dela um a um e juntar de cabeça.
 *
 * Somente leitura. Não grava, não funde registro, não preenche o `case_id` que
 * falta nos leads — vínculo de identidade é decisão de gente, e este módulo só
 * mostra a evidência para que a decisão seja tomada com o que existe à vista.
 *
 * Usa o cliente com RLS do próprio usuário, nunca o administrativo: ler a
 * carteira da própria organização não precisa de chave secreta.
 */
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

export const carregarPessoa = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { clienteId: string }) => data)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);

    const { data: cliente } = await supabase
      .from("clientes")
      .select(
        "id, nome, nome_social, email, telefone, documento, origem, pais_interesse, status_comercial, created_at",
      )
      .eq("id", data.clienteId)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();

    if (!cliente) return { encontrada: false as const };

    const { data: casos } = await supabase
      .from("crm_casos")
      .select(
        "id, codigo, titulo, fase, pais, via, data_entrada, ativo, prioridade, proxima_acao, prazo_proxima_acao",
      )
      .eq("cliente_id", cliente.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("data_entrada", { ascending: true });

    const listaCasos = (casos ?? []) as Linha[];
    const ids = listaCasos.map((c) => c.id);

    const { data: eventos } = ids.length
      ? await supabase
          .from("case_timeline_events")
          .select(
            "case_id, occurred_at, created_at, title, phase, status, summary_internal, responsavel_nome, bloqueio, alerta",
          )
          .in("case_id", ids)
          .is("archived_at", null)
          .order("occurred_at", { ascending: true })
          .limit(500)
      : { data: [] };

    /*
      Leads candidatos. O elo `leads.case_id` está nulo em todo o banco, então
      não há como percorrer o caminho oficial: sobra procurar evidência.
      A carteira de leads é pequena; quando deixar de ser, isto vira consulta
      filtrada por e-mail e telefone normalizados no próprio banco.
    */
    const { data: leads } = await supabase
      .from("leads")
      .select(
        "id, nome, email, telefone, estagio, origem, created_at, case_id, call_realizada_em, discovery_resultado",
      )
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .limit(500);

    return {
      encontrada: true as const,
      cliente: cliente as Linha,
      casos: listaCasos,
      eventos: (eventos ?? []) as Linha[],
      leads: (leads ?? []) as Linha[],
    };
  });
