/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Corte 0 (01/10/2026) — o núcleo do escritor único de evidência.
 *
 * ## Por que este arquivo existe
 *
 * No Corte 1a (01/10, SHA `40e43abf`) a decisão da Proprietária foi "módulo
 * novo; as rotas só chamam". Eu aposentei os cinco escritores concorrentes,
 * mas **não liguei as rotas ao módulo** — as quatro telas que gravavam
 * evidência passaram a só lançar `EVIDENCIA_ESCRITOR_APOSENTADO`. Registrar
 * evidência ficou quebrado em produção. Este arquivo fecha essa metade.
 *
 * O padrão é o que o repositório já usa para lógica de servidor compartilhada
 * entre `createServerFn`s (`cadeia-operacional.server.ts`,
 * `d7-microentrega.server.ts`): funções `async` puras de efeito, recebendo o
 * client e o usuário, sem middleware próprio. `evidencia-canonica.functions.ts`
 * é a casca HTTP; os escritores antigos chamam o mesmo núcleo daqui. Assim
 * continua existindo **um** caminho de gravação, e nenhuma rota volta a ter
 * writer próprio.
 */
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
export async function areaDePesquisaDoCaso(
  supabase: any,
  organizationId: string,
  caseId: string,
): Promise<string> {
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

/* ------------------------------------------------------------------ */
/* Leitura canônica (Corte 0-bis, 03/10/2026)                          */
/* ------------------------------------------------------------------ */

/**
 * Achado da Proprietária em 03/10: o Corte 0 fechou o lado do ESCRITOR
 * (as 4 rotas gravam em `research_evidence_items`), mas sete leitores
 * continuaram consultando `evidences` — tabela com **zero linhas** e sem
 * escritor desde o Corte 1a. Resultado: a Biblioteca de Evidências, o
 * Relatório de fase e a aba de Documentos mostravam lista vazia mesmo com
 * evidência real gravada.
 *
 * Estas funções são o único de-para de LEITURA. Devolvem a linha canônica
 * acrescida dos apelidos que as telas já leem (`title_internal`,
 * `description_internal`, `validation_notes_internal`, `case_id`,
 * `research_person_id`) — mesmo precedente de
 * `pesquisa-cadeia.functions.ts` (`title_internal: e.title ?? e.title_internal`).
 * De-para de leitura é permitido; gravar vocabulário novo não é (AGENTS.md).
 */
export type EvidenciaLeitura = Record<string, any> & {
  id: string;
  case_id: string | null;
  title_internal: string;
  description_internal: string | null;
  validation_notes_internal: string | null;
  research_person_id: string | null;
};

const COLUNAS_EVIDENCIA_LEITURA =
  "id,title,description,evidence_type,evidence_status,workflow_status,confidence_level," +
  "evidence_nature,access_level,epistemic_validation_status,legal_review_status," +
  "legal_review_notes_internal,validation_rationale,reference_date,reference_location," +
  "negative_search_source,negative_search_date,negative_search_next_action," +
  "person_id,source_id,document_id,research_item_id,research_case_id," +
  "responsible_user_id,reviewed_by,reviewed_at,validated_at,validated_by," +
  "client_visibility,sensitivity_level,fornecida_pelo_cliente,origem_externa," +
  "storage_reference_internal,external_reference,created_at,updated_at," +
  "archived_at,archive_reason";

/** Acrescenta os apelidos de leitura à linha canônica. Nada é inventado. */
function comApelidosDeLeitura(linha: Record<string, any>, caseId: string | null): EvidenciaLeitura {
  return {
    ...linha,
    case_id: caseId,
    title_internal: (linha["title"] as string) ?? "",
    description_internal: (linha["description"] as string | null) ?? null,
    validation_notes_internal: (linha["validation_rationale"] as string | null) ?? null,
    research_person_id: (linha["person_id"] as string | null) ?? null,
  } as EvidenciaLeitura;
}

/**
 * Todas as evidências canônicas do caso, mais recentes primeiro.
 * Filtra por `research_cases.case_id` porque a chave de
 * `research_evidence_items` é `research_case_id`, não `case_id`.
 */
export async function listarEvidenciasCanonicasDoCaso(
  supabase: any,
  organizationId: string,
  caseId: string,
  opcoes?: { incluirArquivadas?: boolean },
): Promise<EvidenciaLeitura[]> {
  let q = supabase
    .from("research_evidence_items")
    .select(`${COLUNAS_EVIDENCIA_LEITURA},research_cases!inner(case_id)`)
    .eq("organization_id", organizationId)
    .eq("research_cases.case_id", caseId);
  if (!opcoes?.incluirArquivadas) q = q.is("archived_at", null);
  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, any>[]).map((l) => comApelidosDeLeitura(l, caseId));
}

/** Evidências canônicas por id (para rotular vínculo/projeção já gravada). */
export async function evidenciasCanonicasPorIds(
  supabase: any,
  organizationId: string,
  ids: readonly string[],
): Promise<EvidenciaLeitura[]> {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from("research_evidence_items")
    .select(`${COLUNAS_EVIDENCIA_LEITURA},research_cases!inner(case_id)`)
    .eq("organization_id", organizationId)
    .in("id", [...ids]);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, any>[]).map((l) =>
    comApelidosDeLeitura(l, (l["research_cases"]?.case_id as string | undefined) ?? null),
  );
}

/** Uma evidência canônica por id, já com o `case_id` resolvido. */
export async function evidenciaCanonicaPorId(
  supabase: any,
  organizationId: string,
  id: string,
): Promise<EvidenciaLeitura | null> {
  const linhas = await evidenciasCanonicasPorIds(supabase, organizationId, [id]);
  return linhas[0] ?? null;
}

export type EntradaGravacaoEvidencia = {
  caseId: string;
  id?: string | null;
  titulo: string;
  tipo: string;
  descricao?: string | null;
  fonteId?: string | null;
  pessoaId?: string | null;
  /** Só na criação: de onde a gravação veio, para a auditoria. */
  origem?: string | null;
  /**
   * Os 12 campos que a Biblioteca de Evidências já coletava e que a tabela
   * canônica passou a ter na migration `20261001190000`. Todos opcionais: quem
   * não os preenche continua gravando como antes.
   */
  natureza?: string | null;
  nivelAcesso?: string | null;
  estadoEpistemico?: string | null;
  revisaoJuridica?: string | null;
  notaRevisaoJuridica?: string | null;
  dataReferencia?: string | null;
  localReferencia?: string | null;
  referenciaArmazenamento?: string | null;
  buscaNegativaFonte?: string | null;
  buscaNegativaData?: string | null;
  buscaNegativaProximaAcao?: string | null;
  itemPesquisaId?: string | null;
};

/** Só entra no payload o que veio preenchido — nunca apaga valor existente. */
function seDefinido(payload: Record<string, unknown>, coluna: string, valor: unknown) {
  if (valor === undefined) return;
  if (typeof valor === "string" && valor.trim() === "") return;
  payload[coluna] = valor;
}

/** Cria ou atualiza evidência. Único caminho de escrita da tabela canônica. */
export async function gravarEvidenciaCanonica(
  supabase: any,
  userId: string,
  organizationId: string,
  data: EntradaGravacaoEvidencia,
) {
  const researchCaseId = await areaDePesquisaDoCaso(supabase, organizationId, data.caseId);

  const erros = validarEvidencia({ titulo: data.titulo, tipo: data.tipo });
  if (erros.length) throw new Error(erros.join(" "));

  const campos: Record<string, unknown> = {
    title: data.titulo.trim(),
    description: data.descricao?.trim() || null,
    evidence_type: data.tipo,
    source_id: data.fonteId || null,
    person_id: data.pessoaId || null,
  };
  seDefinido(campos, "evidence_nature", data.natureza);
  seDefinido(campos, "access_level", data.nivelAcesso);
  seDefinido(campos, "epistemic_validation_status", data.estadoEpistemico);
  seDefinido(campos, "legal_review_status", data.revisaoJuridica);
  seDefinido(campos, "legal_review_notes_internal", data.notaRevisaoJuridica);
  seDefinido(campos, "reference_date", data.dataReferencia);
  seDefinido(campos, "reference_location", data.localReferencia);
  seDefinido(campos, "storage_reference_internal", data.referenciaArmazenamento);
  seDefinido(campos, "negative_search_source", data.buscaNegativaFonte);
  seDefinido(campos, "negative_search_date", data.buscaNegativaData);
  seDefinido(campos, "negative_search_next_action", data.buscaNegativaProximaAcao);
  seDefinido(campos, "research_item_id", data.itemPesquisaId);

  // D-06, critério D (aprovado em 01/10): busca negativa registra escopo, fonte,
  // período e responsável — e nunca conclui por si. Sem fonte e sem data, o
  // registro não é uma busca negativa, é uma afirmação sem lastro.
  if (data.natureza === "busca_negativa") {
    const faltando = [
      !data.buscaNegativaFonte?.trim() ? "onde se buscou" : null,
      !data.buscaNegativaData ? "a data da busca" : null,
    ].filter(Boolean);
    if (faltando.length)
      throw new Error(
        "Busca negativa exige " +
          faltando.join(" e ") +
          ". A ausência de resultado só vale como evidência quando o escopo da busca está registrado.",
      );
  }

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

  const id = data.id ?? (r as { id?: string }).id ?? null;
  await supabase.from("audit_logs").insert({
    organization_id: organizationId,
    entidade: "research_evidence_items",
    entidade_id: id,
    acao: data.id ? "evidencia_atualizada" : "evidencia_registrada",
    user_id: userId,
    metadados: {
      case_id: data.caseId,
      research_case_id: researchCaseId,
      ...(data.origem ? { origem: String(data.origem).trim() } : {}),
    },
  });
  await registrarTimelineCaso(supabase, {
    organizationId,
    caseId: data.caseId,
    eventType: "caso",
    title: data.id ? "Evidência atualizada" : "Evidência registrada",
    summaryInternal: String(campos.title),
    sourceEntityType: "research_evidence_items",
    sourceEntityId: id ?? data.caseId,
    userId,
  });
  return { ok: true as const, id, salvoEm: r.salvoEm };
}

export type EntradaSituacaoEvidencia = {
  caseId?: string | null;
  id: string;
  para: string;
  justificativa: string;
  origem: string;
};

/** Muda a situação pelo grafo. Exige autor, justificativa e origem. */
export async function mudarSituacaoEvidenciaCanonica(
  supabase: any,
  userId: string,
  organizationId: string,
  data: EntradaSituacaoEvidencia,
) {
  const { data: atual } = await supabase
    .from("research_evidence_items")
    .select("id,title,workflow_status,evidence_status,research_case_id")
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
      case_id: data.caseId ?? null,
      de,
      para: par.workflow_status,
      justificativa: data.justificativa.trim(),
      origem: data.origem.trim(),
    },
  });
  // A rota de origem pode não saber o `case_id` (o escritor antigo de
  // `/pesquisa-evidencias` só recebia o id da evidência). Sem caso não há
  // timeline de caso — e inventar um seria pior que não registrar.
  const caseId = data.caseId ?? (await casoDaPesquisa(supabase, organizationId, atual.research_case_id));
  if (caseId) {
    await registrarTimelineCaso(supabase, {
      organizationId,
      caseId,
      eventType: "caso",
      title: "Situação da evidência alterada",
      summaryInternal: `${atual.title}: ${de} → ${par.workflow_status}. ${data.justificativa.trim()}`,
      sourceEntityType: "research_evidence_items",
      sourceEntityId: data.id,
      userId,
    });
  }
  return { ok: true as const, situacao: par.workflow_status, salvoEm: r.salvoEm };
}

/** O caso de uma área de pesquisa, quando a rota só tem o id da evidência. */
export async function casoDaPesquisa(
  supabase: any,
  organizationId: string,
  researchCaseId?: string | null,
): Promise<string | null> {
  if (!researchCaseId) return null;
  const { data } = await supabase
    .from("research_cases")
    .select("case_id")
    .eq("id", researchCaseId)
    .eq("organization_id", organizationId)
    .maybeSingle();
  return (data?.case_id as string | undefined) ?? null;
}

/** Arquiva com motivo. Nunca apaga. */
export async function arquivarEvidenciaCanonicaCore(
  supabase: any,
  userId: string,
  organizationId: string,
  data: { caseId?: string | null; id: string; motivo: string },
) {
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
    metadados: { case_id: data.caseId ?? null, motivo: data.motivo.trim() },
  });
  return { ok: true as const, salvoEm: r.salvoEm };
}
