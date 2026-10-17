import { semCache } from "@/lib/no-store";
// Alias obrigatório: este arquivo já usa `linhas` como variável local.
import { linhas as linhasDe } from "@/lib/linhas";
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
import { mensagemLegadoSemCriacao } from "@/lib/fontes-pesquisa-canonicas";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { agregarDossiePesquisa } from "@/lib/pesquisa-dossie";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Painel geral: pesquisas da organização com contadores e gates. */
export const painelPesquisaModulo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    if (!PAPEIS_LE_RESUMO.includes(papel)) throw new Error("Seu papel não acessa a pesquisa.");

    const [
      pesquisas,
      casos,
      pendencias,
      evidencias,
      issues,
      acervosCatalogo,
      hipoteses,
      fontes,
      pedidos,
      achados,
      microentregas,
    ] = await Promise.all([
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
          .select("id,research_case_id,evidence_status,created_at")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("quality_issues")
          .select("id,case_id,severidade,status,titulo")
          .eq("organization_id", organizationId)
          .eq("dominio", "pesquisa")
          .in("status", ["aberta", "reconhecida"]),
        /*
         * 17/10/2026 — Tela 07 (Pesquisa Genealógica): bloco "Dossiê de
         * pesquisa" do mockup aprovado (15/10/2026). KPIs e cobertura de
         * fontes sobre o org inteiro, mesmo recorte dos demais contadores
         * deste painel — sem tabela nova, sem CHECK novo (ver
         * `src/lib/pesquisa-dossie.ts`).
         */
        supabase
          .from("genealogical_sources_catalog")
          .select("id")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("research_case_hypotheses")
          .select("id,title,status,confidence_level,created_at")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("research_sources")
          .select("id,title,source_type,source_status,repository_or_institution,created_at")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("research_document_requests")
          .select("id,status,target_institution")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        /*
         * 17/10/2026 — Tela 07: régua "da pergunta à microentrega". "Achado"
         * e "Microentrega" só contam presença real, org-wide, sem CHECK
         * novo (ver `montarEtapas` em pesquisa-dossie.ts).
         */
        supabase
          .from("genealogical_findings")
          .select("id")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
        supabase
          .from("ops_microentregas")
          .select("id")
          .eq("organization_id", organizationId)
          .is("archived_at", null),
      ]);

    const listaCasos = linhasDe<Record<string, any>>(casos, "casos de pesquisa");
    const listaPend = linhasDe<Record<string, any>>(pendencias, "pendências de pesquisa");
    const listaEvid = linhasDe<Record<string, any>>(evidencias, "evidências de pesquisa");
    const mapaCaso = new Map(listaCasos.map((c) => [c["id"], c]));

    const linhas = linhasDe<Record<string, any>>(pesquisas, "pesquisas do painel").map((p) => {
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

    const dossie = agregarDossiePesquisa({
      acervosCatalogo: linhasDe<Record<string, any>>(acervosCatalogo, "acervos do catálogo de fontes"),
      hipoteses: linhasDe<Record<string, any>>(hipoteses, "hipóteses de pesquisa"),
      evidencias: listaEvid,
      fontes: linhasDe<Record<string, any>>(fontes, "fontes de pesquisa"),
      pedidos: linhasDe<Record<string, any>>(pedidos, "pedidos de documento de pesquisa"),
      achados: linhasDe<Record<string, any>>(achados, "achados genealógicos"),
      microentregas: linhasDe<Record<string, any>>(microentregas, "microentregas operacionais"),
    });

    return {
      papel,
      pesquisas: linhas,
      inconsistencias: linhasDe<Record<string, any>>(issues, "inconsistências de qualidade da pesquisa"),
      casosSemPesquisa: listaCasos.filter(
        (c) => !linhas.some((l) => l["case_id"] === c["id"]),
      ),
      dossie,
    };
  });

/** Cria a camada de pesquisa para um caso existente (nunca cria caso novo). */
export const criarPesquisaParaCaso = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { casoId: string; objetivo: string; contexto?: string }) => {
    if (!data.casoId) throw new Error("Informe o caso.");
    return { ...data, objetivo: data.objetivo?.trim() || "Objetivo não especificado." };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId } = await contextoRg(supabase, userId);

    const existente = await supabase
      .from("research_cases")
      .select("id")
      .is("archived_at", null)
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
    if (!linha?.id) throw new Error("NENHUMA_LINHA_AFETADA: pesquisa não foi criada para o caso.");
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.casoId,
      eventType: "caso",
      title: "Pesquisa aberta para o caso",
      summaryInternal: data.objetivo.trim(),
      sourceEntityType: "research_cases",
      sourceEntityId: linha.id as string,
      userId,
    });
    return { id: linha.id as string, jaExistia: false };
  });

/** Dossiê completo de uma pesquisa, com gate externo e auditoria. */
export const carregarPesquisaModulo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; incluirArquivados?: boolean }) => {
    if (!data.researchCaseId) throw new Error("Informe a pesquisa.");
    return data;
  })
  .handler(async ({ data, context }) => {
    semCache();
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
        catalogoFontes: [] as Record<string, any>[],
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

    const idsPessoas = linhasDe<Record<string, any>>(pessoas, "pessoas da pesquisa").map((p) => p["id"]);
    const idsEvid = linhasDe<Record<string, any>>(evidencias, "evidências da pesquisa").map((e) => e["id"]);

    /*
     * 04/10/2026 — catálogo oficial de fontes (org-wide) entra no painel para
     * o log de consulta poder apontar a fonte consultada (`FONTE_ID`). A
     * classificação M não é copiada: fica no catálogo e é lida pela FK.
     */
    const catalogoFontes = await supabase
      .from("genealogical_sources_catalog")
      .select("id,nome,pais,modelo_acesso,nivel_de_fonte")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("nome", { ascending: true });

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
      pessoas: linhasDe<Record<string, any>>(pessoas, "pessoas da pesquisa"),
      variantes: linhasDe<Record<string, any>>(variantes as any, "variantes de nome da pesquisa"),
      relacoes: linhasDe<Record<string, any>>(relacoes, "relações da pesquisa"),
      eventos: linhasDe<Record<string, any>>(eventos, "eventos da pesquisa"),
      fontes: linhasDe<Record<string, any>>(fontes, "fontes da pesquisa"),
      catalogoFontes: ((catalogoFontes as any).data ?? []) as Record<string, any>[],
      evidencias: linhasDe<Record<string, any>>(evidencias, "evidências da pesquisa"),
      vinculos: linhasDe<Record<string, any>>(vinculos as any, "vínculos de evidência da pesquisa"),
      hipoteses: linhasDe<Record<string, any>>(hipoteses, "hipóteses da pesquisa"),
      pedidos: linhasDe<Record<string, any>>(pedidos, "pedidos de documento da pesquisa"),
      pendencias: linhasDe<Record<string, any>>(pendencias, "pendências da pesquisa"),
      relatorios: linhasDe<Record<string, any>>(relatorios, "relatórios da pesquisa"),
      resumos: linhasDe<Record<string, any>>(resumos, "resumos ao cliente da pesquisa"),
      auditoria: linhasDe<Record<string, any>>(auditoria, "auditoria da pesquisa"),
      inconsistencias: linhasDe<Record<string, any>>(issues as any, "inconsistências de qualidade da pesquisa"),
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
    const { podeEditar, pesquisa } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    exigirEdicao(podeEditar);

    const alvo = BLOCOS[data.bloco];
    // 24/09/2026 — relações e eventos deste módulo são legado; a casa
    // canônica é a ficha genealógica (fontes-pesquisa-canonicas.ts).
    if (!data.id && (data.bloco === "relacoes" || data.bloco === "eventos")) {
      throw new Error(mensagemLegadoSemCriacao(data.bloco === "relacoes" ? "relacao" : "evento"));
    }
    const dados = limparCamposRg(alvo.campos, data.dados);

    if (data.bloco === "pedidos") {
      const semTipo = !("requested_document_type" in dados) ? !data.id : dados["requested_document_type"] == null;
    }

    if (data.bloco === "evidencias" && dados["evidence_status"] === "validated") {
      dados["validated_by"] = userId;
      dados["reviewed_by"] = userId;
      dados["validated_at"] = new Date().toISOString();
      dados["reviewed_at"] = new Date().toISOString();
    }

    const caseId = pesquisa["case_id"] as string | null | undefined;

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: alvo.tabela,
        id: data.id,
        organizationId,
        userId,
        payload: dados,
      });
      if (caseId) {
        await registrarTimelineCaso(supabase, {
          organizationId,
          caseId,
          eventType: "caso",
          title: `Pesquisa (${data.bloco}) atualizada`,
          sourceEntityType: alvo.tabela,
          sourceEntityId: data.id,
          userId,
        });
      }
      return { id: data.id };
    }

    const insercao: Record<string, unknown> = { ...dados, organization_id: organizationId };
    if (alvo.chaveCaso) insercao[alvo.chaveCaso] = data.researchCaseId;

    const { data: linha, error } = await supabase.from(alvo.tabela).insert(insercao).select("id").maybeSingle();
    if (error) throw new Error(error.message);
    if (!linha?.id) throw new Error("NENHUMA_LINHA_AFETADA: registro de pesquisa não foi criado.");
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: `Pesquisa (${data.bloco}) registrada`,
        sourceEntityType: alvo.tabela,
        sourceEntityId: linha.id as string,
        userId,
      });
    }
    return { id: linha.id as string };
  });

/** Arquivamento com motivo. Nunca há exclusão física. */
export const arquivarRegistroPesquisa = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { researchCaseId: string; bloco: BlocoRg; id: string; motivo: string }) => {
    if (!BLOCOS[data.bloco]) throw new Error("Bloco de pesquisa inválido.");
    return { ...data, motivo: data.motivo?.trim() || "Motivo não informado." };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar, pesquisa } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    exigirEdicao(podeEditar);

    await gravarComVerificacao({
      supabase,
      tabela: BLOCOS[data.bloco].tabela,
      id: data.id,
      organizationId,
      userId,
      payload: {
        archived_at: new Date().toISOString(),
        archived_by: userId,
        archive_reason: data.motivo.trim(),
      },
    });
    if (pesquisa["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: pesquisa["case_id"] as string,
        eventType: "caso",
        title: `Registro de pesquisa (${data.bloco}) arquivado`,
        summaryInternal: data.motivo.trim(),
        sourceEntityType: BLOCOS[data.bloco].tabela,
        sourceEntityId: data.id,
        userId,
      });
    }
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
    return { ...data, nota: data.nota?.trim() || "Pendência resolvida." };
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    const { podeEditar, pesquisa } = await pesquisaAutorizada(supabase, organizationId, papel, userId, data.researchCaseId);
    exigirEdicao(podeEditar);

    await gravarComVerificacao({
      supabase,
      tabela: "research_pending_items",
      id: data.id,
      organizationId,
      userId,
      payload: {
        status: "resolved",
        resolution_note: data.nota.trim(),
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
      },
    });
    if (pesquisa["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: pesquisa["case_id"] as string,
        eventType: "caso",
        title: "Pendência de pesquisa resolvida",
        summaryInternal: data.nota.trim(),
        sourceEntityType: "research_pending_items",
        sourceEntityId: data.id,
        userId,
      });
    }
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

    await gravarComVerificacao({
      supabase,
      tabela: "research_pending_items",
      id: data.id,
      organizationId,
      userId,
      payload: { tarefa_id: tarefa.data?.id, status: "in_progress" },
    });

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
    for (const p of linhasDe<Record<string, any>>(pessoas, "pessoas da pesquisa")) {
      linhas.push(`- ${p["canonical_name"]} · ${p["person_status"]} · identidade: ${p["identity_status"]}`);
    }
    linhas.push(l("Relações"));
    for (const r of linhasDe<Record<string, any>>(relacoes, "relações da pesquisa")) {
      linhas.push(`- ${r["relationship_type"]} · situação: ${r["status"]} · confiança: ${r["confidence_level"]}`);
    }
    linhas.push(l("Eventos"));
    for (const e of linhasDe<Record<string, any>>(eventos, "eventos da pesquisa")) {
      linhas.push(`- ${e["event_type"]} · ${e["event_date"] ?? "data não confirmada"} · situação: ${e["status"]}`);
    }
    linhas.push(l("Evidências"));
    for (const e of linhasDe<Record<string, any>>(evidencias, "evidências da pesquisa")) {
      linhas.push(`- ${e["title"]} · situação: ${e["evidence_status"]} · confiança: ${e["confidence_level"]}`);
    }
    linhas.push(l("Pendências"));
    for (const p of linhasDe<Record<string, any>>(pendencias, "pendências da pesquisa")) {
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
    return { ...data, justificativa: data.justificativa?.trim() || "Liberação registrada sem justificativa adicional." };
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

    // Gate contratual: sem Anexo III vigente não há pesquisa nominal externa.
    const { data: rc } = await supabase
      .from("research_cases")
      .select("case_id")
      .eq("id", data.researchCaseId)
      .maybeSingle();
    if ((rc as any)?.case_id) {
      const { exigirAnexosDeAcaoExterna } = await import("@/lib/anexos-persistidos.server");
      await exigirAnexosDeAcaoExterna(supabase, {
        organizationId,
        caseId: (rc as any).case_id as string,
        acao: "pesquisa_externa",
      });
    }


    await gravarComVerificacao({
      supabase,
      tabela: "research_cases",
      id: data.researchCaseId,
      organizationId,
      userId,
      payload: { external_research_gate_status: "released_by_authorized_user" },
    });

    await supabase.from("research_audit_events").insert({
      organization_id: organizationId,
      research_case_id: data.researchCaseId,
      entity_type: "research_cases",
      entity_id: data.researchCaseId,
      event_type: "status_changed",
      metadata: { liberacao_externa: true, justificativa: data.justificativa.trim().slice(0, 300) },
    });

    if ((rc as any)?.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: (rc as any).case_id as string,
        eventType: "caso",
        title: "Liberação de pesquisa externa registrada",
        summaryInternal: data.justificativa.trim(),
        sourceEntityType: "research_cases",
        sourceEntityId: data.researchCaseId,
        userId,
      });
    }

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
