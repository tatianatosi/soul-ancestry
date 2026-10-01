import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { conteudoProjetavel } from "@/lib/biblioteca-evidencias";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { gravarComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import { EVIDENCIA_ESCRITOR_APOSENTADO } from "@/lib/evidencia-canonica";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_EVIDENCIA = [
  "case_id",
  "research_item_id",
  "research_person_id",
  "source_id",
  "evidence_type",
  "evidence_nature",
  "title_internal",
  "description_internal",
  "reference_date",
  "reference_location",
  "storage_reference_internal",
  "access_level",
  "workflow_status",
  "epistemic_validation_status",
  "confidence_level",
  "negative_search_source",
  "negative_search_date",
  "negative_search_next_action",
  "reviewed_by",
  "reviewed_at",
  "legal_review_status",
  "legal_review_notes_internal",
];

const CAMPOS_PROJECAO = [
  "source_entity_type",
  "source_entity_id",
  "case_id",
  "pessoa_id",
  "due_at",
  "projection_type",
  "destination",
  "content_sanitized",
  "approval_status",
  "approved_by",
  "approved_at",
  "visibility_scope",
  "effective_from",
  // Decisão da Proprietária (09/09/2026) — "achado é compartilhável apenas
  // quando sanitizado e autorizado": quando visibility_scope='titular',
  // titular_client_id é a pessoa (clientes.id) que vê o achado por padrão.
  "titular_client_id",
];

function filtrar(campos: string[], entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const c of campos) if (c in entrada) out[c] = entrada[c];
  return out;
}

function recusarNaoMapeado(campos: string[], entrada: Record<string, unknown>) {
  const sobra = Object.keys(entrada).filter((k) => !campos.includes(k));
  if (sobra.length) throw new Error(`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: ${sobra.join(", ")}`);
}

async function autorizarEscrita(supabase: Sb, userId: string) {
  const { organizationId, papel } = await contextoRg(supabase, userId);
  if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode registrar evidências ou projeções.");
  return organizationId;
}

/** Painel interno da biblioteca: evidências, histórico de validação e projeções do caso. */
export const painelBibliotecaEvidencias = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa a biblioteca de evidências.");

    const [evidencias, projecoes, fontes, pessoas, caso, casoServicos] = await Promise.all([
      supabase
        .from("evidences")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("app_projections")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("research_sources")
        .select("id,title,source_type")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase
        .from("research_people")
        .select("id,canonical_name")
        .eq("organization_id", organizationId)
        .is("archived_at", null),
      supabase.from("crm_casos").select("id,codigo,titulo,pais").eq("id", data.caseId).maybeSingle(),
      supabase
        .from("case_services")
        .select("citizenship_track_id")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
    ]);

    // Elo marco jurídico -> caso: trilha(s) do caso (case_services) já ligam a
    // regra jurídica aprovada e ao marco/citação (consolidado em 08-09/09/2026).
    // Só regra `aprovado` e não arquivada vira opção de origem de projeção —
    // mesma trava de evidenciaProjetavel, aplicada à regra (marcoJuridicoProjetavel).
    const trackIds = [...new Set((casoServicos.data ?? []).map((s: any) => s.citizenship_track_id).filter(Boolean))];
    const marcosJuridicos = trackIds.length
      ? await supabase
          .from("versioned_legal_rules")
          .select("id,track_id,tema,status,archived_at,fonte_referencia")
          .in("track_id", trackIds)
          .is("archived_at", null)
          .eq("status", "aprovado")
      : { data: [] as any[] };

    const ids = (evidencias.data ?? []).map((e: any) => e.id);
    const validacoes = ids.length
      ? await supabase
          .from("evidence_validations")
          .select("*")
          .eq("organization_id", organizationId)
          .in("evidence_id", ids)
          .order("revisado_em", { ascending: false })
      : { data: [] as any[] };

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      papel,
      caso: (caso.data ?? null) as any,
      evidencias: (evidencias.data ?? []) as any[],
      validacoes: (validacoes.data ?? []) as any[],
      projecoes: (projecoes.data ?? []) as any[],
      fontes: (fontes.data ?? []) as any[],
      pessoas: (pessoas.data ?? []) as any[],
      marcosJuridicos: (marcosJuridicos.data ?? []) as any[],
    };
  });

/** Fila editorial transversal de microentregas, sem duplicar projeções. */
export const listarFilaMicroentregas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa a fila de microentregas.");

    const projecoesRes = await supabase
      .from("app_projections")
      .select("*")
      .eq("organization_id", organizationId)
      .is("archived_at", null)
      .order("created_at", { ascending: false })
      .limit(500);
    if (projecoesRes.error) throw new Error(projecoesRes.error.message);
    const projecoes = (projecoesRes.data ?? []) as Record<string, any>[];
    const caseIds = [...new Set(projecoes.map((p) => p["case_id"] as string).filter(Boolean))];
    const evidenciaIds = projecoes.filter((p) => p["source_entity_type"] === "evidence").map((p) => p["source_entity_id"] as string);
    const entregaIds = projecoes.filter((p) => p["source_entity_type"] === "client_deliverable").map((p) => p["source_entity_id"] as string);
    const userIds = [...new Set(projecoes.flatMap((p) => [p["approved_by"], p["created_by"]]).filter(Boolean) as string[])];

    const [casosRes, evidenciasRes, entregasRes, equipeRes, achadosRes] = await Promise.all([
      caseIds.length
        ? supabase.from("crm_casos").select("id,codigo,titulo").eq("organization_id", organizationId).in("id", caseIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      evidenciaIds.length
        ? supabase.from("evidences").select("id,title_internal,description_internal,source_id,workflow_status").eq("organization_id", organizationId).in("id", evidenciaIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      entregaIds.length
        ? supabase.from("client_deliverables").select("id,title_client,summary_approved,internal_reference,responsible_user_id").eq("organization_id", organizationId).in("id", entregaIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      userIds.length
        ? supabase.from("staff_access").select("auth_user_id,full_name,email").eq("organization_id", organizationId).in("auth_user_id", userIds)
        : Promise.resolve({ data: [] as any[], error: null }),
      caseIds.length
        ? supabase.from("genealogical_findings").select("id,case_id,title,internal_summary,evidence_links,client_deliverable_id,validation_status").eq("organization_id", organizationId).in("case_id", caseIds).is("archived_at", null)
        : Promise.resolve({ data: [] as any[], error: null }),
    ]);
    for (const r of [casosRes, evidenciasRes, entregasRes, equipeRes, achadosRes]) {
      if (r.error) throw new Error(r.error.message);
    }

    const evidencias = (evidenciasRes.data ?? []) as Record<string, any>[];
    const sourceIds = [...new Set(evidencias.map((e) => e["source_id"] as string).filter(Boolean))];
    const fontesRes = sourceIds.length
      ? await supabase.from("research_sources").select("id,title,source_type").eq("organization_id", organizationId).in("id", sourceIds)
      : { data: [] as any[], error: null };
    if (fontesRes.error) throw new Error(fontesRes.error.message);

    const porId = (linhas: any[]) => new Map(linhas.map((l) => [String(l.id), l]));
    const casos = porId(casosRes.data ?? []);
    const evidenciasPorId = porId(evidencias);
    const entregas = porId(entregasRes.data ?? []);
    const fontes = porId(fontesRes.data ?? []);
    const equipe = new Map((equipeRes.data ?? []).map((e: any) => [String(e.auth_user_id), e]));
    const achados = (achadosRes.data ?? []) as Record<string, any>[];

    return projecoes.map((p) => {
      const caso = casos.get(String(p["case_id"])) as Record<string, any> | undefined;
      const evidencia = p["source_entity_type"] === "evidence"
        ? evidenciasPorId.get(String(p["source_entity_id"])) as Record<string, any> | undefined
        : undefined;
      const entrega = p["source_entity_type"] === "client_deliverable"
        ? entregas.get(String(p["source_entity_id"])) as Record<string, any> | undefined
        : undefined;
      const fonte = evidencia?.["source_id"] ? fontes.get(String(evidencia["source_id"])) as Record<string, any> | undefined : undefined;
      const achado = achados.find((a) =>
        (entrega && a["client_deliverable_id"] === entrega["id"]) ||
        (evidencia && Array.isArray(a["evidence_links"]) && a["evidence_links"].includes(evidencia["id"])),
      );
      const responsavelId = p["approved_by"] ?? entrega?.["responsible_user_id"] ?? p["created_by"] ?? null;
      const responsavel = responsavelId ? equipe.get(String(responsavelId)) as Record<string, any> | undefined : undefined;
      return {
        id: String(p["id"]),
        caseId: String(p["case_id"]),
        casoCodigo: caso?.["codigo"] ?? null,
        casoTitulo: caso?.["titulo"] ?? null,
        tipo: p["projection_type"] as string,
        descricao: p["content_sanitized"] as string,
        status: p["approval_status"] as string,
        prazo: (p["due_at"] ?? null) as string | null,
        // §18 do De-Para (Biblioteca Mestre) pede "versão e data" na Lista de
        // conteúdo — app_projections não tem coluna de versão (divergência
        // registrada, não inventada); a data real é a última atualização.
        atualizadoEm: (p["updated_at"] ?? null) as string | null,
        responsavel: responsavel?.["full_name"] ?? responsavel?.["email"] ?? null,
        origemTipo: p["source_entity_type"] as string,
        origemId: p["source_entity_id"] as string,
        fonte: fonte ? { titulo: fonte["title"], tipo: fonte["source_type"] } : null,
        evidencia: evidencia ? { titulo: evidencia["title_internal"], descricao: evidencia["description_internal"], status: evidencia["workflow_status"] } : null,
        achado: achado ? { titulo: achado["title"], resumo: achado["internal_summary"], status: achado["validation_status"] } : null,
        entrega: entrega ? { titulo: entrega["title_client"], resumo: entrega["summary_approved"], referencia: entrega["internal_reference"] } : null,
      };
    });
  });

export const salvarEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    // Corte 1 (01/10/2026): escritor aposentado. `evidences` deixou de ser a
    // tabela canônica (estava vazia); quem grava é `evidencia-canonica`.
    throw new Error(EVIDENCIA_ESCRITOR_APOSENTADO);
    // eslint-disable-next-line no-unreachable
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    recusarNaoMapeado(CAMPOS_EVIDENCIA, data.valores);
    const valores = filtrar(CAMPOS_EVIDENCIA, data.valores);

    const r = data.id
      ? await supabase.from("evidences").update(valores).eq("id", data.id).select("id,case_id").maybeSingle()
      : await supabase
          .from("evidences")
          .insert({ ...valores, organization_id: organizationId })
          .select("id,case_id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    if (r.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.data.case_id as string,
        eventType: "caso",
        title: data.id ? "Evidência atualizada" : "Evidência registrada",
        sourceEntityType: "evidences",
        sourceEntityId: r.data.id as string,
        userId: context.userId as string,
      });
    }
    return { id: r.data.id as string };
  });

/**
 * Elevação/rebaixamento de confiança sempre pelo histórico: registra a justificativa
 * e só então altera a evidência. O banco recusa salto INICIAL → ALTO.
 */
export const registrarValidacaoEvidencia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      evidenceId: string;
      estadoNovo: string;
      confiancaNova: string;
      justificativa: string;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const justificativa = (data.justificativa ?? "").trim() || "Sem justificativa informada.";

    const atual = await supabase
      .from("evidences")
      .select("id,epistemic_validation_status,confidence_level,case_id")
      .eq("id", data.evidenceId)
      .maybeSingle();
    if (atual.error) throw new Error(atual.error.message);
    if (!atual.data) throw new Error("Evidência não encontrada ou sem permissão de acesso.");

    const agora = new Date().toISOString();
    const hist = await supabase.from("evidence_validations").insert({
      organization_id: organizationId,
      evidence_id: data.evidenceId,
      estado_anterior: atual.data.epistemic_validation_status,
      estado_novo: data.estadoNovo,
      confianca_anterior: atual.data.confidence_level,
      confianca_nova: data.confiancaNova,
      justificativa,
      revisado_por: context.userId as string,
      revisado_em: agora,
    });
    if (hist.error) throw new Error(hist.error.message);

    await gravarComVerificacao({
      supabase,
      tabela: "evidences",
      id: data.evidenceId,
      organizationId,
      userId: context.userId as string,
      payload: {
        epistemic_validation_status: data.estadoNovo,
        confidence_level: data.confiancaNova,
        reviewed_by: context.userId as string,
        reviewed_at: agora,
      },
    });
    if (atual.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: atual.data.case_id as string,
        eventType: "caso",
        title: `Validação da evidência: ${atual.data.epistemic_validation_status} → ${data.estadoNovo}`,
        summaryInternal: justificativa,
        sourceEntityType: "evidences",
        sourceEntityId: data.evidenceId,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

export const salvarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    recusarNaoMapeado(CAMPOS_PROJECAO, data.valores);
    const valores = filtrar(CAMPOS_PROJECAO, data.valores);
    if ("content_sanitized" in valores) {
      const checagem = conteudoProjetavel(String(valores["content_sanitized"] ?? ""));
      if (!checagem.ok) throw new Error(checagem.erros.join(" "));
    }

    const r = data.id
      ? await supabase.from("app_projections").update(valores).eq("id", data.id).select("id,case_id").maybeSingle()
      : await supabase
          .from("app_projections")
          .insert({ ...valores, organization_id: organizationId })
          .select("id,case_id")
          .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    if (r.data.case_id) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.data.case_id as string,
        eventType: "caso",
        title: data.id ? "Projeção de conteúdo atualizada" : "Projeção de conteúdo criada",
        sourceEntityType: "app_projections",
        sourceEntityId: r.data.id as string,
        userId: context.userId as string,
      });
    }
    return { id: r.data.id as string };
  });

/**
 * Ponte explícita entre entrega operacional e App Cliente (cadeia canônica,
 * 09/09/2026): tarefa/onboarding/marco → client_deliverables (quando há
 * entrega real) → revisão e aprovação → app_projections/portal_projecoes →
 * conteúdo liberado no App.
 *
 * Só projeta uma micro-entrega já "publicado" em `client_deliverables` — o
 * único estado cuja própria tela promete "aparece no App Cliente"
 * (achado real: antes dessa ponte, nenhuma rota lia client_deliverables e a
 * promessa nunca se cumpria). Cria a projeção em rascunho: passa pela MESMA
 * revisão/aprovação/publicação humana já existente na Biblioteca Mestre
 * (revisarProjecao/aprovarProjecao) — nunca libera automaticamente. Dedup por
 * origem: uma micro-entrega nunca gera duas projeções.
 */
export const projetarMicroentregaParaApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { entregaId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);

    const entrega = await supabase
      .from("client_deliverables")
      .select("id,case_id,deliverable_type,title_client,summary_approved,approval_status,organization_id")
      .eq("id", data.entregaId)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (!entrega.data) throw new Error("Micro-entrega não encontrada nesta organização.");
    if (entrega.data["approval_status"] !== "publicado") {
      throw new Error("Só uma micro-entrega já publicada internamente pode ser projetada ao App.");
    }

    const existente = await supabase
      .from("app_projections")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("source_entity_type", "client_deliverable")
      .eq("source_entity_id", data.entregaId)
      .is("archived_at", null)
      .maybeSingle();
    if (existente.data?.id) return { id: existente.data.id as string, criado: false };

    const conteudo = String(entrega.data["summary_approved"] ?? "");
    const checagem = conteudoProjetavel(conteudo);
    if (!checagem.ok) throw new Error(checagem.erros.join(" "));

    const r = await supabase
      .from("app_projections")
      .insert({
        organization_id: organizationId,
        source_entity_type: "client_deliverable",
        source_entity_id: data.entregaId,
        case_id: entrega.data["case_id"],
        projection_type: entrega.data["deliverable_type"],
        destination: "app",
        content_sanitized: conteudo,
        approval_status: "draft",
        visibility_scope: "titular",
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
    return { id: r.data.id as string, criado: true };
  });

/** Aprovação humana explícita: sem aprovação automática e sem publicação silenciosa. */
export const aprovarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; publicar: boolean; motivo?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);

    // Achado de 09/09/2026 (rodada de limpeza pré-Perfil 360): aprovar/publicar
    // confiava cegamente no que foi salvo antes — não repetia a checagem de
    // conteúdo. Uma projeção gravada fora da UI (ou salva antes desta função
    // existir) podia ser aprovada e publicada sem nunca passar por
    // conteudoProjetavel. Achado só vira visível ao cliente sanitizado.
    const atual = await supabase
      .from("app_projections")
      .select("content_sanitized,case_id,projection_type")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .maybeSingle();
    if (atual.error) throw new Error(atual.error.message);
    if (!atual.data) throw new Error("Projeção não encontrada ou sem permissão de acesso.");
    const checagem = conteudoProjetavel(String(atual.data.content_sanitized ?? ""));
    if (!checagem.ok) throw new Error(checagem.erros.join(" "));

    const agora = new Date().toISOString();
    const r = await supabase
      .from("app_projections")
      .update({
        approval_status: data.publicar ? "published" : "approved",
        approved_by: context.userId as string,
        approved_at: agora,
        effective_from: data.publicar ? agora : null,
      })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: publicar/aprovar já checava erro e
    // linha afetada, mas não deixava evento no histórico do caso.
    // P5 (26/09/2026) — o motivo digitado na confirmação da UI (`AcaoOperacional`,
    // `acaoExterna="publicar_no_app_cliente"`) era descartado: o dialog exigia o
    // campo mas nada o gravava. Agora persiste em audit_logs e no próprio evento.
    const motivo = (data.motivo ?? "").trim();
    const caseId = atual.data["case_id"] as string | null | undefined;
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: data.publicar
          ? "Achado publicado no App Cliente"
          : "Achado aprovado (aguardando publicação)",
        summaryInternal: [String(atual.data["projection_type"] ?? ""), motivo ? `Motivo: ${motivo}` : null]
          .filter(Boolean)
          .join(" — "),
        sourceEntityType: "app_projections",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: data.id,
      acao: data.publicar ? "achado_publicado_no_app" : "achado_aprovado_aguardando_publicacao",
      user_id: context.userId as string,
      metadados: { case_id: caseId, motivo: motivo || null },
    });

    // CA06-APP-NO-DESK — aprovada mas ainda não publicada é "pronta para
    // liberação": o Desk vê em /alertas sem precisar abrir a Biblioteca.
    // Publicada já resolveu a pendência — nenhum alerta é criado.
    if (!data.publicar) {
      await criarOuReaproveitarAlertaProjecao(supabase, organizationId, {
        id: data.id,
        caseId: atual.data["case_id"] as string,
        titulo: `Projeção "${String(atual.data["projection_type"])}" pronta para liberação`,
      });
    }

    return { ok: true };
  });

/**
 * Grava/reaproveita (nunca duplica) o alerta interno "microentrega_pendente"
 * em `case_alerts` para uma projeção — mesma tabela e mesmo padrão de dedup
 * usados por `registrarProximaAcao`/`registrarRevalidacaoProposta`. Extraído
 * do corpo de `prepararAlertaProjecao` (CA06-APP-NO-DESK, 09/09/2026) para ser
 * chamado também automaticamente quando uma projeção entra em revisão ou fica
 * pronta para liberação — sem criar tarefa nova.
 */
async function criarOuReaproveitarAlertaProjecao(
  supabase: Sb,
  organizationId: string,
  input: { id: string; caseId: string; titulo: string; detalhe?: string },
) {
  const { data: existente } = await supabase
    .from("case_alerts")
    .select("id")
    .eq("case_id", input.caseId)
    .eq("tipo", "microentrega_pendente")
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();
  if (existente?.id) return { id: existente.id as string, criado: false };

  const r = await supabase
    .from("case_alerts")
    .insert({
      organization_id: organizationId,
      case_id: input.caseId,
      tipo: "microentrega_pendente",
      criticidade: "atencao",
      titulo: input.titulo,
      detalhe: input.detalhe ?? `Projeção ${input.id} aguarda revisão/aprovação.`,
      status: "pending",
    })
    .select("id")
    .maybeSingle();
  if (r.error) throw new Error(r.error.message);
  if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");
  return { id: r.data.id as string, criado: true };
}

/** Envia rascunho/aprovada de volta para revisão — nunca pula etapa às cegas. */
export const revisarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const r = await supabase
      .from("app_projections")
      .update({ approval_status: "in_review" })
      .eq("id", data.id)
      .select("id,case_id,projection_type")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    // CA06-APP-NO-DESK — entrar em revisão é conteúdo pronto para o Desk
    // decidir: aparece em /alertas sem exigir clique manual em "Criar alerta
    // interno" (que continua existindo, dedupado, sem risco de duplicar).
    await criarOuReaproveitarAlertaProjecao(supabase, organizationId, {
      id: data.id,
      caseId: r.data["case_id"] as string,
      titulo: `Projeção "${String(r.data["projection_type"])}" pronta para revisão`,
    });

    if (r.data["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.data["case_id"] as string,
        eventType: "caso",
        title: "Projeção enviada para revisão",
        summaryInternal: String(r.data["projection_type"] ?? ""),
        sourceEntityType: "app_projections",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }

    return { ok: true };
  });

/**
 * Despublica sem arquivar: some do App Cliente (a view portal_projecoes exige
 * approval_status = published), mas continua editável como aprovada — ação
 * reversível, distinta de arquivar (que exige motivo e é definitiva).
 */
export const despublicarProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    // MOTOR-UNIVERSAL-ACAO-HISTORICO-FILA: faltava o filtro de organização
    // (organizationId era resolvido e descartado) e o evento de histórico.
    const r = await supabase
      .from("app_projections")
      .update({ approval_status: "approved", effective_from: null })
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .select("id,case_id,projection_type")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    if (!r.data?.id) throw new Error("NENHUMA_LINHA_AFETADA: verifique permissão e identificação do registro.");

    // P5 (26/09/2026) — mesmo motivo antes descartado em aprovarProjecao.
    const motivo = (data.motivo ?? "").trim();
    const caseId = r.data["case_id"] as string | null | undefined;
    if (caseId) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId,
        eventType: "caso",
        title: "Achado despublicado do App Cliente",
        summaryInternal: [String(r.data["projection_type"] ?? ""), motivo ? `Motivo: ${motivo}` : null]
          .filter(Boolean)
          .join(" — "),
        sourceEntityType: "app_projections",
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    await supabase.from("audit_logs").insert({
      organization_id: organizationId,
      entidade: "app_projections",
      entidade_id: data.id,
      acao: "achado_despublicado_do_app",
      user_id: context.userId as string,
      metadados: { case_id: caseId, motivo: motivo || null },
    });

    return { ok: true };
  });

/**
 * Rascunho de alerta interno sobre a microentrega — nunca envia WhatsApp,
 * e-mail ou qualquer canal externo. Mesma tabela (`case_alerts`) já usada por
 * `registrarProximaAcao` (caso-canonico.functions.ts), aqui escopada à
 * projeção específica.
 *
 * 09/09/2026 — deduplicação: mesmo padrão de `registrarRevalidacaoProposta`
 * (escopo-conferencia.functions.ts), a única rotina que já evitava alerta
 * repetido. Um alerta `pending` do mesmo tipo já aberto para o caso é
 * reaproveitado, nunca duplicado.
 */
export const prepararAlertaProjecao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; caseId: string; titulo: string; detalhe?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    return criarOuReaproveitarAlertaProjecao(supabase, organizationId, data);
  });

/** Sem exclusão física: apenas arquivamento com motivo. */
export const arquivarRegistroG03 = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { tabela: "evidences" | "app_projections"; id: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const patch: Record<string, unknown> = {
      archived_at: new Date().toISOString(),
      archived_reason: motivo,
    };
    if (data.tabela === "app_projections") patch["approval_status"] = "archived";
    const r = await gravarComVerificacao({
      supabase,
      tabela: data.tabela,
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: patch,
    });
    if (r.registro["case_id"]) {
      await registrarTimelineCaso(supabase, {
        organizationId,
        caseId: r.registro["case_id"] as string,
        eventType: "caso",
        title: `Registro arquivado: ${data.tabela === "evidences" ? "evidência" : "projeção"}`,
        summaryInternal: motivo,
        sourceEntityType: data.tabela,
        sourceEntityId: data.id,
        userId: context.userId as string,
      });
    }
    return { ok: true };
  });

/* ===================== COMPARTILHAMENTO DE ACHADO (LGPD) ===================== */

/**
 * Decisão da Proprietária (09/09/2026) — "achado é compartilhável apenas
 * quando sanitizado e autorizado": registra que o TITULAR autorizou
 * (por telefone, presencialmente etc. — a equipe registra em nome dele,
 * deixando explícito quem autorizou) o compartilhamento de UM achado
 * sanitizado com UM outro membro da família. Nunca compartilha o documento
 * original — só o `content_sanitized` já aprovado/publicado da projeção.
 */
export const registrarCompartilhamentoAchado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projecaoId: string; compartilharComClienteId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);

    const { data: projecao } = await supabase
      .from("app_projections")
      .select("id,organization_id,titular_client_id,approval_status")
      .eq("id", data.projecaoId)
      .maybeSingle();
    if (!projecao || projecao.organization_id !== organizationId) {
      throw new Error("Achado não encontrado nesta organização.");
    }
    if (!projecao.titular_client_id) {
      throw new Error("Este achado não tem titular definido — associe o titular antes de compartilhar.");
    }
    if (projecao.approval_status !== "approved" && projecao.approval_status !== "published") {
      throw new Error("Só um achado já aprovado pode ser compartilhado.");
    }

    const r = await supabase
      .from("app_projection_shares")
      .insert({
        organization_id: organizationId,
        projection_id: data.projecaoId,
        compartilhado_com_client_id: data.compartilharComClienteId,
        autorizado_por: "equipe_interna",
        autorizado_por_user_id: context.userId as string,
      })
      .select("id")
      .maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return { id: r.data?.id as string };
  });

/** Revoga uma autorização de compartilhamento — nunca exclusão física. */
export const revogarCompartilhamentoAchado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo?: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const organizationId = await autorizarEscrita(supabase, context.userId as string);
    await gravarComVerificacao({
      supabase,
      tabela: "app_projection_shares",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: {
        revogado_em: new Date().toISOString(),
        revogado_por_user_id: context.userId as string,
        revogado_motivo: (data.motivo ?? "").trim() || "Sem motivo informado.",
      },
    });
    return { ok: true };
  });

/** Lista as autorizações de compartilhamento de um achado. */
export const listarCompartilhamentosAchado = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { projecaoId: string }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    await autorizarEscrita(supabase, context.userId as string);
    const { data: linhas, error } = await supabase
      .from("app_projection_shares")
      .select("*")
      .eq("projection_id", data.projecaoId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (linhas ?? []) as Record<string, any>[];
  });
