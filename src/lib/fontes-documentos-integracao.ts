/**
 * G-08B — Integração entre Fontes/Documentos e o restante da Pesquisa Transversal.
 *
 * Regra central: um documento nunca gera nada sozinho. Todo vínculo é ato
 * humano explícito, com autor, data e motivo. Vincular não muda o estado
 * epistêmico do caso: a evidência criada a partir de um documento nasce em
 * rascunho, com confiança mínima, e só avança pelos fluxos já existentes.
 */

export type TipoAlvo = "evidencia" | "solicitacao" | "pessoa" | "relatorio";

export const TIPOS_VINCULO: { id: string; rotulo: string; alvo: TipoAlvo }[] = [
  { id: "comprova", rotulo: "Comprova a evidência", alvo: "evidencia" },
  { id: "complementa", rotulo: "Complementa a evidência", alvo: "evidencia" },
  { id: "atende_solicitacao", rotulo: "Atende a solicitação", alvo: "solicitacao" },
  { id: "refere_pessoa", rotulo: "Refere-se à pessoa", alvo: "pessoa" },
  { id: "citado_em_relatorio", rotulo: "Citado no relatório", alvo: "relatorio" },
];

export const COLUNA_ALVO: Record<TipoAlvo, string> = {
  // Corte 0 (01/10/2026): o vínculo de evidência passou a apontar para a tabela
  // canônica (`research_evidence_items`). A coluna antiga `evidence_id` tem FK
  // para `evidences`, que deixou de ser canônica — gravar ali o id canônico era
  // recusado pelo banco. `evidence_id` segue lida, nunca escrita.
  evidencia: "research_evidence_item_id",
  solicitacao: "document_request_id",
  pessoa: "research_person_id",
  relatorio: "case_report_id",
};

/** Campos que jamais podem viajar no payload de um vínculo. */
export const CAMPOS_PROIBIDOS_NO_VINCULO = [
  "cpf",
  "documento_pessoal",
  "preco",
  "valor",
  "honorario",
  "condicao_comercial",
  "sku",
  "chance",
  "probabilidade",
  "merito",
];

/** Entidades que este módulo nunca cria em cadeia. */
export const EFEITOS_EM_CADEIA_PROIBIDOS = [
  "genealogical_person_profiles",
  "genealogical_relationships",
  "genealogical_events",
  "lineage_paths",
  "genealogical_findings",
  "case_reports",
  "app_projections",
  "client_deliverables",
  "communication_queue",
  "contracts",
  "invoices",
];

export type EntradaVinculo = {
  tipoVinculo: string;
  tipoAlvo: TipoAlvo;
  alvoId: string;
  documentoCaseId: string;
  documentoOrganizationId: string;
  alvoCaseId: string | null;
  alvoOrganizationId: string | null;
  observacaoInterna?: string | null;
  papel: string;
};

export type Resultado = { ok: true } | { ok: false; erros: string[] };

export const PAPEIS_VINCULA = ["admin", "operacoes", "pesquisador"];

export function validarVinculo(e: EntradaVinculo): Resultado {
  const erros: string[] = [];
  const tipo = TIPOS_VINCULO.find((t) => t.id === e.tipoVinculo);
  if (!tipo) erros.push("TIPO_VINCULO_INVALIDO");
  else if (tipo.alvo !== e.tipoAlvo) erros.push("TIPO_VINCULO_NAO_CORRESPONDE_AO_ALVO");
  if (!e.alvoId?.trim()) erros.push("ALVO_UNICO_OBRIGATORIO");
  if (!PAPEIS_VINCULA.includes(e.papel)) erros.push("PAPEL_SEM_ESCRITA");
  if (e.alvoOrganizationId && e.alvoOrganizationId !== e.documentoOrganizationId) {
    erros.push("ALVO_DE_OUTRA_ORGANIZACAO");
  }
  // Pessoa da pesquisa é da organização, não do caso; os demais alvos são do caso.
  if (e.tipoAlvo !== "pessoa" && e.alvoCaseId !== null && e.alvoCaseId !== e.documentoCaseId) {
    erros.push("ALVO_DE_OUTRO_CASO");
  }
  if (typeof e.observacaoInterna === "string" && e.observacaoInterna.length > 2000) {
    erros.push("OBSERVACAO_MUITO_LONGA");
  }
  return erros.length ? { ok: false, erros } : { ok: true };
}

/** Só um alvo pode estar preenchido na linha persistida. */
export function alvoUnico(linha: Record<string, unknown>): boolean {
  // A coluna legada entra na contagem para que uma linha histórica com
  // `evidence_id` continue sendo reconhecida como alvo único.
  const colunas = [...Object.values(COLUNA_ALVO), "evidence_id"];
  const preenchidos = colunas.filter((c) => linha[c] !== null && linha[c] !== undefined);
  return preenchidos.length === 1;
}

export function payloadLimpo(entrada: Record<string, unknown>): Resultado {
  const sujos = Object.keys(entrada).filter((k) =>
    CAMPOS_PROIBIDOS_NO_VINCULO.some((p) => k.toLowerCase().includes(p)),
  );
  return sujos.length ? { ok: false, erros: [`CAMPO_PROIBIDO: ${sujos.join(", ")}`] } : { ok: true };
}

export type DocumentoFonte = {
  id: string;
  case_id: string;
  organization_id: string;
  titulo_interno?: string | null;
  nome_arquivo: string;
  tipo_documento: string;
  data_documento?: string | null;
  cidade?: string | null;
  estado_provincia?: string | null;
  pais?: string | null;
  pessoa_ref_id?: string | null;
  confidencialidade?: string | null;
};

/**
 * Rascunho de evidência a partir do documento. Sem inferência: só copia o que
 * já está catalogado. Nasce sempre no estado mais baixo possível.
 */
export function rascunhoEvidenciaDeDocumento(doc: DocumentoFonte) {
  const local = [doc.cidade, doc.estado_provincia, doc.pais].filter(Boolean).join(", ") || null;
  return {
    organization_id: doc.organization_id,
    case_id: doc.case_id,
    title_internal: (doc.titulo_interno?.trim() || doc.nome_arquivo).slice(0, 200),
    evidence_type: doc.tipo_documento,
    evidence_nature: "documental",
    confidence_level: "indicio",
    epistemic_validation_status: "nao_validado",
    legal_review_status: "nao_revisado",
    workflow_status: "rascunho",
    access_level: doc.confidencialidade === "restrito" ? "restrito" : "equipe_do_caso",
    data_origin: "documento_interno",
    reference_date: doc.data_documento ?? null,
    reference_location: local,
    research_person_id: doc.pessoa_ref_id ?? null,
  };
}

export function validarDesvinculo(_motivo: string, papel: string): Resultado {
  const erros: string[] = [];
  if (!PAPEIS_VINCULA.includes(papel)) erros.push("PAPEL_SEM_ESCRITA");
  return erros.length ? { ok: false, erros } : { ok: true };
}

/** Não existe exclusão física de vínculo. */
export function podeExcluirVinculoFisicamente(): boolean {
  return false;
}

/** Vínculo é registro interno: nunca vai para o App Cliente. */
export function vinculoVisivelNoAppCliente(): boolean {
  return false;
}
