/**
 * Ancestral Blueprint — parâmetros estruturados do serviço do caso.
 *
 * O Blueprint não cria preço, SKU nem condição comercial: ele referencia o
 * product_catalog homologado (ou a exceção comercial aprovada) e organiza
 * escopo, fases, entregas e critérios de aceite uma única vez, para serem
 * reutilizados por proposta Canva, contrato e onboarding.
 */

import { bloqueiosDoItem, type BloqueioCatalogo, type ItemCatalogo } from "@/lib/catalogo-desk";

export const STATUS_PREPARACAO_BLUEPRINT = [
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "em_preparacao", rotulo: "Em preparação" },
  { valor: "pronto_para_proposta", rotulo: "Pronto para proposta" },
  { valor: "bloqueado", rotulo: "Bloqueado" },
  { valor: "arquivado", rotulo: "Arquivado" },
] as const;

export const ORIGENS_PRECO_BLUEPRINT = [
  { valor: "product_catalog", rotulo: "Catálogo homologado" },
  { valor: "excecao_comercial_aprovada", rotulo: "Exceção comercial aprovada" },
] as const;

export const STATUS_DESPESAS_TERCEIROS = [
  { valor: "nao_aplicavel", rotulo: "Não aplicável" },
  { valor: "estimada", rotulo: "Estimada" },
  { valor: "aprovada", rotulo: "Aprovada pelo cliente" },
  { valor: "provisionada", rotulo: "Provisionada" },
  { valor: "paga_direto", rotulo: "Paga diretamente pelo cliente" },
] as const;

export const CAMPOS_BLUEPRINT = [
  "case_service_id",
  "product_catalog_id",
  "citizenship_track_id",
  "family_id",
  "proposta_version",
  "escopo_aprovado",
  "fases_jornada",
  "entregas_previstas",
  "criterios_aceite",
  "preco_comercial_vigente",
  "condicao_comercial_padrao",
  "parcelas",
  "data_vigencia",
  "origem_preco",
  "excecao_comercial_id",
  "despesas_terceiros_status",
  "despesas_terceiros_faixa",
  "regra_despesas",
  "link_proposta_interno",
  "conteudo_aprovado_para_proposta",
  "status_preparacao",
] as const;

export type Blueprint = {
  case_service_id?: string | null;
  product_catalog_id?: string | null;
  citizenship_track_id?: string | null;
  family_id?: string | null;
  proposta_version?: string | null;
  escopo_aprovado?: string | null;
  fases_jornada?: string[];
  entregas_previstas?: string[];
  criterios_aceite?: string[];
  preco_comercial_vigente?: number | null;
  condicao_comercial_padrao?: string | null;
  parcelas?: number | null;
  data_vigencia?: string | null;
  origem_preco?: "product_catalog" | "excecao_comercial_aprovada";
  excecao_comercial_id?: string | null;
  despesas_terceiros_status?: string | null;
  despesas_terceiros_faixa?: string | null;
  regra_despesas?: string | null;
  link_proposta_interno?: string | null;
  conteudo_aprovado_para_proposta?: boolean;
  status_preparacao?: string;
};

export type ProdutoBlueprint = ItemCatalogo & { preco_comercial_vigente?: number | null };

export type ExcecaoBlueprint = { id: string; aprovada: boolean; valor: number | null };

/**
 * Travas do Blueprint. Nunca aceita preço digitado: o valor precisa ser igual
 * ao preço vigente do catálogo homologado ou ao valor da exceção aprovada.
 */
export function validarBlueprint(
  bp: Blueprint,
  ctx: { produto?: ProdutoBlueprint | null; excecao?: ExcecaoBlueprint | null } = {},
): BloqueioCatalogo[] {
  const out: BloqueioCatalogo[] = [];
  const produto = ctx.produto ?? null;

  if (!produto) {
    out.push({ codigo: "BLUEPRINT_SEM_PRODUTO", descricao: "Blueprint exige produto do catálogo vinculado." });
  } else {
    out.push(
      ...bloqueiosDoItem(produto, {
        caseServiceId: bp.case_service_id,
        justificativaEscopo: bp.escopo_aprovado,
      }),
    );
  }

  const origem = bp.origem_preco ?? "product_catalog";
  if (origem === "excecao_comercial_aprovada") {
    const exc = ctx.excecao ?? null;
    if (!exc || !exc.aprovada) {
      out.push({ codigo: "EXCECAO_NAO_APROVADA", descricao: "Origem de preço por exceção exige exceção comercial aprovada." });
    } else if (bp.preco_comercial_vigente != null && exc.valor !== bp.preco_comercial_vigente) {
      out.push({ codigo: "PRECO_MANUAL_BLOQUEADO", descricao: "Preço divergente da exceção comercial aprovada." });
    }
  } else if (bp.preco_comercial_vigente != null) {
    if (!produto || produto.status_homologacao !== "homologado") {
      out.push({ codigo: "PRECO_SEM_CATALOGO_HOMOLOGADO", descricao: "Preço no Blueprint exige catálogo homologado." });
    } else if (produto.preco_comercial_vigente == null || produto.preco_comercial_vigente !== bp.preco_comercial_vigente) {
      out.push({ codigo: "PRECO_MANUAL_BLOQUEADO", descricao: "Preço manual bloqueado: use o preço comercial vigente do catálogo." });
    }
  }

  if (bp.conteudo_aprovado_para_proposta && !bp.escopo_aprovado?.trim()) {
    out.push({ codigo: "SEM_ESCOPO_APROVADO", descricao: "Conteúdo aprovado para proposta exige escopo aprovado registrado." });
  }
  return out;
}

/**
 * Preço do serviço para proposta/contrato. Despesa de terceiro nunca soma:
 * é sempre informada em separado, conforme regra institucional.
 */
export function precoDoServico(bp: Blueprint, despesasTerceiros: number[] = []): { preco: number | null; despesas: number } {
  return {
    preco: bp.preco_comercial_vigente ?? null,
    despesas: despesasTerceiros.reduce((a, b) => a + b, 0),
  };
}

/** Campos estruturados enviados à proposta Canva (que segue sendo artefato visual). */
export function pacoteParaProposta(bp: Blueprint) {
  return {
    escopo_aprovado: bp.escopo_aprovado ?? null,
    fases_jornada: bp.fases_jornada ?? [],
    entregas_previstas: bp.entregas_previstas ?? [],
    criterios_aceite: bp.criterios_aceite ?? [],
    preco_comercial_vigente: bp.preco_comercial_vigente ?? null,
    condicao_comercial_padrao: bp.condicao_comercial_padrao ?? null,
    parcelas: bp.parcelas ?? null,
    despesas_terceiros_status: bp.despesas_terceiros_status ?? "nao_aplicavel",
    regra_despesas: bp.regra_despesas ?? null,
  };
}
