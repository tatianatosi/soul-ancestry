import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { kitContratualDoCaso, type CasoDoKit, type EntradaKit } from "@/lib/kit-contratual-do-caso";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura (somente) do que o Kit Contratual mostra para um caso. Usa o client da
 * sessão: a RLS decide o que a pessoa pode ver. Falha de leitura é erro, nunca
 * "nenhum registro" (fail-closed).
 */
export const kitContratualDoCasoFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => {
    const caseId = String((data as any)?.caseId ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(caseId)) throw new Error("Caso inválido.");
    return { caseId };
  })
  .handler(async ({ data, context }): Promise<CasoDoKit> => {
    const supabase = (context as any).supabase;
    const ler = async <T>(
      p: PromiseLike<{ data: T; error: { message: string } | null }>,
    ): Promise<T> => {
      const r = await p;
      if (r.error) throw new Error(r.error.message);
      return r.data;
    };

    const caso: any = await ler(
      supabase
        .from("crm_casos")
        .select("id, codigo, cliente_id, responsavel_principal, data_entrada, pais, pais_linha_prioritaria")
        .eq("id", data.caseId)
        .maybeSingle(),
    );
    if (!caso) throw new Error("Caso não encontrado.");

    const cliente: any = caso.cliente_id
      ? await ler(supabase.from("clientes").select("nome").eq("id", caso.cliente_id).maybeSingle())
      : null;

    const contrato: any = await ler(
      supabase
        .from("contracts")
        .select("id, contract_number, status, signed_at, approved_for_send_at, created_at")
        .eq("case_id", data.caseId)
        .eq("contract_type", "contract_base")
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    );

    const [versao, ordemServico, despesas, anexos, eventos]: any[] = await Promise.all([
      contrato
        ? ler(
            supabase
              .from("contract_versions")
              .select("version_number, created_at")
              .eq("contract_id", contrato.id)
              .is("archived_at", null)
              .order("version_number", { ascending: false })
              .limit(1)
              .maybeSingle(),
          )
        : Promise.resolve(null),
      ler(
        supabase
          .from("service_orders")
          .select(
            "service_order_number, status, versao, scope_summary, deliverable_summary, start_date, case_id",
          )
          .eq("case_id", data.caseId)
          .is("archived_at", null)
          .order("versao", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ),
      ler(
        supabase
          .from("third_party_expenses")
          .select(
            "descricao, categoria, estado, pagador, estimativa_min, estimativa_max, valor_pago, moeda, aprovado_pelo_cliente_em, observacoes",
          )
          .eq("case_id", data.caseId)
          .is("archived_at", null)
          .order("created_at", { ascending: true }),
      ),
      ler(
        supabase
          .from("contract_annexes")
          .select("annex_code, status, annex_version, structured_data")
          .eq("case_id", data.caseId)
          .is("archived_at", null),
      ),
      contrato
        ? ler(
            supabase
              .from("contract_review_events")
              .select("id, event_type, occurred_at, created_at")
              .eq("contract_id", contrato.id)
              .order("occurred_at", { ascending: false })
              .limit(30),
          )
        : Promise.resolve([]),
    ]);

    const entrada: EntradaKit = {
      caso: {
        id: caso.id,
        codigo: caso.codigo ?? null,
        clienteNome: cliente?.nome ?? null,
        responsavel: caso.responsavel_principal ?? null,
        abertoEm: caso.data_entrada ?? null,
        pais: caso.pais_linha_prioritaria ?? caso.pais ?? null,
      },
      contrato: contrato ?? null,
      versao: versao ?? null,
      ordemServico: ordemServico ?? null,
      despesas: despesas ?? [],
      anexos: anexos ?? [],
      eventos: eventos ?? [],
    };
    return kitContratualDoCaso(entrada);
  });
