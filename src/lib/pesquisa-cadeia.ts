/**
 * CA-LOVABLE-PESQUISA-GENEALOGICA-v1.0 — regras puras da cadeia de pesquisa.
 *
 * Nada aqui inicia pesquisa externa, contato com cartório/arquivo, solicitação de
 * certidão, OCR, IA, extração automática, mensagem, contrato, cobrança ou
 * publicação. Toda projeção ao App Cliente depende de aprovação humana explícita.
 */

/** Ordem canônica da cadeia. Nenhum elo pode ser pulado. */
export const CADEIA_PESQUISA = [
  { etapa: "ficha", rotulo: "Ficha genealógica", produz: "pessoa, relação, evento, ramo, linhagem ou lacuna" },
  { etapa: "fonte", rotulo: "Fonte/documento", produz: "material bruto recebido ou referência externa" },
  { etapa: "evidencia", rotulo: "Evidência", produz: "interpretação revisável vinculada a fonte/pessoa/pesquisa" },
  { etapa: "validacao", rotulo: "Validação", produz: "confirma, diverge, é insuficiente ou gera pendência" },
  { etapa: "achado", rotulo: "Achado", produz: "conclusão operacional interna revisada" },
  { etapa: "relatorio", rotulo: "Relatório F1/F2 ou entrega", produz: "somente versão sanitizada aprovada" },
  { etapa: "app", rotulo: "App Cliente", produz: "somente projeção autorizada e publicada" },
] as const;

export type EtapaCadeia = (typeof CADEIA_PESQUISA)[number]["etapa"];

/** A. Situações controladas da pesquisa. */
export const STATUS_PESQUISA = [
  { id: "nao_iniciada", rotulo: "Não iniciada" },
  { id: "preparacao_pendente", rotulo: "Preparação pendente" },
  { id: "aguardando_autorizacao", rotulo: "Aguardando autorização" },
  { id: "em_andamento", rotulo: "Em andamento" },
  { id: "aguardando_cliente", rotulo: "Aguardando cliente" },
  { id: "aguardando_terceiro_ou_arquivo", rotulo: "Aguardando terceiro ou arquivo" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "pausada", rotulo: "Pausada" },
  { id: "concluida_parcialmente", rotulo: "Concluída parcialmente" },
  { id: "concluida", rotulo: "Concluída" },
  { id: "arquivada", rotulo: "Arquivada" },
] as const;

/** D. Situações controladas da evidência. */
export const STATUS_EVIDENCIA = [
  { id: "recebida", rotulo: "Recebida" },
  { id: "registrada", rotulo: "Registrada" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "validada_internamente", rotulo: "Validada internamente" },
  { id: "divergente", rotulo: "Divergente" },
  { id: "insuficiente", rotulo: "Insuficiente" },
  { id: "requer_complemento", rotulo: "Requer complemento" },
  { id: "requer_retificacao", rotulo: "Requer retificação" },
  { id: "requer_traducao_ou_apostila", rotulo: "Requer tradução ou apostila" },
  { id: "rejeitada_ou_inaplicavel", rotulo: "Rejeitada ou inaplicável" },
  { id: "aprovada_para_entrega_cliente", rotulo: "Aprovada para entrega ao cliente" },
  { id: "publicada_ao_cliente", rotulo: "Publicada ao cliente" },
] as const;

/** F. Situações controladas do relatório F1/F2. */
export const STATUS_RELATORIO = [
  { id: "rascunho_interno", rotulo: "Rascunho interno" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "aprovado_interno", rotulo: "Aprovado internamente" },
  { id: "publicado_cliente", rotulo: "Publicado ao cliente" },
  { id: "arquivado", rotulo: "Arquivado" },
] as const;

export const PROJECAO_ACHADO = [
  { id: "nao_projetado", rotulo: "Não projetado" },
  { id: "rascunho_sanitizado", rotulo: "Rascunho sanitizado" },
  { id: "aprovado_interno", rotulo: "Aprovado internamente" },
  { id: "publicado_cliente", rotulo: "Publicado ao cliente" },
] as const;

export type GatilhoInterno = {
  tipo: "tarefa" | "alerta" | "pendencia" | "proxima_acao" | "rascunho_microentrega";
  criticidade: "baixa" | "media" | "alta";
  titulo: string;
  detalhe: string;
  /** dias a partir de hoje para o prazo interno; null quando não há prazo. */
  prazoEmDias: number | null;
};

/**
 * Gatilhos internos por situação de evidência. Sempre internos:
 * nunca enviam mensagem, publicam no App, criam despesa ou disparam pesquisa externa.
 */
export function gatilhosDaEvidencia(status: string): GatilhoInterno[] {
  switch (status) {
    case "recebida":
      return [
        { tipo: "tarefa", criticidade: "media", titulo: "Triagem da evidência recebida", detalhe: "Conferir material bruto e classificar tipo, pessoa e fonte.", prazoEmDias: 2 },
      ];
    case "em_revisao":
      return [
        { tipo: "tarefa", criticidade: "media", titulo: "Revisão pelo responsável", detalhe: "Revisar conteúdo, vínculos e nota interna antes de qualquer validação.", prazoEmDias: 3 },
      ];
    case "divergente":
      return [
        { tipo: "alerta", criticidade: "alta", titulo: "Divergência de evidência", detalhe: "Conflito entre evidência e ficha genealógica. Bloqueia achado até conciliação interna.", prazoEmDias: 1 },
      ];
    case "insuficiente":
    case "requer_complemento":
      return [
        { tipo: "proxima_acao", criticidade: "media", titulo: "Complemento necessário", detalhe: "Definir próxima ação datada para complementar a evidência. Nenhuma solicitação externa é disparada aqui.", prazoEmDias: 5 },
      ];
    case "requer_retificacao":
      return [
        { tipo: "pendencia", criticidade: "alta", titulo: "Retificação pendente", detalhe: "Registrar pendência interna de retificação documental.", prazoEmDias: 7 },
      ];
    case "requer_traducao_ou_apostila":
      return [
        { tipo: "pendencia", criticidade: "media", titulo: "Tradução ou apostila pendente", detalhe: "Pendência interna registrada, sem criar despesa, cobrança ou pedido externo.", prazoEmDias: 10 },
      ];
    case "validada_internamente":
      return [
        { tipo: "rascunho_microentrega", criticidade: "baixa", titulo: "Rascunho de microentrega liberado", detalhe: "Permite preparar versão sanitizada. Não publica no App Cliente e não conclui nada juridicamente.", prazoEmDias: null },
      ];
    default:
      return [];
  }
}

/** Nova pessoa ou ramo atualiza apenas estrutura interna e abre revisão. */
export function gatilhoNovaPessoaOuRamo(nome: string): GatilhoInterno {
  return {
    tipo: "tarefa",
    criticidade: "media",
    titulo: `Revisar nova pessoa/ramo: ${nome}`,
    detalhe: "Estrutura interna atualizada. Confirmar vínculos com fonte e evidência antes de qualquer uso.",
    prazoEmDias: 5,
  };
}

/** Espera por terceiro/arquivo gera apenas rechecagem datada. */
export function gatilhoAguardandoTerceiro(): GatilhoInterno {
  return {
    tipo: "proxima_acao",
    criticidade: "media",
    titulo: "Rechecagem de espera externa",
    detalhe: "Rechecar internamente o andamento. Nenhum contato automático é feito.",
    prazoEmDias: 15,
  };
}

/** Validação interna nunca é conclusão jurídica ou reconhecimento de direito. */
export function validacaoConcluiDireito(): false {
  return false;
}

/** Upload de fonte/documento nunca cria pessoa, relação, evento ou linhagem. */
export function uploadCriaGenealogia(): false {
  return false;
}

/**
 * Relação/evento só pode ser gravado com origem de evidência OU marca explícita
 * de hipótese interna.
 */
export function podeGravarRelacaoOuEvento(entrada: {
  evidenceId?: string | null;
  hipoteseInterna?: boolean;
}): { ok: boolean; erro?: string } {
  if (entrada.evidenceId) return { ok: true };
  if (entrada.hipoteseInterna) return { ok: true };
  return { ok: false, erro: "Informe a evidência de origem ou marque explicitamente como hipótese interna." };
}

/** Somente relatório publicado e sanitizado chega ao App Cliente. */
export function relatorioVisivelAoCliente(r: {
  status: string;
  approved_summary_client?: string | null;
  approved_at?: string | null;
}): boolean {
  return (
    r.status === "publicado_cliente" &&
    Boolean(r.approved_summary_client && r.approved_summary_client.trim()) &&
    Boolean(r.approved_at)
  );
}

/** Achado só é projetável após validação e aprovação internas. */
export function achadoProjetavel(a: { validation_status: string; client_projection_status: string }): boolean {
  return a.validation_status === "validado" && a.client_projection_status === "publicado_cliente";
}

/** Campos que jamais podem sair para o App Cliente. */
export const CAMPOS_INTERNOS_BLOQUEADOS = [
  "internal_hypothesis",
  "internal_notes",
  "notes_internal",
  "observacao_interna",
  "validation_notes_internal",
  "evidence_summary_internal",
  "result_summary_internal",
  "storage_reference_internal",
  "source_url_internal",
  "internal_risk_summary",
  "internal_reference",
] as const;

/** Arquivamento lógico exige motivo; exclusão física é proibida. */
export function validarArquivamentoPesquisa(motivo: string): { ok: boolean; erro?: string } {
  if (!motivo || motivo.trim().length < 5) {
    return { ok: false, erro: "Informe o motivo do arquivamento (mínimo 5 caracteres)." };
  }
  return { ok: true };
}
