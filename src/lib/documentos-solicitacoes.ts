/**
 * G-04 — Área "Pesquisa Genealógica e Evidências": Documentos e Solicitações.
 *
 * Dicionários fechados e espelho das travas do banco (fonte de verdade).
 * Nada aqui inicia pesquisa externa, solicita certidão, contata instituição,
 * cria despesa, cobrança, pasta, mensagem ou documento externo.
 */

export type SecaoPesquisa =
  | "visao"
  | "pessoas"
  | "fontes"
  | "fontes_documentos"
  | "documentos"
  | "evidencias"
  | "hipoteses"
  | "relatorios"
  | "alertas";

export const SECOES: { id: SecaoPesquisa; rotulo: string; nota: string }[] = [
  { id: "visao", rotulo: "Visão de pesquisa", nota: "Panorama do caso: pedidos, evidências e pendências." },
  { id: "pessoas", rotulo: "Pessoas, famílias e ramos", nota: "Origem canônica de pessoas e linhagens." },
  { id: "fontes", rotulo: "Fontes e consultas", nota: "Acervos e consultas registradas internamente." },
  { id: "documentos", rotulo: "Documentos e Solicitações", nota: "Grade operacional de pedidos documentais." },
  { id: "evidencias", rotulo: "Evidências e validações", nota: "Biblioteca de evidências e histórico de validação." },
  { id: "hipoteses", rotulo: "Hipóteses e lacunas", nota: "Trabalho interno; nunca projetado ao cliente." },
  { id: "relatorios", rotulo: "Relatórios de fase", nota: "Consolidações internas por fase de pesquisa." },
  { id: "alertas", rotulo: "Alertas e histórico", nota: "Pendências com responsável, prazo e trilha de auditoria." },
];

export const STATUS_SOLICITACAO: { id: string; rotulo: string }[] = [
  { id: "nao_solicitado", rotulo: "Não solicitado" },
  { id: "a_preparar", rotulo: "A preparar" },
  { id: "solicitado", rotulo: "Solicitado" },
  { id: "aguardando_pagamento_cliente", rotulo: "Aguardando pagamento do cliente" },
  { id: "aguardando_cliente", rotulo: "Aguardando cliente" },
  { id: "aguardando_instituicao", rotulo: "Aguardando instituição" },
  { id: "recebido", rotulo: "Recebido" },
  { id: "em_revisao", rotulo: "Em revisão" },
  { id: "validado_internamente", rotulo: "Validado internamente" },
  { id: "divergente", rotulo: "Divergente" },
  { id: "insuficiente", rotulo: "Insuficiente" },
  { id: "requer_complemento", rotulo: "Requer complemento" },
  { id: "requer_retificacao", rotulo: "Requer retificação" },
  { id: "requer_traducao_apostila", rotulo: "Requer tradução/apostila" },
  { id: "nao_localizado", rotulo: "Não localizado" },
  { id: "cancelado", rotulo: "Cancelado" },
  { id: "nao_aplicavel", rotulo: "Não aplicável" },
];

export const TIPOS_SOLICITACAO: { id: string; rotulo: string }[] = [
  { id: "certidao", rotulo: "Certidão" },
  { id: "busca_arquivo", rotulo: "Busca em arquivo" },
  { id: "copia_processo", rotulo: "Cópia de processo" },
  { id: "traducao", rotulo: "Tradução" },
  { id: "apostilamento", rotulo: "Apostilamento" },
  { id: "retificacao", rotulo: "Retificação" },
  { id: "documento_familia", rotulo: "Documento da família" },
  { id: "outro", rotulo: "Outro" },
];

export const PRIORIDADES: { id: string; rotulo: string }[] = [
  { id: "baixa", rotulo: "Baixa" },
  { id: "media", rotulo: "Média" },
  { id: "alta", rotulo: "Alta" },
  { id: "critica", rotulo: "Crítica" },
];

export const APROVACAO_CLIENTE: { id: string; rotulo: string }[] = [
  { id: "nao_aplicavel", rotulo: "Não aplicável" },
  { id: "aguardando_aprovacao", rotulo: "Aguardando aprovação" },
  { id: "aprovado", rotulo: "Aprovado" },
  { id: "recusado", rotulo: "Recusado" },
];

export const NIVEIS_ACESSO_PEDIDO: { id: string; rotulo: string }[] = [
  { id: "restrito", rotulo: "Restrito" },
  { id: "equipe_do_caso", rotulo: "Equipe do caso" },
  { id: "cliente_autorizado", rotulo: "Cliente autorizado" },
];

/** Situações a partir das quais a data do pedido é obrigatória. */
export const STATUS_POS_PEDIDO = [
  "solicitado",
  "aguardando_cliente",
  "aguardando_instituicao",
  "recebido",
  "em_revisao",
  "validado_internamente",
  "divergente",
  "insuficiente",
  "requer_complemento",
  "requer_retificacao",
  "requer_traducao_apostila",
  "nao_localizado",
];

/** Situações que exigem próxima ação, prazo, responsável e alerta interno. */
export const STATUS_EXIGE_ACAO = [
  "aguardando_cliente",
  "aguardando_instituicao",
  "divergente",
  "nao_localizado",
  "requer_retificacao",
];

export const rotulo = (lista: { id: string; rotulo: string }[], id: unknown) =>
  lista.find((x) => x.id === String(id))?.rotulo ?? String(id ?? "—");

export type Solicitacao = Record<string, unknown>;

/** Validação de gravação — espelha as exceções do banco. */
export function validarSolicitacao(v: Solicitacao): { ok: boolean; erros: string[] } {
  const erros: string[] = [];
  const status = String(v["status"] ?? "nao_solicitado");
  const texto = (k: string) => String(v[k] ?? "").trim();

  if (!STATUS_SOLICITACAO.some((s) => s.id === status)) erros.push(`Situação fora do dicionário: ${status}`);
  if (v["request_type"] && !TIPOS_SOLICITACAO.some((s) => s.id === v["request_type"]))
    erros.push("Tipo de solicitação fora do dicionário.");
  if (v["priority"] && !PRIORIDADES.some((s) => s.id === v["priority"])) erros.push("Prioridade fora do dicionário.");
  if (v["access_level"] && !NIVEIS_ACESSO_PEDIDO.some((s) => s.id === v["access_level"]))
    erros.push("Nível de acesso fora do dicionário.");
  if (v["client_approval_status"] && !APROVACAO_CLIENTE.some((s) => s.id === v["client_approval_status"]))
    erros.push("Situação de aprovação do cliente fora do dicionário.");

  if (!texto("document_type")) erros.push("Informe o tipo de documento.");
  if (!v["research_person_id"] && !texto("full_name_text"))
    erros.push("Vincule uma pessoa cadastrada ou informe o nome completo.");
  if (v["research_person_id"] && texto("full_name_text"))
    erros.push("Com pessoa cadastrada vinculada, o nome completo não é texto livre.");

  if (STATUS_POS_PEDIDO.includes(status) && !texto("requested_at"))
    erros.push("Data do pedido é obrigatória a partir de Solicitado.");
  if (status === "recebido" && !texto("received_at")) erros.push("Data de recebimento é obrigatória em Recebido.");

  if (STATUS_EXIGE_ACAO.includes(status)) {
    if (!texto("next_action")) erros.push("Informe a próxima ação.");
    if (!texto("next_action_due")) erros.push("Informe o prazo da próxima ação.");
    if (!texto("responsible_user_id")) erros.push("Informe o responsável.");
  }

  const custo = v["estimated_external_cost"];
  if (custo !== null && custo !== undefined && custo !== "" && Number(custo) < 0)
    erros.push("Previsão de custo externo não pode ser negativa.");

  return { ok: erros.length === 0, erros };
}

/** Custo externo é sempre previsão: nunca caixa, receita, reembolso ou cobrança. */
export function efeitoFinanceiro(v: Solicitacao): {
  criaDespesa: boolean;
  criaCobranca: boolean;
  natureza: "previsao_interna";
  nota: string;
} {
  return {
    criaDespesa: false,
    criaCobranca: false,
    natureza: "previsao_interna",
    nota:
      Number(v["estimated_external_cost"] ?? 0) > 0
        ? "Previsão de custo externo de terceiro. Não gera despesa, receita, reembolso nem cobrança do Clube."
        : "Sem previsão de custo externo registrada.",
  };
}

/** Efeitos internos de um estado — alerta, rascunho e evidência. Nenhum envio. */
export function efeitosDoStatus(v: Solicitacao): {
  criaAlerta: boolean;
  criaRascunhoComunicacao: boolean;
  enviaMensagem: false;
  vinculaEvidencia: boolean;
  workflowEvidencia?: string;
  exigeAcaoAlternativa: boolean;
} {
  const status = String(v["status"] ?? "");
  return {
    criaAlerta: STATUS_EXIGE_ACAO.includes(status),
    criaRascunhoComunicacao: status === "aguardando_cliente",
    enviaMensagem: false,
    vinculaEvidencia: status === "recebido",
    ...(status === "recebido" ? { workflowEvidencia: "recebida" } : {}),
    exigeAcaoAlternativa: status === "nao_localizado",
  };
}

/** Nunca expor ao App: link interno, documento bruto, observação interna. */
export function projecaoClienteDaSolicitacao(v: Solicitacao) {
  return {
    tipo_documento: String(v["document_type"] ?? ""),
    situacao: rotulo(STATUS_SOLICITACAO, v["status"]),
    atualizado_em: String(v["updated_at"] ?? ""),
  };
}

export const CAMPOS_NUNCA_NO_APP = [
  "internal_link",
  "observation_internal",
  "source_id",
  "evidence_id",
  "estimated_external_cost",
  "responsible_user_id",
];
