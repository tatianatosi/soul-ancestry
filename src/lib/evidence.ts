import type {
  CaseData,
  EvidenceStatus,
  StatusCaso,
  StatusContrato,
  StatusProcuracao,
} from "@/types/case";

/**
 * Textos institucionais de fallback — nunca usar "erro", "sem dados",
 * "indefinido" ou "não encontrado" na interface da cliente.
 */
export const FALLBACK = {
  atualizacao: "Em atualização documental",
  aguardando: "Aguardando confirmação",
  referencia: "Referência localizada",
  validacao: "Em validação documental",
  proximaEtapa: "Próxima etapa liberada após a confirmação dos registros",
  semArquivo: "Documento ainda não vinculado",
  semDescoberta: "A próxima descoberta será adicionada após a validação da pesquisa",
  naoIniciada: "Ação ainda não iniciada",
} as const;

/** Rótulos internos dos estados de procuração. */
export const PROCURACAO_LABEL: Record<StatusProcuracao, string> = {
  nao_iniciada: "Não iniciada",
  rascunho_em_preparacao: "Rascunho em preparação",
  aguardando_revisao_interna: "Aguardando revisão interna",
  aguardando_assinatura_cliente: "Aguardando assinatura da cliente",
  assinada: "Assinada",
  enviada: "Enviada",
  respondida: "Respondida",
};

export const CONTRATO_LABEL: Record<StatusContrato, string> = {
  aguardando_confirmacao: "Aguardando confirmação",
  confirmado: "Confirmado",
  nao_aplicavel: "Não aplicável",
};

/** Frase única exibida à cliente sobre consultas externas/procurações. */
export const PROCURACAO_TEXTO_CLIENTE =
  "Estamos organizando a documentação necessária para as próximas consultas.";

/** Bloco cliente-facing para referências genealógicas (sem link ou ID). */
export const REFERENCIA_CLIENTE = {
  titulo: "Referência genealógica localizada",
  texto:
    "Encontramos uma referência que ajuda a conectar este ramo da família. Agora seguimos para a validação por documentos oficiais.",
  etiqueta: "Em validação documental",
} as const;

/** Rótulo humano de cada status de evidência (linguagem para a cliente). */
export const EVIDENCE_LABEL: Record<EvidenceStatus, string> = {
  confirmado_documentalmente: "Confirmado por documento",
  referencia_localizada: "Referência localizada",
  relato_familiar: "Informação compartilhada pela família",
  pendente_validacao: "Em validação documental",
};

/** Tom visual por status de evidência (tokens da marca). */
export const EVIDENCE_TOM: Record<EvidenceStatus, string> = {
  confirmado_documentalmente: "border-sage/40 bg-sage/10 text-sage",
  referencia_localizada: "border-gold/50 bg-gold/15 text-navy",
  relato_familiar: "border-plum/30 bg-plum/10 text-plum",
  pendente_validacao: "border-terracotta/40 bg-terracotta/10 text-terracotta",
};

export const STATUS_CASO_LABEL: Record<StatusCaso, string> = {
  novo: "Cadastro iniciado",
  em_leitura: "Leitura da linha familiar",
  em_documentos: "Etapa documental",
  em_upgrade: "Próxima etapa apresentada",
};

/** Texto seguro: devolve o valor limpo ou o fallback institucional. */
export function texto(
  valor: string | null | undefined,
  fallback: string = FALLBACK.atualizacao,
): string {
  const v = (valor ?? "").trim();
  return v.length > 0 ? v : fallback;
}

/** Verdadeiro quando o campo tem conteúdo exibível. */
export function preenchido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (typeof valor === "number") return Number.isFinite(valor);
  if (Array.isArray(valor)) return valor.length > 0;
  return true;
}

/** Lista sem itens vazios. */
export function lista(itens: (string | null | undefined)[] | undefined): string[] {
  return (itens ?? []).map((i) => (i ?? "").trim()).filter((i) => i.length > 0);
}

/**
 * Referência de pesquisa exibida à cliente.
 * Com `dados_sensiveis_ocultos = true` nunca expõe URL ou ID.
 */
export function referenciaVisivel(
  pessoa: { familysearch_id?: string; familysearch_url?: string; status_evidencia: EvidenceStatus },
  ocultarSensiveis: boolean,
): string | null {
  const temRef = preenchido(pessoa.familysearch_id) || preenchido(pessoa.familysearch_url);
  if (!temRef) return null;
  if (ocultarSensiveis) return REFERENCIA_CLIENTE.titulo;
  return `FamilySearch | ID ${pessoa.familysearch_id || "—"} | referência localizada`;
}

/** Aderência de rota — leitura interna de pesquisa, nunca confirmação jurídica. */
export function rotaLabel(caso: CaseData): string {
  if (caso.rota.status_hipotese === "confirmado_documentalmente")
    return texto(caso.rota.pais_principal, FALLBACK.validacao);
  if (caso.rota.via_provavel === "judicial") return "via judicial (em confirmação documental)";
  return "Rota em validação documental";
}

/** Países com dados reais — usado para não renderizar cards vazios. */
export function paisesComAderencia(caso: CaseData): { pais: string; aderencia: number | null }[] {
  return [
    { pais: caso.rota.pais_principal, aderencia: caso.rota.aderencia_principal },
    { pais: caso.rota.pais_secundario, aderencia: caso.rota.aderencia_secundaria },
    { pais: caso.rota.pais_terciario, aderencia: caso.rota.aderencia_terciaria },
  ].filter((p) => preenchido(p.pais));
}

/* ---------------- Kit contratual: rótulos e visibilidade ---------------- */

import type {
  CaseContratacao,
  PoliticaDespesas,
  StatusContratoBase,
  StatusDespesas,
  StatusOrdemServico,
} from "@/types/case";

export const CONTRATO_BASE_LABEL: Record<StatusContratoBase, string> = {
  nao_enviado: "Ainda não enviado",
  aguardando_aceite: "Aguardando seu aceite",
  aceito: "Aceito",
  arquivado: "Arquivado",
};

export const ORDEM_SERVICO_LABEL: Record<StatusOrdemServico, string> = {
  nao_criada: "Ainda não criada",
  rascunho: "Em preparação",
  aguardando_aceite: "Aguardando seu aceite",
  aceita: "Aceita",
  arquivada: "Arquivada",
};

/** Linguagem simples de despesas para a cliente. */
export const DESPESAS_LABEL_CLIENTE: Record<StatusDespesas, string> = {
  nao_aplicavel: "Não se aplica neste momento",
  estimativa: "Em estimativa",
  incluida_no_orcamento: "Previstas no orçamento",
  antecipada_pelo_clube: "Antecipadas pelo Clube",
  aguardando_comprovante: "Comprovante em organização",
  ajuste_pendente: "Aguardando sua aprovação",
  aprovada_pela_cliente: "Aprovadas por você",
  reembolsada: "Comprovante disponível",
};

/** Rótulo interno, mais detalhado. */
export const DESPESAS_LABEL_INTERNO: Record<StatusDespesas, string> = {
  nao_aplicavel: "Não aplicável",
  estimativa: "Estimativa",
  incluida_no_orcamento: "Incluída no orçamento",
  antecipada_pelo_clube: "Antecipada pelo Clube",
  aguardando_comprovante: "Aguardando comprovante",
  ajuste_pendente: "Ajuste pendente",
  aprovada_pela_cliente: "Aprovada pela cliente",
  reembolsada: "Reembolsada",
};

export const POLITICA_DESPESAS_LABEL: Record<PoliticaDespesas, string> = {
  nao_definida: "Não definida",
  incluida_no_orcamento: "Incluída no orçamento consolidado",
  antecipacao_parcial_pelo_clube: "Antecipação parcial pelo Clube",
  antecipacao_total_pelo_clube: "Antecipação total pelo Clube",
  pagamento_direto_pela_cliente: "Pagamento direto pela cliente",
};

/** Texto institucional padrão sobre despesas externas (cliente). */
export const DESPESAS_TEXTO_CLIENTE =
  "Algumas despesas externas, como certidões, traduções, apostilas e taxas administrativas, podem integrar o orçamento consolidado. Caso seja necessário um ajuste fora do previsto, você receberá uma solicitação de aprovação antes da contratação.";

/** Fallbacks da área Minha Conta. */
export const CONTA_FALLBACK = {
  contrato: "Seu contrato está em fase de formalização.",
  produto: "O produto será confirmado após o aceite da Ordem de Serviço.",
  pagamento: "Os dados de pagamento serão disponibilizados após a formalização da contratação.",
  despesas: "As despesas externas ainda estão sendo estimadas.",
} as const;

/** Link só aparece com documento realmente disponível e URL segura. */
export function documentoVisivel(d?: { documento_disponivel?: boolean; secure_url?: string }) {
  return Boolean(d?.documento_disponivel && preenchido(d?.secure_url));
}

/** Produto só é "contratado" com Ordem de Serviço aceita. */
export function produtoContratado(c?: CaseContratacao) {
  return c?.ordem_servico.status === "aceita";
}

/** Próxima etapa da cliente derivada dos estados contratuais. */
export function proximaEtapaCliente(caso: CaseData): string {
  const c = caso.contratacao;
  if (!c) return FALLBACK.proximaEtapa;
  if (c.contrato_base.status === "aguardando_aceite") return "Formalizar a contratação.";
  if (c.contrato_base.status === "aceito" && caso.geral.status_caso !== "em_documentos")
    return "Enviar os documentos iniciais.";
  if (caso.geral.status_caso === "em_documentos")
    return "Aguardar a organização e a leitura documental.";
  if (c.ordem_servico.status === "aguardando_aceite")
    return "Revisar e aceitar a Ordem de Serviço.";
  return "Estamos preparando a formalização da sua contratação.";
}
