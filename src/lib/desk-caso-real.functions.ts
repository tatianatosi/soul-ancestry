import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { semCache } from "@/lib/no-store";
import { contextoInterno } from "@/lib/comercial.server";
import { identidadeDeCrmCaso, type IdentidadeCaso } from "@/lib/caso-compartilhado";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Leitura real das superfícies do Desk para UM caso.
 *
 * Existe porque a prancha `/previa-desk` é visual e demonstrativa: esta função
 * liga as mesmas 15 superfícies às tabelas que já são donas do dado, sempre
 * pela sessão autenticada (RLS da organização). Nenhuma escrita, nenhuma
 * automação, nenhum dado inventado: bloco sem registro volta vazio e bloco que
 * falhou volta com o erro, para "vazio" nunca se confundir com "não carregou".
 */

export type BlocoDesk<T> = { linhas: T[]; erro: string | null };

export type ResumoDeskCaso = {
  identidade: IdentidadeCaso;
  status: string | null;
  proximaAcao: string | null;
  responsavelProximaAcao: string | null;
  prazoProximaAcao: string | null;
  pessoas: BlocoDesk<Record<string, any>>;
  dependentes: BlocoDesk<Record<string, any>>;
  tarefas: BlocoDesk<Record<string, any>>;
  alertas: BlocoDesk<Record<string, any>>;
  timeline: BlocoDesk<Record<string, any>>;
  checklist: BlocoDesk<Record<string, any>>;
  gates: BlocoDesk<Record<string, any>>;
  pesquisa: BlocoDesk<Record<string, any>>;
  evidencias: BlocoDesk<Record<string, any>>;
  documentos: BlocoDesk<Record<string, any>>;
  projecoes: BlocoDesk<Record<string, any>>;
  contratos: BlocoDesk<Record<string, any>>;
  propostas: BlocoDesk<Record<string, any>>;
  faturas: BlocoDesk<Record<string, any>>;
  interacoes: BlocoDesk<Record<string, any>>;
};

async function bloco(consulta: PromiseLike<{ data: any; error: any }>): Promise<BlocoDesk<Record<string, any>>> {
  try {
    const { data, error } = await consulta;
    if (error) return { linhas: [], erro: String(error.message ?? error) };
    return { linhas: (data ?? []) as Record<string, any>[], erro: null };
  } catch (e) {
    return { linhas: [], erro: e instanceof Error ? e.message : "Falha de leitura" };
  }
}

/** Caso canônico do Desk, buscado por código humano (ex.: CA-CID-AT-FAM-2026-001). */
export const resumoDeskDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { codigo?: string; casoId?: string }) => data ?? {})
  .handler(async ({ data, context }): Promise<ResumoDeskCaso> => {
    semCache();
    const supabase = context.supabase as any;
    const { organizationId } = await contextoInterno(supabase, context.userId as string);

    let consulta = supabase
      .from("crm_casos")
      .select("id, codigo, titulo, status, proxima_acao, proxima_acao_responsavel, prazo_proxima_acao")
      .eq("organization_id", organizationId)
      .limit(1);
    consulta = data.casoId ? consulta.eq("id", data.casoId) : consulta.eq("codigo", data.codigo ?? "CA-CID-AT-FAM-2026-001");

    const { data: casos, error } = await consulta;
    if (error) throw new Error(`Falha ao carregar o caso: ${error.message}`);
    const caso = (casos ?? [])[0];
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    const id = caso.id as string;
    const emCaso = (tabela: string, colunas: string, coluna = "case_id") =>
      supabase.from(tabela).select(colunas).eq("organization_id", organizationId).eq(coluna, id);

    const [
      pessoas,
      dependentes,
      tarefas,
      alertas,
      timeline,
      checklist,
      gates,
      pesquisa,
      evidencias,
      documentos,
      projecoes,
      contratos,
      propostas,
      faturas,
      interacoes,
    ] = await Promise.all([
      bloco(emCaso("case_members", "id, nome, papel_no_caso, parentesco, status_cadastral, requerente").is("archived_at", null)),
      bloco(emCaso("case_dependents", "id, nome_completo, vinculo_com_titular, status_representacao, participa_do_contrato").is("archived_at", null)),
      bloco(emCaso("tarefas", "id, titulo, status, prioridade, prazo, bloqueio, motivo_bloqueio, responsavel_id", "caso_id").is("archived_at", null)),
      bloco(emCaso("case_alerts", "id, titulo, detalhe, criticidade, status, due_at, tipo")),
      bloco(emCaso("case_timeline_events", "id, title, phase, status, occurred_at, due_at, next_action, responsavel_nome, bloqueio, alerta").order("occurred_at", { ascending: false }).limit(20)),
      bloco(emCaso("case_checklist_items", "id, label, fase, status, obrigatorio, ordem").order("ordem", { ascending: true })),
      bloco(emCaso("case_activation_checks", "id, label, dominio, status, obrigatorio, observacao")),
      bloco(emCaso("research_cases", "id, status, research_objective, next_research_action, next_research_action_due_at, confidence_level, client_summary_status")),
      bloco(emCaso("evidences", "id, titulo, workflow_status, tipo_fonte, created_at")),
      bloco(emCaso("documents", "id, titulo, status, categoria, liberado_cliente, created_at").is("archived_at", null)),
      bloco(emCaso("app_projections", "id, projection_type, approval_status, destination, effective_from, visibility_scope")),
      bloco(emCaso("contracts", "id, contract_number, title, status, signed_at, research_gate_status, financial_gate_status")),
      bloco(emCaso("proposals", "id, versao, status, valor, moeda, enviada_em, aprovada_em")),
      bloco(emCaso("invoices", "id, numero, valor, moeda, status, vencimento, paga_em")),
      bloco(emCaso("crm_interactions", "id, tipo, canal, ocorrida_em, resumo")),
    ]);

    return {
      identidade: identidadeDeCrmCaso(caso),
      status: caso.status ?? null,
      proximaAcao: caso.proxima_acao ?? null,
      responsavelProximaAcao: caso.proxima_acao_responsavel ?? null,
      prazoProximaAcao: caso.prazo_proxima_acao ?? null,
      pessoas,
      dependentes,
      tarefas,
      alertas,
      timeline,
      checklist,
      gates,
      pesquisa,
      evidencias,
      documentos,
      projecoes,
      contratos,
      propostas,
      faturas,
      interacoes,
    };
  });
