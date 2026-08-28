import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { bloqueiosPesquisaExterna, planoDeAcaoAberto } from "@/lib/ficha-piloto-genealogica";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Leitura da ficha piloto genealógica. Nunca consulta fonte, arquivo ou serviço externo. */
export const carregarFichaPiloto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase);

    const [pesquisa, caso] = await Promise.all([
      supabase
        .from("research_cases")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null)
        .maybeSingle(),
      supabase
        .from("crm_casos")
        .select("contrato_assinado,pagamento_confirmado")
        .eq("organization_id", organizationId)
        .eq("id", data.caseId)
        .maybeSingle(),
    ]);

    if (!pesquisa.data) {
      return { pesquisa: null, pessoas: [], vinculos: [], hipoteses: [], lacunas: [], fontes: [], solicitacoes: [], bloqueios: [], planoAberto: false };
    }
    const rid = pesquisa.data.id as string;

    const [pessoas, vinculos, hipoteses, lacunas, fontes, solicitacoes] = await Promise.all([
      supabase.from("research_people").select("*").eq("research_case_id", rid).is("archived_at", null).order("created_at"),
      supabase.from("research_relationships").select("*").eq("research_case_id", rid).is("archived_at", null),
      supabase.from("research_hypotheses").select("*").eq("case_id", data.caseId).is("archived_at", null).order("created_at"),
      supabase.from("research_pending_items").select("*").eq("research_case_id", rid).is("archived_at", null).order("severity"),
      supabase.from("research_sources").select("*").eq("research_case_id", rid).is("archived_at", null).order("created_at"),
      supabase.from("research_document_requests").select("*").eq("research_case_id", rid).is("archived_at", null).order("created_at"),
    ]);

    const ctx = {
      autorizacao: pesquisa.data.external_research_authorization_status as string,
      gate: pesquisa.data.external_research_gate_status as string,
      contrato_assinado: Boolean(caso.data?.contrato_assinado),
      pagamento_confirmado: Boolean(caso.data?.pagamento_confirmado),
    };

    return {
      pesquisa: pesquisa.data as Record<string, any>,
      pessoas: (pessoas.data ?? []) as Record<string, any>[],
      vinculos: (vinculos.data ?? []) as Record<string, any>[],
      hipoteses: (hipoteses.data ?? []) as Record<string, any>[],
      lacunas: (lacunas.data ?? []) as Record<string, any>[],
      fontes: (fontes.data ?? []) as Record<string, any>[],
      solicitacoes: (solicitacoes.data ?? []) as Record<string, any>[],
      bloqueios: bloqueiosPesquisaExterna(ctx),
      planoAberto: planoDeAcaoAberto(ctx),
    };
  });
