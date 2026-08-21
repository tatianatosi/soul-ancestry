/**
 * Camada de referência do catálogo (Planilha Mestre de Produtos).
 *
 * Regras institucionais:
 * - O CRM/Painel de Calls NÃO é fonte de verdade de SKU, preço, condição,
 *   escopo ou link de cobrança. A fonte canônica é o catálogo de produtos.
 * - Preço, condição, escopo e link são SOMENTE LEITURA no Desk.
 * - O Desk guarda apenas referência: SKU, versão de vigência e data da última
 *   validação. Nunca preço livre.
 * - Asaas é fonte apenas de status de cobrança/pagamento. Nunca de escopo ou
 *   preço. Nada é criado ou alterado no Asaas por esta camada.
 */

export type StatusProduto = "ativo" | "inativo" | "arquivado" | "historico" | "descontinuado";
export type StatusHomologacao = "homologado" | "em_revisao" | "bloqueado" | "arquivado";
export type StatusLinkAsaas = "pendente" | "validado" | "desatualizado" | "nao_aplicavel";

export type ItemCatalogoRef = {
  sku: string;
  nome_produto: string;
  status_produto: StatusProduto;
  status_homologacao: StatusHomologacao;
  preco_comercial_vigente: number | null;
  condicao_comercial_vigente: string | null;
  versao_vigencia: string | null;
  data_ultima_validacao: string | null;
  responsavel_homologacao: string | null;
  link_asaas_validado: string | null;
  status_link_asaas: StatusLinkAsaas;
  escopo_aprovado: string | null;
  observacao_de_governanca: string | null;
  elegivel_para_proposta: boolean;
};

export const ROTULO_HOMOLOGACAO: Record<StatusHomologacao, string> = {
  homologado: "Homologado",
  em_revisao: "Em revisão",
  bloqueado: "Bloqueado",
  arquivado: "Arquivado",
};

export const ROTULO_STATUS_PRODUTO: Record<StatusProduto, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  arquivado: "Arquivado",
  historico: "Histórico",
  descontinuado: "Descontinuado",
};

export const ROTULO_LINK: Record<StatusLinkAsaas, string> = {
  pendente: "Link pendente",
  validado: "Link validado",
  desatualizado: "Link desatualizado",
  nao_aplicavel: "Sem link aplicável",
};

/** Só aparece no seletor de oferta nova quando o produto está ativo. */
export function visivelEmSeletorDeOferta(i: ItemCatalogoRef): boolean {
  return i.status_produto === "ativo";
}

/** Só pode gerar proposta/contrato/cobrança/link quando homologado e com link válido. */
export function podeGerarProposta(i: ItemCatalogoRef): boolean {
  return (
    i.status_produto === "ativo" &&
    i.status_homologacao === "homologado" &&
    (i.status_link_asaas === "validado" || i.status_link_asaas === "nao_aplicavel") &&
    i.preco_comercial_vigente !== null &&
    !!i.escopo_aprovado
  );
}

/** Motivos de bloqueio, em linguagem operacional interna. */
export function motivosBloqueio(i: ItemCatalogoRef): string[] {
  const m: string[] = [];
  if (i.status_produto !== "ativo") m.push(`Status do produto: ${ROTULO_STATUS_PRODUTO[i.status_produto]}`);
  if (i.status_homologacao !== "homologado") m.push(`Homologação: ${ROTULO_HOMOLOGACAO[i.status_homologacao]}`);
  if (i.status_link_asaas === "pendente") m.push("Link Asaas pendente de validação");
  if (i.status_link_asaas === "desatualizado") m.push("Link Asaas desatualizado");
  if (i.preco_comercial_vigente === null) m.push("Preço comercial vigente ausente na fonte canônica");
  if (!i.escopo_aprovado) m.push("Escopo aprovado ausente na fonte canônica");
  if (!i.data_ultima_validacao) m.push("Sem data de última validação");
  return m;
}

/** Critérios exigidos para liberar um SKU para uso comercial. */
export const CRITERIOS_LIBERACAO: string[] = [
  "Status do produto = Ativo na Planilha Mestre.",
  "Status de homologação = Homologado, com responsável identificado.",
  "Preço comercial vigente e condição comercial vigente registrados na fonte canônica.",
  "Escopo aprovado descrito e reconciliado com a proposta.",
  "Link Asaas validado (ou explicitamente não aplicável) e status de link conferido.",
  "Versão de vigência e data da última validação preenchidas.",
  "Sem divergência entre preço atual, preço sugerido, condição, escopo e link.",
];

/** Referência que o Desk pode armazenar de um SKU (nunca preço livre). */
export function referenciaDeSku(i: ItemCatalogoRef) {
  return {
    sku: i.sku,
    versao_vigencia: i.versao_vigencia,
    data_ultima_validacao: i.data_ultima_validacao,
  };
}
