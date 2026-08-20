/**
 * Catálogo do Desk — produtos-pai, complementos e contextuais.
 *
 * Regras institucionais:
 * - Não existe preço livre: preço só vem de product_catalog homologado ou de
 *   exceção comercial aprovada.
 * - Produto em revisão não entra em proposta.
 * - Produto contextual/complementar exige case_service e justificativa de escopo.
 * - Pacote WhatsApp representa oferta/escopo aprovado; nunca ativa mensagem
 *   automática nem automação de canal.
 * - Familiar Conectado não substitui núcleo familiar, dossiê-mãe nem
 *   acompanhamento familiar de processo.
 */

export type TipoOferta = "produto_pai" | "complemento" | "contextual";

export type ItemCatalogo = {
  code: string;
  nome_comercial: string;
  tipo_oferta: TipoOferta;
  jornada_fase: string;
  status_homologacao: "homologado" | "em_revisao" | "descontinuado";
  elegivel_para_proposta: boolean;
  exige_case_service: boolean;
  exige_justificativa_escopo: boolean;
  gera_comunicacao_automatica: boolean;
  regra_uso: string;
};

export const COMPLEMENTOS_TOP30: ItemCatalogo[] = [
  {
    code: "CA-WPP-001",
    nome_comercial: "Pacote WhatsApp Essencial",
    tipo_oferta: "complemento",
    jornada_fase: "acompanhamento",
    status_homologacao: "homologado",
    elegivel_para_proposta: true,
    exige_case_service: true,
    exige_justificativa_escopo: true,
    gera_comunicacao_automatica: false,
    regra_uso: "Representa oferta e escopo aprovado. Não ativa mensagem automática nem automação de canal.",
  },
  {
    code: "CA-WPP-002",
    nome_comercial: "Pacote WhatsApp Premium",
    tipo_oferta: "complemento",
    jornada_fase: "acompanhamento",
    status_homologacao: "homologado",
    elegivel_para_proposta: true,
    exige_case_service: true,
    exige_justificativa_escopo: true,
    gera_comunicacao_automatica: false,
    regra_uso: "Representa oferta e escopo aprovado. Não ativa mensagem automática nem automação de canal.",
  },
  {
    code: "CA-FAM-001",
    nome_comercial: "Familiar Conectado",
    tipo_oferta: "contextual",
    jornada_fase: "acompanhamento",
    status_homologacao: "homologado",
    elegivel_para_proposta: true,
    exige_case_service: true,
    exige_justificativa_escopo: true,
    gera_comunicacao_automatica: false,
    regra_uso: "Não substitui núcleo familiar, dossiê-mãe nem acompanhamento familiar de processo.",
  },
  {
    code: "CA-FAM-002",
    nome_comercial: "Familiar Conectado Plus",
    tipo_oferta: "contextual",
    jornada_fase: "acompanhamento",
    status_homologacao: "homologado",
    elegivel_para_proposta: true,
    exige_case_service: true,
    exige_justificativa_escopo: true,
    gera_comunicacao_automatica: false,
    regra_uso: "Não substitui núcleo familiar, dossiê-mãe nem acompanhamento familiar de processo.",
  },
  {
    code: "CA-CID-025",
    nome_comercial: "Acompanhamento Familiar — Processo Compartilhado",
    tipo_oferta: "complemento",
    jornada_fase: "execucao",
    status_homologacao: "homologado",
    elegivel_para_proposta: true,
    exige_case_service: true,
    exige_justificativa_escopo: true,
    gera_comunicacao_automatica: false,
    regra_uso: "Exige núcleo familiar validado e serviço do caso. Não cria dossiê automaticamente.",
  },
  ...(
    [
      ["CA-ASS-001", "Continuidade — Assinatura Base"],
      ["CA-ASS-002", "Continuidade — Assinatura Documental"],
      ["CA-ASS-003", "Continuidade — Assinatura Familiar"],
      ["CA-ASS-004", "Continuidade — Assinatura Patrimônio Ancestral"],
      ["CA-ASS-005", "Continuidade — Assinatura Concierge"],
    ] as const
  ).map(
    ([code, nome]): ItemCatalogo => ({
      code,
      nome_comercial: nome,
      tipo_oferta: "contextual",
      jornada_fase: "pos_reconhecimento",
      status_homologacao: "em_revisao",
      elegivel_para_proposta: false,
      exige_case_service: true,
      exige_justificativa_escopo: true,
      gera_comunicacao_automatica: false,
      regra_uso: "Produto em revisão: não entra em proposta enquanto não homologado.",
    }),
  ),
];

export type BloqueioCatalogo = { codigo: string; descricao: string };

/** Confere se um item do catálogo pode entrar em proposta/Blueprint. */
export function bloqueiosDoItem(
  item: Pick<ItemCatalogo, "code" | "status_homologacao" | "elegivel_para_proposta" | "exige_case_service" | "exige_justificativa_escopo">,
  contexto: { caseServiceId?: string | null; justificativaEscopo?: string | null },
): BloqueioCatalogo[] {
  const out: BloqueioCatalogo[] = [];
  if (item.status_homologacao !== "homologado" || !item.elegivel_para_proposta) {
    out.push({ codigo: "PRODUTO_EM_REVISAO", descricao: `${item.code} não está homologado/elegível para proposta.` });
  }
  if (item.exige_case_service && !contexto.caseServiceId) {
    out.push({ codigo: "SEM_CASE_SERVICE", descricao: `${item.code} é contextual/complementar e exige case service vinculado.` });
  }
  if (item.exige_justificativa_escopo && !contexto.justificativaEscopo?.trim()) {
    out.push({ codigo: "SEM_JUSTIFICATIVA_ESCOPO", descricao: `${item.code} exige justificativa de escopo aprovado.` });
  }
  return out;
}

/** Pacotes WhatsApp e Familiar Conectado nunca disparam comunicação por si. */
export function acionaComunicacaoAutomatica(_code: string): false {
  return false;
}

/** Familiar Conectado não cria núcleo, dossiê-mãe nem acompanhamento de processo. */
export function efeitosEstruturaisAutomaticos(_code: string): { criaNucleo: false; criaDossie: false; criaAcompanhamentoProcesso: false } {
  return { criaNucleo: false, criaDossie: false, criaAcompanhamentoProcesso: false };
}
