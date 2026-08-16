import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  BLOCOS,
  contextoRg,
  exigirEdicao,
  limparCamposRg,
  PAPEIS_LE_RESUMO,
  pesquisaAutorizada,
  type BlocoRg,
  type Sb,
} from "@/lib/pesquisa-modulo.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Painel geral: pesquisas da organização com contadores e gates. */
export const painelPesquisaModulo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    if (!PAPEIS_LE_RESUMO.includes(papel)) throw new Error("Seu papel não acessa a pesquisa.");

    const [pesquisas, casos, pendencias, evidencias, issues] = await Promise.all([
      supabase
        .from("research_cases")
        .select("*")
        .eq("organization_id", organizationId)
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,status,pais,responsavel_id,contrato_assinado,pagamento_confirmado")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("research_pending_items")
        .select("id,research_case_id,severity,status,due_at,title")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("research_evidence_items")
        .select("id,research_case_id,evidence_status")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("quality_issues")
        .select("id,case_id,severidade,status,titulo")
        .eq("organization_id", organizationId)
        .eq("dominio", "pesquisa")
        .in("status", ["aberta", "reconhecida"]),
    ]);

    const listaCasos = (casos.data ?? []) as Record<string, any>[];
    const listaPend = (pendencias.data ?? []) as Record<string, any>[];
    const listaEvid = (evidencias.data ?? []) as Record<string, any>[];
    const mapaCaso = new Map(listaCasos.map((c) => [c["id"], c]));

    const linhas = ((pesquisas.data ?? []) as Record<string, any>[]).map((p) => {
      const pend = listaPend.filter(
        (x) => x["research_case_id"] === p["id"] && ["open", "in_progress", "blocked"].includes(x["status"]),
      );
      return {
        ...p,
        caso: mapaCaso.get(p["case_id"]) ?? null,
        pendencias_criticas: pend.filter((x) => x["severity"] === "critical").length,
        pendencias_altas: pend.filter((x) => x["severity"] === "high").length,
        pendencias_vencidas: pend.filter((x) => x["due_at"] && new Date(x["due_at"]) < new Date()).length,
        evidencias_revisao: listaEvid.filter(
          (x) => x["research_case_id"] === p["id"] && x["evidence_status"] === "under_review",
        ).length,
      } as Record<string, any>;
    });

    return {
      papel,
      pesquisas: linhas,
      inconsistencias: (issues.data ?? []) as Record<string, any>[],
      casosSemPesquisa: listaCasos.filter(
        (c) => !linhas.some((l) => l["case_id"] === c["id"]),
      ),
    };
  });

/** Cria a camada de pesquisa para um caso existente (nunca cria caso novo). */
export const criarPesquisaParaCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; objetivo: string; contexto?: string }) => {
    if (!data.casoId) throw new Error("Informe o caso.");
    if (!data.objetivo || data.objetivo.trim().length < 10) {
      throw new Error("Descreva o objetivo da pesquisa (mínimo de 10 caracteres).");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId } = await contextoRg(supabase, userId);

    const existente = await supabase
      .from("research_cases")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("case_id", data.casoId)
      .maybeSingle();
    if (existente.data?.id) return { id: existente.data.id as string, jaExistia: true };

    const { data: linha, error } = await supabase
      .from("research_cases")
      .insert({
        organization_id: organizationId,
        case_id: data.casoId,
        status: "preparation",
        research_objective: data.objetivo.trim(),
        country_context: data.contexto?.trim() || null,
        assigned_researcher_user_id: userId,
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string, jaExistia: false };
  });

/** Dossiê completo de uma pesquisa, com gate externo e auditoria. */
export const carregarPesquisaModulo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; incluirArquivados?: boolean }) => {
    if (!data.researchCaseId) throw new Error("Informe a pesquisa.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    if (!PAPEIS_LE_RESUMO.includes(papel)) throw new Error("Seu papel não acessa a pesquisa.");

    const { pesquisa, caso, podeEditar } = await pesquisaAutorizada(
      supabase,
      organizationId,
      papel,
      userId,
      data.researchCaseId,
    );

    const detalhado = papel !== "comercial" && papel !== "financeiro";
    const arquivados = Boolean(data.incluirArquivados);
    const lista = (tabela: string) => {
      let q = supabase
        .from(tabela)
        .select("*")
        .eq("organization_id", organizationId)
        .eq("research_case_id", data.researchCaseId)
        .order("created_at", { ascending: true });
      if (!arquivados) q = q.is("archived_at", null);
      return q;
    };

    if (!detalhado) {
      const gateResumo = await supabase.rpc("pode_iniciar_pesquisa_externa", { _rc: data.researchCaseId });
      return {
        papel,
        podeEditar: false,
        detalhado,
        pesquisa,
        caso,
        gate: gateResumo.data ?? null,
        pessoas: [],
        variantes: [],
        relacoes: [],
        eventos: [],
        fontes: [],
        evidencias: [],
        vinculos: [],
        hipoteses: [],
        pedidos: [],
        pendencias: [],
        relatorios: [],
        resumos: [],
        auditoria: [],
        inconsistencias: [],
      };
    }

    const [
      pessoas,
      relacoes,
      eventos,
      fontes,
      evidencias,
      hipoteses,
      pedidos,
      pendencias,
      relatorios,
      resumos,
      auditoria,
      gate,
      issues,
    ] = await Promise.all([
      lista("research_people"),
      lista("research_relationships"),
      lista("research_case_events"),
      lista("research_sources"),
      lista("research_evidence_items"),
      lista("research_case_hypotheses"),
      lista("research_document_requests"),
      lista("research_pending_items"),
      lista("research_reports"),
      lista("research_client_summaries"),
      supabase
        .from("research_audit_events")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("research_case_id", data.researchCaseId)
        .order("occurred_at", { ascending: false })
        .limit(100),
      supabase.rpc("pode_iniciar_pesquisa_externa", { _rc: data.researchCaseId }),
      supabase
        .from("quality_issues")
        .select("id,regra_key,severidade,status,titulo,detalhe")
        .eq("organization_id", organizationId)
        .eq("case_id", pesquisa["case_id"])
        .in("status", ["aberta", "reconhecida"]),
    ]);

    const idsPessoas = ((pessoas.data ?? []) as Record<string, any>[]).map((p) => p["id"]);
    const idsEvid = ((evidencias.data ?? []) as Record<string, any>[]).map((e) => e["id"]);

    const [variantes, vinculos] = await Promise.all([
      idsPessoas.length
        ? supabase
            .from("research_name_variants")
            .select("*")
            .eq("organization_id", organizationId)
            .in("person_id", idsPessoas)
            .is("archived_at", null)
        : Promise.resolve({ data: [] }),
      idsEvid.length
        ? supabase
            .from("research_evidence_links")
            .select("*")
            .eq("organization_id", organizationId)
            .in("evidence_item_id", idsEvid)
            .is("archived_at", null)
        : Promise.resolve({ data: [] }),
    ]);

    return {
      papel,
      podeEditar,
      detalhado,
      pesquisa,
      caso,
      gate: (gate as any).data ?? null,
      pessoas: (pessoas.data ?? []) as Record<string, any>[],
      variantes: ((variantes as any).data ?? []) as Record<string, any>[],
      relacoes: (relacoes.data ?? []) as Record<string, any>[],
      eventos: (eventos.data ?? []) as Record<string, any>[],
      fontes: (fontes.data ?? []) as Record<string, any>[],
      evidencias: (evidencias.data ?? []) as Record<string, any>[],
      vinculos: ((vinculos as any).data ?? []) as Record<string, any>[],
      hipoteses: (hipoteses.data ?? []) as Record<string, any>[],
      pedidos: (pedidos.data ?? []) as Record<string, any>[],
      pendencias: (pendencias.data ?? []) as Record<string, any>[],
      relatorios: (relatorios.data ?? []) as Record<string, any>[],
      resumos: (resumos.data ?? []) as Record<string, any>[],
      auditoria: (auditoria.data ?? []) as Record<string, any>[],
      inconsistencias: ((issues as any).data ?? []) as Record<string, any>[],
    };
  });

/** Cria ou atualiza um registro de qualquer bloco da pesquisa. */
export const salvarBlocoPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; bloco: BlocoRg; id?: string; dados: Record<string, unknown> }) => {
    if (!BLOCOS[data.bloco]) throw new Error("Bloco de pesquisa inválido.");
    if (!data.researchCaseId) throw new Error("Informe a pesquisa.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    exigirEdicao(podeEditar);

    const alvo = BLOCOS[data.bloco];
    const dados = limparCamposRg(alvo.campos, data.dados);

    if (data.bloco === "evidencias" && dados["evidence_status"] === "validated") {
      dados["validated_by"] = userId;
      dados["reviewed_by"] = userId;
      dados["validated_at"] = new Date().toISOString();
      dados["reviewed_at"] = new Date().toISOString();
    }

    if (data.id) {
      const { error } = await supabase
        .from(alvo.tabela)
        .update({ ...dados, updated_by: userId })
        .eq("id", data.id)
        .eq("organization_id", organizationId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }

    const insercao: Record<string, unknown> = { ...dados, organization_id: organizationId };
    if (alvo.chaveCaso) insercao[alvo.chaveCaso] = data.researchCaseId;

    const { data: linha, error } = await supabase.from(alvo.tabela).insert(insercao).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
  });

/** Arquivamento com motivo. Nunca há exclusão física. */
export const arquivarRegistroPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; bloco: BlocoRg; id: string; motivo: string }) => {
    if (!BLOCOS[data.bloco]) throw new Error("Bloco de pesquisa inválido.");
    if (!data.motivo || data.motivo.trim().length < 5) throw new Error("Informe um motivo de arquivamento.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    exigirEdicao(podeEditar);

    const { error } = await supabase
      .from(BLOCOS[data.bloco].tabela)
      .update({
        archived_at: new Date().toISOString(),
        archived_by: userId,
        archive_reason: data.motivo.trim(),
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Vincula uma evidência a pessoa, relação, evento ou fonte. */
export const vincularEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    researchCaseId: string;
    evidenciaId: string;
    entityType: string;
    entityId: string;
    linkRole: string;
  }) => {
    if (!data.evidenciaId || !data.entityId) throw new Error("Informe a evidência e a entidade.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    exigirEdicao(podeEditar);

    const { error } = await supabase.from("research_evidence_links").insert({
      organization_id: organizationId,
      evidence_item_id: data.evidenciaId,
      entity_type: data.entityType,
      entity_id: data.entityId,
      link_role: data.linkRole,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Resolve uma pendência com nota obrigatória. */
export const resolverPendenciaPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; id: string; nota: string }) => {
    if (!data.nota || data.nota.trim().length < 5) throw new Error("Descreva como a pendência foi resolvida.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    exigirEdicao(podeEditar);

    const { error } = await supabase
      .from("research_pending_items")
      .update({ status: "resolved", resolution_note: data.nota.trim(), resolved_by: userId, resolved_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Cria uma tarefa no Desk vinculada à pendência de pesquisa. */
export const criarTarefaDaPendencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; id: string }) => {
    if (!data.id) throw new Error("Informe a pendência.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar, pesquisa } = await pesquisaAutorizada(
      supabase,
      organizationId,
      papel,
      userId,
      data.researchCaseId,
    );
    exigirEdicao(podeEditar);

    const pend = await supabase
      .from("research_pending_items")
      .select("*")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!pend.data) throw new Error("Pendência não encontrada.");
    if (pend.data.tarefa_id) return { id: pend.data.tarefa_id as string, jaExistia: true };

    const prioridade =
      pend.data.severity === "critical" ? "critica" : pend.data.severity === "high" ? "alta" : "media";

    const tarefa = await supabase
      .from("tarefas")
      .insert({
        organization_id: organizationId,
        caso_id: pesquisa["case_id"],
        titulo: `Pesquisa: ${pend.data.title}`,
        descricao: pend.data.description ?? null,
        prioridade,
        tipo: "pesquisa",
        prazo: pend.data.due_at ? String(pend.data.due_at).slice(0, 10) : null,
        responsavel_id: pend.data.responsible_user_id ?? userId,
      })
      .select("id")
      .maybeSingle();
    if (tarefa.error) throw new Error(tarefa.error.message);

    await supabase
      .from("research_pending_items")
      .update({ tarefa_id: tarefa.data?.id, status: "in_progress" })
      .eq("id", data.id)
      .eq("organization_id", organizationId);

    return { id: tarefa.data?.id as string, jaExistia: false };
  });

/** Gera um rascunho de relatório interno a partir dos dados estruturados. */
export const gerarRelatorioInterno = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string }) => {
    if (!data.researchCaseId) throw new Error("Informe a pesquisa.");
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar, pesquisa, caso } = await pesquisaAutorizada(
      supabase,
      organizationId,
      papel,
      userId,
      data.researchCaseId,
    );
    exigirEdicao(podeEditar);

    const filtro = (tabela: string) =>
      supabase
        .from(tabela)
        .select("*")
        .eq("organization_id", organizationId)
        .eq("research_case_id", data.researchCaseId)
        .is("archived_at", null);

    const [pessoas, relacoes, eventos, evidencias, pendencias, gate] = await Promise.all([
      filtro("research_people"),
      filtro("research_relationships"),
      filtro("research_case_events"),
      filtro("research_evidence_items"),
      filtro("research_pending_items"),
      supabase.rpc("pode_iniciar_pesquisa_externa", { _rc: data.researchCaseId }),
    ]);

    const l = (t: string) => `\n\n## ${t}\n`;
    const linhas: string[] = [];
    linhas.push("INTERNO — NÃO ENVIAR / NÃO PUBLICAR.");
    linhas.push(`Caso ${caso["codigo"] ?? "—"} · ${caso["titulo"] ?? "—"}`);
    linhas.push(`Objetivo: ${pesquisa["research_objective"] || "—"}`);
    linhas.push(l("Pessoas"));
    for (const p of (pessoas.data ?? []) as Record<string, any>[]) {
      linhas.push(`- ${p["canonical_name"]} · ${p["person_status"]} · identidade: ${p["identity_status"]}`);
    }
    linhas.push(l("Relações"));
    for (const r of (relacoes.data ?? []) as Record<string, any>[]) {
      linhas.push(`- ${r["relationship_type"]} · situação: ${r["status"]} · confiança: ${r["confidence_level"]}`);
    }
    linhas.push(l("Eventos"));
    for (const e of (eventos.data ?? []) as Record<string, any>[]) {
      linhas.push(`- ${e["event_type"]} · ${e["event_date"] ?? "data não confirmada"} · situação: ${e["status"]}`);
    }
    linhas.push(l("Evidências"));
    for (const e of (evidencias.data ?? []) as Record<string, any>[]) {
      linhas.push(`- ${e["title"]} · situação: ${e["evidence_status"]} · confiança: ${e["confidence_level"]}`);
    }
    linhas.push(l("Pendências"));
    for (const p of (pendencias.data ?? []) as Record<string, any>[]) {
      linhas.push(`- [${p["severity"]}] ${p["title"]} · ${p["status"]}`);
    }
    linhas.push(l("Pesquisa externa"));
    linhas.push(`- ${((gate as any).data?.mensagem as string) ?? "Situação do gate não avaliada."}`);
    linhas.push("\nHipótese de pesquisa não é conclusão. Evidência validada exige fonte, revisão humana e justificativa.");

    const { data: linha, error } = await supabase
      .from("research_reports")
      .insert({
        organization_id: organizationId,
        research_case_id: data.researchCaseId,
        report_type: "internal_findings",
        status: "draft",
        title: `INTERNO — resumo estruturado (${new Date().toLocaleDateString("pt-BR")})`,
        content: linhas.join("\n"),
        generated_from_snapshot_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { id: linha?.id as string };
  });

/** Registra a liberação humana da pesquisa externa (nenhuma ação externa é executada). */
export const registrarLiberacaoExterna = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; justificativa: string }) => {
    if (!data.justificativa || data.justificativa.trim().length < 10) {
      throw new Error("Registre a justificativa da liberação (mínimo de 10 caracteres).");
    }
    return data;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    if (papel !== "admin" && papel !== "operacoes") {
      throw new Error("Somente administração ou operações podem registrar a liberação.");
    }
    const gate = await supabase.rpc("pode_iniciar_pesquisa_externa", { _rc: data.researchCaseId });
    if (!(gate as any).data?.elegivel) {
      throw new Error(((gate as any).data?.mensagem as string) ?? "Pesquisa externa bloqueada.");
    }

    const { error } = await supabase
      .from("research_cases")
      .update({ external_research_gate_status: "released_by_authorized_user" })
      .eq("id", data.researchCaseId)
      .eq("organization_id", organizationId);
    if (error) throw new Error(error.message);

    await supabase.from("research_audit_events").insert({
      organization_id: organizationId,
      research_case_id: data.researchCaseId,
      entity_type: "research_cases",
      entity_id: data.researchCaseId,
      event_type: "status_changed",
      metadata: { liberacao_externa: true, justificativa: data.justificativa.trim().slice(0, 300) },
    });

    return { ok: true };
  });

/** Executa a verificação de qualidade específica da pesquisa. */
export const rodarScanPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId } = await contextoRg(supabase, context.userId as string);
    const { data, error } = await supabase.rpc("research_quality_scan", { _org: organizationId });
    if (error) throw new Error(error.message);
    const linha = Array.isArray(data) ? data[0] : data;
    return (linha ?? { criadas: 0, sanadas: 0, abertas: 0 }) as {
      criadas: number;
      sanadas: number;
      abertas: number;
    };
  });
