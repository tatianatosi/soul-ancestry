import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { bloqueiosPesquisaExterna, pessoaComPerfilMaisCompleto, planoDeAcaoAberto } from "@/lib/ficha-piloto-genealogica";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Leitura da ficha piloto genealógica. Nunca consulta fonte, arquivo ou serviço externo. */
export const carregarFichaPiloto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => data)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);

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

    const [pessoasRaw, vinculos, hipoteses, lacunas, fontes, solicitacoes] = await Promise.all([
      supabase.from("research_people").select("*").eq("research_case_id", rid).is("archived_at", null).order("created_at"),
      /*
       * 04/09/2026 — reapontado de research_relationships (ficha piloto, só
       * leitura, migration de 16/08) para genealogical_relationships (módulo
       * real de Pessoas e Linhagens, editável, migration de 20/08). Um
       * vínculo criado pela tela real de Pessoas e Linhagens não aparecia
       * aqui antes desta correção. person_from_id/person_to_id/relation_type
       * substituem person_a_id/person_b_id/relationship_type — mesmo
       * conceito, nomes da tabela real (docs/auditorias/2026-09-04-nucleos-pessoa-360-contrato-acesso-app-cliente.md,
       * seção 5.1). confidence_level/status/directionality/
       * supporting_evidence_count migrados para genealogical_relationships
       * na mesma rodada (migration 20260904190000).
       */
      supabase.from("genealogical_relationships").select("*").eq("case_id", data.caseId).is("archived_at", null),
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

    // P32b (26/09/2026) — "entre ficha piloto e ficha genealógica prevalece
    // a mais completa": genealogical_person_profiles.research_person_id é FK
    // obrigatória para a mesma linha de research_people que esta ficha lista.
    // A Ficha Piloto nunca lia esse perfil — mostrava só a identidade mínima
    // que ela mesma grava. Busca os perfis das pessoas já carregadas e deixa
    // o dado mais completo (nascimento/óbito/sexo) prevalecer na exibição,
    // sem nunca escrever de volta em research_people.
    const pessoasBrutas = (pessoasRaw.data ?? []) as Record<string, any>[];
    const idsPessoas = pessoasBrutas.map((p) => p.id as string);
    const { data: perfisRaw } = idsPessoas.length
      ? await supabase
          .from("genealogical_person_profiles")
          .select("research_person_id, nascimento_data, nascimento_localidade, morte_data, morte_localidade, sexo")
          .eq("organization_id", organizationId)
          .in("research_person_id", idsPessoas)
          .is("archived_at", null)
      : { data: [] };
    const perfilPorPessoaId = new Map<string, { research_person_id: string; [k: string]: any }>(
      ((perfisRaw ?? []) as Record<string, any>[]).map((p) => [p.research_person_id as string, p as any]),
    );
    const pessoas = pessoasBrutas.map((p) =>
      pessoaComPerfilMaisCompleto(p as Record<string, any> & { id: string }, perfilPorPessoaId.get(p.id as string)),
    );

    return {
      pesquisa: pesquisa.data as Record<string, any>,
      pessoas: pessoas as Record<string, any>[],
      vinculos: (vinculos.data ?? []) as Record<string, any>[],
      hipoteses: (hipoteses.data ?? []) as Record<string, any>[],
      lacunas: (lacunas.data ?? []) as Record<string, any>[],
      fontes: (fontes.data ?? []) as Record<string, any>[],
      solicitacoes: (solicitacoes.data ?? []) as Record<string, any>[],
      bloqueios: bloqueiosPesquisaExterna(ctx),
      planoAberto: planoDeAcaoAberto(ctx),
    };
  });
