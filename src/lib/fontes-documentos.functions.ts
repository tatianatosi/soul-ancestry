import { semCache } from "@/lib/no-store";
import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contextoRg, PAPEIS_EDITA, PAPEIS_LE_DETALHE, type Sb } from "@/lib/pesquisa-modulo.server";
import { pessoasDoCasoComFallbackNucleo } from "@/lib/pessoa-vinculo";
import { gravarComVerificacao, inserirComVerificacao } from "@/lib/persistencia.server";
import { registrarTimelineCaso } from "@/lib/timeline-operacional.server";
import {
  CONFIDENCIALIDADE,
  MIMES_ACEITOS,
  ORIGENS_DOCUMENTO,
  QUALIDADE_ORIGEM,
  STATUS_FONTE,
  TIPOS_DOCUMENTO,
  extensaoDe,
  validarArquivo,
} from "@/lib/fontes-documentos";

/* eslint-disable @typescript-eslint/no-explicit-any */

const BUCKET = "documentos";

const CAMPOS_METADADOS = [
  "tipo_documento",
  "origem_documento",
  "status",
  "qualidade_origem",
  "confidencialidade",
  "pessoa_ref_id",
  "pessoa_nao_identificada",
  "titulo_interno",
  "data_documento",
  "pais",
  "estado_provincia",
  "cidade",
  "instituicao_emissora",
  "referencia_origem",
  "idioma",
  "observacoes",
];

function filtrarMetadados(entrada: Record<string, unknown>) {
  const sobra = Object.keys(entrada).filter((k) => !CAMPOS_METADADOS.includes(k));
  if (sobra.length) throw new Error(`CAMPO_NAO_MAPEADO_PARA_PERSISTENCIA: ${sobra.join(", ")}`);
  const out: Record<string, unknown> = {};
  for (const c of CAMPOS_METADADOS) if (c in entrada) out[c] = entrada[c] === "" ? null : entrada[c];
  return out;
}

function validarDicionarios(valores: Record<string, unknown>) {
  const checa = (campo: string, lista: { id: string }[]) => {
    if (valores[campo] === undefined || valores[campo] === null) return;
    if (!lista.some((o) => o.id === String(valores[campo]))) throw new Error(`${campo.toUpperCase()}_INVALIDO`);
  };
  checa("tipo_documento", TIPOS_DOCUMENTO);
  checa("origem_documento", ORIGENS_DOCUMENTO);
  checa("status", STATUS_FONTE);
  checa("qualidade_origem", QUALIDADE_ORIGEM);
  checa("confidencialidade", CONFIDENCIALIDADE);
  const naoIdent = valores["pessoa_nao_identificada"] === true;
  const pessoa = String(valores["pessoa_ref_id"] ?? "").trim();
  if ("pessoa_ref_id" in valores || "pessoa_nao_identificada" in valores) {
  }
}

async function pessoasDoCaso(supabase: Sb, organizationId: string, caseId: string) {
  // Pessoas do caso (núcleo/membros) + research_people só desta pesquisa, nunca da org inteira.
  const pesquisaCaso = await supabase
    .from("research_cases")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("case_id", caseId)
    .is("archived_at", null)
    .maybeSingle();
  const researchCaseId = (pesquisaCaso.data as { id?: string } | null)?.id;
  const [membros, pesquisa] = await Promise.all([
    pessoasDoCasoComFallbackNucleo(supabase, caseId),
    researchCaseId
      ? supabase
          .from("research_people")
          .select("id,canonical_name")
          .eq("organization_id", organizationId)
          .eq("research_case_id", researchCaseId)
          .is("archived_at", null)
      : Promise.resolve({ data: [] }),
  ]);
  const lista = [
    ...(membros.map((m) => ({ id: String(m.id), nome: String(m.nome ?? "Pessoa do caso") }))),
    ...(((pesquisa.data ?? []) as any[]).map((p) => ({ id: String(p.id), nome: String(p.canonical_name ?? "Pessoa") }))),
  ];
  const vistos = new Set<string>();
  return lista.filter((p) => (vistos.has(p.id) ? false : (vistos.add(p.id), true)));
}

async function garantirCaso(supabase: Sb, organizationId: string, caseId: string) {
  const { data } = await supabase
    .from("crm_casos")
    .select("id")
    .eq("id", caseId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (!data) throw new Error("CASO_NAO_ENCONTRADO_NESTA_ORGANIZACAO");
  // Defesa em profundidade: o RLS já limita por caso; aqui a negativa vira erro legível.
  const permitido = await (supabase as any).rpc("pode_pesquisar_caso", { _case: caseId });
  if (permitido.error) throw new Error(permitido.error.message);
  if (permitido.data === false) throw new Error("SEM_ACESSO_A_ESTE_CASO");
}


/** Lista de fontes/documentos do caso, mais as pessoas elegíveis e a equipe. */
export const listarFontesDocumentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; incluirArquivados?: boolean }) => d)
  .handler(async ({ data, context }) => {
    semCache();
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa as fontes e documentos do caso.");
    await garantirCaso(supabase, organizationId, data.caseId);

    let q = supabase
      .from("case_source_documents")
      .select(
        "id,case_id,pessoa_ref_id,pessoa_nao_identificada,nome_arquivo,titulo_interno,tipo_documento,origem_documento,status,qualidade_origem,confidencialidade,data_documento,pais,estado_provincia,cidade,instituicao_emissora,referencia_origem,idioma,observacoes,extracao_status,created_by,created_at,updated_at,archived_at,archive_motivo",
      )
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .order("created_at", { ascending: false });
    if (!data.incluirArquivados) q = q.is("archived_at", null);
    const { data: linhas, error } = await q;
    if (error) throw new Error(error.message);

    const [pessoas, equipe, vinculos] = await Promise.all([
      pessoasDoCaso(supabase, organizationId, data.caseId),
      supabase.from("profiles").select("id,nome").limit(200),
      supabase
        .from("case_source_document_links")
        .select("source_document_id")
        .eq("organization_id", organizationId)
        .eq("case_id", data.caseId)
        .is("archived_at", null),
    ]);

    const contagem: Record<string, number> = {};
    for (const v of (vinculos.data ?? []) as any[]) {
      const k = String(v.source_document_id);
      contagem[k] = (contagem[k] ?? 0) + 1;
    }

    return {
      podeEditar: PAPEIS_EDITA.includes(papel),
      documentos: ((linhas ?? []) as Record<string, any>[]).map((d) => ({
        ...d,
        vinculos_ativos: contagem[String(d["id"])] ?? 0,
      })),
      pessoas,
      equipe: ((equipe.data ?? []) as any[]).map((e) => ({ id: String(e.id), nome: String(e.nome ?? "Equipe") })),
    };
  });

/** Autoriza o envio e devolve endereço temporário no acervo privado. Nunca URL pública. */
export const criarUploadFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { caseId: string; nomeArquivo: string; tamanhoBytes: number }) => {
    const check = validarArquivo({ name: d?.nomeArquivo, size: d?.tamanhoBytes });
    if (!check.ok) throw new Error(check.erros.join(", "));
    return d;
  })
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode enviar documentos de pesquisa.");
    await garantirCaso(supabase, organizationId, data.caseId);

    const seguro = data.nomeArquivo.replace(/[^\w.\-]+/g, "_").slice(-80);
    const path = `fontes/${organizationId}/${data.caseId}/${Date.now()}-${seguro}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assinado = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (assinado.error) throw new Error(assinado.error.message);
    return {
      path,
      token: assinado.data.token,
      signedUrl: assinado.data.signedUrl,
      mimeSugerido: MIMES_ACEITOS[extensaoDe(data.nomeArquivo)] ?? null,
    };
  });

/**
 * Registra apenas o Documento/Fonte. Não cria evidência, pessoa, relação,
 * evento, linhagem, achado, relatório nem projeção ao App Cliente.
 */
export const registrarFonteDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (d: {
      caseId: string;
      storagePath: string;
      nomeArquivo: string;
      mimeType?: string;
      tamanhoBytes?: number;
      valores: Record<string, unknown>;
    }) => d,
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode registrar fontes documentais.");
    await garantirCaso(supabase, organizationId, data.caseId);
    if (!data.storagePath.startsWith(`fontes/${organizationId}/${data.caseId}/`)) {
      throw new Error("ARQUIVO_FORA_DO_CASO");
    }

    const valores = filtrarMetadados(data.valores);
    validarDicionarios(valores);
    if (valores["pessoa_ref_id"]) {
      const pessoas = await pessoasDoCaso(supabase, organizationId, data.caseId);
      if (!pessoas.some((p) => p.id === String(valores["pessoa_ref_id"]))) throw new Error("PESSOA_NAO_PERTENCE_AO_CASO");
    }

    // P5 (26/09/2026) — "corrigir writers/readers e feedback de persistência na
    // cadeia": este escritor só conferia `r.data?.id`, sem releitura campo a
    // campo (mais fraco que o padrão de evidência/achado/projeção). Passa a
    // gravar+reler com `inserirComVerificacao`.
    const r = await inserirComVerificacao({
      supabase,
      tabela: "case_source_documents",
      organizationId,
      userId: context.userId as string,
      payload: {
        ...valores,
        status: "pendente_revisao",
        case_id: data.caseId,
        storage_path: data.storagePath,
        nome_arquivo: data.nomeArquivo.slice(0, 200),
        mime_type: data.mimeType ?? null,
        tamanho_bytes: data.tamanhoBytes ?? null,
      },
    });

    // P5 (26/09/2026) — Estágio 1 (Fonte/Documento) nunca deixava rastro em
    // `case_timeline_events` (criar/editar/arquivar ficavam sem histórico,
    // diferente de evidência/achado/projeção). Fecha essa lacuna.
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: `Fonte documental registrada — ${data.nomeArquivo}`,
      summaryInternal: `Tipo: ${String(valores["tipo_documento"] ?? "não informado")}`,
      sourceEntityType: "case_source_documents",
      sourceEntityId: r.id,
      userId: context.userId as string,
    });

    return { id: r.id, status: (r.registro["status"] as string) ?? "pendente_revisao" };
  });

/** Edição de metadados, auditada pelo banco. O arquivo em si nunca é trocado. */
export const editarMetadadosFonte = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; caseId: string; valores: Record<string, unknown> }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode editar metadados de fontes.");

    const valores = filtrarMetadados(data.valores);
    validarDicionarios(valores);
    if (valores["pessoa_ref_id"]) {
      const pessoas = await pessoasDoCaso(supabase, organizationId, data.caseId);
      if (!pessoas.some((p) => p.id === String(valores["pessoa_ref_id"]))) throw new Error("PESSOA_NAO_PERTENCE_AO_CASO");
    }

    const r = await gravarComVerificacao({
      supabase,
      tabela: "case_source_documents",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: valores,
    });

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Metadados da fonte documental atualizados",
      sourceEntityType: "case_source_documents",
      sourceEntityId: data.id,
      userId: context.userId as string,
    });

    return { id: data.id, salvoEm: r.salvoEm };
  });

/** Arquivamento lógico com motivo. Não existe exclusão física. */
export const arquivarFonteDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; caseId: string; motivo: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const { organizationId, papel } = await contextoRg(supabase, context.userId as string);
    if (!PAPEIS_EDITA.includes(papel)) throw new Error("Seu papel não pode arquivar fontes documentais.");
    const motivo = (data.motivo ?? "").trim() || "Sem motivo informado.";

    await gravarComVerificacao({
      supabase,
      tabela: "case_source_documents",
      id: data.id,
      organizationId,
      userId: context.userId as string,
      payload: { archived_at: new Date().toISOString(), archive_motivo: motivo, status: "arquivado" },
    });

    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId: data.caseId,
      eventType: "caso",
      title: "Fonte documental arquivada",
      summaryInternal: motivo,
      sourceEntityType: "case_source_documents",
      sourceEntityId: data.id,
      userId: context.userId as string,
    });

    return { ok: true };
  });

/** Link temporário de leitura, sempre assinado e de curta duração. */
export const verFonteDocumento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; caseId: string }) => d)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as unknown as Sb;
    const userId = context.userId as string;
    const { organizationId, papel } = await contextoRg(supabase, userId);
    if (!PAPEIS_LE_DETALHE.includes(papel)) throw new Error("Seu papel não acessa arquivos de pesquisa.");

    const { data: doc, error } = await supabase
      .from("case_source_documents")
      .select("id,storage_path,tipo_documento,confidencialidade")
      .eq("id", data.id)
      .eq("organization_id", organizationId)
      .eq("case_id", data.caseId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!doc) throw new Error("DOCUMENTO_NAO_ENCONTRADO");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const assinado = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(doc.storage_path as string, 120);
    if (assinado.error) throw new Error(assinado.error.message);

    await supabaseAdmin.from("audit_logs").insert({
      organization_id: organizationId,
      user_id: userId,
      acao: "leitura_arquivo",
      entidade: "case_source_documents",
      entidade_id: doc.id,
      metadados: { tipo_documento: doc.tipo_documento, confidencialidade: doc.confidencialidade },
    });

    return { url: assinado.data.signedUrl as string };
  });
