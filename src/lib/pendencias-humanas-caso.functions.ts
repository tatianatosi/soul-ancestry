/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Corte U3 (28/09/2026) — leitura das decisões humanas pendentes de um caso.
 * Só leitura; nunca altera dado real.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { pendenciasHumanasDoCaso, type PendenciaHumana } from "@/lib/pendencias-humanas-caso";

export const lerPendenciasHumanasCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }): Promise<PendenciaHumana[]> => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

    const { data: caso, error } = await supabase
      .from("crm_casos")
      .select("id,via_juridica_preliminar,dossie_mae_referencia,lead_id")
      .eq("id", data.caseId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!caso) return [];

    const { data: nucleos } = await supabase
      .from("nucleos_familiares")
      .select("id,dossie_mae")
      .eq("case_id", caso.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null);
    const listaNucleos = (nucleos ?? []) as { id: string; dossie_mae: string | null }[];
    const idsNucleo = listaNucleos.map((n) => n.id);

    const membros = idsNucleo.length
      ? (((
          await supabase
            .from("nucleo_membros")
            .select("nome,papel,papel_no_caso,vinculo,cliente_id,representacao_necessaria")
            .in("nucleo_id", idsNucleo)
            .is("archived_at", null)
        ).data ?? []) as any[])
      : [];
    const idsPessoa = Array.from(new Set(membros.map((m) => m.cliente_id).filter(Boolean)));
    const nascimentos = idsPessoa.length
      ? new Map(
          (((
            await supabase.from("clientes").select("id,data_nascimento").is("archived_at", null).eq("organization_id", organizationId).in("id", idsPessoa)
          ).data ?? []) as { id: string; data_nascimento: string | null }[]).map((c) => [c.id, c.data_nascimento]),
        )
      : new Map<string, string | null>();

    /*
     * Retificação de 07/10/2026: `case_dependents` é onde a decisão humana de
     * representação fica registrada; `nucleo_membros.representacao_necessaria`
     * é espelho e estava defasado. A pendência de menor passa a consultar o
     * registro vigente — leitura reconciliada, nenhum status alterado.
     */
    const { data: dependentes } = await supabase
      .from("case_dependents")
      .select("nome_completo,status_representacao")
      .eq("case_id", caso.id)
      .is("archived_at", null);
    const statusPorNome = new Map(
      ((dependentes ?? []) as { nome_completo: string | null; status_representacao: string | null }[]).map((d) => [
        String(d.nome_completo ?? "").trim().toLocaleLowerCase("pt-BR"),
        d.status_representacao,
      ]),
    );

    const filtros = [`case_id.eq.${caso.id}`];
    if (caso.lead_id) filtros.push(`id.eq.${caso.lead_id}`);
    for (const id of idsNucleo) filtros.push(`nucleo_id.eq.${id}`);
    const { data: leads } = await supabase
      .from("leads")
      .select("nome,via_juridica_preliminar,dados_teste")
      .is("archived_at", null)
      .eq("organization_id", organizationId)
      .or(filtros.join(","));

    return pendenciasHumanasDoCaso({
      caso,
      nucleo: listaNucleos.find((n) => n.dossie_mae) ?? null,
      membros: membros.map((m) => ({
        ...m,
        data_nascimento: m.cliente_id ? (nascimentos.get(m.cliente_id) ?? null) : null,
        status_representacao: statusPorNome.get(String(m.nome ?? "").trim().toLocaleLowerCase("pt-BR")) ?? null,
      })),
      leads: (leads ?? []) as any[],
    });
  });
