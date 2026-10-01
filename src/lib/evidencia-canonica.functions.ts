/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Corte 1 (01/10/2026) — **o único escritor de evidência do sistema.**
 *
 * Decisão da Proprietária: módulo canônico; as rotas só chamam. Antes havia
 * cinco escritores em duas tabelas, e só um aplicava o grafo de transição.
 * Aqui toda gravação passa pelo mesmo caminho: valida → grava com releitura →
 * audita → registra na timeline do caso.
 *
 * Tabela canônica: `research_evidence_items` (regras em `evidencia-canonica.ts`).
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { organizacaoDo } from "@/lib/caso-canonico.server";
import { semCache } from "@/lib/no-store";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  ESTADO_INICIAL,
  estadoFinoDaLinha,
  parDeEstado,
  validarEvidencia,
  validarMudancaDeEstado,
} from "@/lib/evidencia-canonica";

/**
 * O `research_cases` deste caso. Evidência pertence à Pesquisa (decisão 2 da
 * Proprietária), e a chave de `research_evidence_items` é `research_case_id`.
 * Não cria área de pesquisa por conta própria: quem cria é
 * `prepararAreaPesquisa`, com objetivo declarado por uma pessoa.
 */
async function areaDePesquisaDoCaso(supabase: any, organizationId: string, caseId: string) {
  const { data, error } = await supabase
    .from("research_cases")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .is("archived_at", null)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw new Error(error.message);
  const id = ((data ?? []) as { id: string }[])[0]?.id ?? null;
  if (!id)
    throw new Error(
      "Este caso ainda não tem área de pesquisa. Abra a pesquisa do caso antes de registrar evidência.",
    );
  return id;
}

/** As evidências do caso, com o estado fino já resolvido. */
export const listarEvidenciasDoCaso = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string }) => {
    if (!data?.caseId) throw new Error("Caso não informado.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const researchCaseId = await areaDePesquisaDoCaso(supabase, organizationId, data.caseId);
    const { data: linhas, error } = await supabase
      .from("research_evidence_items")
      .select(
        "id,title,description,evidence_type,evidence_status,workflow_status,source_id,person_id,confidence_level,client_visibility,updated_at",
      )
      .eq("organization_id", organizationId)
      .eq("research_case_id", researchCaseId)
      .is("archived_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((linhas ?? []) as any[]).map((l) => ({
      id: l.id as string,
      titulo: (l.title as string) ?? "",
      descricao: (l.description as string | null) ?? null,
      tipo: (l.evidence_type as string) ?? "other",
      situacao: estadoFinoDaLinha(l),
      fonteId: (l.source_id as string | null) ?? null,
      pessoaId: (l.person_id as string | null) ?? null,
    }));
  });

/**
 * Cria ou edita uma evidência. **Não muda situação** — para isso existe
 * `mudarSituacaoEvidencia`, que exige justificativa e respeita o grafo.
 */
export const salvarEvidenciaCanonica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      caseId: string;
      id?: string | null;
      titulo: string;
      tipo: string;
      descricao?: string | null;
      fonteId?: string | null;
      pessoaId?: string | null;
    }) => {
      if (!data?.caseId) throw new Error("Caso é obrigatório.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const researchCaseId = await areaDePesquisaDoCaso(supabase, organizationId, data.caseId);

    const erros = validarEvidencia({ titulo: data.titulo, tipo: data.tipo });
    if (erros.length) throw new Error(erros.join(" "));

    const campos = {
      title: data.titulo.trim(),
      description: data.descricao?.trim() || null,
      evidence_type: data.tipo,
      source_id: data.fonteId || null,
      person_id: data.pessoaId || null,
    };

    const r = data.id
      ? await gravarComVerificacao({
          supabase,
          tabela: "research_evidence_items",
          id: data.id,
          organizationId,
          userId,
          payload: campos,
        })
      : await inserirComVerificacao({
          supabase,
          tabela: "research_evidence_items",
          organizationId,
          userId,
          payload: {
            ...campos,
            research_case_id: researchCaseId,
            // Toda evidência nasce no primeiro estado do grafo.
            ...parDeEstado(ESTADO_INICIAL)!,
          },
        });

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "research_evidence_items",
      entidade_id: data.id ?? (r as { id?: string }).id ?? null,
      acao: data.id ? "evidencia_atualizada" : "evidencia_registrada",
      user_id: userId,
      metadados: { case_id: data.caseId, research_case_id: researchCaseId },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: data.id ? "Evidência atualizada" : "Evidência registrada",
      summaryInternal: campos.title,
      sourceEntityType: "research_evidence_items",
      sourceEntityId: data.id ?? (r as { id?: string }).id ?? data.caseId,
      userId,
    });
    return { ok: true, id: data.id ?? (r as { id?: string }).id ?? null, salvoEm: r.salvoEm };
  });

/**
 * Muda a situação pelo grafo. Exige autor, justificativa e origem — a mesma
 * regra que antes valia em um só dos cinco escritores.
 */
export const mudarSituacaoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { caseId: string; id: string; para: string; justificativa: string; origem: string }) => {
      if (!data?.id) throw new Error("Evidência é obrigatória.");
      return data;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;

    const { data: atual } = await supabase
      .from("research_evidence_items")
      .select("id,title,workflow_status,evidence_status")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .maybeSingle();
    if (!atual) throw new Error("Evidência não encontrada nesta organização.");

    const de = estadoFinoDaLinha(atual);
    const veredito = validarMudancaDeEstado({
      de,
      para: data.para,
      autor: userId,
      justificativa: data.justificativa,
      origem: data.origem,
    });
    if (!veredito.ok) throw new Error(veredito.erro ?? "Transição não permitida.");

    const par = parDeEstado(data.para)!;
    const r = await gravarComVerificacao({
      supabase,
      tabela: "research_evidence_items",
      id: data.id,
      organizationId,
      userId,
      payload: { ...par, validation_rationale: data.justificativa.trim() },
    });

    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "research_evidence_items",
      entidade_id: data.id,
      acao: "evidencia_mudou_situacao",
      user_id: userId,
      metadados: {
        case_id: data.caseId,
        de,
        para: par.workflow_status,
        justificativa: data.justificativa.trim(),
        origem: data.origem.trim(),
      },
    });
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Situação da evidência alterada",
      summaryInternal: `${atual.title}: ${de} → ${par.workflow_status}. ${data.justificativa.trim()}`,
      sourceEntityType: "research_evidence_items",
      sourceEntityId: data.id,
      userId,
    });
    return { ok: true, situacao: par.workflow_status, salvoEm: r.salvoEm };
  });

/** Arquiva com motivo. Nunca apaga. */
export const arquivarEvidenciaCanonica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { caseId: string; id: string; motivo: string }) => {
    if ((data?.motivo ?? "").trim().length < 5)
      throw new Error("Informe o motivo (mínimo 5 letras) para arquivar a evidência.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    const organizationId = await organizacaoDo(supabase, context.userId as string);
    const userId = context.userId as string;
    const r = await gravarComVerificacao({
      supabase,
      tabela: "research_evidence_items",
      id: data.id,
      organizationId,
      userId,
      payload: {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        archive_reason: data.motivo.trim(),
      },
    });
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "research_evidence_items",
      entidade_id: data.id,
      acao: "evidencia_arquivada",
      user_id: userId,
      metadados: { case_id: data.caseId, motivo: data.motivo.trim() },
    });
    return { ok: true, salvoEm: r.salvoEm };
  });
