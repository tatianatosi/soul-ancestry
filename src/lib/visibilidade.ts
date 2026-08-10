import type {
  CaseData,
  EstadoDocumento,
  StatusEtapa,
  VisibilidadeEtapa,
} from "@/types/case";
import { preenchido } from "./evidence";

/**
 * MATRIZ DE VISIBILIDADE — cliente x equipe.
 *
 * Camada única de decisão sobre o que a cliente pode ver. Nenhum link real,
 * documento assinado ou dado financeiro não confirmado é exposto aqui.
 */

/** Campos que NUNCA são exibidos à cliente. */
export const CAMPOS_INTERNOS = [
  "familysearch_url",
  "familysearch_id",
  "secure_url",
  "observacoes_internas",
  "fornecedor",
  "margem",
  "reembolso",
  "valor_real",
  "versao",
  "teto_valor",
  "regra_input_output",
  "responsavel_caso",
] as const;

/** Campos liberados para a cliente. */
export const CAMPOS_CLIENTE = [
  "case_id",
  "status_caso",
  "produto_nome",
  "produto_sku",
  "escopo_resumo",
  "entregaveis",
  "etapa_inicial",
  "etapa_atual",
  "documentos",
  "descricao_cliente",
  "historico",
  "proxima_etapa",
] as const;

/** Um campo pode ser mostrado à cliente? Lista negativa vence a positiva. */
export function campoVisivelParaCliente(campo: string): boolean {
  const c = campo.trim().toLowerCase();
  if (CAMPOS_INTERNOS.some((k) => c === k || c.endsWith(`.${k}`) || c.includes(k))) return false;
  return true;
}

/** Etapa de timeline visível para a cliente. */
export function etapaVisivelParaCliente(v: VisibilidadeEtapa): boolean {
  return v === "cliente" || v === "ambas";
}

/* ---------------- Estados de documento ---------------- */

export const DOCUMENTO_ESTADO_LABEL: Record<EstadoDocumento, string> = {
  nao_criado: "Ainda não criado",
  rascunho: "Em preparação",
  aguardando_revisao: "Aguardando revisão",
  aguardando_aceite: "Aguardando formalização",
  aceito: "Formalizado",
  arquivado: "Arquivado",
  indisponivel: "Não aplicável",
};

export const DOCUMENTO_ESTADO_FALLBACK: Record<EstadoDocumento, string> = {
  nao_criado: "Este documento será preparado quando a etapa correspondente for liberada.",
  rascunho: "Documento em preparação interna.",
  aguardando_revisao: "Documento aguardando revisão interna.",
  aguardando_aceite: "Documento aguardando formalização.",
  aceito:
    "Documento formalizado. A versão disponível será exibida quando houver acesso seguro.",
  arquivado: "Documento arquivado no histórico do caso.",
  indisponivel: "Documento não aplicável a esta etapa.",
};

export function mensagemDocumento(estado: EstadoDocumento): string {
  return DOCUMENTO_ESTADO_FALLBACK[estado];
}

/**
 * Documento só chega à cliente quando existe, está formalizado e há URL segura.
 * Rascunhos, revisões e anexos não assinados permanecem internos.
 */
export function documentoVisivelParaCliente(item?: {
  estado?: EstadoDocumento;
  documento_disponivel?: boolean;
  secure_url?: string;
}): boolean {
  if (!item) return false;
  if (item.estado && item.estado !== "aceito" && item.estado !== "arquivado") return false;
  return Boolean(item.documento_disponivel) && preenchido(item.secure_url);
}

/* ---------------- Status amigável ---------------- */

const STATUS_AMIGAVEL: Record<string, string> = {
  // timeline
  concluido: "Concluído",
  em_andamento: "Em andamento",
  aguardando: "Aguardando definição",
  bloqueado: "Aguardando etapa anterior",
  nao_iniciado: "Ainda não iniciado",
  // contrato-base
  nao_enviado: "Contrato em formalização",
  aguardando_aceite: "Aguardando seu aceite",
  aceito: "Contrato aceito",
  arquivado: "Arquivado",
  // ordem de serviço
  nao_criada: "Em preparação",
  rascunho: "Em preparação",
  aceita: "Aceita",
  arquivada: "Arquivada",
  // procurações
  nao_iniciada: "Em organização documental",
  rascunho_em_preparacao: "Em organização documental",
  aguardando_revisao_interna: "Em organização documental",
  aguardando_assinatura_cliente: "Aguardando sua assinatura",
  assinada: "Assinada",
  enviada: "Enviada",
  respondida: "Respondida",
};

/** Tradução acolhedora de qualquer status técnico para a cliente. */
export function statusClienteAmigavel(status?: string | null): string {
  const s = (status ?? "").trim();
  if (!s) return "Em atualização";
  return STATUS_AMIGAVEL[s] ?? "Em atualização";
}

/** Tom visual por status de etapa (tokens da marca). */
export const STATUS_ETAPA_TOM: Record<StatusEtapa, string> = {
  concluido: "border-sage/40 bg-sage/10 text-sage",
  em_andamento: "border-gold/50 bg-gold/15 text-navy",
  aguardando: "border-terracotta/40 bg-terracotta/10 text-terracotta",
  bloqueado: "border-plum/30 bg-plum/10 text-plum",
  nao_iniciado: "border-border bg-cream text-navy/60",
};

export const STATUS_ETAPA_LABEL: Record<StatusEtapa, string> = {
  concluido: "Concluído",
  em_andamento: "Em andamento",
  aguardando: "Aguardando",
  bloqueado: "Bloqueado",
  nao_iniciado: "Não iniciado",
};

/** Etapas visíveis à cliente, já filtradas. */
export function timelineCliente(caso: CaseData) {
  return (caso.contratacao?.timeline ?? []).filter((e) => etapaVisivelParaCliente(e.visibilidade));
}

/** Timeline completa (Desk). */
export function timelineInterna(caso: CaseData) {
  return caso.contratacao?.timeline ?? [];
}

export { proximaEtapaCliente } from "./evidence";
