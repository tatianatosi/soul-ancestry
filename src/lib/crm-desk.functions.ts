import { semCache } from "@/lib/no-store";
// Alias obrigatório: este arquivo já usa `linhas` como variável local.
import { linhas as linhasDe } from "@/lib/linhas";
import { createServerFn } from "@tanstack/react-start";

import { semFixtures } from "@/lib/fixtures";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  calcularMetricasCrm,
  errosBloqueantesAlteracao,
  montarFilasHoje,
  validarLead,
  type LeadDesk,
} from "@/lib/crm-desk";
import { sincronizarParametroDependentes } from "@/lib/dependentes.server";
import { TEMAS_JURIDICOS, avaliarAssinaturaPelaMatriz, canonicalizarTemaCodigo, type LinhaMatriz } from "@/lib/matriz-juridica";
import type { Dependente } from "@/lib/dependentes";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { proprietariaOperando } from "@/lib/autoridade.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const UUID = /^[0-9a-f-]{36}$/i;
const exigirUuid = (v: unknown, campo: string) => {
  if (!UUID.test(String(v ?? ""))) throw new Error(`${campo} inválido.`);
  return String(v);
};

const CAMPOS_LEAD = [
  "nome",
  "email",
  "telefone",
  "origem",
  "area_responsavel",
  "responsavel_nome",
  "indicado_por",
  "proxima_acao",
  "proxima_acao_em",
  "eixo_comercial",
  "eixo_formalizacao",
  "objetivo",
  "nacionalidade",
  "via_juridica_preliminar",
  "status_via",
  "marco_preliminar",
  "discovery_resultado",
  "resumo_call",
  "resumo_validado",
  "call_agendada_em",
  "call_realizada_em",
  "proposta_link_interno",
  "proposta_referencia_interna",
  "contrato_link_interno",
  "asaas_evento_referencia",
  "motivo_perda",
  "servico_inicial_aprovado",
  "pagamento_previsto_em",
  "dados_teste",
  "narrativa_familiar",
  "observacoes",
  "ultimo_followup_em",
  "pais_interesse",
  // Ficha de Discovery/triagem (CA 04 v1.1)
  "status_call",
  "elegibilidade_preliminar",
  "confianca_triagem",
  "geracao_ascendente",
  "linha_transmissao",
  "risco_ruptura",
  "complexidade_documental",
  "estado_documental_inicial",
  "pendencia_documental_prioritaria",
  "exige_idioma_entrevista",
  "requerentes_potenciais",
  "estrutura_familiar",
  "objecao_predominante",
  "nivel_intencao",
  "produtos_recomendados",
  "sku_referencia",
  "despesas_terceiros_status",
  "despesas_terceiros_regra",
  "despesas_terceiros_faixa",
  "consentimento_gravacao",
  "spin_situacao",
  "spin_problema",
  "spin_implicacao",
  "spin_necessidade",
  "gravacao_link_interno",
  "dossie_link_interno",
  // Dossiê-mãe autorizado
  "dossie_ativo",
  "dossie_mae_ref",
  "dossie_ambiente",
  "dossie_nivel_acesso",
  "dossie_responsavel",
  // Consentimento, trilha e pesquisa prévia (Discovery v1.0)
  "consentimento_status",
  "consentimento_em",
  "consentimento_canal",
  "consentimento_versao_aviso",
  "nacionalidades_interesse",
  "pais_linha_prioritaria",
  "localidades_conhecidas",
  "documentos_chave",
  "trilha_referencia_id",
  "marco_referencia_id",
  "pesquisa_previa_autorizacao",
  "pesquisa_previa_escopo",
  "pesquisa_previa_limite",
] as const;


function limpar(entrada: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const campo of CAMPOS_LEAD) {
    if (!(campo in entrada)) continue;
    const v = entrada[campo];
    out[campo] = typeof v === "string" && v.trim() === "" ? null : v;
  }
  return out;
}

async function orgDoUsuario(supabase: any, userId: string) {
  const { data } = await supabase.from("organization_members").select("organization_id").eq("user_id", userId).limit(1).maybeSingle();
  if (!data?.organization_id) throw new Error("Usuário sem organização ativa.");
  return data.organization_id as string;
}

/**
 * Lista de leads do Desk com validação espelhada e resultado derivado.
 *
 * Lead arquivado nunca aparece na listagem padrão — a mesma trava de "sem
 * exclusão física" que o resto do app usa (nucleos_familiares, crm_casos):
 * arquivar não é apagar, mas também não deve continuar poluindo a fila de
 * trabalho ativa. `incluirArquivados` existe só para quem precisa consultar
 * o que já foi arquivado.
 */
export const listarLeadsDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirArquivados?: boolean }) => ({ incluirArquivados: d?.incluirArquivados === true }))
  .handler(async ({ data: input, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(1000);
    if (!input.incluirArquivados) query = query.is("archived_at", null);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const leads = (data ?? []) as LeadDesk[];
    const livre = await proprietariaOperando(supabase, (context as any).userId as string);
    return leads.map((l) => ({ ...l, pendencias: validarLead(l, livre) }));
  });

/** Cria ou atualiza um lead. Rejeita valores fora das listas controladas. */
export const salvarLeadDesk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const patch = limpar(data.valores ?? {});

    let atual: LeadDesk | null = null;
    if (data.id) {
      exigirUuid(data.id, "id");
      const { data: row } = await supabase.from("leads").select("*").eq("id", data.id).maybeSingle();
      if (!row) throw new Error("Lead não encontrado nesta organização.");
      if (row.archived_at) throw new Error("Lead arquivado: edição bloqueada.");
      atual = row as LeadDesk;
    }

    const candidato = { ...(atual ?? { nome: "" }), ...patch } as LeadDesk;
    const livre = await proprietariaOperando(supabase, userId);
    const erros = errosBloqueantesAlteracao(atual, candidato, Object.keys(patch), livre);
    if (erros.length) {
      return { ok: false as const, erros, lead: atual };
    }

    if (data.id) {
      const organizationId = (atual as unknown as { organization_id: string }).organization_id;
      const resultado = await gravarComVerificacao({
        supabase,
        tabela: "leads",
        id: data.id,
        organizationId,
        userId,
        payload: patch,
      });
      return { ok: true as const, erros: [], lead: resultado.registro as LeadDesk };
    }

    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: row, error } = await supabase
      .from("leads")
      .insert({ ...patch, organization_id, created_by: userId, updated_by: userId })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: true as const, erros: [], lead: row as LeadDesk };
  });

/** Arquiva um lead. Nunca há exclusão física. */
export const arquivarLeadDesk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; motivo: string }) => {
    exigirUuid(d?.id, "id");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";
    const { data: lead } = await supabase.from("leads").select("organization_id").eq("id", data.id).maybeSingle();
    if (!lead) throw new Error("Lead não encontrado nesta organização.");
    await gravarComVerificacao({
      supabase,
      tabela: "leads",
      id: data.id,
      organizationId: lead.organization_id as string,
      userId,
      payload: { archived_at: new Date().toISOString(), archived_by: userId, archive_motivo: motivo },
    });
    return { ok: true };
  });

/** Painel Hoje + métricas comerciais e operacionais. */
export const painelHojeDesk = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d?: { incluirDemo?: boolean }) => ({ incluirDemo: d?.incluirDemo === true }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const [leadsRes, casosRes] = await Promise.all([
      supabase.from("leads").select("*").limit(1000),
      supabase
        .from("crm_casos")
        .select("id,codigo,titulo,pais,via,documentos_minimos_ok,prazo_proxima_acao,responsavel_principal,ativo,data_origin,dados_teste")
        .is("archived_at", null)
        .limit(1000),
    ]);
    // Fixtures de demonstração ficam fora das filas e métricas por padrão;
    // só entram quando o filtro explícito "Incluir demonstrações" é acionado.
    const leads = linhasDe<any>(leadsRes, "leads do Painel Hoje");
    const casos = linhasDe<any>(casosRes, "casos do Painel Hoje");
    const listaLeads = (data.incluirDemo ? leads : semFixtures(leads as never)) as unknown as LeadDesk[];
    const listaCasos = ((data.incluirDemo ? casos : semFixtures(casos as never)) as any[]).filter(
      // Massa TESTE nunca aparece no Painel Hoje padrão.
      (c) => data.incluirDemo || c.dados_teste !== true,
    );
    const { orgDoUsuario, pendenciasCadeiaPainel } = await import("@/lib/cadeia-operacional.server");
    const org = await orgDoUsuario(supabase, (context as any).userId);
    const cadeia = await pendenciasCadeiaPainel(supabase, org, { incluirTeste: data.incluirDemo });
    return {
      filas: montarFilasHoje({ leads: listaLeads, casos: listaCasos, cadeia }),
      metricas: calcularMetricasCrm({ leads: listaLeads, casos: listaCasos }),
    };
  });


/* ---------------- Dependentes ---------------- */

export const listarDependentes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: exigirUuid(d?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const { data: rows, error } = await supabase
      .from("case_dependents")
      .select("*")
      .eq("case_id", data.caseId)
      .is("archived_at", null)
      .order("created_at");
    if (error) throw new Error(error.message);
    return (rows ?? []) as Dependente[];
  });

export const salvarDependente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id?: string | null; caseId: string; valores: Record<string, unknown> }) => {
    exigirUuid(d?.caseId, "caseId");
    if (d.id) exigirUuid(d.id, "id");
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const campos = [
      "nome_completo",
      "vinculo_com_titular",
      "titular_responsavel_legal_nome",
      "status_representacao",
      "documento_representacao_referencia_interna",
      "participa_do_contrato",
      "possui_acesso_app",
      "anexo_individual_aplicavel",
      "observacao_interna",
    ];
    const patch: Record<string, unknown> = {};
    for (const c of campos) if (c in data.valores) patch[c] = data.valores[c] === "" ? null : data.valores[c];

    const { data: caso } = await supabase.from("crm_casos").select("organization_id").eq("id", data.caseId).maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");

    if (data.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "case_dependents",
        id: data.id,
        organizationId: caso.organization_id as string,
        userId,
        payload: patch,
      });
      await sincronizarParametroDependentes(supabase, data.caseId);
      return { ok: true };
    }
    await inserirComVerificacao({
      supabase,
      tabela: "case_dependents",
      organizationId: caso.organization_id as string,
      userId,
      payload: { ...patch, case_id: data.caseId },
    });
    await sincronizarParametroDependentes(supabase, data.caseId);
    return { ok: true };
  });

/* ---------------- Matriz jurídica ---------------- */

/** Lê a matriz garantindo que todo tema normativo apareça, mesmo sem decisão. */
export const listarMatrizJuridica = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    semCache();
    const supabase = (context as any).supabase;
    // 08/09/2026 — esta leitura não filtrava organização (dependia só de RLS).
    // O banco tem três organizações com matriz jurídica; sem o filtro, uma
    // aprovação gravada em outra organização podia ser lida como se fosse
    // desta, ou o inverso — foi exatamente o que mascarou 7 temas bloqueantes
    // arquivados na organização operante. Filtro explícito, sem depender de RLS.
    const organization_id = await orgDoUsuario(supabase, (context as any).userId as string);
    const matrizRes = await supabase
      .from("legal_clause_matrix")
      .select("*")
      .eq("organization_id", organization_id)
      .is("archived_at", null);
    const rows = linhasDe<any>(matrizRes, "matriz jurídica");
    const linhas: LinhaMatriz[] = TEMAS_JURIDICOS.map((t) => {
      const l = rows.find((r) => r.tema_codigo === t.tema_codigo);
      return {
        tema_codigo: t.tema_codigo,
        tema: t.tema,
        status: l?.status ?? "pendente_revisao_juridica",
        versao_juridica_aplicavel: l?.versao_juridica_aplicavel ?? null,
        responsavel_revisao: l?.responsavel_revisao ?? null,
        decisao: l?.decisao ?? null,
        justificativa: l?.justificativa ?? null,
        decidido_em: l?.decidido_em ?? null,
        referencia_versao: l?.referencia_versao ?? null,
        impacto_templates: l?.impacto_templates ?? t.impacto_templates,
        bloqueia_assinatura: l?.bloqueia_assinatura ?? t.bloqueia_assinatura,
      };
    });
    return linhas;
  });

/** Registra decisão de um tema. Nunca grava texto de cláusula. */
export const registrarDecisaoTema = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      tema_codigo: string;
      status: string;
      decisao?: string | null;
      justificativa?: string | null;
      responsavel_revisao?: string | null;
      versao_juridica_aplicavel?: string | null;
      referencia_versao?: string | null;
    }) => {
      const tema = TEMAS_JURIDICOS.find((t) => t.tema_codigo === d?.tema_codigo);
      if (!tema) throw new Error("Tema fora da matriz normativa.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const tema = TEMAS_JURIDICOS.find((t) => t.tema_codigo === data.tema_codigo)!;
    const registro = {
      organization_id,
      tema_codigo: tema.tema_codigo,
      tema: tema.tema,
      status: data.status,
      decisao: data.decisao ?? null,
      justificativa: data.justificativa ?? null,
      responsavel_revisao: data.responsavel_revisao ?? null,
      versao_juridica_aplicavel: data.versao_juridica_aplicavel ?? null,
      referencia_versao: data.referencia_versao ?? null,
      impacto_templates: tema.impacto_templates,
      bloqueia_assinatura: tema.bloqueia_assinatura,
      decidido_em: data.status === "pendente_revisao_juridica" ? null : new Date().toISOString(),
      updated_by: userId,
    } as Record<string, unknown>;
    // Achado real (08/09/2026): a chave única é (organization_id, tema_codigo) e
    // NÃO exclui linha arquivada. Um dedupe anterior (07/09) arquivou 11 dos 13
    // temas desta organização como "duplicata de seed", sem perceber que isso
    // deixava o tema sem NENHUMA linha ativa — e a busca abaixo, ao ignorar
    // linhas arquivadas, nunca as encontrava. Resultado: toda tentativa de
    // registrar decisão nesses temas caía no INSERT e colidia com a própria
    // linha arquivada, travando a tela com "duplicate key value violates
    // unique constraint" para a Proprietária. Corrigido: busca por organização
    // (nunca confia só em RLS para isolar) e independente de arquivamento —
    // reaproveita a linha existente (arquivada ou não) em vez de tentar duplicar,
    // e desarquiva ao registrar: registrar decisão é exatamente o ato que torna
    // o tema vigente de novo.
    const { data: existente } = await supabase
      .from("legal_clause_matrix")
      .select("id,archived_at")
      .eq("organization_id", organization_id)
      .eq("tema_codigo", tema.tema_codigo)
      .order("archived_at", { ascending: true, nullsFirst: true })
      .limit(1)
      .maybeSingle();
    if (existente?.archived_at) {
      registro.archived_at = null;
      registro.archive_motivo = null;
      registro.substituido_por_id = null;
      registro.substituicao_motivo = null;
    }
    if (existente?.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "legal_clause_matrix",
        id: existente.id,
        organizationId: organization_id,
        userId,
        payload: { ...registro, archived_at: null, archived_by: null, archive_motivo: null },
      });
    } else {
      await inserirComVerificacao({
        supabase,
        tabela: "legal_clause_matrix",
        organizationId: organization_id,
        userId,
        payload: registro,
      });
    }
    return { ok: true };
  });

/* ---------------- Páginas da proposta Canva ---------------- */

export const listarPaginasCanva = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { proposalId: string }) => ({ proposalId: exigirUuid(d?.proposalId, "proposalId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;
    const paginasRes = await supabase
      .from("proposal_canva_pages")
      .select("*")
      .eq("proposal_id", data.proposalId)
      .is("archived_at", null)
      .order("page_number");
    return linhasDe<any>(paginasRes, "páginas da proposta Canva");
  });

/** Registra a extração de uma página 1–7 da proposta Canva. */
export const salvarPaginaCanva = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      proposalId: string;
      caseId: string;
      page_number: number;
      extracao_status: string;
      page_content_structured?: Record<string, unknown> | null;
      campos_nao_localizados?: string[] | null;
      observacao_interna?: string | null;
    }) => {
      exigirUuid(d?.proposalId, "proposalId");
      exigirUuid(d?.caseId, "caseId");
      if (![1, 2, 3, 4, 5, 6, 7].includes(Number(d?.page_number))) throw new Error("Somente páginas 1 a 7 são fonte de escopo.");
      if (!["pendente", "em_extracao", "extraida", "nao_aplicavel"].includes(d?.extracao_status))
        throw new Error("Status de extração inválido.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const { data: caso } = await supabase.from("crm_casos").select("organization_id").eq("id", data.caseId).maybeSingle();
    if (!caso) throw new Error("Caso não encontrado nesta organização.");
    const registro = {
      organization_id: caso.organization_id,
      proposal_id: data.proposalId,
      case_id: data.caseId,
      page_number: data.page_number,
      extracao_status: data.extracao_status,
      page_content_structured: data.page_content_structured ?? {},
      campos_nao_localizados: data.campos_nao_localizados ?? [],
      observacao_interna: data.observacao_interna ?? null,
      extraido_por: userId,
      extraido_em: new Date().toISOString(),
      updated_by: userId,
    };
    const { data: existente } = await supabase
      .from("proposal_canva_pages")
      .select("id")
      .eq("proposal_id", data.proposalId)
      .eq("page_number", data.page_number)
      .is("archived_at", null)
      .maybeSingle();
    if (existente?.id) {
      await gravarComVerificacao({
        supabase,
        tabela: "proposal_canva_pages",
        id: existente.id,
        organizationId: caso.organization_id as string,
        userId,
        payload: registro,
      });
    } else {
      await inserirComVerificacao({
        supabase,
        tabela: "proposal_canva_pages",
        organizationId: caso.organization_id as string,
        userId,
        payload: registro,
      });
    }
    return { ok: true };
  });

/* ---------------- ANA-E-01: consolidação e diagnóstico de instrumentos ---------------- */

/** Deduplicação lógica auditada da matriz (uma linha canônica por tema). Não apaga nada. */
export const consolidarMatrizJuridica = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;
    const organization_id = await orgDoUsuario(supabase, userId);
    const { data, error } = await supabase.rpc("matriz_juridica_deduplicar", { _org: organization_id });
    if (error) throw new Error(error.message);
    return { consolidados: (data ?? []) as any[] };
  });

/**
 * Leitura agregada para preparação de instrumentos: matriz jurídica, dependentes,
 * checklist cadastral, case service/critérios e conferência da proposta Canva.
 * Só diagnostica bloqueios — não redige cláusula nem cria artefato externo.
 */
export const diagnosticoInstrumentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string }) => ({ caseId: exigirUuid(d?.caseId, "caseId") }))
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = (context as any).supabase;

    const [matrizRes, depRes, checkRes, servRes, critRes, confRes] = await Promise.all([
      supabase.from("legal_clause_matrix").select("*").is("archived_at", null),
      supabase.from("case_dependents").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase.from("checklist_cadastral").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase.from("case_services").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase.from("case_service_criterios").select("*").eq("case_id", data.caseId).is("archived_at", null),
      supabase
        .from("piloto_conferencia")
        .select("*")
        .eq("case_id", data.caseId)
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    const rows = linhasDe<any>(matrizRes, "matriz jurídica");
    const linhas: LinhaMatriz[] = TEMAS_JURIDICOS.map((t) => {
      const l = rows.find((r) => canonicalizarTemaCodigo(r.tema_codigo) === t.tema_codigo);
      return {
        tema_codigo: t.tema_codigo,
        tema: t.tema,
        status: l?.status ?? "pendente_revisao_juridica",
        versao_juridica_aplicavel: l?.versao_juridica_aplicavel ?? null,
        responsavel_revisao: l?.responsavel_revisao ?? null,
        decisao: l?.decisao ?? null,
        justificativa: l?.justificativa ?? null,
        decidido_em: l?.decidido_em ?? null,
        referencia_versao: l?.referencia_versao ?? null,
        impacto_templates: l?.impacto_templates ?? t.impacto_templates,
        bloqueia_assinatura: l?.bloqueia_assinatura ?? t.bloqueia_assinatura,
      };
    });

    const assinatura = avaliarAssinaturaPelaMatriz(linhas);
    const bloqueios = assinatura.bloqueios.map((b) => ({ origem: "matriz_juridica", detalhe: `${b.tema}: ${b.motivo}` }));

    const dependentes = linhasDe<any>(depRes, "dependentes do caso");
    for (const d of dependentes) {
      if (String(d.status_representacao ?? "") !== "documentada") {
        bloqueios.push({
          origem: "dependentes",
          detalhe: `Representação pendente para dependente ${d.nome ?? d.id}.`,
        });
      }
    }

    const checklist = linhasDe<any>(checkRes, "checklist cadastral do caso");
    const checklistPendente = checklist.filter((c) => String(c.status ?? "") !== "completo").length;
    if (checklistPendente) {
      bloqueios.push({ origem: "checklist_cadastral", detalhe: `${checklistPendente} item(ns) cadastrais pendentes.` });
    }

    const servicos = linhasDe<any>(servRes, "case services do caso");
    const servicoNaoConsolidado = servicos.filter((s) => !["approved", "contracted"].includes(String(s.status ?? ""))).length;
    if (!servicos.length) bloqueios.push({ origem: "case_service", detalhe: "Nenhum case service registrado." });
    else if (servicoNaoConsolidado)
      bloqueios.push({ origem: "case_service", detalhe: `${servicoNaoConsolidado} case service(s) fora de estado consolidado.` });

    const criterios = linhasDe<any>(critRes, "critérios de aceite do caso");
    const criteriosPendentes = criterios.filter((c) => String(c.estado ?? c.status ?? "") !== "aceito").length;
    if (criteriosPendentes)
      bloqueios.push({ origem: "criterios_aceite", detalhe: `${criteriosPendentes} critério(s) de aceite pendentes.` });

    const conferencia = linhasDe<any>(confRes, "conferência de escopo da proposta")[0] ?? null;
    if (!conferencia) bloqueios.push({ origem: "conferencia_canva", detalhe: "Conferência de escopo da proposta não registrada." });
    else if (String(conferencia.status ?? "") !== "aprovado_para_preparacao")
      bloqueios.push({ origem: "conferencia_canva", detalhe: `Conferência de escopo em estado “${conferencia.status}”.` });

    return {
      linhas,
      assinatura,
      bloqueios,
      resumo: {
        dependentes: dependentes.length,
        checklist_pendente: checklistPendente,
        criterios_pendentes: criteriosPendentes,
        case_services: servicos.length,
        conferencia_status: conferencia?.status ?? null,
      },
      nenhuma_acao_externa: true,
    };
  });

/* ————— Cadastro manual de lead (Comercial → Leads → Novo lead) ————— */

const soDigitos = (v: string) => v.replace(/\D+/g, "");
const normalizarNome = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export type PossivelDuplicidade = {
  id: string;
  codigo: string | null;
  nome: string;
  email: string | null;
  telefone: string | null;
  motivo: string;
};

/** Procura possíveis duplicidades por e-mail e telefone, usando nome como sinal complementar. */
async function buscarDuplicidades(
  supabase: any,
  entrada: { nome: string; email?: string | null; telefone?: string | null },
): Promise<PossivelDuplicidade[]> {
  const leadsRes = await supabase.from("leads").select("id, codigo, nome, email, telefone").limit(2000);
  const linhas = linhasDe<{ id: string; codigo: string | null; nome: string; email: string | null; telefone: string | null }>(
    leadsRes,
    "leads para checagem de duplicidade",
  );

  const email = (entrada.email ?? "").trim().toLowerCase();
  const tel = soDigitos(entrada.telefone ?? "");
  const telChave = tel.length >= 8 ? tel.slice(-8) : "";
  const nome = normalizarNome(entrada.nome);

  const achados: PossivelDuplicidade[] = [];
  for (const l of linhas) {
    const motivos: string[] = [];
    if (email && (l.email ?? "").trim().toLowerCase() === email) motivos.push("mesmo e-mail");
    const lTel = soDigitos(l.telefone ?? "");
    if (telChave && lTel.length >= 8 && lTel.slice(-8) === telChave) motivos.push("mesmo telefone");
    if (nome && normalizarNome(l.nome ?? "") === nome) motivos.push("mesmo nome");
    if (motivos.length) achados.push({ ...l, motivo: motivos.join(" + ") });
  }
  return achados;
}

export const verificarDuplicidadeLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { nome: string; email?: string | null; telefone?: string | null }) => d)
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    return { duplicidades: await buscarDuplicidades(supabase, data) };
  });

/** Cria contato/lead manual já em Triagem, com deduplicação prévia. */
export const criarLeadManual = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      nome: string;
      email?: string | null;
      telefone?: string | null;
      origem: string;
      objetivo: string;
      responsavel_nome: string;
      proxima_acao: string;
      proxima_acao_em: string;
      resumo_call?: string | null;
      indicado_por?: string | null;
      confirmarDuplicidade?: boolean;
    }) => {
      // Campos de conteudo do lead (05/09/2026).
      //
      // Antes exigia sete campos ao mesmo tempo para gravar. Faltando um, nada
      // era salvo e o trabalho se perdia. Agora so o nome e obrigatorio - sem
      // ele nao ha lead. O que falta vira pendencia visivel no proprio
      // registro, para completar depois.
      if (!d?.nome?.trim()) throw new Error("Informe ao menos o nome para criar o lead.");
      return d;
    },
  )
  .handler(async ({ data, context }) => {
    const supabase = (context as any).supabase;
    const userId = (context as any).userId as string;

    const duplicidades = await buscarDuplicidades(supabase, data);
    if (duplicidades.length && !data.confirmarDuplicidade) {
      return { ok: false as const, duplicidades, erros: [], lead: null };
    }

    const candidato: LeadDesk = {
      nome: data.nome.trim(),
      email: data.email?.trim() || null,
      telefone: data.telefone?.trim() || null,
      origem: data.origem,
      objetivo: data.objetivo,
      area_responsavel: "comercial",
      responsavel_nome: data.responsavel_nome.trim(),
      proxima_acao: data.proxima_acao,
      proxima_acao_em: data.proxima_acao_em,
      eixo_comercial: "triagem",
      eixo_formalizacao: "nao_iniciado",
      resumo_call: data.resumo_call?.trim() || null,
      indicado_por: data.indicado_por?.trim() || null,
    };

    const livre = await proprietariaOperando(supabase, userId);
    const erros = validarLead(candidato, livre);
    if (erros.length) return { ok: false as const, duplicidades: [], erros, lead: null };

    const organization_id = await orgDoUsuario(supabase, userId);
    const { data: row, error } = await supabase
      .from("leads")
      .insert({ ...candidato, organization_id, created_by: userId, updated_by: userId })
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { ok: true as const, duplicidades: [], erros: [], lead: row as LeadDesk };
  });
