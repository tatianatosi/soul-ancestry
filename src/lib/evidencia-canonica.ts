/**
 * Corte 1 (01/10/2026) — FONTE E EVIDÊNCIA ÚNICAS.
 *
 * Antes deste corte a evidência tinha **cinco** escritores em duas tabelas:
 *   - `evidences`: `salvarEvidencia`, `mudarEstadoEvidencia`,
 *     `criarEvidenciaRascunhoDeFonte` — e só o segundo aplicava o grafo de
 *     transição; nenhum dos três gravava com releitura;
 *   - `research_evidence_items`: `salvarBlocoPesquisa`, `registrarEvidenciaGoLive`.
 *
 * Decisão da Proprietária (01/10), tomada depois de ver os números do banco:
 * **um módulo canônico; as rotas só chamam.** A tabela canônica é
 * `research_evidence_items` — é a única com evidência real (5 linhas, 2 casos),
 * `evidences` está vazia (0 linhas), e `fontes-pesquisa-canonicas.ts` já a
 * declarava canônica. Eleger a tabela com dado custa zero migração.
 *
 * ## O conflito de vocabulário, resolvido por de-para (nunca por CHECK novo)
 *
 * `research_evidence_items.evidence_status` é NOT NULL e aceita 6 valores em
 * inglês. O grafo de transição vive em `pesquisa-cadeia.ts` com os **11** valores
 * em português do CHECK `evidences_workflow_ck`. Mapear 11 → 6 perderia estado:
 * "requer tradução" e "requer retificação" viram ambos `under_review`, e a
 * equipe deixaria de saber o que a evidência está esperando.
 *
 * Por isso `research_evidence_items` recebeu a coluna aditiva `workflow_status`
 * com **exatamente o mesmo CHECK de 11 valores que já existia** em `evidences`
 * — nenhum vocabulário novo foi inventado, o aprovado foi carregado. Os dois
 * campos andam juntos: `workflow_status` é a verdade fina, `evidence_status`
 * é a projeção grossa que satisfaz o CHECK antigo e os leitores existentes.
 */
import {
  STATUS_EVIDENCIA_CHECK,
  statusEvidenciaCanonico,
  validarTransicaoEvidencia,
  type StatusEvidenciaCheck,
} from "@/lib/pesquisa-cadeia";

/** Os 6 valores que `research_evidence_items_evidence_status_check` aceita. */
export const EVIDENCE_STATUS_EN = [
  "collected",
  "under_review",
  "validated",
  "inconclusive",
  "discarded",
  "archived",
] as const;

export type EvidenceStatusEn = (typeof EVIDENCE_STATUS_EN)[number];

/**
 * De-para do estado fino (PT, 11) para o grosso (EN, 6).
 *
 * Só desce a granularidade; nunca inventa estado. `archived` não aparece aqui
 * de propósito: arquivamento é `archived_at`, não uma situação de workflow.
 */
export const DE_PARA_WORKFLOW_PARA_STATUS: Record<StatusEvidenciaCheck, EvidenceStatusEn> = {
  recebida: "collected",
  registrada: "collected",
  em_revisao: "under_review",
  requer_complemento: "under_review",
  requer_retificacao: "under_review",
  requer_traducao_apostila: "under_review",
  divergente: "inconclusive",
  insuficiente: "inconclusive",
  rejeitada_inaplicavel: "discarded",
  aprovada_para_entrega: "validated",
  publicada: "validated",
};

/** O par (fino, grosso) que todo escritor grava junto. Recusa valor inventado. */
export function parDeEstado(
  bruto: unknown,
): { workflow_status: StatusEvidenciaCheck; evidence_status: EvidenceStatusEn } | null {
  const fino = statusEvidenciaCanonico(bruto);
  if (!fino) return null;
  return { workflow_status: fino, evidence_status: DE_PARA_WORKFLOW_PARA_STATUS[fino] };
}

/**
 * O estado fino de uma linha, tolerando a fase de convivência.
 *
 * Linha gravada antes deste corte só tem `evidence_status`. Subir de volta de
 * EN para PT é ambíguo por construção (6 → 11), então aqui a resposta honesta
 * é o estado inicial do grafo quando não há `workflow_status`: a equipe
 * reclassifica explicitamente, o sistema não adivinha o que ela quis dizer.
 */
export function estadoFinoDaLinha(linha: {
  workflow_status?: unknown;
  evidence_status?: unknown;
}): StatusEvidenciaCheck {
  return statusEvidenciaCanonico(linha.workflow_status) ?? "recebida";
}

export const TIPOS_EVIDENCIA = [
  "document",
  "record_excerpt",
  "photo",
  "oral_history",
  "registry_entry",
  "archive_reference",
  "timeline_item",
  "correspondence",
  "structured_note",
  "other",
] as const;

export type TipoEvidencia = (typeof TIPOS_EVIDENCIA)[number];

const t = (v: unknown) => (v == null ? "" : String(v).trim());

/**
 * De-para de tipo de evidência — **o único do sistema**.
 *
 * `research_evidence_items.evidence_type` tem CHECK com os 10 valores de
 * `TIPOS_EVIDENCIA`. Mas quem chama o escritor fala três vocabulários
 * diferentes, todos legítimos e já em uso:
 *
 *  - os 28 `TIPOS_DOCUMENTO` (`fontes-documentos.ts`), quando a evidência nasce
 *    de um documento do acervo;
 *  - os apelidos em português que o Go Live usava (`documento`, `registro`,
 *    `foto`, `trecho`, `referencia_arquivo`, `outro`);
 *  - os próprios 10 valores canônicos, quando a tela já oferece o select certo.
 *
 * Antes deste corte cada chamador tinha o seu mapa (ou mapa nenhum, e gravava
 * texto livre que o CHECK recusaria). Aqui é um só. Nada é inventado: cada
 * destino é um dos 10 valores já aprovados, e a escolha segue o que o documento
 * **é** — certidão e registro são lançamento em registro (`registry_entry`),
 * identidade e documento notarial/judicial são documento (`document`), relato
 * de família é história oral (`oral_history`), árvore recebida é nota
 * estruturada (`structured_note`).
 */
export const DE_PARA_TIPO_EVIDENCIA: Record<string, TipoEvidencia> = {
  // Lançamentos em registro civil, religioso ou consular.
  certidao_nascimento: "registry_entry",
  certidao_casamento: "registry_entry",
  certidao_obito: "registry_entry",
  registro_civil: "registry_entry",
  inteiro_teor: "registry_entry",
  certidao_estrangeira: "registry_entry",
  registro_religioso_batismo: "registry_entry",
  registro_imigracao: "registry_entry",
  lista_passageiros: "registry_entry",
  registro_consular: "registry_entry",
  naturalizacao: "registry_entry",
  certidao_negativa_positiva: "registry_entry",
  documento_cidadania: "registry_entry",
  // Documentos que não são lançamento em registro.
  passaporte: "document",
  documento_identidade: "document",
  comprovante_residencia: "document",
  documento_militar: "document",
  documento_notarial: "document",
  inventario_testamento: "document",
  documento_judicial: "document",
  documento_comercial_contratual: "document",
  proposta_canva: "document",
  // Os demais, por natureza do material.
  registro_arquivo_historico: "archive_reference",
  fotografia_imagem_historica: "photo",
  correspondencia: "correspondence",
  arvore_recebida_familia: "structured_note",
  relato_familiar: "oral_history",
  outro_documento: "other",
  // Apelidos em português herdados do Go Live.
  documento: "document",
  registro: "registry_entry",
  foto: "photo",
  trecho: "record_excerpt",
  referencia_arquivo: "archive_reference",
  outro: "other",
};

/**
 * Traduz qualquer vocabulário de entrada para um dos 10 tipos canônicos.
 *
 * Devolve `null` quando não reconhece — o chamador decide se recusa ou cai em
 * `"document"`. Nunca adivinha um tipo específico a partir de texto livre.
 */
export function tipoEvidenciaCanonico(bruto: unknown): TipoEvidencia | null {
  const v = t(bruto);
  if (!v) return null;
  if ((TIPOS_EVIDENCIA as readonly string[]).includes(v)) return v as TipoEvidencia;
  return DE_PARA_TIPO_EVIDENCIA[v] ?? null;
}



export type EntradaEvidencia = {
  titulo: string;
  tipo: string;
  situacao?: string | null;
  fonteId?: string | null;
  descricao?: string | null;
};

/** Erros legíveis; lista vazia significa "pode gravar". */
export function validarEvidencia(entrada: EntradaEvidencia): string[] {
  const erros: string[] = [];
  if (t(entrada.titulo).length < 3) erros.push("Dê um título à evidência (mínimo 3 letras).");
  if (!(TIPOS_EVIDENCIA as readonly string[]).includes(t(entrada.tipo)))
    erros.push("Escolha o tipo da evidência.");
  if (entrada.situacao != null && t(entrada.situacao) && !parDeEstado(entrada.situacao))
    erros.push("Situação de evidência desconhecida.");
  return erros;
}

/**
 * A transição é permitida?
 *
 * Reaproveita integralmente `validarTransicaoEvidencia` (grafo, autor,
 * justificativa e origem). Nenhuma regra nova: o que mudou é que agora **todo**
 * escritor passa por aqui, e não só um dos cinco.
 */
export function validarMudancaDeEstado(entrada: {
  de: unknown;
  para: unknown;
  autor?: string | null;
  justificativa?: string | null;
  origem?: string | null;
}): { ok: boolean; erro?: string } {
  const de = statusEvidenciaCanonico(entrada.de) ?? "recebida";
  const para = statusEvidenciaCanonico(entrada.para);
  if (!para) return { ok: false, erro: "Situação de evidência desconhecida." };
  return validarTransicaoEvidencia({
    de,
    para,
    autor: entrada.autor,
    justificativa: entrada.justificativa,
    origem: entrada.origem,
  });
}

/**
 * Mensagem única dos escritores aposentados neste corte.
 *
 * Mesmo padrão já usado para a tabela legada `evidencias`
 * (`fontes-pesquisa-canonicas.ts#mensagemLegadoSemCriacao`): a porta fecha
 * dizendo para onde ir, em vez de gravar em paralelo.
 */
export const EVIDENCIA_ESCRITOR_APOSENTADO =
  "Esta tela não grava mais evidência. O registro é único, em Pesquisa do caso " +
  "(src/lib/evidencia-canonica.functions.ts): lá a situação respeita o grafo de " +
  "transição, exige justificativa e grava com releitura.";

/** O estado em que toda evidência nasce. */
export const ESTADO_INICIAL: StatusEvidenciaCheck = "recebida";

export { STATUS_EVIDENCIA_CHECK };
